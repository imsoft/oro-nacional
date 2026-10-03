import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe/config';
import { createAdminClient } from '@/lib/supabase/admin';
import { finalizePaidOrder } from '@/lib/orders/server';

/**
 * Consulta el estado real de un pago para la página de confirmación.
 * Requiere el client secret del PaymentIntent, que solo conoce quien pagó.
 * Si el pago ya se completó, confirma el pedido (igual que el webhook).
 */
export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe();
    const admin = createAdminClient();
    if (!stripe || !admin) {
      return NextResponse.json({ error: 'No disponible' }, { status: 503 });
    }

    const body = await request.json().catch(() => null);
    const paymentIntentId = body?.paymentIntentId;
    const clientSecret = body?.clientSecret;

    if (
      typeof paymentIntentId !== 'string' ||
      typeof clientSecret !== 'string' ||
      !paymentIntentId.startsWith('pi_')
    ) {
      return NextResponse.json({ error: 'Solicitud no válida' }, { status: 400 });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.client_secret !== clientSecret) {
      return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    }

    const base = {
      status: paymentIntent.status,
      orderNumber: paymentIntent.metadata?.orderNumber || null,
      email: paymentIntent.receipt_email || null,
    };

    if (paymentIntent.status === 'succeeded') {
      const result = await finalizePaidOrder(admin, paymentIntent);
      if (!result.ok) {
        // El cobro sí se hizo; el pedido se confirmará por el webhook o manualmente
        console.error('[Checkout status] Could not finalize order:', result.reason);
      }
    }

    return NextResponse.json(base);
  } catch (error) {
    console.error('[Checkout status] Error:', error);
    return NextResponse.json({ error: 'No se pudo consultar el pago' }, { status: 500 });
  }
}
