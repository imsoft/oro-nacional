import { NextRequest, NextResponse } from 'next/server';
import {
  sendOrderConfirmationEmail,
  sendOrderNotificationEmail,
} from '@/lib/email/resend';
import { getOrderById } from '@/lib/supabase/orders';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, locale = 'es' } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Obtener el pedido completo con sus items
    const order = await getOrderById(orderId);

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    if (!order.items || order.items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Order has no items' },
        { status: 400 }
      );
    }

    // Enviar correo de confirmación al cliente
    const customerEmailResult = await sendOrderConfirmationEmail(
      order,
      locale as 'es' | 'en'
    );

    if (!customerEmailResult.success) {
      console.error('Error sending customer confirmation email:', customerEmailResult.error);
      // No fallar si el correo al cliente falla, pero loguear el error
    }

    // Enviar correo de notificación al admin
    const adminEmailResult = await sendOrderNotificationEmail(
      order,
      locale as 'es' | 'en'
    );

    if (!adminEmailResult.success) {
      console.error('Error sending admin notification email:', adminEmailResult.error);
      // No fallar si el correo al admin falla, pero loguear el error
    }

    return NextResponse.json({
      success: true,
      customerEmail: customerEmailResult.success,
      adminEmail: adminEmailResult.success,
    });
  } catch (error) {
    console.error('Error in order email route:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

