-- ============================================
-- SOLUCIÓN DEFINITIVA PARA HERO_IMAGES
-- Copia y pega TODO este script en SQL Editor
-- ============================================

-- 1. ELIMINAR TODO LO ANTERIOR (si existe)
DROP TRIGGER IF EXISTS hero_images_updated_at ON hero_images CASCADE;
DROP FUNCTION IF EXISTS update_hero_images_updated_at() CASCADE;
DROP TABLE IF EXISTS hero_images CASCADE;

-- 2. CREAR TABLA NUEVA
CREATE TABLE hero_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT hero_images_display_order_unique UNIQUE (display_order)
);

-- 3. DESHABILITAR RLS TEMPORALMENTE PARA TESTING
ALTER TABLE hero_images DISABLE ROW LEVEL SECURITY;

-- 4. INSERTAR DATOS DE PRUEBA
INSERT INTO hero_images (image_url, display_order, is_active) VALUES
  ('https://images.unsplash.com/photo-1611591437281-460bfbe1220a?ixlib=rb-4.0.3&auto=format&fit=crop&w=2830&q=80', 0, true),
  ('https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=2830&q=80', 1, true),
  ('https://images.unsplash.com/photo-1603561596112-0a132b757442?ixlib=rb-4.0.3&auto=format&fit=crop&w=2830&q=80', 2, true);

-- 5. VERIFICAR QUE SE INSERTÓ
SELECT * FROM hero_images;

-- ============================================
-- DESPUÉS DE CONFIRMAR QUE FUNCIONA SIN RLS,
-- EJECUTA ESTE BLOQUE PARA HABILITAR SEGURIDAD:
-- ============================================

-- Habilitar RLS
ALTER TABLE hero_images ENABLE ROW LEVEL SECURITY;

-- Política 1: Todos pueden ver imágenes activas (sin autenticación)
CREATE POLICY "allow_select_active_public"
ON hero_images
FOR SELECT
USING (is_active = true);

-- Política 2: Usuarios autenticados pueden ver TODAS las imágenes
CREATE POLICY "allow_select_all_authenticated"
ON hero_images
FOR SELECT
TO authenticated
USING (true);

-- Política 3: Usuarios autenticados pueden INSERTAR
CREATE POLICY "allow_insert_authenticated"
ON hero_images
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Política 4: Usuarios autenticados pueden ACTUALIZAR
CREATE POLICY "allow_update_authenticated"
ON hero_images
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Política 5: Usuarios autenticados pueden ELIMINAR
CREATE POLICY "allow_delete_authenticated"
ON hero_images
FOR DELETE
TO authenticated
USING (true);

-- 6. CREAR TRIGGER PARA UPDATED_AT
CREATE OR REPLACE FUNCTION update_hero_images_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER hero_images_updated_at
BEFORE UPDATE ON hero_images
FOR EACH ROW
EXECUTE FUNCTION update_hero_images_updated_at();

-- 7. VERIFICACIÓN FINAL
SELECT
  tablename,
  policyname,
  roles,
  cmd as comando,
  CASE
    WHEN qual IS NOT NULL THEN 'Tiene USING'
    ELSE 'Sin USING'
  END as tiene_using,
  CASE
    WHEN with_check IS NOT NULL THEN 'Tiene WITH CHECK'
    ELSE 'Sin WITH CHECK'
  END as tiene_with_check
FROM pg_policies
WHERE tablename = 'hero_images'
ORDER BY policyname;

-- DEBERÍAS VER 5 POLÍTICAS:
-- 1. allow_delete_authenticated
-- 2. allow_insert_authenticated
-- 3. allow_select_active_public
-- 4. allow_select_all_authenticated
-- 5. allow_update_authenticated
