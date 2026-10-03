import { NextRequest, NextResponse } from 'next/server';
import {
  sendContactFormNotificationEmail,
  sendContactConfirmationEmail,
} from '@/lib/email/resend';
import { createAdminClient } from '@/lib/supabase/admin';
import type { ContactMessage } from '@/types/contact';

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

    const admin = createAdminClient();
    if (!admin) {
      console.error('[Contact email] SUPABASE_SERVICE_ROLE_KEY is not configured');
      return NextResponse.json(
        { success: false, error: 'Email service is not configured' },
        { status: 503 }
      );
    }

    // Reclamar el envío de forma atómica: cada mensaje notifica una sola vez,
    // así la ruta no puede usarse para reenviar correos.
    const { data: claimed, error: claimError } = await admin
      .from('contact_messages')
      .update({ notified_at: new Date().toISOString() })
      .eq('id', messageId)
      .is('notified_at', null)
      .select('*');

    if (claimError) {
      console.error('Error fetching contact message:', claimError);
      return NextResponse.json(
        { success: false, error: 'Message not found' },
        { status: 404 }
      );
    }

    const message = claimed?.[0] as ContactMessage | undefined;

    if (!message) {
      // No existe o ya se notificó
      return NextResponse.json({ success: true, alreadySent: true });
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

