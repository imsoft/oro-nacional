-- ================================================
-- Migration: Update gold quotation to 2550.00
-- ================================================
-- Description:
--   Actualiza la cotización del oro a $2,550.00 en pricing_parameters
--   El trigger sincronizará automáticamente con broquel_pricing_parameters
-- Version: 048
-- Created: 2025-01-29
-- ================================================

-- Actualizar la cotización del oro a $2,550.00
UPDATE public.pricing_parameters
SET gold_quotation = 2550.00
WHERE gold_quotation != 2550.00;

-- Verificar el resultado
DO $$
DECLARE
  pricing_quotation DECIMAL;
  broquel_quotation DECIMAL;
BEGIN
  SELECT gold_quotation INTO pricing_quotation FROM public.pricing_parameters LIMIT 1;
  SELECT quotation INTO broquel_quotation FROM public.broquel_pricing_parameters LIMIT 1;

  RAISE NOTICE '================================================';
  RAISE NOTICE '📋 COTIZACIONES ACTUALIZADAS:';
  RAISE NOTICE '   pricing_parameters.gold_quotation: $%', pricing_quotation;
  RAISE NOTICE '   broquel_pricing_parameters.quotation: $%', broquel_quotation;

  IF pricing_quotation = broquel_quotation THEN
    RAISE NOTICE '✅ ✅ ✅ COTIZACIONES SINCRONIZADAS: $%', pricing_quotation;
  ELSE
    RAISE WARNING '❌ ERROR: Las cotizaciones no coinciden';
  END IF;
  RAISE NOTICE '================================================';
END $$;
