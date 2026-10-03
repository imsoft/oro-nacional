"use client";

import { useTranslations } from "next-intl";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/contexts/currency-context";
import { PRICE_SLIDER_STEP } from "@/components/catalog/product-display";

interface CategoryFiltersProps {
  // Rango seleccionado, en MXN
  priceRange: [number, number];
  // Tope del slider, en MXN
  maxPrice: number;
  onPriceRangeChange: (range: [number, number]) => void;
  onClear: () => void;
}

const CategoryFilters = ({
  priceRange,
  maxPrice,
  onPriceRangeChange,
  onClear,
}: CategoryFiltersProps) => {
  const t = useTranslations("catalog");
  const { convertPrice, formatPrice } = useCurrency();

  return (
    <aside className="w-full lg:w-64 space-y-8">
      <div className="rounded-2xl bg-card p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          {t("priceRange")}
        </h3>
        <div className="space-y-4">
          <Slider
            value={priceRange}
            onValueChange={(values) => onPriceRangeChange([values[0], values[1]])}
            max={maxPrice}
            step={PRICE_SLIDER_STEP}
            className="w-full"
          />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{formatPrice(convertPrice(priceRange[0]))}</span>
            <span>{formatPrice(convertPrice(priceRange[1]))}</span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-card p-6 shadow-sm">
        <Button variant="outline" className="w-full" onClick={onClear}>
          {t("clearFilters")}
        </Button>
      </div>
    </aside>
  );
};

export default CategoryFilters;
