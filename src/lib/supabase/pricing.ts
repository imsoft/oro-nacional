import { supabase } from "./client";
import type { PricingParameters } from "@/types/pricing";

// Database types matching the schema
// Supabase puede devolver strings para campos numeric, así que aceptamos ambos
interface PricingParametersRow {
  id: string;
  gold_quotation: number | string;
  profit_margin: number | string;
  vat: number | string;
  stripe_percentage: number | string;
  stripe_fixed_fee: number | string;
  created_at: string;
  updated_at: string;
}

interface ProductPricingRow {
  id: string;
  product_id: string;
  gold_grams: number;
  factor: number;
  labor_cost: number;
  stone_cost: number;
  sales_commission: number;
  shipping_cost: number;
  created_at: string;
  updated_at: string;
}

// Convert database row to application type
function convertPricingParameters(row: PricingParametersRow): PricingParameters {
  // Asegurar que los valores numéricos se conviertan correctamente
  // Supabase puede devolver strings para campos numeric
  return {
    goldQuotation: typeof row.gold_quotation === 'string' 
      ? parseFloat(row.gold_quotation) 
      : Number(row.gold_quotation),
    profitMargin: typeof row.profit_margin === 'string' 
      ? parseFloat(row.profit_margin) 
      : Number(row.profit_margin),
    vat: typeof row.vat === 'string' 
      ? parseFloat(row.vat) 
      : Number(row.vat),
    stripePercentage: typeof row.stripe_percentage === 'string' 
      ? parseFloat(row.stripe_percentage) 
      : Number(row.stripe_percentage),
    stripeFixedFee: typeof row.stripe_fixed_fee === 'string' 
      ? parseFloat(row.stripe_fixed_fee) 
      : Number(row.stripe_fixed_fee),
  };
}

// Get global pricing parameters
export async function getPricingParameters(): Promise<PricingParameters | null> {
  console.log('[getPricingParameters] Starting query...');
  
  const { data, error } = await supabase
    .from("pricing_parameters")
    .select("*")
    .order("updated_at", { ascending: false })
    .order("id", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[getPricingParameters] Error fetching pricing parameters:", error);
    console.error("[getPricingParameters] Error details:", JSON.stringify(error, null, 2));
    // Return null instead of throwing to allow graceful handling
    return null;
  }

  if (!data) {
    console.warn("[getPricingParameters] No pricing parameters found in database");
    return null;
  }

  console.log('[getPricingParameters] Raw data from DB:', JSON.stringify(data, null, 2));
  console.log('[getPricingParameters] gold_quotation raw value:', data.gold_quotation);
  console.log('[getPricingParameters] gold_quotation type:', typeof data.gold_quotation);
  
  const converted = convertPricingParameters(data);
  console.log('[getPricingParameters] Converted data:', JSON.stringify(converted, null, 2));
  console.log('[getPricingParameters] Converted goldQuotation:', converted.goldQuotation);
  console.log('[getPricingParameters] Converted goldQuotation type:', typeof converted.goldQuotation);
  
  return converted;
}

