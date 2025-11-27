import { supabase } from "./client";
import type { 
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
      available_languages,
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
        stock,
        price,
        weight,
        display_order
      )
    `)
    .eq("is_active", true)
    .contains("available_languages", [locale])
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
        stock,
        price,
        weight,
        display_order
      )
    `)
    .eq(slugColumn, slug)
    .eq("is_active", true)
    .contains("available_languages", [locale])
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
      available_languages,
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
        stock,
        price,
        weight,
        display_order
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
    .contains("available_languages", [locale])
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
 * Obtener todas las categorías para formularios de admin (retorna datos multilingües completos)
 */
export async function getCategoriesForAdmin() {
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
    name: {
      es: category.name_es as string,
      en: category.name_en as string
    },
    slug: {
      es: category.slug_es as string,
      en: category.slug_en as string
    },
    description: {
      es: category.description_es as string || '',
      en: category.description_en as string || ''
    },
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
    .contains("available_languages", [locale])
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
        name_en: productData.name.en || productData.name.es, // Usar español como fallback si inglés está vacío
        slug_es: slugs.es,
        slug_en: slugs.en || slugs.es, // Usar español como fallback
        description_es: productData.description.es,
        description_en: productData.description.en || productData.description.es, // Usar español como fallback
        material_es: productData.material.es,
        material_en: productData.material.en || productData.material.es, // Usar español como fallback
        category_id: productData.category_id && productData.category_id.trim() !== "" ? productData.category_id : null, // Convertir vacío a null
        price: productData.price,
        stock: productData.stock,
        weight: productData.weight,
        is_active: productData.is_active,
        available_languages: productData.available_languages || ['es', 'en'],
      })
      .select()
      .single();

    if (productError) {
      console.error("Error creating product:", productError);
      throw productError;
    }

    // Insertar especificaciones si existen (filtrar las vacías)
    if (productData.specifications && productData.specifications.length > 0) {
      const specifications = productData.specifications
        .filter(spec =>
          // Solo incluir especificaciones que tengan al menos el valor en español
          (spec.spec_key.es && spec.spec_key.es.trim() !== '') ||
          (spec.spec_value.es && spec.spec_value.es.trim() !== '')
        )
        .map((spec) => ({
          product_id: product.id,
          spec_key: spec.spec_key.es || spec.spec_key.en || '', // Usar español como fallback para columna legacy
          spec_value: spec.spec_value.es || spec.spec_value.en || '', // Usar español como fallback para columna legacy
          spec_key_es: spec.spec_key.es,
          spec_key_en: spec.spec_key.en || spec.spec_key.es, // Usar español como fallback
          spec_value_es: spec.spec_value.es,
          spec_value_en: spec.spec_value.en || spec.spec_value.es, // Usar español como fallback
          display_order: spec.display_order,
        }));

      if (specifications.length > 0) {
        const { error: specsError } = await supabase
          .from("product_specifications")
          .insert(specifications);

        if (specsError) {
          console.error("Error creating specifications:", specsError);
        }
      }
    }

    // Insertar tallas si existen
    if (productData.sizes && productData.sizes.length > 0) {
      const sizes = productData.sizes.map((size, index) => ({
        product_id: product.id,
        size: size.size,
        stock: size.stock,
        price: size.price || productData.price, // Use size price or fall back to base price
        weight: size.weight || null, // Include weight field
        display_order: (size as { size: string; stock: number; price?: number; weight?: number; display_order?: number }).display_order ?? index,
      }));

      const { error: sizesError } = await supabase
        .from("product_sizes")
        .insert(sizes);

      if (sizesError) {
        console.error("Error creating sizes:", sizesError);
      }
    }

    // Subir imágenes si existen
    if (productData.images && productData.images.length > 0) {
      for (let i = 0; i < productData.images.length; i++) {
        const file = productData.images[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${product.id}/${Date.now()}-${i}.${fileExt}`;

        // Subir a Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(fileName, file);

        if (uploadError) {
          console.error("Error uploading image:", uploadError);
          continue;
        }

        // Obtener URL pública
        const {
          data: { publicUrl },
        } = supabase.storage.from("product-images").getPublicUrl(fileName);

        // Insertar registro en product_images
        const { error: imageError } = await supabase
          .from("product_images")
          .insert({
            product_id: product.id,
            image_url: publicUrl,
            display_order: i,
            is_primary: i === 0, // Primera imagen es la principal
          });

        if (imageError) {
          console.error("Error creating image record:", imageError);
        }
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
    // Validar que productId sea un UUID válido
    if (!productId || productId.trim() === "") {
      throw new Error("Invalid product ID: ID cannot be empty");
    }

    const dataToUpdate: Record<string, unknown> = {};

    // Actualizar campos básicos
    if (updates.name) {
      dataToUpdate.name_es = updates.name.es;
      dataToUpdate.name_en = updates.name.en || updates.name.es; // Usar español como fallback
      // Regenerar slugs
      const slugs = generateMultilingualSlug(updates.name);
      dataToUpdate.slug_es = slugs.es;
      dataToUpdate.slug_en = slugs.en || slugs.es; // Usar español como fallback
    }

    if (updates.description) {
      dataToUpdate.description_es = updates.description.es;
      dataToUpdate.description_en = updates.description.en || updates.description.es; // Usar español como fallback
    }

    if (updates.material) {
      dataToUpdate.material_es = updates.material.es;
      dataToUpdate.material_en = updates.material.en || updates.material.es; // Usar español como fallback
    }

    // Convertir category_id vacío a null
    if (updates.category_id !== undefined) {
      dataToUpdate.category_id = updates.category_id && updates.category_id.trim() !== "" ? updates.category_id : null;
    }
    if (updates.price !== undefined) dataToUpdate.price = updates.price;
    if (updates.stock !== undefined) dataToUpdate.stock = updates.stock;
    if (updates.weight !== undefined) dataToUpdate.weight = updates.weight;
    if (updates.has_engraving !== undefined) dataToUpdate.has_engraving = updates.has_engraving;
    if (updates.is_active !== undefined) dataToUpdate.is_active = updates.is_active;
    if (updates.available_languages !== undefined) dataToUpdate.available_languages = updates.available_languages;

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

    // Actualizar especificaciones si se proporcionaron
    if (updates.specifications !== undefined) {
      // Eliminar especificaciones existentes
      const { error: deleteSpecsError } = await supabase
        .from("product_specifications")
        .delete()
        .eq("product_id", productId);

      if (deleteSpecsError) {
        console.error("Error deleting old specifications:", deleteSpecsError);
      }

      // Insertar nuevas especificaciones si hay alguna (filtrar las vacías)
      if (updates.specifications.length > 0) {
        const specifications = updates.specifications
          .filter(spec =>
            // Solo incluir especificaciones que tengan al menos el valor en español
            (spec.spec_key.es && spec.spec_key.es.trim() !== '') ||
            (spec.spec_value.es && spec.spec_value.es.trim() !== '')
          )
          .map((spec) => ({
            product_id: productId,
            spec_key: spec.spec_key.es || spec.spec_key.en || '', // Usar español como fallback para columna legacy
            spec_value: spec.spec_value.es || spec.spec_value.en || '', // Usar español como fallback para columna legacy
            spec_key_es: spec.spec_key.es,
            spec_key_en: spec.spec_key.en || spec.spec_key.es, // Usar español como fallback
            spec_value_es: spec.spec_value.es,
            spec_value_en: spec.spec_value.en || spec.spec_value.es, // Usar español como fallback
            display_order: spec.display_order,
          }));

        if (specifications.length > 0) {
          const { error: insertSpecsError } = await supabase
            .from("product_specifications")
            .insert(specifications);

          if (insertSpecsError) {
            console.error("Error inserting specifications:", insertSpecsError);
          }
        }
      }
    }

    // Actualizar tallas si se proporcionaron
    if (updates.sizes !== undefined) {
      // Eliminar tallas existentes
      const { error: deleteSizesError } = await supabase
        .from("product_sizes")
        .delete()
        .eq("product_id", productId);

      if (deleteSizesError) {
        console.error("Error deleting old sizes:", deleteSizesError);
      }

      // Insertar nuevas tallas si hay alguna
      if (updates.sizes.length > 0) {
        const sizes = updates.sizes.map((size, index) => ({
          product_id: productId,
          size: size.size,
          stock: size.stock,
          price: size.price || updates.price || 0,
          weight: size.weight || null, // Include weight field
          display_order: (size as { size: string; stock: number; price?: number; weight?: number; display_order?: number }).display_order ?? index,
        }));

        const { error: insertSizesError } = await supabase
          .from("product_sizes")
          .insert(sizes);

        if (insertSizesError) {
          console.error("Error inserting sizes:", insertSizesError);
        }
      }
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
 * Obtener todas las categorías de productos (para admin)
 */
export async function getAllProductCategories() {
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
    console.error("Error fetching all product categories:", error);
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
    image_url: category.image_url as string | undefined,
    created_at: category.created_at as string,
    updated_at: category.updated_at as string,
  }));
}

/**
 * Obtener una categoría de producto por ID (para admin)
 */
export async function getProductCategoryById(id: string) {
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
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching product category by ID:", error);
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
    image_url: data.image_url || undefined,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

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
        // Columnas legacy (usar español como fallback)
        name: categoryData.name.es || categoryData.name.en || '',
        slug: slugs.es || slugs.en || '',
        description: categoryData.description?.es || categoryData.description?.en || null,
        // Columnas multilingües (usar español como fallback si inglés está vacío)
        name_es: categoryData.name.es,
        name_en: categoryData.name.en || categoryData.name.es,
        slug_es: slugs.es,
        slug_en: slugs.en || slugs.es,
        description_es: categoryData.description?.es,
        description_en: categoryData.description?.en || categoryData.description?.es || null,
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
      // Columnas legacy (usar español como fallback)
      dataToUpdate.name = updates.name.es || updates.name.en || '';
      // Columnas multilingües (usar español como fallback si inglés está vacío)
      dataToUpdate.name_es = updates.name.es;
      dataToUpdate.name_en = updates.name.en || updates.name.es;
      const slugs = generateMultilingualSlug(updates.name);
      dataToUpdate.slug = slugs.es || slugs.en || ''; // Columna legacy
      dataToUpdate.slug_es = slugs.es;
      dataToUpdate.slug_en = slugs.en || slugs.es;
    }

    if (updates.description) {
      dataToUpdate.description = updates.description.es || updates.description.en || null; // Columna legacy
      dataToUpdate.description_es = updates.description.es;
      dataToUpdate.description_en = updates.description.en || updates.description.es || null;
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

/**
 * Eliminar una categoría de producto
 */
export async function deleteProductCategory(categoryId: string) {
  try {
    // Validar que categoryId sea un UUID válido
    if (!categoryId || categoryId.trim() === "") {
      throw new Error("Invalid category ID: ID cannot be empty");
    }

    // Verificar si hay productos usando esta categoría
    const { data: products, error: checkError } = await supabase
      .from("products")
      .select("id")
      .eq("category_id", categoryId)
      .limit(1);

    if (checkError) {
      console.error("Error checking products:", checkError);
      throw checkError;
    }

    if (products && products.length > 0) {
      throw new Error("Cannot delete category: there are products using this category");
    }

    const { error } = await supabase
      .from("product_categories")
      .delete()
      .eq("id", categoryId);

    if (error) {
      console.error("Error deleting product category:", error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Error in deleteProductCategory:", error);
    throw error;
  }
}
