-- Migration: Fix Products Statistics to only count active products
-- Description: Update get_products_stats function to exclude inactive products

-- Function to get products statistics (only active products)
CREATE OR REPLACE FUNCTION get_products_stats()
RETURNS JSON AS $$
DECLARE
  total_products INTEGER;
  active_products INTEGER;
  low_stock_products INTEGER;
  new_products_this_month INTEGER;
BEGIN
  -- Get total products (only active products)
  SELECT COUNT(*)
  INTO total_products
  FROM products
  WHERE is_active = true;

  -- Get active products (active and in stock)
  SELECT COUNT(*)
  INTO active_products
  FROM products
  WHERE is_active = true AND stock > 0;

  -- Get low stock products (active products with stock <= 10)
  SELECT COUNT(*)
  INTO low_stock_products
  FROM products
  WHERE is_active = true AND stock > 0 AND stock <= 10;

  -- Get products created this month (only active products)
  SELECT COUNT(*)
  INTO new_products_this_month
  FROM products
  WHERE is_active = true
    AND created_at >= DATE_TRUNC('month', CURRENT_DATE)
    AND created_at < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month';

  RETURN json_build_object(
    'total_products', total_products,
    'active_products', active_products,
    'low_stock_products', low_stock_products,
    'new_products_this_month', new_products_this_month
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

