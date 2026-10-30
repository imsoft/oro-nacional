// =============================================
// Enlaces de pago (Stripe Checkout) — lógica SOLO de servidor
// =============================================
// El admin genera un enlace para cobrar productos o un monto libre; el
// cliente paga en Stripe Checkout y el webhook marca el pedido como pagado.
// Los precios siempre salen de la base de datos, nunca del navegador.

import type Stripe from 'stripe';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Order, OrderItem } from '@/types/order';
import {
  CheckoutError,
  createCheckoutOrder,
  getOrderWithItems,
  type CheckoutCurrency,
  type CheckoutItemInput,
} from '@/lib/orders/server';

export type PaymentLinkSource = 'web' | 'payment_link';

/** Pedido con las columnas que agrega la migración 056. */
export interface PaymentLinkOrder extends Order {
  source?: PaymentLinkSource;
  stripe_checkout_session_id?: string | null;
  payment_link_url?: string | null;
  payment_link_description?: string | null;
  payment_link_expires_at?: string | null;
  installments_enabled?: boolean;
  installments_months?: number | null;
}

/** Datos de cliente que el admin puede conocer (o no) al generar el enlace. */
export interface PaymentLinkCustomerInput {
  customer_name?: string;
  customer_email?: string;
  customer_whatsapp?: string;
}

// Valores provisionales: el enlace no sabe quién va a pagar hasta que Stripe
// nos manda los datos del cliente al completarse el Checkout.
export const PLACEHOLDER_NAME = 'Por confirmar';
export const PLACEHOLDER_PHONE = 'Por confirmar';
export const PLACEHOLDER_ADDRESS = 'Por confirmar';
export const placeholderEmail = (): string =>
  (process.env.RESEND_ADMIN_EMAIL || 'hola@oronacional.com').toLowerCase();

/** Vigencia del enlace: Stripe permite como máximo 24 horas en Checkout. */
export const PAYMENT_LINK_TTL_SECONDS = 24 * 60 * 60;

export const MAX_AMOUNT = 1_000_000;

const round2 = (n: number) => Math.round(n * 100) / 100;

export const getSiteUrl = (): string =>
  (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.oronacional.com').replace(/\/+$/, '');

/**
 * Verifica que el token Bearer de la petición pertenezca a un admin.
 * Devuelve el usuario o null.
 */
export async function requireAdmin(
  admin: SupabaseClient,
  authorizationHeader: string | null
): Promise<{ id: string; email: string | null } | null> {
  if (!authorizationHeader?.startsWith('Bearer ')) return null;

  const token = authorizationHeader.slice(7).trim();
  if (!token) return null;

  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) return null;

  const { data: profile } = await admin
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .maybeSingle();

  if (profile?.role !== 'admin') return null;

  return { id: data.user.id, email: data.user.email ?? null };
}

function buildCustomer(input: PaymentLinkCustomerInput, description: string) {
  return {
    customer_name: input.customer_name || PLACEHOLDER_NAME,
    customer_email: (input.customer_email || placeholderEmail()).toLowerCase(),
    customer_phone: input.customer_whatsapp || PLACEHOLDER_PHONE,
    customer_whatsapp: input.customer_whatsapp || null,
    shipping_address: PLACEHOLDER_ADDRESS,
    shipping_city: PLACEHOLDER_ADDRESS,
    shipping_state: PLACEHOLDER_ADDRESS,
    shipping_zip_code: '00000',
    shipping_country: 'México',
  };
}

/**
 * Crea el pedido de un enlace con productos del catálogo
 * (precios de la base de datos vía createCheckoutOrder).
 */
