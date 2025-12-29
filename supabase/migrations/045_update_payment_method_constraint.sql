-- ================================================
-- Migration: Update payment_method constraint
-- ================================================
-- Description:
--   Actualiza la restricción de payment_method para solo aceptar 'Tarjeta'
--   Elimina las opciones de 'Transferencia' y 'Efectivo'
-- Version: 045
-- Created: 2025-01-29
-- ================================================

-- Paso 1: Eliminar el constraint existente
ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_payment_method_check;

-- Paso 2: Agregar el nuevo constraint que solo acepta 'Tarjeta'
ALTER TABLE public.orders
  ADD CONSTRAINT orders_payment_method_check
  CHECK (payment_method IN ('Tarjeta'));

-- Paso 3: Verificar que no existan órdenes con otros métodos de pago
DO $$
DECLARE
  invalid_orders INTEGER;
BEGIN
  SELECT COUNT(*) INTO invalid_orders
  FROM public.orders
  WHERE payment_method NOT IN ('Tarjeta');

  IF invalid_orders > 0 THEN
    RAISE WARNING 'ADVERTENCIA: Existen % órdenes con métodos de pago diferentes a Tarjeta', invalid_orders;
    RAISE NOTICE 'Considera ejecutar la migración 044_delete_all_orders_updated.sql primero';
  ELSE
    RAISE NOTICE '✓ ÉXITO: Constraint actualizado. Solo se acepta payment_method = "Tarjeta"';
  END IF;
END $$;

-- ================================================
-- NOTAS:
-- ================================================
-- Si existen órdenes con payment_method = 'Transferencia' o 'Efectivo',
-- primero debes eliminarlas o actualizarlas antes de aplicar esta migración.
-- Puedes usar: UPDATE public.orders SET payment_method = 'Tarjeta' WHERE payment_method != 'Tarjeta';
-- O ejecutar la migración 044 para eliminar todas las órdenes.
-- ================================================
