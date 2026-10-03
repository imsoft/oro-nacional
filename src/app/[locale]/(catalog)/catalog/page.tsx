"use client";

import { useState, useEffect, useMemo } from "react";
import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";
import CatalogHeader from "@/components/catalog/catalog-header";
import CatalogFilters, { type CatalogFiltersState, type CategoryOption } from "@/components/catalog/catalog-filters";
import ProductsGrid from "@/components/catalog/products-grid";
import {
  getListingPrice,
  getPriceSliderMax,
  getPrimaryImageUrl,
  useProductPriceLabel,
} from "@/components/catalog/product-display";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Loader2 } from "lucide-react";
import { getProducts } from "@/lib/supabase/products";
import { getCategories } from "@/lib/supabase/products-multilingual";
import type { Product } from "@/types/product";
import { useCurrency } from "@/contexts/currency-context";

const CatalogPage = () => {
  const t = useTranslations('catalog');
  const tProduct = useTranslations('product');
  const searchParams = useSearchParams();
  const locale = useLocale() as 'es' | 'en';
  const getPriceLabel = useProductPriceLabel();
  // Recalcular los precios mostrados cuando cambia la moneda o la tasa de cambio
  const { currency, exchangeRate } = useCurrency();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<string>("featured");
  // Slug de categoría en el otro idioma -> slug en el idioma actual
  const [slugAliases, setSlugAliases] = useState<Record<string, string>>({});

  // Obtener categoría de la URL si existe
  const categoryFromUrl = searchParams?.get('category') || null;

  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    categoryFromUrl ? [categoryFromUrl] : []
  );
  // null = sin filtro de precio (rango completo)
  const [priceRange, setPriceRange] = useState<[number, number] | null>(null);

  // Tope del filtro de precio derivado de los productos cargados (MXN)
  const maxPrice = useMemo(
    () => getPriceSliderMax(products.map((p) => getListingPrice(p).mxn)),
    [products]
  );

  const filters: CatalogFiltersState = useMemo(
    () => ({
      // Aceptar el slug de la categoría en cualquiera de los dos idiomas
      categories: selectedCategories.map((slug) => slugAliases[slug] ?? slug),
      priceRange: priceRange ?? [0, maxPrice],
    }),
    [selectedCategories, slugAliases, priceRange, maxPrice]
  );

  const handleFiltersChange = (next: CatalogFiltersState) => {
    setSelectedCategories(next.categories);
    setPriceRange(
      next.priceRange[0] <= 0 && next.priceRange[1] >= maxPrice ? null : next.priceRange
    );
  };

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      setIsLoading(true);
      const otherLocale = locale === 'es' ? 'en' : 'es';
      try {
        const [productsData, categoriesData, otherCategoriesData] = await Promise.all([
          getProducts(locale),
          getCategories(locale),
          getCategories(otherLocale),
        ]);
        if (cancelled) return;

        setProducts(productsData);

        // Transformar las categorías al formato esperado por el componente de filtros
        const formattedCategories: CategoryOption[] = categoriesData.map((cat) => ({
          id: cat.id as string,
          slug: cat.slug as string,
          name: cat.name as string,
        }));
        setCategories(formattedCategories);

        const aliases: Record<string, string> = {};
        otherCategoriesData.forEach((other) => {
          const match = formattedCategories.find((cat) => cat.id === other.id);
          const otherSlug = other.slug as string;
          if (match && otherSlug && otherSlug !== match.slug) {
            aliases[otherSlug] = match.slug;
          }
        });
        setSlugAliases(aliases);
      } catch (error) {
        console.error("Error loading catalog:", error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadData();
    return () => {
      cancelled = true;
    };
  }, [locale]);

  // Actualizar filtros cuando cambia la categoría en la URL
  const [lastUrlCategory, setLastUrlCategory] = useState(categoryFromUrl);
  if (categoryFromUrl !== lastUrlCategory) {
    setLastUrlCategory(categoryFromUrl);
    if (categoryFromUrl) {
      setSelectedCategories([categoryFromUrl]);
    }
  }

  // Filtrar, ordenar y agrupar productos por categoría
  const productsByCategory = useMemo(() => {
    let filtered = products.map((product) => {
      return {
        id: product.id,
        name: product.name,
        description: product.description ?? "",
        price: getListingPrice(product).mxn,
        priceFormatted: getPriceLabel(product),
        image: getPrimaryImageUrl(product.images),
        category: product.category?.name || tProduct("uncategorized"),
        categorySlug: product.category?.slug || "",
        categoryId: product.category?.id || "",
        material: product.material || "",
        slug: product.slug,
      };
    });

    // Filtrar por búsqueda
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name?.toLowerCase().includes(search) ||
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

    // Agrupar productos por categoría
    const grouped = filtered.reduce((acc, product) => {
      const categoryName = product.category;
      const categorySlug = product.categorySlug || "sin-categoria";
      const categoryId = product.categoryId || "sin-categoria";

      if (!acc[categoryId]) {
        acc[categoryId] = {
          id: categoryId,
          name: categoryName,
          slug: categorySlug,
          products: [],
        };
      }

      acc[categoryId].products.push({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.priceFormatted,
        priceValue: product.price, // Guardar el valor numérico para ordenar
        image: product.image,
        category: product.category,
        material: product.material,
        slug: product.slug,
      });

      return acc;
    }, {} as Record<string, { id: string; name: string; slug: string; products: Array<{
      id: string;
      name: string;
      description: string;
      price: string;
      priceValue: number;
      image: string;
      category: string;
      material: string;
      slug: string;
    }> }>);

    // Ordenar productos dentro de cada categoría
    Object.values(grouped).forEach((category) => {
      category.products.sort((a, b) => {
        switch (sortBy) {
          case "price-asc":
            return a.priceValue - b.priceValue;
          case "price-desc":
            return b.priceValue - a.priceValue;
          case "name":
            return a.name.localeCompare(b.name);
          case "newest":
            // Los productos ya vienen ordenados por fecha de creación (más recientes primero)
            return 0;
          case "featured":
          default:
            // Mantener orden original (destacados primero)
            return 0;
        }
      });
    });

    // Ordenar categorías según el display_order definido en el admin
    const categoryOrder = categories.map((c) => c.id);
    return Object.values(grouped).sort((a, b) => {
      const idxA = categoryOrder.indexOf(a.id);
      const idxB = categoryOrder.indexOf(b.id);
      if (idxA === -1 && idxB === -1) return a.name.localeCompare(b.name);
      if (idxA === -1) return 1;
      if (idxB === -1) return -1;
      return idxA - idxB;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, categories, filters, searchTerm, sortBy, currency, exchangeRate, tProduct]);

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
          totalProducts={productsByCategory.reduce((sum, cat) => sum + cat.products.length, 0)}
          onToggleMobileFilters={() => setMobileFiltersOpen(true)}
          onSearch={setSearchTerm}
          onSort={setSortBy}
        />

        <div className="mt-8 lg:mt-12 flex flex-col lg:flex-row gap-8">
          {/* Filtros laterales - Desktop */}
          <div className="hidden lg:block">
            <CatalogFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              categories={categories}
              maxPrice={maxPrice}
            />
          </div>

          {/* Filtros laterales - Mobile */}
          <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
            <SheetContent side="left" className="w-[300px] overflow-y-auto">
              <div className="py-6">
                <h2 className="text-lg font-semibold mb-6">{t('filters')}</h2>
                <CatalogFilters
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  categories={categories}
                  maxPrice={maxPrice}
                />
              </div>
            </SheetContent>
          </Sheet>

          {/* Productos agrupados por categoría */}
          <div className="flex-1">
            {productsByCategory.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {t("noProductsFound")}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {t("adjustFilters")}
                </p>
              </div>
            ) : (
              <div className="space-y-12">
                {productsByCategory.map((category) => (
                  <div key={category.id} className="space-y-6">
                    <div className="border-b border-border pb-4">
                      <h2 className="text-2xl font-bold text-foreground">
                        {category.name}
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        {category.products.length} {category.products.length === 1 ? t("product") : t("products")}
                      </p>
                    </div>
                    <ProductsGrid products={category.products} viewMode={viewMode} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CatalogPage;
