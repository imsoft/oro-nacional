"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";
import CatalogHeader from "@/components/catalog/catalog-header";
import CategoryFilters from "@/components/catalog/category-filters";
import ProductsGrid from "@/components/catalog/products-grid";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Loader2 } from "lucide-react";
import { getProductsByCategory } from "@/lib/supabase/products";
import type { Product } from "@/types/product";

const AretesPage = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setIsLoading(true);
    const data = await getProductsByCategory("aretes");
    setProducts(data);
    setIsLoading(false);
  };

  const displayProducts = products.map((product) => {
    const primaryImage = product.images?.find((img) => img.is_primary)?.image_url;
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: `$${product.price.toLocaleString("es-MX")} MXN`,
      image: primaryImage || "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      category: product.category?.name || "Aretes",
      material: product.material,
      slug: product.slug,
    };
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero de categoría */}
      <section className="relative bg-gradient-to-b from-muted/50 to-background py-16 lg:py-20 pt-28 lg:pt-32">
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
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
          </div>
        ) : (
          <>
            <CatalogHeader
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              totalProducts={displayProducts.length}
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
                {displayProducts.length === 0 ? (
                  <div className="text-center py-16">
                    <p className="text-muted-foreground">No hay productos disponibles en esta categoría</p>
                  </div>
                ) : (
                  <ProductsGrid products={displayProducts} viewMode={viewMode} />
                )}
              </div>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default AretesPage;
