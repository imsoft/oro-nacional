import type { Metadata } from "next";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.oronacional.com';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: 'es' | 'en' }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const titles = {
    es: "Aretes de Oro en Guadalajara - Argollas y Colgantes | Oro Nacional",
    en: "Gold Earrings in Guadalajara - Hoops and Drops | Oro Nacional",
  };

  const descriptions = {
    es: "Aretes de oro 14k y 18k en Guadalajara, Jalisco. Aretes de argolla, botón, colgantes y ear cuffs con diamantes y perlas. Joyería artesanal con envíos a toda la República Mexicana.",
    en: "14k and 18k gold earrings in Guadalajara, Jalisco. Hoop earrings, studs, drop earrings and ear cuffs with diamonds and pearls. Artisan jewelry with shipping throughout Mexico.",
  };

  const keywords = {
    es: "aretes de oro Guadalajara, aretes oro 14k, argollas oro Jalisco, aretes diamantes Guadalajara, ear cuffs oro, aretes perlas oro",
    en: "gold earrings Guadalajara, 14k gold earrings, gold hoops Jalisco, diamond earrings Guadalajara, gold ear cuffs, pearl gold earrings",
  };

  const earringsUrl = `${baseUrl}/${locale}/earrings`;

  return {
    title: titles[locale],
    description: descriptions[locale],
    keywords: keywords[locale],
    openGraph: {
      title: titles[locale],
      description: descriptions[locale],
      type: "website",
      locale: locale === 'es' ? 'es_MX' : 'en_US',
      url: earringsUrl,
      siteName: 'Oro Nacional',
      images: [
        {
          url: `${baseUrl}/logos/logo-oro-nacional.png`,
          width: 1200,
          height: 630,
          alt: 'Oro Nacional - Aretes de Oro',
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
      canonical: earringsUrl,
      languages: {
        'es-MX': `${baseUrl}/es/earrings`,
        'en-US': `${baseUrl}/en/earrings`,
      },
    },
  };
}

export default function AretesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
