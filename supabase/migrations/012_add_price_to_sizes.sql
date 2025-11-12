-- Migration: Add price column to product_sizes table
-- This allows each size to have its own individual price

-- Step 1: Add price column to product_sizes
ALTER TABLE public.product_sizes
ADD COLUMN IF NOT EXISTS price NUMERIC(10, 2);

-- Step 2: Set default price from parent product for existing sizes
UPDATE public.product_sizes ps
SET price = p.price
FROM public.products p
WHERE ps.product_id = p.id
AND ps.price IS NULL;

-- Step 3: Add comment
COMMENT ON COLUMN public.product_sizes.price IS 'Individual price for this size. If NULL, uses the base product price.';

-- Step 4: Create index for price queries
CREATE INDEX IF NOT EXISTS idx_product_sizes_price ON public.product_sizes(price);
