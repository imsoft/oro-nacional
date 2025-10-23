import { supabase } from "./client";
import type { Product, ProductDetail, ProductListItem, FeaturedCategory } from "@/types/product";

/**
 * Get all active products with their categories and primary images
 * For catalog and general listing
 */
export async function getProducts() {
  const { data, error } = await supabase
    .from("products")
    .select(
      `
      id,
      name,
      slug,
      description,
      price,
      stock,
      material,
      is_active,
      category:product_categories(id, name, slug),
      images:product_images(id, image_url, is_primary)
    `
    )
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching products:", error);
    return [];
  }

  return data as unknown as Product[];
}

/**
 * Get all products (including inactive) for admin
 */
export async function getAllProducts() {
  const { data, error } = await supabase
    .from("products")
    .select(
      `
      id,
      name,
      slug,
      price,
      stock,
      material,
      is_active,
      created_at,
      category:product_categories(id, name),
      images:product_images(image_url, is_primary)
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching all products:", error);
    return [];
  }

  // Transform data for admin list view
  const products: ProductListItem[] = (data as unknown[]).map((product: unknown) => {
    const p = product as {
      id: string;
      name: string;
      slug: string;
      price: number;
      stock: number;
      material: string;
      is_active: boolean;
      category?: { name: string };
      images?: Array<{ is_primary: boolean; image_url: string }>;
    };
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      stock: p.stock,
      material: p.material,
      is_active: p.is_active,
      category_name: p.category?.name,
      primary_image: p.images?.find((img) => img.is_primary)?.image_url,
    };
  });

  return products;
}

/**
 * Get a single product by slug with all related data
 * For product detail page
 */
export async function getProductBySlug(slug: string) {
  const { data, error } = await supabase
    .from("products")
    .select(
      `
      id,
      name,
      slug,
      description,
      price,
      stock,
      material,
      weight,
      has_engraving,
      is_active,
      created_at,
      updated_at,
      category:product_categories(id, name, slug, description),
      images:product_images(id, image_url, alt_text, display_order, is_primary, created_at),
      specifications:product_specifications(id, spec_key, spec_value, display_order),
      sizes:product_sizes(id, size, stock)
    `
    )
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error) {
    console.error("Error fetching product by slug:", error);
    return null;
  }

  return data as unknown as ProductDetail;
}

/**
 * Get a single product by ID (for admin)
 */
export async function getProductById(id: string) {
  const { data, error } = await supabase
    .from("products")
    .select(
      `
      id,
      name,
      slug,
      description,
      price,
      stock,
      material,
      weight,
      has_engraving,
      is_active,
      category_id,
      created_at,
      updated_at,
      category:product_categories(id, name, slug),
      images:product_images(id, image_url, alt_text, display_order, is_primary),
      specifications:product_specifications(id, spec_key, spec_value, display_order),
      sizes:product_sizes(id, size, stock)
    `
    )
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching product by ID:", error);
    return null;
  }

  return data as unknown as ProductDetail;
}

/**
 * Get products by category
 */
export async function getProductsByCategory(categorySlug: string) {
  const { data, error } = await supabase
    .from("products")
    .select(
      `
      id,
      name,
      slug,
      description,
      price,
      stock,
      material,
      is_active,
      category:product_categories!inner(id, name, slug),
      images:product_images(id, image_url, is_primary)
    `
    )
    .eq("is_active", true)
    .eq("category.slug", categorySlug)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching products by category:", error);
    return [];
  }

  return data as unknown as Product[];
}

/**
 * Get all categories
 */
export async function getCategories() {
  const { data, error } = await supabase
    .from("product_categories")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching categories:", error);
    return [];
  }

  return data;
}

/**
 * Search products by name or description
 */
export async function searchProducts(query: string) {
  const { data, error } = await supabase
    .from("products")
    .select(
      `
      id,
      name,
      slug,
      description,
      price,
      stock,
      material,
      is_active,
      category:product_categories(id, name, slug),
      images:product_images(id, image_url, is_primary)
    `
    )
    .eq("is_active", true)
    .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error searching products:", error);
    return [];
  }

  return data as unknown as Product[];
}

/**
 * Update a product
 */
export async function updateProduct(
  productId: string,
  updates: {
    name?: string;
    description?: string;
    category_id?: string | null;
    price?: number;
    stock?: number;
    material?: string;
    weight?: number | null;
    has_engraving?: boolean;
    is_active?: boolean;
  }
) {
  // Generate slug if name is being updated
  const dataToUpdate: Record<string, unknown> = { ...updates };
  if (updates.name) {
    dataToUpdate.slug = updates.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  const { data, error } = await supabase
    .from("products")
    .update(dataToUpdate)
    .eq("id", productId)
    .select()
    .single();

  if (error) {
    console.error("Error updating product:", error);
    throw error;
  }

  return data;
}

/**
 * Delete product images
 */
export async function deleteProductImages(imageIds: string[]) {
  const { error } = await supabase
    .from("product_images")
    .delete()
    .in("id", imageIds);

  if (error) {
    console.error("Error deleting product images:", error);
    throw error;
  }
}

/**
 * Add product images
 */
export async function addProductImages(
  productId: string,
  images: Array<{ file: File; isPrimary: boolean; displayOrder: number }>
) {
  const uploadedImages = [];

  for (const image of images) {
    const fileExt = image.file.name.split(".").pop();
    const fileName = `${productId}/${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)}.${fileExt}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(fileName, image.file);

    if (uploadError) {
      console.error("Error uploading image:", uploadError);
      throw uploadError;
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("product-images").getPublicUrl(fileName);

    // Create image record
    const { data, error: imageError } = await supabase
      .from("product_images")
      .insert({
        product_id: productId,
        image_url: publicUrl,
        alt_text: "",
        display_order: image.displayOrder,
        is_primary: image.isPrimary,
      })
      .select()
      .single();

    if (imageError) {
      console.error("Error creating image record:", imageError);
      throw imageError;
    }

    uploadedImages.push(data);
  }

  return uploadedImages;
}

