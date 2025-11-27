-- Migration: Add weight column to product_sizes table
-- Description: Adds a weight (grams) column to store the gold weight for each size

-- Step 1: Add weight column to product_sizes
ALTER TABLE public.product_sizes
ADD COLUMN IF NOT EXISTS weight DECIMAL(10, 3);

-- Step 2: Add comment to document the column
COMMENT ON COLUMN public.product_sizes.weight IS 'Weight in grams of gold for this specific size. Used in pricing calculations for products sold by weight.';

-- Step 3: Create index for performance (optional, but recommended if filtering by weight)
CREATE INDEX IF NOT EXISTS idx_product_sizes_weight
ON public.product_sizes(weight)
WHERE weight IS NOT NULL;
