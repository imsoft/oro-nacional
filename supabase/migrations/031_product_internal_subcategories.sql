-- Migration: Product Internal Subcategories Relationship
-- Description: Add support for internal subcategories in product-internal category relationships

-- Make internal_category_id nullable to support subcategories
ALTER TABLE product_internal_categories
ALTER COLUMN internal_category_id DROP NOT NULL;

-- Add column for subcategory relationship (nullable, can be either category or subcategory)
ALTER TABLE product_internal_categories
ADD COLUMN IF NOT EXISTS internal_subcategory_id UUID REFERENCES internal_subcategories(id) ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_product_internal_categories_subcategory_id ON product_internal_categories(internal_subcategory_id);

-- Add constraint: either category_id or subcategory_id must be set, but not both
ALTER TABLE product_internal_categories
DROP CONSTRAINT IF EXISTS product_internal_categories_category_or_subcategory;

ALTER TABLE product_internal_categories
ADD CONSTRAINT product_internal_categories_category_or_subcategory
CHECK (
  (internal_category_id IS NOT NULL AND internal_subcategory_id IS NULL) OR
  (internal_category_id IS NULL AND internal_subcategory_id IS NOT NULL)
);

-- Drop old unique constraint if exists
DROP INDEX IF EXISTS product_internal_categories_product_id_internal_category_id_key;

-- Create new unique constraints
CREATE UNIQUE INDEX IF NOT EXISTS product_internal_categories_product_category_unique
ON product_internal_categories(product_id, internal_category_id)
WHERE internal_subcategory_id IS NULL AND internal_category_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS product_internal_categories_product_subcategory_unique
ON product_internal_categories(product_id, internal_subcategory_id)
WHERE internal_category_id IS NULL AND internal_subcategory_id IS NOT NULL;

COMMENT ON COLUMN product_internal_categories.internal_subcategory_id IS 'Optional subcategory relationship. If set, internal_category_id should be NULL.';

