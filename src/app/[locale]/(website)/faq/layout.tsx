import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { JsonLd, getFAQSchema, getBreadcrumbSchema } from "@/components/seo/json-ld";
import { buildAlternates, localizedUrl, ogLocale, toSiteLocale } from "@/lib/seo";
import { faqCategories } from "./faq-data";

type Params = Promise<{
  locale: string;
}>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const locale = toSiteLocale((await params).locale);

  const title = locale === 'es'
    ? 'Preguntas Frecuentes | Oro Nacional Guadalajara'
    : 'Frequently Asked Questions | Oro Nacional Guadalajara';

  const description = locale === 'es'
    ? 'Respuestas a preguntas frecuentes sobre joyería de oro en Guadalajara. Compra, envíos, garantía, quilates y más. Oro Nacional - Expertos en joyería fina.'
    : 'Answers to frequently asked questions about gold jewelry in Guadalajara. Purchase, shipping, warranty, karats and more. Oro Nacional - Fine jewelry experts.';

  return {
    title,
    description,
    keywords: locale === 'es'
      ? 'preguntas frecuentes, FAQ, joyería oro, garantía oro, envíos joyería, quilates oro, Guadalajara'
      : 'frequently asked questions, FAQ, gold jewelry, gold warranty, jewelry shipping, gold karats, Guadalajara',
    openGraph: {
      title,
      description,
      url: localizedUrl('/faq', locale),
      siteName: 'Oro Nacional',
      locale: ogLocale(locale),
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
    alternates: buildAlternates('/faq', locale),
  };
}

export default async function PreguntasFrecuentesLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Params;
}>) {
  const locale = toSiteLocale((await params).locale);

  // El schema se genera con las mismas preguntas y respuestas que muestra la
  // página (namespace `faq`), para que el JSON-LD coincida con el contenido visible.
  const t = await getTranslations({ locale, namespace: 'faq' });
  const allFaqs = faqCategories.flatMap((category) =>
    category.questions.map((item) => ({
      question: t(`questions.${item.key}.q`),
      answer: t(`questions.${item.key}.a`),
    }))
  );

  const breadcrumbItems = [
    { name: locale === 'es' ? 'Inicio' : 'Home', url: localizedUrl('', locale) },
    { name: locale === 'es' ? 'Preguntas Frecuentes' : 'FAQ', url: localizedUrl('/faq', locale) },
  ];

  return (
    <>
      <JsonLd data={getFAQSchema(allFaqs)} />
      <JsonLd data={getBreadcrumbSchema(breadcrumbItems)} />
      {children}
    </>
  );
}
