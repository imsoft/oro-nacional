import HeroSection from "@/components/shared/hero-section";
import FeaturedCategories from "@/components/shared/featured-categories";
import FeaturedCollection from "@/components/shared/featured-collection";
import Benefits from "@/components/shared/benefits";
import CallToAction from "@/components/shared/call-to-action";
import Footer from "@/components/shared/footer";
import { JsonLd, getOrganizationSchema, getWebsiteSchema, getLocalBusinessSchema } from "@/components/seo/json-ld";

const Home = () => {
  return (
    <>
      {/* SEO - Structured Data */}
      <JsonLd data={getOrganizationSchema()} />
      <JsonLd data={getWebsiteSchema()} />
      <JsonLd data={getLocalBusinessSchema()} />

      <HeroSection />
      <FeaturedCategories />
      <FeaturedCollection />
      <Benefits />
      <CallToAction />
      <Footer />
    </>
  );
};

export default Home;
