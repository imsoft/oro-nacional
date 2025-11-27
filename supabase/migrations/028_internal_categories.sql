-- Migration: Internal Categories Table
-- Description: Create table for internal categories (not visible to end users)

-- Table for internal categories
CREATE TABLE IF NOT EXISTS internal_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  color VARCHAR(7), -- Hex color code for UI display
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_internal_categories_name ON internal_categories(name);
CREATE INDEX IF NOT EXISTS idx_internal_categories_is_active ON internal_categories(is_active);

-- Enable RLS (Row Level Security)
ALTER TABLE internal_categories ENABLE ROW LEVEL SECURITY;

-- Policy: Only authenticated users can view internal categories
CREATE POLICY "Authenticated users can view internal categories"
  ON internal_categories
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Only authenticated users can insert internal categories
CREATE POLICY "Authenticated users can insert internal categories"
  ON internal_categories
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Only authenticated users can update internal categories
CREATE POLICY "Authenticated users can update internal categories"
  ON internal_categories
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Only authenticated users can delete internal categories
CREATE POLICY "Authenticated users can delete internal categories"
  ON internal_categories
  FOR DELETE
  TO authenticated
  USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_internal_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_internal_categories_updated_at ON internal_categories;
CREATE TRIGGER update_internal_categories_updated_at
  BEFORE UPDATE ON internal_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_internal_categories_updated_at();

COMMENT ON TABLE internal_categories IS 'Internal categories for administrative use only. Not visible to end users.';
COMMENT ON COLUMN internal_categories.color IS 'Hex color code for UI display (e.g., #D4AF37)';
COMMENT ON COLUMN internal_categories.is_active IS 'Whether the category is active and can be used';

