-- ============================================
-- ELIMINAR POLÍTICAS ANTIGUAS RESTRICTIVAS
-- ============================================

-- Eliminar las políticas antiguas que están bloqueando las operaciones
DROP POLICY IF EXISTS "Only admins can delete products" ON products;
DROP POLICY IF EXISTS "Only admins can insert products" ON products;
DROP POLICY IF EXISTS "Only admins can update products" ON products;
DROP POLICY IF EXISTS "Anyone can view active products" ON products;

-- Crear políticas CORRECTAS

-- SELECT: Cualquiera puede ver productos activos
CREATE POLICY "products_select_public"
ON products
FOR SELECT
TO public
USING (is_active = true);

-- SELECT: Usuarios autenticados pueden ver TODOS los productos (incluso inactivos)
CREATE POLICY "products_select_authenticated"
ON products
FOR SELECT
TO authenticated
USING (true);

-- INSERT: Usuarios autenticados pueden insertar productos
CREATE POLICY "products_insert_authenticated"
ON products
FOR INSERT
TO authenticated
WITH CHECK (true);

-- UPDATE: Ya existe "products_update_authenticated" que creamos antes
-- No la recreamos para evitar duplicados

-- DELETE: Usuarios autenticados pueden eliminar (por si quieres hard delete en el futuro)
CREATE POLICY "products_delete_authenticated"
ON products
FOR DELETE
TO authenticated
USING (true);

-- Verificar las políticas finales
SELECT
  tablename,
  policyname,
  permissive,
  roles,
  cmd as command
FROM pg_policies
WHERE tablename = 'products'
ORDER BY cmd, policyname;

-- Deberías ver:
-- DELETE: products_delete_authenticated (authenticated)
-- INSERT: products_insert_authenticated (authenticated)
-- SELECT: products_select_authenticated (authenticated)
-- SELECT: products_select_public (public)
-- UPDATE: products_update_authenticated (authenticated)
