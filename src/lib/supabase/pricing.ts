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
export async function getPricingParameters(): Promise<PricingParameters> {
  const { data, error } = await supabase
    .from("pricing_parameters")
    .select("*")
    .limit(1)
    .single();

  if (error) {
    console.error("Error fetching pricing parameters:", error);
    throw error;
  }

  return convertPricingParameters(data);
}

// Update global pricing parameters
export async function updatePricingParameters(
  parameters: PricingParameters
): Promise<PricingParameters> {
  // Get the current row to update it
  const { data: current } = await supabase
    .from("pricing_parameters")
    .select("id")
    .limit(1)
    .single();

  const updateData = {
    gold_quotation: parameters.goldQuotation,
    profit_margin: parameters.profitMargin,
    vat: parameters.vat,
    stripe_percentage: parameters.stripePercentage,
    stripe_fixed_fee: parameters.stripeFixedFee,
  };

  if (current) {
    // Update existing row
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
export async function getBroquelPricingParameters(): Promise<BroquelPricingParameters> {
  const { data, error } = await supabase
    .from("broquel_pricing_parameters")
    .select("*")
    .limit(1)
    .single();

  if (error) {
    console.error("Error fetching broquel pricing parameters:", error);
    // Return default values if error
    return {
      quotation: 2550,
      profitMargin: 0.08,
      vat: 0.16,
      stripePercentage: 0.036,
      stripeFixedFee: 3.00,
    };
  }

  return convertBroquelPricingParameters(data);
}

// Update global broquel pricing parameters
export async function updateBroquelPricingParameters(
  parameters: BroquelPricingParameters
): Promise<BroquelPricingParameters> {
  // Get the current row to update it
  const { data: current } = await supabase
    .from("broquel_pricing_parameters")
    .select("id")
    .limit(1)
    .single();

  const updateData = {
    quotation: parameters.quotation,
    profit_margin: parameters.profitMargin,
    vat: parameters.vat,
    stripe_percentage: parameters.stripePercentage,
    stripe_fixed_fee: parameters.stripeFixedFee,
  };

  if (current) {
    // Update existing row
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
    // Obtener parámetros globales
    const globalParams = await getPricingParameters();

    // Determinar qué calculadora usar basándose en el nombre de la categoría
    const isBroquel = params.categoryName.toLowerCase() === "broquel";

    if (isBroquel) {
      // Calcular precio usando fórmula de Broquel
      const broquelData = await getSubcategoryBroquelPricing(params.subcategoryId);
      
      if (!broquelData) {
        // Si no hay datos guardados, usar valores por defecto
        const defaultData: SubcategoryBroquelPricingData = {
          pz: 1.0,
          goldGrams: params.goldGrams, // Usar los gramos de la talla
          carats: 10,
          factor: 0.000,
          merma: 8.00,
          laborCost: 20.00,
          stoneCost: 0.00,
          salesCommission: 30.00,
          shipping: 800.00,
        };
        return calculateBroquelPrice(defaultData, globalParams);
      }

      // Usar los gramos de la talla en lugar de los guardados
      const calculationData: SubcategoryBroquelPricingData = {
        ...broquelData,
        goldGrams: params.goldGrams,
      };

      return calculateBroquelPrice(calculationData, globalParams);
    } else {
      // Calcular precio usando fórmula de Gramo
      const gramoData = await getSubcategoryPricing(params.subcategoryId);
      
      if (!gramoData) {
        // Si no hay datos guardados, usar valores por defecto
        const defaultData: SubcategoryPricingData = {
          goldGrams: params.goldGrams, // Usar los gramos de la talla
          factor: 0.442,
          laborCost: 15,
          stoneCost: 0,
          salesCommission: 30,
          shippingCost: 800,
        };
        return calculateGramoPrice(defaultData, globalParams);
      }

      // Usar los gramos de la talla en lugar de los guardados
      const calculationData: SubcategoryPricingData = {
        ...gramoData,
        goldGrams: params.goldGrams,
      };

      return calculateGramoPrice(calculationData, globalParams);
    }
  } catch (error) {
    console.error("Error calculating dynamic product price:", error);
    return null;
  }
}

/**
 * Calcular precio usando fórmula de Gramo
 */
function calculateGramoPrice(
  pricingData: SubcategoryPricingData,
  globalParams: PricingParameters
): number {
  const { goldGrams, factor, laborCost, stoneCost, salesCommission, shippingCost } = pricingData;

  // Formula: ((($H$2*D5*F5)+(D5*(H5+I5)))*(1+J5)+(D5*K5)+L5)*(1+M5)*(1+N5)+O5
  const goldCost = globalParams.goldQuotation * goldGrams * factor;
  const materialsCost = goldGrams * (laborCost + stoneCost);
  const subtotalBeforeProfit = goldCost + materialsCost;
  const subtotalWithProfit = subtotalBeforeProfit * (1 + globalParams.profitMargin);
  const commissionCost = goldGrams * salesCommission;
  const subtotalWithCommissions = subtotalWithProfit + commissionCost + shippingCost;
  const subtotalWithVat = subtotalWithCommissions * (1 + globalParams.vat);
  const subtotalWithStripePercentage = subtotalWithVat * (1 + globalParams.stripePercentage);
  const finalPrice = subtotalWithStripePercentage + globalParams.stripeFixedFee;

  return finalPrice;
}

/**
 * Calcular precio usando fórmula de Broquel
 */
function calculateBroquelPrice(
  pricingData: SubcategoryBroquelPricingData,
  globalParams: PricingParameters
): number {
  const { pz, goldGrams, carats, merma, laborCost, stoneCost, salesCommission, shipping } = pricingData;

  // Fórmula Excel paso a paso:
  // 1. (COTIZACIÓN * KILATAJE / 24 * ORO(GRS))
  const goldCost = globalParams.goldQuotation * (carats / 24) * goldGrams;

  // 2. goldCost * (1 + MERMA%)
  const mermaDecimal = merma / 100; // Convertir % a decimal
  const goldCostWithMerma = goldCost * (1 + mermaDecimal);

  // 3. + MANO DE OBRA + PIEDRA
  const subtotalBeforeProfit = goldCostWithMerma + laborCost + stoneCost;

  // 4. * PZ
  const subtotalByPieces = subtotalBeforeProfit * pz;

  // 5. * (1 + UTILIDAD)
  const subtotalWithProfit = subtotalByPieces * (1 + globalParams.profitMargin);

  // 6. + (PZ * COMISIÓN DE VENTA)
  const commissionCost = pz * salesCommission;
  const subtotalWithCommission = subtotalWithProfit + commissionCost;

  // 7. + ENVÍO
  const subtotalWithShipping = subtotalWithCommission + shipping;

  // 8. * (1 + IVA)
  const subtotalWithVat = subtotalWithShipping * (1 + globalParams.vat);

  // 9. * (1 + STRIPE%)
  const subtotalWithStripe = subtotalWithVat * (1 + globalParams.stripePercentage);

  // 10. + STRIPE FIJO
  const finalPrice = subtotalWithStripe + globalParams.stripeFixedFee;

  return finalPrice;
}
