-- Migration: Add base_price and base_grams to products table
-- Description: 
--   - Add base_price field to store the calculated final price from price calculators
--   - Add base_grams field to store the reference grams used for the base price calculation
--   - These fields are used to calculate size prices proportionally
-- Version: 036
-- Created: 2025-01-XX

-- ================================================
-- 1. Agregar base_price a products
-- ================================================
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS base_price NUMERIC(10, 2);

-- Agregar comentario
COMMENT ON COLUMN public.products.base_price IS 'Base price calculated from price calculator. Used as reference to calculate size prices proportionally.';

-- ================================================
-- 2. Agregar base_grams a products
-- ================================================
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS base_grams NUMERIC(10, 3);

-- Agregar comentario
COMMENT ON COLUMN public.products.base_grams IS 'Reference grams used to calculate base_price. Used to proportionally calculate size prices based on their weight.';

-- ================================================
-- 3. Crear índices para mejor rendimiento
-- ================================================
CREATE INDEX IF NOT EXISTS idx_products_base_price 
ON public.products(base_price)
WHERE base_price IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_products_base_grams 
ON public.products(base_grams)
WHERE base_grams IS NOT NULL;

