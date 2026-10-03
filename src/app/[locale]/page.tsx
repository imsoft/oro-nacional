import HeroSection from "@/components/shared/hero-section";
import FeaturedCategories from "@/components/shared/featured-categories";
import FeaturedCollection from "@/components/shared/featured-collection";
import Benefits from "@/components/shared/benefits";
import CallToAction from "@/components/shared/call-to-action";
import Footer from "@/components/shared/footer";
import { MarketTicker } from "@/components/shared/market-ticker";
import { JsonLd, getOrganizationSchema, getWebsiteSchema, getLocalBusinessSchema } from "@/components/seo/json-ld";
import type { Metadata } from "next";
import { buildAlternates } from "@/lib/seo";

// Canonical + hreflang del inicio (antes se definían en [locale]/layout.tsx y
// los heredaban todas las rutas hijas).
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return { alternates: buildAlternates("", locale) };
}

const Home = async ({ params }: { params: Promise<{ locale: string }> }) => {
  const { locale } = await params;
  const schemaLocale = locale === "en" ? "en" : "es";

  return (
    <>
      {/* SEO - Structured Data */}
      <JsonLd data={getOrganizationSchema(schemaLocale)} />
      <JsonLd data={getWebsiteSchema(schemaLocale)} />
      <JsonLd data={getLocalBusinessSchema(schemaLocale)} />

      <HeroSection />
      
      {/* Cintilla de precios del mercado - Justo debajo del hero */}
      <MarketTicker />

      <FeaturedCategories />
      <FeaturedCollection />
      <Benefits />
      <CallToAction />
      <Footer />
    </>
  );
};

export default Home;
