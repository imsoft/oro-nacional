-- ==================================================
-- DIAGNÓSTICO: Ejecuta esto primero para ver el estado actual
-- ==================================================

-- Ver si la tabla existe
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'hero_images'
) as tabla_existe;

-- Ver las políticas actuales
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'hero_images';

-- ==================================================
-- SOLUCIÓN COMPLETA: Ejecuta esto después del diagnóstico
-- ==================================================

-- PASO 1: Eliminar tabla si existe (esto eliminará todo)
DROP TABLE IF EXISTS hero_images CASCADE;

-- PASO 2: Crear tabla nueva
CREATE TABLE hero_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  CONSTRAINT hero_images_display_order_unique UNIQUE (display_order)
);

-- PASO 3: Habilitar RLS
ALTER TABLE hero_images ENABLE ROW LEVEL SECURITY;

-- PASO 4: Crear políticas CORRECTAS
-- Política para SELECT público (solo imágenes activas)
CREATE POLICY "hero_images_select_public"
ON hero_images
FOR SELECT
TO public
USING (is_active = true);

-- Política para SELECT autenticado (todas las imágenes)
CREATE POLICY "hero_images_select_authenticated"
ON hero_images
FOR SELECT
TO authenticated
USING (true);

-- Política para INSERT autenticado
CREATE POLICY "hero_images_insert_authenticated"
ON hero_images
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Política para UPDATE autenticado
CREATE POLICY "hero_images_update_authenticated"
ON hero_images
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Política para DELETE autenticado
CREATE POLICY "hero_images_delete_authenticated"
ON hero_images
FOR DELETE
TO authenticated
USING (true);

-- PASO 5: Crear función y trigger para updated_at
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

-- PASO 6: Insertar imágenes por defecto
INSERT INTO hero_images (image_url, display_order, is_active) VALUES
  ('https://images.unsplash.com/photo-1611591437281-460bfbe1220a?ixlib=rb-4.0.3&auto=format&fit=crop&w=2830&q=80', 0, true),
  ('https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=2830&q=80', 1, true),
  ('https://images.unsplash.com/photo-1603561596112-0a132b757442?ixlib=rb-4.0.3&auto=format&fit=crop&w=2830&q=80', 2, true);

-- ==================================================
-- VERIFICACIÓN: Ejecuta esto al final para confirmar
-- ==================================================

-- Ver las políticas creadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'hero_images'
ORDER BY policyname;

-- Contar imágenes
SELECT COUNT(*) as total_imagenes FROM hero_images;
