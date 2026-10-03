import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Truck, Package, MapPin, Clock, Shield, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";
import { buildAlternates, localizedUrl, ogLocale, toSiteLocale } from "@/lib/seo";

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const locale = toSiteLocale((await params).locale);

  const content = {
    es: {
      title: "Política de Envíos | Oro Nacional Guadalajara",
      description:
        "Envío gratis, seguro y asegurado a toda la República Mexicana. Conoce los tiempos de entrega, cobertura, rastreo y empaque de tu joyería de oro - Oro Nacional.",
    },
    en: {
      title: "Shipping Policy | Oro Nacional Guadalajara",
      description:
        "Free, secure and insured shipping throughout Mexico. Learn about delivery times, coverage, tracking and packaging for your gold jewelry - Oro Nacional.",
    },
  }[locale];

  return {
    title: content.title,
    description: content.description,
    openGraph: {
      title: content.title,
      description: content.description,
      type: "website",
      locale: ogLocale(locale),
      url: localizedUrl("/shipping", locale),
      siteName: "Oro Nacional",
    },
    alternates: buildAlternates("/shipping", locale),
  };
}

// Nombres propios de los estados (iguales en ambos idiomas)
const coverageStates = [
  "Aguascalientes",
  "Baja California",
  "Baja California Sur",
  "Campeche",
  "Chiapas",
  "Chihuahua",
  "Ciudad de México",
  "Coahuila",
  "Colima",
  "Durango",
  "Estado de México",
  "Guanajuato",
  "Guerrero",
  "Hidalgo",
];

const ShippingPage = async ({ params }: { params: Params }) => {
  const locale = toSiteLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: "shipping" });

  const standardItems = t.raw("standardItems") as string[];
  const expressItems = t.raw("expressItems") as string[];
  const packagingItems = t.raw("packagingItems") as string[];
  const faqItems = t.raw("faqItems") as Array<{ q: string; a: string }>;
  const strong = (chunks: React.ReactNode) => <strong>{chunks}</strong>;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative bg-gradient-to-b from-muted/50 to-background py-16 lg:py-20 pt-32 lg:pt-40">
        <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#D4AF37]/10 mb-6">
            <Truck className="h-8 w-8 text-[#D4AF37]" />
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </div>
      </section>

      {/* Contenido principal */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          {/* Envío Gratis */}
          <div className="mb-16">
            <div className="rounded-2xl bg-gradient-to-br from-green-500/10 to-green-600/5 p-8 lg:p-12 border border-green-500/20">
              <div className="flex items-start gap-4 mb-6">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-green-500/10">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-foreground">
                    {t("freeTitle")}
                  </h2>
                  <p className="mt-2 text-muted-foreground">
                    {t("freeDescription")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tiempos de entrega */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-foreground mb-6">
              {t("deliveryTitle")}
            </h2>
            <div className="space-y-4">
              <div className="rounded-lg bg-card p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <Clock className="h-6 w-6 text-[#D4AF37] mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-2">
                      {t("standardTitle")}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {t.rich("standardTime", { strong })}
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {standardItems.map((item) => (
                        <li key={item}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-card p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <Truck className="h-6 w-6 text-[#D4AF37] mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-2">
                      {t("expressTitle")}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {t.rich("expressTime", { strong })}
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {expressItems.map((item) => (
                        <li key={item}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cobertura */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-foreground mb-6">
              {t("coverageTitle")}
            </h2>
            <div className="rounded-lg bg-card p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <MapPin className="h-6 w-6 text-[#D4AF37] mt-1" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-4">
                    {t("coverageDescription")}
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                    {coverageStates.map((state) => (
                      <div key={state}>✓ {state}</div>
                    ))}
                    <div className="font-semibold text-[#D4AF37]">✓ Jalisco</div>
                    <div>✓ {t("coverageOthers")}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Seguridad del envío */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-foreground mb-6">
              {t("securityTitle")}
            </h2>
            <div className="space-y-4">
              <div className="rounded-lg bg-card p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <Shield className="h-6 w-6 text-[#D4AF37] mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-2">
                      {t("insuredTitle")}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {t("insuredDescription")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-card p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <Package className="h-6 w-6 text-[#D4AF37] mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-2">
                      {t("trackingTitle")}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {t("trackingDescription")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Empaque */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-foreground mb-6">
              {t("packagingTitle")}
            </h2>
            <div className="rounded-lg bg-card p-6 shadow-sm">
              <p className="text-sm text-muted-foreground mb-4">
                {t("packagingIntro")}
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {packagingItems.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-[#D4AF37] mt-1">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Preguntas comunes */}
          <div className="rounded-2xl bg-muted/30 p-8">
            <h2 className="text-xl font-semibold text-foreground mb-6">
              {t("faqTitle")}
            </h2>
            <div className="space-y-4">
              {faqItems.map((item) => (
                <div key={item.q}>
                  <h3 className="font-semibold text-foreground mb-1">
                    {item.q}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ShippingPage;
