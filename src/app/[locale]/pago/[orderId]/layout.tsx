import type { Metadata } from "next";

// Página de pago privada de un enlace: no debe indexarse
export const metadata: Metadata = {
  title: "Pago a meses | Oro Nacional",
  robots: { index: false, follow: false },
};

export default function PaymentPageLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
