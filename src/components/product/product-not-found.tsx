"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";
import { AlertCircle, Search, ArrowRight } from "lucide-react";
import { getProducts } from "@/lib/supabase/products";
import type { Product } from "@/types/product";

interface ProductNotFoundProps {
  slug: string;
  locale: 'es' | 'en';
}

export function ProductNotFound({ slug, locale }: ProductNotFoundProps) {
  const t = useTranslations("catalog");
  const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSuggestions = async () => {
      try {
        const products = await getProducts(locale);
        // Tomar 4 productos aleatorios o los primeros 4
        const suggestions = products
          .sort(() => Math.random() - 0.5)
          .slice(0, 4);
        setSuggestedProducts(suggestions);
      } catch (error) {
        console.error("Error loading suggestions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSuggestions();
  }, [locale]);

  const transformedProducts = suggestedProducts.map((p) => {
    const primaryImage = p.images?.find((img) => img.is_primary)?.image_url;
    return {
      id: p.id,
      name: p.name,
      price: `$${p.price.toLocaleString("es-MX")} MXN`,
      image: primaryImage || "https://via.placeholder.com/400x400?text=Sin+Imagen",
      slug: p.slug,
    };
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 lg:px-8 py-20 pt-40">
        {/* Mensaje de error principal */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-50 mb-6">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>

          <h1 className="text-4xl font-bold text-foreground mb-4">
            {locale === 'es' ? 'Producto no encontrado' : 'Product not found'}
          </h1>

          <p className="text-lg text-muted-foreground mb-2">
            {locale === 'es'
              ? 'El producto que buscas no existe o ha sido eliminado.'
              : 'The product you are looking for does not exist or has been removed.'}
          </p>

          <p className="text-sm text-muted-foreground mb-8">
            {locale === 'es'
              ? `Slug buscado: "${slug}"`
              : `Searched slug: "${slug}"`}
          </p>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/catalog"
              className="inline-flex items-center gap-2 rounded-md bg-[#D4AF37] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#B8941E] transition-colors"
            >
              <Search className="w-4 h-4" />
              {locale === 'es' ? 'Explorar Catálogo' : 'Browse Catalog'}
            </Link>

            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-foreground shadow-sm hover:bg-gray-50 transition-colors"
            >
              {locale === 'es' ? 'Ir al Inicio' : 'Go to Home'}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Productos sugeridos */}
        {!isLoading && transformedProducts.length > 0 && (
          <div className="mt-16">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                {locale === 'es' ? 'Productos que te podrían interesar' : 'Products you might like'}
              </h2>
              <p className="text-muted-foreground">
                {locale === 'es'
                  ? 'Descubre otras joyas de nuestra colección'
                  : 'Discover other jewels from our collection'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {transformedProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.slug}`}
                  className="group"
                >
                  <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100 mb-3">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                  <h3 className="text-sm font-medium text-foreground group-hover:text-[#D4AF37] transition-colors line-clamp-2 mb-1">
                    {product.name}
                  </h3>
                  <p className="text-lg font-semibold text-[#D4AF37]">
                    {product.price}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Mensaje de ayuda */}
        <div className="mt-16 bg-gray-50 rounded-lg p-8 text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {locale === 'es' ? '¿Necesitas ayuda?' : 'Need help?'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {locale === 'es'
              ? 'Si crees que esto es un error o necesitas ayuda para encontrar un producto específico, contáctanos.'
              : 'If you think this is an error or need help finding a specific product, contact us.'}
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center text-[#D4AF37] hover:text-[#B8941E] font-medium transition-colors"
          >
            {locale === 'es' ? 'Contáctanos' : 'Contact us'}
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
