import { supabase } from "./client";
import type { 
  MultilingualProduct, 
  MultilingualCategory, 
  MultilingualSpecification,
  ProductImage,
  ProductSize,
  CreateMultilingualProductData,
  UpdateMultilingualProductData,
  Locale
} from "@/types/multilingual";
import { getLocalizedText, getLocalizedContent, generateMultilingualSlug } from "@/types/multilingual";

// ================================================
// FUNCIONES DE PRODUCTOS MULTILINGÜES
// ================================================

/**
 * Obtener todos los productos activos con contenido localizado
 */
export async function getProducts(locale: Locale = 'es') {
  const { data, error } = await supabase
    .from("products")
    .select(`
      id,
      name_es,
      name_en,
      slug_es,
      slug_en,
      description_es,
      description_en,
      material_es,
      material_en,
      price,
      stock,
      weight,
      has_engraving,
      is_active,
      created_at,
      updated_at,
      category:product_categories(
        id,
        name_es,
        name_en,
        slug_es,
        slug_en,
        description_es,
        description_en
      ),
      images:product_images(
        id,
        image_url,
        alt_text_es,
        alt_text_en,
        display_order,
        is_primary
      ),
      specifications:product_specifications(
        id,
        spec_key_es,
        spec_key_en,
        spec_value_es,
        spec_value_en,
        display_order
      ),
      sizes:product_sizes(
        id,
        size,
        stock
      )
    `)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching products:", error);
    return [];
  }

  // Transformar datos para usar contenido localizado
  return data.map(transformProductForLocale(locale));
}

/**
 * Obtener todos los productos (incluyendo inactivos) para admin
 */
