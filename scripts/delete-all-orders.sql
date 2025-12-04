-- Script to delete all orders (for testing/cleanup)
-- WARNING: This will permanently delete ALL orders and their items
-- 
-- Usage:
--   1. Connect to your Supabase database
--   2. Run this script
--   3. All orders and order_items will be deleted

-- Show count before deletion
SELECT 
  (SELECT COUNT(*) FROM public.orders) as total_orders,
  (SELECT COUNT(*) FROM public.order_items) as total_order_items;

-- Delete all orders
-- Note: order_items will be automatically deleted due to CASCADE constraint
DELETE FROM public.orders;

-- Verify deletion
SELECT 
  (SELECT COUNT(*) FROM public.orders) as remaining_orders,
  (SELECT COUNT(*) FROM public.order_items) as remaining_order_items;

-- If you want to see what was deleted, you can check the counts above
-- All orders and their items should now be deleted

