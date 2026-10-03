"use client";

import { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Heart, Share2, Loader2 } from "lucide-react";
import { useFavoritesStore } from "@/stores/favorites-store";
import { getProducts } from "@/lib/supabase/products";
import type { Product } from "@/types/product";
import { getPrimaryImageUrl, useProductPriceLabel } from "@/components/catalog/product-display";

interface DisplayProduct {
  id: string;
  name: string;
  description: string;
  price: string;
  category: string;
  material: string;
  image: string;
  slug: string;
}

const FeaturedCollection = () => {
  const t = useTranslations("common");
  const { addFavorite, removeFavorite, isFavorite } = useFavoritesStore();
  const tFeatured = useTranslations("featuredCollection");
  const tProduct = useTranslations("product");
  const locale = useLocale() as "es" | "en";
  const getPriceLabel = useProductPriceLabel();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadProducts = async () => {
      setIsLoading(true);
      try {
        const data = await getProducts(locale);
        // Get first 3 products or featured products
        if (!cancelled) setProducts(data.slice(0, 3));
      } catch (error) {
        console.error("Error loading featured products:", error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadProducts();
    return () => {
      cancelled = true;
    };
  }, [locale]);

  const displayProducts: DisplayProduct[] = products.map((product) => ({
    id: product.id,
    name: product.name,
    description: product.description ?? "",
    price: getPriceLabel(product),
    category: product.category?.name || tFeatured("defaultCategory"),
    material: product.material || tFeatured("defaultMaterial"),
    image: getPrimaryImageUrl(product.images),
    slug: product.slug,
  }));

  const handleToggleFavorite = (product: DisplayProduct, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isFavorite(product.id)) {
      removeFavorite(product.id);
    } else {
      addFavorite({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        material: product.material,
        image: product.image,
        slug: product.slug,
      });
    }
  };

  const handleShare = async (product: DisplayProduct, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const shareData = {
      title: `${product.name} - Oro Nacional`,
      text: [product.description, product.price].filter(Boolean).join(" - "),
      url: `${window.location.origin}${locale === "es" ? "" : `/${locale}`}/product/${product.slug}`,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        toast.success(tProduct("linkCopied"));
      }
    } catch (err) {
      console.log("Error sharing:", err);
    }
  };

  if (isLoading) {
    return (
      <section className="py-24 sm:py-32 bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="h-12 w-12 animate-spin text-[#D4AF37]" />
          </div>
        </div>
      </section>
    );
  }

  if (displayProducts.length === 0) {
    return (
      <section className="py-24 sm:py-32 bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <p className="text-muted-foreground">{tFeatured("empty")}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 sm:py-32 bg-muted/30">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {tFeatured("title")}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {tFeatured("subtitle")}
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {displayProducts.map((product) => (
            <div
              key={product.id}
              className="group relative flex flex-col overflow-hidden rounded-2xl bg-card shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <div className="relative aspect-square overflow-hidden bg-muted">
                <Image
                  alt={`${product.name} - Oro Nacional Guadalajara`}
                  src={product.image}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    onClick={(e) => handleShare(product, e)}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm transition-all duration-300 hover:bg-white hover:scale-110"
                    aria-label={t('shareProduct')}
                  >
                    <Share2 className="h-5 w-5 text-gray-700" />
                  </button>
                  <button
                    onClick={(e) => handleToggleFavorite(product, e)}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm transition-all duration-300 hover:bg-white hover:scale-110"
                    aria-label={isFavorite(product.id) ? t('removeFromFavorites') : t('addToFavorites')}
                  >
                    <Heart
                      className={`h-5 w-5 transition-colors ${
                        isFavorite(product.id) ? "text-red-500 fill-red-500" : "text-gray-700"
                      }`}
                    />
                  </button>
                </div>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="text-xl font-semibold text-foreground">
                  {product.name}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {product.description}
                </p>
                <div className="mt-4 flex items-center justify-end">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-white transition-all duration-300 hover:scale-105"
                  >
                    <Link href={`/product/${product.slug}`}>{t("viewDetails")}</Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 flex justify-center">
          <Button
            asChild
            size="lg"
            variant="default"
            className="bg-[#D4AF37] hover:bg-[#B8941E] text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
          >
            <Link href="/catalog">{tFeatured("viewAll")}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCollection;
