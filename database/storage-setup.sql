-- ============================================
-- SETUP STORAGE PARA IMÁGENES - ORO NACIONAL
-- ============================================
-- Ejecuta este script en tu proyecto de Supabase
-- SQL Editor -> New Query -> Pega este código -> Run

-- NOTA: El bucket se crea desde el Dashboard de Supabase
-- Storage -> Create Bucket -> Name: "product-images" -> Public: true

-- 1. Crear políticas de storage para el bucket "product-images"

-- Política: Todos pueden ver imágenes (bucket público)
CREATE POLICY "Public Access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

-- Política: Solo admins pueden subir imágenes
CREATE POLICY "Admins can upload images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Política: Solo admins pueden actualizar imágenes
CREATE POLICY "Admins can update images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'product-images' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Política: Solo admins pueden eliminar imágenes
CREATE POLICY "Admins can delete images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'product-images' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- INSTRUCCIONES PARA CREAR EL BUCKET
-- ============================================

-- 1. Ve a Storage en el menú lateral de Supabase
-- 2. Haz clic en "Create bucket"
-- 3. Configuración:
--    - Name: product-images
--    - Public bucket: ✅ Activado
--    - File size limit: 5 MB (recomendado para imágenes)
--    - Allowed mime types: image/jpeg, image/png, image/webp
-- 4. Haz clic en "Create bucket"
-- 5. Ejecuta este script SQL para agregar las políticas de seguridad

-- ============================================
-- BUCKET ADICIONAL PARA AVATARES (OPCIONAL)
-- ============================================

-- Si quieres crear un bucket separado para avatares de usuarios:

-- CREATE POLICY "Public Access to Avatars"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'avatars');

-- CREATE POLICY "Users can upload own avatar"
--   ON storage.objects FOR INSERT
--   WITH CHECK (
--     bucket_id = 'avatars' AND
--     auth.uid()::text = (storage.foldername(name))[1]
--   );

-- CREATE POLICY "Users can update own avatar"
--   ON storage.objects FOR UPDATE
--   USING (
--     bucket_id = 'avatars' AND
--     auth.uid()::text = (storage.foldername(name))[1]
--   );

-- CREATE POLICY "Users can delete own avatar"
--   ON storage.objects FOR DELETE
--   USING (
--     bucket_id = 'avatars' AND
--     auth.uid()::text = (storage.foldername(name))[1]
--   );
