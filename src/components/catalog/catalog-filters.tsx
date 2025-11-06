"use client";

import { useTranslations } from "next-intl";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

export interface CatalogFiltersState {
  categories: string[];
  materials: string[];
  priceRange: [number, number];
}

interface CatalogFiltersProps {
  filters: CatalogFiltersState;
  onFiltersChange: (filters: CatalogFiltersState) => void;
}

const CatalogFilters = ({ filters, onFiltersChange }: CatalogFiltersProps) => {
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

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    const newCategories = checked
      ? [...filters.categories, categoryId]
      : filters.categories.filter((id) => id !== categoryId);
    
    onFiltersChange({
      ...filters,
      categories: newCategories,
    });
  };

  const handleMaterialChange = (materialId: string, checked: boolean) => {
    const newMaterials = checked
      ? [...filters.materials, materialId]
      : filters.materials.filter((id) => id !== materialId);
    
    onFiltersChange({
      ...filters,
      materials: newMaterials,
    });
  };

  const handlePriceRangeChange = (values: number[]) => {
    onFiltersChange({
      ...filters,
      priceRange: [values[0], values[1]],
    });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      categories: [],
      materials: [],
      priceRange: [0, 50000],
    });
  };

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
          {t("categories")}
        </h3>
        <div className="space-y-3">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox
                id={category.id}
                checked={filters.categories.includes(category.id)}
                onCheckedChange={(checked) =>
                  handleCategoryChange(category.id, checked === true)
                }
              />
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
              <Checkbox
                id={material.id}
                checked={filters.materials.includes(material.id)}
                onCheckedChange={(checked) =>
                  handleMaterialChange(material.id, checked === true)
                }
              />
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
            value={filters.priceRange}
            onValueChange={handlePriceRangeChange}
            max={50000}
            step={1000}
            className="w-full"
          />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{formatPrice(filters.priceRange[0])}</span>
            <span>{formatPrice(filters.priceRange[1])}</span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-card p-6 shadow-sm">
        <Button
          variant="outline"
          onClick={handleClearFilters}
          className="w-full"
        >
          {t("clearFilters")}
        </Button>
      </div>
    </aside>
  );
};

export default CatalogFilters;
