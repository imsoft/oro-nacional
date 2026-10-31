"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { CheckCircle2, Home, Mail, MessageCircle } from "lucide-react";
import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";
import { Button } from "@/components/ui/button";
import { SITE_CONTACT } from "@/lib/site-contact";

/**
 * Página a la que Stripe Checkout regresa al cliente tras pagar un enlace de
 * pago generado desde el panel. El pedido lo marca como pagado el webhook.
 */
const ThanksContent = () => {
  const t = useTranslations("paymentLink");
  const searchParams = useSearchParams();
  // Solo se muestra el número de pedido (formato ORO-YYYYMMDD-XXXX)
  const rawOrder = searchParams.get("order") || "";
  const orderNumber = /^[A-Z0-9-]{1,40}$/i.test(rawOrder) ? rawOrder : "";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-32 lg:pt-40 pb-16 lg:pb-24">
        <div className="mx-auto max-w-2xl px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#D4AF37]/10 mb-6">
            <CheckCircle2 className="h-10 w-10 text-[#D4AF37]" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {t("title")}
          </h1>

          {orderNumber ? (
            <p className="mt-4 text-lg font-medium text-foreground">
              {t("order", { number: orderNumber })}
            </p>
          ) : (
            <p className="mt-4 text-lg text-muted-foreground">{t("noOrder")}</p>
          )}

          <div className="mt-6 flex items-start gap-3 rounded-lg bg-card p-5 text-left shadow-sm">
            <Mail className="mt-0.5 h-5 w-5 shrink-0 text-[#D4AF37]" />
            <p className="text-muted-foreground">{t("notice")}</p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild className="bg-[#D4AF37] text-white hover:bg-[#B8941E]">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                {t("backHome")}
              </Link>
            </Button>
            <Button asChild variant="outline">
              <a
                href={`https://wa.me/${SITE_CONTACT.phoneE164.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                {t("contact")}
              </a>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

// useSearchParams requiere un límite de Suspense para el render estático
const PaymentLinkThanksPage = () => (
  <Suspense fallback={<div className="min-h-screen bg-background" />}>
    <ThanksContent />
  </Suspense>
);

export default PaymentLinkThanksPage;
