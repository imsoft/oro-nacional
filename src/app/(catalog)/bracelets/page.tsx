"use client";

import { useState } from "react";
import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";
import CatalogHeader from "@/components/catalog/catalog-header";
import CategoryFilters from "@/components/catalog/category-filters";
import ProductsGrid from "@/components/catalog/products-grid";
import { Sheet, SheetContent } from "@/components/ui/sheet";

const pulserasProducts = [
  {
    id: 4,
    name: "Pulsera Tenis de Diamantes",
    description: "Pulsera de oro blanco 18k con diamantes engastados",
    price: "$25,500 MXN",
    image:
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    category: "Pulseras de Oro",
    material: "Oro Blanco",
  },
  {
    id: 8,
    name: "Pulsera Eslabón Personalizada",
    description: "Pulsera de oro amarillo 18k con opción de grabado",
    price: "$11,200 MXN",
    image:
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    category: "Pulseras de Oro",
    material: "Oro 18k",
  },
  {
    id: 21,
    name: "Brazalete Bangle Grueso",
    description: "Brazalete rígido de oro amarillo 14k acabado martillado",
    price: "$14,800 MXN",
    image:
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    category: "Pulseras de Oro",
    material: "Oro 14k",
  },
  {
    id: 22,
    name: "Pulsera de Charms Personalizable",
    description: "Pulsera de oro rosa 14k con charms intercambiables",
    price: "$8,900 MXN",
    image:
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    category: "Pulseras de Oro",
    material: "Oro Rosa",
  },
  {
    id: 23,
    name: "Pulsera Cadena Delgada",
    description: "Pulsera delicada de oro blanco 18k diseño minimalista",
    price: "$6,500 MXN",
    image:
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    category: "Pulseras de Oro",
    material: "Oro Blanco",
  },
  {
    id: 24,
    name: "Brazalete Abierto con Diamantes",
    description: "Brazalete abierto de oro 18k con diamantes en los extremos",
    price: "$19,200 MXN",
    image:
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    category: "Pulseras de Oro",
    material: "Oro 18k",
  },
];

const PulserasPage = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero de categoría */}
      <section className="relative bg-gradient-to-b from-muted/50 to-background py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Pulseras de Oro en Guadalajara
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Descubre pulseras y brazaletes de oro 14k y 18k. Desde elegantes
              pulseras tenis hasta brazaletes personalizados. Joyería artesanal
              jalisciense con la más alta calidad y certificado de autenticidad.
            </p>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-6 lg:px-8 py-12 lg:py-16">
        <CatalogHeader
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          totalProducts={pulserasProducts.length}
          onToggleMobileFilters={() => setMobileFiltersOpen(true)}
        />

        <div className="mt-8 lg:mt-12 flex flex-col lg:flex-row gap-8">
          <div className="hidden lg:block">
            <CategoryFilters category="pulseras" />
          </div>

          <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
            <SheetContent side="left" className="w-[300px] overflow-y-auto">
              <div className="py-6">
                <h2 className="text-lg font-semibold mb-6">Filtros</h2>
                <CategoryFilters category="pulseras" />
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex-1">
            <ProductsGrid products={pulserasProducts} viewMode={viewMode} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PulserasPage;
