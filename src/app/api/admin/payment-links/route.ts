import { NextRequest, NextResponse } from 'next/server';
import { normalizeWhatsAppNumber } from '@/lib/whatsapp';
import { getStripe, isStripeConfigured } from '@/lib/stripe/config';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  CheckoutError,
  type CheckoutCurrency,
  type CheckoutItemInput,
} from '@/lib/orders/server';
import {
  MAX_AMOUNT,
  createAmountLinkOrder,
  createPaymentLinkSession,
  createProductsLinkOrder,
  requireAdmin,
  type PaymentLinkCustomerInput,
} from '@/lib/payment-links/server';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_ITEMS = 50;
const MAX_QUANTITY = 99;

const text = (value: unknown, maxLength: number): string =>
  typeof value === 'string' ? value.trim().slice(0, maxLength) : '';

/** Monto con máximo dos decimales, mayor que cero. */
const parseAmount = (value: unknown): number | null => {
  const amount = typeof value === 'string' ? Number(value) : value;
  if (typeof amount !== 'number' || !Number.isFinite(amount)) return null;
  if (amount <= 0 || amount > MAX_AMOUNT) return null;
  // Comparar en centavos con tolerancia: 19.99 * 100 no es exacto en flotante
  const cents = Math.round(amount * 100);
  if (Math.abs(cents - amount * 100) > 1e-6) return null;
  return cents / 100;
};

async function getContext(request: NextRequest) {
  const admin = createAdminClient();
  if (!admin) {
    return { error: NextResponse.json({ error: 'Servicio no disponible' }, { status: 503 }) };
  }

  const user = await requireAdmin(admin, request.headers.get('authorization'));
  if (!user) {
    return { error: NextResponse.json({ error: 'No autorizado' }, { status: 401 }) };
  }

  return { admin, user };
}

/** Lista de enlaces de pago generados (solo admin). */
export async function GET(request: NextRequest) {
  const ctx = await getContext(request);
  if ('error' in ctx) return ctx.error;

  const { data, error } = await ctx.admin
    .from('orders')
    .select(
      'id, order_number, customer_name, customer_email, customer_phone, payment_link_description, total_charged, total, currency, payment_status, status, payment_link_url, payment_link_expires_at, installments_enabled, installments_months, created_at'
    )
    .eq('source', 'payment_link')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    console.error('[PaymentLinks] Error listing links:', error);
    return NextResponse.json({ error: 'No se pudieron cargar los enlaces' }, { status: 500 });
  }

  return NextResponse.json({
    links: (data || []).map((row) => ({
      id: row.id,
      orderNumber: row.order_number,
      customerName: row.customer_name,
      customerEmail: row.customer_email,
      customerPhone: row.customer_phone,
      description: row.payment_link_description,
      total: Number(row.total_charged ?? row.total),
      currency: row.currency || 'MXN',
      paymentStatus: row.payment_status,
      status: row.status,
      url: row.payment_link_url,
      expiresAt: row.payment_link_expires_at,
      installmentsEnabled: Boolean(row.installments_enabled),
      installmentsMonths: row.installments_months ?? null,
      createdAt: row.created_at,
    })),
  });
}

/**
 * Genera un enlace de pago (Stripe Checkout) para productos del catálogo o
 * para un monto libre. Los precios de productos salen de la base de datos.
 */
