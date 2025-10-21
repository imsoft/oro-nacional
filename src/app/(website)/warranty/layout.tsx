import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Garantía y Certificados | Oro Nacional Guadalajara",
  description:
    "Garantía de por vida en joyería de oro en Guadalajara. Certificados de autenticidad, quilataje garantizado y servicio postventa. Oro Nacional - Joyería con respaldo.",
};

export default function GarantiaLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
