import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { CurrencyProvider } from '@/contexts/currency-context';
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { ogLocale } from "@/lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
      locale: ogLocale(locale),
      siteName: 'Oro Nacional',
      images: [
        {
          url: '/logos/logo-oro-nacional.png',
          width: 1200,
          height: 630,
          alt: locale === 'en'
            ? 'Oro Nacional - Elegant Jewelry in Jalisco'
            : 'Oro Nacional - Joyería Elegante en Jalisco',
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
    // Sin `alternates` ni `openGraph.url`: los heredaría cada ruta hija y
    // todas declararían el inicio como canonical. Cada ruta define los suyos
    // con buildAlternates() de src/lib/seo.ts (el inicio en [locale]/page.tsx).
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
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/* Favicon */}
        <link rel="icon" href="/favicon.png" sizes="32x32" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

        {/* Preconnect para recursos críticos */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.google-analytics.com" />

        {/* DNS Prefetch para recursos externos */}
        <link rel="dns-prefetch" href="https://vercel.live" />
        <link rel="dns-prefetch" href="https://vitals.vercel-insights.com" />

        {/* Preconnect para Supabase */}
        <link rel="preconnect" href={process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xrcbrkgihksnzkntupxe.supabase.co'} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <GoogleAnalytics />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          forcedTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <NextIntlClientProvider messages={messages}>
            <CurrencyProvider>
              {children}
            </CurrencyProvider>
          </NextIntlClientProvider>
          <Toaster />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