export async function createProductsLinkOrder(
  admin: SupabaseClient,
  params: {
    items: CheckoutItemInput[];
    currency: CheckoutCurrency;
    description: string;
    customer: PaymentLinkCustomerInput;
  }
): Promise<PaymentLinkOrder> {
  const { order } = await createCheckoutOrder(admin, {
    customer: buildCustomer(params.customer, params.description),
    items: params.items,
    currency: params.currency,
    locale: 'es',
    userId: null,
  });

  // Marcar el origen y guardar la descripción antes de generar el enlace
  await admin
    .from('orders')
    .update({
      source: 'payment_link',
      payment_link_description: params.description || null,
    })
    .eq('id', order.id);

  const full = await getOrderWithItems(admin, order.id);
  if (!full) {
    throw new CheckoutError('server_error', 'No se pudo leer el pedido creado');
  }
  return full as PaymentLinkOrder;
}

/**
 * Crea el pedido de un enlace de monto libre: un solo item sin producto,
 * con la descripción como nombre.
 */
export async function createAmountLinkOrder(
  admin: SupabaseClient,
  params: {
    amount: number;
    currency: CheckoutCurrency;
    description: string;
    customer: PaymentLinkCustomerInput;
  }
): Promise<PaymentLinkOrder> {
  const amount = round2(params.amount);
  if (!Number.isFinite(amount) || amount <= 0 || amount > MAX_AMOUNT) {
    throw new CheckoutError('invalid_input', 'El monto no es válido');
  }

  const customer = buildCustomer(params.customer, params.description);

  // Tipo de cambio de la tienda, solo informativo para cobros en USD
  const { data: settings } = await admin
    .from('store_settings')
    .select('exchange_rate')
    .limit(1)
    .maybeSingle();
  const exchangeRate = Number(settings?.exchange_rate) > 0 ? Number(settings?.exchange_rate) : null;
  // Equivalente en MXN para las columnas de reporte del admin
  const amountMXN =
    params.currency === 'USD' && exchangeRate ? round2(amount * exchangeRate) : amount;

  let order: PaymentLinkOrder | null = null;
  for (let attempt = 0; attempt < 3 && !order; attempt++) {
    const { data: orderNumber, error: orderNumberError } = await admin.rpc(
      'generate_order_number'
    );
    if (orderNumberError) {
      console.error('[PaymentLinks] Error generating order number:', orderNumberError);
      throw new CheckoutError('server_error', 'Error al generar número de pedido');
    }

    const { data, error } = await admin
      .from('orders')
      .insert({
        order_number: orderNumber,
        user_id: null,
        ...customer,
        // subtotal/total siempre en MXN; total_charged en la moneda cobrada
        subtotal: amountMXN,
        shipping_cost: 0,
        tax: 0,
        total: amountMXN,
        currency: params.currency,
        total_charged: amount,
        exchange_rate: exchangeRate,
        payment_method: 'Tarjeta',
        source: 'payment_link',
        payment_link_description: params.description,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') continue;
      console.error('[PaymentLinks] Error creating order:', error);
      throw new CheckoutError('server_error', 'Error al crear el pedido');
    }
    order = data as PaymentLinkOrder;
  }

  if (!order) {
    throw new CheckoutError('server_error', 'Error al crear el pedido');
  }

  const { error: itemError } = await admin.from('order_items').insert({
    order_id: order.id,
    product_id: null,
    product_name: params.description,
    product_slug: null,
    product_sku: null,
    product_image: null,
    quantity: 1,
    unit_price: amountMXN,
    unit_price_charged: amount,
    size: null,
    material: null,
    subtotal: amountMXN,
  });

  if (itemError) {
    console.error('[PaymentLinks] Error creating order item:', itemError);
    await admin.from('orders').delete().eq('id', order.id);
    throw new CheckoutError('server_error', 'Error al crear el concepto del cobro');
  }

  const full = await getOrderWithItems(admin, order.id);
  return (full as PaymentLinkOrder) || order;
}

/**
 * Crea la sesión de Stripe Checkout del pedido y guarda el enlace en él.
 * Los montos salen de los items ya guardados (precios de la base de datos).
 */
export async function createPaymentLinkSession(
  stripe: Stripe,
  admin: SupabaseClient,
  order: PaymentLinkOrder,
  customer: PaymentLinkCustomerInput,
  options: { installmentsEnabled?: boolean } = {}
): Promise<Stripe.Checkout.Session> {
  const currency = (order.currency || 'MXN') as CheckoutCurrency;
  // Stripe solo ofrece meses sin intereses en MXN; los planes disponibles
  // (3, 6, 9, 12...) se configuran en el Dashboard de Stripe.
  const installmentsEnabled = Boolean(options.installmentsEnabled) && currency === 'MXN';
  const items: OrderItem[] = order.items || [];
  if (items.length === 0) {
    throw new CheckoutError('server_error', 'El pedido no tiene conceptos');
  }

  const siteUrl = getSiteUrl();
  const expiresAt = Math.floor(Date.now() / 1000) + PAYMENT_LINK_TTL_SECONDS;

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item) => {
    const unit = Number(item.unit_price_charged ?? item.unit_price);
    const name = item.size ? `${item.product_name} — Talla ${item.size}` : item.product_name;
    return {
      quantity: item.quantity,
      price_data: {
        currency: currency.toLowerCase(),
        unit_amount: Math.round(unit * 100),
        product_data: {
          name: name.slice(0, 250),
          ...(item.product_image && /^https?:\/\//.test(item.product_image)
            ? { images: [item.product_image] }
            : {}),
        },
      },
    };
  });

  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.create(
      {
        mode: 'payment',
        line_items: lineItems,
        expires_at: expiresAt,
        success_url: `${siteUrl}/pago/gracias?order=${encodeURIComponent(order.order_number)}`,
        cancel_url: `${siteUrl}/`,
        locale: 'es',
        phone_number_collection: { enabled: true },
        ...(installmentsEnabled
          ? { payment_method_options: { card: { installments: { enabled: true } } } }
          : {}),
        ...(customer.customer_email ? { customer_email: customer.customer_email } : {}),
        payment_intent_data: {
          metadata: {
            orderId: order.id,
            orderNumber: order.order_number,
            locale: 'es',
          },
        },
        metadata: { orderId: order.id, orderNumber: order.order_number },
      },
      { idempotencyKey: `payment-link-${order.id}` }
    );
  } catch (stripeError) {
    console.error('[PaymentLinks] Error creating checkout session:', stripeError);
    await admin.from('orders').delete().eq('id', order.id);
    throw new CheckoutError('server_error', 'No se pudo generar el enlace de pago en Stripe');
  }

  const { error } = await admin
    .from('orders')
    .update({
      source: 'payment_link',
      stripe_checkout_session_id: session.id,
      payment_link_url: session.url,
      payment_link_expires_at: new Date(expiresAt * 1000).toISOString(),
      payment_link_description: order.payment_link_description ?? null,
      installments_enabled: installmentsEnabled,
      stripe_payment_intent_id:
        typeof session.payment_intent === 'string' ? session.payment_intent : null,
    })
    .eq('id', order.id);

  if (error) {
    console.error('[PaymentLinks] Error saving link on order:', error);
    try {
      await stripe.checkout.sessions.expire(session.id);
    } catch {
      // El enlace vence solo en 24 h
    }
    throw new CheckoutError('server_error', 'No se pudo guardar el enlace de pago');
  }

  return session;
}

