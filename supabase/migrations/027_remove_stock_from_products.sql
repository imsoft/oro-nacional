-- Migration: Remove stock field from products table
-- Description: 
--   - Make stock field optional in products table (deprecated)
--   - Stock is now managed at the size level (product_sizes table)
-- Version: 027
-- Created: 2025-01-XX

-- ================================================
-- 1. Hacer stock opcional en products
-- ================================================
-- El stock ya no se usa a nivel de producto, solo a nivel de talla
-- Lo hacemos opcional para mantener compatibilidad con datos existentes

-- Hacer stock opcional (si tiene NOT NULL constraint)
DO $$
BEGIN
  -- Verificar si stock tiene NOT NULL y removerlo
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'products' 
    AND column_name = 'stock' 
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.products
    ALTER COLUMN stock DROP NOT NULL;
  END IF;
END $$;

-- Establecer stock en 0 para productos existentes que tengan NULL
UPDATE public.products
SET stock = 0
WHERE stock IS NULL;

-- Agregar comentario explicativo
COMMENT ON COLUMN public.products.stock IS 'DEPRECATED: Stock is now managed at the size level (product_sizes table). This field is kept for backward compatibility but should not be used. Always set to 0.';

