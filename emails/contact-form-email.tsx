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

interface ContactFormEmailProps {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  locale: 'es' | 'en';
}

const translations = {
  es: {
    preview: 'Nuevo mensaje de contacto de',
    title: 'Nuevo Mensaje de Contacto',
    from: 'De',
    email: 'Email',
    phone: 'Teléfono',
    subject: 'Asunto',
    message: 'Mensaje',
    footer: 'Este mensaje fue enviado desde el formulario de contacto de Oro Nacional.',
  },
  en: {
    preview: 'New contact message from',
    title: 'New Contact Message',
    from: 'From',
    email: 'Email',
    phone: 'Phone',
    subject: 'Subject',
    message: 'Message',
    footer: 'This message was sent from the Oro Nacional contact form.',
  },
};

export const ContactFormEmail = ({
  name,
  email,
  phone,
  subject,
  message,
  locale = 'es',
}: ContactFormEmailProps) => {
  const t = translations[locale];

  return (
    <Html>
      <Head />
      <Preview>
        {t.preview} {name}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>{t.title}</Heading>

          <Section style={section}>
            <Text style={label}>{t.from}:</Text>
            <Text style={value}>{name}</Text>
          </Section>

          <Section style={section}>
            <Text style={label}>{t.email}:</Text>
            <Text style={value}>{email}</Text>
          </Section>

          {phone && (
            <Section style={section}>
              <Text style={label}>{t.phone}:</Text>
              <Text style={value}>{phone}</Text>
            </Section>
          )}

          <Section style={section}>
            <Text style={label}>{t.subject}:</Text>
            <Text style={value}>{subject}</Text>
          </Section>

          <Hr style={hr} />

          <Section style={section}>
            <Text style={label}>{t.message}:</Text>
            <Text style={messageText}>{message}</Text>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>{t.footer}</Text>
        </Container>
      </Body>
    </Html>
  );
};

export default ContactFormEmail;

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

const label = {
  color: '#64748b',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0',
  marginBottom: '4px',
};

const value = {
  color: '#1e293b',
  fontSize: '16px',
  margin: '0',
  marginTop: '4px',
};

const messageText = {
  color: '#1e293b',
  fontSize: '16px',
  lineHeight: '1.5',
  margin: '0',
  marginTop: '4px',
  whiteSpace: 'pre-wrap' as const,
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
};
