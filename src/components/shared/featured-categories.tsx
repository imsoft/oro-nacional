"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { getFeaturedCategories } from "@/lib/supabase/products";
import type { FeaturedCategory } from "@/types/product";

// Mapping from category slugs to routes
const categoryRoutes: Record<string, string> = {
  anillos: "/rings",
  collares: "/necklaces",
  aretes: "/earrings",
  pulseras: "/bracelets",
};

const FeaturedCategories = () => {
  const [categories, setCategories] = useState<FeaturedCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setIsLoading(true);
    const data = await getFeaturedCategories();
    setCategories(data);
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <section className="py-24 sm:py-32 bg-background">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return null;
  }
  return (
    <section className="py-24 sm:py-32 bg-background">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Categorías de Joyería en Oro
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Encuentra anillos, collares, aretes y pulseras de oro para cada ocasión especial
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-6 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-4">
          {categories.map((category) => {
            const href = categoryRoutes[category.slug] || `/catalog?category=${category.slug}`;
            return (
              <Link
                key={category.id}
                href={href}
                className="group relative overflow-hidden rounded-2xl bg-card transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                <div className="relative aspect-square overflow-hidden">
                  <Image
                    alt={`${category.name} - Joyería fina en Guadalajara`}
                    src={category.image_url}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                </div>
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <h3 className="text-2xl font-semibold text-white">
                    {category.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-200">
                    {category.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCategories;
