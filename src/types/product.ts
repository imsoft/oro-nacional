// Types for products from Supabase database

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  is_featured?: boolean;
  display_order?: number;
  created_at: string;
  updated_at: string;
}

export interface FeaturedCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  display_order: number;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  alt_text?: string;
  display_order: number;
  is_primary: boolean;
  created_at: string;
}

export interface ProductSpecification {
  id: string;
  product_id: string;
  spec_key: string;
  spec_value: string;
  display_order: number;
  created_at: string;
}

export interface ProductSize {
  id: string;
  product_id: string;
  size: string;
  stock: number;
  price?: number;
  display_order?: number;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  category_id?: string;
  price: number;
  stock: number;
  material: string;
  weight?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;

  // Relations (populated with joins)
  category?: ProductCategory | null;
  images?: ProductImage[];
  specifications?: ProductSpecification[];
  sizes?: ProductSize[];
}

// Helper type for product list display
export interface ProductListItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  material: string;
  is_active: boolean;
  category_name?: string;
  primary_image?: string;
}

// Helper type for product card display
export interface ProductCard {
  id: string;
  name: string;
  slug: string;
  price: number;
  material: string;
  category_name?: string;
  primary_image?: string;
}

// Helper type for product detail page
export interface ProductDetail extends Product {
  category: ProductCategory | null;
  images: ProductImage[];
  specifications: ProductSpecification[];
  sizes: ProductSize[];
}