/**
 * Update product image properties
 */
export async function updateProductImage(
  imageId: string,
  updates: {
    is_primary?: boolean;
    display_order?: number;
    alt_text?: string;
  }
) {
  const { error } = await supabase
    .from("product_images")
    .update(updates)
    .eq("id", imageId);

  if (error) {
    console.error("Error updating product image:", error);
    throw error;
  }
}

/**
 * Delete all specifications for a product
 */
export async function deleteProductSpecifications(productId: string) {
  const { error } = await supabase
    .from("product_specifications")
    .delete()
    .eq("product_id", productId);

  if (error) {
    console.error("Error deleting specifications:", error);
    throw error;
  }
}

/**
 * Add product specifications
 */
export async function addProductSpecifications(
  productId: string,
  specifications: Array<{ key: string; value: string; displayOrder: number }>
) {
  const { error } = await supabase.from("product_specifications").insert(
    specifications.map((spec) => ({
      product_id: productId,
      spec_key: spec.key,
      spec_value: spec.value,
      display_order: spec.displayOrder,
    }))
  );

  if (error) {
    console.error("Error adding specifications:", error);
    throw error;
  }
}

/**
 * Delete all sizes for a product
 */
export async function deleteProductSizes(productId: string) {
  const { error } = await supabase
    .from("product_sizes")
    .delete()
    .eq("product_id", productId);

  if (error) {
    console.error("Error deleting sizes:", error);
    throw error;
  }
}

/**
 * Add product sizes
 */
export async function addProductSizes(
  productId: string,
  sizes: Array<{ size: string; stock: number }>
) {
  const { error } = await supabase.from("product_sizes").insert(
    sizes.map((size) => ({
      product_id: productId,
      size: size.size,
      stock: size.stock,
    }))
  );

  if (error) {
    console.error("Error adding sizes:", error);
    throw error;
  }
}

/**
 * Delete a product (soft delete by setting is_active to false)
 */
export async function softDeleteProduct(productId: string) {
  const { error } = await supabase
    .from("products")
    .update({ is_active: false })
    .eq("id", productId);

  if (error) {
    console.error("Error soft deleting product:", error);
    throw error;
  }
}

/**
 * Delete a product permanently (hard delete)
 * This will also delete all related records due to CASCADE
 */
export async function hardDeleteProduct(productId: string) {
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId);

  if (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
}

/**
 * Get featured categories for homepage
 */
export async function getFeaturedCategories(): Promise<FeaturedCategory[]> {
  try {
    const { data, error } = await supabase.rpc("get_featured_categories");

    if (error) {
      console.error("Error fetching featured categories:", error);
      return [];
    }

    return data as FeaturedCategory[];
  } catch (error) {
    console.error("Error in getFeaturedCategories:", error);
    return [];
  }
}
