import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Carrito de Compras | Oro Nacional Guadalajara",
  description:
    "Revisa tu carrito de compras en Oro Nacional. Joyería fina de oro con envío seguro gratis a toda la República Mexicana. Métodos de pago flexibles y meses sin intereses.",
  robots: "noindex, nofollow", // No indexar el carrito por privacidad
};

export default function CarritoLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
