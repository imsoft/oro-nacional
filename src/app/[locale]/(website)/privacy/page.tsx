import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";
import { buildAlternates, localizedUrl, ogLocale, toSiteLocale } from "@/lib/seo";
import { SITE_CONTACT } from "@/lib/site-contact";

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const locale = toSiteLocale((await params).locale);

  const content = {
    es: {
      title: "Política de Privacidad - Oro Nacional",
      description:
        "Política de privacidad y protección de datos personales de Oro Nacional S.A. de C.V.",
    },
    en: {
      title: "Privacy Policy - Oro Nacional",
      description:
        "Privacy and personal data protection policy of Oro Nacional S.A. de C.V.",
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
      url: localizedUrl("/privacy", locale),
      siteName: "Oro Nacional",
    },
    alternates: buildAlternates("/privacy", locale),
  };
}

const PrivacyPage = async ({ params }: { params: Params }) => {
  const locale = toSiteLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: "privacy" });

  const list = (key: string) => t.raw(key) as string[];
  const email = (chunks: React.ReactNode) => (
    <a href={SITE_CONTACT.emailHref} className="text-[#D4AF37] hover:underline">
      {chunks}
    </a>
  );

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
              {t("s1Text")}
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
              {list("s2Items").map((item) => (
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

            <div className="mb-6">
              <h4 className="text-lg font-semibold text-foreground mb-3">
                {t("s3PrimaryTitle")}
              </h4>
              <ol className="list-decimal list-inside text-muted-foreground space-y-2 ml-4">
                {list("s3PrimaryItems").map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            </div>

            <div className="mb-6">
              <h4 className="text-lg font-semibold text-foreground mb-3">
                {t("s3SecondaryTitle")}
              </h4>
              <ol className="list-decimal list-inside text-muted-foreground space-y-2 ml-4">
                {list("s3SecondaryItems").map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            </div>

            <p className="text-muted-foreground leading-relaxed mt-4">
              {t.rich("s3OptOut", { email })}
            </p>
          </section>

          <section className="border-b border-border pb-8">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              {t("s4Title")}
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {t("s4Intro")}
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              {list("s4Items").map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              {t("s4Note")}
            </p>
          </section>

          <section className="border-b border-border pb-8">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              {t("s5Title")}
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {t("s5Intro")}
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              {list("s5Rights").map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              {t.rich("s5Request", { email })}
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mt-2">
              {list("s5Requirements").map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              {t("s5Deadline")}
            </p>
          </section>

          {/* Destino del enlace "Política de cookies" del footer (/privacy#cookies) */}
          <section id="cookies" className="border-b border-border pb-8 scroll-mt-32">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              {t("s6Title")}
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {t("s6Text1")}
            </p>
            <p className="text-muted-foreground leading-relaxed">
              {t("s6Text2")}
            </p>
          </section>

          <section className="border-b border-border pb-8">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              {t("s7Title")}
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              {t("s7Text")}
            </p>
          </section>

          <section className="border-b border-border pb-8">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              {t("s8Title")}
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {t("s8Text1")}
            </p>
            <p className="text-muted-foreground leading-relaxed">
              {t("s8Text2")}
            </p>
          </section>

          <section className="border-b border-border pb-8">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              {t("s9Title")}
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {t("s9Text1")}
            </p>
            <p className="text-muted-foreground leading-relaxed">
              {t("s9Text2")}
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

export default PrivacyPage;
