"use client";

import { useEffect, useState } from "react";
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import Navbar from "@/components/shared/navbar";
import HeroCarousel from "@/components/shared/hero-carousel";
import { Button } from "@/components/ui/button";
import { getActiveHeroImages } from "@/lib/supabase/hero-images";
import type { HeroImage } from "@/lib/supabase/hero-images";

const HeroSection = () => {
  const t = useTranslations('hero');
  const [heroImages, setHeroImages] = useState<HeroImage[]>([]);

  useEffect(() => {
    const loadHeroImages = async () => {
      const images = await getActiveHeroImages();
      setHeroImages(images);
    };
    loadHeroImages();
  }, []);

  return (
    <>
      <div className="bg-background min-h-screen flex flex-col">
        <Navbar />

        <div className="relative isolate overflow-hidden flex-1 flex items-center">
          <HeroCarousel images={heroImages} imageAlt={t('imageAlt')} />
          <div
            aria-hidden="true"
            className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
          >
            <div
              style={{
                clipPath:
                  "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
              }}
              className="relative left-[calc(50%-11rem)] aspect-1155/678 w-144.5 -translate-x-1/2 rotate-30 bg-linear-to-tr from-[#FFD700] to-[#FFA500] opacity-15 sm:left-[calc(50%-30rem)] sm:w-288.75 animate-[pulse_4s_ease-in-out_infinite]"
            />
          </div>
          <div className="mx-auto max-w-7xl px-6 lg:px-8 w-full">
            <div className="mx-auto max-w-3xl py-12 sm:py-16 lg:py-20">
              <div className="hidden sm:mb-8 sm:flex sm:justify-center animate-[fade-in-down_1s_ease-out]">
                <div className="relative rounded-full px-3 py-1 text-sm/6 text-muted-foreground ring-1 ring-border hover:ring-border/80 transition-all duration-300 hover:scale-105">
                  {t('badge')}{" "}
                  <Link
                    href="#"
                    className="font-semibold text-[#D4AF37] hover:text-[#B8941E]"
                  >
                    <span aria-hidden="true" className="absolute inset-0" />
                    {t('badgeLink')} <span aria-hidden="true">&rarr;</span>
                  </Link>
                </div>
              </div>
              <div className="text-center">
                <h1 className="text-5xl font-semibold tracking-tight text-balance text-foreground sm:text-7xl animate-[fade-in-up_1s_ease-out_0.2s_both]">
                  {t('title')}
                </h1>
                <p className="mt-8 text-lg font-medium text-pretty text-muted-foreground sm:text-xl/8 animate-[fade-in-up_1s_ease-out_0.4s_both]">
                  {t('description')}
                </p>
                <div className="mt-10 flex items-center justify-center gap-x-6 animate-[fade-in-up_1s_ease-out_0.6s_both]">
                  <Button asChild size="lg" className="bg-[#D4AF37] hover:bg-[#B8941E] text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl">
                    <Link href="/catalog">{t('ctaPrimary')}</Link>
                  </Button>
                  <Link
                    href="/catalog"
                    className="text-sm/6 font-semibold text-foreground transition-all duration-300 hover:scale-105 hover:text-[#D4AF37]"
                  >
                    {t('ctaSecondary')} <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
          >
            <div
              style={{
                clipPath:
                  "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
              }}
              className="relative left-[calc(50%+3rem)] aspect-1155/678 w-144.5 -translate-x-1/2 bg-linear-to-tr from-[#FFA500] to-[#FFD700] opacity-15 sm:left-[calc(50%+36rem)] sm:w-288.75 animate-[pulse_4s_ease-in-out_infinite_2s]"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default HeroSection;
