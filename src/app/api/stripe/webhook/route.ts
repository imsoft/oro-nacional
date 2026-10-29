import { NextRequest, NextResponse } from 'next/server';
import { getStripe, isStripeConfigured } from '@/lib/stripe/config';
import { createAdminClient } from '@/lib/supabase/admin';
import { finalizePaidOrder } from '@/lib/orders/server';
import {
  cancelExpiredLinkOrder,
  syncCustomerFromPaymentIntent,
  syncCustomerFromSession,
} from '@/lib/payment-links/server';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  try {
    // Verificar si Stripe está configurado
    if (!isStripeConfigured()) {
      return NextResponse.json(
        { error: 'Stripe is not configured' },
        { status: 500 }
      );
    }

    const stripe = getStripe();
    const admin = createAdminClient();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    // Sin el secreto no se puede verificar que el evento venga de Stripe,
    // y sin service role no se puede actualizar el pedido: responder 500
    // para que Stripe reintente cuando esté configurado.
    if (!stripe || !admin || !webhookSecret) {
      console.error(
        '[Stripe webhook] Missing STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET or SUPABASE_SERVICE_ROLE_KEY'
      );
      return NextResponse.json(
        { error: 'Webhook is not configured' },
        { status: 500 }
      );
    }

    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Webhook signature verification failed:', errorMessage);
      return NextResponse.json(
        { error: `Webhook Error: ${errorMessage}` },
        { status: 400 }
      );
    }

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        // Pedidos de enlace de pago: completar los datos del cliente que
        // Stripe recogió en el Checkout antes de mandar los correos.
        await syncCustomerFromPaymentIntent(stripe, admin, paymentIntent);
        const result = await finalizePaidOrder(admin, paymentIntent);

        if (!result.ok) {
          console.error(
            `[Stripe webhook] Could not finalize payment ${paymentIntent.id}: ${result.reason}`
          );
          // Un error de base de datos puede ser temporal: pedir reintento.
          // Los demás casos (pedido inexistente, monto distinto) no se
          // arreglan reintentando.
          if (result.reason === 'db_error') {
            return NextResponse.json(
              { error: 'Could not update order' },
              { status: 500 }
            );
          }
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const orderId = paymentIntent.metadata.orderId;

        if (orderId) {
          // Solo marcar como fallido si el pedido sigue sin pagarse
          const { error } = await admin
            .from('orders')
            .update({
              payment_status: 'Fallido',
              stripe_payment_intent_id: paymentIntent.id,
            })
            .eq('id', orderId)
            .eq('payment_status', 'Pendiente');

          if (error) {
            console.error('Error updating order:', error);
            return NextResponse.json(
              { error: 'Could not update order' },
              { status: 500 }
            );
          }
        }
        break;
      }

      case 'payment_intent.canceled': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const orderId = paymentIntent.metadata.orderId;

        if (orderId) {
          const { error } = await admin
            .from('orders')
            .update({
              status: 'Cancelado',
              stripe_payment_intent_id: paymentIntent.id,
            })
            .eq('id', orderId)
            .neq('payment_status', 'Pagado');

          if (error) {
            console.error('Error updating order:', error);
            return NextResponse.json(
              { error: 'Could not update order' },
              { status: 500 }
            );
          }
        }
        break;
      }

      // Enlaces de pago (Stripe Checkout). Stripe también manda
      // payment_intent.succeeded, pero finalizePaidOrder es idempotente.
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded': {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.orderId;
        if (!orderId) break;

        // Datos reales del cliente antes de que se envíen los correos
        await syncCustomerFromSession(admin, orderId, session);

        if (session.payment_status !== 'paid') {
          // Pago diferido (p. ej. OXXO): llegará async_payment_succeeded
          break;
        }

        const paymentIntentId =
          typeof session.payment_intent === 'string'
            ? session.payment_intent
            : session.payment_intent?.id;
        if (!paymentIntentId) break;

        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        // El PaymentIntent lleva el orderId en metadata (payment_intent_data);
        // por si acaso, garantizarlo a partir de la sesión.
        if (!paymentIntent.metadata?.orderId) {
          paymentIntent.metadata = { ...paymentIntent.metadata, orderId, locale: 'es' };
        }

        const result = await finalizePaidOrder(admin, paymentIntent);
        if (!result.ok) {
          console.error(
            `[Stripe webhook] Could not finalize checkout session ${session.id}: ${result.reason}`
          );
          if (result.reason === 'db_error') {
            return NextResponse.json(
              { error: 'Could not update order' },
              { status: 500 }
            );
          }
        }
        break;
      }

      case 'checkout.session.async_payment_failed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.orderId;
        if (orderId) {
          const { error } = await admin
            .from('orders')
            .update({ payment_status: 'Fallido' })
            .eq('id', orderId)
            .eq('payment_status', 'Pendiente');
          if (error) {
            console.error('Error updating order:', error);
            return NextResponse.json(
              { error: 'Could not update order' },
              { status: 500 }
            );
          }
        }
        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        const { error } = await cancelExpiredLinkOrder(admin, session);
        if (error) {
          console.error('Error cancelling expired payment link order:', error);
          return NextResponse.json(
            { error: 'Could not update order' },
            { status: 500 }
          );
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to process webhook';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
