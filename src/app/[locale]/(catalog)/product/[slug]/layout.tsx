import type { Metadata } from "next";
import { getProductBySlug } from "@/lib/supabase/products";
import { supabase } from "@/lib/supabase/client";

// Force dynamic rendering - don't try to statically generate during build
export const dynamic = 'force-dynamic';

interface ProductLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    slug: string;
    locale: string;
  }>;
}

export async function generateMetadata({
  params,
}: ProductLayoutProps): Promise<Metadata> {
  // Default metadata
  const defaultMetadata: Metadata = {
    title: "Producto | Oro Nacional Guadalajara",
    description: "Joyería fina de oro en Guadalajara, Jalisco.",
  };

  try {
    // Obtener metadata del producto desde Supabase
    const { slug, locale } = await params;
    const product = await getProductBySlug(slug, locale as 'es' | 'en');
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.oronacional.com';

    // Metadata por defecto si no existe el producto
    if (!product) {
      return defaultMetadata;
    }

    const categoryName = product.category?.name || (locale === 'es' ? "Joyería" : "Jewelry");
    const primaryImage =
      product.images?.find((img) => img.is_primary)?.image_url || product.images?.[0]?.image_url;
    const allImages = product.images?.map(img => img.image_url) || [];
    
    // Obtener precio base (siempre en MXN)
    const basePrice = (product.base_price ?? 0) > 0
      ? (product.base_price as number)
      : product.sizes?.find((s) => (s.price ?? 0) > 0)?.price ?? 0;

    // Cada idioma tiene su propio slug: obtener ambos para canonical y hreflang
    const { data: slugs } = await supabase
      .from("products")
      .select("slug_es, slug_en")
      .eq("id", product.id)
      .maybeSingle();
    const slugEs = slugs?.slug_es || slugs?.slug_en || product.slug;
    const slugEn = slugs?.slug_en || slugs?.slug_es || product.slug;

    // Las URLs en español no llevan prefijo de idioma (localePrefix: 'as-needed')
    const productUrlEs = `${baseUrl}/product/${slugEs}`;
    const productUrlEn = `${baseUrl}/en/product/${slugEn}`;
    const productUrl = locale === 'en' ? productUrlEn : productUrlEs;
    const description = product.description?.substring(0, 160) || (locale === 'es' 
      ? `Joyería fina de oro ${product.material} en Guadalajara, Jalisco.`
      : `Fine ${product.material} gold jewelry in Guadalajara, Jalisco.`);

    return {
      title: `${product.name} - ${product.material} | Oro Nacional`,
      description,
      keywords: `${product.name}, ${product.material}, ${categoryName}, ${locale === 'es' 
        ? 'joyería Guadalajara, joyería Jalisco, oro artesanal, anillos de oro, collares de oro'
        : 'jewelry Guadalajara, jewelry Jalisco, artisan gold, gold rings, gold necklaces'}`,
      openGraph: {
        title: `${product.name} | Oro Nacional`,
        description,
        type: "website",
        locale: (locale as string) === 'es' ? 'es_MX' : 'en_US',
        url: productUrl,
        siteName: 'Oro Nacional',
        images: primaryImage ? [
          {
            url: primaryImage,
            width: 1200,
            height: 630,
            alt: product.name,
          },
          ...allImages.slice(1, 4).map(img => ({
            url: img,
            alt: product.name,
          })),
        ] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${product.name} | Oro Nacional`,
        description,
        images: primaryImage ? [primaryImage] : [],
        creator: '@OroNacional',
        site: '@OroNacional',
      },
      alternates: {
        canonical: productUrl,
        languages: {
          'es-MX': productUrlEs,
          'en-US': productUrlEn,
          'x-default': productUrlEs,
        },
      },
      other: {
        'product:price:amount': basePrice > 0 ? basePrice.toString() : '',
        // El precio base está en MXN en ambos idiomas
        'product:price:currency': 'MXN',
        'product:availability': product.sizes && product.sizes.some(s => s.stock > 0) ? 'in stock' : 'out of stock',
        'product:condition': 'new',
        'product:brand': 'Oro Nacional',
        'product:category': categoryName,
      },
    };
  } catch (error) {
    // Return default metadata if Supabase is not available (e.g., during build)
    console.error("Error generating metadata:", error);
    return defaultMetadata;
  }
}

export default function ProductLayout({ children }: ProductLayoutProps) {
  return <>{children}</>;
}
