"use client";

import { useTranslations } from 'next-intl';
import { Shield, Truck, Award, CreditCard } from "lucide-react";

const Benefits = () => {
  const t = useTranslations('benefits');

  const benefits = [
    {
      key: "certified",
      icon: Shield,
    },
    {
      key: "shipping",
      icon: Truck,
    },
    {
      key: "tradition",
      icon: Award,
    },
    {
      key: "financing",
      icon: CreditCard,
    },
  ];

  return (
    <section className="py-24 sm:py-32 bg-background">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {t('title')}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-4">
          {benefits.map((benefit) => (
            <div
              key={benefit.key}
              className="group relative overflow-hidden rounded-2xl bg-card p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#D4AF37]/10 transition-all duration-300 group-hover:scale-110">
                <benefit.icon className="h-6 w-6 text-[#D4AF37]" />
              </div>
              <h3 className="mt-6 text-lg font-semibold text-foreground">
                {t(`${benefit.key}.title`)}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {t(`${benefit.key}.description`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