export async function getAllProducts(locale: Locale = 'es') {
  const { data, error } = await supabase
    .from("products")
    .select(`
      id,
      name_es,
      name_en,
      slug_es,
      slug_en,
      price,
      stock,
      material_es,
      material_en,
      is_active,
      created_at,
      category:product_categories(
        id,
        name_es,
        name_en
      ),
      images:product_images(
        image_url,
        is_primary
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching all products:", error);
    return [];
  }

  return data.map((product: Record<string, unknown>) => ({
    id: product.id,
    name: getLocalizedText({ es: product.name_es as string, en: product.name_en as string }, locale),
    slug: getLocalizedText({ es: product.slug_es as string, en: product.slug_en as string }, locale),
    price: product.price,
    stock: product.stock,
    material: getLocalizedText({ es: product.material_es as string, en: product.material_en as string }, locale),
    is_active: product.is_active,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    category_name: product.category ? getLocalizedText({ es: (product.category as any).name_es, en: (product.category as any).name_en }, locale) : null,
    primary_image: Array.isArray(product.images) ? product.images.find((img: Record<string, unknown>) => img.is_primary)?.image_url : null,
  }));
}

/**
 * Obtener un producto por slug con contenido localizado
 */
export async function getProductBySlug(slug: string, locale: Locale = 'es') {
  const slugColumn = locale === 'en' ? 'slug_en' : 'slug_es';
  
  const { data, error } = await supabase
    .from("products")
    .select(`
      id,
      name_es,
      name_en,
      slug_es,
      slug_en,
      description_es,
      description_en,
      material_es,
      material_en,
      price,
      stock,
      weight,
      has_engraving,
      is_active,
      created_at,
      updated_at,
      category:product_categories(
        id,
        name_es,
        name_en,
        slug_es,
        slug_en,
        description_es,
        description_en
      ),
      images:product_images(
        id,
        image_url,
        alt_text_es,
        alt_text_en,
        display_order,
        is_primary,
        created_at
      ),
      specifications:product_specifications(
        id,
        spec_key_es,
        spec_key_en,
        spec_value_es,
        spec_value_en,
        display_order
      ),
      sizes:product_sizes(
        id,
        size,
        stock
      )
    `)
    .eq(slugColumn, slug)
    .eq("is_active", true)
    .single();

  if (error) {
    console.error("Error fetching product by slug:", error);
    return null;
  }

  return transformProductForLocale(locale)(data);
}

/**
 * Obtener un producto por ID (para admin)
 */
export async function getProductById(id: string, locale: Locale = 'es') {
  const { data, error } = await supabase
    .from("products")
    .select(`
      id,
      name_es,
      name_en,
      slug_es,
      slug_en,
      description_es,
      description_en,
      material_es,
      material_en,
      price,
      stock,
      weight,
      has_engraving,
      is_active,
      category_id,
      created_at,
      updated_at,
      category:product_categories(
        id,
        name_es,
        name_en,
        slug_es,
        slug_en
      ),
      images:product_images(
        id,
        image_url,
        alt_text_es,
        alt_text_en,
        display_order,
        is_primary
      ),
      specifications:product_specifications(
        id,
        spec_key_es,
        spec_key_en,
        spec_value_es,
        spec_value_en,
        display_order
      ),
      sizes:product_sizes(
        id,
        size,
        stock
      )
    `)
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching product by ID:", error);
    return null;
  }

  return transformProductForLocale(locale)(data);
}

/**
 * Obtener productos por categoría con contenido localizado
 */
export async function getProductsByCategory(categorySlug: string, locale: Locale = 'es') {
  const categorySlugColumn = locale === 'en' ? 'slug_en' : 'slug_es';
  
  const { data, error } = await supabase
    .from("products")
    .select(`
      id,
      name_es,
      name_en,
      slug_es,
      slug_en,
      description_es,
      description_en,
      material_es,
      material_en,
      is_active,
      category:product_categories!inner(
        id,
        name_es,
        name_en,
        slug_es,
        slug_en
      ),
      images:product_images(
        id,
        image_url,
        is_primary
      )
    `)
    .eq("is_active", true)
    .eq(`category.${categorySlugColumn}`, categorySlug)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching products by category:", error);
    return [];
  }

  return data.map(transformProductForLocale(locale));
}

/**
 * Obtener todas las categorías con contenido localizado
 */
export async function getCategories(locale: Locale = 'es') {
  const { data, error } = await supabase
    .from("product_categories")
    .select(`
      id,
      name_es,
      name_en,
      slug_es,
      slug_en,
      description_es,
      description_en,
      image_url,
      created_at,
      updated_at
    `)
    .order("name_es", { ascending: true });

  if (error) {
    console.error("Error fetching categories:", error);
    return [];
  }

  return data.map((category: Record<string, unknown>) => ({
    id: category.id,
    name: getLocalizedText({ es: category.name_es as string, en: category.name_en as string }, locale),
    slug: getLocalizedText({ es: category.slug_es as string, en: category.slug_en as string }, locale),
    description: getLocalizedContent({ es: category.description_es as string, en: category.description_en as string }, locale),
    image_url: category.image_url,
    created_at: category.created_at,
    updated_at: category.updated_at,
  }));
}

/**
 * Buscar productos con contenido localizado
 */
export async function searchProducts(query: string, locale: Locale = 'es') {
  const nameColumn = locale === 'en' ? 'name_en' : 'name_es';
  const descriptionColumn = locale === 'en' ? 'description_en' : 'description_es';
  
  const { data, error } = await supabase
    .from("products")
    .select(`
      id,
      name_es,
      name_en,
      slug_es,
      slug_en,
      description_es,
      description_en,
      material_es,
      material_en,
      is_active,
      category:product_categories(
        id,
        name_es,
        name_en,
        slug_es,
        slug_en
      ),
      images:product_images(
        id,
        image_url,
        is_primary
      )
    `)
    .eq("is_active", true)
    .or(`${nameColumn}.ilike.%${query}%,${descriptionColumn}.ilike.%${query}%`)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error searching products:", error);
    return [];
  }

  return data.map(transformProductForLocale(locale));
}

/**
 * Crear un nuevo producto con contenido multilingüe
 */
export async function createProduct(
  productData: CreateMultilingualProductData
) {
  try {
    // Generar slugs multilingües
    const slugs = generateMultilingualSlug(productData.name);

    // Insertar el producto
    const { data: product, error: productError } = await supabase
      .from("products")
      .insert({
        name_es: productData.name.es,
        name_en: productData.name.en,
        slug_es: slugs.es,
        slug_en: slugs.en,
        description_es: productData.description.es,
        description_en: productData.description.en,
        material_es: productData.material.es,
        material_en: productData.material.en,
        category_id: productData.category_id,
        price: productData.price,
        stock: productData.stock,
        weight: productData.weight,
        is_active: productData.is_active,
      })
      .select()
      .single();

    if (productError) {
      console.error("Error creating product:", productError);
      throw productError;
    }

    // Insertar especificaciones si existen
    if (productData.specifications && productData.specifications.length > 0) {
      const specifications = productData.specifications.map((spec) => ({
        product_id: product.id,
        spec_key_es: spec.spec_key.es,
        spec_key_en: spec.spec_key.en,
        spec_value_es: spec.spec_value.es,
        spec_value_en: spec.spec_value.en,
        display_order: spec.display_order,
      }));

      const { error: specsError } = await supabase
        .from("product_specifications")
        .insert(specifications);

      if (specsError) {
        console.error("Error creating specifications:", specsError);
      }
    }

    // Insertar tallas si existen
    if (productData.sizes && productData.sizes.length > 0) {
      const sizes = productData.sizes.map((size) => ({
        product_id: product.id,
        size: size.size,
        stock: size.stock,
      }));

      const { error: sizesError } = await supabase
        .from("product_sizes")
        .insert(sizes);

      if (sizesError) {
        console.error("Error creating sizes:", sizesError);
      }
    }

    return product;
  } catch (error) {
    console.error("Error in createProduct:", error);
    throw error;
  }
}

/**
 * Actualizar un producto existente
 */
export async function updateProduct(
  productId: string,
  updates: UpdateMultilingualProductData
) {
  try {
    const dataToUpdate: Record<string, unknown> = {};

    // Actualizar campos básicos
    if (updates.name) {
      dataToUpdate.name_es = updates.name.es;
      dataToUpdate.name_en = updates.name.en;
      // Regenerar slugs
      const slugs = generateMultilingualSlug(updates.name);
      dataToUpdate.slug_es = slugs.es;
      dataToUpdate.slug_en = slugs.en;
    }

    if (updates.description) {
      dataToUpdate.description_es = updates.description.es;
      dataToUpdate.description_en = updates.description.en;
    }

    if (updates.material) {
      dataToUpdate.material_es = updates.material.es;
      dataToUpdate.material_en = updates.material.en;
    }

    if (updates.category_id !== undefined) dataToUpdate.category_id = updates.category_id;
    if (updates.price !== undefined) dataToUpdate.price = updates.price;
    if (updates.stock !== undefined) dataToUpdate.stock = updates.stock;
    if (updates.weight !== undefined) dataToUpdate.weight = updates.weight;
    if (updates.has_engraving !== undefined) dataToUpdate.has_engraving = updates.has_engraving;
    if (updates.is_active !== undefined) dataToUpdate.is_active = updates.is_active;

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
  } catch (error) {
    console.error("Error in updateProduct:", error);
    throw error;
  }
}

/**
 * Función auxiliar para transformar datos de producto según el locale
 */
function transformProductForLocale(locale: Locale) {
  return (product: Record<string, unknown>) => ({
    id: product.id,
    name: getLocalizedText({ es: product.name_es as string, en: product.name_en as string }, locale),
    slug: getLocalizedText({ es: product.slug_es as string, en: product.slug_en as string }, locale),
    description: getLocalizedContent({ es: product.description_es as string, en: product.description_en as string }, locale),
    material: getLocalizedText({ es: product.material_es as string, en: product.material_en as string }, locale),
    price: product.price,
    stock: product.stock,
    weight: product.weight,
    has_engraving: product.has_engraving,
    is_active: product.is_active,
    created_at: product.created_at,
    updated_at: product.updated_at,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    category: product.category ? {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      id: (product.category as any).id,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      name: getLocalizedText({ es: (product.category as any).name_es, en: (product.category as any).name_en }, locale),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      slug: getLocalizedText({ es: (product.category as any).slug_es, en: (product.category as any).slug_en }, locale),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      description: getLocalizedContent({ es: (product.category as any).description_es, en: (product.category as any).description_en }, locale),
    } : null,
    images: Array.isArray(product.images) ? product.images.map((img: Record<string, unknown>) => ({
      id: img.id,
      image_url: img.image_url,
      alt_text: getLocalizedText({ es: img.alt_text_es as string, en: img.alt_text_en as string }, locale),
      display_order: img.display_order,
      is_primary: img.is_primary,
      created_at: img.created_at,
    })) : [],
    specifications: Array.isArray(product.specifications) ? product.specifications.map((spec: Record<string, unknown>) => ({
      id: spec.id,
      spec_key: getLocalizedText({ es: spec.spec_key_es as string, en: spec.spec_key_en as string }, locale),
      spec_value: getLocalizedText({ es: spec.spec_value_es as string, en: spec.spec_value_en as string }, locale),
      display_order: spec.display_order,
    })) : [],
    sizes: product.sizes || [],
  });
}

// ================================================
// FUNCIONES DE CATEGORÍAS MULTILINGÜES
// ================================================

/**
 * Crear una nueva categoría con contenido multilingüe
 */
export async function createCategory(
  categoryData: {
    name: { es: string; en: string };
    description?: { es: string; en: string };
    image_url?: string;
  }
) {
  try {
    const slugs = generateMultilingualSlug(categoryData.name);

    const { data, error } = await supabase
      .from("product_categories")
      .insert({
        name_es: categoryData.name.es,
        name_en: categoryData.name.en,
        slug_es: slugs.es,
        slug_en: slugs.en,
        description_es: categoryData.description?.es,
        description_en: categoryData.description?.en,
        image_url: categoryData.image_url,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating category:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error in createCategory:", error);
    throw error;
  }
}

/**
 * Actualizar una categoría existente
 */
export async function updateCategory(
  categoryId: string,
  updates: {
    name?: { es: string; en: string };
    description?: { es: string; en: string };
    image_url?: string;
  }
) {
  try {
    const dataToUpdate: Record<string, unknown> = {};

    if (updates.name) {
      dataToUpdate.name_es = updates.name.es;
      dataToUpdate.name_en = updates.name.en;
      const slugs = generateMultilingualSlug(updates.name);
      dataToUpdate.slug_es = slugs.es;
      dataToUpdate.slug_en = slugs.en;
    }

    if (updates.description) {
      dataToUpdate.description_es = updates.description.es;
      dataToUpdate.description_en = updates.description.en;
    }

    if (updates.image_url !== undefined) dataToUpdate.image_url = updates.image_url;

    const { data, error } = await supabase
      .from("product_categories")
      .update(dataToUpdate)
      .eq("id", categoryId)
      .select()
      .single();

    if (error) {
      console.error("Error updating category:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error in updateCategory:", error);
    throw error;
  }
}
