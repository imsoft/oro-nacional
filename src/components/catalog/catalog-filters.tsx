"use client";

import { useTranslations } from "next-intl";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const CatalogFilters = () => {
  const t = useTranslations("catalog");

  const categories = [
    { id: "anillos", label: t("categoryRings") },
    { id: "collares", label: t("categoryNecklaces") },
    { id: "aretes", label: t("categoryEarrings") },
    { id: "pulseras", label: t("categoryBracelets") },
  ];

  const materials = [
    { id: "oro-14k", label: t("material14k") },
    { id: "oro-18k", label: t("material18k") },
    { id: "oro-blanco", label: t("materialWhite") },
    { id: "oro-amarillo", label: t("materialYellow") },
    { id: "oro-rosa", label: t("materialRose") },
  ];

  return (
    <aside className="w-full lg:w-64 space-y-8">
      <div className="rounded-2xl bg-card p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          {t("categories")}
        </h3>
        <div className="space-y-3">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox id={category.id} />
              <Label
                htmlFor={category.id}
                className="text-sm font-normal cursor-pointer"
              >
                {category.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-card p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          {t("material")}
        </h3>
        <div className="space-y-3">
          {materials.map((material) => (
            <div key={material.id} className="flex items-center space-x-2">
              <Checkbox id={material.id} />
              <Label
                htmlFor={material.id}
                className="text-sm font-normal cursor-pointer"
              >
                {material.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-card p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          {t("priceRange")}
        </h3>
        <div className="space-y-4">
          <Slider
            defaultValue={[0, 50000]}
            max={50000}
            step={1000}
            className="w-full"
          />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>$0</span>
            <span>$50,000 MXN</span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-card p-6 shadow-sm">
        <button className="w-full bg-[#D4AF37] hover:bg-[#B8941E] text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300">
          {t("applyFilters")}
        </button>
        <button className="w-full mt-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-300">
          {t("clearFilters")}
        </button>
      </div>
    </aside>
  );
};

export default CatalogFilters;
