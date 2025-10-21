import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Catálogo de Joyería de Oro - Anillos, Collares y Aretes | Oro Nacional Guadalajara",
  description:
    "Explora nuestro catálogo completo de joyería fina de oro en Guadalajara. Anillos de compromiso, collares, aretes y pulseras de oro 14k y 18k. Envíos a toda la República Mexicana.",
  keywords:
    "catálogo joyería oro, comprar anillos oro Guadalajara, collares oro México, aretes oro 14k, pulseras oro 18k, joyería en línea Jalisco",
  openGraph: {
    title: "Catálogo de Joyería de Oro | Oro Nacional Guadalajara",
    description:
      "Descubre nuestra colección completa de joyería fina de oro. Anillos, collares, aretes y pulseras artesanales.",
    type: "website",
    locale: "es_MX",
  },
};

export default function CatalogoLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
