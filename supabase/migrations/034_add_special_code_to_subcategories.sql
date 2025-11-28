-- Migration: Add special_code field to internal_subcategories
-- Description: Add a special code field to internal subcategories for identification purposes

-- Add special_code column to internal_subcategories table
ALTER TABLE internal_subcategories
ADD COLUMN IF NOT EXISTS special_code VARCHAR(100);

-- Create index for better performance when searching by special code
CREATE INDEX IF NOT EXISTS idx_internal_subcategories_special_code 
ON internal_subcategories(special_code) 
WHERE special_code IS NOT NULL;

-- Add comment
COMMENT ON COLUMN internal_subcategories.special_code IS 'Special code for identifying the subcategory (e.g., product codes, SKU codes, etc.)';

