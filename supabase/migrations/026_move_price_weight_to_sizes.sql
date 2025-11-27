-- Migration: Move price and weight from products to product_sizes
-- Description: 
--   - Remove price and weight fields from "Detalles del Producto" section
--   - Add grams (weight) field to "Tallas Disponibles" section
--   - Make price and weight optional in products table (they're no longer used at product level)
-- Version: 026
-- Created: 2025-01-XX

-- ================================================
-- 1. Asegurar que weight existe en product_sizes
-- ================================================
-- La columna weight ya debería existir según migración 024, pero la agregamos si no existe
ALTER TABLE public.product_sizes
ADD COLUMN IF NOT EXISTS weight DECIMAL(10, 3);

-- Agregar comentario
COMMENT ON COLUMN public.product_sizes.weight IS 'Weight in grams of gold for this specific size. Used in pricing calculations for products sold by weight.';

-- Crear índice si no existe
CREATE INDEX IF NOT EXISTS idx_product_sizes_weight
ON public.product_sizes(weight)
WHERE weight IS NOT NULL;

-- ================================================
-- 2. Hacer price y weight opcionales en products
-- ================================================
-- Estos campos ya no se usan a nivel de producto, solo a nivel de talla
-- Los hacemos opcionales para mantener compatibilidad con datos existentes

-- Hacer price opcional (si tiene NOT NULL constraint)
DO $$
BEGIN
  -- Verificar si price tiene NOT NULL y removerlo
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'products' 
    AND column_name = 'price' 
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.products
    ALTER COLUMN price DROP NOT NULL;
  END IF;
END $$;

-- Hacer weight opcional (si tiene NOT NULL constraint)
DO $$
BEGIN
  -- Verificar si weight tiene NOT NULL y removerlo
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'products' 
    AND column_name = 'weight' 
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.products
    ALTER COLUMN weight DROP NOT NULL;
  END IF;
END $$;

-- Agregar comentarios explicativos
COMMENT ON COLUMN public.products.price IS 'DEPRECATED: Price is now managed at the size level (product_sizes table). This field is kept for backward compatibility but should not be used.';
COMMENT ON COLUMN public.products.weight IS 'DEPRECATED: Weight (grams) is now managed at the size level (product_sizes table). This field is kept for backward compatibility but should not be used.';

-- ================================================
-- 3. Asegurar que price es requerido en product_sizes
-- ================================================
-- El precio debe estar definido a nivel de talla
-- Si price tiene NOT NULL, lo mantenemos; si no, lo agregamos
DO $$
BEGIN
  -- Verificar si price tiene NOT NULL
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'product_sizes' 
    AND column_name = 'price' 
    AND is_nullable = 'NO'
  ) THEN
    -- Primero actualizar valores NULL a 0
    UPDATE public.product_sizes
    SET price = 0
    WHERE price IS NULL;
    
    -- Luego agregar NOT NULL constraint
    ALTER TABLE public.product_sizes
    ALTER COLUMN price SET NOT NULL;
  END IF;
END $$;

-- Agregar comentario
COMMENT ON COLUMN public.product_sizes.price IS 'Price in MXN for this specific size. Required field.';

