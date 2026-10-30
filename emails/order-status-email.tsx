import { Button, Heading, Hr, Section, Text } from 'react-email';
import * as React from 'react';
import { EmailLayout, emailColors, emailButton, EMAIL_SITE_URL } from './components/email-layout';
import type { OrderStatus } from '../src/types/order';

interface OrderStatusEmailProps {
  orderNumber: string;
  customerName: string;
  status: OrderStatus;
  locale: 'es' | 'en';
  // Nota opcional del admin para el cliente (p. ej. guía de rastreo)
  note?: string | null;
}

type StatusCopy = { preview: string; title: string; message: string };

const copy: Record<'es' | 'en', Record<OrderStatus, StatusCopy> & {
  greeting: string;
  orderNumber: string;
  noteLabel: string;
  button: string;
  footer: string;
}> = {
  es: {
    greeting: 'Hola',
    orderNumber: 'Número de pedido',
    noteLabel: 'Nota de Oro Nacional',
    button: 'Ver mi pedido',
    footer: 'Este es un correo automático. Si tienes dudas, responde por WhatsApp o escríbenos a hola@oronacional.com.',
    Pendiente: {
      preview: 'Recibimos tu pedido',
      title: 'Recibimos tu pedido',
      message: 'Tu pedido quedó registrado y está pendiente de confirmación de pago. Te avisaremos en cuanto se confirme.',
    },
    Procesando: {
      preview: 'Tu pedido está en preparación',
      title: 'Estamos preparando tu pedido',
      message: 'Tu pago fue confirmado y nuestros maestros joyeros ya están preparando tu pieza con el mayor cuidado. Te avisaremos cuando salga en camino.',
    },
    Enviado: {
      preview: 'Tu pedido va en camino',
      title: '¡Tu pedido va en camino!',
      message: 'Tu pieza ya salió de nuestro taller. El tiempo de entrega estimado es de 3 a 5 días hábiles.',
    },
    Entregado: {
      preview: 'Tu pedido fue entregado',
      title: 'Tu pedido fue entregado',
      message: 'Esperamos que disfrutes tu joya. Gracias por confiar en Oro Nacional; nos encantaría verla en tus redes etiquetándonos.',
    },
    Cancelado: {
      preview: 'Tu pedido fue cancelado',
      title: 'Tu pedido fue cancelado',
      message: 'Tu pedido ha sido cancelado. Si realizaste un pago, el reembolso se verá reflejado en tu tarjeta en los próximos días hábiles. Si tienes dudas, contáctanos.',
    },
  },
  en: {
    greeting: 'Hello',
    orderNumber: 'Order number',
    noteLabel: 'Note from Oro Nacional',
    button: 'View my order',
    footer: 'This is an automated email. If you have questions, reach us on WhatsApp or at hola@oronacional.com.',
    Pendiente: {
      preview: 'We received your order',
      title: 'We received your order',
      message: 'Your order is registered and pending payment confirmation. We will let you know as soon as it is confirmed.',
    },
    Procesando: {
      preview: 'Your order is being prepared',
      title: 'We are preparing your order',
      message: 'Your payment was confirmed and our master jewelers are already preparing your piece with the utmost care. We will let you know when it ships.',
    },
    Enviado: {
      preview: 'Your order is on its way',
      title: 'Your order is on its way!',
      message: 'Your piece has left our workshop. Estimated delivery time is 3 to 5 business days.',
    },
    Entregado: {
      preview: 'Your order was delivered',
      title: 'Your order was delivered',
      message: 'We hope you enjoy your jewelry. Thank you for trusting Oro Nacional; we would love to see it on your social media.',
    },
    Cancelado: {
      preview: 'Your order was cancelled',
      title: 'Your order was cancelled',
      message: 'Your order has been cancelled. If you made a payment, the refund will appear on your card within the next business days. Contact us if you have any questions.',
    },
  },
};

export const OrderStatusEmail = ({
  orderNumber,
  customerName,
  status,
  locale = 'es',
  note,
}: OrderStatusEmailProps) => {
  const t = copy[locale];
  const s = t[status];
  const ordersUrl = `${EMAIL_SITE_URL}${locale === 'en' ? '/en' : ''}/my-orders`;

  return (
    <EmailLayout preview={`${s.preview} · ${orderNumber}`} locale={locale} notice={t.footer}>
      <Section style={section}>
        <Heading style={h1}>{s.title}</Heading>
        <Text style={text}>
          {t.greeting} {customerName},
        </Text>
        <Text style={text}>{s.message}</Text>
      </Section>

      <Section style={section}>
        <Text style={label}>{t.orderNumber}</Text>
        <Text style={orderNumberText}>{orderNumber}</Text>
      </Section>

      {note && (
        <Section style={section}>
          <Hr style={hr} />
          <Text style={label}>{t.noteLabel}</Text>
          <Text style={text}>{note}</Text>
        </Section>
      )}

      <Section style={buttonSection}>
        <Button style={emailButton} href={ordersUrl}>
          {t.button}
        </Button>
      </Section>
    </EmailLayout>
  );
};

export default OrderStatusEmail;

const section = { padding: '0 48px', margin: '16px 0' };
const h1 = {
  color: emailColors.text,
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '1.25',
  margin: '16px 0 20px',
};
const text = { color: emailColors.text, fontSize: '16px', lineHeight: '1.5', margin: '0 0 12px' };
const label = { color: emailColors.muted, fontSize: '14px', fontWeight: '600', margin: '0 0 4px' };
const orderNumberText = { color: emailColors.gold, fontSize: '20px', fontWeight: '700', margin: '0' };
const hr = { borderColor: emailColors.border, margin: '0 0 16px', width: 'auto' };
const buttonSection = { textAlign: 'center' as const, padding: '8px 48px 16px' };
