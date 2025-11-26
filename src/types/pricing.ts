// Types for pricing calculations

export interface PricingParameters {
  goldQuotation: number; // H2: Gold price per gram
  profitMargin: number; // J5: Profit margin percentage (0.10 = 10%)
  vat: number; // M5: VAT percentage (0.16 = 16%)
  stripePercentage: number; // N5: Stripe commission percentage (0.036 = 3.6%)
  stripeFixedFee: number; // O5: Stripe fixed commission in pesos
}

export interface ProductPricingData {
  id: string;
  name: string;
  goldGrams: number; // D5: Gold grams
  factor: number; // F5: Multiplier factor
  laborCost: number; // H5: Labor cost
  stoneCost: number; // I5: Stone/gem cost
  salesCommission: number; // K5: Sales commission per gram
  shippingCost: number; // L5: Shipping cost

  // Original product fields
  material: string;
  stock: number;
  category_name?: string;
  primary_image?: string;
  is_active: boolean;
}

export interface ProductPricingCalculation extends ProductPricingData {
  // Intermediate calculations
  goldCost: number; // $H$2 * D5 * F5
  materialsCost: number; // D5 * (H5 + I5)
  subtotalBeforeProfit: number; // (goldCost + materialsCost)
  subtotalWithProfit: number; // subtotalBeforeProfit * (1 + J5)
  commissionCost: number; // D5 * K5
  subtotalWithCommissions: number; // subtotalWithProfit + commissionCost + shippingCost
  subtotalWithVat: number; // subtotalWithCommissions * (1 + M5)
  subtotalWithStripePercentage: number; // subtotalWithVat * (1 + N5)
  finalPrice: number; // subtotalWithStripePercentage + O5
}

export interface PricingConfig {
  id?: string;
  parameters: PricingParameters;
  created_at?: string;
  updated_at?: string;
}
