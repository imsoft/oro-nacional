# 🔧 Solución Error 403: Hero Images

## Error que estás viendo:
```json
{
  "statusCode": "403",
  "error": "Unauthorized",
  "message": "new row violates row-level security policy"
}
```

## ✅ Solución en 3 Pasos

### PASO 1: Ejecutar Script SQL en Supabase

1. Ve a **Supabase Dashboard**
2. Click en **SQL Editor** (en el menú lateral izquierdo)
3. Click en **New Query**
4. Copia y pega **TODO** el contenido del archivo:
   - `supabase/FIX_FINAL_HERO_IMAGES.sql`
5. Click en **Run** (o presiona Ctrl/Cmd + Enter)

**Importante:** El script primero deshabilitará RLS para verificar que la tabla funciona, luego lo habilitará con las políticas correctas.

### PASO 2: Crear Bucket de Storage

1. Ve a **Storage** en Supabase Dashboard
2. Click en **New bucket**
3. Configuración:
   ```
   Name: hero-images
   Public bucket: ✅ ACTIVAR (MUY IMPORTANTE)
   File size limit: 5242880 (5MB)
   Allowed MIME types: image/*
   ```
4. Click en **Create bucket**

### PASO 3: Configurar Políticas del Bucket

1. Click en el bucket **hero-images** que acabas de crear
2. Ve a la pestaña **Policies**
3. Click en **New policy** y crea estas 4 políticas:

#### Política 1: Lectura Pública
```
Policy name: Public read access
Allowed operation: SELECT
Target roles: public
USING expression: true
```

O ejecuta este SQL:
```sql
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'hero-images');
```

#### Política 2: Insert para Autenticados
```
Policy name: Authenticated users can upload
Allowed operation: INSERT
Target roles: authenticated
WITH CHECK expression: bucket_id = 'hero-images'
```

O ejecuta este SQL:
```sql
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'hero-images');
```

#### Política 3: Update para Autenticados
```sql
CREATE POLICY "Authenticated users can update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'hero-images')
WITH CHECK (bucket_id = 'hero-images');
```

#### Política 4: Delete para Autenticados
```sql
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'hero-images');
```

## 🧪 Verificar que Funciona

Después de completar los 3 pasos:

1. Cierra sesión en tu aplicación
2. Vuelve a iniciar sesión
3. Ve a `/admin/hero`
4. Intenta subir una imagen

**Deberías ver:**
- ✅ Las 3 imágenes por defecto
- ✅ Poder subir nuevas imágenes sin error 403
- ✅ Poder reemplazar imágenes existentes
- ✅ Poder eliminar imágenes

## 🔍 Diagnóstico

Si sigues teniendo problemas, ejecuta este SQL para ver las políticas:

```sql
-- Ver políticas de la tabla
SELECT tablename, policyname, roles, cmd
FROM pg_policies
WHERE tablename = 'hero_images'
ORDER BY policyname;

-- Deberías ver 5 políticas con estos nombres:
-- 1. allow_delete_authenticated
-- 2. allow_insert_authenticated
-- 3. allow_select_active_public
-- 4. allow_select_all_authenticated
-- 5. allow_update_authenticated

-- Ver políticas del storage
SELECT policyname, roles, command
FROM storage.policies
WHERE bucket_id = 'hero-images'
ORDER BY policyname;

-- Deberías ver 4 políticas del storage
```

## ❓ Preguntas Frecuentes

**P: ¿Por qué deshabilitar RLS primero?**
R: Para verificar que el problema es de políticas y no de la estructura de la tabla.

**P: ¿Es seguro deshabilitar RLS temporalmente?**
R: Sí, el script lo habilita de nuevo inmediatamente después con las políticas correctas.

**P: ¿Qué pasa si ya tenía la tabla creada?**
R: El script la elimina y recrea con las políticas correctas (perderás imágenes subidas).

**P: ¿Necesito crear las políticas de storage manualmente?**
R: Sí, las políticas de storage no se pueden crear desde el script SQL de la tabla.

## 📞 Si Aún No Funciona

Comparte el resultado de estas queries:

```sql
-- 1. Ver si la tabla existe y tiene RLS habilitado
SELECT
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'hero_images';

-- 2. Ver tus políticas actuales
SELECT * FROM pg_policies WHERE tablename = 'hero_images';

-- 3. Intentar insertar un registro de prueba
INSERT INTO hero_images (image_url, display_order, is_active)
VALUES ('https://test.com/image.jpg', 99, true)
RETURNING *;
```
