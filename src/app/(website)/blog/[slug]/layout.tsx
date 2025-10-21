import type { Metadata } from "next";
import { getPostBySlug } from "@/lib/blog-data";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = getPostBySlug(params.slug);

  if (!post) {
    return {
      title: "Artículo no encontrado | Oro Nacional",
      description: "El artículo que buscas no existe.",
    };
  }

  return {
    title: `${post.title} | Blog Oro Nacional`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.image],
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
    },
  };
}

export default function BlogPostLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
