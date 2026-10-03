import {
  Heading,
  Section,
  Text,
} from 'react-email';
import * as React from 'react';
import { EmailLayout, emailColors } from './components/email-layout';

interface ContactConfirmationEmailProps {
  name: string;
  locale: 'es' | 'en';
}

const translations = {
  es: {
    preview: 'Gracias por contactarnos - Oro Nacional',
    title: '¡Gracias por contactarnos!',
    greeting: 'Hola',
    message: 'Hemos recibido tu mensaje y nos pondremos en contacto contigo lo antes posible, generalmente en un plazo máximo de 24 horas.',
    footer: 'Este es un correo automático de confirmación. Por favor, no respondas a este mensaje.',
    company: 'Oro Nacional',
  },
  en: {
    preview: 'Thank you for contacting us - Oro Nacional',
    title: 'Thank you for contacting us!',
    greeting: 'Hello',
    message: 'We have received your message and will get back to you as soon as possible, usually within 24 hours.',
    footer: 'This is an automatic confirmation email. Please do not reply to this message.',
    company: 'Oro Nacional',
  },
};

export const ContactConfirmationEmail = ({
  name,
  locale = 'es',
}: ContactConfirmationEmailProps) => {
  const t = translations[locale];

  return (
    <EmailLayout preview={t.preview} locale={locale} notice={t.footer}>
          <Heading style={h1}>{t.title}</Heading>

          <Section style={section}>
            <Text style={text}>
              {t.greeting} {name},
            </Text>
            <Text style={text}>{t.message}</Text>
          </Section>

    </EmailLayout>
  );
};

export default ContactConfirmationEmail;

// Estilos
const h1 = {
  color: emailColors.text,
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '1.25',
  padding: '0 48px',
  margin: '30px 0',
};

const section = {
  padding: '0 48px',
  margin: '16px 0',
};

const text = {
  color: emailColors.text,
  fontSize: '16px',
  lineHeight: '1.5',
  margin: '0',
  marginBottom: '16px',
};
