import type { Metadata } from "next";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.oronacional.com';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: 'es' | 'en' }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const titles = {
    es: "Anillos de Oro en Guadalajara - Compromiso y Matrimonio | Oro Nacional",
    en: "Gold Rings in Guadalajara - Engagement and Wedding | Oro Nacional",
  };

  const descriptions = {
    es: "Anillos de oro 14k y 18k en Guadalajara, Jalisco. Anillos de compromiso, matrimonio, solitarios y eternidad. Diseños artesanales con diamantes y piedras preciosas. Envíos a toda la República Mexicana.",
    en: "14k and 18k gold rings in Guadalajara, Jalisco. Engagement rings, wedding rings, solitaires and eternity rings. Artisan designs with diamonds and precious stones. Shipping throughout Mexico.",
  };

  const keywords = {
    es: "anillos de oro Guadalajara, anillos de compromiso Jalisco, argollas matrimonio oro, anillos oro 14k, anillos oro 18k, solitarios diamantes Guadalajara",
    en: "gold rings Guadalajara, engagement rings Jalisco, wedding rings gold, 14k gold rings, 18k gold rings, diamond solitaires Guadalajara",
  };

  const ringsUrl = `${baseUrl}/${locale}/rings`;

  return {
    title: titles[locale],
    description: descriptions[locale],
    keywords: keywords[locale],
    openGraph: {
      title: titles[locale],
      description: descriptions[locale],
      type: "website",
      locale: locale === 'es' ? 'es_MX' : 'en_US',
      url: ringsUrl,
      siteName: 'Oro Nacional',
      images: [
        {
          url: `${baseUrl}/logos/logo-oro-nacional.png`,
          width: 1200,
          height: 630,
          alt: 'Oro Nacional - Anillos de Oro',
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
      canonical: ringsUrl,
      languages: {
        'es-MX': `${baseUrl}/es/rings`,
        'en-US': `${baseUrl}/en/rings`,
      },
    },
  };
}

export default function AnillosLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
