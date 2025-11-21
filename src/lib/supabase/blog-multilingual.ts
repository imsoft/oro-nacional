import { supabase } from "./client";
import type { 
  CreateMultilingualBlogPostData,
  UpdateMultilingualBlogPostData,
  Locale
} from "@/types/multilingual";
import { getLocalizedText, getLocalizedContent, generateMultilingualSlug } from "@/types/multilingual";

// ================================================
// FUNCIONES DE BLOG MULTILINGÜES
// ================================================

/**
 * Obtener todos los posts de blog publicados con contenido localizado
 */
export async function getBlogPosts(locale: Locale = 'es', limit?: number) {
  let query = supabase
    .from("blog_posts")
    .select(`
      id,
      title_es,
      title_en,
      slug_es,
      slug_en,
      excerpt_es,
      excerpt_en,
      content_es,
      content_en,
      featured_image,
      status,
      views,
      available_languages,
      published_at,
      created_at,
      updated_at,
      category:blog_categories(
        id,
        name_es,
        name_en,
        slug_es,
        slug_en
      ),
      author:profiles(
        id,
        full_name,
        email,
        avatar_url
      ),
      tags:blog_post_tags(
        tag:blog_tags(
          id,
          name_es,
          name_en,
          slug_es,
          slug_en
        )
      )
    `)
    .eq("status", "published")
    .contains("available_languages", [locale])
    .order("published_at", { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching blog posts:", error);
    return [];
  }

  return data.map(transformBlogPostForLocale(locale));
}

/**
 * Obtener todos los posts de blog (incluyendo borradores) para admin
 */
export async function getAllBlogPosts(locale: Locale = 'es') {
  const { data, error } = await supabase
    .from("blog_posts")
    .select(`
      id,
      title_es,
      title_en,
      slug_es,
      slug_en,
      status,
      views,
      published_at,
      created_at,
      updated_at,
      category:blog_categories(
        id,
        name_es,
        name_en
      ),
      author:profiles(
        id,
        full_name,
        email
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching all blog posts:", error);
    return [];
  }

  return data.map((post: Record<string, unknown>) => ({
    id: post.id,
    title: getLocalizedText({ es: post.title_es as string, en: post.title_en as string }, locale),
    slug: getLocalizedText({ es: post.slug_es as string, en: post.slug_en as string }, locale),
    status: post.status,
    views: post.views,
    published_at: post.published_at,
    created_at: post.created_at,
    updated_at: post.updated_at,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    category_name: post.category ? getLocalizedText({ es: (post.category as any).name_es, en: (post.category as any).name_en }, locale) : null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    author_name: (post.author as any)?.full_name || 'Usuario',
  }));
}

/**
 * Obtener un post de blog por slug con contenido localizado
 */
export async function getBlogPostBySlug(slug: string, locale: Locale = 'es') {
  const slugColumn = locale === 'en' ? 'slug_en' : 'slug_es';
  
  const { data, error } = await supabase
    .from("blog_posts")
    .select(`
      id,
      title_es,
      title_en,
      slug_es,
      slug_en,
      excerpt_es,
      excerpt_en,
      content_es,
      content_en,
      featured_image,
      status,
      views,
      published_at,
      created_at,
      updated_at,
      category:blog_categories(
        id,
        name_es,
        name_en,
        slug_es,
        slug_en,
        description_es,
        description_en
      ),
      author:profiles(
        id,
        full_name,
        email,
        avatar_url
      ),
      tags:blog_post_tags(
        tag:blog_tags(
          id,
          name_es,
          name_en,
          slug_es,
          slug_en
        )
      )
    `)
    .eq(slugColumn, slug)
    .eq("status", "published")
    .contains("available_languages", [locale])
    .single();

  if (error) {
    console.error("Error fetching blog post by slug:", error);
    return null;
  }

  return transformBlogPostForLocale(locale)(data);
}

/**
 * Obtener un post de blog por ID (para admin)
 */
export async function getBlogPostById(id: string, locale: Locale = 'es') {
  const { data, error } = await supabase
    .from("blog_posts")
    .select(`
      id,
      title_es,
      title_en,
      slug_es,
      slug_en,
      excerpt_es,
      excerpt_en,
      content_es,
      content_en,
      featured_image,
      status,
      views,
      available_languages,
      published_at,
      created_at,
      updated_at,
      category_id,
      author_id,
      category:blog_categories(
        id,
        name_es,
        name_en,
        slug_es,
        slug_en
      ),
      author:profiles(
        id,
        full_name,
        email,
        avatar_url
      ),
      tags:blog_post_tags(
        tag:blog_tags(
          id,
          name_es,
          name_en,
          slug_es,
          slug_en
        )
      )
    `)
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching blog post by ID:", error);
    return null;
  }

  return transformBlogPostForLocale(locale)(data);
}

/**
 * Obtener posts de blog por categoría con contenido localizado
 */
export async function getBlogPostsByCategory(categorySlug: string, locale: Locale = 'es') {
  const categorySlugColumn = locale === 'en' ? 'slug_en' : 'slug_es';
  
  const { data, error } = await supabase
    .from("blog_posts")
    .select(`
      id,
      title_es,
      title_en,
      slug_es,
      slug_en,
      excerpt_es,
      excerpt_en,
      featured_image,
      status,
      views,
      published_at,
      created_at,
      category:blog_categories!inner(
        id,
        name_es,
        name_en,
        slug_es,
        slug_en
      ),
      author:profiles(
        id,
        full_name,
        email,
        avatar_url
      )
    `)
    .eq("status", "published")
    .contains("available_languages", [locale])
    .eq(`category.${categorySlugColumn}`, categorySlug)
    .order("published_at", { ascending: false });

  if (error) {
    console.error("Error fetching blog posts by category:", error);
    return [];
  }

  return data.map(transformBlogPostForLocale(locale));
}

/**
 * Obtener todas las categorías de blog con contenido localizado
 */
export async function getBlogCategories(locale: Locale = 'es') {
  const { data, error } = await supabase
    .from("blog_categories")
    .select(`
      id,
      name_es,
      name_en,
      slug_es,
      slug_en,
      description_es,
      description_en,
      created_at,
      updated_at
    `)
    .order("name_es", { ascending: true });

  if (error) {
    console.error("Error fetching blog categories:", error);
    return [];
  }

  return data.map((category: Record<string, unknown>) => ({
    id: category.id as string,
    name: getLocalizedText({ es: category.name_es as string, en: category.name_en as string }, locale),
    slug: getLocalizedText({ es: category.slug_es as string, en: category.slug_en as string }, locale),
    description: getLocalizedContent({ es: category.description_es as string, en: category.description_en as string }, locale),
    created_at: category.created_at,
    updated_at: category.updated_at,
  }));
}

/**
 * Obtener todas las etiquetas de blog con contenido localizado
 */
export async function getBlogTags(locale: Locale = 'es') {
  const { data, error } = await supabase
    .from("blog_tags")
    .select(`
      id,
      name_es,
      name_en,
      slug_es,
      slug_en,
      created_at
    `)
    .order("name_es", { ascending: true });

  if (error) {
    console.error("Error fetching blog tags:", error);
    return [];
  }

  return data.map((tag: Record<string, unknown>) => ({
    id: tag.id as string,
    name: getLocalizedText({ es: tag.name_es as string, en: tag.name_en as string }, locale),
    slug: getLocalizedText({ es: tag.slug_es as string, en: tag.slug_en as string }, locale),
    created_at: tag.created_at,
  }));
}

/**
 * Buscar posts de blog con contenido localizado
 */
export async function searchBlogPosts(query: string, locale: Locale = 'es') {
  const titleColumn = locale === 'en' ? 'title_en' : 'title_es';
  const contentColumn = locale === 'en' ? 'content_en' : 'content_es';
  
  const { data, error } = await supabase
    .from("blog_posts")
    .select(`
      id,
      title_es,
      title_en,
      slug_es,
      slug_en,
      excerpt_es,
      excerpt_en,
      featured_image,
      status,
      views,
      published_at,
      created_at,
      category:blog_categories(
        id,
        name_es,
        name_en,
        slug_es,
        slug_en
      ),
      author:profiles(
        id,
        full_name,
        email,
        avatar_url
      )
    `)
    .eq("status", "published")
    .contains("available_languages", [locale])
    .or(`${titleColumn}.ilike.%${query}%,${contentColumn}.ilike.%${query}%`)
    .order("published_at", { ascending: false });

  if (error) {
    console.error("Error searching blog posts:", error);
    return [];
  }

  return data.map(transformBlogPostForLocale(locale));
}

/**
 * Incrementar el contador de vistas de un post
 */
export async function incrementBlogPostViews(postId: string) {
  const { error } = await supabase.rpc('increment_blog_views', { post_id: postId });

  if (error) {
    console.error("Error incrementing blog post views:", error);
  }
}

/**
 * Crear un nuevo post de blog con contenido multilingüe
 */
export async function createBlogPost(
  postData: CreateMultilingualBlogPostData,
  authorId: string
) {
  try {
    // Generar slugs multilingües
    const slugs = generateMultilingualSlug(postData.title);

    // Insertar el post
    const { data: post, error: postError } = await supabase
      .from("blog_posts")
      .insert({
        // Columnas legacy (usar español como fallback)
        title: postData.title.es || postData.title.en || '',
        slug: slugs.es || slugs.en || '',
        excerpt: postData.excerpt?.es || postData.excerpt?.en || null,
        content: postData.content.es || postData.content.en || '',
        // Columnas multilingües
        title_es: postData.title.es,
        title_en: postData.title.en,
        slug_es: slugs.es,
        slug_en: slugs.en,
        excerpt_es: postData.excerpt?.es,
        excerpt_en: postData.excerpt?.en,
        content_es: postData.content.es,
        content_en: postData.content.en,
        featured_image: postData.featured_image?.name,
        category_id: postData.category_id,
        author_id: authorId,
        status: postData.status,
        available_languages: postData.available_languages || ['es', 'en'],
        published_at: postData.status === 'published' ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (postError) {
      console.error("Error creating blog post:", postError);
      throw postError;
    }

    // Insertar etiquetas si existen
    if (postData.tags && postData.tags.length > 0) {
      const postTags = postData.tags.map((tagId) => ({
        post_id: post.id,
        tag_id: tagId,
      }));

      const { error: tagsError } = await supabase
        .from("blog_post_tags")
        .insert(postTags);

      if (tagsError) {
        console.error("Error creating blog post tags:", tagsError);
      }
    }

    return post;
  } catch (error) {
    console.error("Error in createBlogPost:", error);
    throw error;
  }
}

/**
 * Actualizar un post de blog existente
 */
export async function updateBlogPost(
  postId: string,
  updates: UpdateMultilingualBlogPostData
) {
  try {
    const dataToUpdate: Record<string, unknown> = {};

    // Actualizar campos básicos
    if (updates.title) {
      // Columnas legacy (usar español como fallback)
      dataToUpdate.title = updates.title.es || updates.title.en || '';
      // Columnas multilingües
      dataToUpdate.title_es = updates.title.es;
      dataToUpdate.title_en = updates.title.en;
      // Regenerar slugs
      const slugs = generateMultilingualSlug(updates.title);
      dataToUpdate.slug = slugs.es || slugs.en || ''; // Columna legacy
      dataToUpdate.slug_es = slugs.es;
      dataToUpdate.slug_en = slugs.en;
    }

    if (updates.excerpt) {
      dataToUpdate.excerpt = updates.excerpt.es || updates.excerpt.en || null; // Columna legacy
      dataToUpdate.excerpt_es = updates.excerpt.es;
      dataToUpdate.excerpt_en = updates.excerpt.en;
    }

    if (updates.content) {
      dataToUpdate.content = updates.content.es || updates.content.en || ''; // Columna legacy
      dataToUpdate.content_es = updates.content.es;
      dataToUpdate.content_en = updates.content.en;
    }

    // Manejar actualización de imagen destacada
    if (updates.featured_image) {
      // Obtener la imagen antigua para eliminarla del storage
      const { data: currentPost } = await supabase
        .from("blog_posts")
        .select("featured_image")
        .eq("id", postId)
        .single();

      // Eliminar la imagen antigua del storage si existe
      if (currentPost?.featured_image) {
        try {
          const oldImageUrl = currentPost.featured_image;

          if (oldImageUrl.includes('http')) {
            const url = new URL(oldImageUrl);
            const pathParts = url.pathname.split('/');
            const bucketIndex = pathParts.findIndex(part => part === 'blog-images');

            if (bucketIndex !== -1 && bucketIndex < pathParts.length - 1) {
              const filePath = pathParts.slice(bucketIndex + 1).join('/');

              const { error: storageError } = await supabase.storage
                .from("blog-images")
                .remove([filePath]);

              if (storageError) {
                console.error("Error deleting old blog image from storage:", storageError);
              }
            }
          } else {
            const { error: storageError } = await supabase.storage
              .from("blog-images")
              .remove([oldImageUrl]);

            if (storageError) {
              console.error("Error deleting old blog image from storage:", storageError);
            }
          }
        } catch (error) {
          console.error("Error parsing old blog image URL:", error);
        }
      }

      dataToUpdate.featured_image = updates.featured_image.name;
    }

    if (updates.category_id !== undefined) dataToUpdate.category_id = updates.category_id;
    
    if (updates.status !== undefined) {
      dataToUpdate.status = updates.status;
      // Si se está publicando por primera vez, establecer published_at
      if (updates.status === 'published') {
        const { data: currentPost } = await supabase
          .from("blog_posts")
          .select("published_at")
          .eq("id", postId)
          .single();
        
        if (!currentPost?.published_at) {
          dataToUpdate.published_at = new Date().toISOString();
        }
      }
    }

    if (updates.available_languages !== undefined) {
      dataToUpdate.available_languages = updates.available_languages;
    }

    const { data, error } = await supabase
      .from("blog_posts")
      .update(dataToUpdate)
      .eq("id", postId)
      .select()
      .single();

    if (error) {
      console.error("Error updating blog post:", error);
      throw error;
    }

    // Actualizar etiquetas si se proporcionaron
    if (updates.tags !== undefined) {
      // Eliminar etiquetas existentes
      await supabase
        .from("blog_post_tags")
        .delete()
        .eq("post_id", postId);

      // Insertar nuevas etiquetas
      if (updates.tags.length > 0) {
        const postTags = updates.tags.map((tagId) => ({
          post_id: postId,
          tag_id: tagId,
        }));

        const { error: tagsError } = await supabase
          .from("blog_post_tags")
          .insert(postTags);

        if (tagsError) {
          console.error("Error updating blog post tags:", tagsError);
        }
      }
    }

    return data;
  } catch (error) {
    console.error("Error in updateBlogPost:", error);
    throw error;
  }
}

/**
 * Eliminar un post de blog (incluyendo imagen del storage)
 */
export async function deleteBlogPost(postId: string) {
  try {
    // Obtener el post para conseguir la URL de la imagen
    const { data: post, error: fetchError } = await supabase
      .from("blog_posts")
      .select("featured_image")
      .eq("id", postId)
      .single();

    if (fetchError) {
      console.error("Error fetching blog post for deletion:", fetchError);
      throw fetchError;
    }

    // Eliminar etiquetas asociadas primero
    await supabase
      .from("blog_post_tags")
      .delete()
      .eq("post_id", postId);

    // Eliminar el post de la base de datos
    const { error } = await supabase
      .from("blog_posts")
      .delete()
      .eq("id", postId);

    if (error) {
      console.error("Error deleting blog post:", error);
      throw error;
    }

    // Eliminar la imagen del storage si existe
    if (post?.featured_image) {
      try {
        const imageUrl = post.featured_image;

        // Si es una URL completa, extraer el path
        if (imageUrl.includes('http')) {
          const url = new URL(imageUrl);
          const pathParts = url.pathname.split('/');
          const bucketIndex = pathParts.findIndex(part => part === 'blog-images');

          if (bucketIndex !== -1 && bucketIndex < pathParts.length - 1) {
            const filePath = pathParts.slice(bucketIndex + 1).join('/');

            const { error: storageError } = await supabase.storage
              .from("blog-images")
              .remove([filePath]);

            if (storageError) {
              console.error("Error deleting blog image from storage:", storageError);
              // No lanzar error, continuar con la eliminación
            }
          }
        } else {
          // Si es solo el path, eliminar directamente
          const { error: storageError } = await supabase.storage
            .from("blog-images")
            .remove([imageUrl]);

          if (storageError) {
            console.error("Error deleting blog image from storage:", storageError);
          }
        }
      } catch (error) {
        console.error("Error parsing blog image URL:", error);
        // Continuar sin lanzar error
      }
    }

    return true;
  } catch (error) {
    console.error("Error in deleteBlogPost:", error);
    throw error;
  }
}

/**
 * Función auxiliar para transformar datos de blog post según el locale
 */
function transformBlogPostForLocale(locale: Locale) {
  return (post: Record<string, unknown>) => ({
    id: post.id,
    title: getLocalizedText({ es: post.title_es as string, en: post.title_en as string }, locale),
    slug: getLocalizedText({ es: post.slug_es as string, en: post.slug_en as string }, locale),
    excerpt: getLocalizedContent({ es: post.excerpt_es as string, en: post.excerpt_en as string }, locale),
    content: getLocalizedContent({ es: post.content_es as string, en: post.content_en as string }, locale),
    featured_image: post.featured_image,
    status: post.status,
    views: post.views,
    published_at: post.published_at,
    created_at: post.created_at,
    updated_at: post.updated_at,
    category: post.category ? {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      id: (post.category as any).id,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      name: getLocalizedText({ es: (post.category as any).name_es, en: (post.category as any).name_en }, locale),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      slug: getLocalizedText({ es: (post.category as any).slug_es, en: (post.category as any).slug_en }, locale),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      description: getLocalizedContent({ es: (post.category as any).description_es, en: (post.category as any).description_en }, locale),
    } : null,
    author: post.author ? {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      id: (post.author as any).id,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      full_name: (post.author as any).full_name,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      email: (post.author as any).email,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      avatar_url: (post.author as any).avatar_url,
    } : null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tags: (post.tags as any)?.map((pt: Record<string, unknown>) => ({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      id: (pt.tag as any).id,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      name: getLocalizedText({ es: (pt.tag as any).name_es, en: (pt.tag as any).name_en }, locale),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      slug: getLocalizedText({ es: (pt.tag as any).slug_es, en: (pt.tag as any).slug_en }, locale),
    })) || [],
  });
}

// ================================================
// FUNCIONES DE CATEGORÍAS Y ETIQUETAS DE BLOG
// ================================================

/**
 * Obtener todas las categorías de blog (para admin)
 */
export async function getAllBlogCategories() {
  const { data, error } = await supabase
    .from("blog_categories")
    .select(`
      id,
      name_es,
      name_en,
      slug_es,
      slug_en,
      description_es,
      description_en,
      created_at,
      updated_at
    `)
    .order("name_es", { ascending: true });

  if (error) {
    console.error("Error fetching all blog categories:", error);
    return [];
  }

  return data.map((category: Record<string, unknown>) => ({
    id: category.id as string,
    name: {
      es: category.name_es as string,
      en: category.name_en as string,
    },
    slug: {
      es: category.slug_es as string,
      en: category.slug_en as string,
    },
    description: category.description_es || category.description_en ? {
      es: (category.description_es as string) || '',
      en: (category.description_en as string) || '',
    } : undefined,
    created_at: category.created_at as string,
    updated_at: category.updated_at as string,
  }));
}

/**
 * Obtener una categoría de blog por ID (para admin)
 */
export async function getBlogCategoryById(id: string) {
  const { data, error } = await supabase
    .from("blog_categories")
    .select(`
      id,
      name_es,
      name_en,
      slug_es,
      slug_en,
      description_es,
      description_en,
      created_at,
      updated_at
    `)
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching blog category by ID:", error);
    return null;
  }

  return {
    id: data.id,
    name: {
      es: data.name_es,
      en: data.name_en,
    },
    slug: {
      es: data.slug_es,
      en: data.slug_en,
    },
    description: data.description_es || data.description_en ? {
      es: data.description_es || '',
      en: data.description_en || '',
    } : undefined,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

/**
 * Crear una nueva categoría de blog con contenido multilingüe
 */
export async function createBlogCategory(
  categoryData: {
    name: { es: string; en: string };
    description?: { es: string; en: string };
  }
) {
  try {
    const slugs = generateMultilingualSlug(categoryData.name);

    const { data, error } = await supabase
      .from("blog_categories")
      .insert({
        // Columnas legacy (usar español como fallback)
        name: categoryData.name.es || categoryData.name.en || '',
        slug: slugs.es || slugs.en || '',
        description: categoryData.description?.es || categoryData.description?.en || null,
        // Columnas multilingües
        name_es: categoryData.name.es,
        name_en: categoryData.name.en,
        slug_es: slugs.es,
        slug_en: slugs.en,
        description_es: categoryData.description?.es,
        description_en: categoryData.description?.en,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating blog category:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error in createBlogCategory:", error);
    throw error;
  }
}

/**
 * Actualizar una categoría de blog existente
 */
export async function updateBlogCategory(
  categoryId: string,
  updates: {
    name?: { es: string; en: string };
    description?: { es: string; en: string };
  }
) {
  try {
    const dataToUpdate: Record<string, unknown> = {};

    if (updates.name) {
      // Columnas legacy (usar español como fallback)
      dataToUpdate.name = updates.name.es || updates.name.en || '';
      // Columnas multilingües
      dataToUpdate.name_es = updates.name.es;
      dataToUpdate.name_en = updates.name.en;
      // Regenerar slugs
      const slugs = generateMultilingualSlug(updates.name);
      dataToUpdate.slug = slugs.es || slugs.en || ''; // Columna legacy
      dataToUpdate.slug_es = slugs.es;
      dataToUpdate.slug_en = slugs.en;
    }

    if (updates.description !== undefined) {
      dataToUpdate.description = updates.description?.es || updates.description?.en || null; // Columna legacy
      dataToUpdate.description_es = updates.description?.es || null;
      dataToUpdate.description_en = updates.description?.en || null;
    }

    const { data, error } = await supabase
      .from("blog_categories")
      .update(dataToUpdate)
      .eq("id", categoryId)
      .select()
      .single();

    if (error) {
      console.error("Error updating blog category:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error in updateBlogCategory:", error);
    throw error;
  }
}

/**
 * Eliminar una categoría de blog
 */
export async function deleteBlogCategory(categoryId: string) {
  try {
    // Verificar si hay posts usando esta categoría
    const { data: posts, error: checkError } = await supabase
      .from("blog_posts")
      .select("id")
      .eq("category_id", categoryId)
      .limit(1);

    if (checkError) {
      console.error("Error checking blog posts:", checkError);
      throw checkError;
    }

    if (posts && posts.length > 0) {
      throw new Error("Cannot delete category: there are blog posts using this category");
    }

    const { error } = await supabase
      .from("blog_categories")
      .delete()
      .eq("id", categoryId);

    if (error) {
      console.error("Error deleting blog category:", error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Error in deleteBlogCategory:", error);
    throw error;
  }
}

/**
 * Crear una nueva etiqueta de blog con contenido multilingüe
 */
export async function createBlogTag(
  tagData: {
    name: { es: string; en: string };
  }
) {
  try {
    const slugs = generateMultilingualSlug(tagData.name);

    const { data, error } = await supabase
      .from("blog_tags")
      .insert({
        // Columnas legacy (usar español como fallback)
        name: tagData.name.es || tagData.name.en || '',
        slug: slugs.es || slugs.en || '',
        // Columnas multilingües
        name_es: tagData.name.es,
        name_en: tagData.name.en,
        slug_es: slugs.es,
        slug_en: slugs.en,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating blog tag:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error in createBlogTag:", error);
    throw error;
  }
}
