import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from 'react-email';
import * as React from 'react';

interface EmailConfirmationProps {
  customerName: string;
  confirmationUrl: string;
  locale?: 'es' | 'en';
}

const translations = {
  es: {
    preview: 'Confirma tu cuenta en Oro Nacional',
    greeting: 'Hola',
    intro: 'Gracias por registrarte en Oro Nacional. Solo falta un paso para activar tu cuenta.',
    cta: 'Confirma tu cuenta haciendo clic en el botón a continuación:',
    button: 'Confirmar mi cuenta',
    expiry: 'Este enlace es válido por 24 horas. Si no creaste esta cuenta, puedes ignorar este correo.',
    footer: 'Este es un correo automático. Por favor, no respondas a este mensaje.',
    company: 'Oro Nacional — Joyería Elegante de Jalisco',
  },
  en: {
    preview: 'Confirm your Oro Nacional account',
    greeting: 'Hello',
    intro: 'Thank you for registering with Oro Nacional. Just one more step to activate your account.',
    cta: 'Confirm your account by clicking the button below:',
    button: 'Confirm my account',
    expiry: 'This link is valid for 24 hours. If you did not create this account, you can safely ignore this email.',
    footer: 'This is an automated email. Please do not reply to this message.',
    company: 'Oro Nacional — Elegant Jewelry from Jalisco',
  },
};

export const EmailConfirmation = ({
  customerName,
  confirmationUrl,
  locale = 'es',
}: EmailConfirmationProps) => {
  const t = translations[locale];

  return (
    <Html>
      <Head />
      <Preview>{t.preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header dorado */}
          <Section style={header}>
            <Text style={brandName}>Oro Nacional</Text>
            <Text style={brandTagline}>Joyería Elegante · Jalisco, México</Text>
          </Section>

          <Section style={section}>
            <Text style={greeting}>
              {t.greeting}, {customerName}
            </Text>
            <Text style={text}>{t.intro}</Text>
            <Text style={text}>{t.cta}</Text>
          </Section>

          <Section style={buttonSection}>
            <Button style={button} href={confirmationUrl}>
              {t.button}
            </Button>
          </Section>

          <Section style={section}>
            <Text style={expiryText}>{t.expiry}</Text>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>{t.footer}</Text>
          <Text style={footerBrand}>{t.company}</Text>
        </Container>
      </Body>
    </Html>
  );
};

export default EmailConfirmation;

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '0 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
  borderRadius: '8px',
  overflow: 'hidden' as const,
};

const header = {
  backgroundColor: '#1a1a1a',
  padding: '32px 48px',
  textAlign: 'center' as const,
};

const brandName = {
  color: '#D4AF37',
  fontSize: '28px',
  fontWeight: '700',
  letterSpacing: '2px',
  margin: '0',
  textTransform: 'uppercase' as const,
};

const brandTagline = {
  color: '#9a8a6a',
  fontSize: '12px',
  letterSpacing: '1px',
  margin: '6px 0 0',
  textTransform: 'uppercase' as const,
};

const section = {
  padding: '0 48px',
  margin: '24px 0',
};

const greeting = {
  color: '#1e293b',
  fontSize: '20px',
  fontWeight: '600',
  margin: '0 0 12px',
};

const text = {
  color: '#475569',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 12px',
};

const buttonSection = {
  textAlign: 'center' as const,
  padding: '8px 48px 24px',
};

const button = {
  backgroundColor: '#D4AF37',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  padding: '14px 40px',
  display: 'inline-block',
};

const expiryText = {
  color: '#94a3b8',
  fontSize: '13px',
  lineHeight: '1.5',
  margin: '0',
};

const hr = {
  borderColor: '#e2e8f0',
  margin: '0 48px 24px',
};

const footer = {
  color: '#94a3b8',
  fontSize: '12px',
  lineHeight: '1.5',
  padding: '0 48px',
  margin: '0 0 4px',
  textAlign: 'center' as const,
};

const footerBrand = {
  color: '#D4AF37',
  fontSize: '13px',
  fontWeight: '600',
  padding: '0 48px',
  margin: '0',
  textAlign: 'center' as const,
};
