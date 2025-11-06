"use client";

import { useState, useEffect } from "react";
import { useTranslations } from 'next-intl';
import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";
import CatalogHeader from "@/components/catalog/catalog-header";
import CatalogFilters from "@/components/catalog/catalog-filters";
import ProductsGrid from "@/components/catalog/products-grid";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Loader2 } from "lucide-react";
import { getProducts } from "@/lib/supabase/products";
import type { Product } from "@/types/product";

const CatalogoPage = () => {
  const t = useTranslations('catalog');
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setIsLoading(true);
    const data = await getProducts();
    setProducts(data);
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
        </div>
        <Footer />
      </div>
    );
  }

  // Transform products for the old format (temporary compatibility)
  const displayProducts = products.map((product) => {
    const primaryImage = product.images?.find((img) => img.is_primary)?.image_url;
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: `$${product.price.toLocaleString("es-MX")} MXN`,
      image: primaryImage || "https://via.placeholder.com/600x600?text=Sin+Imagen",
      category: product.category?.name || "Sin categoría",
      material: product.material,
      slug: product.slug,
    };
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 lg:px-8 py-12 lg:py-16 pt-32 lg:pt-40">
        <CatalogHeader
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          totalProducts={displayProducts.length}
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
                <h2 className="text-lg font-semibold mb-6">{t('filters')}</h2>
                <CatalogFilters />
              </div>
            </SheetContent>
          </Sheet>

          {/* Grid de productos */}
          <div className="flex-1">
            {displayProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {t("noProducts")}
                </p>
              </div>
            ) : (
              <ProductsGrid products={displayProducts} viewMode={viewMode} />
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CatalogoPage;
