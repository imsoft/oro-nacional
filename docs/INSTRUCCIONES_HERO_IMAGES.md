# Configuración de Hero Images en Supabase

## Paso 1: Crear la tabla hero_images

Ve a **Supabase Dashboard** → **SQL Editor** y ejecuta este script:

```sql
-- Crear tabla hero_images
CREATE TABLE IF NOT EXISTS hero_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  CONSTRAINT hero_images_display_order_unique UNIQUE (display_order)
);

-- Habilitar RLS
ALTER TABLE hero_images ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Hero images are viewable by everyone" ON hero_images;
DROP POLICY IF EXISTS "Authenticated users can insert hero images" ON hero_images;
DROP POLICY IF EXISTS "Authenticated users can update hero images" ON hero_images;
DROP POLICY IF EXISTS "Authenticated users can delete hero images" ON hero_images;
DROP POLICY IF EXISTS "Authenticated users can view all hero images" ON hero_images;

-- Políticas: Cualquiera puede ver imágenes activas
CREATE POLICY "Hero images are viewable by everyone"
  ON hero_images FOR SELECT
  USING (is_active = true);

-- Políticas: Usuarios autenticados pueden ver todas las imágenes
CREATE POLICY "Authenticated users can view all hero images"
  ON hero_images FOR SELECT
  TO authenticated
  USING (true);

-- Políticas: Usuarios autenticados pueden insertar
CREATE POLICY "Authenticated users can insert hero images"
  ON hero_images FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Políticas: Usuarios autenticados pueden actualizar
CREATE POLICY "Authenticated users can update hero images"
  ON hero_images FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Políticas: Usuarios autenticados pueden eliminar
CREATE POLICY "Authenticated users can delete hero images"
  ON hero_images FOR DELETE
  TO authenticated
  USING (true);

-- Trigger para updated_at
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

-- Insertar 3 imágenes por defecto
INSERT INTO hero_images (image_url, display_order, is_active) VALUES
  ('https://images.unsplash.com/photo-1611591437281-460bfbe1220a?ixlib=rb-4.0.3&auto=format&fit=crop&w=2830&q=80', 0, true),
  ('https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=2830&q=80', 1, true),
  ('https://images.unsplash.com/photo-1603561596112-0a132b757442?ixlib=rb-4.0.3&auto=format&fit=crop&w=2830&q=80', 2, true);
```

## Paso 2: Crear el bucket de storage

1. Ve a **Supabase Dashboard** → **Storage**
2. Click en **New bucket**
3. Configuración:
   - **Name**: `hero-images`
   - **Public bucket**: ✅ ACTIVAR (muy importante)
   - **Allowed MIME types**: Dejar por defecto o agregar: `image/jpeg, image/png, image/webp, image/jpg`
   - **File size limit**: 5MB
4. Click en **Create bucket**

## Paso 3: Configurar políticas del bucket

Ve a **Storage** → **hero-images** → **Policies** y crea estas políticas:

### Política 1: Lectura pública
```sql
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'hero-images');
```

### Política 2: Usuarios autenticados pueden subir
```sql
CREATE POLICY "Authenticated users can upload hero images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'hero-images');
```

### Política 3: Usuarios autenticados pueden actualizar
```sql
CREATE POLICY "Authenticated users can update hero images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'hero-images');
```

### Política 4: Usuarios autenticados pueden eliminar
```sql
CREATE POLICY "Authenticated users can delete hero images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'hero-images');
```

## Verificación

Una vez completados estos pasos:

1. Ve a `/admin/hero` en tu aplicación
2. Deberías ver 3 imágenes por defecto
3. Podrás subir, reemplazar y eliminar imágenes sin errores
4. Las imágenes aparecerán en el carousel del hero de la página principal

## Solución de problemas

Si sigues teniendo errores:

1. **Error 403**: Verifica que las políticas RLS estén correctas
2. **Bucket no existe**: Asegúrate de crear el bucket `hero-images`
3. **No se ven las imágenes**: Verifica que el bucket sea público
4. **No puedes subir**: Verifica las políticas de storage
