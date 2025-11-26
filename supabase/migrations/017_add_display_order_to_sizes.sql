-- Migration: Add display_order column to product_sizes table
-- This allows sizes to be ordered and displayed in a specific sequence

-- Step 1: Add display_order column to product_sizes
ALTER TABLE public.product_sizes
ADD COLUMN IF NOT EXISTS display_order INTEGER NOT NULL DEFAULT 0;

-- Step 2: Set display_order based on creation order for existing sizes
-- This ensures existing sizes have a proper order
UPDATE public.product_sizes ps
SET display_order = sub.row_num - 1
FROM (
  SELECT 
    id,
    product_id,
    ROW_NUMBER() OVER (PARTITION BY product_id ORDER BY created_at ASC) as row_num
  FROM public.product_sizes
) sub
WHERE ps.id = sub.id;

-- Step 3: Create index for ordering queries
CREATE INDEX IF NOT EXISTS idx_product_sizes_display_order 
ON public.product_sizes(product_id, display_order);

-- Step 4: Add comment
COMMENT ON COLUMN public.product_sizes.display_order IS 'Order in which sizes are displayed (lower numbers first). Used for sorting sizes in the product form and product page.';

