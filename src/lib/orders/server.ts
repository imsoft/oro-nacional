// =============================================
// Lógica de pedidos que corre SOLO en el servidor
// =============================================
// Los precios y el total se calculan aquí a partir de la base de datos;
// nunca se confía en los montos que manda el navegador.

import type Stripe from 'stripe';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Order } from '@/types/order';
import {
  sendOrderConfirmationEmail,
  sendOrderNotificationEmail,
} from '@/lib/email/resend';

export type CheckoutCurrency = 'MXN' | 'USD';

export interface CheckoutItemInput {
  product_id: string;
  size?: string | null;
  quantity: number;
}

export interface CheckoutCustomerInput {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_zip_code: string;
  shipping_country?: string;
  customer_notes?: string;
}

export class CheckoutError extends Error {
  constructor(
    public code:
      | 'invalid_input'
      | 'product_unavailable'
      | 'price_unavailable'
      | 'out_of_stock'
      | 'server_error',
    message: string
  ) {
    super(message);
  }
}

const DEFAULT_EXCHANGE_RATE = 18;
const MAX_ITEMS = 50;
const MAX_QUANTITY = 99;

const round2 = (n: number) => Math.round(n * 100) / 100;
const positive = (n: unknown): number | null => {
  const value = Number(n);
  return Number.isFinite(value) && value > 0 ? value : null;
};

interface ProductRow {
  id: string;
  name_es: string | null;
  name_en: string | null;
  slug_es: string | null;
  slug_en: string | null;
  material_es: string | null;
  material_en: string | null;
  is_active: boolean | null;
  price: number | null;
  base_price: number | null;
  base_price_usd: number | null;
  images: Array<{ image_url: string; is_primary: boolean | null }> | null;
  sizes: Array<{
    size: string;
    price: number | null;
    price_usd: number | null;
    stock: number | null;
    display_order: number | null;
  }> | null;
}

async function getExchangeRate(admin: SupabaseClient): Promise<number> {
  const { data } = await admin
    .from('store_settings')
    .select('exchange_rate')
    .limit(1)
    .maybeSingle();

  return positive(data?.exchange_rate) ?? DEFAULT_EXCHANGE_RATE;
}

/**
 * Crea el pedido con precios tomados de la base de datos.
 * `unit_price`, `subtotal` y `total` quedan en MXN; `total_charged` y
 * `unit_price_charged` quedan en la moneda que se le cobra al cliente.
 */
