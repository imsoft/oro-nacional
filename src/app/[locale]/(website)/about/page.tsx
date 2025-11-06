"use client";

import Image from "next/image";
import { useTranslations } from 'next-intl';
import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";
import OurStory from "@/components/about/our-story";
import MasterJewelers from "@/components/about/master-jewelers";
import ArtisanProcess from "@/components/about/artisan-process";
import Certifications from "@/components/about/certifications";

const AboutPage = () => {
  const t = useTranslations('about');
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative isolate overflow-hidden bg-background py-24 sm:py-32 pt-32 sm:pt-44">
        <div className="absolute inset-0 -z-10">
            <Image
              src="https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2832&q=80"
              alt={t("workshopImageAlt")}
              fill
              className="object-cover brightness-[0.3]"
            />
        </div>
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/80 via-black/50 to-black/80" />

        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold text-[#D4AF37] uppercase tracking-wide">
              {t('title')}
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-6xl">
              {t('subtitle')}
            </h1>
            <p className="mt-6 text-lg text-gray-200 leading-relaxed">
              {t('ourStoryText')}
            </p>
          </div>
        </div>

        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-10 -z-10 flex transform-gpu justify-center overflow-hidden blur-3xl"
        >
          <div
            style={{
              clipPath:
                "polygon(73.6% 51.7%, 91.7% 11.8%, 100% 46.4%, 97.4% 82.2%, 92.5% 84.9%, 75.7% 64%, 55.3% 47.5%, 46.5% 49.4%, 45% 62.9%, 50.3% 87.2%, 21.3% 64.1%, 0.1% 100%, 5.4% 51.1%, 21.4% 63.9%, 58.9% 0.2%, 73.6% 51.7%)",
            }}
            className="aspect-1108/632 w-69.25 flex-none bg-linear-to-r from-[#FFD700] to-[#FFA500] opacity-20"
          />
        </div>
      </section>

      {/* Secciones */}
      <OurStory />
      <MasterJewelers />
      <ArtisanProcess />
      <Certifications />

      <Footer />
    </div>
  );
};

export default AboutPage;
