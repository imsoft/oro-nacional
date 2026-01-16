-- Migration: Improve USD price update function
-- Description:
--   - Improve update_all_usd_prices function to ensure it updates ALL products and sizes
--   - Always update based on the final MXN price (which includes all calculations)
--   - Update all active products and their sizes when exchange rate changes
-- Version: 052
-- Created: 2026-01-XX

-- ================================================
-- Mejorar función para actualizar todos los precios USD
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

  -- Actualizar price_usd en product_sizes PRIMERO (las tallas tienen el precio final)
  -- Si update_all = TRUE, actualiza TODAS las tallas que tengan precio MXN
  -- Si update_all = FALSE, solo actualiza las que tienen price_usd IS NULL
  IF update_all THEN
    -- Actualizar TODAS las tallas que tengan price (MXN) - este es el precio final calculado
    UPDATE public.product_sizes
    SET price_usd = ROUND(
      price / new_exchange_rate,
      2
    )
    WHERE price IS NOT NULL 
      AND price > 0;
    
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

  -- Actualizar base_price_usd en products
  -- Si update_all = TRUE, actualiza todos los productos que tengan base_price
  -- Si update_all = FALSE, solo actualiza los que tienen base_price_usd IS NULL
  IF update_all THEN
    -- Actualizar todos los productos que tengan base_price (MXN)
    -- Esto es para productos sin tallas o como precio base
    UPDATE public.products
    SET base_price_usd = ROUND(
      base_price / new_exchange_rate,
      2
    )
    WHERE base_price IS NOT NULL 
      AND base_price > 0;
    
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

  -- Retornar el número de registros actualizados
  RETURN QUERY SELECT v_products_updated, v_sizes_updated;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_all_usd_prices IS 'Updates all USD prices based on new exchange rate. When update_all is TRUE, updates ALL products and sizes based on their MXN prices (final calculated prices). When update_all is FALSE, only updates prices where USD price is NULL.';
