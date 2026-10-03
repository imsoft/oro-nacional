import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from 'react-email';
import * as React from 'react';
import { SITE_CONTACT } from '../../src/lib/site-contact';

// Diseño compartido por todos los correos: mismo logo, colores y pie que el sitio.

// Siempre el dominio público: los clientes de correo no pueden cargar imágenes
// de localhost ni de URLs de preview.
export const EMAIL_SITE_URL = 'https://www.oronacional.com';
const LOGO_URL = `${EMAIL_SITE_URL}/logos/logo-oro-nacional-email.png`;

export const emailColors = {
  gold: '#D4AF37',
  goldDark: '#B8941E',
  text: '#1a1a1a',
  body: '#3f3f46',
  muted: '#71717a',
  border: '#e4e4e7',
  background: '#f4f4f5',
  panel: '#fafafa',
};

export const emailFontFamily =
  '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif';

// Botón dorado igual a los del sitio
export const emailButton = {
  backgroundColor: emailColors.gold,
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  padding: '14px 36px',
  display: 'inline-block',
};

const footerText = {
  es: {
    tagline: 'Elegancia y tradición jalisciense desde 1990',
    rights: 'Todos los derechos reservados.',
  },
  en: {
    tagline: 'Elegance and Jalisco tradition since 1990',
    rights: 'All rights reserved.',
  },
};

interface EmailLayoutProps {
  preview: string;
  locale?: 'es' | 'en';
  // Aviso al pie (p. ej. "Este es un correo automático...")
  notice?: string;
  children: React.ReactNode;
}

export const EmailLayout = ({
  preview,
  locale = 'es',
  notice,
  children,
}: EmailLayoutProps) => {
  const t = footerText[locale];
  const siteUrl = locale === 'en' ? `${EMAIL_SITE_URL}/en` : EMAIL_SITE_URL;

  return (
    <Html lang={locale}>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Encabezado con el logo, como la barra del sitio */}
          <Section style={header}>
            <Link href={siteUrl}>
              <Img
                src={LOGO_URL}
                width="150"
                height="111"
                alt="Oro Nacional"
                style={logo}
              />
            </Link>
            <Hr style={goldRule} />
          </Section>

          <Section style={content}>{children}</Section>

          {/* Pie con los datos de contacto del sitio */}
          <Section style={footer}>
            <Text style={tagline}>{t.tagline}</Text>
            <Text style={footerLine}>{SITE_CONTACT.streetAddress}</Text>
            <Text style={footerLine}>
              {SITE_CONTACT.city}, {SITE_CONTACT.state}
            </Text>
            <Text style={footerLine}>
              <Link href={SITE_CONTACT.phoneHref} style={footerLink}>
                {SITE_CONTACT.phoneDisplay}
              </Link>
              {'  ·  '}
              <Link href={SITE_CONTACT.emailHref} style={footerLink}>
                {SITE_CONTACT.email}
              </Link>
            </Text>
            <Text style={footerLine}>
              <Link href={SITE_CONTACT.facebookUrl} style={footerLink}>
                Facebook
              </Link>
              {'  ·  '}
              <Link href={SITE_CONTACT.instagramUrl} style={footerLink}>
                Instagram
              </Link>
              {'  ·  '}
              <Link href={siteUrl} style={footerLink}>
                {SITE_CONTACT.website}
              </Link>
            </Text>
            {notice && <Text style={noticeText}>{notice}</Text>}
            <Text style={copyright}>
              © {new Date().getFullYear()} Oro Nacional. {t.rights}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default EmailLayout;

const main = {
  backgroundColor: emailColors.background,
  fontFamily: emailFontFamily,
  padding: '24px 0',
};

const container = {
  backgroundColor: '#ffffff',
  border: `1px solid ${emailColors.border}`,
  borderRadius: '12px',
  margin: '0 auto',
  maxWidth: '600px',
  overflow: 'hidden' as const,
};

const header = {
  padding: '32px 48px 8px',
  textAlign: 'center' as const,
};

const logo = {
  display: 'block',
  margin: '0 auto',
};

const goldRule = {
  border: 'none',
  borderTop: `2px solid ${emailColors.gold}`,
  margin: '20px auto 0',
  width: '64px',
};

const content = {
  padding: '8px 0 24px',
};

const footer = {
  backgroundColor: emailColors.panel,
  borderTop: `1px solid ${emailColors.border}`,
  padding: '28px 48px',
  textAlign: 'center' as const,
};

const tagline = {
  color: emailColors.goldDark,
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 12px',
};

const footerLine = {
  color: emailColors.muted,
  fontSize: '13px',
  lineHeight: '1.6',
  margin: '0',
};

const footerLink = {
  color: emailColors.muted,
  textDecoration: 'underline',
};

const noticeText = {
  color: emailColors.muted,
  fontSize: '12px',
  lineHeight: '1.5',
  margin: '16px 0 0',
};

const copyright = {
  color: '#a1a1aa',
  fontSize: '12px',
  margin: '8px 0 0',
};
