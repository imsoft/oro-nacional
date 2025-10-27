"use client";

import { useEffect, useState } from "react";
import { Link } from '@/i18n/routing';
import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";
import Breadcrumbs from "@/components/shared/breadcrumbs";
import ProductGallery from "@/components/product/product-gallery";
import ProductInfo from "@/components/product/product-info";
import ProductDetails from "@/components/product/product-details";
import RelatedProducts from "@/components/product/related-products";
import { Loader2 } from "lucide-react";
import { getProductBySlug, getProductsByCategory } from "@/lib/supabase/products";
import type { ProductDetail, Product } from "@/types/product";

interface ProductPageProps {
  params: {
    slug: string;
  };
}

export default function ProductPage({ params }: ProductPageProps) {
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.slug]);

  const loadProduct = async () => {
    setIsLoading(true);

    // Fetch product
    const productData = await getProductBySlug(params.slug);

    if (!productData) {
      setIsLoading(false);
      setProduct(null);
      return;
    }

    setProduct(productData);

    // Fetch related products from the same category
    if (productData.category?.slug) {
      const related = await getProductsByCategory(productData.category.slug);
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
        <div className="flex items-center justify-center min-h-[60vh] pt-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
        </div>
        <Footer />
      </div>
    );
  }

  // Si el producto no existe, mostrar 404
  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20 pt-32 text-center">
          <h1 className="text-3xl font-semibold text-foreground">
            Producto no encontrado
          </h1>
          <p className="mt-4 text-muted-foreground">
            El producto que buscas no existe o ha sido eliminado.
          </p>
          <Link
            href="/catalog"
            className="mt-8 inline-block rounded-md bg-[#D4AF37] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#B8941E] transition-colors"
          >
            Volver al Catálogo
          </Link>
        </div>
        <Footer />
      </div>
    );
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

  const productSizes = product.sizes && product.sizes.length > 0
    ? product.sizes.map((s) => s.size)
    : [];

  const transformedProduct = {
    id: product.id,
    name: product.name,
    price: `$${product.price.toLocaleString("es-MX")} MXN`,
    category: product.category?.name || "Sin categoría",
    material: product.material,
    description: product.description,
    images: productImages,
    specifications: productSpecs,
    sizes: productSizes,
    stock: product.stock,
    weight: product.weight,
    slug: product.slug,
  };

  // Transform related products for compatibility
  const transformedRelated = relatedProducts.map((p) => {
    const primaryImage = p.images?.find((img) => img.is_primary)?.image_url;
    return {
      id: p.id,
      name: p.name,
      description: p.description,
      price: `$${p.price.toLocaleString("es-MX")} MXN`,
      image: primaryImage || "https://via.placeholder.com/600x600?text=Sin+Imagen",
      category: p.category?.name || "Sin categoría",
      material: p.material,
      slug: p.slug,
    };
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 lg:px-8 pt-24">
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
