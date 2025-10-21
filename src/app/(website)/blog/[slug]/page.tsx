import { Calendar, Clock, User, ArrowLeft, Tag } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";
import { getPostBySlug, getRelatedPosts } from "@/lib/blog-data";

export default function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = getRelatedPosts(post.id, 3);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Volver al blog */}
      <div className="bg-muted/30 border-b border-border">
        <div className="mx-auto max-w-4xl px-6 lg:px-8 py-4">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al blog
          </Link>
        </div>
      </div>

      {/* Header del artículo */}
      <article className="py-12 lg:py-16">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          {/* Categoría */}
          <div className="mb-4">
            <span className="inline-block px-3 py-1 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] text-sm font-medium">
              {post.category}
            </span>
          </div>

          {/* Título */}
          <h1 className="text-4xl lg:text-5xl font-semibold tracking-tight text-foreground mb-6">
            {post.title}
          </h1>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-6 mb-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{post.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                {new Date(post.date).toLocaleDateString("es-MX", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{post.readTime} de lectura</span>
            </div>
          </div>

          {/* Imagen destacada */}
          <div className="aspect-video rounded-2xl overflow-hidden bg-muted mb-8">
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Excerpt */}
          <div className="bg-muted/30 border-l-4 border-[#D4AF37] p-6 rounded-r-lg mb-8">
            <p className="text-lg text-foreground font-medium italic">
              {post.excerpt}
            </p>
          </div>

          {/* Contenido del artículo */}
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <div
              className="text-foreground leading-relaxed space-y-6"
              style={{
                whiteSpace: "pre-line",
              }}
            >
              {post.content.split("\n").map((paragraph, index) => {
                // Headers H2
                if (paragraph.startsWith("## ")) {
                  return (
                    <h2
                      key={index}
                      className="text-2xl font-semibold text-foreground mt-8 mb-4"
                    >
                      {paragraph.replace("## ", "")}
                    </h2>
                  );
                }
                // Headers H3
                if (paragraph.startsWith("### ")) {
                  return (
                    <h3
                      key={index}
                      className="text-xl font-semibold text-foreground mt-6 mb-3"
                    >
                      {paragraph.replace("### ", "")}
                    </h3>
                  );
                }
                // Bold text
                if (paragraph.startsWith("**") && paragraph.endsWith("**")) {
                  return (
                    <p key={index} className="font-semibold text-foreground">
                      {paragraph.replace(/\*\*/g, "")}
                    </p>
                  );
                }
                // List items
                if (paragraph.trim().startsWith("- ") || paragraph.trim().startsWith("• ")) {
                  return (
                    <li key={index} className="ml-6 text-muted-foreground">
                      {paragraph.replace(/^[-•]\s/, "")}
                    </li>
                  );
                }
                // Check/X items
                if (paragraph.trim().startsWith("✅") || paragraph.trim().startsWith("❌")) {
                  return (
                    <p key={index} className="text-muted-foreground flex items-start gap-2">
                      <span className="flex-shrink-0">{paragraph[0]}</span>
                      <span>{paragraph.substring(2)}</span>
                    </p>
                  );
                }
                // Separador
                if (paragraph.trim() === "---") {
                  return <hr key={index} className="my-8 border-border" />;
                }
                // Párrafos normales
                if (paragraph.trim()) {
                  return (
                    <p key={index} className="text-muted-foreground">
                      {paragraph}
                    </p>
                  );
                }
                return null;
              })}
            </div>
          </div>

          {/* Tags */}
          <div className="mt-12 pt-8 border-t border-border">
            <div className="flex items-center gap-2 flex-wrap">
              <Tag className="h-4 w-4 text-muted-foreground" />
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-12 rounded-2xl bg-gradient-to-br from-[#D4AF37]/10 to-[#D4AF37]/5 p-8 lg:p-12 border border-[#D4AF37]/20 text-center">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              ¿Te Gustó Este Artículo?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Descubre nuestra colección de joyería de oro en Guadalajara.
              Piezas únicas fabricadas por maestros joyeros.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/catalog"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-[#D4AF37] hover:bg-[#B8941E] text-white font-medium transition-colors"
              >
                Ver Catálogo
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg border-2 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-white font-medium transition-colors"
              >
                Contactar
              </Link>
            </div>
          </div>
        </div>
      </article>

      {/* Artículos relacionados */}
      {relatedPosts.length > 0 && (
        <section className="py-16 bg-muted/30 border-t border-border">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <h2 className="text-2xl font-semibold text-foreground mb-8">
              Artículos Relacionados
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.id}
                  href={`/blog/${relatedPost.slug}`}
                  className="group rounded-lg bg-card shadow-sm hover:shadow-md transition-all overflow-hidden"
                >
                  <div className="relative aspect-video overflow-hidden bg-muted">
                    <img
                      src={relatedPost.image}
                      alt={relatedPost.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6">
                    <span className="inline-block px-2 py-1 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] text-xs font-medium mb-3">
                      {relatedPost.category}
                    </span>
                    <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-[#D4AF37] transition-colors line-clamp-2">
                      {relatedPost.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {relatedPost.excerpt}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
