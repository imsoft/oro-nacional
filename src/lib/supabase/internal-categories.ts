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
  }));

  const { error: insertError } = await supabase
    .from("product_internal_categories")
    .insert(relationships);

  if (insertError) {
    console.error("Error inserting product internal categories:", insertError);
    throw insertError;
  }
}