export async function createCheckoutOrder(
  admin: SupabaseClient,
  params: {
    customer: CheckoutCustomerInput;
    items: CheckoutItemInput[];
    currency: CheckoutCurrency;
    locale: 'es' | 'en';
    userId: string | null;
  }
): Promise<{ order: Order; totalCharged: number }> {
  const { customer, items, currency, locale, userId } = params;

  if (!Array.isArray(items) || items.length === 0 || items.length > MAX_ITEMS) {
    throw new CheckoutError('invalid_input', 'El carrito está vacío o no es válido');
  }

  for (const item of items) {
    if (
      !item ||
      typeof item.product_id !== 'string' ||
      !Number.isInteger(item.quantity) ||
      item.quantity < 1 ||
      item.quantity > MAX_QUANTITY
    ) {
      throw new CheckoutError('invalid_input', 'El carrito contiene productos no válidos');
    }
  }

  const productIds = [...new Set(items.map((item) => item.product_id))];

  const { data: products, error: productsError } = await admin
    .from('products')
    .select(
      `
      id,
      name_es,
      name_en,
      slug_es,
      slug_en,
      material_es,
      material_en,
      is_active,
      price,
      base_price,
      base_price_usd,
      images:product_images(image_url, is_primary),
      sizes:product_sizes(size, price, price_usd, stock, display_order)
    `
    )
    .in('id', productIds);

  if (productsError) {
    console.error('[Checkout] Error loading products:', productsError);
    throw new CheckoutError('server_error', 'No se pudieron cargar los productos');
  }

  const productsById = new Map(
    ((products as unknown as ProductRow[]) || []).map((p) => [p.id, p])
  );
  const exchangeRate = await getExchangeRate(admin);

  const orderItems = items.map((item) => {
    const product = productsById.get(item.product_id);
    const name =
      (locale === 'es'
        ? product?.name_es || product?.name_en
        : product?.name_en || product?.name_es) || 'Producto';

    if (!product || product.is_active === false) {
      throw new CheckoutError(
        'product_unavailable',
        `El producto "${name}" ya no está disponible`
      );
    }

    const sizes = [...(product.sizes || [])].sort(
      (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)
    );
    // Sin talla indicada (p. ej. desde favoritos) se usa la primera, que es
    // la misma cuyo precio se muestra en el catálogo.
    const size = item.size
      ? sizes.find((s) => s.size === item.size)
      : sizes[0];

    if (item.size && !size) {
      throw new CheckoutError(
        'product_unavailable',
        `La talla seleccionada de "${name}" ya no está disponible`
      );
    }

    if (size && size.stock !== null && size.stock < item.quantity) {
      throw new CheckoutError(
        'out_of_stock',
        `No hay existencias suficientes de "${name}"`
      );
    }

    const sizePriceMXN = positive(size?.price);
    const unitPriceMXN =
      sizePriceMXN ?? positive(product.base_price) ?? positive(product.price);

    if (!unitPriceMXN) {
      throw new CheckoutError(
        'price_unavailable',
        `El producto "${name}" no tiene precio disponible`
      );
    }

    // Misma regla que el sitio al mostrar precios: USD fijo si existe (el de
    // la talla cuando el precio viene de la talla, el base en otro caso);
    // si no, conversión con el tipo de cambio de la tienda.
    const fixedPriceUSD = sizePriceMXN
      ? positive(size?.price_usd)
      : positive(product.base_price_usd);
    const unitPriceCharged =
      currency === 'USD'
        ? round2(fixedPriceUSD ?? unitPriceMXN / exchangeRate)
        : round2(unitPriceMXN);

    const images = product.images || [];
    const image = images.find((img) => img.is_primary) || images[0];

    return {
      product_id: product.id,
      product_name: name,
      product_slug:
        (locale === 'es'
          ? product.slug_es || product.slug_en
          : product.slug_en || product.slug_es) || null,
      product_sku: null,
      product_image: image?.image_url || null,
      quantity: item.quantity,
      unit_price: round2(unitPriceMXN),
      unit_price_charged: unitPriceCharged,
      size: size?.size || null,
      material:
        (locale === 'es'
          ? product.material_es || product.material_en
          : product.material_en || product.material_es) || null,
      subtotal: round2(unitPriceMXN * item.quantity),
    };
  });

  // Los precios ya incluyen IVA y envío, así que total = subtotal
  const subtotal = round2(orderItems.reduce((sum, item) => sum + item.subtotal, 0));
  const totalCharged = round2(
    orderItems.reduce((sum, item) => sum + item.unit_price_charged * item.quantity, 0)
  );

  // El número de pedido es aleatorio: reintentar si choca con uno existente
  let order: Order | null = null;
  for (let attempt = 0; attempt < 3 && !order; attempt++) {
    const { data: orderNumber, error: orderNumberError } = await admin.rpc(
      'generate_order_number'
    );

    if (orderNumberError) {
      console.error('[Checkout] Error generating order number:', orderNumberError);
      throw new CheckoutError('server_error', 'Error al generar número de pedido');
    }

    const { data, error } = await admin
      .from('orders')
      .insert({
        order_number: orderNumber,
        user_id: userId,
        customer_name: customer.customer_name,
        customer_email: customer.customer_email,
        customer_phone: customer.customer_phone,
        shipping_address: customer.shipping_address,
        shipping_city: customer.shipping_city,
        shipping_state: customer.shipping_state,
        shipping_zip_code: customer.shipping_zip_code,
        shipping_country: customer.shipping_country || 'México',
        subtotal,
        shipping_cost: 0,
        tax: 0,
        total: subtotal,
        currency,
        total_charged: totalCharged,
        exchange_rate: exchangeRate,
        payment_method: 'Tarjeta',
        customer_notes: customer.customer_notes || null,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') continue;
      console.error('[Checkout] Error creating order:', error);
      throw new CheckoutError('server_error', 'Error al crear el pedido');
    }

    order = data as Order;
  }

  if (!order) {
    throw new CheckoutError('server_error', 'Error al crear el pedido');
  }

  const { error: itemsError } = await admin
    .from('order_items')
    .insert(orderItems.map((item) => ({ ...item, order_id: order.id })));

  if (itemsError) {
    console.error('[Checkout] Error creating order items:', itemsError);
    await admin.from('orders').delete().eq('id', order.id);
    throw new CheckoutError('server_error', 'Error al crear items del pedido');
  }

  return { order, totalCharged };
}

/** Pedido completo con sus items (lectura con service role). */
export async function getOrderWithItems(
  admin: SupabaseClient,
  orderId: string
): Promise<Order | null> {
  const { data, error } = await admin
    .from('orders')
    .select('*, items:order_items(*)')
    .eq('id', orderId)
    .maybeSingle();

  if (error) {
    console.error('[Orders] Error fetching order:', error);
    return null;
  }

  return (data as Order) || null;
}

export type FinalizeResult =
  | { ok: true; order: Order; alreadyPaid: boolean }
  | { ok: false; reason: 'order_not_found' | 'amount_mismatch' | 'db_error' };

/**
 * Marca como pagado el pedido de un PaymentIntent exitoso y envía los correos
 * de confirmación una sola vez. Es idempotente: la llaman tanto el webhook
 * como la página de confirmación.
 */
export async function finalizePaidOrder(
  admin: SupabaseClient,
  paymentIntent: Stripe.PaymentIntent
): Promise<FinalizeResult> {
  const orderId = paymentIntent.metadata?.orderId;
  if (!orderId) {
    return { ok: false, reason: 'order_not_found' };
  }

  const order = await getOrderWithItems(admin, orderId);
  if (!order) {
    return { ok: false, reason: 'order_not_found' };
  }

  // Verificar que lo cobrado corresponde al pedido
  const expectedAmount = Math.round(Number(order.total_charged ?? order.total) * 100);
  const expectedCurrency = (order.currency || 'MXN').toLowerCase();
  if (
    paymentIntent.amount_received < expectedAmount ||
    paymentIntent.currency !== expectedCurrency
  ) {
    console.error('[Orders] Payment amount mismatch', {
      orderId,
      expectedAmount,
      expectedCurrency,
      received: paymentIntent.amount_received,
      currency: paymentIntent.currency,
    });
    await admin
      .from('orders')
      .update({
        admin_notes: `Pago ${paymentIntent.id} recibido por ${paymentIntent.amount_received / 100} ${paymentIntent.currency.toUpperCase()}, no coincide con el total del pedido. Revisar manualmente.`,
        stripe_payment_intent_id: paymentIntent.id,
      })
      .eq('id', orderId);
    return { ok: false, reason: 'amount_mismatch' };
  }

  const alreadyPaid = order.payment_status === 'Pagado';

  if (!alreadyPaid) {
    const { data: updated, error } = await admin
      .from('orders')
      .update({
        payment_status: 'Pagado',
        // No regresar un pedido que ya avanzó (Enviado, Entregado...)
        status: order.status === 'Pendiente' ? 'Procesando' : order.status,
        stripe_payment_intent_id: paymentIntent.id,
      })
      .eq('id', orderId)
      .select('id');

    if (error || !updated || updated.length === 0) {
      console.error('[Orders] Error marking order as paid:', error);
      return { ok: false, reason: 'db_error' };
    }

    order.payment_status = 'Pagado';
    if (order.status === 'Pendiente') order.status = 'Procesando';
  }

  // Reclamar el envío de correos de forma atómica para no duplicarlos
  const { data: claimed } = await admin
    .from('orders')
    .update({ confirmation_sent_at: new Date().toISOString() })
    .eq('id', orderId)
    .is('confirmation_sent_at', null)
    .select('id');

  if (claimed && claimed.length > 0 && order.items && order.items.length > 0) {
    const locale = paymentIntent.metadata?.locale === 'en' ? 'en' : 'es';

    const customerResult = await sendOrderConfirmationEmail(order, locale);
    if (!customerResult.success) {
      console.error('[Orders] Error sending customer email:', customerResult.error);
    }

    const adminResult = await sendOrderNotificationEmail(order, locale);
    if (!adminResult.success) {
      console.error('[Orders] Error sending admin email:', adminResult.error);
    }
  }

  return { ok: true, order, alreadyPaid };
}
