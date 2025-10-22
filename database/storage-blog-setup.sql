-- ================================================
-- STORAGE SETUP PARA BLOG IMAGES
-- ================================================

-- INSTRUCCIONES:
-- 1. Ve a Supabase Dashboard > Storage
-- 2. Crea un nuevo bucket llamado 'blog-images'
-- 3. Marca el bucket como 'Public'
-- 4. Ejecuta las siguientes políticas de storage

-- ================================================
-- POLÍTICAS DE STORAGE PARA BLOG-IMAGES
-- ================================================

-- Política: Cualquiera puede ver las imágenes del blog
CREATE POLICY "Imágenes del blog son públicas"
ON storage.objects FOR SELECT
USING (bucket_id = 'blog-images');

-- Política: Solo admins pueden subir imágenes
CREATE POLICY "Solo admins pueden subir imágenes del blog"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'blog-images'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Política: Solo admins pueden actualizar imágenes
CREATE POLICY "Solo admins pueden actualizar imágenes del blog"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'blog-images'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Política: Solo admins pueden eliminar imágenes
CREATE POLICY "Solo admins pueden eliminar imágenes del blog"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'blog-images'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);
