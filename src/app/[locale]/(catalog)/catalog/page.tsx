"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";
import CatalogHeader from "@/components/catalog/catalog-header";
import CatalogFilters, { type CatalogFiltersState, type CategoryOption } from "@/components/catalog/catalog-filters";
import ProductsGrid from "@/components/catalog/products-grid";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Loader2 } from "lucide-react";
import { getProducts } from "@/lib/supabase/products";
import { getCategories } from "@/lib/supabase/products-multilingual";
import type { Product } from "@/types/product";

const CatalogPage = ({ params }: { params: { locale: 'es' | 'en' } }) => {
  const t = useTranslations('catalog');
  const searchParams = useSearchParams();
  const locale = params.locale || 'es';
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<string>("featured");

  // Obtener categoría de la URL si existe
  const categoryFromUrl = searchParams?.get('category') || null;

  const [filters, setFilters] = useState<CatalogFiltersState>({
    categories: categoryFromUrl ? [categoryFromUrl] : [],
    priceRange: [0, 50000],
  });

  useEffect(() => {
    loadData();
  }, [locale]);

  // Actualizar filtros cuando cambia la categoría en la URL
  useEffect(() => {
    if (categoryFromUrl) {
      setFilters(prev => ({
        ...prev,
        categories: [categoryFromUrl],
      }));
    }
  }, [categoryFromUrl]);

  const loadData = async () => {
    setIsLoading(true);
    const [productsData, categoriesData] = await Promise.all([
      getProducts(locale),
      getCategories(locale)
    ]);

    setProducts(productsData);

    // Transformar las categorías al formato esperado por el componente de filtros
    const formattedCategories: CategoryOption[] = categoriesData.map((cat: any) => ({
      id: cat.id,
      slug: cat.slug,
      name: cat.name,
    }));

    setCategories(formattedCategories);
    setIsLoading(false);
  };

  // Filtrar y ordenar productos
  const filteredProducts = useMemo(() => {
    let filtered = products.map((product) => {
      const primaryImage = product.images?.find((img) => img.is_primary)?.image_url;
      return {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        priceFormatted: `$${product.price.toLocaleString("es-MX")} MXN`,
        image: primaryImage || "https://via.placeholder.com/600x600?text=Sin+Imagen",
        category: product.category?.name || "Sin categoría",
        categorySlug: product.category?.slug || "",
        material: product.material || "",
        slug: product.slug,
      };
    });

    // Filtrar por búsqueda
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(search) ||
          product.description?.toLowerCase().includes(search)
      );
    }

    // Filtrar por categorías
    if (filters.categories.length > 0) {
      filtered = filtered.filter((product) => {
        const categorySlug = product.categorySlug;
        return filters.categories.includes(categorySlug);
      });
    }

    // Filtrar por rango de precios
    filtered = filtered.filter(
      (product) =>
        product.price >= filters.priceRange[0] &&
        product.price <= filters.priceRange[1]
    );

    // Ordenar productos
    switch (sortBy) {
      case "price-asc":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "newest":
        // Los productos ya vienen ordenados por fecha de creación (más recientes primero)
        break;
      case "featured":
      default:
        // Mantener orden original (destacados primero)
        break;
    }

    return filtered.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.priceFormatted,
      image: product.image,
      category: product.category,
      material: product.material,
      slug: product.slug,
    }));
  }, [products, filters, searchTerm, sortBy]);

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 lg:px-8 py-12 lg:py-16 pt-32 lg:pt-40">
        <CatalogHeader
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          totalProducts={filteredProducts.length}
          onToggleMobileFilters={() => setMobileFiltersOpen(true)}
          onSearch={setSearchTerm}
          onSort={setSortBy}
        />

        <div className="mt-8 lg:mt-12 flex flex-col lg:flex-row gap-8">
          {/* Filtros laterales - Desktop */}
          <div className="hidden lg:block">
            <CatalogFilters
              filters={filters}
              onFiltersChange={setFilters}
              categories={categories}
            />
          </div>

          {/* Filtros laterales - Mobile */}
          <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
            <SheetContent side="left" className="w-[300px] overflow-y-auto">
              <div className="py-6">
                <h2 className="text-lg font-semibold mb-6">{t('filters')}</h2>
                <CatalogFilters
                  filters={filters}
                  onFiltersChange={setFilters}
                  categories={categories}
                />
              </div>
            </SheetContent>
          </Sheet>

          {/* Grid de productos */}
          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {t("noProductsFound")}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {t("adjustFilters")}
                </p>
              </div>
            ) : (
              <ProductsGrid products={filteredProducts} viewMode={viewMode} />
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CatalogPage;
