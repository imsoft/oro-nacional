import { supabase } from "./client";
import type { 
  CreateMultilingualProductData,
  UpdateMultilingualProductData,
  Locale
} from "@/types/multilingual";
import { getLocalizedText, getLocalizedContent, generateMultilingualSlug } from "@/types/multilingual";
import { addProductImages } from "./products";

// ================================================
// UTILIDADES DE SLUGS
// ================================================

/**
 * Devuelve un slug único para la columna indicada.
 * - Nunca devuelve un slug vacío (usa `fallback` si el slug base está vacío)
 * - Si el slug ya existe en otra fila, agrega un sufijo numérico (-2, -3, ...)
 * - `excludeId` permite ignorar la fila que se está editando
 */
export async function generateUniqueSlug(
  table: string,
  column: string,
  baseSlug: string | null | undefined,
  options: { excludeId?: string; fallback?: string } = {}
): Promise<string> {
  const base =
    baseSlug && baseSlug.trim() !== ""
      ? baseSlug.trim()
      : options.fallback && options.fallback.trim() !== ""
        ? options.fallback.trim()
        : `item-${Date.now().toString(36)}`;

  let query = supabase.from(table).select(`id, ${column}`).like(column, `${base}%`);
  if (options.excludeId) {
    query = query.neq("id", options.excludeId);
  }

  const { data, error } = await query;

  if (error) {
    console.error(`Error checking slug uniqueness in ${table}.${column}:`, error);
    return base;
  }

  const taken = new Set(
    ((data || []) as unknown as Array<Record<string, unknown>>).map((row) => String(row[column] ?? ""))
  );

  if (!taken.has(base)) {
    return base;
  }

  let suffix = 2;
  while (taken.has(`${base}-${suffix}`)) {
    suffix++;
  }
  return `${base}-${suffix}`;
}

