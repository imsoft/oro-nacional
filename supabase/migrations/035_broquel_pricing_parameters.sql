-- Migration: Create broquel pricing parameters table
-- Description: Table to store global pricing parameters for Broquel calculator

-- Table for global Broquel pricing parameters
CREATE TABLE IF NOT EXISTS broquel_pricing_parameters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation DECIMAL(10, 2) NOT NULL DEFAULT 2550.00,
  profit_margin DECIMAL(5, 4) NOT NULL DEFAULT 0.0800,
  vat DECIMAL(5, 4) NOT NULL DEFAULT 0.1600,
  stripe_percentage DECIMAL(5, 4) NOT NULL DEFAULT 0.0360,
  stripe_fixed_fee DECIMAL(10, 2) NOT NULL DEFAULT 3.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigger to auto-update updated_at
CREATE TRIGGER update_broquel_pricing_parameters_updated_at
  BEFORE UPDATE ON broquel_pricing_parameters
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default broquel pricing parameters if none exist
INSERT INTO broquel_pricing_parameters (
  quotation,
  profit_margin,
  vat,
  stripe_percentage,
  stripe_fixed_fee
)
SELECT 2550.00, 0.0800, 0.1600, 0.0360, 3.00
WHERE NOT EXISTS (SELECT 1 FROM broquel_pricing_parameters LIMIT 1);

-- Enable Row Level Security
ALTER TABLE broquel_pricing_parameters ENABLE ROW LEVEL SECURITY;

-- Policies for broquel_pricing_parameters (only admins can read/write)
CREATE POLICY "Admins can view broquel pricing parameters"
  ON broquel_pricing_parameters FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update broquel pricing parameters"
  ON broquel_pricing_parameters FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert broquel pricing parameters"
  ON broquel_pricing_parameters FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

COMMENT ON TABLE broquel_pricing_parameters IS 'Global pricing parameters for Broquel calculator';
