-- Migration: WhatsApp del cliente en pedidos
-- Description: Número de WhatsApp capturado en el checkout, para contactar al
--   cliente desde el panel y los correos del pedido.
-- Version: 055
-- Idempotente.

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS customer_whatsapp TEXT;

COMMENT ON COLUMN public.orders.customer_whatsapp IS 'WhatsApp del cliente (como lo escribió en el checkout)';
