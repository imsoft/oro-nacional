-- Migration: Internal Subcategories Table
-- Description: Create table for internal subcategories (child categories of internal categories)

-- Table for internal subcategories
CREATE TABLE IF NOT EXISTS internal_subcategories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  internal_category_id UUID NOT NULL REFERENCES internal_categories(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  color VARCHAR(7), -- Hex color code for UI display
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_internal_subcategories_category_id ON internal_subcategories(internal_category_id);
CREATE INDEX IF NOT EXISTS idx_internal_subcategories_is_active ON internal_subcategories(is_active);
CREATE INDEX IF NOT EXISTS idx_internal_subcategories_display_order ON internal_subcategories(internal_category_id, display_order);

-- Enable RLS (Row Level Security)
ALTER TABLE internal_subcategories ENABLE ROW LEVEL SECURITY;

-- Policy: Only authenticated users can view internal subcategories
CREATE POLICY "Authenticated users can view internal subcategories"
  ON internal_subcategories
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Only authenticated users can insert internal subcategories
CREATE POLICY "Authenticated users can insert internal subcategories"
  ON internal_subcategories
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Only authenticated users can update internal subcategories
CREATE POLICY "Authenticated users can update internal subcategories"
  ON internal_subcategories
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Only authenticated users can delete internal subcategories
CREATE POLICY "Authenticated users can delete internal subcategories"
  ON internal_subcategories
  FOR DELETE
  TO authenticated
  USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_internal_subcategories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_internal_subcategories_updated_at ON internal_subcategories;
CREATE TRIGGER update_internal_subcategories_updated_at
  BEFORE UPDATE ON internal_subcategories
  FOR EACH ROW
  EXECUTE FUNCTION update_internal_subcategories_updated_at();

COMMENT ON TABLE internal_subcategories IS 'Internal subcategories for administrative use only. Child categories of internal categories.';
COMMENT ON COLUMN internal_subcategories.color IS 'Hex color code for UI display (e.g., #D4AF37)';
COMMENT ON COLUMN internal_subcategories.is_active IS 'Whether the subcategory is active and can be used';
COMMENT ON COLUMN internal_subcategories.display_order IS 'Order in which subcategories are displayed within their parent category';

