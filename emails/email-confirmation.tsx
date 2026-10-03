import {
  Button,
  Section,
  Text,
} from 'react-email';
import * as React from 'react';
import { EmailLayout, emailColors, emailButton } from './components/email-layout';

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
    <EmailLayout preview={t.preview} locale={locale} notice={t.footer}>
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

    </EmailLayout>
  );
};

export default EmailConfirmation;

// Styles
const section = {
  padding: '0 48px',
  margin: '24px 0',
};

const greeting = {
  color: emailColors.text,
  fontSize: '20px',
  fontWeight: '600',
  margin: '0 0 12px',
};

const text = {
  color: emailColors.body,
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 12px',
};

const buttonSection = {
  textAlign: 'center' as const,
  padding: '8px 48px 24px',
};

const button = emailButton;

const expiryText = {
  color: emailColors.muted,
  fontSize: '13px',
  lineHeight: '1.5',
  margin: '0',
};
