import type { Metadata } from "next";
import { JsonLd, getFAQSchema, getBreadcrumbSchema } from "@/components/seo/json-ld";

type Params = Promise<{
  locale: string;
}>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params;

  const title = locale === 'es'
    ? 'Preguntas Frecuentes | Oro Nacional Guadalajara'
    : 'Frequently Asked Questions | Oro Nacional Guadalajara';

  const description = locale === 'es'
    ? 'Respuestas a preguntas frecuentes sobre joyería de oro en Guadalajara. Compra, envíos, garantía, quilates y más. Oro Nacional - Expertos en joyería fina.'
    : 'Answers to frequently asked questions about gold jewelry in Guadalajara. Purchase, shipping, warranty, karats and more. Oro Nacional - Fine jewelry experts.';

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.oronacional.com';

  return {
    title,
    description,
    keywords: locale === 'es'
      ? 'preguntas frecuentes, FAQ, joyería oro, garantía oro, envíos joyería, quilates oro, Guadalajara'
      : 'frequently asked questions, FAQ, gold jewelry, gold warranty, jewelry shipping, gold karats, Guadalajara',
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${locale}/faq`,
      siteName: 'Oro Nacional',
      locale: locale === 'es' ? 'es_MX' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
    alternates: {
      canonical: `${baseUrl}/${locale}/faq`,
      languages: {
        'es-MX': `${baseUrl}/es/faq`,
        'en-US': `${baseUrl}/en/faq`,
      },
    },
  };
}

export default async function PreguntasFrecuentesLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Params;
}>) {
  const { locale } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.oronacional.com';

  // Generar FAQs para el esquema - usando preguntas hardcodeadas para evitar errores de traducción
  const faqsEs = [
    { question: "¿Qué quilataje tienen las joyas?", answer: "Nuestras joyas están disponibles en oro de 10k, 14k y 18k. El quilataje indica la pureza del oro." },
    { question: "¿Son joyas de oro sólido?", answer: "Sí, todas nuestras piezas son de oro sólido, no bañadas. Cada pieza incluye certificado de autenticidad." },
    { question: "¿Puedo personalizar una joya?", answer: "Sí, ofrecemos servicio de personalización. Contáctanos para discutir tus ideas." },
    { question: "¿Qué métodos de pago aceptan?", answer: "Aceptamos tarjetas de crédito, débito, transferencias bancarias y pagos en efectivo en tienda." },
    { question: "¿Cuánto cuesta el envío?", answer: "El envío es gratuito en compras mayores a $2,000 MXN. Para montos menores, el costo varía según la ubicación." },
    { question: "¿Cuánto tiempo tarda en llegar mi pedido?", answer: "Los envíos dentro de México tardan entre 3 y 7 días hábiles." },
    { question: "¿Puedo devolver un producto?", answer: "Sí, aceptamos devoluciones dentro de los 30 días posteriores a la compra, siempre que la joya esté en perfectas condiciones." },
    { question: "¿Dónde están ubicados?", answer: "Estamos en Guadalajara, Jalisco, México. También vendemos en línea con envíos a toda la República." },
  ];

  const faqsEn = [
    { question: "What karat is the jewelry?", answer: "Our jewelry is available in 10k, 14k and 18k gold. The karat indicates the purity of the gold." },
    { question: "Is it solid gold jewelry?", answer: "Yes, all our pieces are solid gold, not plated. Each piece includes a certificate of authenticity." },
    { question: "Can I customize a piece?", answer: "Yes, we offer customization services. Contact us to discuss your ideas." },
    { question: "What payment methods do you accept?", answer: "We accept credit cards, debit cards, bank transfers and cash payments in store." },
    { question: "How much does shipping cost?", answer: "Shipping is free on purchases over $2,000 MXN. For smaller amounts, the cost varies by location." },
    { question: "How long does it take to receive my order?", answer: "Shipments within Mexico take between 3 and 7 business days." },
    { question: "Can I return a product?", answer: "Yes, we accept returns within 30 days of purchase, as long as the jewelry is in perfect condition." },
    { question: "Where are you located?", answer: "We are in Guadalajara, Jalisco, Mexico. We also sell online with shipping throughout the country." },
  ];

  const allFaqs = locale === 'es' ? faqsEs : faqsEn;

  const breadcrumbItems = [
    { name: locale === 'es' ? 'Inicio' : 'Home', url: `${baseUrl}/${locale}` },
    { name: locale === 'es' ? 'Preguntas Frecuentes' : 'FAQ', url: `${baseUrl}/${locale}/faq` },
  ];

  return (
    <>
      <JsonLd data={getFAQSchema(allFaqs)} />
      <JsonLd data={getBreadcrumbSchema(breadcrumbItems)} />
      {children}
    </>
  );
}
