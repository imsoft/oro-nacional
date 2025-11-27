import { supabase } from "./client";

export interface InternalCategory {
  id: string;
  name: string;
  description?: string;
  color?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface InternalSubcategory {
  id: string;
  internal_category_id: string;
  name: string;
  description?: string;
  color?: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

/**
 * Obtener todas las categorías internas
 */
export async function getAllInternalCategories(): Promise<InternalCategory[]> {
  const { data, error } = await supabase
    .from("internal_categories")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching internal categories:", error);
    throw error;
  }

  return data || [];
}

/**
 * Obtener una categoría interna por ID
 */
export async function getInternalCategoryById(id: string): Promise<InternalCategory | null> {
  const { data, error } = await supabase
    .from("internal_categories")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null; // No encontrado
    }
    console.error("Error fetching internal category:", error);
    throw error;
  }

  return data;
}

/**
 * Crear una nueva categoría interna
 */
export async function createInternalCategory(
  categoryData: {
    name: string;
    description?: string;
    color?: string;
    is_active?: boolean;
  }
): Promise<InternalCategory> {
  const { data, error } = await supabase
    .from("internal_categories")
    .insert({
      name: categoryData.name,
      description: categoryData.description || null,
      color: categoryData.color || null,
      is_active: categoryData.is_active !== undefined ? categoryData.is_active : true,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating internal category:", error);
    throw error;
  }

  return data;
}

/**
 * Actualizar una categoría interna
 */
export async function updateInternalCategory(
  id: string,
  updates: {
    name?: string;
    description?: string;
    color?: string;
    is_active?: boolean;
  }
): Promise<InternalCategory> {
  const dataToUpdate: Record<string, unknown> = {};

  if (updates.name !== undefined) dataToUpdate.name = updates.name;
  if (updates.description !== undefined) dataToUpdate.description = updates.description || null;
  if (updates.color !== undefined) dataToUpdate.color = updates.color || null;
  if (updates.is_active !== undefined) dataToUpdate.is_active = updates.is_active;

  const { data, error } = await supabase
    .from("internal_categories")
    .update(dataToUpdate)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating internal category:", error);
    throw error;
  }

  return data;
}

/**
 * Eliminar una categoría interna
 */
export async function deleteInternalCategory(id: string): Promise<boolean> {
  const { error } = await supabase
    .from("internal_categories")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting internal category:", error);
    throw error;
  }

  return true;
}

/**
 * Obtener categorías internas de un producto
 */
export async function getProductInternalCategories(productId: string): Promise<InternalCategory[]> {
  const { data, error } = await supabase
    .from("product_internal_categories")
    .select(`
      internal_category_id,
      internal_categories (
        id,
        name,
        description,
        color,
        is_active,
        created_at,
        updated_at,
        created_by
      )
    `)
    .eq("product_id", productId);

  if (error) {
    console.error("Error fetching product internal categories:", error);
    throw error;
  }

  if (!data) return [];

  return data
    .map((item: any) => item.internal_categories)
    .filter((cat: InternalCategory | null) => cat !== null) as InternalCategory[];
}

/**
 * Actualizar categorías internas de un producto
 */
export async function updateProductInternalCategories(
  productId: string,
  internalCategoryIds: string[]
): Promise<void> {
  // Primero, eliminar todas las relaciones existentes
  const { error: deleteError } = await supabase
    .from("product_internal_categories")
    .delete()
    .eq("product_id", productId);

  if (deleteError) {
    console.error("Error deleting product internal categories:", deleteError);
    throw deleteError;
  }

  // Si no hay categorías para agregar, terminar aquí
  if (internalCategoryIds.length === 0) {
    return;
  }

  // Insertar las nuevas relaciones
  const relationships = internalCategoryIds.map((categoryId) => ({
    product_id: productId,
    internal_category_id: categoryId,
    internal_subcategory_id: null,
  }));

  const { error: insertError } = await supabase
    .from("product_internal_categories")
    .insert(relationships);

  if (insertError) {
    console.error("Error inserting product internal categories:", insertError);
    throw insertError;
  }
}

/**
 * Obtener subcategorías internas de una categoría interna
 */
export async function getInternalSubcategories(categoryId: string): Promise<InternalSubcategory[]> {
  const { data, error } = await supabase
    .from("internal_subcategories")
    .select("*")
    .eq("internal_category_id", categoryId)
    .order("display_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching internal subcategories:", error);
    throw error;
  }

  return data || [];
}

/**
 * Obtener una subcategoría interna por ID
 */
export async function getInternalSubcategoryById(id: string): Promise<InternalSubcategory | null> {
  const { data, error } = await supabase
    .from("internal_subcategories")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null; // No encontrado
    }
    console.error("Error fetching internal subcategory:", error);
    throw error;
  }

  return data;
}

/**
 * Crear una nueva subcategoría interna
 */
