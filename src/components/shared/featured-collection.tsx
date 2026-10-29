"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { getProducts } from "@/lib/supabase/products";
import type { Product } from "@/types/product";
import ProductCard from "@/components/catalog/product-card";
import {
  getPrimaryImageUrl,
  useProductPriceRangeLabel,
} from "@/components/catalog/product-display";

// Productos que se muestran al inicio y cuántos se agregan en cada carga
const PAGE_SIZE = 12;

const FeaturedCollection = () => {
  const tFeatured = useTranslations("featuredCollection");
  const locale = useLocale() as "es" | "en";
  const getPriceRange = useProductPriceRangeLabel();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadProducts = async () => {
      setIsLoading(true);
      try {
        // Mismo orden por defecto que el catálogo (más recientes primero)
        const data = await getProducts(locale);
        if (!cancelled) {
          setProducts(data);
          setVisibleCount(PAGE_SIZE);
        }
      } catch (error) {
        console.error("Error loading collection products:", error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadProducts();
    return () => {
      cancelled = true;
    };
  }, [locale]);

  const total = products.length;
  const hasMore = visibleCount < total;

  const loadMore = useCallback(() => {
    setVisibleCount((count) => Math.min(count + PAGE_SIZE, total));
  }, [total]);

  // Carga automática al acercarse al final de la cuadrícula; el botón queda como respaldo
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) loadMore();
      },
      { rootMargin: "400px 0px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  const visibleProducts = products.slice(0, visibleCount).map((product) => {
    const priceDisplay = getPriceRange(product);
    return {
      id: product.id,
      name: product.name,
      description: product.description ?? "",
      price: priceDisplay.label,
      priceDisplay,
      category: product.category?.name || tFeatured("defaultCategory"),
      material: product.material || tFeatured("defaultMaterial"),
      image: getPrimaryImageUrl(product.images),
      slug: product.slug,
    };
  });

  if (isLoading) {
    return (
      <section className="py-14 sm:py-20 bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="h-12 w-12 animate-spin text-[#D4AF37]" />
          </div>
        </div>
      </section>
    );
  }

  if (total === 0) {
    return (
      <section className="py-14 sm:py-20 bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <p className="text-muted-foreground">{tFeatured("empty")}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-14 sm:py-20 bg-muted/30">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {tFeatured("title")}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {tFeatured("subtitle")}
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-2xl grid-cols-1 gap-8 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {visibleProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>

        {/* Centinela para la carga automática al hacer scroll */}
        <div ref={sentinelRef} aria-hidden="true" className="h-px" />

        <div className="mt-12 flex flex-col items-center gap-4">
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {tFeatured("showing", { shown: visibleProducts.length, total })}
          </p>

          {hasMore && (
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <Button
                type="button"
                onClick={loadMore}
                size="lg"
                className="bg-[#D4AF37] hover:bg-[#B8941E] text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                {tFeatured("loadMore")}
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-white transition-all duration-300 hover:scale-105"
              >
                <Link href="/catalog">{tFeatured("viewAll")}</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCollection;
