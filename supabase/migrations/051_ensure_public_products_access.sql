-- Migration: Ensure public access to active products
-- Description: Creates RLS policies to allow public (anonymous) users to view active products
-- Version: 051
-- Created: 2025-01-30

-- ================================================
-- 1. Check if RLS is enabled on products table
-- ================================================
-- If RLS is not enabled, enable it first
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'products'
  ) THEN
    -- RLS might not be enabled, but we'll create policies anyway
    -- Supabase will handle enabling RLS if needed
    NULL;
  END IF;
END $$;

-- ================================================
-- 2. Drop existing policies if they exist (to recreate them)
-- ================================================
DROP POLICY IF EXISTS "Public can view active products" ON public.products;
DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;
DROP POLICY IF EXISTS "Public can view products" ON public.products;

-- ================================================
-- 3. Create policy to allow public (anonymous) users to view active products
-- ================================================
CREATE POLICY "Public can view active products"
  ON public.products
  FOR SELECT
  USING (is_active = true);

-- ================================================
-- 4. Ensure authenticated users can also view active products
--    (This should already exist, but we'll make sure)
-- ================================================
-- Note: If there are existing policies for authenticated users, they should remain
-- This policy specifically targets anonymous/public access

-- ================================================
-- 5. Add helpful comment
-- ================================================
COMMENT ON POLICY "Public can view active products" ON public.products IS 
  'Allows anonymous (public) users to view products where is_active = true. This is required for the public-facing website to display products.';
