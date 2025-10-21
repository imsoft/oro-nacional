"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Heart, Share2 } from "lucide-react";
import { useFavoritesStore } from "@/stores/favorites-store";

const products = [
  {
    id: 1,
    name: "Anillo de Compromiso Esmeralda",
    description: "Anillo de oro 14k con diamantes naturales - Diseño artesanal",
    price: "$12,500 MXN",
    category: "Anillos",
    material: "Oro 14k",
    image:
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 2,
    name: "Collar Infinito de Oro Blanco",
    description: "Collar de oro blanco 18k - Elegancia atemporal",
    price: "$18,900 MXN",
    category: "Collares",
    material: "Oro Blanco 18k",
    image:
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 3,
    name: "Aretes de Oro con Perlas",
    description: "Aretes de oro amarillo con perlas cultivadas AAA",
    price: "$8,750 MXN",
    category: "Aretes",
    material: "Oro Amarillo",
    image:
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
  },
];

const FeaturedCollection = () => {
  const { addFavorite, removeFavorite, isFavorite } = useFavoritesStore();

  const handleToggleFavorite = (product: typeof products[0], e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isFavorite(product.id)) {
      removeFavorite(product.id);
    } else {
      addFavorite(product);
    }
  };

  const handleShare = async (product: typeof products[0], e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const shareData = {
      title: `${product.name} - Oro Nacional`,
      text: `${product.description} - ${product.price}`,
      url: `${window.location.origin}/product/${product.id}`,
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
          {products.map((product) => (
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
                    aria-label="Compartir producto"
                  >
                    <Share2 className="h-5 w-5 text-gray-700" />
                  </button>
                  <button
                    onClick={(e) => handleToggleFavorite(product, e)}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm transition-all duration-300 hover:bg-white hover:scale-110"
                    aria-label={isFavorite(product.id) ? "Quitar de favoritos" : "Agregar a favoritos"}
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
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-2xl font-semibold text-foreground">
                    {product.price}
                  </p>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-white transition-all duration-300 hover:scale-105"
                  >
                    <Link href="#">Ver detalles</Link>
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
