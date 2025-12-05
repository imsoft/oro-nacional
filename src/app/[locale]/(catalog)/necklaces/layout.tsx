import type { Metadata } from "next";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.oronacional.com';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: 'es' | 'en' }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const titles = {
    es: "Collares de Oro en Guadalajara - Cadenas y Dijes | Oro Nacional",
    en: "Gold Necklaces in Guadalajara - Chains and Pendants | Oro Nacional",
  };

  const descriptions = {
    es: "Collares y cadenas de oro 14k y 18k en Guadalajara, Jalisco. Collares con dijes, cadenas cubanas, chokers y collares de perlas. Joyería artesanal con envíos a toda la República Mexicana.",
    en: "14k and 18k gold necklaces and chains in Guadalajara, Jalisco. Necklaces with pendants, Cuban chains, chokers and pearl necklaces. Artisan jewelry with shipping throughout Mexico.",
  };

  const keywords = {
    es: "collares de oro Guadalajara, cadenas oro 14k, collares oro 18k, collares con dijes Jalisco, cadenas cubanas oro, chokers oro Guadalajara",
    en: "gold necklaces Guadalajara, 14k gold chains, 18k gold necklaces, necklaces with pendants Jalisco, Cuban gold chains, gold chokers Guadalajara",
  };

  const necklacesUrl = `${baseUrl}/${locale}/necklaces`;

  return {
    title: titles[locale],
    description: descriptions[locale],
    keywords: keywords[locale],
    openGraph: {
      title: titles[locale],
      description: descriptions[locale],
      type: "website",
      locale: locale === 'es' ? 'es_MX' : 'en_US',
      url: necklacesUrl,
      siteName: 'Oro Nacional',
      images: [
        {
          url: `${baseUrl}/logos/logo-oro-nacional.png`,
          width: 1200,
          height: 630,
          alt: 'Oro Nacional - Collares de Oro',
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
      canonical: necklacesUrl,
      languages: {
        'es-MX': `${baseUrl}/es/necklaces`,
        'en-US': `${baseUrl}/en/necklaces`,
      },
    },
  };
}

export default function CollaresLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
