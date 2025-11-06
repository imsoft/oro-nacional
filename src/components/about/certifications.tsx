"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Shield, Award, CheckCircle2, FileCheck, Infinity, Star } from "lucide-react";

const Certifications = () => {
  const t = useTranslations("about");

  const certifications = [
    {
      icon: Shield,
      title: t("cert1Title"),
      description: t("cert1Description"),
    },
    {
      icon: Award,
      title: t("cert2Title"),
      description: t("cert2Description"),
    },
    {
      icon: FileCheck,
      title: t("cert3Title"),
      description: t("cert3Description"),
    },
    {
      icon: Infinity,
      title: t("cert4Title"),
      description: t("cert4Description"),
    },
    {
      icon: Star,
      title: t("cert5Title"),
      description: t("cert5Description"),
    },
    {
      icon: CheckCircle2,
      title: t("cert6Title"),
      description: t("cert6Description"),
    },
  ];

  return (
    <section className="py-24 sm:py-32 bg-muted/30">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold text-[#D4AF37] uppercase tracking-wide">
            {t("qualityGuaranteed")}
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {t("certificationsTitle")}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {t("certificationsDescription")}
          </p>
        </div>

        {/* Grid de certificaciones */}
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {certifications.map((cert) => (
            <div
              key={cert.title}
              className="group relative overflow-hidden rounded-2xl bg-card p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#D4AF37]/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-[#D4AF37]/20">
                <cert.icon className="h-6 w-6 text-[#D4AF37]" />
              </div>
              <h3 className="mt-6 text-lg font-semibold text-foreground">
                {cert.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {cert.description}
              </p>
            </div>
          ))}
        </div>

        {/* Sección de imagen con garantías adicionales */}
        <div className="mt-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
            <Image
              src="https://images.unsplash.com/photo-1611591437281-460bfbe1220a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
              alt={t("certificatesImageAlt")}
              fill
              className="object-cover"
            />
          </div>

          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-foreground">
              {t("excellenceCommitment")}
            </h3>

            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 mt-1">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#D4AF37]/10">
                    <CheckCircle2 className="h-5 w-5 text-[#D4AF37]" />
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    {t("excellence1Title")}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t("excellence1Description")}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 mt-1">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#D4AF37]/10">
                    <CheckCircle2 className="h-5 w-5 text-[#D4AF37]" />
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    {t("excellence2Title")}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t("excellence2Description")}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 mt-1">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#D4AF37]/10">
                    <CheckCircle2 className="h-5 w-5 text-[#D4AF37]" />
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    {t("excellence3Title")}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t("excellence3Description")}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 mt-1">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#D4AF37]/10">
                    <CheckCircle2 className="h-5 w-5 text-[#D4AF37]" />
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    {t("excellence4Title")}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t("excellence4Description")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to action */}
        <div className="mt-16 text-center">
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            {t("certificationsQuestion")}{" "}
            <a
              href="#"
              className="font-semibold text-[#D4AF37] hover:text-[#B8941E] transition-colors"
            >
              {t("contactUs")}
            </a>{" "}
            {t("contactUsText")}
          </p>
        </div>
      </div>
    </section>
  );
};

export default Certifications;