// Extraer un mensaje legible de un error de Supabase o de JS
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  const message = (error as { message?: string } | null)?.message;
  return message || "Error desconocido";
}

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
      display_order,
      created_at,
      updated_at
    `)
    .order("display_order", { ascending: true, nullsFirst: false })
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
 * - options.primaryImageIndex: índice (dentro de productData.images) de la imagen principal elegida
 * - Si fallan las especificaciones o las tallas, se revierte la creación y se lanza un error
 * - Si falla alguna imagen, el producto se conserva y los errores se devuelven en `imageErrors`
 */
export async function createProduct(
  productData: CreateMultilingualProductData,
  options: { primaryImageIndex?: number | null } = {}
) {
  try {
    // Generar slugs multilingües (únicos y nunca vacíos)
    const slugs = generateMultilingualSlug(productData.name);
    const slugFallback = `producto-${Date.now().toString(36)}`;
    const slugEs = await generateUniqueSlug("products", "slug_es", slugs.es, { fallback: slugFallback });
    const slugEn = await generateUniqueSlug("products", "slug_en", slugs.en || slugs.es, { fallback: slugEs });

    // Insertar el producto
    const { data: product, error: productError } = await supabase
      .from("products")
      .insert({
        name_es: productData.name.es,
        name_en: productData.name.en || productData.name.es, // Usar español como fallback si inglés está vacío
        slug_es: slugEs,
        slug_en: slugEn,
        description_es: productData.description.es,
        description_en: productData.description.en || productData.description.es, // Usar español como fallback
        material_es: productData.material.es,
        material_en: productData.material.en || productData.material.es, // Usar español como fallback
        category_id: (productData.category_id && typeof productData.category_id === 'string' && productData.category_id.trim() !== "") ? productData.category_id : null, // Convertir vacío, undefined o null a null
        price: productData.price,
        stock: 0, // Ya no se usa, pero se mantiene para compatibilidad
        weight: productData.weight,
        base_price_usd: productData.base_price_usd || null,
        is_active: productData.is_active,
        available_languages: productData.available_languages || ['es', 'en'],
      })
      .select()
      .single();

    if (productError) {
      console.error("Error creating product:", productError);
      throw productError;
    }

    // Revertir la creación si fallan los datos relacionados (evita productos a medias y duplicados al reintentar)
    const rollbackProduct = async () => {
      const { error: rollbackError } = await supabase
        .from("products")
        .delete()
        .eq("id", product.id);
      if (rollbackError) {
        console.error("Error rolling back product creation:", rollbackError);
      }
    };

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
          await rollbackProduct();
          throw new Error(`No se pudieron guardar las especificaciones: ${getErrorMessage(specsError)}`);
        }
      }
    }

    // Insertar tallas si existen
    if (productData.sizes && productData.sizes.length > 0) {
      const sizes = productData.sizes.map((size, index) => ({
        product_id: product.id,
        size: size.size,
        stock: size.stock,
        price: size.price || 0, // Precio por talla (requerido)
        price_usd: size.price_usd || null, // Precio USD opcional
        weight: size.weight || null, // Gramos de oro para esta talla
        display_order: (size as { size: string; stock: number; price?: number; price_usd?: number | null; weight?: number; display_order?: number }).display_order ?? index,
      }));

      const { error: sizesError } = await supabase
        .from("product_sizes")
        .insert(sizes);

      if (sizesError) {
        console.error("Error creating sizes:", sizesError);
        await rollbackProduct();
        throw new Error(`No se pudieron guardar las tallas: ${getErrorMessage(sizesError)}`);
      }
    }

    // Subir imágenes si existen
    const imageErrors: string[] = [];
    if (productData.images && productData.images.length > 0) {
      // Respetar la imagen principal elegida en el formulario (por defecto la primera)
      const primaryIndex =
        typeof options.primaryImageIndex === "number" &&
        options.primaryImageIndex >= 0 &&
        options.primaryImageIndex < productData.images.length
          ? options.primaryImageIndex
          : 0;
      const insertedImages: Array<{ id: string; is_primary: boolean }> = [];

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
          imageErrors.push(`${file.name}: ${getErrorMessage(uploadError)}`);
          continue;
        }

        // Obtener URL pública
        const {
          data: { publicUrl },
        } = supabase.storage.from("product-images").getPublicUrl(fileName);

        // Insertar registro en product_images
        const { data: imageRow, error: imageError } = await supabase
          .from("product_images")
          .insert({
            product_id: product.id,
            image_url: publicUrl,
            display_order: i,
            is_primary: i === primaryIndex,
          })
          .select("id, is_primary")
          .single();

        if (imageError) {
          console.error("Error creating image record:", imageError);
          imageErrors.push(`${file.name}: ${getErrorMessage(imageError)}`);
          // Evitar archivos huérfanos si no se pudo crear el registro
          await supabase.storage.from("product-images").remove([fileName]);
          continue;
        }

        insertedImages.push(imageRow);
      }

      // Si la imagen principal no se pudo subir, promover la primera que sí se guardó
      if (insertedImages.length > 0 && !insertedImages.some((img) => img.is_primary)) {
        const { error: promoteError } = await supabase
          .from("product_images")
          .update({ is_primary: true })
          .eq("id", insertedImages[0].id);
        if (promoteError) {
          console.error("Error setting primary image:", promoteError);
        }
      }
    }

    return { ...product, imageErrors };
  } catch (error) {
    console.error("Error in createProduct:", error);
    throw error;
  }
}

/**
 * Opciones de imágenes al actualizar un producto
 */
export interface UpdateProductImageOptions {
  // Imágenes ya guardadas, en el orden en que deben mostrarse
  existingImages?: Array<{ id?: string; is_primary: boolean }>;
  // Archivos nuevos por subir (se agregan después de las existentes)
  newImages?: File[];
  // Índice (dentro de newImages) de la imagen principal, si la principal es una imagen nueva
  primaryNewImageIndex?: number | null;
}

/**
 * Persistir orden, imagen principal y nuevas imágenes de un producto
 */
async function saveProductImages(productId: string, imageOptions: UpdateProductImageOptions) {
  const existing = (imageOptions.existingImages || []).filter(
    (img): img is { id: string; is_primary: boolean } => typeof img.id === "string" && img.id !== ""
  );
  const newImages = imageOptions.newImages || [];

  let primaryNewIndex: number | null =
    typeof imageOptions.primaryNewImageIndex === "number" &&
    imageOptions.primaryNewImageIndex >= 0 &&
    imageOptions.primaryNewImageIndex < newImages.length
      ? imageOptions.primaryNewImageIndex
      : null;
  let primaryExistingId: string | null =
    primaryNewIndex === null ? existing.find((img) => img.is_primary)?.id ?? null : null;

  // Garantizar que siempre haya una imagen principal
  if (primaryNewIndex === null && primaryExistingId === null) {
    if (existing.length > 0) {
      primaryExistingId = existing[0].id;
    } else if (newImages.length > 0) {
      primaryNewIndex = 0;
    }
  }

  // Actualizar orden e imagen principal de las existentes
  // (primero las no principales, para no tener dos principales al mismo tiempo)
  const existingUpdates = existing
    .map((img, index) => ({ id: img.id, display_order: index, is_primary: img.id === primaryExistingId }))
    .sort((a, b) => Number(a.is_primary) - Number(b.is_primary));

  for (const img of existingUpdates) {
    const { error } = await supabase
      .from("product_images")
      .update({ display_order: img.display_order, is_primary: img.is_primary })
      .eq("id", img.id)
      .eq("product_id", productId);

    if (error) {
      console.error("Error updating product image:", error);
      throw new Error(`No se pudo actualizar el orden de las imágenes: ${getErrorMessage(error)}`);
    }
  }

  // Subir las imágenes nuevas
  if (newImages.length > 0) {
    try {
      await addProductImages(
        productId,
        newImages.map((file, index) => ({
          file,
          isPrimary: index === primaryNewIndex,
          displayOrder: existing.length + index,
        }))
      );
    } catch (error) {
      console.error("Error uploading new product images:", error);
      throw new Error(`No se pudieron subir las imágenes nuevas: ${getErrorMessage(error)}`);
    }
  }
}

/**
 * Actualizar un producto existente
 * - imageOptions (opcional): persiste orden, imagen principal y nuevas imágenes
 * - Lanza un error si falla el guardado de especificaciones, tallas o imágenes
 */
export async function updateProduct(
  productId: string,
  updates: UpdateMultilingualProductData,
  imageOptions?: UpdateProductImageOptions
) {
  try {
    // Validar que productId sea un UUID válido
    if (!productId || productId.trim() === "") {
      throw new Error("Invalid product ID: ID cannot be empty");
    }

    const dataToUpdate: Record<string, unknown> = {};

    // Actualizar campos básicos
    if (updates.name) {
      const nameEs = updates.name.es;
      const nameEn = updates.name.en || updates.name.es; // Usar español como fallback
      dataToUpdate.name_es = nameEs;
      dataToUpdate.name_en = nameEn;

      // Regenerar slugs solo si el nombre cambió (o si el slug actual está vacío)
      const { data: current, error: currentError } = await supabase
        .from("products")
        .select("name_es, name_en, slug_es, slug_en")
        .eq("id", productId)
        .maybeSingle();

      if (currentError) {
        console.error("Error fetching current product:", currentError);
        throw currentError;
      }

      const slugs = generateMultilingualSlug(updates.name);
      const slugFallback = `producto-${productId.slice(0, 8)}`;
      const esChanged = !current || current.name_es !== nameEs || !current.slug_es;
      const enChanged = !current || current.name_en !== nameEn || !current.slug_en;

      let slugEs = current?.slug_es as string | undefined;
      if (esChanged) {
        slugEs = await generateUniqueSlug("products", "slug_es", slugs.es, { excludeId: productId, fallback: slugFallback });
        dataToUpdate.slug_es = slugEs;
      }
      if (enChanged) {
        dataToUpdate.slug_en = await generateUniqueSlug("products", "slug_en", slugs.en || slugs.es, {
          excludeId: productId,
          fallback: slugEs || slugFallback,
        });
      }
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
      // Si category_id es undefined, null, o string vacío, establecer como null
      const categoryId = updates.category_id;
      dataToUpdate.category_id = (categoryId && typeof categoryId === 'string' && categoryId.trim() !== "") ? categoryId : null;
      console.log("🔄 Updating category_id:", {
        original: updates.category_id,
        processed: dataToUpdate.category_id,
        type: typeof updates.category_id
      });
    }
    if (updates.price !== undefined) dataToUpdate.price = updates.price;
    // stock ya no se actualiza, se mantiene a nivel de tallas
    if (updates.weight !== undefined) dataToUpdate.weight = updates.weight;
    if (updates.base_price_usd !== undefined) dataToUpdate.base_price_usd = updates.base_price_usd || null;
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
      // Guardar las especificaciones actuales para poder restaurarlas si falla la inserción
      const { data: previousSpecs, error: previousSpecsError } = await supabase
        .from("product_specifications")
        .select("*")
        .eq("product_id", productId);

      if (previousSpecsError) {
        console.error("Error fetching old specifications:", previousSpecsError);
        throw new Error(`No se pudieron actualizar las especificaciones: ${getErrorMessage(previousSpecsError)}`);
      }

      // Eliminar especificaciones existentes
      const { error: deleteSpecsError } = await supabase
        .from("product_specifications")
        .delete()
        .eq("product_id", productId);

      if (deleteSpecsError) {
        console.error("Error deleting old specifications:", deleteSpecsError);
        throw new Error(`No se pudieron actualizar las especificaciones: ${getErrorMessage(deleteSpecsError)}`);
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
            // Restaurar las especificaciones anteriores para no dejar el producto sin datos
            if (previousSpecs && previousSpecs.length > 0) {
              const { error: restoreError } = await supabase
                .from("product_specifications")
                .insert(previousSpecs);
              if (restoreError) {
                console.error("Error restoring old specifications:", restoreError);
              }
            }
            throw new Error(`No se pudieron guardar las especificaciones: ${getErrorMessage(insertSpecsError)}`);
          }
        }
      }
    }

    // Actualizar tallas si se proporcionaron
    if (updates.sizes !== undefined) {
      // Guardar las tallas actuales para poder restaurarlas si falla la inserción
      const { data: previousSizes, error: previousSizesError } = await supabase
        .from("product_sizes")
        .select("*")
        .eq("product_id", productId);

      if (previousSizesError) {
        console.error("Error fetching old sizes:", previousSizesError);
        throw new Error(`No se pudieron actualizar las tallas: ${getErrorMessage(previousSizesError)}`);
      }

      // Eliminar tallas existentes
      const { error: deleteSizesError } = await supabase
        .from("product_sizes")
        .delete()
        .eq("product_id", productId);

      if (deleteSizesError) {
        console.error("Error deleting old sizes:", deleteSizesError);
        throw new Error(`No se pudieron actualizar las tallas: ${getErrorMessage(deleteSizesError)}`);
      }

      // Insertar nuevas tallas si hay alguna
      if (updates.sizes.length > 0) {
        const sizes = updates.sizes.map((size, index) => ({
          product_id: productId,
          size: size.size,
          stock: size.stock,
          price: size.price || 0, // Precio por talla (requerido)
          price_usd: size.price_usd || null, // Precio USD opcional
          weight: size.weight || null, // Gramos de oro para esta talla
          display_order: (size as { size: string; stock: number; price?: number; price_usd?: number | null; weight?: number; display_order?: number }).display_order ?? index,
        }));

        const { error: insertSizesError } = await supabase
          .from("product_sizes")
          .insert(sizes);

        if (insertSizesError) {
          console.error("Error inserting sizes:", insertSizesError);
          // Restaurar las tallas anteriores para no dejar el producto sin tallas
          if (previousSizes && previousSizes.length > 0) {
            const { error: restoreError } = await supabase
              .from("product_sizes")
              .insert(previousSizes);
            if (restoreError) {
              console.error("Error restoring old sizes:", restoreError);
            }
          }
          throw new Error(`No se pudieron guardar las tallas: ${getErrorMessage(insertSizesError)}`);
        }
      }
    }

    // Persistir imágenes (orden, principal y nuevas) si se proporcionaron
    if (imageOptions) {
      await saveProductImages(productId, imageOptions);
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
      display_order,
      is_featured,
      created_at,
      updated_at
    `)
    .order("display_order", { ascending: true, nullsFirst: false })
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
    display_order: category.display_order as number | null,
    is_featured: category.is_featured as boolean | undefined,
    created_at: category.created_at as string,
    updated_at: category.updated_at as string,
  }));
}

