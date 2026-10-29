import type { Metadata } from "next";
import { toSiteLocale } from "@/lib/seo";

type Params = Promise<{
  locale: string;
}>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const locale = toSiteLocale((await params).locale);

  return {
    title: locale === 'es'
      ? 'Gracias por tu pago | Oro Nacional'
      : 'Thank you for your payment | Oro Nacional',
    // Página de regreso de Stripe: no debe indexarse
    robots: { index: false, follow: false },
  };
}

export default function PaymentLinkThanksLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
