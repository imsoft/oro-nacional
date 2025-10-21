"use client";

import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const CatalogFilters = () => {
  const categories = [
    { id: "anillos", label: "Anillos de Oro" },
    { id: "collares", label: "Collares de Oro" },
    { id: "aretes", label: "Aretes de Oro" },
    { id: "pulseras", label: "Pulseras de Oro" },
  ];

  const materials = [
    { id: "oro-14k", label: "Oro 14k" },
    { id: "oro-18k", label: "Oro 18k" },
    { id: "oro-blanco", label: "Oro Blanco" },
    { id: "oro-amarillo", label: "Oro Amarillo" },
    { id: "oro-rosa", label: "Oro Rosa" },
  ];

  return (
    <aside className="w-full lg:w-64 space-y-8">
      <div className="rounded-2xl bg-card p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Categorías
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
          Material
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
          Rango de Precio
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
          Aplicar Filtros
        </button>
        <button className="w-full mt-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-300">
          Limpiar filtros
        </button>
      </div>
    </aside>
  );
};

export default CatalogFilters;
