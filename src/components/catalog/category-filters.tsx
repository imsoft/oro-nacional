"use client";

import { useTranslations } from "next-intl";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

interface CategoryFiltersProps {
  category?: "anillos" | "collares" | "aretes" | "pulseras";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onFilterChange?: (filters: any) => void;
}

const CategoryFilters = ({}: CategoryFiltersProps) => {
  const t = useTranslations("catalog");

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <aside className="w-full lg:w-64 space-y-8">
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
            <span>{formatPrice(0)}</span>
            <span>{formatPrice(50000)}</span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-card p-6 shadow-sm">
        <Button variant="outline" className="w-full">
          {t("clearFilters")}
        </Button>
      </div>
    </aside>
  );
};

export default CategoryFilters;
