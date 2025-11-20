import type { Metadata } from "next";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const titles = {
    es: "Oro Nacional - Joyería Elegante en el Corazón de Jalisco | Anillos, Collares y Aretes de Oro",
    en: "Oro Nacional - Elegant Jewelry from the Heart of Jalisco | Gold Rings, Necklaces and Earrings"
  };

  const descriptions = {
    es: "Descubre joyería elegante diseñada en Guadalajara, Jalisco. Oro Nacional ofrece anillos de compromiso, collares exclusivos, esclavas y aretes de oro de 14k y 18k. Más de 30 años creando piezas únicas con la tradición artesanal jalisciense. Envíos seguros a toda la República Mexicana.",
    en: "Discover elegant jewelry designed in Guadalajara, Jalisco. Oro Nacional offers engagement rings, exclusive necklaces, bracelets and earrings in 14k and 18k gold. Over 30 years creating unique pieces with Jalisco's artisan tradition. Secure shipping throughout Mexico."
  };

  const keywords = {
    es: "joyería Guadalajara, joyería Jalisco, anillos de oro, collares de oro, aretes de oro, esclavas de oro, joyería elegante México, anillos de compromiso Guadalajara, oro 14k, oro 18k, joyería artesanal Jalisco",
    en: "jewelry Guadalajara, jewelry Jalisco, gold rings, gold necklaces, gold earrings, gold bracelets, elegant jewelry Mexico, engagement rings Guadalajara, 14k gold, 18k gold, artisan jewelry Jalisco"
  };

  return {
    title: titles[locale as 'es' | 'en'] || titles.es,
    description: descriptions[locale as 'es' | 'en'] || descriptions.es,
    keywords: keywords[locale as 'es' | 'en'] || keywords.es,
    openGraph: {
      title: titles[locale as 'es' | 'en'] || titles.es,
      description: descriptions[locale as 'es' | 'en'] || descriptions.es,
      type: "website",
      locale: locale === 'en' ? 'en_US' : 'es_MX',
      url: `https://www.oronacional.com/${locale}`,
      siteName: 'Oro Nacional',
      images: [
        {
          url: '/logos/logo-oro-nacional.png',
          width: 1200,
          height: 630,
          alt: 'Oro Nacional - Joyería Elegante en Jalisco',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: titles[locale as 'es' | 'en'] || titles.es,
      description: descriptions[locale as 'es' | 'en'] || descriptions.es,
      images: ['/logos/logo-oro-nacional.png'],
      creator: '@OroNacional',
      site: '@OroNacional',
    },
    alternates: {
      canonical: `/${locale}`,
      languages: {
        'es-MX': '/es',
        'en-US': '/en',
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as 'es' | 'en')) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
