import { NextRequest, NextResponse } from 'next/server';
import { getStripe, isStripeConfigured } from '@/lib/stripe/config';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';
import { getOrderById } from '@/lib/supabase/orders';
import {
  sendOrderConfirmationEmail,
  sendOrderNotificationEmail,
} from '@/lib/email/resend';

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
    if (!stripe) {
      return NextResponse.json(
        { error: 'Failed to initialize Stripe' },
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

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.warn('STRIPE_WEBHOOK_SECRET is not set. Webhook signature verification will be skipped in development.');
    }

    let event: Stripe.Event;

    try {
      // Verificar la firma del webhook
      if (webhookSecret) {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      } else {
        // En desarrollo, parsear sin verificar (NO usar en producción)
        event = JSON.parse(body) as Stripe.Event;
        console.warn('Webhook signature verification skipped. This should only happen in development.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Webhook signature verification failed:', errorMessage);
      return NextResponse.json(
        { error: `Webhook Error: ${errorMessage}` },
        { status: 400 }
      );
    }

    // Manejar diferentes tipos de eventos
    const supabase = await createClient();

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const orderId = paymentIntent.metadata.orderId;

        if (orderId) {
          // Actualizar el estado del pedido a "Pagado" o "Procesando"
          const { error: updateError } = await supabase
            .from('orders')
            .update({
              payment_status: 'paid',
              status: 'processing',
              stripe_payment_intent_id: paymentIntent.id,
            })
            .eq('id', orderId);

          if (updateError) {
            console.error('Error updating order:', updateError);
          } else {
            console.log(`✅ Order ${orderId} updated to paid/processing status`);

            // Obtener el locale del metadata o usar 'es' por defecto
            const locale = (paymentIntent.metadata.locale as 'es' | 'en') || 'es';

            // Obtener la orden completa para enviar correos
            try {
              const order = await getOrderById(orderId);
              
              if (order && order.items && order.items.length > 0) {
                // Enviar correo de confirmación al cliente
                const customerEmailResult = await sendOrderConfirmationEmail(
                  order,
                  locale
                );

                if (customerEmailResult.success) {
                  console.log(`✅ Order confirmation email sent to ${order.customer_email}`);
                } else {
                  console.error('Error sending customer confirmation email:', customerEmailResult.error);
                }

                // Enviar correo de notificación al admin
                const adminEmailResult = await sendOrderNotificationEmail(
                  order,
                  locale
                );

                if (adminEmailResult.success) {
                  console.log('✅ Order notification email sent to admin');
                } else {
                  console.error('Error sending admin notification email:', adminEmailResult.error);
                }
              } else {
                console.warn(`Order ${orderId} not found or has no items, skipping email sending`);
              }
            } catch (emailError) {
              console.error('Error sending order emails:', emailError);
              // No fallar el webhook si los correos fallan, pero loguear el error
            }
          }
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const orderId = paymentIntent.metadata.orderId;

        if (orderId) {
          // Actualizar el estado del pedido a "Pago fallido"
          const { error } = await supabase
            .from('orders')
            .update({
              payment_status: 'failed',
              status: 'pending',
              stripe_payment_intent_id: paymentIntent.id,
            })
            .eq('id', orderId);

          if (error) {
            console.error('Error updating order:', error);
          }
        }
        break;
      }

      case 'payment_intent.canceled': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const orderId = paymentIntent.metadata.orderId;

        if (orderId) {
          // Actualizar el estado del pedido a "Cancelado"
          const { error } = await supabase
            .from('orders')
            .update({
              payment_status: 'cancelled',
              status: 'cancelled',
              stripe_payment_intent_id: paymentIntent.id,
            })
            .eq('id', orderId);

          if (error) {
            console.error('Error updating order:', error);
          }
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

