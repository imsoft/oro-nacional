import {
  Heading,
  Section,
  Text,
  Hr,
} from 'react-email';
import * as React from 'react';
import { EmailLayout, emailColors } from './components/email-layout';

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
    <EmailLayout preview={`${t.preview} ${name}`} locale={locale} notice={t.footer}>
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

    </EmailLayout>
  );
};

export default ContactFormEmail;

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

const label = {
  color: emailColors.muted,
  fontSize: '14px',
  fontWeight: '600',
  margin: '0',
  marginBottom: '4px',
};

const value = {
  color: emailColors.text,
  fontSize: '16px',
  margin: '0',
  marginTop: '4px',
};

const messageText = {
  color: emailColors.text,
  fontSize: '16px',
  lineHeight: '1.5',
  margin: '0',
  marginTop: '4px',
  whiteSpace: 'pre-wrap' as const,
};

const hr = {
  borderColor: emailColors.border,
  margin: '32px 48px',
  width: 'auto',
};