/**
 * Copia al pedido los datos del cliente que Stripe recogió en el Checkout,
 * solo sobre los campos que siguen con valores provisionales. Debe correr
 * antes de finalizePaidOrder para que el correo llegue al cliente real.
 */
export async function syncCustomerFromSession(
  admin: SupabaseClient,
  orderId: string,
  session: Stripe.Checkout.Session
): Promise<void> {
  const details = session.customer_details;
  if (!details) return;

  const { data: order } = await admin
    .from('orders')
    .select('id, customer_name, customer_email, customer_phone, shipping_address, shipping_city, shipping_state, shipping_zip_code, shipping_country, payment_link_description')
    .eq('id', orderId)
    .maybeSingle();
  if (!order) return;

  const updates: Record<string, string> = {};
  const placeholderNames = new Set([PLACEHOLDER_NAME, order.payment_link_description || '']);

  if (details.name && placeholderNames.has(order.customer_name)) {
    updates.customer_name = details.name.slice(0, 200);
  }
  if (details.email && order.customer_email === placeholderEmail()) {
    updates.customer_email = details.email.toLowerCase().slice(0, 200);
  }
  if (details.phone && order.customer_phone === PLACEHOLDER_PHONE) {
    updates.customer_phone = details.phone.slice(0, 40);
  }
  const addr = details.address;
  if (addr && order.shipping_address === PLACEHOLDER_ADDRESS) {
    const line = [addr.line1, addr.line2].filter(Boolean).join(', ');
    if (line) updates.shipping_address = line.slice(0, 400);
    if (addr.city) updates.shipping_city = addr.city.slice(0, 120);
    if (addr.state) updates.shipping_state = addr.state.slice(0, 120);
    if (addr.postal_code) updates.shipping_zip_code = addr.postal_code.slice(0, 20);
    if (addr.country) updates.shipping_country = addr.country.slice(0, 80);
  }

  if (Object.keys(updates).length === 0) return;

  const { error } = await admin.from('orders').update(updates).eq('id', orderId);
  if (error) {
    console.error('[PaymentLinks] Error syncing customer from session:', error);
  }
}

