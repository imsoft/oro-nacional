-- =============================================
-- Agregar campos de Stripe a la tabla orders
-- =============================================

-- Agregar columna para el Payment Intent ID de Stripe
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;

-- Agregar índice para búsquedas por Payment Intent ID
CREATE INDEX IF NOT EXISTS idx_orders_stripe_payment_intent_id 
ON orders(stripe_payment_intent_id) 
WHERE stripe_payment_intent_id IS NOT NULL;

-- Comentario para documentación
COMMENT ON COLUMN orders.stripe_payment_intent_id IS 'ID del Payment Intent de Stripe asociado a este pedido';

