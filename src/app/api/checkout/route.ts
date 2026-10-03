import { NextRequest, NextResponse } from 'next/server';
import { getStripe, isStripeConfigured } from '@/lib/stripe/config';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  CheckoutError,
  createCheckoutOrder,
  type CheckoutCurrency,
  type CheckoutItemInput,
} from '@/lib/orders/server';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const text = (value: unknown, maxLength: number): string =>
  typeof value === 'string' ? value.trim().slice(0, maxLength) : '';

/**
 * Crea el pedido y su PaymentIntent.
 * El navegador solo manda qué productos quiere (id, talla, cantidad) y los
 * datos de envío; los precios, el total y la moneda se resuelven aquí.
 */
export async function POST(request: NextRequest) {
  try {
    if (!isStripeConfigured()) {
      console.error('[Checkout] Stripe is not configured');
      return NextResponse.json(
        { error: 'El pago con tarjeta no está disponible en este momento.' },
        { status: 503 }
      );
    }

    const stripe = getStripe();
    const admin = createAdminClient();
    if (!stripe || !admin) {
      console.error('[Checkout] Missing STRIPE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY');
      return NextResponse.json(
        { error: 'El pago con tarjeta no está disponible en este momento.' },
        { status: 503 }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Solicitud no válida' }, { status: 400 });
    }

    const customer = {
      customer_name: text(body.customer_name, 200),
      customer_email: text(body.customer_email, 200).toLowerCase(),
      customer_phone: text(body.customer_phone, 40),
      shipping_address: text(body.shipping_address, 400),
      shipping_city: text(body.shipping_city, 120),
      shipping_state: text(body.shipping_state, 120),
      shipping_zip_code: text(body.shipping_zip_code, 20),
      shipping_country: text(body.shipping_country, 80) || 'México',
      customer_notes: text(body.customer_notes, 1000) || undefined,
    };

    if (
      !customer.customer_name ||
      !EMAIL_REGEX.test(customer.customer_email) ||
      !customer.customer_phone ||
      !customer.shipping_address ||
      !customer.shipping_city ||
      !customer.shipping_state ||
      !customer.shipping_zip_code
    ) {
      return NextResponse.json(
        { error: 'Por favor completa todos los campos de envío' },
        { status: 400 }
      );
    }

    const currency: CheckoutCurrency = body.currency === 'USD' ? 'USD' : 'MXN';
    const locale: 'es' | 'en' = body.locale === 'en' ? 'en' : 'es';
    const items: CheckoutItemInput[] = Array.isArray(body.items)
      ? body.items.map((item: Record<string, unknown>) => ({
          product_id: typeof item?.product_id === 'string' ? item.product_id : '',
          size: typeof item?.size === 'string' && item.size ? item.size : null,
          quantity: Number(item?.quantity),
        }))
      : [];

    // Usuario con sesión (opcional): el pedido queda ligado a su cuenta
    let userId: string | null = null;
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const { data } = await admin.auth.getUser(authHeader.slice(7));
      userId = data.user?.id ?? null;
    }

    // Si el cliente regresó a editar sus datos, cancelar el pedido pendiente anterior
    const previous = body.previous;
    if (
      previous &&
      typeof previous.orderId === 'string' &&
      typeof previous.paymentIntentId === 'string'
    ) {
      const { data: previousOrder } = await admin
        .from('orders')
        .select('id, payment_status, stripe_payment_intent_id')
        .eq('id', previous.orderId)
        .maybeSingle();

      if (
        previousOrder &&
        previousOrder.payment_status === 'Pendiente' &&
        previousOrder.stripe_payment_intent_id === previous.paymentIntentId
      ) {
        try {
          await stripe.paymentIntents.cancel(previous.paymentIntentId);
        } catch (cancelError) {
          console.warn('[Checkout] Could not cancel previous payment intent:', cancelError);
        }
        await admin
          .from('orders')
          .update({ status: 'Cancelado', deleted_at: new Date().toISOString() })
          .eq('id', previousOrder.id)
          .eq('payment_status', 'Pendiente');
      }
    }

    const { order, totalCharged } = await createCheckoutOrder(admin, {
      customer,
      items,
      currency,
      locale,
      userId,
    });

    let paymentIntent;
    try {
      paymentIntent = await stripe.paymentIntents.create(
        {
          amount: Math.round(totalCharged * 100), // centavos
          currency: currency.toLowerCase(),
          automatic_payment_methods: { enabled: true },
          receipt_email: customer.customer_email,
          metadata: {
            orderId: order.id,
            orderNumber: order.order_number,
            locale,
          },
        },
        { idempotencyKey: `order-${order.id}` }
      );
    } catch (stripeError) {
      console.error('[Checkout] Error creating payment intent:', stripeError);
      await admin.from('orders').delete().eq('id', order.id);
      return NextResponse.json(
        { error: 'No se pudo iniciar el pago. Por favor intenta de nuevo.' },
        { status: 502 }
      );
    }

    await admin
      .from('orders')
      .update({ stripe_payment_intent_id: paymentIntent.id })
      .eq('id', order.id);

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.order_number,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      total: totalCharged,
      currency,
    });
  } catch (error) {
    if (error instanceof CheckoutError) {
      const status = error.code === 'server_error' ? 500 : 400;
      return NextResponse.json({ error: error.message, code: error.code }, { status });
    }

    console.error('[Checkout] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error inesperado al procesar el pedido' },
      { status: 500 }
    );
  }
}
