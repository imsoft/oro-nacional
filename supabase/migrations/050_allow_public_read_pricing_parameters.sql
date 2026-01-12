-- ================================================
-- Migration: Allow public read access to pricing_parameters
-- ================================================
-- Description:
--   Permite acceso público de solo lectura a pricing_parameters
--   para que el API route pueda obtener la cotización del oro
--   que se muestra en la cintilla del sitio web
-- Version: 050
-- Created: 2026-01-12
-- ================================================

-- Agregar política para permitir lectura pública de pricing_parameters
-- Esto es necesario para que el API route /api/settings/gold-quotation
-- pueda obtener la cotización del oro sin autenticación
CREATE POLICY "Public can view pricing parameters"
  ON pricing_parameters FOR SELECT
  TO anon, authenticated
  USING (true);

-- ================================================
-- NOTAS:
-- ================================================
-- 1. Esta política permite acceso de solo lectura (SELECT) a todos los usuarios
-- 2. Los usuarios anónimos (anon) y autenticados (authenticated) pueden leer
-- 3. Solo los admins pueden modificar (UPDATE/INSERT) según políticas existentes
-- 4. Esto permite que la cintilla del sitio web muestre la cotización actual
-- ================================================
