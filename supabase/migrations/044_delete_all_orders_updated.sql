-- ================================================
-- Migration: Delete all orders (cleanup script)
-- ================================================
-- Description:
--   Elimina todas las órdenes de prueba de la base de datos
--   Los order_items se eliminan automáticamente por CASCADE
--   Actualizado para reflejar que solo aceptamos pagos con tarjeta
-- Version: 044
-- Created: 2025-01-29
-- ================================================

-- ⚠️  ADVERTENCIA: ESTO ELIMINARÁ TODAS LAS ÓRDENES ⚠️
-- Este script debe ejecutarse SOLO en ambientes de desarrollo/prueba
-- NO ejecutar en producción sin respaldo

-- ================================================
-- Paso 1: Contar registros antes de eliminar
-- ================================================
DO $$
DECLARE
  order_count INTEGER;
  item_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO order_count FROM public.orders WHERE deleted_at IS NULL;
  SELECT COUNT(*) INTO item_count FROM public.order_items;

  RAISE NOTICE '================================================';
  RAISE NOTICE 'ÓRDENES ACTIVAS A ELIMINAR: %', order_count;
  RAISE NOTICE 'ITEMS DE ÓRDENES A ELIMINAR: %', item_count;
  RAISE NOTICE '================================================';
END $$;

-- ================================================
-- Paso 2: Eliminar todas las órdenes
-- ================================================
-- Los order_items se eliminan automáticamente por la restricción CASCADE
DELETE FROM public.orders;

-- ================================================
-- Paso 3: Resetear secuencias (si aplica)
-- ================================================
-- Si tienes secuencias para order_number, descoméntalas aquí
-- ALTER SEQUENCE IF EXISTS order_number_seq RESTART WITH 1;

-- ================================================
-- Paso 4: Verificar eliminación
-- ================================================
DO $$
DECLARE
  remaining_orders INTEGER;
  remaining_items INTEGER;
BEGIN
  SELECT COUNT(*) INTO remaining_orders FROM public.orders;
  SELECT COUNT(*) INTO remaining_items FROM public.order_items;

  RAISE NOTICE '================================================';
  IF remaining_orders = 0 AND remaining_items = 0 THEN
    RAISE NOTICE '✓ ÉXITO: Todas las órdenes y items fueron eliminados';
    RAISE NOTICE '  - Órdenes restantes: %', remaining_orders;
    RAISE NOTICE '  - Items restantes: %', remaining_items;
  ELSE
    RAISE WARNING '✗ ADVERTENCIA: Algunos registros aún existen';
    RAISE WARNING '  - Órdenes restantes: %', remaining_orders;
    RAISE WARNING '  - Items restantes: %', remaining_items;
  END IF;
  RAISE NOTICE '================================================';
END $$;

-- ================================================
-- Paso 5: Actualizar constraint de payment_method
-- ================================================
-- Actualizar la restricción para reflejar que solo aceptamos tarjeta
ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_payment_method_check;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_payment_method_check
  CHECK (payment_method IN ('Tarjeta'));

RAISE NOTICE '✓ Constraint de payment_method actualizado a solo "Tarjeta"';

-- ================================================
-- NOTAS IMPORTANTES:
-- ================================================
-- 1. Este script es IRREVERSIBLE - asegúrate de tener un respaldo
-- 2. Los order_items se eliminan automáticamente por CASCADE
-- 3. Las órdenes con soft delete (deleted_at) también se eliminan
-- 4. Constraint actualizado: solo se acepta payment_method = 'Tarjeta'
-- ================================================
