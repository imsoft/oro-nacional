import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";
import { buildAlternates, localizedUrl, ogLocale, toSiteLocale } from "@/lib/seo";

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const locale = toSiteLocale((await params).locale);

  const content = {
    es: {
      title: "Aviso Legal y Términos de Uso - Oro Nacional",
      description:
        "Aviso legal y términos de uso del sitio web de Oro Nacional S.A. de C.V.",
    },
    en: {
      title: "Legal Notice and Terms of Use - Oro Nacional",
      description:
        "Legal notice and terms of use of the Oro Nacional S.A. de C.V. website.",
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
      url: localizedUrl("/terms", locale),
      siteName: "Oro Nacional",
    },
    alternates: buildAlternates("/terms", locale),
  };
}

const TermsPage = async ({ params }: { params: Params }) => {
  const locale = toSiteLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: "terms" });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 mx-auto max-w-4xl px-6 lg:px-8 pt-32 pb-24 lg:py-32">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("backHome")}
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Oro Nacional S.A. de C.V.
          </h1>
          <h2 className="text-2xl font-semibold text-foreground">
            {t("heading")}
          </h2>
        </div>

        <div className="prose prose-neutral max-w-none space-y-8">
          <section className="border-b border-border pb-8">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              {t("s1Title")}
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              {t("s1Text1")}
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              {t("s1Text2")}
            </p>
          </section>

          <section className="border-b border-border pb-8">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              {t("s2Title")}
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {t("s2Intro")}
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              {(t.raw("s2Items") as string[]).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              {t("s2Note")}
            </p>
          </section>

          <section className="border-b border-border pb-8">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              {t("s3Title")}
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              {t("s3Text")}
            </p>
          </section>

          <section className="border-b border-border pb-8">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              {t("s4Title")}
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              {t("s4Text1")}
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              {t("s4Text2")}
            </p>
          </section>

          <section className="border-b border-border pb-8">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              {t("s5Title")}
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              {t("s5Text")}
            </p>
          </section>

          <section className="border-b border-border pb-8">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              {t("s6Title")}
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              {t("s6Text")}
            </p>
          </section>

          <section className="mt-12 pt-8 border-t-2 border-border">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                {t("legalRepresentative")}
              </p>
              <p className="text-foreground font-semibold mb-4">
                Oro Nacional S.A. de C.V.
              </p>
              <p className="text-sm text-muted-foreground italic">
                {t("signature")}
              </p>
            </div>
          </section>

          <footer className="mt-12 pt-8 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              {t("copyright")}
            </p>
          </footer>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TermsPage;
