"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

const MasterJewelers = () => {
  const t = useTranslations("about");

  const jewelers = [
    {
      name: t("jeweler1Name"),
      role: t("jeweler1Role"),
      experience: t("jeweler1Experience"),
      specialty: t("jeweler1Specialty"),
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      description: t("jeweler1Description"),
    },
    {
      name: t("jeweler2Name"),
      role: t("jeweler2Role"),
      experience: t("jeweler2Experience"),
      specialty: t("jeweler2Specialty"),
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      description: t("jeweler2Description"),
    },
    {
      name: t("jeweler3Name"),
      role: t("jeweler3Role"),
      experience: t("jeweler3Experience"),
      specialty: t("jeweler3Specialty"),
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      description: t("jeweler3Description"),
    },
  ];

  return (
    <section className="py-24 sm:py-32 bg-muted/30">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold text-[#D4AF37] uppercase tracking-wide">
            {t("ourTeam")}
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {t("masterJewelers")}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {t("teamDescription")}
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {jewelers.map((jeweler) => (
            <div
              key={jeweler.name}
              className="group relative overflow-hidden rounded-2xl bg-card shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              {/* Imagen */}
              <div className="relative aspect-square overflow-hidden bg-muted">
                <Image
                  src={jeweler.image}
                  alt={`${jeweler.name} - ${jeweler.role}`}
                  fill
                  className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                {/* Badge de experiencia */}
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center rounded-full bg-[#D4AF37] px-3 py-1 text-xs font-medium text-white">
                    {jeweler.experience}
                  </span>
                </div>
              </div>

              {/* Contenido */}
              <div className="p-6 space-y-3">
                <div>
                  <h3 className="text-xl font-semibold text-foreground">
                    {jeweler.name}
                  </h3>
                  <p className="text-sm font-medium text-[#D4AF37]">
                    {jeweler.role}
                  </p>
                </div>

                <p className="text-sm font-medium text-muted-foreground">
                  {jeweler.specialty}
                </p>

                <p className="text-sm text-muted-foreground leading-relaxed">
                  {jeweler.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Texto adicional */}
        <div className="mt-16 mx-auto max-w-3xl text-center">
          <p className="text-lg text-muted-foreground leading-relaxed">
            {t("teamClosing")}
          </p>
        </div>
      </div>
    </section>
  );
};

export default MasterJewelers;