/**
 * Si el pedido viene de un enlace de pago y aún tiene datos provisionales,
 * busca la sesión de Checkout del PaymentIntent y completa los datos.
 */
export async function syncCustomerFromPaymentIntent(
  stripe: Stripe,
  admin: SupabaseClient,
  paymentIntent: Stripe.PaymentIntent
): Promise<void> {
  const orderId = paymentIntent.metadata?.orderId;
  if (!orderId) return;

  const { data: order } = await admin
    .from('orders')
    .select('id, source, customer_email, customer_phone, customer_name')
    .eq('id', orderId)
    .maybeSingle();

  if (!order || order.source !== 'payment_link') return;
  const hasPlaceholders =
    order.customer_email === placeholderEmail() ||
    order.customer_phone === PLACEHOLDER_PHONE ||
    order.customer_name === PLACEHOLDER_NAME;
  if (!hasPlaceholders) return;

  try {
    const sessions = await stripe.checkout.sessions.list({
      payment_intent: paymentIntent.id,
      limit: 1,
    });
    const session = sessions.data[0];
    if (session) {
      await syncCustomerFromSession(admin, orderId, session);
    }
  } catch (error) {
    console.error('[PaymentLinks] Could not load checkout session for PI:', error);
  }
}

/** Marca como cancelado el pedido de un enlace vencido que sigue pendiente. */
export async function cancelExpiredLinkOrder(
  admin: SupabaseClient,
  session: Stripe.Checkout.Session
): Promise<{ error: unknown }> {
  const orderId = session.metadata?.orderId;
  if (!orderId) return { error: null };

  const { error } = await admin
    .from('orders')
    .update({ status: 'Cancelado' })
    .eq('id', orderId)
    .eq('status', 'Pendiente')
    .neq('payment_status', 'Pagado');

  return { error };
}

/**
 * Guarda el plan de meses sin intereses que eligió el cliente (si lo hubo).
 * Stripe lo expone en payment_method_options.card.installments.plan.
 */
export async function saveInstallmentsPlan(
  admin: SupabaseClient,
  paymentIntent: Stripe.PaymentIntent
): Promise<void> {
  const orderId = paymentIntent.metadata?.orderId;
  const plan = paymentIntent.payment_method_options?.card?.installments?.plan;
  if (!orderId || !plan?.count) return;

  const { error } = await admin
    .from('orders')
    .update({ installments_months: plan.count })
    .eq('id', orderId);

  if (error) {
    console.error('[PaymentLinks] Error saving installments plan:', error);
  }
}
