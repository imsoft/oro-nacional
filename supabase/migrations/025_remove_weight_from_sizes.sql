-- Migration: Remove weight column from product_sizes table
-- Description: Remove the weight field from product sizes as it's no longer needed

-- Drop the index on weight column if it exists
DROP INDEX IF EXISTS idx_product_sizes_weight;

-- Remove the weight column from product_sizes table
ALTER TABLE public.product_sizes
DROP COLUMN IF EXISTS weight;
