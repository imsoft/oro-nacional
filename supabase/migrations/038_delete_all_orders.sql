-- Migration: Delete all orders (test data cleanup)
-- Description: 
--   - Delete all orders from the orders table
--   - Order items will be automatically deleted due to CASCADE constraint
--   - This is a cleanup script for test orders
-- Version: 038
-- Created: 2025-01-XX

-- ================================================
-- WARNING: This will delete ALL orders and their items
-- ================================================

-- Count orders before deletion (for verification)
DO $$
DECLARE
  order_count INTEGER;
  item_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO order_count FROM public.orders;
  SELECT COUNT(*) INTO item_count FROM public.order_items;
  
  RAISE NOTICE 'Orders to be deleted: %', order_count;
  RAISE NOTICE 'Order items to be deleted: %', item_count;
END $$;

-- Delete all orders
-- Order items will be automatically deleted due to CASCADE constraint
DELETE FROM public.orders;

-- Verify deletion
DO $$
DECLARE
  remaining_orders INTEGER;
  remaining_items INTEGER;
BEGIN
  SELECT COUNT(*) INTO remaining_orders FROM public.orders;
  SELECT COUNT(*) INTO remaining_items FROM public.order_items;
  
  IF remaining_orders = 0 AND remaining_items = 0 THEN
    RAISE NOTICE 'Successfully deleted all orders and order items';
  ELSE
    RAISE WARNING 'Some orders or items may still exist. Orders: %, Items: %', remaining_orders, remaining_items;
  END IF;
END $$;

