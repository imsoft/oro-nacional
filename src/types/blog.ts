// ================================================
// TIPOS PARA EL SISTEMA DE BLOG
// ================================================

// Categoría de blog
export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

// Etiqueta de blog
export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

// Autor del post (referencia a perfil)
export interface BlogAuthor {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
}

// Post de blog (completo)
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featured_image?: string;
  category_id?: string;
  author_id?: string;
  status: 'draft' | 'published';
  views: number;
  available_languages?: string[]; // ['es', 'en'] o ['es'] o ['en']
  published_at?: string;
  created_at: string;
  updated_at: string;
  // Relaciones opcionales
  category?: BlogCategory | null;
  author?: BlogAuthor | null;
  tags?: BlogTag[];
}

// Post con todas las relaciones cargadas (para detalle)
export interface BlogPostDetail extends BlogPost {
  category: BlogCategory | null;
  author: BlogAuthor | null;
  tags: BlogTag[];
}

// Post para listado en admin
export interface BlogPostListItem {
  id: string;
  title: string;
  slug: string;
  status: 'draft' | 'published';
  views: number;
  published_at?: string;
  created_at: string;
  category_name?: string;
  author_name?: string;
  featured_image?: string;
}

// Post para tarjetas en el blog público
export interface BlogPostCard {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  featured_image?: string;
  category_name?: string;
  author_name?: string;
  published_at?: string;
  views: number;
}

// Datos para crear un nuevo post
export interface CreateBlogPostData {
  title: string;
  excerpt?: string;
  content: string;
  featured_image?: File;
  category_id?: string;
  status: 'draft' | 'published';
  tags?: string[]; // Array de nombres de etiquetas
  available_languages?: string[]; // ['es', 'en'] o ['es'] o ['en']
}

// Datos para actualizar un post
export interface UpdateBlogPostData {
  title?: string;
  excerpt?: string;
  content?: string;
  featured_image?: File;
  category_id?: string;
  status?: 'draft' | 'published';
  tags?: string[]; // Array de nombres de etiquetas
  available_languages?: string[]; // ['es', 'en'] o ['es'] o ['en']
}

// Relación post-tag
export interface BlogPostTag {
  post_id: string;
  tag_id: string;
  created_at: string;
}
