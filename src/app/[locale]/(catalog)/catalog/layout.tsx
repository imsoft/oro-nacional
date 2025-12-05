import type { Metadata } from "next";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.oronacional.com';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: 'es' | 'en' }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const titles = {
    es: "Catálogo de Joyería de Oro - Anillos, Collares y Aretes | Oro Nacional Guadalajara",
    en: "Gold Jewelry Catalog - Rings, Necklaces and Earrings | Oro Nacional Guadalajara",
  };

  const descriptions = {
    es: "Explora nuestro catálogo completo de joyería fina de oro en Guadalajara. Anillos de compromiso, collares, aretes y pulseras de oro 14k y 18k. Envíos a toda la República Mexicana.",
    en: "Explore our complete catalog of fine gold jewelry in Guadalajara. Engagement rings, necklaces, earrings and bracelets in 14k and 18k gold. Shipping throughout Mexico.",
  };

  const keywords = {
    es: "catálogo joyería oro, comprar anillos oro Guadalajara, collares oro México, aretes oro 14k, pulseras oro 18k, joyería en línea Jalisco",
    en: "gold jewelry catalog, buy gold rings Guadalajara, gold necklaces Mexico, 14k gold earrings, 18k gold bracelets, online jewelry Jalisco",
  };

  const catalogUrl = `${baseUrl}/${locale}/catalog`;

  return {
    title: titles[locale],
    description: descriptions[locale],
    keywords: keywords[locale],
    openGraph: {
      title: titles[locale],
      description: descriptions[locale],
      type: "website",
      locale: locale === 'es' ? 'es_MX' : 'en_US',
      url: catalogUrl,
      siteName: 'Oro Nacional',
      images: [
        {
          url: `${baseUrl}/logos/logo-oro-nacional.png`,
          width: 1200,
          height: 630,
          alt: 'Oro Nacional - Catálogo de Joyería',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: titles[locale],
      description: descriptions[locale],
      images: [`${baseUrl}/logos/logo-oro-nacional.png`],
      creator: '@OroNacional',
      site: '@OroNacional',
    },
    alternates: {
      canonical: catalogUrl,
      languages: {
        'es-MX': `${baseUrl}/es/catalog`,
        'en-US': `${baseUrl}/en/catalog`,
      },
    },
  };
}

export default function CatalogoLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
