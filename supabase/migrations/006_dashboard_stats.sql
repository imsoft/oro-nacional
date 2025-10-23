-- Migration: Dashboard Statistics
-- Description: SQL functions to calculate real-time dashboard statistics

-- Function to get total sales and growth
CREATE OR REPLACE FUNCTION get_sales_stats()
RETURNS JSON AS $$
DECLARE
  current_month_sales DECIMAL(10, 2);
  last_month_sales DECIMAL(10, 2);
  total_sales DECIMAL(10, 2);
  growth_percentage DECIMAL(5, 2);
BEGIN
  -- Get current month sales
  SELECT COALESCE(SUM(total), 0)
  INTO current_month_sales
  FROM orders
  WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)
    AND created_at < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
    AND status != 'Cancelado';

  -- Get last month sales
  SELECT COALESCE(SUM(total), 0)
  INTO last_month_sales
  FROM orders
  WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month'
    AND created_at < DATE_TRUNC('month', CURRENT_DATE)
    AND status != 'Cancelado';

  -- Get total sales (all time)
  SELECT COALESCE(SUM(total), 0)
  INTO total_sales
  FROM orders
  WHERE status != 'Cancelado';

  -- Calculate growth percentage
  IF last_month_sales > 0 THEN
    growth_percentage := ((current_month_sales - last_month_sales) / last_month_sales) * 100;
  ELSIF current_month_sales > 0 THEN
    growth_percentage := 100;
  ELSE
    growth_percentage := 0;
  END IF;

  RETURN json_build_object(
    'total_sales', total_sales,
    'current_month_sales', current_month_sales,
    'last_month_sales', last_month_sales,
    'growth_percentage', ROUND(growth_percentage, 1)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get orders statistics
CREATE OR REPLACE FUNCTION get_orders_stats()
RETURNS JSON AS $$
DECLARE
  current_month_orders INTEGER;
  last_month_orders INTEGER;
  total_orders INTEGER;
  growth_percentage DECIMAL(5, 2);
BEGIN
  -- Get current month orders
  SELECT COUNT(*)
  INTO current_month_orders
  FROM orders
  WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)
    AND created_at < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
    AND status != 'Cancelado';

  -- Get last month orders
  SELECT COUNT(*)
  INTO last_month_orders
  FROM orders
  WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month'
    AND created_at < DATE_TRUNC('month', CURRENT_DATE)
    AND status != 'Cancelado';

  -- Get total orders (all time)
  SELECT COUNT(*)
  INTO total_orders
  FROM orders
  WHERE status != 'Cancelado';

  -- Calculate growth percentage
  IF last_month_orders > 0 THEN
    growth_percentage := ((current_month_orders::DECIMAL - last_month_orders) / last_month_orders) * 100;
  ELSIF current_month_orders > 0 THEN
    growth_percentage := 100;
  ELSE
    growth_percentage := 0;
  END IF;

  RETURN json_build_object(
    'total_orders', total_orders,
    'current_month_orders', current_month_orders,
    'last_month_orders', last_month_orders,
    'growth_percentage', ROUND(growth_percentage, 1)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get products statistics
CREATE OR REPLACE FUNCTION get_products_stats()
RETURNS JSON AS $$
DECLARE
  total_products INTEGER;
  active_products INTEGER;
  low_stock_products INTEGER;
  new_products_this_month INTEGER;
BEGIN
  -- Get total products
  SELECT COUNT(*)
  INTO total_products
  FROM products;

  -- Get active products (in stock)
  SELECT COUNT(*)
  INTO active_products
  FROM products
  WHERE stock > 0;

  -- Get low stock products (stock <= 5)
  SELECT COUNT(*)
  INTO low_stock_products
  FROM products
  WHERE stock > 0 AND stock <= 5;

  -- Get products created this month
  SELECT COUNT(*)
  INTO new_products_this_month
  FROM products
  WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)
    AND created_at < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month';

  RETURN json_build_object(
    'total_products', total_products,
    'active_products', active_products,
    'low_stock_products', low_stock_products,
    'new_products_this_month', new_products_this_month
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users (will be restricted by RLS)
GRANT EXECUTE ON FUNCTION get_sales_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION get_orders_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION get_products_stats() TO authenticated;

-- Note: These functions use SECURITY DEFINER to allow them to read data
-- Access control should be handled at the application level (admin role check)
