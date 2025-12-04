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
  -- Solo actualizar si base_price ha cambiado y no es NULL
  IF NEW.base_price IS NOT NULL 
     AND (OLD.base_price IS DISTINCT FROM NEW.base_price) THEN
    
    -- Actualizar precios de todas las tallas con el precio final directamente (sin cálculo proporcional)
    UPDATE public.product_sizes
    SET price = ROUND(NEW.base_price::numeric, 2)
    WHERE product_id = NEW.id;
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- 2. Crear trigger que se ejecuta después de actualizar un producto
-- ================================================
DROP TRIGGER IF EXISTS trigger_update_size_prices_on_base_price_change ON public.products;

CREATE TRIGGER trigger_update_size_prices_on_base_price_change
  AFTER UPDATE OF base_price ON public.products
  FOR EACH ROW
  WHEN (
    OLD.base_price IS DISTINCT FROM NEW.base_price
    AND NEW.base_price IS NOT NULL
  )
  EXECUTE FUNCTION update_size_prices_on_base_price_change();

-- ================================================
-- 3. Agregar comentarios
-- ================================================
COMMENT ON FUNCTION update_size_prices_on_base_price_change() IS 
'Automatically updates product_sizes prices with the final price directly when base_price changes in products table. The final price is applied to all sizes without proportional calculation.';

COMMENT ON TRIGGER trigger_update_size_prices_on_base_price_change ON public.products IS 
'Trigger that automatically updates size prices when base_price or base_grams are updated';

