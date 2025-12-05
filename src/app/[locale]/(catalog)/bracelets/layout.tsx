import type { Metadata } from "next";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.oronacional.com';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: 'es' | 'en' }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const titles = {
    es: "Pulseras de Oro en Guadalajara - Brazaletes y Tenis | Oro Nacional",
    en: "Gold Bracelets in Guadalajara - Bangles and Tennis | Oro Nacional",
  };

  const descriptions = {
    es: "Pulseras y brazaletes de oro 14k y 18k en Guadalajara, Jalisco. Pulseras tenis, eslabón, charms y brazaletes rígidos con diamantes. Joyería artesanal con envíos a toda la República Mexicana.",
    en: "14k and 18k gold bracelets and bangles in Guadalajara, Jalisco. Tennis bracelets, link bracelets, charm bracelets and rigid bangles with diamonds. Artisan jewelry with shipping throughout Mexico.",
  };

  const keywords = {
    es: "pulseras de oro Guadalajara, brazaletes oro 14k, pulseras tenis diamantes, pulseras oro 18k Jalisco, brazaletes oro Guadalajara",
    en: "gold bracelets Guadalajara, 14k gold bangles, diamond tennis bracelets, 18k gold bracelets Jalisco, gold bangles Guadalajara",
  };

  const braceletsUrl = `${baseUrl}/${locale}/bracelets`;

  return {
    title: titles[locale],
    description: descriptions[locale],
    keywords: keywords[locale],
    openGraph: {
      title: titles[locale],
      description: descriptions[locale],
      type: "website",
      locale: locale === 'es' ? 'es_MX' : 'en_US',
      url: braceletsUrl,
      siteName: 'Oro Nacional',
      images: [
        {
          url: `${baseUrl}/logos/logo-oro-nacional.png`,
          width: 1200,
          height: 630,
          alt: 'Oro Nacional - Pulseras de Oro',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: titles[locale],
      description: descriptions[locale],
      images: [`${baseUrl}/logos/logo-oro-nacional.png`],
    },
    alternates: {
      canonical: braceletsUrl,
      languages: {
        'es-MX': `${baseUrl}/es/bracelets`,
        'en-US': `${baseUrl}/en/bracelets`,
      },
    },
  };
}

export default function PulserasLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
