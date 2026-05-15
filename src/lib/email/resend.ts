import { Resend } from 'resend';
import { render } from 'react-email';
import { ContactFormEmail } from '../../../emails/contact-form-email';
import { ContactConfirmationEmail } from '../../../emails/contact-confirmation-email';
import { OrderConfirmationEmail } from '../../../emails/order-confirmation-email';
import { OrderNotificationEmail } from '../../../emails/order-notification-email';
import { EmailConfirmation } from '../../../emails/email-confirmation';
import type { ContactMessage } from '@/types/contact';
import type { Order } from '@/types/order';

// Email de la empresa (debe configurarse en Resend)
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@oronation.com';
const ADMIN_EMAIL = process.env.RESEND_ADMIN_EMAIL || 'admin@oronation.com';

// Función para obtener instancia de Resend (solo cuando se necesite)
function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new Resend(apiKey);
}

/**
 * Enviar correo de notificación al admin cuando se recibe un mensaje de contacto
 */
export async function sendContactFormNotificationEmail(
  message: ContactMessage,
  locale: 'es' | 'en' = 'es'
): Promise<{ success: boolean; error?: string }> {
  try {
    // Si no hay API key, solo loguear (modo desarrollo)
    if (!process.env.RESEND_API_KEY) {
      console.log('📧 [DEV] Contact form notification email would be sent:', {
        to: ADMIN_EMAIL,
        from: FROM_EMAIL,
        subject: locale === 'es' 
          ? `Nuevo mensaje de contacto de ${message.name}`
          : `New contact message from ${message.name}`,
        message,
      });
      return { success: true };
    }

    const resend = getResend();
    if (!resend) {
      return { success: false, error: 'Resend API key not configured' };
    }

    const emailHtml = await render(
      ContactFormEmail({
        name: message.name,
        email: message.email,
        phone: message.phone || undefined,
        subject: message.subject,
        message: message.message,
        locale,
      })
    );

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject:
        locale === 'es'
          ? `Nuevo mensaje de contacto de ${message.name}`
          : `New contact message from ${message.name}`,
      html: emailHtml,
    });

    if (error) {
      console.error('Error sending contact form notification email:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending contact form notification email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Enviar correo de confirmación al cliente cuando envía un mensaje de contacto
 */
export async function sendContactConfirmationEmail(
  name: string,
  email: string,
  locale: 'es' | 'en' = 'es'
): Promise<{ success: boolean; error?: string }> {
  try {
    // Si no hay API key, solo loguear (modo desarrollo)
    if (!process.env.RESEND_API_KEY) {
      console.log('📧 [DEV] Contact confirmation email would be sent:', {
        to: email,
        from: FROM_EMAIL,
        subject: locale === 'es'
          ? 'Gracias por contactarnos - Oro Nacional'
          : 'Thank you for contacting us - Oro Nacional',
        name,
      });
      return { success: true };
    }

    const resend = getResend();
    if (!resend) {
      return { success: false, error: 'Resend API key not configured' };
    }

    const emailHtml = await render(
      ContactConfirmationEmail({
        name,
        locale,
      })
    );

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject:
        locale === 'es'
          ? 'Gracias por contactarnos - Oro Nacional'
          : 'Thank you for contacting us - Oro Nacional',
      html: emailHtml,
    });

    if (error) {
      console.error('Error sending contact confirmation email:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending contact confirmation email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Enviar correo de confirmación al cliente cuando realiza una compra
 */
export async function sendOrderConfirmationEmail(
  order: Order,
  locale: 'es' | 'en' = 'es'
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!order.items || order.items.length === 0) {
      return { success: false, error: 'Order has no items' };
    }

    // Si no hay API key, solo loguear (modo desarrollo)
    if (!process.env.RESEND_API_KEY) {
      console.log('📧 [DEV] Order confirmation email would be sent:', {
        to: order.customer_email,
        from: FROM_EMAIL,
        subject: locale === 'es'
          ? `Confirmación de pedido ${order.order_number} - Oro Nacional`
          : `Order confirmation ${order.order_number} - Oro Nacional`,
        orderNumber: order.order_number,
      });
      return { success: true };
    }

    const resend = getResend();
    if (!resend) {
      return { success: false, error: 'Resend API key not configured' };
    }

    const emailHtml = await render(
      OrderConfirmationEmail({
        orderNumber: order.order_number,
        customerName: order.customer_name,
        items: order.items.map((item) => ({
          product_name: item.product_name,
          quantity: item.quantity,
          unit_price: Number(item.unit_price),
          size: item.size || null,
          material: item.material || null,
        })),
        subtotal: Number(order.subtotal),
        shippingCost: Number(order.shipping_cost),
        tax: Number(order.tax),
        total: Number(order.total),
        shippingAddress: order.shipping_address,
        shippingCity: order.shipping_city,
        shippingState: order.shipping_state,
        shippingZipCode: order.shipping_zip_code,
        paymentMethod: order.payment_method,
        locale,
      })
    );

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: order.customer_email,
      subject:
        locale === 'es'
          ? `Confirmación de pedido ${order.order_number} - Oro Nacional`
          : `Order confirmation ${order.order_number} - Oro Nacional`,
      html: emailHtml,
    });

    if (error) {
      console.error('Error sending order confirmation email:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Enviar correo de confirmación de cuenta al usuario recién registrado
 */
export async function sendEmailConfirmation(
  name: string,
  email: string,
  confirmationUrl: string,
  locale: 'es' | 'en' = 'es'
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.log('📧 [DEV] Email confirmation would be sent:', { to: email, confirmationUrl });
      return { success: true };
    }

    const resend = getResend();
    if (!resend) {
      return { success: false, error: 'Resend API key not configured' };
    }

    const emailHtml = await render(
      EmailConfirmation({ customerName: name, confirmationUrl, locale })
    );

    const subject = locale === 'es'
      ? 'Confirma tu cuenta - Oro Nacional'
      : 'Confirm your account - Oro Nacional';

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject,
      html: emailHtml,
    });

    if (error) {
      console.error('Error sending email confirmation:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending email confirmation:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Enviar correo de notificación al admin cuando se recibe un nuevo pedido
 */
export async function sendOrderNotificationEmail(
  order: Order,
  locale: 'es' | 'en' = 'es'
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!order.items || order.items.length === 0) {
      return { success: false, error: 'Order has no items' };
    }

    // Si no hay API key, solo loguear (modo desarrollo)
    if (!process.env.RESEND_API_KEY) {
      console.log('📧 [DEV] Order notification email would be sent:', {
        to: ADMIN_EMAIL,
        from: FROM_EMAIL,
        subject: locale === 'es'
          ? `Nuevo pedido ${order.order_number} - Oro Nacional`
          : `New order ${order.order_number} - Oro Nacional`,
        orderNumber: order.order_number,
      });
      return { success: true };
    }

    const resend = getResend();
    if (!resend) {
      return { success: false, error: 'Resend API key not configured' };
    }

    const emailHtml = await render(
      OrderNotificationEmail({
        orderNumber: order.order_number,
        customerName: order.customer_name,
        customerEmail: order.customer_email,
        customerPhone: order.customer_phone,
        items: order.items.map((item) => ({
          product_name: item.product_name,
          quantity: item.quantity,
          unit_price: Number(item.unit_price),
          size: item.size || null,
          material: item.material || null,
        })),
        subtotal: Number(order.subtotal),
        shippingCost: Number(order.shipping_cost),
        tax: Number(order.tax),
        total: Number(order.total),
        shippingAddress: order.shipping_address,
        shippingCity: order.shipping_city,
        shippingState: order.shipping_state,
        shippingZipCode: order.shipping_zip_code,
        paymentMethod: order.payment_method,
        locale,
      })
    );

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject:
        locale === 'es'
          ? `Nuevo pedido ${order.order_number} - Oro Nacional`
          : `New order ${order.order_number} - Oro Nacional`,
      html: emailHtml,
    });

    if (error) {
      console.error('Error sending order notification email:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending order notification email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

