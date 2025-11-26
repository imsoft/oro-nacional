-- Migration: Storage Policies for Blog Images
-- Description: Create storage policies for blog-images bucket
-- Version: 022
-- Created: 2025-01-XX

-- ================================================
-- POLÍTICAS DE STORAGE PARA BLOG-IMAGES
-- ================================================
-- NOTA: El bucket "blog-images" debe crearse desde el Dashboard de Supabase
-- Storage -> Create Bucket -> Name: "blog-images" -> Public: true

-- Política: Cualquiera puede ver las imágenes del blog
CREATE POLICY IF NOT EXISTS "Imágenes del blog son públicas"
ON storage.objects FOR SELECT
USING (bucket_id = 'blog-images');

-- Política: Solo admins pueden subir imágenes
CREATE POLICY IF NOT EXISTS "Solo admins pueden subir imágenes del blog"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'blog-images'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Política: Solo admins pueden actualizar imágenes
CREATE POLICY IF NOT EXISTS "Solo admins pueden actualizar imágenes del blog"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'blog-images'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Política: Solo admins pueden eliminar imágenes
CREATE POLICY IF NOT EXISTS "Solo admins pueden eliminar imágenes del blog"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'blog-images'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

