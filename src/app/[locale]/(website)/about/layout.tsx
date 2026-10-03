import type { Metadata } from "next";
import { buildAlternates, localizedUrl, ogLocale, toSiteLocale } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = toSiteLocale((await params).locale);

  const content = {
    es: {
      title: "Nosotros - Joyería Artesanal de Guadalajara | Oro Nacional",
      description:
        "Conoce la historia de Oro Nacional, joyería artesanal en Guadalajara con más de 30 años de experiencia. Maestros joyeros, proceso artesanal y certificaciones de calidad. Tradición jalisciense desde 1990.",
      keywords:
        "joyería artesanal Guadalajara, maestros joyeros Jalisco, historia Oro Nacional, joyería tradicional mexicana, taller joyería Guadalajara",
      ogTitle: "Nosotros - Oro Nacional Guadalajara",
      ogDescription:
        "Más de 30 años de tradición artesanal jalisciense. Conoce nuestra historia, maestros joyeros y proceso artesanal.",
    },
    en: {
      title: "About Us - Artisan Jewelry from Guadalajara | Oro Nacional",
      description:
        "Discover the story of Oro Nacional, artisan jewelry in Guadalajara with over 30 years of experience. Master jewelers, artisan process and quality certifications. Jalisco tradition since 1990.",
      keywords:
        "artisan jewelry Guadalajara, master jewelers Jalisco, Oro Nacional history, traditional Mexican jewelry, jewelry workshop Guadalajara",
      ogTitle: "About Us - Oro Nacional Guadalajara",
      ogDescription:
        "Over 30 years of Jalisco artisan tradition. Discover our story, master jewelers and artisan process.",
    },
  }[locale];

  return {
    title: content.title,
    description: content.description,
    keywords: content.keywords,
    openGraph: {
      title: content.ogTitle,
      description: content.ogDescription,
      type: "website",
      locale: ogLocale(locale),
      url: localizedUrl("/about", locale),
      siteName: "Oro Nacional",
    },
    alternates: buildAlternates("/about", locale),
  };
}

export default function NosotrosLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
