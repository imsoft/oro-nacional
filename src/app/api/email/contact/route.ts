import { NextRequest, NextResponse } from 'next/server';
import {
  sendContactFormNotificationEmail,
  sendContactConfirmationEmail,
} from '@/lib/email/resend';
import { getContactMessageById } from '@/lib/supabase/contact';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messageId, locale = 'es' } = body;

    if (!messageId) {
      return NextResponse.json(
        { success: false, error: 'Message ID is required' },
        { status: 400 }
      );
    }

    // Obtener el mensaje de contacto
    const message = await getContactMessageById(messageId);

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Message not found' },
        { status: 404 }
      );
    }

    // Enviar correo de notificación al admin
    const adminEmailResult = await sendContactFormNotificationEmail(
      message,
      locale as 'es' | 'en'
    );

    if (!adminEmailResult.success) {
      console.error('Error sending admin notification email:', adminEmailResult.error);
      // No fallar si el correo al admin falla, pero loguear el error
    }

    // Enviar correo de confirmación al cliente
    const customerEmailResult = await sendContactConfirmationEmail(
      message.name,
      message.email,
      locale as 'es' | 'en'
    );

    if (!customerEmailResult.success) {
      console.error('Error sending customer confirmation email:', customerEmailResult.error);
      // No fallar si el correo al cliente falla, pero loguear el error
    }

    return NextResponse.json({
      success: true,
      adminEmail: adminEmailResult.success,
      customerEmail: customerEmailResult.success,
    });
  } catch (error) {
    console.error('Error in contact email route:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

