import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nosotros - Joyería Artesanal de Guadalajara | Oro Nacional",
  description:
    "Conoce la historia de Oro Nacional, joyería artesanal en Guadalajara con más de 30 años de experiencia. Maestros joyeros, proceso artesanal y certificaciones de calidad. Tradición jalisciense desde 1990.",
  keywords:
    "joyería artesanal Guadalajara, maestros joyeros Jalisco, historia Oro Nacional, joyería tradicional mexicana, taller joyería Guadalajara",
  openGraph: {
    title: "Nosotros - Oro Nacional Guadalajara",
    description:
      "Más de 30 años de tradición artesanal jalisciense. Conoce nuestra historia, maestros joyeros y proceso artesanal.",
    type: "website",
    locale: "es_MX",
  },
};

export default function NosotrosLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
