import type { Metadata } from "next";
import { getBlogPostBySlug } from "@/lib/supabase/blog";
import { buildAlternates, localizedUrl, ogLocale, toSiteLocale } from "@/lib/seo";

// Force dynamic rendering - don't try to statically generate during build
export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  const locale = toSiteLocale(rawLocale);
  const isSpanish = locale === "es";

  // Default metadata
  const defaultMetadata: Metadata = {
    title: isSpanish
      ? "Artículo no encontrado | Oro Nacional"
      : "Article not found | Oro Nacional",
    description: isSpanish
      ? "El artículo que buscas no existe."
      : "The article you are looking for does not exist.",
    robots: { index: false, follow: true },
  };

  try {
    const post = await getBlogPostBySlug(slug);

    if (!post) {
      return defaultMetadata;
    }

    const postPath = `/blog/${post.slug}`;

    return {
      title: `${post.title} | Blog Oro Nacional`,
      description: post.excerpt || post.title,
      keywords: [
        post.title,
        post.category?.name || (isSpanish ? "joyería" : "jewelry"),
        "Oro Nacional",
        isSpanish ? "blog joyería" : "jewelry blog",
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
        locale: ogLocale(locale),
        url: localizedUrl(postPath, locale),
        siteName: "Oro Nacional",
      },
      alternates: buildAlternates(postPath, locale),
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
