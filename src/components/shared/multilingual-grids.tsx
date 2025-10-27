"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentLocale, useMultilingualContent } from "@/hooks/use-multilingual";
import { getProducts } from "@/lib/supabase/products-multilingual";
import { getBlogPosts as getBlogPostsMultilingual } from "@/lib/supabase/blog-multilingual";
import type { MultilingualProduct, MultilingualBlogPost } from "@/types/multilingual";
import Link from "next/link";
import Image from "next/image";

export function MultilingualProductGrid() {
  const t = useTranslations("common");
  const locale = useCurrentLocale();
  const { getLocalizedText, getLocalizedContent } = useMultilingualContent();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await getProducts(locale);
        setProducts(data.slice(0, 6)); // Mostrar solo 6 productos
      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, [locale]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full mb-4" />
              <Skeleton className="h-4 w-1/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">
          {locale === "es" ? "Nuestros Productos" : "Our Products"}
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          {locale === "es" 
            ? "Descubre nuestra colección de joyería fina en oro, diseñada y fabricada en Guadalajara, Jalisco."
            : "Discover our collection of fine gold jewelry, designed and crafted in Guadalajara, Jalisco."
          }
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Card key={product.id} className="group hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="aspect-square relative overflow-hidden rounded-lg mb-4">
                {product.images && product.images.length > 0 ? (
                  <Image
                    src={product.images[0].image_url}
                    alt={product.images[0].alt_text || product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">
                      {locale === "es" ? "Sin imagen" : "No image"}
                    </span>
                  </div>
                )}
              </div>
              
              <CardTitle className="text-lg line-clamp-2">
                {product.name}
              </CardTitle>
              
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {product.category?.name}
                </Badge>
                <Badge variant="outline">
                  {product.material}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent>
              <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                {product.description}
              </p>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    ${product.price.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    {product.stock > 0 
                      ? `${product.stock} ${locale === "es" ? "disponibles" : "available"}`
                      : locale === "es" ? "Agotado" : "Out of stock"
                    }
                  </p>
                </div>
                
                <Button asChild>
                  <Link href={`/product/${product.slug}`}>
                    {locale === "es" ? "Ver detalles" : "View details"}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <Button asChild size="lg">
          <Link href="/catalog">
            {locale === "es" ? "Ver todos los productos" : "View all products"}
          </Link>
        </Button>
      </div>
    </div>
  );
}

export function MultilingualBlogGrid() {
  const t = useTranslations("common");
  const locale = useCurrentLocale();
  const { getLocalizedText, getLocalizedContent } = useMultilingualContent();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const data = await getBlogPostsMultilingual(locale, 3);
        setPosts(data);
      } catch (error) {
        console.error("Error loading blog posts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPosts();
  }, [locale]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">
          {locale === "es" ? "Últimas Noticias" : "Latest News"}
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          {locale === "es" 
            ? "Mantente al día con las últimas tendencias en joyería y consejos de cuidado."
            : "Stay up to date with the latest jewelry trends and care tips."
          }
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <Card key={post.id} className="group hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              {post.featured_image && (
                <div className="aspect-video relative overflow-hidden rounded-lg mb-4">
                  <Image
                    src={post.featured_image}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              
              <CardTitle className="text-lg line-clamp-2">
                {post.title}
              </CardTitle>
              
              <div className="flex items-center gap-2 flex-wrap">
                {post.category && (
                  <Badge variant="secondary">
                    {post.category.name}
                  </Badge>
                )}
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {post.tags.slice(0, 2).map((tag: any) => (
                  <Badge key={tag.id} variant="outline">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </CardHeader>
            
            <CardContent>
              <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                {post.excerpt}
              </p>
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>
                  {post.published_at 
                    ? new Date(post.published_at).toLocaleDateString(locale === "es" ? "es-MX" : "en-US")
                    : ""
                  }
                </span>
                <span>{post.views} {locale === "es" ? "vistas" : "views"}</span>
              </div>
              
              <Button asChild className="w-full mt-4">
                <Link href={`/blog/${post.slug}`}>
                  {locale === "es" ? "Leer más" : "Read more"}
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <Button asChild size="lg">
          <Link href="/blog">
            {locale === "es" ? "Ver todos los posts" : "View all posts"}
          </Link>
        </Button>
      </div>
    </div>
  );
}