export async function createInternalSubcategory(
  subcategoryData: {
    internal_category_id: string;
    name: string;
    description?: string;
    color?: string;
    is_active?: boolean;
    display_order?: number;
  }
): Promise<InternalSubcategory> {
  const { data, error } = await supabase
    .from("internal_subcategories")
    .insert({
      internal_category_id: subcategoryData.internal_category_id,
      name: subcategoryData.name,
      description: subcategoryData.description || null,
      color: subcategoryData.color || null,
      is_active: subcategoryData.is_active !== undefined ? subcategoryData.is_active : true,
      display_order: subcategoryData.display_order || 0,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating internal subcategory:", error);
    throw error;
  }

  return data;
}

/**
 * Actualizar una subcategoría interna
 */
export async function updateInternalSubcategory(
  id: string,
  updates: {
    name?: string;
    description?: string;
    color?: string;
    is_active?: boolean;
    display_order?: number;
  }
): Promise<InternalSubcategory> {
  const dataToUpdate: Record<string, unknown> = {};

  if (updates.name !== undefined) dataToUpdate.name = updates.name;
  if (updates.description !== undefined) dataToUpdate.description = updates.description || null;
  if (updates.color !== undefined) dataToUpdate.color = updates.color || null;
  if (updates.is_active !== undefined) dataToUpdate.is_active = updates.is_active;
  if (updates.display_order !== undefined) dataToUpdate.display_order = updates.display_order;

  const { data, error } = await supabase
    .from("internal_subcategories")
    .update(dataToUpdate)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating internal subcategory:", error);
    throw error;
  }

  return data;
}

/**
 * Eliminar una subcategoría interna
 */
export async function deleteInternalSubcategory(id: string): Promise<boolean> {
  const { error } = await supabase
    .from("internal_subcategories")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting internal subcategory:", error);
    throw error;
  }

  return true;
}

/**
 * Obtener categorías y subcategorías internas de un producto
 */
export async function getProductInternalCategoriesAndSubcategories(productId: string): Promise<{
  categories: InternalCategory[];
  subcategories: InternalSubcategory[];
}> {
  const { data, error } = await supabase
    .from("product_internal_categories")
    .select(`
      internal_category_id,
      internal_subcategory_id,
      internal_categories (
        id,
        name,
        description,
        color,
        is_active,
        created_at,
        updated_at,
        created_by
      ),
      internal_subcategories (
        id,
        internal_category_id,
        name,
        description,
        color,
        is_active,
        display_order,
        created_at,
        updated_at,
        created_by
      )
    `)
    .eq("product_id", productId);

  if (error) {
    console.error("Error fetching product internal categories and subcategories:", error);
    throw error;
  }

  if (!data) return { categories: [], subcategories: [] };

  const categories = data
    .filter((item: any) => item.internal_category_id && item.internal_categories)
    .map((item: any) => item.internal_categories)
    .filter((cat: InternalCategory | null) => cat !== null) as InternalCategory[];

  const subcategories = data
    .filter((item: any) => item.internal_subcategory_id && item.internal_subcategories)
    .map((item: any) => item.internal_subcategories)
    .filter((subcat: InternalSubcategory | null) => subcat !== null) as InternalSubcategory[];

  return { categories, subcategories };
}

/**
 * Actualizar categorías y subcategorías internas de un producto
 */
export async function updateProductInternalCategoriesAndSubcategories(
  productId: string,
  internalCategoryIds: string[],
  internalSubcategoryIds: string[]
): Promise<void> {
  // Primero, eliminar todas las relaciones existentes
  const { error: deleteError } = await supabase
    .from("product_internal_categories")
    .delete()
    .eq("product_id", productId);

  if (deleteError) {
    console.error("Error deleting product internal categories:", deleteError);
    throw deleteError;
  }

  // Si no hay categorías ni subcategorías para agregar, terminar aquí
  if (internalCategoryIds.length === 0 && internalSubcategoryIds.length === 0) {
    return;
  }

  // Preparar relaciones para categorías
  const categoryRelationships = internalCategoryIds.map((categoryId) => ({
    product_id: productId,
    internal_category_id: categoryId,
    internal_subcategory_id: null,
  }));

  // Preparar relaciones para subcategorías
  const subcategoryRelationships = internalSubcategoryIds.map((subcategoryId) => ({
    product_id: productId,
    internal_category_id: null,
    internal_subcategory_id: subcategoryId,
  }));

  // Insertar todas las relaciones
  const allRelationships = [...categoryRelationships, ...subcategoryRelationships];

  if (allRelationships.length > 0) {
    const { error: insertError } = await supabase
      .from("product_internal_categories")
      .insert(allRelationships);

    if (insertError) {
      console.error("Error inserting product internal categories and subcategories:", insertError);
      throw insertError;
    }
  }
}

