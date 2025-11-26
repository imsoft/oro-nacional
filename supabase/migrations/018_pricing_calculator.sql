-- Migration: Pricing Calculator Tables
-- Description: Add tables for storing pricing parameters and product pricing data

-- Table for global pricing parameters
CREATE TABLE IF NOT EXISTS pricing_parameters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gold_quotation DECIMAL(10, 2) NOT NULL DEFAULT 1500.00,
  profit_margin DECIMAL(5, 4) NOT NULL DEFAULT 0.3000,
  vat DECIMAL(5, 4) NOT NULL DEFAULT 0.1600,
  stripe_percentage DECIMAL(5, 4) NOT NULL DEFAULT 0.0360,
  stripe_fixed_fee DECIMAL(10, 2) NOT NULL DEFAULT 3.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table for product-specific pricing data
CREATE TABLE IF NOT EXISTS product_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  gold_grams DECIMAL(10, 3) NOT NULL DEFAULT 5.000,
  factor DECIMAL(10, 3) NOT NULL DEFAULT 1.000,
  labor_cost DECIMAL(10, 2) NOT NULL DEFAULT 50.00,
  stone_cost DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  sales_commission DECIMAL(10, 2) NOT NULL DEFAULT 10.00,
  shipping_cost DECIMAL(10, 2) NOT NULL DEFAULT 150.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(product_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_product_pricing_product_id ON product_pricing(product_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to auto-update updated_at
DROP TRIGGER IF EXISTS update_pricing_parameters_updated_at ON pricing_parameters;
CREATE TRIGGER update_pricing_parameters_updated_at
  BEFORE UPDATE ON pricing_parameters
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_product_pricing_updated_at ON product_pricing;
CREATE TRIGGER update_product_pricing_updated_at
  BEFORE UPDATE ON product_pricing
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default pricing parameters if none exist
INSERT INTO pricing_parameters (
  gold_quotation,
  profit_margin,
  vat,
  stripe_percentage,
  stripe_fixed_fee
)
SELECT 1500.00, 0.3000, 0.1600, 0.0360, 3.00
WHERE NOT EXISTS (SELECT 1 FROM pricing_parameters LIMIT 1);

-- Enable Row Level Security
ALTER TABLE pricing_parameters ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_pricing ENABLE ROW LEVEL SECURITY;

-- Policies for pricing_parameters (only admins can read/write)
DROP POLICY IF EXISTS "Admins can view pricing parameters" ON pricing_parameters;
CREATE POLICY "Admins can view pricing parameters"
  ON pricing_parameters FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update pricing parameters" ON pricing_parameters;
CREATE POLICY "Admins can update pricing parameters"
  ON pricing_parameters FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can insert pricing parameters" ON pricing_parameters;
CREATE POLICY "Admins can insert pricing parameters"
  ON pricing_parameters FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Policies for product_pricing (only admins can read/write)
DROP POLICY IF EXISTS "Admins can view product pricing" ON product_pricing;
CREATE POLICY "Admins can view product pricing"
  ON product_pricing FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update product pricing" ON product_pricing;
CREATE POLICY "Admins can update product pricing"
  ON product_pricing FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can insert product pricing" ON product_pricing;
CREATE POLICY "Admins can insert product pricing"
  ON product_pricing FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can delete product pricing" ON product_pricing;
CREATE POLICY "Admins can delete product pricing"
  ON product_pricing FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );
