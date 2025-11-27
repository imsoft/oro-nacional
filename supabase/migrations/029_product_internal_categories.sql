-- Migration: Product Internal Categories Relationship
-- Description: Create many-to-many relationship between products and internal categories

-- Table for product-internal category relationships
CREATE TABLE IF NOT EXISTS product_internal_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  internal_category_id UUID NOT NULL REFERENCES internal_categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(product_id, internal_category_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_product_internal_categories_product_id ON product_internal_categories(product_id);
CREATE INDEX IF NOT EXISTS idx_product_internal_categories_internal_category_id ON product_internal_categories(internal_category_id);

-- Enable RLS (Row Level Security)
ALTER TABLE product_internal_categories ENABLE ROW LEVEL SECURITY;

-- Policy: Only authenticated users can view product-internal category relationships
CREATE POLICY "Authenticated users can view product-internal categories"
  ON product_internal_categories
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Only authenticated users can insert product-internal category relationships
CREATE POLICY "Authenticated users can insert product-internal categories"
  ON product_internal_categories
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Only authenticated users can delete product-internal category relationships
CREATE POLICY "Authenticated users can delete product-internal categories"
  ON product_internal_categories
  FOR DELETE
  TO authenticated
  USING (true);

COMMENT ON TABLE product_internal_categories IS 'Many-to-many relationship between products and internal categories (for administrative use only)';

