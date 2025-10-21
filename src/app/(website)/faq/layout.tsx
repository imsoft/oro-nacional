import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Preguntas Frecuentes | Oro Nacional Guadalajara",
  description:
    "Respuestas a preguntas frecuentes sobre joyería de oro en Guadalajara. Compra, envíos, garantía, quilates y más. Oro Nacional - Expertos en joyería fina.",
};

export default function PreguntasFrecuentesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
