"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

const OurStory = () => {
  const t = useTranslations("about");

  return (
    <section className="py-24 sm:py-32 bg-background">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Imagen */}
          <div className="relative">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
              <Image
                src="https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                alt={t("workshopImageAlt")}
                fill
                className="object-cover"
              />
            </div>
            {/* Decoración dorada */}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[#D4AF37]/10 rounded-2xl -z-10" />
            <div className="absolute -top-6 -left-6 w-24 h-24 bg-[#D4AF37]/5 rounded-2xl -z-10" />
          </div>

          {/* Contenido */}
          <div className="space-y-6">
            <div>
              <p className="text-sm font-semibold text-[#D4AF37] uppercase tracking-wide">
                {t("ourStory")}
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {t("ourStoryTitle")}
              </h2>
            </div>

            <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
              <p>{t("ourStoryParagraph1")}</p>
              <p>{t("ourStoryParagraph2")}</p>
              <p>{t("ourStoryParagraph3")}</p>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-border">
              <div>
                <p className="text-3xl font-semibold text-[#D4AF37]">30+</p>
                <p className="mt-1 text-sm text-muted-foreground">{t("yearsExperience")}</p>
              </div>
              <div>
                <p className="text-3xl font-semibold text-[#D4AF37]">10,000+</p>
                <p className="mt-1 text-sm text-muted-foreground">{t("satisfiedCustomers")}</p>
              </div>
              <div>
                <p className="text-3xl font-semibold text-[#D4AF37]">100%</p>
                <p className="mt-1 text-sm text-muted-foreground">{t("artisanMexican")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OurStory;
