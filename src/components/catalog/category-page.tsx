"use client";

import { useState, useEffect, useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";
import CatalogHeader from "@/components/catalog/catalog-header";
import CategoryFilters from "@/components/catalog/category-filters";
import ProductsGrid from "@/components/catalog/products-grid";
import {
  getListingPrice,
  getPriceSliderMax,
  getPrimaryImageUrl,
  useProductPriceLabel,
} from "@/components/catalog/product-display";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Loader2 } from "lucide-react";
import { getProductsByCategory } from "@/lib/supabase/products";
import type { Product } from "@/types/product";

interface CategoryPageProps {
  // Clave de traducción dentro de "catalog" (título y descripción)
  categoryKey: "rings" | "necklaces" | "earrings" | "bracelets";
  // Slug de la categoría en cada idioma
  slugs: { es: string; en: string };
}

const CategoryPage = ({ categoryKey, slugs }: CategoryPageProps) => {
  const t = useTranslations(`catalog.${categoryKey}`);
  const tCommon = useTranslations("catalog");
  const locale = useLocale() as "es" | "en";
  const getPriceLabel = useProductPriceLabel();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<string>("featured");
  // null = sin filtro de precio (rango completo)
  const [priceRange, setPriceRange] = useState<[number, number] | null>(null);

  const categorySlug = slugs[locale] ?? slugs.es;

  useEffect(() => {
    let cancelled = false;

    const loadProducts = async () => {
      setIsLoading(true);
      try {
        const data = await getProductsByCategory(categorySlug, locale);
        if (!cancelled) setProducts(data ?? []);
      } catch (error) {
        // Si la categoría no existe o falla la consulta, mostrar el estado vacío
        console.error("Error loading category products:", error);
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadProducts();
    return () => {
      cancelled = true;
    };
  }, [categorySlug, locale]);

  const maxPrice = useMemo(
    () => getPriceSliderMax(products.map((p) => getListingPrice(p).mxn)),
    [products]
  );
  const activeRange: [number, number] = priceRange ?? [0, maxPrice];

  const displayProducts = (() => {
    const search = searchTerm.trim().toLowerCase();

    const filtered = products
      .map((product) => ({ product, priceValue: getListingPrice(product).mxn }))
      .filter(({ product, priceValue }) => {
        if (
          search &&
          !product.name?.toLowerCase().includes(search) &&
          !product.description?.toLowerCase().includes(search)
        ) {
          return false;
        }
        return priceValue >= activeRange[0] && priceValue <= activeRange[1];
      });

    // "featured" y "newest" conservan el orden original (más recientes primero)
    if (sortBy === "price-asc") filtered.sort((a, b) => a.priceValue - b.priceValue);
    if (sortBy === "price-desc") filtered.sort((a, b) => b.priceValue - a.priceValue);
    if (sortBy === "name") filtered.sort((a, b) => a.product.name.localeCompare(b.product.name));

    return filtered.map(({ product }) => ({
      id: product.id,
      name: product.name,
      description: product.description ?? "",
      price: getPriceLabel(product),
      image: getPrimaryImageUrl(product.images),
      category: product.category?.name || "",
      material: product.material ?? "",
      slug: product.slug,
    }));
  })();

  const filters = (
    <CategoryFilters
      priceRange={activeRange}
      maxPrice={maxPrice}
      onPriceRangeChange={setPriceRange}
      onClear={() => setPriceRange(null)}
    />
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero de categoría */}
      <section className="relative bg-gradient-to-b from-muted/50 to-background py-16 lg:py-20 pt-32 lg:pt-40">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              {t("title")}
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("description")}
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
              onSearch={setSearchTerm}
              onSort={setSortBy}
            />

            <div className="mt-8 lg:mt-12 flex flex-col lg:flex-row gap-8">
              {/* Filtros laterales - Desktop */}
              <div className="hidden lg:block">{filters}</div>

              {/* Filtros laterales - Mobile */}
              <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                <SheetContent side="left" className="w-[300px] overflow-y-auto">
                  <div className="py-6">
                    <h2 className="text-lg font-semibold mb-6">{tCommon("filters")}</h2>
                    {filters}
                  </div>
                </SheetContent>
              </Sheet>

              {/* Grid de productos */}
              <div className="flex-1">
                {products.length === 0 ? (
                  <div className="text-center py-16">
                    <p className="text-muted-foreground">{tCommon("noProductsCategory")}</p>
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

export default CategoryPage;
