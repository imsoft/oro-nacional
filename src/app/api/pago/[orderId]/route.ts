import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { getStripe } from '@/lib/stripe/config';
import { createAdminClient } from '@/lib/supabase/admin';
import { normalizeWhatsAppNumber } from '@/lib/whatsapp';
import { getInstallmentPlan } from '@/lib/payment-links/installments';
import {
  PLACEHOLDER_NAME,
  PLACEHOLDER_PHONE,
  getSiteUrl,
  placeholderEmail,
} from '@/lib/payment-links/server';

// Página de pago de los enlaces a meses con intereses. El plazo lo fija el
// admin al crear el enlace; aquí el servidor confirma el cobro solo con ese
// plan, así el cliente no puede elegir otro que cambie el costo.

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type LinkState = 'pending' | 'paid' | 'expired' | 'cancelled';

interface LinkOrderRow {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  total_charged: number | null;
  total: number;
  currency: string | null;
  status: string;
  payment_status: string;
  source: string | null;
  installments_plan: number | null;
  base_amount: number | null;
  payment_link_description: string | null;
  payment_link_expires_at: string | null;
  stripe_payment_intent_id: string | null;
  deleted_at: string | null;
  items?: Array<{ product_name: string; quantity: number; unit_price_charged: number | null; unit_price: number; size: string | null }>;
}

const text = (value: unknown, maxLength: number): string =>
  typeof value === 'string' ? value.trim().slice(0, maxLength) : '';

async function loadOrder(orderId: string) {
  const admin = createAdminClient();
  if (!admin || !UUID_REGEX.test(orderId)) return { admin, order: null };

  const { data } = await admin
    .from('orders')
    .select(
      'id, order_number, customer_name, customer_email, customer_phone, total_charged, total, currency, status, payment_status, source, installments_plan, base_amount, payment_link_description, payment_link_expires_at, stripe_payment_intent_id, deleted_at, items:order_items(product_name, quantity, unit_price_charged, unit_price, size)'
    )
    .eq('id', orderId)
    .maybeSingle();

  const order = data as LinkOrderRow | null;
  // Solo enlaces a meses existentes
  if (!order || order.deleted_at || order.source !== 'payment_link' || !order.installments_plan) {
    return { admin, order: null };
  }
  return { admin, order };
}

function linkState(order: LinkOrderRow): LinkState {
  if (order.payment_status === 'Pagado') return 'paid';
  if (order.status === 'Cancelado') return 'cancelled';
  if (order.payment_link_expires_at && new Date(order.payment_link_expires_at).getTime() < Date.now()) {
    return 'expired';
  }
  return 'pending';
}

/** Resumen público del enlace (sin datos sensibles). */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;
  const { admin, order } = await loadOrder(orderId);
  if (!admin) return NextResponse.json({ error: 'Servicio no disponible' }, { status: 503 });
  if (!order) return NextResponse.json({ error: 'Enlace no encontrado' }, { status: 404 });

  const total = Number(order.total_charged ?? order.total);
  const months = order.installments_plan as number;

  return NextResponse.json({
    orderNumber: order.order_number,
    description: order.payment_link_description,
    items: (order.items || []).map((item) => ({
      name: item.size ? `${item.product_name} — Talla ${item.size}` : item.product_name,
      quantity: item.quantity,
      unitPrice: Number(item.unit_price_charged ?? item.unit_price),
    })),
    baseAmount: Number(order.base_amount ?? total),
    total,
    currency: order.currency || 'MXN',
    months,
    monthly: Math.round((total / months) * 100) / 100,
    expiresAt: order.payment_link_expires_at,
    state: linkState(order),
    // Datos que el admin ya capturó, para no pedirlos de nuevo
    customer: {
      name: order.customer_name !== PLACEHOLDER_NAME ? order.customer_name : '',
      email: order.customer_email !== placeholderEmail() ? order.customer_email : '',
      phone: order.customer_phone !== PLACEHOLDER_PHONE ? order.customer_phone : '',
    },
  });
}

