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
