-- ================================================
-- Migration: Fix trigger UPDATE WHERE clause
-- ================================================
-- Description:
--   Corrige las funciones de triggers para que usen WHERE clause
--   en los UPDATE statements, requerido por Supabase RLS
-- Version: 049
-- Created: 2025-01-XX
-- ================================================

-- ================================================
-- Paso 1: Corregir función sync_quotation_to_broquel
-- ================================================
-- Actualizar solo el primer registro (debería haber solo uno)
CREATE OR REPLACE FUNCTION sync_quotation_to_broquel()
RETURNS TRIGGER AS $$
BEGIN
  -- Actualizar solo el primer registro usando subconsulta
  UPDATE public.broquel_pricing_parameters
  SET quotation = NEW.gold_quotation
  WHERE id = (
    SELECT id FROM public.broquel_pricing_parameters 
    ORDER BY created_at ASC 
    LIMIT 1
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- Paso 2: Corregir función sync_quotation_from_broquel
-- ================================================
-- Actualizar solo el primer registro (debería haber solo uno)
CREATE OR REPLACE FUNCTION sync_quotation_from_broquel()
RETURNS TRIGGER AS $$
BEGIN
  -- Actualizar solo el primer registro usando subconsulta
  UPDATE public.pricing_parameters
  SET gold_quotation = NEW.quotation
  WHERE id = (
    SELECT id FROM public.pricing_parameters 
    ORDER BY created_at ASC 
    LIMIT 1
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- NOTAS:
-- ================================================
-- 1. Los triggers ahora usan WHERE clause con subconsulta
-- 2. Esto satisface el requisito de Supabase RLS
-- 3. Solo actualiza el primer registro (debería haber solo uno)
-- 4. Si hay múltiples registros, se actualiza el más antiguo
-- ================================================
