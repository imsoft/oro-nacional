import type { Metadata } from "next";
import { getProductBySlug } from "@/lib/supabase/products";

// Force dynamic rendering - don't try to statically generate during build
export const dynamic = 'force-dynamic';

interface ProductLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    slug: string;
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
    const { slug } = await params;
    const product = await getProductBySlug(slug);

    // Metadata por defecto si no existe el producto
    if (!product) {
      return defaultMetadata;
    }

    const categoryName = product.category?.name || "Joyería";
    const primaryImage = product.images?.find((img) => img.is_primary)?.image_url;

    return {
      title: `${product.name} - ${product.material} | Oro Nacional Guadalajara`,
      description: product.description.substring(0, 160),
      keywords: `${product.name}, ${product.material}, ${categoryName}, joyería Guadalajara, joyería Jalisco, oro artesanal`,
      openGraph: {
        title: `${product.name} | Oro Nacional`,
        description: product.description.substring(0, 160),
        type: "website",
        locale: "es_MX",
        images: primaryImage ? [{ url: primaryImage, alt: product.name }] : [],
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
