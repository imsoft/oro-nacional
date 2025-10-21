import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Collares de Oro en Guadalajara - Cadenas y Dijes | Oro Nacional",
  description:
    "Collares y cadenas de oro 14k y 18k en Guadalajara, Jalisco. Collares con dijes, cadenas cubanas, chokers y collares de perlas. Joyería artesanal con envíos a toda la República Mexicana.",
  keywords:
    "collares de oro Guadalajara, cadenas oro 14k, collares oro 18k, collares con dijes Jalisco, cadenas cubanas oro, chokers oro Guadalajara",
  openGraph: {
    title: "Collares de Oro en Guadalajara | Oro Nacional",
    description:
      "Collares y cadenas de oro artesanales. Diseños únicos en oro 14k y 18k con certificado de autenticidad.",
    type: "website",
    locale: "es_MX",
  },
};

export default function CollaresLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
