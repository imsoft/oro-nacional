import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contacto - Joyería en Guadalajara | Oro Nacional",
  description:
    "Contacta con Oro Nacional, joyería fina en Guadalajara, Jalisco. Teléfono: +52 33 1234 5678. Dirección: Av. Chapultepec 234, Col. Americana. Diseños personalizados y atención profesional.",
  keywords:
    "contacto joyería Guadalajara, joyería Americana Guadalajara, diseños personalizados oro, teléfono joyería Jalisco, ubicación Oro Nacional",
  openGraph: {
    title: "Contacto - Oro Nacional Guadalajara",
    description:
      "Contáctanos para diseños personalizados, cotizaciones y más información sobre joyería fina de oro.",
    type: "website",
    locale: "es_MX",
  },
};

export default function ContactoLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
