"use client";

import { Link } from "@/i18n/routing";
import Image from "next/image";
import { useTranslations } from 'next-intl';
import { useFavoritesStore } from "@/stores/favorites-store";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";

const FavoritesPage = () => {
  const t = useTranslations('favorites');
  const { items, removeFavorite } = useFavoritesStore();
  const { addItem } = useCartStore();

  const handleAddToCart = (item: typeof items[0]) => {
    const priceNumber = parseFloat(item.price.replace(/[^0-9.-]+/g, ""));
    addItem({
      id: item.id,
      name: item.name,
      price: priceNumber,
      image: item.image,
      material: item.material,
      slug: item.slug,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="py-12 pt-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-foreground flex items-center gap-2">
            <Heart className="h-8 w-8 text-[#D4AF37]" />
            {t('title')}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {items.length === 0
              ? t('noFavorites')
              : t('itemCount', { count: items.length })}
          </p>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="mx-auto h-24 w-24 text-muted-foreground/20" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">
              {t('noFavorites')}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
              {t('noFavoritesDesc')}
            </p>
            <Button asChild className="mt-6 bg-[#D4AF37] hover:bg-[#B8941E]">
              <Link href="/catalog">{t('exploreCatalog')}</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="group relative flex flex-col overflow-hidden rounded-2xl bg-card shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                {/* Imagen */}
                <div className="relative aspect-square overflow-hidden bg-muted">
                  <Link href={`/product/${item.id}`}>
                    <Image
                      alt={item.name}
                      src={item.image}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </Link>

                  {/* Botón eliminar de favoritos */}
                  <button
                    onClick={() => removeFavorite(item.id)}
                    className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm transition-all duration-300 hover:bg-white hover:scale-110"
                    aria-label={t('removeFromFavorites')}
                  >
                    <Heart className="h-5 w-5 text-red-500 fill-red-500" />
                  </button>

                  {/* Badge de material */}
                  <div className="absolute bottom-4 left-4">
                    <span className="inline-flex items-center rounded-full bg-[#D4AF37] px-3 py-1 text-xs font-medium text-white">
                      {item.material}
                    </span>
                  </div>
                </div>

                {/* Información */}
                <div className="flex flex-1 flex-col p-6">
                  <div className="mb-2">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {item.category}
                    </span>
                  </div>

                  <Link href={`/product/${item.id}`}>
                    <h3 className="text-lg font-semibold text-foreground group-hover:text-[#D4AF37] transition-colors">
                      {item.name}
                    </h3>
                  </Link>

                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                    {item.description}
                  </p>

                  <div className="mt-auto pt-4">
                    <p className="text-2xl font-semibold text-foreground mb-3">
                      {item.price}
                    </p>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleAddToCart(item)}
                        className="flex-1 bg-[#D4AF37] hover:bg-[#B8941E] text-white transition-all duration-300"
                        size="sm"
                      >
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        {t('addToCart')}
                      </Button>

                      <Button
                        onClick={() => removeFavorite(item.id)}
                        variant="outline"
                        size="sm"
                        className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {items.length > 0 && (
          <div className="mt-12 flex justify-center gap-4">
            <Button asChild variant="outline" size="lg">
              <Link href="/catalog">{t('keepShopping')}</Link>
            </Button>
            <Button asChild size="lg" className="bg-[#D4AF37] hover:bg-[#B8941E]">
              <Link href="/cart">
                <ShoppingCart className="mr-2 h-5 w-5" />
                {t('viewCart')}
              </Link>
            </Button>
          </div>
        )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default FavoritesPage;
