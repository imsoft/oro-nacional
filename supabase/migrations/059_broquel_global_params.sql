-- Migration 059: Calculadora de broqueles con parámetros generales
--
-- El cliente maneja los costos por modelo (oro, merma, mano de obra, piedra) y
-- un solo juego de parámetros para todos los modelos, como en su Excel:
--   - La comisión de venta y las piezas (PZ) pasan a ser parámetros generales.
--   - El envío ya no forma parte del precio: se cobra aparte al cliente.
--   - Los gramos de oro admiten 4 decimales (el Excel trae valores como 0.1267).

-- 1. Parámetros generales nuevos
ALTER TABLE public.broquel_pricing_parameters
  ADD COLUMN IF NOT EXISTS sales_commission DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS pz DECIMAL(10, 2) NOT NULL DEFAULT 1.00;

COMMENT ON COLUMN public.broquel_pricing_parameters.sales_commission IS 'Comisión de venta por pieza (MXN), igual para todos los modelos';
COMMENT ON COLUMN public.broquel_pricing_parameters.pz IS 'Piezas base con las que se muestra el precio de cada modelo en la calculadora';

-- 2. Gramos de oro con 4 decimales
ALTER TABLE public.subcategory_broquel_pricing
  ALTER COLUMN gold_grams TYPE DECIMAL(10, 4);

-- 3. Columnas por modelo que ya no se usan en la fórmula
COMMENT ON COLUMN public.subcategory_broquel_pricing.sales_commission IS 'Sin uso desde 059: la comisión de venta es un parámetro general';
COMMENT ON COLUMN public.subcategory_broquel_pricing.shipping IS 'Sin uso desde 059: el envío se cobra aparte y no entra en el precio';
COMMENT ON COLUMN public.subcategory_broquel_pricing.pz IS 'Sin uso desde 059: las piezas base son un parámetro general';
