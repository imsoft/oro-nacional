-- Migration: Auto-update size prices when base_price or base_grams change
-- Description: 
--   - Create a trigger function that automatically updates product_sizes prices
--   - when base_price or base_grams change in the products table
--   - Prices are calculated proportionally: base_price * (size_weight / base_grams)
-- Version: 037
-- Created: 2025-01-XX

-- ================================================
-- 1. Crear función para actualizar precios de tallas automáticamente
-- ================================================
CREATE OR REPLACE FUNCTION update_size_prices_on_base_price_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo actualizar si base_price y base_grams están definidos y son válidos
  IF NEW.base_price IS NOT NULL 
     AND NEW.base_grams IS NOT NULL 
     AND NEW.base_grams > 0 
     AND (OLD.base_price IS DISTINCT FROM NEW.base_price OR OLD.base_grams IS DISTINCT FROM NEW.base_grams) THEN
    
    -- Actualizar precios de todas las tallas proporcionalmente
    UPDATE public.product_sizes
    SET price = ROUND((NEW.base_price * (weight / NEW.base_grams))::numeric, 2)
    WHERE product_id = NEW.id
      AND weight IS NOT NULL
      AND weight > 0;
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- 2. Crear trigger que se ejecuta después de actualizar un producto
-- ================================================
DROP TRIGGER IF EXISTS trigger_update_size_prices_on_base_price_change ON public.products;

CREATE TRIGGER trigger_update_size_prices_on_base_price_change
  AFTER UPDATE OF base_price, base_grams ON public.products
  FOR EACH ROW
  WHEN (
    (OLD.base_price IS DISTINCT FROM NEW.base_price OR OLD.base_grams IS DISTINCT FROM NEW.base_grams)
    AND NEW.base_price IS NOT NULL
    AND NEW.base_grams IS NOT NULL
    AND NEW.base_grams > 0
  )
  EXECUTE FUNCTION update_size_prices_on_base_price_change();

-- ================================================
-- 3. Agregar comentarios
-- ================================================
COMMENT ON FUNCTION update_size_prices_on_base_price_change() IS 
'Automatically updates product_sizes prices proportionally when base_price or base_grams change in products table. Formula: base_price * (size_weight / base_grams)';

COMMENT ON TRIGGER trigger_update_size_prices_on_base_price_change ON public.products IS 
'Trigger that automatically updates size prices when base_price or base_grams are updated';