/**
 * Cobra el enlace: crea el PaymentIntent con la tarjeta del cliente, verifica
 * que el banco ofrezca el plazo fijado y confirma solo con ese plan.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const stripe = getStripe();
    const { admin, order } = await loadOrder(orderId);
    if (!admin || !stripe) {
      return NextResponse.json({ error: 'El pago no está disponible en este momento.' }, { status: 503 });
    }
    if (!order) return NextResponse.json({ error: 'Enlace no encontrado' }, { status: 404 });

    const state = linkState(order);
    if (state !== 'pending') {
      const messages: Record<LinkState, string> = {
        paid: 'Este enlace ya fue pagado.',
        expired: 'Este enlace ya venció. Pide uno nuevo a Oro Nacional.',
        cancelled: 'Este enlace fue cancelado.',
        pending: '',
      };
      return NextResponse.json({ error: messages[state], code: state }, { status: 409 });
    }

    const body = await request.json().catch(() => null);
    const paymentMethodId = text(body?.paymentMethodId, 100);
    const name = text(body?.name, 200);
    const email = text(body?.email, 200).toLowerCase();
    const phoneDigits = text(body?.phone, 40).replace(/\D/g, '');

    if (!paymentMethodId.startsWith('pm_')) {
      return NextResponse.json({ error: 'Datos de la tarjeta no válidos' }, { status: 400 });
    }
    if (!name || !EMAIL_REGEX.test(email) || phoneDigits.length < 8 || phoneDigits.length > 15) {
      return NextResponse.json(
        { error: 'Completa tu nombre, correo y WhatsApp para continuar' },
        { status: 400 }
      );
    }

    const months = order.installments_plan as number;
    const plan = getInstallmentPlan(months);
    if (!plan) {
      return NextResponse.json({ error: 'El plazo de este enlace no es válido' }, { status: 409 });
    }

    // Datos reales del cliente (para el correo de confirmación)
    const whatsapp = normalizeWhatsAppNumber(phoneDigits);
    await admin
      .from('orders')
      .update({
        customer_name: name,
        customer_email: email,
        customer_phone: whatsapp,
        customer_whatsapp: whatsapp,
      })
      .eq('id', order.id);

    // Un intento anterior sin completar se cancela para no dejar cobros abiertos
    if (order.stripe_payment_intent_id) {
      try {
        const previous = await stripe.paymentIntents.retrieve(order.stripe_payment_intent_id);
        if (previous.status === 'succeeded' || previous.status === 'processing') {
          return NextResponse.json(
            { error: 'Este enlace ya tiene un pago en proceso.', code: 'paid' },
            { status: 409 }
          );
        }
        if (previous.status !== 'canceled') {
          await stripe.paymentIntents.cancel(previous.id);
        }
      } catch (cancelError) {
        console.warn('[Pago] Could not cancel previous payment intent:', cancelError);
      }
    }

    const amount = Math.round(Number(order.total_charged ?? order.total) * 100);

    // 1. Crear el cobro con meses habilitados para conocer los planes de la tarjeta
    const intent = await stripe.paymentIntents.create({
      amount,
      currency: 'mxn',
      payment_method: paymentMethodId,
      payment_method_types: ['card'],
      payment_method_options: { card: { installments: { enabled: true } } },
      receipt_email: email,
      description: `Pedido ${order.order_number} · ${months} meses`,
      metadata: {
        orderId: order.id,
        orderNumber: order.order_number,
        locale: 'es',
        installmentsPlan: String(months),
      },
    });

    await admin.from('orders').update({ stripe_payment_intent_id: intent.id }).eq('id', order.id);

    // 2. Verificar que el banco ofrezca exactamente el plazo del enlace
    const available = intent.payment_method_options?.card?.installments?.available_plans || [];
    const selected = available.find(
      (p) => p.type === 'fixed_count' && p.interval === 'month' && p.count === months
    );

    if (!selected) {
      await stripe.paymentIntents.cancel(intent.id).catch(() => undefined);
      const offered = available
        .filter((p) => p.type === 'fixed_count' && p.count)
        .map((p) => p.count as number)
        .sort((a, b) => a - b);
      return NextResponse.json(
        {
          error: `Tu tarjeta no permite pagar a ${months} meses. Usa una tarjeta de crédito de un banco participante o contáctanos para otra opción.`,
          code: 'plan_unavailable',
          offered,
        },
        { status: 422 }
      );
    }

    // 3. Confirmar SOLO con el plazo fijado
    const confirmed: Stripe.PaymentIntent = await stripe.paymentIntents.confirm(intent.id, {
      payment_method_options: {
        card: {
          installments: { plan: { type: 'fixed_count', interval: 'month', count: months } },
        },
      },
      return_url: `${getSiteUrl()}/pago/${order.id}`,
    });

    return NextResponse.json({
      status: confirmed.status,
      clientSecret: confirmed.client_secret,
      paymentIntentId: confirmed.id,
      orderNumber: order.order_number,
    });
  } catch (error) {
    const stripeError = error as { type?: string; message?: string };
    if (stripeError?.type === 'StripeCardError') {
      return NextResponse.json(
        { error: stripeError.message || 'Tu tarjeta fue rechazada.', code: 'card_error' },
        { status: 402 }
      );
    }
    console.error('[Pago] Unexpected error:', error);
    return NextResponse.json({ error: 'No se pudo procesar el pago. Intenta de nuevo.' }, { status: 500 });
  }
}
