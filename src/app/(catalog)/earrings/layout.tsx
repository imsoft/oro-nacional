import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aretes de Oro en Guadalajara - Argollas y Colgantes | Oro Nacional",
  description:
    "Aretes de oro 14k y 18k en Guadalajara, Jalisco. Aretes de argolla, botón, colgantes y ear cuffs con diamantes y perlas. Joyería artesanal con envíos a toda la República Mexicana.",
  keywords:
    "aretes de oro Guadalajara, aretes oro 14k, argollas oro Jalisco, aretes diamantes Guadalajara, ear cuffs oro, aretes perlas oro",
  openGraph: {
    title: "Aretes de Oro en Guadalajara | Oro Nacional",
    description:
      "Aretes elegantes de oro artesanal. Diseños en oro 14k y 18k con diamantes y piedras preciosas.",
    type: "website",
    locale: "es_MX",
  },
};

export default function AretesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
