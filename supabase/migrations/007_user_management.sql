-- Migration: User Management & Statistics
-- Description: SQL functions and views for managing users and calculating their statistics

-- Function to get user statistics (orders count and total spent)
CREATE OR REPLACE FUNCTION get_user_stats(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
  order_count INTEGER;
  total_spent DECIMAL(10, 2);
  last_order_date TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get order count and total spent
  SELECT
    COUNT(*),
    COALESCE(SUM(total), 0),
    MAX(created_at)
  INTO order_count, total_spent, last_order_date
  FROM orders
  WHERE user_id = user_uuid
    AND status != 'Cancelado';

  RETURN json_build_object(
    'order_count', order_count,
    'total_spent', total_spent,
    'last_order_date', last_order_date
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all users with their statistics
CREATE OR REPLACE FUNCTION get_users_with_stats()
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT,
  role TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  order_count BIGINT,
  total_spent DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.email,
    p.full_name,
    p.role,
    p.phone,
    p.created_at,
    COALESCE(COUNT(o.id), 0) as order_count,
    COALESCE(SUM(o.total), 0) as total_spent
  FROM profiles p
  LEFT JOIN orders o ON p.id = o.user_id AND o.status != 'Cancelado'
  GROUP BY p.id, p.email, p.full_name, p.role, p.phone, p.created_at
  ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user role (admin only operation)
CREATE OR REPLACE FUNCTION update_user_role(
  user_uuid UUID,
  new_role TEXT
)
RETURNS JSON AS $$
DECLARE
  updated_user profiles%ROWTYPE;
BEGIN
  -- Validate role
  IF new_role NOT IN ('user', 'admin') THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Invalid role. Must be "user" or "admin"'
    );
  END IF;

  -- Update the user role
  UPDATE profiles
  SET role = new_role::TEXT,
      updated_at = NOW()
  WHERE id = user_uuid
  RETURNING * INTO updated_user;

  IF updated_user.id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'User not found'
    );
  END IF;

  RETURN json_build_object(
    'success', true,
    'user', row_to_json(updated_user)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user count by role
CREATE OR REPLACE FUNCTION get_user_count_by_role()
RETURNS JSON AS $$
DECLARE
  total_users INTEGER;
  admin_count INTEGER;
  user_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_users FROM profiles;
  SELECT COUNT(*) INTO admin_count FROM profiles WHERE role = 'admin';
  SELECT COUNT(*) INTO user_count FROM profiles WHERE role = 'user';

  RETURN json_build_object(
    'total_users', total_users,
    'admin_count', admin_count,
    'user_count', user_count
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
-- Note: Application should verify admin role before calling these functions
GRANT EXECUTE ON FUNCTION get_user_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_users_with_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_role(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_count_by_role() TO authenticated;
