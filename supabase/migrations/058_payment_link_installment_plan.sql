-- Migration: Plazo fijo en enlaces de pago a meses con intereses
-- Description: El admin elige el plazo (3, 6 o 12 meses) al crear el enlace;
--   el cobro se confirma solo con ese plazo. Se guarda también el precio base
--   antes del costo de financiamiento.
-- Version: 058
-- Idempotente.

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS installments_plan INTEGER,
  ADD COLUMN IF NOT EXISTS base_amount NUMERIC(10, 2);

COMMENT ON COLUMN public.orders.installments_plan IS 'Plazo de meses con intereses elegido por el admin para el enlace (null = de contado)';
COMMENT ON COLUMN public.orders.base_amount IS 'Precio base del enlace antes del costo de financiamiento';
