"use client";

import { useState } from "react";
import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";
import CatalogHeader from "@/components/catalog/catalog-header";
import CategoryFilters from "@/components/catalog/category-filters";
import ProductsGrid from "@/components/catalog/products-grid";
import { Sheet, SheetContent } from "@/components/ui/sheet";

const anillosProducts = [
  {
    id: 1,
    name: "Anillo de Compromiso Esmeralda",
    description:
      "Anillo de oro 14k con diamantes naturales - Diseño artesanal único",
    price: "$12,500 MXN",
    image:
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    category: "Anillos de Oro",
    material: "Oro 14k",
  },
  {
    id: 5,
    name: "Anillo Solitario Clásico",
    description: "Anillo de compromiso en oro 18k con diamante central",
    price: "$22,000 MXN",
    image:
      "https://images.unsplash.com/photo-1603561596112-0a132b757442?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    category: "Anillos de Oro",
    material: "Oro 18k",
  },
  {
    id: 9,
    name: "Anillo de Matrimonio Clásico",
    description: "Argolla de matrimonio en oro blanco 14k pulido",
    price: "$5,500 MXN",
    image:
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    category: "Anillos de Oro",
    material: "Oro Blanco",
  },
  {
    id: 10,
    name: "Anillo de Eternidad con Diamantes",
    description: "Anillo de oro amarillo 18k con diamantes alrededor",
    price: "$18,900 MXN",
    image:
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    category: "Anillos de Oro",
    material: "Oro Amarillo",
  },
  {
    id: 11,
    name: "Anillo Cocktail con Esmeralda",
    description: "Anillo de oro rosa 14k con esmeralda central y diamantes",
    price: "$28,500 MXN",
    image:
      "https://images.unsplash.com/photo-1603561596112-0a132b757442?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    category: "Anillos de Oro",
    material: "Oro Rosa",
  },
  {
    id: 12,
    name: "Anillo Trilogy Tres Diamantes",
    description: "Anillo de compromiso en oro blanco 18k con tres diamantes",
    price: "$32,000 MXN",
    image:
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    category: "Anillos de Oro",
    material: "Oro 18k",
  },
];

const AnillosPage = () => {
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
              Anillos de Oro en Guadalajara
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Descubre nuestra exclusiva colección de anillos de compromiso,
              matrimonio y diseños únicos en oro 14k y 18k. Joyería artesanal
              jalisciense con certificado de autenticidad.
            </p>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-6 lg:px-8 py-12 lg:py-16">
        <CatalogHeader
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          totalProducts={anillosProducts.length}
          onToggleMobileFilters={() => setMobileFiltersOpen(true)}
        />

        <div className="mt-8 lg:mt-12 flex flex-col lg:flex-row gap-8">
          {/* Filtros laterales - Desktop */}
          <div className="hidden lg:block">
            <CategoryFilters category="anillos" />
          </div>

          {/* Filtros laterales - Mobile */}
          <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
            <SheetContent side="left" className="w-[300px] overflow-y-auto">
              <div className="py-6">
                <h2 className="text-lg font-semibold mb-6">Filtros</h2>
                <CategoryFilters category="anillos" />
              </div>
            </SheetContent>
          </Sheet>

          {/* Grid de productos */}
          <div className="flex-1">
            <ProductsGrid products={anillosProducts} viewMode={viewMode} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AnillosPage;
