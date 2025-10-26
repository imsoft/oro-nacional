import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog de Joyería | Oro Nacional Guadalajara",
  description:
    "Tendencias en joyería, guías de compra, historia del oro y consejos de estilo. Blog de Oro Nacional - Expertos en joyería fina en Guadalajara, Jalisco.",
};

export default function BlogLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
