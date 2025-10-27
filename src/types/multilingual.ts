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
  has_engraving: boolean;
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
  has_engraving: boolean;
  is_active: boolean;
  specifications?: Array<{
    spec_key: MultilingualText;
    spec_value: MultilingualText;
    display_order: number;
  }>;
  sizes?: Array<{
    size: string;
    stock: number;
  }>;
}

export interface UpdateMultilingualProductData {
  name?: MultilingualText;
  description?: MultilingualContent;
  material?: MultilingualText;
  category_id?: string;
  price?: number;
  stock?: number;
  weight?: number;
  has_engraving?: boolean;
  is_active?: boolean;
}

export interface CreateMultilingualBlogPostData {
  title: MultilingualText;
  excerpt?: MultilingualContent;
  content: MultilingualContent;
  featured_image?: File;
  category_id?: string;
  status: 'draft' | 'published';
  tags?: string[];
}

export interface UpdateMultilingualBlogPostData {
  title?: MultilingualText;
  excerpt?: MultilingualContent;
  content?: MultilingualContent;
  featured_image?: File;
  category_id?: string;
  status?: 'draft' | 'published';
  tags?: string[];
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
  price: number;
  stock: number;
  weight?: number;
  has_engraving: boolean;
  is_active: boolean;
  specifications: Array<{
    spec_key: MultilingualFormData;
    spec_value: MultilingualFormData;
    display_order: number;
  }>;
  sizes: Array<{
    size: string;
    stock: number;
  }>;
}

export interface BlogPostFormData {
  title: MultilingualFormData;
  excerpt: MultilingualFormData;
  content: MultilingualFormData;
  category_id?: string;
  status: 'draft' | 'published';
  tags: string[];
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

export const generateMultilingualSlug = (text: MultilingualText): MultilingualText => ({
  es: generateSlug(text, 'es'),
  en: generateSlug(text, 'en')
});
