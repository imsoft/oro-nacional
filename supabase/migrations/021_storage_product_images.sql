-- Migration: Storage Policies for Product Images
-- Description: Create storage policies for product-images bucket
-- Version: 021
-- Created: 2025-01-XX

-- ============================================
-- POLÍTICAS DE STORAGE PARA PRODUCT-IMAGES
-- ============================================
-- NOTA: El bucket "product-images" debe crearse desde el Dashboard de Supabase
-- Storage -> Create Bucket -> Name: "product-images" -> Public: true

-- Política: Todos pueden ver imágenes (bucket público)
CREATE POLICY IF NOT EXISTS "Public Access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

-- Política: Solo admins pueden subir imágenes
CREATE POLICY IF NOT EXISTS "Admins can upload images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Política: Solo admins pueden actualizar imágenes
CREATE POLICY IF NOT EXISTS "Admins can update images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'product-images' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Política: Solo admins pueden eliminar imágenes
CREATE POLICY IF NOT EXISTS "Admins can delete images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'product-images' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