/**
 * Actualizar el orden de visualización de las categorías
 */
export async function updateCategoriesOrder(
  orders: { id: string; display_order: number }[]
) {
  const updates = orders.map(({ id, display_order }) =>
    supabase
      .from("product_categories")
      .update({ display_order })
      .eq("id", id)
  );

  const results = await Promise.all(updates);
  const firstError = results.find((r) => r.error)?.error;
  if (firstError) {
    console.error("Error updating categories order:", firstError);
    throw firstError;
  }
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
    const baseSlugs = generateMultilingualSlug(categoryData.name);
    // Slugs únicos y nunca vacíos
    const slugFallback = `categoria-${Date.now().toString(36)}`;
    const slugEs = await generateUniqueSlug("product_categories", "slug_es", baseSlugs.es, { fallback: slugFallback });
    const slugEn = await generateUniqueSlug("product_categories", "slug_en", baseSlugs.en || baseSlugs.es, { fallback: slugEs });
    const slugs = { es: slugEs, en: slugEn };

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
      const nameEs = updates.name.es;
      const nameEn = updates.name.en || updates.name.es;
      dataToUpdate.name_es = nameEs;
      dataToUpdate.name_en = nameEn;

      // Regenerar slugs solo si el nombre cambió (o si el slug actual está vacío)
      const { data: current, error: currentError } = await supabase
        .from("product_categories")
        .select("name_es, name_en, slug_es, slug_en")
        .eq("id", categoryId)
        .maybeSingle();

      if (currentError) {
        console.error("Error fetching current category:", currentError);
        throw currentError;
      }

      const slugs = generateMultilingualSlug(updates.name);
      const slugFallback = `categoria-${categoryId.slice(0, 8)}`;
      const esChanged = !current || current.name_es !== nameEs || !current.slug_es;
      const enChanged = !current || current.name_en !== nameEn || !current.slug_en;

      let slugEs = current?.slug_es as string | undefined;
      if (esChanged) {
        slugEs = await generateUniqueSlug("product_categories", "slug_es", slugs.es, { excludeId: categoryId, fallback: slugFallback });
        dataToUpdate.slug = slugEs; // Columna legacy
        dataToUpdate.slug_es = slugEs;
      }
      if (enChanged) {
        dataToUpdate.slug_en = await generateUniqueSlug("product_categories", "slug_en", slugs.en || slugs.es, {
          excludeId: categoryId,
          fallback: slugEs || slugFallback,
        });
      }
    }

    // `!== undefined` para permitir limpiar la descripción enviando strings vacíos
    if (updates.description !== undefined) {
      dataToUpdate.description = updates.description.es || updates.description.en || null; // Columna legacy
      dataToUpdate.description_es = updates.description.es || null;
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
