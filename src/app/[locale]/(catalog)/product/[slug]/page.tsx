"use client";

import { useEffect, useState, use } from "react";
import { useLocale, useTranslations } from "next-intl";
import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";
import Breadcrumbs from "@/components/shared/breadcrumbs";
import ProductGallery from "@/components/product/product-gallery";
import ProductInfo from "@/components/product/product-info";
import ProductDetails from "@/components/product/product-details";
import RelatedProducts from "@/components/product/related-products";
import { ProductNotFound } from "@/components/product/product-not-found";
import { getPrimaryImageUrl, useProductPriceLabel } from "@/components/catalog/product-display";
import { Loader2 } from "lucide-react";
import { getProductBySlug, getProductsByCategory } from "@/lib/supabase/products";
import { getProductInternalCategoriesAndSubcategories } from "@/lib/supabase/internal-categories";
import type { ProductDetail, Product } from "@/types/product";
import { JsonLd, getProductSchema, getBreadcrumbSchema } from "@/components/seo/json-ld";

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
  const locale = useLocale() as 'es' | 'en';
  const tNav = useTranslations('nav');
  const tProduct = useTranslations('product');
  const getPriceLabel = useProductPriceLabel();

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

    // Fetch internal categories and subcategories
    try {
      const { categories, subcategories } = await getProductInternalCategoriesAndSubcategories(productData.id);
      // Store in product data for later use
      (productData as any).internalCategory = categories[0] || null;
      (productData as any).internalSubcategory = subcategories[0] || null;
    } catch (error) {
      console.error("Error loading internal categories:", error);
      (productData as any).internalCategory = null;
      (productData as any).internalSubcategory = null;
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
    ? [...product.images]
        .sort((a, b) => {
          if (a.is_primary) return -1;
          if (b.is_primary) return 1;
          return a.display_order - b.display_order;
        })
        .map((img) => img.image_url)
    : [];

  const productSpecs = product.specifications && product.specifications.length > 0
    ? [...product.specifications]
        .sort((a, b) => a.display_order - b.display_order)
        .reduce((acc, spec) => {
          acc[spec.spec_key] = spec.spec_value;
          return acc;
        }, {} as Record<string, string>)
    : {};

  // Transformar tallas con información completa (size, price, price_usd, stock, weight)
  // El precio se conserva como null cuando la talla no lo tiene definido, para que
  // ProductInfo pueda usar el precio base del producto como respaldo
  const productSizes = product.sizes && product.sizes.length > 0
    ? product.sizes.map((s) => ({
        size: s.size,
        price: s.price ?? null,
        price_usd: s.price_usd ?? null, // Precio USD opcional
        stock: s.stock,
        weight: s.weight, // Gramos de oro para esta talla
      }))
    : [];

  // Precio base (MXN): el calculado del producto, o el de la primera talla con precio.
  // 0 significa "sin precio" (se muestra "Consultar precio")
  const firstPricedSize = productSizes.find((s) => (s.price ?? 0) > 0);
  const hasBasePrice = (product.base_price ?? 0) > 0;
  const basePrice = hasBasePrice
    ? (product.base_price as number)
    : firstPricedSize?.price ?? ((product.price ?? 0) > 0 ? product.price : 0);
  const basePriceUSD = hasBasePrice
    ? product.base_price_usd ?? null
    : firstPricedSize?.price_usd ?? null;

  const transformedProduct = {
    id: product.id,
    name: product.name,
    basePrice,
    basePriceUSD,
    baseGrams: product.base_grams, // Gramos base usados para calcular el precio base
    category: product.category?.name || tProduct('uncategorized'),
    material: product.material,
    description: product.description,
    images: productImages,
    specifications: productSpecs,
    sizes: productSizes,
    slug: product.slug,
    internalCategory: (product as { internalCategory?: { id: string; name: string } | null }).internalCategory ?? null,
  };

  // Transform related products for compatibility
  const transformedRelated = relatedProducts.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description ?? "",
    price: getPriceLabel(p),
    image: getPrimaryImageUrl(p.images),
    category: p.category?.name || tProduct('uncategorized'),
    material: p.material,
    slug: p.slug,
  }));

  // Preparar datos para structured data
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://www.oronacional.com';
  const primaryImageForSchema = productImages[0] || '';
  const basePriceForSchema = transformedProduct.basePrice || 0;
  const isInStock = product.sizes && product.sizes.some(s => s.stock > 0);
  
  // Breadcrumbs para structured data (las URLs en español no llevan prefijo de idioma)
  const localeBaseUrl = locale === 'es' ? baseUrl : `${baseUrl}/${locale}`;
  const breadcrumbItems = [
    { name: tNav('home'), url: localeBaseUrl },
    { name: tNav('catalog'), url: `${localeBaseUrl}/catalog` },
    {
      name: product.category?.name || tNav('catalog'),
      url: product.category?.slug
        ? `${localeBaseUrl}/catalog?category=${product.category.slug}`
        : `${localeBaseUrl}/catalog`,
    },
    { name: product.name, url: `${localeBaseUrl}/product/${product.slug}` },
  ];

  return (
    <>
      {/* Structured Data - JSON-LD */}
      {primaryImageForSchema && basePriceForSchema > 0 && (
        <>
          <JsonLd
            data={getProductSchema({
              name: product.name,
              description: product.description || '',
              image: primaryImageForSchema,
              price: basePriceForSchema,
              // base_price está en MXN en ambos idiomas
              currency: 'MXN',
              sku: product.id,
              brand: 'Oro Nacional',
              availability: isInStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            })}
          />
          <JsonLd data={getBreadcrumbSchema(breadcrumbItems)} />
        </>
      )}
      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="mx-auto max-w-7xl px-6 lg:px-8 pt-32">
          {/* Breadcrumbs */}
          <Breadcrumbs
            items={[
              { label: tNav('catalog'), href: "/catalog" },
              {
                label: product.category?.name || tNav('catalog'),
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
    </>
  );
}