export async function POST(request: NextRequest) {
  try {
    const ctx = await getContext(request);
    if ('error' in ctx) return ctx.error;
    const { admin } = ctx;

    if (!isStripeConfigured()) {
      return NextResponse.json(
        { error: 'Stripe no está configurado en este momento.' },
        { status: 503 }
      );
    }
    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe no está configurado en este momento.' },
        { status: 503 }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Solicitud no válida' }, { status: 400 });
    }

    const kind = body.kind === 'amount' ? 'amount' : body.kind === 'products' ? 'products' : null;
    if (!kind) {
      return NextResponse.json({ error: 'Tipo de enlace no válido' }, { status: 400 });
    }

    if (body.currency !== 'MXN' && body.currency !== 'USD') {
      return NextResponse.json({ error: 'Moneda no válida' }, { status: 400 });
    }
    const currency: CheckoutCurrency = body.currency;

    const description = text(body.description, 200);
    const customerEmail = text(body.customer_email, 200).toLowerCase();
    if (customerEmail && !EMAIL_REGEX.test(customerEmail)) {
      return NextResponse.json({ error: 'El correo del cliente no es válido' }, { status: 400 });
    }
    const whatsappDigits = text(body.customer_whatsapp, 40).replace(/\D/g, '');
    if (whatsappDigits && (whatsappDigits.length < 8 || whatsappDigits.length > 15)) {
      return NextResponse.json({ error: 'El número de WhatsApp no es válido' }, { status: 400 });
    }

    // MSI solo aplica en MXN (Stripe no lo ofrece en USD)
    const installmentsEnabled = body.installments_enabled === true && currency === 'MXN';

    const customer: PaymentLinkCustomerInput = {
      customer_name: text(body.customer_name, 200) || undefined,
      customer_email: customerEmail || undefined,
      customer_whatsapp: whatsappDigits ? normalizeWhatsAppNumber(whatsappDigits) : undefined,
    };

    let order;
    if (kind === 'amount') {
      const amount = parseAmount(body.amount);
      if (amount === null) {
        return NextResponse.json(
          { error: 'El monto debe ser mayor a cero y tener máximo dos decimales' },
          { status: 400 }
        );
      }
      // Mínimo que acepta Stripe por moneda
      const minAmount = currency === 'USD' ? 0.5 : 10;
      if (amount < minAmount) {
        return NextResponse.json(
          { error: `El monto mínimo es ${minAmount} ${currency}` },
          { status: 400 }
        );
      }
      if (!description) {
        return NextResponse.json({ error: 'Escribe una descripción del cobro' }, { status: 400 });
      }

      order = await createAmountLinkOrder(admin, { amount, currency, description, customer });
    } else {
      if (!Array.isArray(body.items) || body.items.length === 0 || body.items.length > MAX_ITEMS) {
        return NextResponse.json({ error: 'Selecciona al menos un producto' }, { status: 400 });
      }

      const items: CheckoutItemInput[] = [];
      for (const raw of body.items as unknown[]) {
        const item = raw as Record<string, unknown> | null;
        const productId = typeof item?.product_id === 'string' ? item.product_id : '';
        const quantity = Number(item?.quantity);
        if (
          !UUID_REGEX.test(productId) ||
          !Number.isInteger(quantity) ||
          quantity < 1 ||
          quantity > MAX_QUANTITY
        ) {
          return NextResponse.json({ error: 'Los productos seleccionados no son válidos' }, { status: 400 });
        }
        items.push({
          product_id: productId,
          size: typeof item?.size === 'string' && item.size ? item.size.slice(0, 50) : null,
          quantity,
        });
      }

      order = await createProductsLinkOrder(admin, { items, currency, description, customer });
    }

    const session = await createPaymentLinkSession(stripe, admin, order, customer, {
      installmentsEnabled,
    });

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.order_number,
      url: session.url,
      expiresAt: session.expires_at ? new Date(session.expires_at * 1000).toISOString() : null,
      total: Number(order.total_charged ?? order.total),
      currency,
      installmentsEnabled,
    });
  } catch (error) {
    if (error instanceof CheckoutError) {
      const status = error.code === 'server_error' ? 500 : 400;
      return NextResponse.json({ error: error.message, code: error.code }, { status });
    }

    console.error('[PaymentLinks] Unexpected error:', error);
    return NextResponse.json({ error: 'Error inesperado al generar el enlace' }, { status: 500 });
  }
}
