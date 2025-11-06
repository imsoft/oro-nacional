"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from 'next-intl';
import { BookOpen, Calendar, Clock, Loader2 } from "lucide-react";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";
import { getPublishedPosts } from "@/lib/supabase/blog";
import type { BlogPostCard } from "@/types/blog";

const BlogPage = () => {
  const t = useTranslations('blog');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const [posts, setPosts] = useState<BlogPostCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar posts al montar
  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setIsLoading(true);
    try {
      const postsData = await getPublishedPosts();
      setPosts(postsData);
    } catch (error) {
      console.error("Error loading blog posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative bg-gradient-to-b from-muted/50 to-background py-16 lg:py-20 pt-32 lg:pt-40">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#D4AF37]/10 mb-6">
            <BookOpen className="h-8 w-8 text-[#D4AF37]" />
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            {t('title')}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>
      </section>

      {/* Contenido */}
      <section className="py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {/* Loading State */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
            </div>
          ) : (
            <>
              {/* Grid de artículos */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="group rounded-lg bg-card shadow-sm hover:shadow-md transition-all overflow-hidden"
                  >
                    {/* Imagen */}
                    <div className="relative aspect-video overflow-hidden bg-muted">
                      {post.featured_image ? (
                        <Image
                          src={post.featured_image}
                          alt={post.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted">
                          <BookOpen className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                      {post.category_name && (
                        <div className="absolute top-4 left-4 z-10">
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
                              {new Date(post.published_at).toLocaleDateString(locale === 'es' ? "es-MX" : "en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{post.views} {tCommon('views')}</span>
                        </div>
                      </div>

                      {/* Autor */}
                      {post.author_name && (
                        <div className="mt-4 pt-4 border-t border-border">
                          <p className="text-xs text-muted-foreground">
                            {t('by')} <span className="font-medium">{post.author_name}</span>
                          </p>
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>

              {/* No hay posts */}
              {posts.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    {t('noPosts')}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BlogPage;
