import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pulseras de Oro en Guadalajara - Brazaletes y Tenis | Oro Nacional",
  description:
    "Pulseras y brazaletes de oro 14k y 18k en Guadalajara, Jalisco. Pulseras tenis, eslabón, charms y brazaletes rígidos con diamantes. Joyería artesanal con envíos a toda la República Mexicana.",
  keywords:
    "pulseras de oro Guadalajara, brazaletes oro 14k, pulseras tenis diamantes, pulseras oro 18k Jalisco, brazaletes oro Guadalajara",
  openGraph: {
    title: "Pulseras de Oro en Guadalajara | Oro Nacional",
    description:
      "Pulseras y brazaletes de oro artesanal. Diseños únicos en oro 14k y 18k con certificado de autenticidad.",
    type: "website",
    locale: "es_MX",
  },
};

export default function PulserasLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