// Update global pricing parameters
// NOTE: La cotización se sincroniza automáticamente con broquel_pricing_parameters vía trigger de BD (046_sync_gold_quotation_triggers.sql)
export async function updatePricingParameters(
  parameters: PricingParameters
): Promise<PricingParameters> {
  // Get the current row to update it - use maybeSingle to avoid errors if no row exists
  // Misma fila que lee getPricingParameters (la más reciente, desempate por id)
  const { data: current, error: selectError } = await supabase
    .from("pricing_parameters")
    .select("id")
    .order("updated_at", { ascending: false })
    .order("id", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (selectError && selectError.code !== 'PGRST116') {
    console.error("Error fetching pricing parameters:", selectError);
    throw selectError;
  }

  const updateData = {
    gold_quotation: parameters.goldQuotation,
    profit_margin: parameters.profitMargin,
    vat: parameters.vat,
    stripe_percentage: parameters.stripePercentage,
    stripe_fixed_fee: parameters.stripeFixedFee,
  };

  if (current && current.id) {
    // Update existing row (trigger sincronizará automáticamente con broquel_pricing_parameters)
    const { data, error } = await supabase
      .from("pricing_parameters")
      .update(updateData)
      .eq("id", current.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating pricing parameters:", error);
      throw error;
    }

    if (!data) {
      throw new Error("No data returned after update");
    }

    return convertPricingParameters(data);
  } else {
    // Insert new row if none exists
    const { data, error } = await supabase
      .from("pricing_parameters")
      .insert(updateData)
      .select()
      .single();

    if (error) {
      console.error("Error inserting pricing parameters:", error);
      throw error;
    }

    if (!data) {
      throw new Error("No data returned after insert");
    }

    return convertPricingParameters(data);
  }
}

// Get pricing data for a single product
export async function getProductPricing(productId: string) {
  const { data, error } = await supabase
    .from("product_pricing")
    .select("*")
    .eq("product_id", productId)
    .single();

  if (error) {
    // If no pricing data exists for this product, return default values
    if (error.code === "PGRST116") {
      return {
        goldGrams: 5.0,
        factor: 1.0,
        laborCost: 50.0,
        stoneCost: 0.0,
        salesCommission: 10.0,
        shippingCost: 150.0,
      };
    }
    console.error("Error fetching product pricing:", error);
    throw error;
  }

  return {
    goldGrams: data.gold_grams,
    factor: data.factor,
    laborCost: data.labor_cost,
    stoneCost: data.stone_cost,
    salesCommission: data.sales_commission,
    shippingCost: data.shipping_cost,
  };
}

// Get pricing data for all products
export async function getAllProductPricing() {
  const { data, error } = await supabase
    .from("product_pricing")
    .select("*");

  if (error) {
    console.error("Error fetching all product pricing:", error);
    throw error;
  }

  return data.map((row) => ({
    productId: row.product_id,
    goldGrams: row.gold_grams,
    factor: row.factor,
    laborCost: row.labor_cost,
    stoneCost: row.stone_cost,
    salesCommission: row.sales_commission,
    shippingCost: row.shipping_cost,
  }));
}

// Insert or update product pricing data
export async function upsertProductPricing(
  productId: string,
  pricingData: {
    goldGrams: number;
    factor: number;
    laborCost: number;
    stoneCost: number;
    salesCommission: number;
    shippingCost: number;
  }
) {
  const { data, error } = await supabase
    .from("product_pricing")
    .upsert(
      {
        product_id: productId,
        gold_grams: pricingData.goldGrams,
        factor: pricingData.factor,
        labor_cost: pricingData.laborCost,
        stone_cost: pricingData.stoneCost,
        sales_commission: pricingData.salesCommission,
        shipping_cost: pricingData.shippingCost,
      },
      { onConflict: "product_id" }
    )
    .select()
    .single();

  if (error) {
    console.error("Error upserting product pricing:", error);
    throw error;
  }

  return data;
}

// Batch upsert for multiple products
export async function batchUpsertProductPricing(
  pricingDataArray: Array<{
    productId: string;
    goldGrams: number;
    factor: number;
    laborCost: number;
    stoneCost: number;
    salesCommission: number;
    shippingCost: number;
  }>
) {
  const insertData = pricingDataArray.map((item) => ({
    product_id: item.productId,
    gold_grams: item.goldGrams,
    factor: item.factor,
    labor_cost: item.laborCost,
    stone_cost: item.stoneCost,
    sales_commission: item.salesCommission,
    shipping_cost: item.shippingCost,
  }));

  const { data, error } = await supabase
    .from("product_pricing")
    .upsert(insertData, { onConflict: "product_id" })
    .select();

  if (error) {
    console.error("Error batch upserting product pricing:", error);
    throw error;
  }

  return data;
}

// Delete product pricing data
export async function deleteProductPricing(productId: string) {
  const { error } = await supabase
    .from("product_pricing")
    .delete()
    .eq("product_id", productId);

  if (error) {
    console.error("Error deleting product pricing:", error);
    throw error;
  }
}

// ============================================
// Subcategory Pricing (Gramo Calculator)
// ============================================

interface SubcategoryPricingRow {
  id: string;
  subcategory_id: string;
  gold_grams: number;
  factor: number;
  labor_cost: number;
  stone_cost: number;
  sales_commission: number;
  shipping_cost: number;
  created_at: string;
  updated_at: string;
}

export interface SubcategoryPricingData {
  goldGrams: number;
  factor: number;
  laborCost: number;
  stoneCost: number;
  salesCommission: number;
  shippingCost: number;
}

// Valores por defecto de una subcategoría Gramo (compartidos por la calculadora y el formulario de productos)
export const DEFAULT_SUBCATEGORY_GRAMO_PRICING: SubcategoryPricingData = {
  goldGrams: 5,
  factor: 0.442,
  laborCost: 15,
  stoneCost: 0,
  salesCommission: 30,
  shippingCost: 800,
};

// Get pricing data for a single subcategory (Gramo)
export async function getSubcategoryPricing(subcategoryId: string): Promise<SubcategoryPricingData | null> {
  const { data, error } = await supabase
    .from("subcategory_pricing")
    .select("*")
    .eq("subcategory_id", subcategoryId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching subcategory pricing:", error);
    return null;
  }

  if (!data) {
    return null;
  }

  return {
    goldGrams: data.gold_grams,
    factor: data.factor,
    laborCost: data.labor_cost,
    stoneCost: data.stone_cost,
    salesCommission: data.sales_commission,
    shippingCost: data.shipping_cost,
  };
}

// Get pricing data for multiple subcategories (Gramo)
export async function getAllSubcategoryPricing(): Promise<Map<string, SubcategoryPricingData>> {
  const { data, error } = await supabase
    .from("subcategory_pricing")
    .select("*");

  if (error) {
    console.error("Error fetching all subcategory pricing:", error);
    return new Map();
  }

  const pricingMap = new Map<string, SubcategoryPricingData>();
  data.forEach((row) => {
    pricingMap.set(row.subcategory_id, {
      goldGrams: row.gold_grams,
      factor: row.factor,
      laborCost: row.labor_cost,
      stoneCost: row.stone_cost,
      salesCommission: row.sales_commission,
      shippingCost: row.shipping_cost,
    });
  });

  return pricingMap;
}

// Insert or update subcategory pricing data (Gramo)
export async function upsertSubcategoryPricing(
  subcategoryId: string,
  pricingData: SubcategoryPricingData
) {
  const { data, error } = await supabase
    .from("subcategory_pricing")
    .upsert(
      {
        subcategory_id: subcategoryId,
        gold_grams: pricingData.goldGrams,
        factor: pricingData.factor,
        labor_cost: pricingData.laborCost,
        stone_cost: pricingData.stoneCost,
        sales_commission: pricingData.salesCommission,
        shipping_cost: pricingData.shippingCost,
      },
      { onConflict: "subcategory_id" }
    )
    .select()
    .maybeSingle();

  if (error) {
    console.error("Error upserting subcategory pricing:", error);
    throw error;
  }

  return data;
}

// Batch upsert for multiple subcategories (Gramo)
export async function batchUpsertSubcategoryPricing(
  pricingDataArray: Array<{
    subcategoryId: string;
    pricingData: SubcategoryPricingData;
  }>
) {
  const insertData = pricingDataArray.map((item) => ({
    subcategory_id: item.subcategoryId,
    gold_grams: item.pricingData.goldGrams,
    factor: item.pricingData.factor,
    labor_cost: item.pricingData.laborCost,
    stone_cost: item.pricingData.stoneCost,
    sales_commission: item.pricingData.salesCommission,
    shipping_cost: item.pricingData.shippingCost,
  }));

  const { data, error } = await supabase
    .from("subcategory_pricing")
    .upsert(insertData, { onConflict: "subcategory_id" })
    .select();

  if (error) {
    console.error("Error batch upserting subcategory pricing:", error);
    throw error;
  }

  return data;
}

// ============================================
// Broquel Pricing Parameters
// ============================================

// Error de PostgREST cuando se escribe una columna que no existe (migración pendiente)
function isMissingColumnError(error: { code?: string; message?: string }): boolean {
  return error.code === "PGRST204" || error.code === "42703" || /column/i.test(error.message || "");
}

interface BroquelPricingParametersRow {
  id: string;
  quotation: number;
  profit_margin: number;
  vat: number;
  stripe_percentage: number;
  stripe_fixed_fee: number;
  // Desde la migración 059 (pueden faltar si aún no se aplica)
  sales_commission?: number | null;
  pz?: number | null;
  created_at: string;
  updated_at: string;
}

/** Parámetros generales de Broquel: se aplican igual a todos los modelos. */
export interface BroquelPricingParameters {
  quotation: number;
  profitMargin: number;
  vat: number;
  stripePercentage: number;
  stripeFixedFee: number;
  /** Comisión de venta por pieza (MXN) */
  salesCommission: number;
  /** Piezas base con las que se muestra el precio de cada modelo */
  pz: number;
}

// Convert database row to application type
function convertBroquelPricingParameters(row: BroquelPricingParametersRow): BroquelPricingParameters {
  // Supabase puede devolver strings para campos numeric
  const pz = Number(row.pz ?? 1);
  return {
    quotation: Number(row.quotation),
    profitMargin: Number(row.profit_margin),
    vat: Number(row.vat),
    stripePercentage: Number(row.stripe_percentage),
    stripeFixedFee: Number(row.stripe_fixed_fee),
    salesCommission: Number(row.sales_commission ?? 0),
    pz: pz > 0 ? pz : 1,
  };
}

// Valores por defecto de parámetros de Broquel (solo se usan si no existe ninguna fila en la BD)
const DEFAULT_BROQUEL_PRICING_PARAMETERS: BroquelPricingParameters = {
  quotation: 2450,
  profitMargin: 0.08,
  vat: 0.16,
  stripePercentage: 0.036,
  stripeFixedFee: 3.00,
  salesCommission: 0,
  pz: 1,
};

// Get global broquel pricing parameters
// NOTE: La cotización del oro (quotation) se sincroniza con pricing_parameters.gold_quotation
// para que ambos calculadores (Gramo y Broquel) usen el mismo precio del oro
export async function getBroquelPricingParameters(): Promise<BroquelPricingParameters> {
  // Obtener parámetros de broquel (misma fila que actualiza updateBroquelPricingParameters)
  const { data: broquelData, error: broquelError } = await supabase
    .from("broquel_pricing_parameters")
    .select("*")
    .order("updated_at", { ascending: false })
    .order("id", { ascending: true })
    .limit(1)
    .maybeSingle();

  // Obtener la cotización del oro desde pricing_parameters (fuente única de verdad)
  const { data: pricingData, error: pricingError } = await supabase
    .from("pricing_parameters")
    .select("gold_quotation")
    .order("updated_at", { ascending: false })
    .order("id", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (pricingError) {
    console.error("Error fetching gold quotation for broquel parameters:", pricingError);
  }

  const goldQuotation = pricingData?.gold_quotation != null ? Number(pricingData.gold_quotation) : 0;

  if (broquelError || !broquelData) {
    if (broquelError) {
      console.error("Error fetching broquel pricing parameters:", broquelError);
    } else {
      console.warn("No broquel pricing parameters found in database, using default values");
    }
    // Valores por defecto, usando la cotización de pricing_parameters si está disponible
    return {
      ...DEFAULT_BROQUEL_PRICING_PARAMETERS,
      quotation: goldQuotation > 0 ? goldQuotation : DEFAULT_BROQUEL_PRICING_PARAMETERS.quotation,
    };
  }

  const converted = convertBroquelPricingParameters(broquelData);

  // Usar la cotización de pricing_parameters si está disponible, sino usar la de broquel
  return {
    ...converted,
    quotation: goldQuotation > 0 ? goldQuotation : converted.quotation,
  };
}

// Update global broquel pricing parameters
// NOTE: La cotización se sincroniza automáticamente con pricing_parameters vía trigger de BD (046_sync_gold_quotation_triggers.sql)
export async function updateBroquelPricingParameters(
  parameters: BroquelPricingParameters
): Promise<BroquelPricingParameters> {
  // Get the current row to update it - use maybeSingle to avoid errors if no row exists
  // Misma fila que lee getBroquelPricingParameters (la más reciente, desempate por id)
  const { data: current, error: selectError } = await supabase
    .from("broquel_pricing_parameters")
    .select("id")
    .order("updated_at", { ascending: false })
    .order("id", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (selectError && selectError.code !== 'PGRST116') {
    console.error("Error fetching broquel pricing parameters:", selectError);
    throw selectError;
  }

  const updateData = {
    quotation: parameters.quotation,
    profit_margin: parameters.profitMargin,
    vat: parameters.vat,
    stripe_percentage: parameters.stripePercentage,
    stripe_fixed_fee: parameters.stripeFixedFee,
    sales_commission: parameters.salesCommission,
    pz: parameters.pz,
  };

  if (current && current.id) {
    // Update existing row (trigger sincronizará automáticamente con pricing_parameters)
    let { data, error } = await supabase
      .from("broquel_pricing_parameters")
      .update(updateData)
      .eq("id", current.id)
      .select()
      .single();

    // Si la migración 059 aún no se aplica, las columnas nuevas no existen:
    // guardar al menos los parámetros de siempre.
    if (error && isMissingColumnError(error)) {
      console.warn("broquel_pricing_parameters sin columnas de la migración 059; se guardan solo los parámetros anteriores");
      const { sales_commission: _commission, pz: _pz, ...legacyData } = updateData;
      void _commission;
      void _pz;
      ({ data, error } = await supabase
        .from("broquel_pricing_parameters")
        .update(legacyData)
        .eq("id", current.id)
        .select()
        .single());
    }

    if (error) {
      console.error("Error updating broquel pricing parameters:", error);
      throw error;
    }

    if (!data) {
      throw new Error("No data returned after update");
    }

    return convertBroquelPricingParameters(data);
  } else {
    // Insert new row if none exists
    const { data, error } = await supabase
      .from("broquel_pricing_parameters")
      .insert(updateData)
      .select()
      .single();

    if (error) {
      console.error("Error inserting broquel pricing parameters:", error);
      throw error;
    }

    if (!data) {
      throw new Error("No data returned after insert");
    }

    return convertBroquelPricingParameters(data);
  }
}

// ============================================
// Subcategory Broquel Pricing
// ============================================

interface SubcategoryBroquelPricingRow {
  id: string;
  subcategory_id: string;
  pz: number;
  gold_grams: number;
  carats: number;
  factor: number;
  merma: number;
  labor_cost: number;
  stone_cost: number;
  sales_commission: number;
  shipping: number;
  created_at: string;
  updated_at: string;
}

/**
 * Costos de un modelo de broquel (una subcategoría de "Broquel").
 * La comisión de venta y las piezas son parámetros generales, y el envío
 * ya no entra en el precio (se cobra aparte).
 */
export interface SubcategoryBroquelPricingData {
  goldGrams: number;
  carats: number;
  factor: number;
  /** Merma en porcentaje (8 = 8 %) */
  merma: number;
  laborCost: number;
  stoneCost: number;
}

// Valores por defecto de una subcategoría Broquel (compartidos por la calculadora y el formulario de productos)
export const DEFAULT_SUBCATEGORY_BROQUEL_PRICING: SubcategoryBroquelPricingData = {
  goldGrams: 0.185,
  carats: 10,
  factor: 0.000,
  merma: 8.00, // 8%
  laborCost: 20.00,
  stoneCost: 0.00,
};

const toBroquelPricingData = (row: SubcategoryBroquelPricingRow): SubcategoryBroquelPricingData => ({
  goldGrams: Number(row.gold_grams),
  carats: Number(row.carats),
  factor: Number(row.factor),
  merma: Number(row.merma),
  laborCost: Number(row.labor_cost),
  stoneCost: Number(row.stone_cost),
});

const toBroquelPricingRow = (subcategoryId: string, data: SubcategoryBroquelPricingData) => ({
  subcategory_id: subcategoryId,
  gold_grams: data.goldGrams,
  carats: data.carats,
  factor: data.factor,
  merma: data.merma,
  labor_cost: data.laborCost,
  stone_cost: data.stoneCost,
});

// Get pricing data for a single subcategory (Broquel)
export async function getSubcategoryBroquelPricing(subcategoryId: string): Promise<SubcategoryBroquelPricingData | null> {
  const { data, error } = await supabase
    .from("subcategory_broquel_pricing")
    .select("*")
    .eq("subcategory_id", subcategoryId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching subcategory broquel pricing:", error);
    return null;
  }

  if (!data) {
    return null;
  }

  return toBroquelPricingData(data);
}

// Get pricing data for multiple subcategories (Broquel)
export async function getAllSubcategoryBroquelPricing(): Promise<Map<string, SubcategoryBroquelPricingData>> {
  const { data, error } = await supabase
    .from("subcategory_broquel_pricing")
    .select("*");

  if (error) {
    console.error("Error fetching all subcategory broquel pricing:", error);
    return new Map();
  }

  const pricingMap = new Map<string, SubcategoryBroquelPricingData>();
  data.forEach((row) => {
    pricingMap.set(row.subcategory_id, toBroquelPricingData(row));
  });

  return pricingMap;
}

// Insert or update subcategory broquel pricing data
export async function upsertSubcategoryBroquelPricing(
  subcategoryId: string,
  pricingData: SubcategoryBroquelPricingData
) {
  const { data, error } = await supabase
    .from("subcategory_broquel_pricing")
    .upsert(toBroquelPricingRow(subcategoryId, pricingData), { onConflict: "subcategory_id" })
    .select()
    .maybeSingle();

  if (error) {
    console.error("Error upserting subcategory broquel pricing:", error);
    throw error;
  }

  return data;
}

// Batch upsert for multiple subcategories (Broquel)
export async function batchUpsertSubcategoryBroquelPricing(
  pricingDataArray: Array<{
    subcategoryId: string;
    pricingData: SubcategoryBroquelPricingData;
  }>
) {
  const insertData = pricingDataArray.map((item) => toBroquelPricingRow(item.subcategoryId, item.pricingData));

  const { data, error } = await supabase
    .from("subcategory_broquel_pricing")
    .upsert(insertData, { onConflict: "subcategory_id" })
    .select();

  if (error) {
    console.error("Error batch upserting subcategory broquel pricing:", error);
    throw error;
  }

  return data;
}

// ============================================
// Dynamic Price Calculation for Products
// ============================================

export interface DynamicPriceCalculationParams {
  goldGrams: number; // Gramos de oro de la talla seleccionada
  subcategoryId: string; // ID de la subcategoría interna
  categoryName: string; // Nombre de la categoría interna ("Gramo" o "Broquel")
}

/**
 * Calcular precio dinámico para un producto basado en subcategoría interna y gramos
 */
export async function calculateDynamicProductPrice(
  params: DynamicPriceCalculationParams
): Promise<number | null> {
  try {
    console.log('[calculateDynamicProductPrice] Calculating price with params:', params);

    // Determinar qué calculadora usar basándose en el nombre de la categoría
    const categoryNameLower = params.categoryName.toLowerCase().trim();
    const isBroquel = categoryNameLower === "broquel" || categoryNameLower === "broqueles";
    console.log('[calculateDynamicProductPrice] Category:', params.categoryName, 'categoryNameLower:', categoryNameLower, 'isBroquel:', isBroquel);

    if (isBroquel) {
      console.log('[calculateDynamicProductPrice] Using Broquel formula');
      // Obtener parámetros específicos de Broquel
      const broquelParams = await getBroquelPricingParameters();
      console.log('[calculateDynamicProductPrice] Broquel params:', broquelParams);
      
      // Calcular precio usando fórmula de Broquel
      const broquelData = await getSubcategoryBroquelPricing(params.subcategoryId);
      console.log('[calculateDynamicProductPrice] Broquel subcategory data:', broquelData);

      if (!broquelData) {
        console.log('[calculateDynamicProductPrice] No saved data, using defaults');
        // Si no hay datos guardados, usar valores por defecto
        // Para Broquel, params.goldGrams es en realidad el número de piezas
        const price = calculateBroquelPrice(DEFAULT_SUBCATEGORY_BROQUEL_PRICING, broquelParams, params.goldGrams);
        console.log('[calculateDynamicProductPrice] Calculated price (default):', price);
        return price;
      }

      // Para Broquel: params.goldGrams es el número de piezas (PZ) de la talla;
      // los gramos de oro por pieza vienen de la configuración del modelo
      const price = calculateBroquelPrice(broquelData, broquelParams, params.goldGrams);
      console.log('[calculateDynamicProductPrice] Calculated price (Broquel):', price);
      return price;
    } else {
      console.log('[calculateDynamicProductPrice] Using Gramo formula');
      // Obtener parámetros globales de Gramo
      const globalParams = await getPricingParameters();
      console.log('[calculateDynamicProductPrice] Gramo params:', globalParams);

      if (!globalParams) {
        throw new Error('No pricing parameters found');
      }

      // Calcular precio usando fórmula de Gramo
      const gramoData = await getSubcategoryPricing(params.subcategoryId);
      console.log('[calculateDynamicProductPrice] Gramo subcategory data:', gramoData);
      
      if (!gramoData) {
        console.log('[calculateDynamicProductPrice] No saved data, using defaults');
        // Si no hay datos guardados, usar valores por defecto
        const defaultData: SubcategoryPricingData = {
          ...DEFAULT_SUBCATEGORY_GRAMO_PRICING,
          goldGrams: params.goldGrams, // Usar los gramos de la talla
        };
        const price = calculateGramoPrice(defaultData, globalParams);
        console.log('[calculateDynamicProductPrice] Calculated price (default):', price);
        return price;
      }

      // Usar los gramos de la talla en lugar de los guardados
      const calculationData: SubcategoryPricingData = {
        ...gramoData,
        goldGrams: params.goldGrams,
      };
      console.log('[calculateDynamicProductPrice] Calculation data:', calculationData);

      const price = calculateGramoPrice(calculationData, globalParams);
      console.log('[calculateDynamicProductPrice] Calculated price (Gramo):', price);
      return price;
    }
  } catch (error) {
    console.error("Error calculating dynamic product price:", error);
    return null;
  }
}

/**
 * Calcular precio usando fórmula de Gramo
 * INCLUYE comisiones de Stripe (porcentaje y cuota fija de los parámetros guardados)
 */
export function calculateGramoPrice(
  pricingData: SubcategoryPricingData,
  globalParams: PricingParameters
): number {
  const { goldGrams, factor, laborCost, stoneCost, salesCommission, shippingCost } = pricingData;

  // Formula: ((($H$2*D5*F5)+(D5*(H5+I5)))*(1+J5)+(D5*K5)+L5)*(1+M5)
  const goldCost = globalParams.goldQuotation * goldGrams * factor;
  const materialsCost = goldGrams * (laborCost + stoneCost);
  const subtotalBeforeProfit = goldCost + materialsCost;
  const subtotalWithProfit = subtotalBeforeProfit * (1 + globalParams.profitMargin);
  const commissionCost = goldGrams * salesCommission;
  const subtotalWithCommissions = subtotalWithProfit + commissionCost + shippingCost;
  const subtotalWithVat = subtotalWithCommissions * (1 + globalParams.vat);

  // Agregar comisiones de Stripe usando los parámetros guardados
  const stripePercentage = globalParams.stripePercentage;
  const stripeFixedFee = globalParams.stripeFixedFee;
  const finalPrice = (subtotalWithVat * (1 + stripePercentage)) + stripeFixedFee;

  return finalPrice;
}

export interface BroquelCostBreakdown {
  /** Cotización × (Kilataje / 24) × Oro (por pieza) */
  goldCost: number;
  /** Costo oro × (1 + Merma) (por pieza) */
  goldCostWithMerma: number;
  /** Costo broquel = (Costo oro con merma + Mano de obra + Piedra) × PZ */
  broquelCost: number;
  /** Costo broquel × (1 + Utilidad) */
  subtotalWithProfit: number;
  /** PZ × Comisión de venta */
  commissionCost: number;
  /** (Subtotal con utilidad + comisión) × (1 + IVA) */
  subtotalWithVat: number;
  /** Precio final con Stripe (% y fija) */
  finalPrice: number;
}

/**
 * Fórmula de Broquel, igual que el Excel del cliente:
 *   Costo broquel = ((Cotización × Kilataje/24 × Oro) × (1 + Merma) + Mano de obra + Piedra) × PZ
 *   Costo final   = ((Costo broquel × (1 + Utilidad) + PZ × Comisión de venta) × (1 + IVA) × (1 + Stripe %)) + Stripe fija
 * El envío no se incluye: se cobra aparte al cliente.
 *
 * @param pieces Piezas a cotizar; por omisión, las piezas base de los parámetros generales.
 */
export function calculateBroquelBreakdown(
  pricingData: SubcategoryBroquelPricingData,
  broquelParams: BroquelPricingParameters,
  pieces: number = broquelParams.pz
): BroquelCostBreakdown {
  const { goldGrams, carats, merma, laborCost, stoneCost } = pricingData;

  const goldCost = broquelParams.quotation * (carats / 24) * goldGrams;
  const goldCostWithMerma = goldCost * (1 + merma / 100);
  const broquelCost = (goldCostWithMerma + laborCost + stoneCost) * pieces;
  const subtotalWithProfit = broquelCost * (1 + broquelParams.profitMargin);
  const commissionCost = pieces * broquelParams.salesCommission;
  const subtotalWithVat = (subtotalWithProfit + commissionCost) * (1 + broquelParams.vat);
  const finalPrice = subtotalWithVat * (1 + broquelParams.stripePercentage) + broquelParams.stripeFixedFee;

  return { goldCost, goldCostWithMerma, broquelCost, subtotalWithProfit, commissionCost, subtotalWithVat, finalPrice };
}

/** Precio final de Broquel (ver calculateBroquelBreakdown). */
export function calculateBroquelPrice(
  pricingData: SubcategoryBroquelPricingData,
  broquelParams: BroquelPricingParameters,
  pieces: number = broquelParams.pz
): number {
  return calculateBroquelBreakdown(pricingData, broquelParams, pieces).finalPrice;
}
