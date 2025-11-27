"use client";

import { useEffect, useState, use } from "react";
import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";
import Breadcrumbs from "@/components/shared/breadcrumbs";
import ProductGallery from "@/components/product/product-gallery";
import ProductInfo from "@/components/product/product-info";
import ProductDetails from "@/components/product/product-details";
import RelatedProducts from "@/components/product/related-products";
import { ProductNotFound } from "@/components/product/product-not-found";
import { Loader2 } from "lucide-react";
import { getProductBySlug, getProductsByCategory } from "@/lib/supabase/products";
import type { ProductDetail, Product } from "@/types/product";

interface ProductPageProps {
  params: Promise<{
    slug: string;
    locale: 'es' | 'en';
  }>;
}

export default function ProductPage({ params }: ProductPageProps) {
  const resolvedParams = use(params);
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const locale = resolvedParams.locale || 'es';

  useEffect(() => {
    loadProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedParams.slug, locale]);

  const loadProduct = async () => {
    setIsLoading(true);

    // Fetch product
    const productData = await getProductBySlug(resolvedParams.slug, locale);

    if (!productData) {
      setIsLoading(false);
      setProduct(null);
      return;
    }

    setProduct(productData);

    // Fetch related products from the same category
    if (productData.category?.slug) {
      const related = await getProductsByCategory(productData.category.slug, locale);
      // Filter out current product and limit to 4
      const filtered = related
        .filter((p) => p.id !== productData.id)
        .slice(0, 4);
      setRelatedProducts(filtered);
    }

    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh] pt-32">
          <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
        </div>
        <Footer />
      </div>
    );
  }

  // Si el producto no existe, mostrar página 404 mejorada
  if (!product) {
    return <ProductNotFound slug={resolvedParams.slug} locale={locale} />;
  }

  // Transform product for compatibility with existing components
  const productImages = product.images && product.images.length > 0
    ? product.images
        .sort((a, b) => {
          if (a.is_primary) return -1;
          if (b.is_primary) return 1;
          return a.display_order - b.display_order;
        })
        .map((img) => img.image_url)
    : [];

  const productSpecs = product.specifications && product.specifications.length > 0
    ? product.specifications
        .sort((a, b) => a.display_order - b.display_order)
        .reduce((acc, spec) => {
          acc[spec.spec_key] = spec.spec_value;
          return acc;
        }, {} as Record<string, string>)
    : {};

  // Transformar tallas con información completa (size, price, stock, weight)
  const productSizes = product.sizes && product.sizes.length > 0
    ? product.sizes.map((s) => ({
        size: s.size,
        price: s.price ?? 0, // Precio debe estar definido en la talla
        stock: s.stock,
        weight: s.weight, // Gramos de oro para esta talla
      }))
    : [];

  // Obtener precio base de la primera talla disponible, o 0 si no hay tallas
  const basePrice = productSizes.length > 0 && productSizes[0].price > 0
    ? productSizes[0].price
    : 0;

  const transformedProduct = {
    id: product.id,
    name: product.name,
    price: basePrice > 0 ? `$${basePrice.toLocaleString("es-MX")} MXN` : "Consultar precio",
    basePrice: basePrice, // Precio base para cálculos (de la primera talla)
    category: product.category?.name || "Sin categoría",
    material: product.material,
    description: product.description,
    images: productImages,
    specifications: productSpecs,
    sizes: productSizes,
    stock: undefined, // Stock ya no se usa a nivel de producto
    slug: product.slug,
  };

  // Transform related products for compatibility
  const transformedRelated = relatedProducts.map((p) => {
    const primaryImage = p.images?.find((img) => img.is_primary)?.image_url;
    // Obtener precio de la primera talla disponible, o 0 si no hay tallas
    const relatedBasePrice = p.sizes && p.sizes.length > 0 && p.sizes[0].price
      ? p.sizes[0].price
      : 0;
    return {
      id: p.id,
      name: p.name,
      description: p.description,
      price: relatedBasePrice > 0 ? `$${relatedBasePrice.toLocaleString("es-MX")} MXN` : "Consultar precio",
      image: primaryImage || "https://via.placeholder.com/600x600?text=Sin+Imagen",
      category: p.category?.name || "Sin categoría",
      material: p.material,
      slug: p.slug,
    };
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 lg:px-8 pt-32">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: "Catálogo", href: "/catalog" },
            {
              label: product.category?.name || "Productos",
              href: product.category?.slug
                ? `/catalog?category=${product.category.slug}`
                : "/catalog",
            },
            { label: product.name, href: `/product/${product.slug}` },
          ]}
        />

        {/* Contenido del producto */}
        <div className="py-8 lg:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Galería de imágenes */}
            <ProductGallery
              images={productImages}
              productName={product.name}
            />

            {/* Información del producto */}
            <ProductInfo product={transformedProduct} />
          </div>

          {/* Detalles adicionales del producto */}
          <div className="mt-12">
            <ProductDetails product={transformedProduct} />
          </div>
        </div>
      </main>

      {/* Productos relacionados */}
      {transformedRelated.length > 0 && (
        <RelatedProducts products={transformedRelated} />
      )}

      <Footer />
    </div>
  );
}
