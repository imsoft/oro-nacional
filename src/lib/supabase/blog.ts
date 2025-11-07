// ================================================
// FUNCIONES DE QUERY PARA BLOG - SUPABASE
// ================================================

import { supabase } from "./client";
import type {
  BlogPost,
  BlogPostDetail,
  BlogPostListItem,
  BlogPostCard,
  BlogCategory,
  BlogTag,
  CreateBlogPostData,
  UpdateBlogPostData,
} from "@/types/blog";

// ================================================
// CATEGORÍAS
// ================================================

/**
 * Obtener todas las categorías de blog
 */
export async function getBlogCategories(): Promise<BlogCategory[]> {
  const { data, error } = await supabase
    .from("blog_categories")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching blog categories:", error);
    throw error;
  }

  return data || [];
}

/**
 * Obtener una categoría por slug
 */
export async function getBlogCategoryBySlug(
  slug: string
): Promise<BlogCategory | null> {
  const { data, error } = await supabase
    .from("blog_categories")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    console.error("Error fetching blog category:", error);
    return null;
  }

  return data;
}

// ================================================
// ETIQUETAS (TAGS)
// ================================================

/**
 * Obtener todas las etiquetas
 */
export async function getBlogTags(): Promise<BlogTag[]> {
  const { data, error } = await supabase
    .from("blog_tags")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching blog tags:", error);
    throw error;
  }

  return data || [];
}

/**
 * Crear o obtener etiquetas por nombre
 */
export async function getOrCreateTags(tagNames: string[]): Promise<BlogTag[]> {
  const tags: BlogTag[] = [];

  for (const name of tagNames) {
    const slug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Intentar obtener la etiqueta existente
    const { data: existingTag } = await supabase
      .from("blog_tags")
      .select("*")
      .eq("slug", slug)
      .single();

    if (existingTag) {
      tags.push(existingTag);
    } else {
      // Crear nueva etiqueta
      const { data: newTag, error } = await supabase
        .from("blog_tags")
        .insert({ name, slug })
        .select()
        .single();

      if (error) {
        console.error("Error creating tag:", error);
        continue;
      }

      if (newTag) {
        tags.push(newTag);
      }
    }
  }

  return tags;
}

// ================================================
// POSTS - CREATE
// ================================================

/**
 * Crear un nuevo post de blog
 */
export async function createBlogPost(
  postData: CreateBlogPostData,
  authorId: string
): Promise<BlogPost | null> {
  try {
    // 1. Generar slug del título
    const slug = postData.title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // 2. Subir imagen featured si existe
    let featuredImageUrl: string | undefined = undefined;
    if (postData.featured_image) {
      const fileExt = postData.featured_image.name.split(".").pop();
      const fileName = `${Date.now()}-${slug}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("blog-images")
        .upload(fileName, postData.featured_image);

      if (uploadError) {
        console.error("Error uploading image:", uploadError);
        throw uploadError;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("blog-images").getPublicUrl(fileName);

      featuredImageUrl = publicUrl;
    }

    // 3. Insertar el post
    const { data: post, error: postError } = await supabase
      .from("blog_posts")
      .insert({
        title: postData.title,
        slug,
        excerpt: postData.excerpt,
        content: postData.content,
        featured_image: featuredImageUrl,
        category_id: postData.category_id || null,
        author_id: authorId,
        status: postData.status,
        available_languages: postData.available_languages || ['es'],
        published_at: postData.status === "published" ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (postError) {
      console.error("Error creating post:", postError);
      throw postError;
    }

    // 4. Crear etiquetas y asociarlas al post
    if (postData.tags && postData.tags.length > 0) {
      const tags = await getOrCreateTags(postData.tags);

      const postTagRelations = tags.map((tag) => ({
        post_id: post.id,
        tag_id: tag.id,
      }));

      const { error: tagsError } = await supabase
        .from("blog_post_tags")
        .insert(postTagRelations);

      if (tagsError) {
        console.error("Error associating tags:", tagsError);
      }
    }

    return post;
  } catch (error) {
    console.error("Error in createBlogPost:", error);
    return null;
  }
}

// ================================================
// POSTS - READ
// ================================================

/**
 * Obtener posts publicados para el blog público
 * @param locale - Idioma actual del usuario (opcional, por defecto muestra todos)
 */
export async function getPublishedPosts(locale?: string): Promise<BlogPostCard[]> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select(
      `
      id,
      title,
      slug,
      excerpt,
      featured_image,
      published_at,
      views,
      available_languages,
      category:blog_categories(name),
      author:profiles(full_name)
    `
    )
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error) {
    console.error("Error fetching published posts:", error);
    throw error;
  }

  const posts: BlogPostCard[] = (data as unknown[]).map((post: unknown) => {
    const p = post as {
      id: string;
      title: string;
      slug: string;
      excerpt?: string;
      featured_image?: string;
      published_at?: string;
      views: number;
      available_languages?: string[];
      category?: { name: string };
      author?: { full_name: string };
    };

    return {
      id: p.id,
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt,
      featured_image: p.featured_image,
      published_at: p.published_at,
      views: p.views,
      category_name: p.category?.name,
      author_name: p.author?.full_name,
    };
  }).filter(post => {
    // Filtrar por idioma si se especifica
    if (!locale) return true;
    const originalPost = (data as unknown[]).find((d: unknown) => (d as { id: string }).id === post.id) as { available_languages?: string[] } | undefined;
    return !originalPost?.available_languages || originalPost.available_languages.includes(locale);
  });

  return posts;
}

/**
 * Obtener todos los posts para el admin
 */
export async function getAllBlogPosts(): Promise<BlogPostListItem[]> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select(
      `
      id,
      title,
      slug,
      status,
      views,
      published_at,
      created_at,
      featured_image,
      category:blog_categories(name),
      author:profiles(full_name)
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching all blog posts:", error);
    throw error;
  }

  const posts: BlogPostListItem[] = (data as unknown[]).map((post: unknown) => {
    const p = post as {
      id: string;
      title: string;
      slug: string;
      status: "draft" | "published";
      views: number;
      published_at?: string;
      created_at: string;
      featured_image?: string;
      category?: { name: string };
      author?: { full_name: string };
    };

    return {
      id: p.id,
      title: p.title,
      slug: p.slug,
      status: p.status,
      views: p.views,
      published_at: p.published_at,
      created_at: p.created_at,
      featured_image: p.featured_image,
      category_name: p.category?.name,
      author_name: p.author?.full_name,
    };
  });

  return posts;
}

/**
 * Obtener un post por slug (con todas las relaciones)
 */
export async function getBlogPostBySlug(
  slug: string
): Promise<BlogPostDetail | null> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select(
      `
      *,
      category:blog_categories(*),
      author:profiles(id, full_name, email, avatar_url),
      tags:blog_post_tags(tag:blog_tags(*))
    `
    )
    .eq("slug", slug)
    .single();

  if (error) {
    console.error("Error fetching blog post by slug:", error);
    return null;
  }

  // Transformar los tags
  const tags = data.tags?.map((t: { tag: BlogTag }) => t.tag) || [];

  const post: BlogPostDetail = {
    ...data,
    category: data.category || null,
    author: data.author || null,
    tags,
  };

  return post;
}

