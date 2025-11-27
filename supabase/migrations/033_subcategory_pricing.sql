-- Migration: Create subcategory pricing tables for calculators
-- Description: Tables to store pricing calculation data for internal subcategories

-- Table for Gramo calculator pricing data
CREATE TABLE IF NOT EXISTS subcategory_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subcategory_id UUID NOT NULL REFERENCES internal_subcategories(id) ON DELETE CASCADE,
  gold_grams DECIMAL(10, 3) NOT NULL DEFAULT 5.0,
  factor DECIMAL(10, 3) NOT NULL DEFAULT 0.442,
  labor_cost DECIMAL(10, 2) NOT NULL DEFAULT 15.0,
  stone_cost DECIMAL(10, 2) NOT NULL DEFAULT 0.0,
  sales_commission DECIMAL(10, 2) NOT NULL DEFAULT 30.0,
  shipping_cost DECIMAL(10, 2) NOT NULL DEFAULT 800.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(subcategory_id)
);

CREATE INDEX IF NOT EXISTS idx_subcategory_pricing_subcategory_id ON subcategory_pricing(subcategory_id);

-- Table for Broquel calculator pricing data
CREATE TABLE IF NOT EXISTS subcategory_broquel_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subcategory_id UUID NOT NULL REFERENCES internal_subcategories(id) ON DELETE CASCADE,
  pz DECIMAL(10, 2) NOT NULL DEFAULT 1.0,
  gold_grams DECIMAL(10, 3) NOT NULL DEFAULT 0.185,
  carats INTEGER NOT NULL DEFAULT 10,
  factor DECIMAL(10, 3) NOT NULL DEFAULT 0.0,
  merma DECIMAL(10, 2) NOT NULL DEFAULT 8.0,
  labor_cost DECIMAL(10, 2) NOT NULL DEFAULT 20.0,
  stone_cost DECIMAL(10, 2) NOT NULL DEFAULT 0.0,
  sales_commission DECIMAL(10, 2) NOT NULL DEFAULT 30.0,
  shipping DECIMAL(10, 2) NOT NULL DEFAULT 800.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(subcategory_id)
);

CREATE INDEX IF NOT EXISTS idx_subcategory_broquel_pricing_subcategory_id ON subcategory_broquel_pricing(subcategory_id);

-- Enable RLS
ALTER TABLE subcategory_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategory_broquel_pricing ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subcategory_pricing
CREATE POLICY "Authenticated users can view subcategory pricing"
  ON subcategory_pricing
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage subcategory pricing"
  ON subcategory_pricing
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for subcategory_broquel_pricing
CREATE POLICY "Authenticated users can view subcategory broquel pricing"
  ON subcategory_broquel_pricing
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage subcategory broquel pricing"
  ON subcategory_broquel_pricing
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Trigger to update updated_at
CREATE TRIGGER update_subcategory_pricing_updated_at
  BEFORE UPDATE ON subcategory_pricing
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subcategory_broquel_pricing_updated_at
  BEFORE UPDATE ON subcategory_broquel_pricing
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE subcategory_pricing IS 'Pricing calculation data for internal subcategories (Gramo calculator)';
COMMENT ON TABLE subcategory_broquel_pricing IS 'Pricing calculation data for internal subcategories (Broquel calculator)';

