"use client";

import { useTranslations } from "next-intl";
import { Lightbulb, Wrench, Gem, Sparkles, CheckCircle } from "lucide-react";

const ArtisanProcess = () => {
  const t = useTranslations("about");

  const steps = [
    {
      number: "01",
      title: t("step1Title"),
      description: t("step1Description"),
      icon: Lightbulb,
    },
    {
      number: "02",
      title: t("step2Title"),
      description: t("step2Description"),
      icon: Gem,
    },
    {
      number: "03",
      title: t("step3Title"),
      description: t("step3Description"),
      icon: Wrench,
    },
    {
      number: "04",
      title: t("step4Title"),
      description: t("step4Description"),
      icon: Sparkles,
    },
    {
      number: "05",
      title: t("step5Title"),
      description: t("step5Description"),
      icon: CheckCircle,
    },
  ];

  return (
    <section className="py-24 sm:py-32 bg-background">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold text-[#D4AF37] uppercase tracking-wide">
            {t("ourProcess")}
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {t("processTitle")}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {t("processDescription")}
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-4xl">
          <div className="space-y-12">
            {steps.map((step, index) => (
              <div key={step.number} className="relative">
                {/* Línea conectora */}
                {index < steps.length - 1 && (
                  <div className="absolute left-8 top-20 h-full w-0.5 bg-gradient-to-b from-[#D4AF37] to-transparent lg:left-12" />
                )}

                <div className="flex gap-6 lg:gap-8">
                  {/* Número e Icono */}
                  <div className="relative flex-shrink-0">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#D4AF37]/10 lg:h-20 lg:w-20">
                      <step.icon className="h-8 w-8 text-[#D4AF37] lg:h-10 lg:w-10" />
                    </div>
                    <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#D4AF37] text-xs font-bold text-white">
                      {step.number}
                    </div>
                  </div>

                  {/* Contenido */}
                  <div className="flex-1 pb-12">
                    <h3 className="text-xl font-semibold text-foreground lg:text-2xl">
                      {step.title}
                    </h3>
                    <p className="mt-3 text-base text-muted-foreground leading-relaxed lg:text-lg">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Texto de cierre */}
        <div className="mt-16 mx-auto max-w-3xl">
          <div className="rounded-2xl bg-gradient-to-br from-[#D4AF37]/10 to-[#B8941E]/5 p-8 lg:p-12 text-center">
            <p className="text-lg text-foreground font-medium leading-relaxed">
              &quot;{t("quote")}&quot;
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              — {t("quoteAuthor")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ArtisanProcess;