/**
 * Obtener un post por ID (para edición en admin)
 */
export async function getBlogPostById(id: string): Promise<BlogPostDetail | null> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select(
      `
      *,
      category:blog_categories(*),
      author:profiles(id, full_name, email, avatar_url),
      tags:blog_post_tags(tag:blog_tags(*))
    `
    )
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching blog post by id:", error);
    return null;
  }

  // Transformar los tags
  const tags = data.tags?.map((t: { tag: BlogTag }) => t.tag) || [];

  const post: BlogPostDetail = {
    ...data,
    category: data.category || null,
    author: data.author || null,
    tags,
  };

  return post;
}

/**
 * Obtener posts por categoría
 * @param locale - Idioma actual del usuario (opcional)
 */
export async function getBlogPostsByCategory(
  categorySlug: string,
  locale?: string
): Promise<BlogPostCard[]> {
  // Primero obtener la categoría
  const category = await getBlogCategoryBySlug(categorySlug);
  if (!category) return [];

  const { data, error } = await supabase
    .from("blog_posts")
    .select(
      `
      id,
      title,
      slug,
      excerpt,
      featured_image,
      published_at,
      views,
      available_languages,
      category:blog_categories(name),
      author:profiles(full_name)
    `
    )
    .eq("category_id", category.id)
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error) {
    console.error("Error fetching posts by category:", error);
    return [];
  }

  const posts: BlogPostCard[] = (data as unknown[]).map((post: unknown) => {
    const p = post as {
      id: string;
      title: string;
      slug: string;
      excerpt?: string;
      featured_image?: string;
      published_at?: string;
      views: number;
      available_languages?: string[];
      category?: { name: string };
      author?: { full_name: string };
    };

    return {
      id: p.id,
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt,
      featured_image: p.featured_image,
      published_at: p.published_at,
      views: p.views,
      category_name: p.category?.name,
      author_name: p.author?.full_name,
    };
  }).filter(post => {
    // Filtrar por idioma si se especifica
    if (!locale) return true;
    const originalPost = (data as unknown[]).find((d: unknown) => (d as { id: string }).id === post.id) as { available_languages?: string[] } | undefined;
    return !originalPost?.available_languages || originalPost.available_languages.includes(locale);
  });

  return posts;
}

/**
 * Buscar posts
 * @param locale - Idioma actual del usuario (opcional)
 */
