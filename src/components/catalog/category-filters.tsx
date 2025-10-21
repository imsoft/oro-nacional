"use client";

import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface CategoryFiltersProps {
  category: "anillos" | "collares" | "aretes" | "pulseras";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onFilterChange?: (filters: any) => void;
}

const CategoryFilters = ({ category }: CategoryFiltersProps) => {
  const categorySpecificFilters = {
    anillos: [
      { id: "compromiso", label: "Anillos de Compromiso" },
      { id: "matrimonio", label: "Anillos de Matrimonio" },
      { id: "solitario", label: "Solitarios" },
      { id: "eternidad", label: "Anillos de Eternidad" },
      { id: "cocktail", label: "Anillos Cocktail" },
    ],
    collares: [
      { id: "cadenas", label: "Cadenas" },
      { id: "dijes", label: "Collares con Dije" },
      { id: "perlas", label: "Collares de Perlas" },
      { id: "choker", label: "Chokers" },
      { id: "largos", label: "Collares Largos" },
    ],
    aretes: [
      { id: "argolla", label: "Aretes de Argolla" },
      { id: "boton", label: "Aretes de Botón" },
      { id: "colgantes", label: "Aretes Colgantes" },
      { id: "ear-cuff", label: "Ear Cuffs" },
      { id: "perlas", label: "Aretes con Perlas" },
    ],
    pulseras: [
      { id: "tenis", label: "Pulseras Tenis" },
      { id: "eslabon", label: "Pulseras de Eslabón" },
      { id: "bangles", label: "Brazaletes (Bangles)" },
      { id: "charm", label: "Pulseras de Charms" },
      { id: "rigidas", label: "Pulseras Rígidas" },
    ],
  };

  const materials = [
    { id: "oro-14k", label: "Oro 14k" },
    { id: "oro-18k", label: "Oro 18k" },
    { id: "oro-blanco", label: "Oro Blanco" },
    { id: "oro-amarillo", label: "Oro Amarillo" },
    { id: "oro-rosa", label: "Oro Rosa" },
  ];

  const stones = [
    { id: "diamantes", label: "Con Diamantes" },
    { id: "perlas", label: "Con Perlas" },
    { id: "esmeraldas", label: "Con Esmeraldas" },
    { id: "rubies", label: "Con Rubíes" },
    { id: "zafiros", label: "Con Zafiros" },
    { id: "sin-piedras", label: "Sin Piedras" },
  ];

  const categoryLabels = {
    anillos: "Tipo de Anillo",
    collares: "Tipo de Collar",
    aretes: "Tipo de Aretes",
    pulseras: "Tipo de Pulsera",
  };

  return (
    <aside className="w-full lg:w-64 space-y-8">
      <div className="rounded-2xl bg-card p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          {categoryLabels[category]}
        </h3>
        <div className="space-y-3">
          {categorySpecificFilters[category].map((item) => (
            <div key={item.id} className="flex items-center space-x-2">
              <Checkbox id={item.id} />
              <Label
                htmlFor={item.id}
                className="text-sm font-normal cursor-pointer"
              >
                {item.label}
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
          Piedras Preciosas
        </h3>
        <div className="space-y-3">
          {stones.map((stone) => (
            <div key={stone.id} className="flex items-center space-x-2">
              <Checkbox id={stone.id} />
              <Label
                htmlFor={stone.id}
                className="text-sm font-normal cursor-pointer"
              >
                {stone.label}
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

export default CategoryFilters;
