import { supabase } from "./client";
import type { PricingParameters } from "@/types/pricing";

// Database types matching the schema
interface PricingParametersRow {
  id: string;
  gold_quotation: number;
  profit_margin: number;
  vat: number;
  stripe_percentage: number;
  stripe_fixed_fee: number;
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
  return {
    goldQuotation: row.gold_quotation,
    profitMargin: row.profit_margin,
    vat: row.vat,
    stripePercentage: row.stripe_percentage,
    stripeFixedFee: row.stripe_fixed_fee,
  };
}

// Get global pricing parameters
export async function getPricingParameters(): Promise<PricingParameters | null> {
  const { data, error } = await supabase
    .from("pricing_parameters")
    .select("*")
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Error fetching pricing parameters:", error);
    // Return null instead of throwing to allow graceful handling
    return null;
  }

  if (!data) {
    console.warn("No pricing parameters found in database");
    return null;
  }

  return convertPricingParameters(data);
}

// Update global pricing parameters
// NOTE: La cotización se sincroniza automáticamente con broquel_pricing_parameters vía trigger de BD (046_sync_gold_quotation_triggers.sql)
export async function updatePricingParameters(
  parameters: PricingParameters
): Promise<PricingParameters> {
  // Get the current row to update it - use maybeSingle to avoid errors if no row exists
  const { data: current, error: selectError } = await supabase
    .from("pricing_parameters")
    .select("id")
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

interface BroquelPricingParametersRow {
  id: string;
  quotation: number;
  profit_margin: number;
  vat: number;
  stripe_percentage: number;
  stripe_fixed_fee: number;
  created_at: string;
  updated_at: string;
}

export interface BroquelPricingParameters {
  quotation: number;
  profitMargin: number;
  vat: number;
  stripePercentage: number;
  stripeFixedFee: number;
}

// Convert database row to application type
function convertBroquelPricingParameters(row: BroquelPricingParametersRow): BroquelPricingParameters {
  return {
    quotation: row.quotation,
    profitMargin: row.profit_margin,
    vat: row.vat,
    stripePercentage: row.stripe_percentage,
    stripeFixedFee: row.stripe_fixed_fee,
  };
}

// Get global broquel pricing parameters
// NOTE: La cotización del oro (quotation) se sincroniza con pricing_parameters.gold_quotation
// para que ambos calculadores (Gramo y Broquel) usen el mismo precio del oro
export async function getBroquelPricingParameters(): Promise<BroquelPricingParameters> {
  // Obtener parámetros de broquel
  const { data: broquelData, error: broquelError } = await supabase
    .from("broquel_pricing_parameters")
    .select("*")
    .limit(1)
    .single();

  // Obtener la cotización del oro desde pricing_parameters (fuente única de verdad)
  const { data: pricingData, error: pricingError } = await supabase
    .from("pricing_parameters")
    .select("gold_quotation")
    .limit(1)
    .single();

  if (broquelError) {
    console.error("Error fetching broquel pricing parameters:", broquelError);
    // Return default values if error, usando la cotización de pricing_parameters si está disponible
    return {
      quotation: pricingData?.gold_quotation || 2450,
      profitMargin: 0.08,
      vat: 0.16,
      stripePercentage: 0.036,
      stripeFixedFee: 3.00,
    };
  }

  // Usar la cotización de pricing_parameters si está disponible, sino usar la de broquel
  const syncedQuotation = pricingData?.gold_quotation || broquelData.quotation;

  return {
    quotation: syncedQuotation,
    profitMargin: broquelData.profit_margin,
    vat: broquelData.vat,
    stripePercentage: broquelData.stripe_percentage,
    stripeFixedFee: broquelData.stripe_fixed_fee,
  };
}

// Update global broquel pricing parameters
// NOTE: La cotización se sincroniza automáticamente con pricing_parameters vía trigger de BD (046_sync_gold_quotation_triggers.sql)
export async function updateBroquelPricingParameters(
  parameters: BroquelPricingParameters
): Promise<BroquelPricingParameters> {
  // Get the current row to update it - use maybeSingle to avoid errors if no row exists
  const { data: current, error: selectError } = await supabase
    .from("broquel_pricing_parameters")
    .select("id")
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
  };

  if (current && current.id) {
    // Update existing row (trigger sincronizará automáticamente con pricing_parameters)
    const { data, error } = await supabase
      .from("broquel_pricing_parameters")
      .update(updateData)
      .eq("id", current.id)
      .select()
      .single();

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

export interface SubcategoryBroquelPricingData {
  pz: number;
  goldGrams: number;
  carats: number;
  factor: number;
  merma: number;
  laborCost: number;
  stoneCost: number;
  salesCommission: number;
  shipping: number;
}

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

  return {
    pz: data.pz,
    goldGrams: data.gold_grams,
    carats: data.carats,
    factor: data.factor,
    merma: data.merma,
    laborCost: data.labor_cost,
    stoneCost: data.stone_cost,
    salesCommission: data.sales_commission,
    shipping: data.shipping,
  };
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
    pricingMap.set(row.subcategory_id, {
      pz: row.pz,
      goldGrams: row.gold_grams,
      carats: row.carats,
      factor: row.factor,
      merma: row.merma,
      laborCost: row.labor_cost,
      stoneCost: row.stone_cost,
      salesCommission: row.sales_commission,
      shipping: row.shipping,
    });
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
    .upsert(
      {
        subcategory_id: subcategoryId,
        pz: pricingData.pz,
        gold_grams: pricingData.goldGrams,
        carats: pricingData.carats,
        factor: pricingData.factor,
        merma: pricingData.merma,
        labor_cost: pricingData.laborCost,
        stone_cost: pricingData.stoneCost,
        sales_commission: pricingData.salesCommission,
        shipping: pricingData.shipping,
      },
      { onConflict: "subcategory_id" }
    )
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
  const insertData = pricingDataArray.map((item) => ({
    subcategory_id: item.subcategoryId,
    pz: item.pricingData.pz,
    gold_grams: item.pricingData.goldGrams,
    carats: item.pricingData.carats,
    factor: item.pricingData.factor,
    merma: item.pricingData.merma,
    labor_cost: item.pricingData.laborCost,
    stone_cost: item.pricingData.stoneCost,
    sales_commission: item.pricingData.salesCommission,
    shipping: item.pricingData.shipping,
  }));

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
        const defaultData: SubcategoryBroquelPricingData = {
          pz: params.goldGrams, // Para Broquel, params.goldGrams es en realidad el número de piezas
          goldGrams: 1.0, // Gramos por pieza por defecto
          carats: 10,
          factor: 0.000,
          merma: 8.00,
          laborCost: 20.00,
          stoneCost: 0.00,
          salesCommission: 30.00,
          shipping: 800.00,
        };
        const price = calculateBroquelPrice(defaultData, broquelParams);
        console.log('[calculateDynamicProductPrice] Calculated price (default):', price);
        return price;
      }

      // Para Broquel: params.goldGrams es el número de piezas (PZ)
      // Los gramos de oro por pieza vienen de la configuración de la subcategoría
      const calculationData: SubcategoryBroquelPricingData = {
        ...broquelData,
        pz: params.goldGrams, // params.goldGrams es en realidad el número de piezas
      };
      console.log('[calculateDynamicProductPrice] Calculation data:', calculationData);

      const price = calculateBroquelPrice(calculationData, broquelParams);
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
          goldGrams: params.goldGrams, // Usar los gramos de la talla
          factor: 0.442,
          laborCost: 15,
          stoneCost: 0,
          salesCommission: 30,
          shippingCost: 800,
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
 * INCLUYE comisiones de Stripe: 3.6% + $3 MXN
 */
function calculateGramoPrice(
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

  // Agregar comisiones de Stripe: 3.6% + $3 MXN
  const stripePercentage = 0.036; // 3.6%
  const stripeFixedFee = 3; // $3 MXN
  const finalPrice = (subtotalWithVat * (1 + stripePercentage)) + stripeFixedFee;

  return finalPrice;
}

/**
 * Calcular precio usando fórmula de Broquel
 * INCLUYE comisiones de Stripe: 3.6% + $3 MXN
 */
function calculateBroquelPrice(
  pricingData: SubcategoryBroquelPricingData,
  broquelParams: BroquelPricingParameters
): number {
  const { pz, goldGrams, carats, merma, laborCost, stoneCost, salesCommission, shipping } = pricingData;

  // Fórmula Excel paso a paso:
  // 1. (COTIZACIÓN * KILATAJE / 24 * ORO(GRS))
  const goldCost = broquelParams.quotation * (carats / 24) * goldGrams;

  // 2. goldCost * (1 + MERMA%)
  const mermaDecimal = merma / 100; // Convertir % a decimal
  const goldCostWithMerma = goldCost * (1 + mermaDecimal);

  // 3. + MANO DE OBRA + PIEDRA
  const subtotalBeforeProfit = goldCostWithMerma + laborCost + stoneCost;

  // 4. * PZ
  const subtotalByPieces = subtotalBeforeProfit * pz;

  // 5. * (1 + UTILIDAD)
  const subtotalWithProfit = subtotalByPieces * (1 + broquelParams.profitMargin);

  // 6. + (PZ * COMISIÓN DE VENTA)
  const commissionCost = pz * salesCommission;
  const subtotalWithCommission = subtotalWithProfit + commissionCost;

  // 7. + ENVÍO
  const subtotalWithShipping = subtotalWithCommission + shipping;

  // 8. * (1 + IVA)
  const subtotalWithVat = subtotalWithShipping * (1 + broquelParams.vat);

  // 9. Agregar comisiones de Stripe: 3.6% + $3 MXN
  const stripePercentage = 0.036; // 3.6%
  const stripeFixedFee = 3; // $3 MXN
  const finalPrice = (subtotalWithVat * (1 + stripePercentage)) + stripeFixedFee;

  return finalPrice;
}
