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
      title: "Cuidado de Joyería de Oro | Oro Nacional Guadalajara",
      description:
        "Guía completa para cuidar tu joyería de oro. Consejos de limpieza, almacenamiento y mantenimiento. Mantén tus joyas como nuevas - Oro Nacional Guadalajara.",
    },
    en: {
      title: "Gold Jewelry Care | Oro Nacional Guadalajara",
      description:
        "Complete guide to caring for your gold jewelry. Cleaning, storage and maintenance tips. Keep your jewelry looking like new - Oro Nacional Guadalajara.",
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
      url: localizedUrl("/care", locale),
      siteName: "Oro Nacional",
    },
    alternates: buildAlternates("/care", locale),
  };
}

export default function CuidadosLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
