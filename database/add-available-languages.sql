-- ================================================
-- AGREGAR CAMPO DE IDIOMAS DISPONIBLES
-- ================================================
-- Este script agrega un campo para indicar en qué idiomas
-- está disponible cada producto y blog post

-- ================================================
-- 1. AGREGAR CAMPO A PRODUCTOS
-- ================================================

-- Agregar columna available_languages (array de texto)
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS available_languages TEXT[] DEFAULT ARRAY['es', 'en']::TEXT[];

-- Actualizar productos existentes para que tengan ambos idiomas por defecto
UPDATE public.products 
SET available_languages = ARRAY['es', 'en']::TEXT[]
WHERE available_languages IS NULL;

-- Crear índice para búsquedas por idioma
CREATE INDEX IF NOT EXISTS idx_products_available_languages ON public.products USING GIN(available_languages);

-- ================================================
-- 2. AGREGAR CAMPO A BLOG POSTS
-- ================================================

-- Agregar columna available_languages (array de texto)
ALTER TABLE public.blog_posts 
ADD COLUMN IF NOT EXISTS available_languages TEXT[] DEFAULT ARRAY['es', 'en']::TEXT[];

-- Actualizar blog posts existentes para que tengan ambos idiomas por defecto
UPDATE public.blog_posts 
SET available_languages = ARRAY['es', 'en']::TEXT[]
WHERE available_languages IS NULL;

-- Crear índice para búsquedas por idioma
CREATE INDEX IF NOT EXISTS idx_blog_posts_available_languages ON public.blog_posts USING GIN(available_languages);

-- ================================================
-- VERIFICACIÓN
-- ================================================

-- Verificar que las columnas se agregaron correctamente
SELECT 
  'products' as table_name,
  column_name,
  data_type,
  column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name = 'available_languages';

SELECT 
  'blog_posts' as table_name,
  column_name,
  data_type,
  column_default
FROM information_schema.columns 
WHERE table_name = 'blog_posts' 
AND column_name = 'available_languages';

