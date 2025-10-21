import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Anillos de Oro en Guadalajara - Compromiso y Matrimonio | Oro Nacional",
  description:
    "Anillos de oro 14k y 18k en Guadalajara, Jalisco. Anillos de compromiso, matrimonio, solitarios y eternidad. Diseños artesanales con diamantes y piedras preciosas. Envíos a toda la República Mexicana.",
  keywords:
    "anillos de oro Guadalajara, anillos de compromiso Jalisco, argollas matrimonio oro, anillos oro 14k, anillos oro 18k, solitarios diamantes Guadalajara",
  openGraph: {
    title: "Anillos de Oro en Guadalajara | Oro Nacional",
    description:
      "Anillos de compromiso y matrimonio en oro 14k y 18k. Diseños artesanales con diamantes y certificado de autenticidad.",
    type: "website",
    locale: "es_MX",
  },
};

export default function AnillosLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
