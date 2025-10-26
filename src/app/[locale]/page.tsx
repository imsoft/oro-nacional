import HeroSection from "@/components/shared/hero-section";
import FeaturedCategories from "@/components/shared/featured-categories";
import FeaturedCollection from "@/components/shared/featured-collection";
import Benefits from "@/components/shared/benefits";
import CallToAction from "@/components/shared/call-to-action";
import Footer from "@/components/shared/footer";

const Home = () => {
  return (
    <>
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
