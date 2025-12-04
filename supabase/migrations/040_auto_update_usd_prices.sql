-- Migration: Auto-update USD prices when exchange rate changes
-- Description:
--   - Create function to update all USD prices when exchange_rate changes
--   - Updates base_price_usd in products and price_usd in product_sizes
--   - Only updates prices where USD price is NULL (auto-calculated) or updates all if specified
-- Version: 040
-- Created: 2025-01-XX

-- ================================================
-- 1. Función para actualizar todos los precios USD
-- ================================================
CREATE OR REPLACE FUNCTION update_all_usd_prices(
  new_exchange_rate NUMERIC,
  update_all BOOLEAN DEFAULT FALSE
)
RETURNS TABLE(
  products_updated INTEGER,
  sizes_updated INTEGER
) AS $$
DECLARE
  v_products_updated INTEGER := 0;
  v_sizes_updated INTEGER := 0;
BEGIN
  -- Validar que el exchange_rate sea válido
  IF new_exchange_rate IS NULL OR new_exchange_rate <= 0 THEN
    RAISE EXCEPTION 'Exchange rate must be greater than 0';
  END IF;

  -- Actualizar base_price_usd en products
  -- Si update_all = TRUE, actualiza todos los productos
  -- Si update_all = FALSE, solo actualiza los que tienen base_price_usd IS NULL
  IF update_all THEN
    -- Actualizar todos los productos que tengan base_price (MXN)
    UPDATE public.products
    SET base_price_usd = ROUND(
      CASE 
        WHEN base_price IS NOT NULL AND base_price > 0 THEN
          base_price / new_exchange_rate
        ELSE
          base_price_usd -- Mantener el valor actual si no hay base_price
      END,
      2
    )
    WHERE base_price IS NOT NULL AND base_price > 0;
    
    GET DIAGNOSTICS v_products_updated = ROW_COUNT;
  ELSE
    -- Solo actualizar productos donde base_price_usd IS NULL
    UPDATE public.products
    SET base_price_usd = ROUND(
      base_price / new_exchange_rate,
      2
    )
    WHERE base_price IS NOT NULL 
      AND base_price > 0
      AND base_price_usd IS NULL;
    
    GET DIAGNOSTICS v_products_updated = ROW_COUNT;
  END IF;

  -- Actualizar price_usd en product_sizes
  -- Si update_all = TRUE, actualiza todas las tallas
  -- Si update_all = FALSE, solo actualiza las que tienen price_usd IS NULL
  IF update_all THEN
    -- Actualizar todas las tallas que tengan price (MXN)
    UPDATE public.product_sizes
    SET price_usd = ROUND(
      CASE 
        WHEN price IS NOT NULL AND price > 0 THEN
          price / new_exchange_rate
        ELSE
          price_usd -- Mantener el valor actual si no hay price
      END,
      2
    )
    WHERE price IS NOT NULL AND price > 0;
    
    GET DIAGNOSTICS v_sizes_updated = ROW_COUNT;
  ELSE
    -- Solo actualizar tallas donde price_usd IS NULL
    UPDATE public.product_sizes
    SET price_usd = ROUND(
      price / new_exchange_rate,
      2
    )
    WHERE price IS NOT NULL 
      AND price > 0
      AND price_usd IS NULL;
    
    GET DIAGNOSTICS v_sizes_updated = ROW_COUNT;
  END IF;

  -- Retornar el número de registros actualizados
  RETURN QUERY SELECT v_products_updated, v_sizes_updated;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_all_usd_prices IS 'Updates all USD prices based on new exchange rate. If update_all is FALSE, only updates prices where USD price is NULL. If update_all is TRUE, updates all prices.';

-- ================================================
-- 2. Trigger para actualizar automáticamente cuando cambie exchange_rate
-- ================================================
-- Nota: En lugar de un trigger automático, llamaremos la función desde el frontend
-- para tener más control y poder mostrar mensajes al usuario

