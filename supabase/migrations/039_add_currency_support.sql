-- Migration: Add multi-currency support (MXN and USD)
-- Description: 
--   - Add USD price fields to products and product_sizes tables
--   - Add exchange rate configuration to store_settings
--   - Support both fixed USD prices and automatic conversion from MXN
-- Version: 039
-- Created: 2025-01-XX

-- ================================================
-- 1. Agregar base_price_usd a products
-- ================================================
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS base_price_usd NUMERIC(10, 2);

-- Agregar comentario
COMMENT ON COLUMN public.products.base_price_usd IS 'Base price in USD. If NULL, will be calculated from base_price using exchange rate.';

-- ================================================
-- 2. Agregar price_usd a product_sizes
-- ================================================
ALTER TABLE public.product_sizes
ADD COLUMN IF NOT EXISTS price_usd NUMERIC(10, 2);

-- Agregar comentario
COMMENT ON COLUMN public.product_sizes.price_usd IS 'Price in USD for this specific size. If NULL, will be calculated from price (MXN) using exchange rate.';

-- ================================================
-- 3. Agregar exchange_rate a store_settings
-- ================================================
ALTER TABLE public.store_settings
ADD COLUMN IF NOT EXISTS exchange_rate NUMERIC(10, 4) DEFAULT 0.0588;

-- Agregar comentario
COMMENT ON COLUMN public.store_settings.exchange_rate IS 'USD to MXN exchange rate (e.g., 0.0588 means 1 USD = 17 MXN). Used to convert prices when USD price is not set.';

-- ================================================
-- 4. Crear índices para mejor rendimiento
-- ================================================
CREATE INDEX IF NOT EXISTS idx_products_base_price_usd 
ON public.products(base_price_usd)
WHERE base_price_usd IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_product_sizes_price_usd 
ON public.product_sizes(price_usd)
WHERE price_usd IS NOT NULL;

-- ================================================
-- 5. Función helper para obtener precio en moneda específica
-- ================================================
CREATE OR REPLACE FUNCTION get_price_in_currency(
  price_mxn NUMERIC,
  price_usd NUMERIC,
  exchange_rate NUMERIC,
  target_currency TEXT
)
RETURNS NUMERIC AS $$
BEGIN
  IF target_currency = 'USD' THEN
    -- Si hay precio USD fijo, usarlo; si no, convertir desde MXN
    RETURN COALESCE(price_usd, price_mxn * exchange_rate);
  ELSE
    -- Si hay precio MXN, usarlo; si no, convertir desde USD
    RETURN COALESCE(price_mxn, price_usd / NULLIF(exchange_rate, 0));
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION get_price_in_currency IS 'Returns price in target currency. Uses fixed price if available, otherwise converts using exchange rate.';

