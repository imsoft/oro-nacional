-- Migration: Fix order totals to match subtotals
-- Description: 
--   - Update all existing orders so that total = subtotal
--   - This fixes orders created before the fix where total included extra charges
--   - The subtotal already includes everything (IVA, Stripe, shipping, etc.)
-- Version: 041
-- Created: 2025-01-XX

-- ================================================
-- 1. Actualizar todas las órdenes existentes
-- ================================================
UPDATE public.orders
SET 
  total = subtotal,
  updated_at = NOW()
WHERE 
  total != subtotal
  AND deleted_at IS NULL;

-- ================================================
-- 2. Comentario
-- ================================================
COMMENT ON COLUMN public.orders.total IS 'Total amount. Should be equal to subtotal since subtotal already includes IVA, Stripe fees, shipping, etc.';

