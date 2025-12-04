// ================================================
// TIPOS PARA CONTENIDO MULTILINGÜE
// ================================================

export type Locale = 'es' | 'en';

export interface MultilingualText {
  es: string;
  en: string;
}

export interface MultilingualContent {
  es: string;
  en: string;
}

// ================================================
// TIPOS PARA PRODUCTOS MULTILINGÜES
// ================================================

export interface MultilingualProduct {
  id: string;
  name: MultilingualText;
  slug: MultilingualText;
  description: MultilingualContent;
  material: MultilingualText;
  category_id: string;
  price: number;
  stock: number;
  weight?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category?: MultilingualCategory;
  images?: ProductImage[];
  specifications?: MultilingualSpecification[];
  sizes?: ProductSize[];
}

export interface MultilingualCategory {
  id: string;
  name: MultilingualText;
  slug: MultilingualText;
  description?: MultilingualContent;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface MultilingualSpecification {
  id: string;
  product_id: string;
  spec_key: MultilingualText;
  spec_value: MultilingualText;
  display_order: number;
  created_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  alt_text?: MultilingualText;
  display_order: number;
  is_primary: boolean;
  created_at: string;
}

export interface ProductSize {
  id: string;
  product_id: string;
  size: string;
  stock: number;
  price?: number; // Individual price for this size
  weight?: number; // Gramos de oro
  created_at: string;
}

// ================================================
// TIPOS PARA BLOG MULTILINGÜE
// ================================================

export interface MultilingualBlogPost {
  id: string;
  title: MultilingualText;
  slug: MultilingualText;
  excerpt?: MultilingualContent;
  content: MultilingualContent;
  featured_image?: string;
  category_id?: string;
  author_id: string;
  status: 'draft' | 'published';
  views: number;
  published_at?: string;
  created_at: string;
  updated_at: string;
  category?: MultilingualBlogCategory;
  author?: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
  };
  tags?: MultilingualBlogTag[];
}

export interface MultilingualBlogCategory {
  id: string;
  name: MultilingualText;
  slug: MultilingualText;
  description?: MultilingualContent;
  created_at: string;
  updated_at: string;
}

export interface MultilingualBlogTag {
  id: string;
  name: MultilingualText;
  slug: MultilingualText;
  created_at: string;
}

// ================================================
// TIPOS PARA CREACIÓN/EDICIÓN MULTILINGÜE
// ================================================

export interface CreateMultilingualProductData {
  name: MultilingualText;
  description: MultilingualContent;
  material: MultilingualText;
  category_id: string;
  price: number;
  stock: number;
  weight?: number;
  base_price_usd?: number | null;
  is_active: boolean;
  available_languages?: string[]; // ['es', 'en'] o ['es'] o ['en']
  specifications?: Array<{
    spec_key: MultilingualText;
    spec_value: MultilingualText;
    display_order: number;
  }>;
  sizes?: Array<{
    size: string;
    stock: number;
    price?: number;
    price_usd?: number | null;
    weight?: number; // Gramos de oro
  }>;
  images?: File[]; // Files to upload
}

export interface UpdateMultilingualProductData {
  name?: MultilingualText;
  description?: MultilingualContent;
  material?: MultilingualText;
  category_id?: string;
  price?: number;
  stock?: number;
  weight?: number;
  base_price_usd?: number | null;
  has_engraving?: boolean;
  is_active?: boolean;
  available_languages?: string[]; // ['es', 'en'] o ['es'] o ['en']
  specifications?: Array<{
    spec_key: MultilingualText;
    spec_value: MultilingualText;
    display_order: number;
  }>;
  sizes?: Array<{
    size: string;
    stock: number;
    price?: number;
    price_usd?: number | null;
    weight?: number; // Gramos de oro
  }>;
}

export interface CreateMultilingualBlogPostData {
  title: MultilingualText;
  excerpt?: MultilingualContent;
  content: MultilingualContent;
  featured_image?: File;
  category_id?: string;
  status: 'draft' | 'published';
  tags?: string[];
  available_languages?: string[]; // ['es', 'en'] o ['es'] o ['en']
}

export interface UpdateMultilingualBlogPostData {
  title?: MultilingualText;
  excerpt?: MultilingualContent;
  content?: MultilingualContent;
  featured_image?: File;
  category_id?: string;
  status?: 'draft' | 'published';
  tags?: string[];
  available_languages?: string[]; // ['es', 'en'] o ['es'] o ['en']
}

// ================================================
// TIPOS PARA FORMULARIOS DE ADMINISTRACIÓN
// ================================================

export interface MultilingualFormData {
  es: string;
  en: string;
}

export interface ProductFormData {
  name: MultilingualFormData;
  description: MultilingualFormData;
  material: MultilingualFormData;
  category_id: string;
  internal_category_id?: string; // ID de categoría interna (solo una)
  internal_subcategory_id?: string; // ID de subcategoría interna (solo una)
  price: number;
  stock?: number; // Ya no se usa, pero se mantiene para compatibilidad
  weight?: number;
  is_active: boolean;
  available_languages: string[]; // ['es', 'en'] o ['es'] o ['en']
  specifications: Array<{
    spec_key: MultilingualFormData;
    spec_value: MultilingualFormData;
    display_order: number;
  }>;
  sizes: Array<{
    size: string;
    stock: number;
    price: number;
    price_usd?: number | null;
    weight?: number; // Gramos de oro
    display_order?: number;
  }>;
  images?: File[]; // Files to upload
  existing_images?: Array<{
    id?: string;
    image_url: string;
    alt_text?: MultilingualFormData;
    display_order: number;
    is_primary: boolean;
  }>;
}

export interface BlogPostFormData {
  title: MultilingualFormData;
  excerpt: MultilingualFormData;
  content: MultilingualFormData;
  category_id?: string;
  status: 'draft' | 'published';
  tags: string[];
  available_languages: string[]; // ['es', 'en'] o ['es'] o ['en']
}

// ================================================
// UTILIDADES PARA TRABAJAR CON CONTENIDO MULTILINGÜE
// ================================================

export const getLocalizedText = (text: MultilingualText, locale: Locale): string => {
  return text[locale] || text.es || text.en || '';
};

export const getLocalizedContent = (content: MultilingualContent, locale: Locale): string => {
  return content[locale] || content.es || content.en || '';
};

export const createMultilingualText = (es: string, en: string): MultilingualText => ({
  es,
  en
});

export const createMultilingualContent = (es: string, en: string): MultilingualContent => ({
  es,
  en
});

export const generateSlug = (text: MultilingualText, locale: Locale): string => {
  const baseText = getLocalizedText(text, locale);
  return baseText
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const generateMultilingualSlug = (text: MultilingualText): MultilingualText => {
  const slugEs = generateSlug(text, 'es');
  const slugEn = text.en && text.en.trim() !== '' ? generateSlug(text, 'en') : slugEs;

  return {
    es: slugEs,
    en: slugEn
  };
};
