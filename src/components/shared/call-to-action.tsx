"use client";

import Image from "next/image";
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Button } from "@/components/ui/button";

const CallToAction = () => {
  const t = useTranslations('cta');

  return (
    <section className="relative isolate overflow-hidden bg-background py-24 sm:py-32">
      <div className="absolute inset-0 -z-10">
        <Image
          alt={t('imageAlt')}
          src="https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2832&q=80"
          fill
          className="object-cover brightness-[0.3]"
        />
      </div>
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/80 via-black/50 to-black/80" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {t('title')}
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-gray-200">
            {t('description')}
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button
              asChild
              size="lg"
              variant="default"
              className="bg-[#D4AF37] hover:bg-[#B8941E] text-white shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            >
              <Link href="/contact">{t('primaryButton')}</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-2 border-white bg-white/5 text-white hover:bg-white hover:text-black transition-all duration-300 hover:scale-105"
            >
              <Link href="/contact">{t('secondaryButton')}</Link>
            </Button>
          </div>
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
  );
};

export default CallToAction;
