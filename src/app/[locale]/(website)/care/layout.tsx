import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cuidado de Joyería de Oro | Oro Nacional Guadalajara",
  description:
    "Guía completa para cuidar tu joyería de oro. Consejos de limpieza, almacenamiento y mantenimiento. Mantén tus joyas como nuevas - Oro Nacional Guadalajara.",
};

export default function CuidadosLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
