import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/payment-links/server';
import { sendOrderStatusEmail } from '@/lib/email/resend';
import type { Order, OrderStatus } from '@/types/order';

const STATUSES: OrderStatus[] = ['Pendiente', 'Procesando', 'Enviado', 'Entregado', 'Cancelado'];

/**
 * Cambia el estado de un pedido desde el admin y avisa al cliente por correo
 * con el diseño del sitio. Solo administradores.
 */
export async function POST(request: NextRequest) {
  try {
    const admin = createAdminClient();
    if (!admin) {
      return NextResponse.json({ error: 'Servicio no disponible' }, { status: 503 });
    }

    const adminUser = await requireAdmin(admin, request.headers.get('authorization'));
    if (!adminUser) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const orderId = typeof body?.orderId === 'string' ? body.orderId : '';
    const status = body?.status as OrderStatus;
    const note = typeof body?.note === 'string' ? body.note.trim().slice(0, 500) : '';
    const notify = body?.notify !== false;

    if (!orderId || !STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Datos no válidos' }, { status: 400 });
    }

    const updates: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
    if (status === 'Enviado') updates.shipped_at = new Date().toISOString();
    if (status === 'Entregado') updates.delivered_at = new Date().toISOString();

    const { data, error } = await admin
      .from('orders')
      .update(updates)
      .eq('id', orderId)
      .is('deleted_at', null)
      .select('*')
      .maybeSingle();

    if (error || !data) {
      console.error('[Admin orders] Error updating status:', error);
      return NextResponse.json({ error: 'No se pudo actualizar el pedido' }, { status: 500 });
    }

    const order = data as Order;
    let emailSent = false;
    let emailError: string | undefined;

    // No avisar al cliente cuando el correo es provisional (enlaces de pago sin datos)
    const placeholderEmail = (process.env.RESEND_ADMIN_EMAIL || 'hola@oronacional.com').toLowerCase();
    const canNotify =
      notify && status !== 'Pendiente' && order.customer_email && order.customer_email !== placeholderEmail;

    if (canNotify) {
      // Los pedidos cobrados en USD vienen de la versión en inglés del sitio
      const locale = order.currency === 'USD' ? 'en' : 'es';
      const result = await sendOrderStatusEmail(order, status, locale, note || null);
      emailSent = result.success;
      emailError = result.error;
    }

    return NextResponse.json({
      success: true,
      status,
      emailSent,
      emailError,
      customerEmail: order.customer_email,
    });
  } catch (error) {
    console.error('[Admin orders] Unexpected error:', error);
    return NextResponse.json({ error: 'Error inesperado' }, { status: 500 });
  }
}
