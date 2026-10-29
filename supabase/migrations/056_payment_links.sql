-- Migration: Enlaces de pago desde el panel de administración
-- Description:
--   - Los pedidos pueden originarse en la tienda web ('web') o en un enlace
--     de pago generado por el admin ('payment_link') y enviado por WhatsApp.
--   - Se guarda la sesión de Stripe Checkout, la URL del enlace, su
--     descripción y su fecha de vencimiento.
--   - order_items.product_id debe admitir NULL para cobros de monto libre
--     (sin producto asociado; product_name lleva la descripción).
-- Version: 056
-- Notes: Idempotente; se puede ejecutar varias veces sin efecto adicional.

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'web',
  ADD COLUMN IF NOT EXISTS stripe_checkout_session_id TEXT,
  ADD COLUMN IF NOT EXISTS payment_link_url TEXT,
  ADD COLUMN IF NOT EXISTS payment_link_description TEXT,
  ADD COLUMN IF NOT EXISTS payment_link_expires_at TIMESTAMP WITH TIME ZONE;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'orders_source_check'
  ) THEN
    ALTER TABLE public.orders
      ADD CONSTRAINT orders_source_check CHECK (source IN ('web', 'payment_link'));
  END IF;
END $$;

-- Cobros de monto libre no tienen producto asociado
ALTER TABLE public.order_items
  ALTER COLUMN product_id DROP NOT NULL;

CREATE INDEX IF NOT EXISTS idx_orders_source ON public.orders(source);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_checkout_session_id
  ON public.orders(stripe_checkout_session_id);

COMMENT ON COLUMN public.orders.source IS 'Origen del pedido: web (tienda) o payment_link (enlace de pago del admin)';
COMMENT ON COLUMN public.orders.stripe_checkout_session_id IS 'ID de la sesión de Stripe Checkout del enlace de pago';
COMMENT ON COLUMN public.orders.payment_link_url IS 'URL del enlace de pago (Stripe Checkout)';
COMMENT ON COLUMN public.orders.payment_link_description IS 'Descripción escrita por el admin al generar el enlace';
COMMENT ON COLUMN public.orders.payment_link_expires_at IS 'Fecha en que vence el enlace de pago';
