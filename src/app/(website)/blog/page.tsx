"use client";

import { useState, useEffect } from "react";
import { BookOpen, Calendar, Clock, Loader2 } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";
import { getPublishedPosts, getBlogCategories } from "@/lib/supabase/blog";
import type { BlogPostCard, BlogCategory } from "@/types/blog";

const BlogPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [posts, setPosts] = useState<BlogPostCard[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar posts y categorías al montar
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [postsData, categoriesData] = await Promise.all([
        getPublishedPosts(),
        getBlogCategories(),
      ]);
      setPosts(postsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error loading blog data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrar posts por categoría
  const filteredPosts = selectedCategory === "Todos"
    ? posts
    : posts.filter((post) => post.category_name === selectedCategory);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative bg-gradient-to-b from-muted/50 to-background py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#D4AF37]/10 mb-6">
            <BookOpen className="h-8 w-8 text-[#D4AF37]" />
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Blog de Oro Nacional
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Tendencias, guías, historia y consejos de estilo en joyería de oro.
            Aprende de los expertos en Guadalajara.
          </p>
        </div>
      </section>

      {/* Contenido */}
      <section className="py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {/* Categorías */}
          <div className="mb-8 flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => setSelectedCategory("Todos")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === "Todos"
                  ? "bg-[#D4AF37] text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Todos
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.name)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.name
                    ? "bg-[#D4AF37] text-white"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
            </div>
          ) : (
            <>
              {/* Grid de artículos */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPosts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="group rounded-lg bg-card shadow-sm hover:shadow-md transition-all overflow-hidden"
                  >
                    {/* Imagen */}
                    <div className="relative aspect-video overflow-hidden bg-muted">
                      {post.featured_image ? (
                        <img
                          src={post.featured_image}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted">
                          <BookOpen className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                      {post.category_name && (
                        <div className="absolute top-4 left-4">
                          <span className="inline-block px-3 py-1 rounded-full bg-[#D4AF37] text-white text-xs font-medium">
                            {post.category_name}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Contenido */}
                    <div className="p-6">
                      <h2 className="text-xl font-semibold text-foreground mb-2 group-hover:text-[#D4AF37] transition-colors line-clamp-2">
                        {post.title}
                      </h2>
                      {post.excerpt && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                          {post.excerpt}
                        </p>
                      )}

                      {/* Metadata */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {post.published_at && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {new Date(post.published_at).toLocaleDateString("es-MX", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{post.views} vistas</span>
                        </div>
                      </div>

                      {/* Autor */}
                      {post.author_name && (
                        <div className="mt-4 pt-4 border-t border-border">
                          <p className="text-xs text-muted-foreground">
                            Por <span className="font-medium">{post.author_name}</span>
                          </p>
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>

              {/* No hay posts */}
              {filteredPosts.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    No hay artículos en esta categoría aún.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* CTA Newsletter (opcional) */}
      <section className="py-16 bg-muted/30">
        <div className="mx-auto max-w-3xl px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Suscríbete a Nuestro Newsletter
          </h2>
          <p className="text-muted-foreground mb-6">
            Recibe consejos exclusivos, tendencias y ofertas especiales
            directamente en tu correo.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="tu@email.com"
              className="flex-1 px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
            />
            <button className="px-6 py-3 rounded-lg bg-[#D4AF37] hover:bg-[#B8941E] text-white font-medium transition-colors whitespace-nowrap">
              Suscribirme
            </button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            No spam. Cancela cuando quieras.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BlogPage;
