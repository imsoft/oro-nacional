-- Migration: Meses sin intereses en enlaces de pago
-- Description: El admin decide por enlace si Stripe ofrece MSI; al pagarse se
--   guarda el plan que eligió el cliente.
-- Version: 057
-- Idempotente.

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS installments_enabled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS installments_months INTEGER;

COMMENT ON COLUMN public.orders.installments_enabled IS 'Enlace de pago con meses sin intereses habilitados en Stripe';
COMMENT ON COLUMN public.orders.installments_months IS 'Plan de MSI elegido por el cliente al pagar (null = pago de contado)';
