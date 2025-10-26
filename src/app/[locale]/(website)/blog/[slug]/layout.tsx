import type { Metadata } from "next";
import { getBlogPostBySlug } from "@/lib/supabase/blog";

// Force dynamic rendering - don't try to statically generate during build
export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  // Default metadata
  const defaultMetadata: Metadata = {
    title: "Artículo no encontrado | Oro Nacional",
    description: "El artículo que buscas no existe.",
  };

  try {
    const post = await getBlogPostBySlug(params.slug);

    if (!post) {
      return defaultMetadata;
    }

    return {
      title: `${post.title} | Blog Oro Nacional`,
      description: post.excerpt || post.title,
      keywords: [
        post.title,
        post.category?.name || "joyería",
        "Oro Nacional",
        "blog joyería",
        "Guadalajara",
        ...(post.tags?.map((tag) => tag.name) || []),
      ].join(", "),
      openGraph: {
        title: post.title,
        description: post.excerpt || post.title,
        images: post.featured_image ? [{ url: post.featured_image, alt: post.title }] : [],
        type: "article",
        publishedTime: post.published_at || post.created_at,
        authors: post.author ? [post.author.full_name] : undefined,
        locale: "es_MX",
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return defaultMetadata;
  }
}

export default function BlogPostLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
