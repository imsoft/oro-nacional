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
      title: "Blog de Joyería | Oro Nacional Guadalajara",
      description:
        "Tendencias en joyería, guías de compra, historia del oro y consejos de estilo. Blog de Oro Nacional - Expertos en joyería fina en Guadalajara, Jalisco.",
    },
    en: {
      title: "Jewelry Blog | Oro Nacional Guadalajara",
      description:
        "Jewelry trends, buying guides, the history of gold and style tips. Oro Nacional blog - Fine jewelry experts in Guadalajara, Jalisco.",
    },
  }[locale];

  return {
    title: content.title,
    description: content.description,
    openGraph: {
      title: content.title,
      description: content.description,
      type: "website",
      locale: ogLocale(locale),
      url: localizedUrl("/blog", locale),
      siteName: "Oro Nacional",
    },
    alternates: buildAlternates("/blog", locale),
  };
}

export default function BlogLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
