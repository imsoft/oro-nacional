-- ================================================
-- Migration: Sync gold quotation between tables
-- ================================================
-- Description:
--   Crea triggers para sincronizar automáticamente la cotización del oro
--   entre pricing_parameters y broquel_pricing_parameters
-- Version: 046
-- Created: 2025-01-29
-- ================================================

-- ================================================
-- Paso 1: Sincronizar valores actuales
-- ================================================
-- Primero, asegurarse de que ambas tablas tengan el mismo valor
-- Usamos el valor de pricing_parameters como fuente de verdad

DO $$
DECLARE
  current_gold_quotation DECIMAL;
BEGIN
  -- Obtener la cotización actual de pricing_parameters
  SELECT gold_quotation INTO current_gold_quotation
  FROM public.pricing_parameters
  LIMIT 1;

  IF current_gold_quotation IS NOT NULL THEN
    -- Actualizar broquel_pricing_parameters con el mismo valor
    UPDATE public.broquel_pricing_parameters
    SET quotation = current_gold_quotation;

    RAISE NOTICE 'Sincronizada cotización del oro: $%', current_gold_quotation;
  ELSE
    RAISE WARNING 'No se encontró cotización en pricing_parameters';
  END IF;
END $$;

-- ================================================
-- Paso 2: Crear función para sincronizar de pricing_parameters a broquel
-- ================================================
CREATE OR REPLACE FUNCTION sync_quotation_to_broquel()
RETURNS TRIGGER AS $$
BEGIN
  -- Cuando se actualiza pricing_parameters.gold_quotation,
  -- actualizar broquel_pricing_parameters.quotation
  UPDATE public.broquel_pricing_parameters
  SET quotation = NEW.gold_quotation;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- Paso 3: Crear función para sincronizar de broquel a pricing_parameters
-- ================================================
CREATE OR REPLACE FUNCTION sync_quotation_from_broquel()
RETURNS TRIGGER AS $$
BEGIN
  -- Cuando se actualiza broquel_pricing_parameters.quotation,
  -- actualizar pricing_parameters.gold_quotation
  UPDATE public.pricing_parameters
  SET gold_quotation = NEW.quotation;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- Paso 4: Crear triggers
-- ================================================

-- Trigger: Cuando se actualiza pricing_parameters
DROP TRIGGER IF EXISTS sync_gold_quotation_to_broquel ON public.pricing_parameters;
CREATE TRIGGER sync_gold_quotation_to_broquel
  AFTER UPDATE OF gold_quotation ON public.pricing_parameters
  FOR EACH ROW
  WHEN (OLD.gold_quotation IS DISTINCT FROM NEW.gold_quotation)
  EXECUTE FUNCTION sync_quotation_to_broquel();

-- Trigger: Cuando se actualiza broquel_pricing_parameters
DROP TRIGGER IF EXISTS sync_quotation_from_broquel_trigger ON public.broquel_pricing_parameters;
CREATE TRIGGER sync_quotation_from_broquel_trigger
  AFTER UPDATE OF quotation ON public.broquel_pricing_parameters
  FOR EACH ROW
  WHEN (OLD.quotation IS DISTINCT FROM NEW.quotation)
  EXECUTE FUNCTION sync_quotation_from_broquel();

-- ================================================
-- Paso 5: Verificar sincronización
-- ================================================
DO $$
DECLARE
  pricing_quotation DECIMAL;
  broquel_quotation DECIMAL;
BEGIN
  SELECT gold_quotation INTO pricing_quotation FROM public.pricing_parameters LIMIT 1;
  SELECT quotation INTO broquel_quotation FROM public.broquel_pricing_parameters LIMIT 1;

  IF pricing_quotation = broquel_quotation THEN
    RAISE NOTICE '✓ Cotizaciones sincronizadas correctamente: $%', pricing_quotation;
  ELSE
    RAISE WARNING '✗ Las cotizaciones NO están sincronizadas:';
    RAISE WARNING '  - pricing_parameters.gold_quotation: $%', pricing_quotation;
    RAISE WARNING '  - broquel_pricing_parameters.quotation: $%', broquel_quotation;
  END IF;
END $$;

-- ================================================
-- NOTAS:
-- ================================================
-- 1. Ahora la cotización se sincroniza automáticamente vía triggers
-- 2. Ya no es necesario sincronizar manualmente desde el código
-- 3. Cualquier actualización en cualquiera de las dos tablas se reflejará automáticamente en la otra
-- 4. Los triggers solo se ejecutan cuando el valor realmente cambia (WHEN clause)
-- ================================================
