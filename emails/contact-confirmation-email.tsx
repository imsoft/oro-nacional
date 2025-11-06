import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
} from '@react-email/components';
import * as React from 'react';

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
    <Html>
      <Head />
      <Preview>{t.preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>{t.title}</Heading>

          <Section style={section}>
            <Text style={text}>
              {t.greeting} {name},
            </Text>
            <Text style={text}>{t.message}</Text>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>{t.footer}</Text>
          <Text style={company}>{t.company}</Text>
        </Container>
      </Body>
    </Html>
  );
};

export default ContactConfirmationEmail;

// Estilos
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const h1 = {
  color: '#D4AF37',
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
  color: '#1e293b',
  fontSize: '16px',
  lineHeight: '1.5',
  margin: '0',
  marginBottom: '16px',
};

const hr = {
  borderColor: '#e2e8f0',
  margin: '32px 48px',
};

const footer = {
  color: '#64748b',
  fontSize: '12px',
  lineHeight: '1.5',
  padding: '0 48px',
  marginTop: '32px',
  textAlign: 'center' as const,
};

const company = {
  color: '#D4AF37',
  fontSize: '14px',
  fontWeight: '600',
  padding: '0 48px',
  marginTop: '8px',
  textAlign: 'center' as const,
};