export async function searchBlogPosts(query: string, locale?: string): Promise<BlogPostCard[]> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select(
      `
      id,
      title,
      slug,
      excerpt,
      featured_image,
      published_at,
      views,
      available_languages,
      category:blog_categories(name),
      author:profiles(full_name)
    `
    )
    .eq("status", "published")
    .or(`title.ilike.%${query}%,excerpt.ilike.%${query}%,content.ilike.%${query}%`)
    .order("published_at", { ascending: false });

  if (error) {
    console.error("Error searching blog posts:", error);
    return [];
  }

  const posts: BlogPostCard[] = (data as unknown[]).map((post: unknown) => {
    const p = post as {
      id: string;
      title: string;
      slug: string;
      excerpt?: string;
      featured_image?: string;
      published_at?: string;
      views: number;
      available_languages?: string[];
      category?: { name: string };
      author?: { full_name: string };
    };

    return {
      id: p.id,
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt,
      featured_image: p.featured_image,
      published_at: p.published_at,
      views: p.views,
      category_name: p.category?.name,
      author_name: p.author?.full_name,
    };
  }).filter(post => {
    // Filtrar por idioma si se especifica
    if (!locale) return true;
    const originalPost = (data as unknown[]).find((d: unknown) => (d as { id: string }).id === post.id) as { available_languages?: string[] } | undefined;
    return !originalPost?.available_languages || originalPost.available_languages.includes(locale);
  });

  return posts;
}

/**
 * Incrementar contador de vistas de un post
 */
export async function incrementBlogPostViews(postId: string): Promise<void> {
  const { error } = await supabase.rpc("increment", {
    row_id: postId,
  });

  if (error) {
    // Si la función RPC no existe, usar UPDATE manual
    const { data: post } = await supabase
      .from("blog_posts")
      .select("views")
      .eq("id", postId)
      .single();

    if (post) {
      await supabase
        .from("blog_posts")
        .update({ views: post.views + 1 })
        .eq("id", postId);
    }
  }
}

// ================================================
// POSTS - UPDATE
// ================================================

/**
 * Actualizar un post existente
 */
export async function updateBlogPost(
  postId: string,
  updates: UpdateBlogPostData
): Promise<BlogPost | null> {
  try {
    const dataToUpdate: Record<string, unknown> = {};

    // Actualizar campos básicos
    if (updates.title) {
      dataToUpdate.title = updates.title;
      // Regenerar slug si cambia el título
      dataToUpdate.slug = updates.title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    }

    if (updates.excerpt !== undefined) dataToUpdate.excerpt = updates.excerpt;
    if (updates.content) dataToUpdate.content = updates.content;
    if (updates.category_id !== undefined)
      dataToUpdate.category_id = updates.category_id || null;
    if (updates.available_languages !== undefined)
      dataToUpdate.available_languages = updates.available_languages;
    if (updates.status) {
      dataToUpdate.status = updates.status;
      // Si se publica por primera vez, establecer published_at
      if (updates.status === "published") {
        const { data: currentPost } = await supabase
          .from("blog_posts")
          .select("published_at")
          .eq("id", postId)
          .single();

        if (currentPost && !currentPost.published_at) {
          dataToUpdate.published_at = new Date().toISOString();
        }
      }
    }

    // Subir nueva imagen si existe
    if (updates.featured_image) {
      const { data: currentPost } = await supabase
        .from("blog_posts")
        .select("slug")
        .eq("id", postId)
        .single();

      const slug = currentPost?.slug || "post";
      const fileExt = updates.featured_image.name.split(".").pop();
      const fileName = `${Date.now()}-${slug}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("blog-images")
        .upload(fileName, updates.featured_image);

      if (uploadError) {
        console.error("Error uploading image:", uploadError);
      } else {
        const {
          data: { publicUrl },
        } = supabase.storage.from("blog-images").getPublicUrl(fileName);

        dataToUpdate.featured_image = publicUrl;
      }
    }

    // Actualizar el post
    const { data: post, error: updateError } = await supabase
      .from("blog_posts")
      .update(dataToUpdate)
      .eq("id", postId)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating post:", updateError);
      throw updateError;
    }

    // Actualizar tags si se proporcionaron
    if (updates.tags) {
      // Eliminar tags actuales
      await supabase.from("blog_post_tags").delete().eq("post_id", postId);

      // Crear o obtener nuevas tags
      if (updates.tags.length > 0) {
        const tags = await getOrCreateTags(updates.tags);

        const postTagRelations = tags.map((tag) => ({
          post_id: postId,
          tag_id: tag.id,
        }));

        await supabase.from("blog_post_tags").insert(postTagRelations);
      }
    }

    return post;
  } catch (error) {
    console.error("Error in updateBlogPost:", error);
    return null;
  }
}

// ================================================
// POSTS - DELETE
// ================================================

/**
 * Eliminar un post (hard delete)
 */
export async function deleteBlogPost(postId: string): Promise<boolean> {
  const { error } = await supabase.from("blog_posts").delete().eq("id", postId);

  if (error) {
    console.error("Error deleting post:", error);
    return false;
  }

  return true;
}
