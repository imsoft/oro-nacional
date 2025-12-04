"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Heart, Share2, Loader2 } from "lucide-react";
import { useFavoritesStore } from "@/stores/favorites-store";
import { getProducts } from "@/lib/supabase/products";
import type { Product } from "@/types/product";
import { useCurrency } from "@/contexts/currency-context";

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
  const { convertPrice, formatPrice } = useCurrency();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setIsLoading(true);
    const data = await getProducts();
    // Get first 3 products or featured products
    setProducts(data.slice(0, 3));
    setIsLoading(false);
  };

  const displayProducts: DisplayProduct[] = products.map((product) => {
    const primaryImage = product.images?.find((img) => img.is_primary)?.image_url;
    const priceInCurrency = convertPrice(product.price, product.base_price_usd);
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: formatPrice(priceInCurrency),
      category: product.category?.name || "Joyería",
      material: product.material || "Oro",
      image: primaryImage || "https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      slug: product.slug,
    };
  });

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
      text: `${product.description} - ${product.price}`,
      url: `${window.location.origin}/product/${product.slug}`,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        alert("¡Enlace copiado al portapapeles!");
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
            <p className="text-muted-foreground">No hay productos destacados disponibles en este momento.</p>
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
            Joyería de Oro Destacada - Colección Primavera 2025
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Piezas únicas de joyería fina elaboradas con maestría artesanal jalisciense
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
                    <Link href={`/product/${product.slug}`}>Ver detalles</Link>
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
            <Link href="/catalog">Ver toda la colección de joyería</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCollection;
