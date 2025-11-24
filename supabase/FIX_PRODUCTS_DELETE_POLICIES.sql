-- ============================================
-- FIX: Políticas para permitir eliminación (soft delete) de productos
-- ============================================

-- Ver políticas actuales
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'products'
ORDER BY policyname;

-- Eliminar políticas antiguas si existen
DROP POLICY IF EXISTS "products_update_authenticated" ON products;
DROP POLICY IF EXISTS "products_delete_authenticated" ON products;
DROP POLICY IF EXISTS "allow_update_authenticated" ON products;
DROP POLICY IF EXISTS "Authenticated users can update products" ON products;

-- Política para UPDATE (permite soft delete)
CREATE POLICY "products_update_authenticated"
ON products
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Verificar que RLS esté habilitado
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Verificar las políticas después del cambio
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd as command
FROM pg_policies
WHERE tablename = 'products'
ORDER BY policyname;

-- Test: Intentar actualizar un producto (simular soft delete)
-- Nota: Este test fallará si no hay productos, pero mostrará si las políticas funcionan
-- COMENTAR LAS SIGUIENTES LÍNEAS DESPUÉS DE VERIFICAR QUE LAS POLÍTICAS ESTÁN CORRECTAS
/*
DO $$
DECLARE
  test_product_id uuid;
BEGIN
  -- Obtener un producto existente
  SELECT id INTO test_product_id FROM products LIMIT 1;

  IF test_product_id IS NOT NULL THEN
    -- Intentar actualizar (soft delete)
    UPDATE products
    SET is_active = false
    WHERE id = test_product_id;

    RAISE NOTICE 'Test exitoso: Producto % actualizado correctamente', test_product_id;

    -- Revertir el cambio
    UPDATE products
    SET is_active = true
    WHERE id = test_product_id;
  ELSE
    RAISE NOTICE 'No hay productos para probar';
  END IF;
END $$;
*/
