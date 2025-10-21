"use client";

import { useState } from "react";
import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";
import CatalogHeader from "@/components/catalog/catalog-header";
import CategoryFilters from "@/components/catalog/category-filters";
import ProductsGrid from "@/components/catalog/products-grid";
import { Sheet, SheetContent } from "@/components/ui/sheet";

const aretesProducts = [
  {
    id: 3,
    name: "Aretes de Oro con Perlas",
    description: "Aretes de oro amarillo con perlas cultivadas AAA",
    price: "$8,750 MXN",
    image:
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    category: "Aretes de Oro",
    material: "Oro Amarillo",
  },
  {
    id: 7,
    name: "Aretes Tipo Argolla Grande",
    description: "Aretes de oro rosa 14k diseño contemporáneo",
    price: "$6,900 MXN",
    image:
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    category: "Aretes de Oro",
    material: "Oro Rosa",
  },
  {
    id: 17,
    name: "Aretes de Botón con Diamantes",
    description: "Aretes de botón en oro blanco 18k con diamantes",
    price: "$11,500 MXN",
    image:
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    category: "Aretes de Oro",
    material: "Oro Blanco",
  },
  {
    id: 18,
    name: "Aretes Colgantes Largos",
    description: "Aretes colgantes de oro amarillo 14k con esmeraldas",
    price: "$16,200 MXN",
    image:
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    category: "Aretes de Oro",
    material: "Oro 14k",
  },
  {
    id: 19,
    name: "Ear Cuffs Modernos",
    description: "Ear cuffs de oro rosa 14k diseño minimalista",
    price: "$5,800 MXN",
    image:
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    category: "Aretes de Oro",
    material: "Oro Rosa",
  },
  {
    id: 20,
    name: "Aretes Argolla Pequeña Clásicos",
    description: "Aretes de argolla en oro 18k acabado pulido",
    price: "$4,200 MXN",
    image:
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    category: "Aretes de Oro",
    material: "Oro 18k",
  },
];

const AretesPage = () => {
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
              Aretes de Oro en Guadalajara
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Encuentra aretes elegantes de oro 14k y 18k. Desde argollas
              clásicas hasta diseños colgantes con diamantes y piedras
              preciosas. Joyería artesanal jalisciense de la más alta calidad.
            </p>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-6 lg:px-8 py-12 lg:py-16">
        <CatalogHeader
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          totalProducts={aretesProducts.length}
          onToggleMobileFilters={() => setMobileFiltersOpen(true)}
        />

        <div className="mt-8 lg:mt-12 flex flex-col lg:flex-row gap-8">
          <div className="hidden lg:block">
            <CategoryFilters category="aretes" />
          </div>

          <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
            <SheetContent side="left" className="w-[300px] overflow-y-auto">
              <div className="py-6">
                <h2 className="text-lg font-semibold mb-6">Filtros</h2>
                <CategoryFilters category="aretes" />
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex-1">
            <ProductsGrid products={aretesProducts} viewMode={viewMode} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AretesPage;
