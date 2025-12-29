-- ================================================
-- Migration: Fix and sync gold quotation
-- ================================================
-- Description:
--   Verifica y corrige la sincronización de cotización del oro
--   Asegura que ambas tablas tengan datos y estén sincronizadas
-- Version: 047
-- Created: 2025-01-29
-- ================================================

-- ================================================
-- Paso 1: Verificar estado actual de las tablas
-- ================================================
DO $$
DECLARE
  pricing_count INTEGER;
  broquel_count INTEGER;
  pricing_quotation DECIMAL;
  broquel_quotation DECIMAL;
BEGIN
  -- Contar registros en pricing_parameters
  SELECT COUNT(*) INTO pricing_count FROM public.pricing_parameters;
  RAISE NOTICE '📊 Registros en pricing_parameters: %', pricing_count;

  -- Contar registros en broquel_pricing_parameters
  SELECT COUNT(*) INTO broquel_count FROM public.broquel_pricing_parameters;
  RAISE NOTICE '📊 Registros en broquel_pricing_parameters: %', broquel_count;

  -- Obtener valores actuales si existen
  IF pricing_count > 0 THEN
    SELECT gold_quotation INTO pricing_quotation FROM public.pricing_parameters LIMIT 1;
    RAISE NOTICE '💰 Cotización en pricing_parameters: $%', pricing_quotation;
  END IF;

  IF broquel_count > 0 THEN
    SELECT quotation INTO broquel_quotation FROM public.broquel_pricing_parameters LIMIT 1;
    RAISE NOTICE '💰 Cotización en broquel_pricing_parameters: $%', broquel_quotation;
  END IF;
END $$;

-- ================================================
-- Paso 2: Insertar valores por defecto si no existen
-- ================================================

-- Insertar en pricing_parameters si no existe
INSERT INTO public.pricing_parameters (
  gold_quotation,
  profit_margin,
  vat,
  stripe_percentage,
  stripe_fixed_fee
)
SELECT
  2550.00,  -- Cotización actual
  0.30,     -- 30% utilidad
  0.16,     -- 16% IVA
  0.036,    -- 3.6% Stripe
  3.00      -- $3 MXN Stripe fijo
WHERE NOT EXISTS (SELECT 1 FROM public.pricing_parameters);

-- Insertar en broquel_pricing_parameters si no existe
INSERT INTO public.broquel_pricing_parameters (
  quotation,
  profit_margin,
  vat,
  stripe_percentage,
  stripe_fixed_fee
)
SELECT
  2550.00,  -- Cotización actual
  0.08,     -- 8% utilidad
  0.16,     -- 16% IVA
  0.036,    -- 3.6% Stripe
  3.00      -- $3 MXN Stripe fijo
WHERE NOT EXISTS (SELECT 1 FROM public.broquel_pricing_parameters);

-- ================================================
-- Paso 3: Sincronizar valores actuales
-- ================================================
-- Usar pricing_parameters como fuente de verdad
DO $$
DECLARE
  current_gold_quotation DECIMAL;
BEGIN
  -- Obtener la cotización de pricing_parameters
  SELECT gold_quotation INTO current_gold_quotation
  FROM public.pricing_parameters
  LIMIT 1;

  -- Actualizar broquel_pricing_parameters
  UPDATE public.broquel_pricing_parameters
  SET quotation = current_gold_quotation;

  RAISE NOTICE '✅ Sincronizada cotización del oro: $%', current_gold_quotation;
END $$;

-- ================================================
-- Paso 4: Crear o reemplazar triggers
-- ================================================

-- Función para sincronizar de pricing_parameters a broquel
CREATE OR REPLACE FUNCTION sync_quotation_to_broquel()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.broquel_pricing_parameters
  SET quotation = NEW.gold_quotation;

  RAISE NOTICE '🔄 Trigger: Sincronizando cotización a broquel: $%', NEW.gold_quotation;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para sincronizar de broquel a pricing_parameters
CREATE OR REPLACE FUNCTION sync_quotation_from_broquel()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.pricing_parameters
  SET gold_quotation = NEW.quotation;

  RAISE NOTICE '🔄 Trigger: Sincronizando cotización desde broquel: $%', NEW.quotation;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Eliminar triggers existentes si existen
DROP TRIGGER IF EXISTS sync_gold_quotation_to_broquel ON public.pricing_parameters;
DROP TRIGGER IF EXISTS sync_quotation_from_broquel_trigger ON public.broquel_pricing_parameters;

-- Crear triggers
CREATE TRIGGER sync_gold_quotation_to_broquel
  AFTER UPDATE OF gold_quotation ON public.pricing_parameters
  FOR EACH ROW
  WHEN (OLD.gold_quotation IS DISTINCT FROM NEW.gold_quotation)
  EXECUTE FUNCTION sync_quotation_to_broquel();

CREATE TRIGGER sync_quotation_from_broquel_trigger
  AFTER UPDATE OF quotation ON public.broquel_pricing_parameters
  FOR EACH ROW
  WHEN (OLD.quotation IS DISTINCT FROM NEW.quotation)
  EXECUTE FUNCTION sync_quotation_from_broquel();

-- ================================================
-- Paso 5: Verificar resultado final
-- ================================================
DO $$
DECLARE
  pricing_quotation DECIMAL;
  broquel_quotation DECIMAL;
BEGIN
  SELECT gold_quotation INTO pricing_quotation FROM public.pricing_parameters LIMIT 1;
  SELECT quotation INTO broquel_quotation FROM public.broquel_pricing_parameters LIMIT 1;

  RAISE NOTICE '================================================';
  RAISE NOTICE '📋 ESTADO FINAL:';
  RAISE NOTICE '   pricing_parameters.gold_quotation: $%', pricing_quotation;
  RAISE NOTICE '   broquel_pricing_parameters.quotation: $%', broquel_quotation;

  IF pricing_quotation = broquel_quotation THEN
    RAISE NOTICE '✅ ✅ ✅ COTIZACIONES SINCRONIZADAS CORRECTAMENTE';
  ELSE
    RAISE WARNING '❌ LAS COTIZACIONES NO COINCIDEN';
  END IF;
  RAISE NOTICE '================================================';
END $$;
