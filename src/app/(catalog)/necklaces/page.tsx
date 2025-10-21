"use client";

import { useState } from "react";
import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";
import CatalogHeader from "@/components/catalog/catalog-header";
import CategoryFilters from "@/components/catalog/category-filters";
import ProductsGrid from "@/components/catalog/products-grid";
import { Sheet, SheetContent } from "@/components/ui/sheet";

const collaresProducts = [
  {
    id: 2,
    name: "Collar Infinito de Oro Blanco",
    description: "Collar de oro blanco 18k - Elegancia atemporal",
    price: "$18,900 MXN",
    image:
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    category: "Collares de Oro",
    material: "Oro 18k",
  },
  {
    id: 6,
    name: "Collar de Cadena Gruesa",
    description: "Cadena de oro amarillo 14k estilo cubana",
    price: "$15,750 MXN",
    image:
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    category: "Collares de Oro",
    material: "Oro 14k",
  },
  {
    id: 13,
    name: "Collar con Dije de Corazón",
    description: "Collar de oro rosa 14k con dije de corazón y diamantes",
    price: "$9,500 MXN",
    image:
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    category: "Collares de Oro",
    material: "Oro Rosa",
  },
  {
    id: 14,
    name: "Collar de Perlas con Oro",
    description: "Collar de perlas naturales con cierre de oro blanco 18k",
    price: "$24,500 MXN",
    image:
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    category: "Collares de Oro",
    material: "Oro Blanco",
  },
  {
    id: 15,
    name: "Choker de Oro Minimalista",
    description: "Choker ajustable de oro amarillo 14k diseño minimalista",
    price: "$7,800 MXN",
    image:
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    category: "Collares de Oro",
    material: "Oro 14k",
  },
  {
    id: 16,
    name: "Collar Largo con Dije Luna",
    description: "Collar largo de oro 18k con dije de luna y estrellas",
    price: "$13,200 MXN",
    image:
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    category: "Collares de Oro",
    material: "Oro 18k",
  },
];

const CollaresPage = () => {
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
              Collares de Oro en Guadalajara
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Explora nuestra colección de collares y cadenas de oro 14k y 18k.
              Desde elegantes cadenas hasta collares con dijes únicos. Diseños
              artesanales jaliscienses con certificado de autenticidad.
            </p>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-6 lg:px-8 py-12 lg:py-16">
        <CatalogHeader
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          totalProducts={collaresProducts.length}
          onToggleMobileFilters={() => setMobileFiltersOpen(true)}
        />

        <div className="mt-8 lg:mt-12 flex flex-col lg:flex-row gap-8">
          <div className="hidden lg:block">
            <CategoryFilters category="collares" />
          </div>

          <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
            <SheetContent side="left" className="w-[300px] overflow-y-auto">
              <div className="py-6">
                <h2 className="text-lg font-semibold mb-6">Filtros</h2>
                <CategoryFilters category="collares" />
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex-1">
            <ProductsGrid products={collaresProducts} viewMode={viewMode} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CollaresPage;
