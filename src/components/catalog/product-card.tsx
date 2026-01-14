"use client";

import Image from "next/image";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Heart, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFavoritesStore } from "@/stores/favorites-store";

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string;
  category: string;
  material: string;
  slug: string;
}

const ProductCard = ({
  id,
  name,
  description,
  price,
  image,
  category,
  material,
  slug,
}: ProductCardProps) => {
  const t = useTranslations("common");
  const { addFavorite, removeFavorite, isFavorite } = useFavoritesStore();
  const favorite = isFavorite(id);

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (favorite) {
      removeFavorite(id);
    } else {
      addFavorite({
        id,
        name,
        price,
        image,
        category,
        material,
        description,
        slug,
      });
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const shareData = {
      title: `${name} - Oro Nacional`,
      text: `${description} - ${price}`,
      url: `${window.location.origin}/product/${slug}`,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copiar al portapapeles
        await navigator.clipboard.writeText(shareData.url);
        alert("¡Enlace copiado al portapapeles!");
      }
    } catch (err) {
      console.log("Error sharing:", err);
    }
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl bg-card shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Link href={`/product/${slug}`}>
          <Image
            alt={`${name} - Oro Nacional Guadalajara`}
            src={image}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </Link>
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={handleShare}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm transition-all duration-300 hover:bg-white hover:scale-110"
            aria-label={t('shareProduct')}
          >
            <Share2 className="h-5 w-5 text-gray-700" />
          </button>
          <button
            onClick={handleToggleFavorite}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm transition-all duration-300 hover:bg-white hover:scale-110"
            aria-label={favorite ? t('removeFromFavorites') : t('addToFavorites')}
          >
            <Heart
              className={`h-5 w-5 transition-colors ${
                favorite ? "text-red-500 fill-red-500" : "text-gray-700"
              }`}
            />
          </button>
        </div>
        <div className="absolute bottom-4 left-4">
          <span className="inline-flex items-center rounded-full bg-[#D4AF37] px-3 py-1 text-xs font-medium text-white">
            {material}
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="mb-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {category}
          </span>
        </div>
        <Link href={`/product/${slug}`}>
          <h3 className="text-lg font-semibold text-foreground group-hover:text-[#D4AF37] transition-colors">
            {name}
          </h3>
        </Link>
        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
          {description}
        </p>
        <div className="mt-auto pt-4 flex items-center justify-end">
          <Button
            asChild
            size="sm"
            className="bg-[#D4AF37] hover:bg-[#B8941E] text-white transition-all duration-300 hover:scale-105"
          >
            <Link href={`/product/${slug}`}>Ver detalles</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
