"use client";

import { useState } from "react";
import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";
import CatalogHeader from "@/components/catalog/catalog-header";
import CatalogFilters from "@/components/catalog/catalog-filters";
import ProductsGrid from "@/components/catalog/products-grid";
import { Sheet, SheetContent } from "@/components/ui/sheet";

// Datos de ejemplo - en producción vendrían de una API o base de datos
const mockProducts = [
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
    id: 9,
    name: "Anillo de Matrimonio Clásico",
    description: "Argolla de matrimonio en oro blanco 14k pulido",
    price: "$5,500 MXN",
    image:
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    category: "Anillos de Oro",
    material: "Oro Blanco",
  },
];

const CatalogoPage = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 lg:px-8 py-12 lg:py-16">
        <CatalogHeader
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          totalProducts={mockProducts.length}
          onToggleMobileFilters={() => setMobileFiltersOpen(true)}
        />

        <div className="mt-8 lg:mt-12 flex flex-col lg:flex-row gap-8">
          {/* Filtros laterales - Desktop */}
          <div className="hidden lg:block">
            <CatalogFilters />
          </div>

          {/* Filtros laterales - Mobile */}
          <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
            <SheetContent side="left" className="w-[300px] overflow-y-auto">
              <div className="py-6">
                <h2 className="text-lg font-semibold mb-6">Filtros</h2>
                <CatalogFilters />
              </div>
            </SheetContent>
          </Sheet>

          {/* Grid de productos */}
          <div className="flex-1">
            <ProductsGrid products={mockProducts} viewMode={viewMode} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CatalogoPage;
