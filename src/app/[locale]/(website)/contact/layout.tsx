import type { Metadata } from "next";
import { buildAlternates, localizedUrl, ogLocale, toSiteLocale } from "@/lib/seo";
import { SITE_CONTACT } from "@/lib/site-contact";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = toSiteLocale((await params).locale);

  const content = {
    es: {
      title: "Contacto - Joyería en Guadalajara | Oro Nacional",
      description: `Contacta con Oro Nacional, joyería fina en Guadalajara, Jalisco. Teléfono: ${SITE_CONTACT.phoneDisplay}. Dirección: ${SITE_CONTACT.streetAddress}. Diseños personalizados y atención profesional.`,
      keywords:
        "contacto joyería Guadalajara, joyería San Juan de Dios, diseños personalizados oro, teléfono joyería Jalisco, ubicación Oro Nacional",
      ogTitle: "Contacto - Oro Nacional Guadalajara",
      ogDescription:
        "Contáctanos para diseños personalizados, cotizaciones y más información sobre joyería fina de oro.",
    },
    en: {
      title: "Contact - Jewelry Store in Guadalajara | Oro Nacional",
      description: `Contact Oro Nacional, fine jewelry in Guadalajara, Jalisco. Phone: ${SITE_CONTACT.phoneDisplay}. Address: ${SITE_CONTACT.streetAddress}. Custom designs and professional service.`,
      keywords:
        "contact jewelry store Guadalajara, San Juan de Dios jewelry, custom gold designs, jewelry store phone Jalisco, Oro Nacional location",
      ogTitle: "Contact - Oro Nacional Guadalajara",
      ogDescription:
        "Contact us for custom designs, quotes and more information about fine gold jewelry.",
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
      url: localizedUrl("/contact", locale),
      siteName: "Oro Nacional",
    },
    alternates: buildAlternates("/contact", locale),
  };
}

export default function ContactoLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
