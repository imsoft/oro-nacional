-- ================================================
-- MIGRACIÓN PARA CONTENIDO MULTILINGÜE
-- ================================================
-- Este script modifica las tablas existentes para soportar contenido en español e inglés

-- ================================================
-- 1. MODIFICAR TABLA DE CATEGORÍAS DE PRODUCTOS
-- ================================================

-- Agregar columnas para contenido multilingüe
ALTER TABLE public.product_categories 
ADD COLUMN IF NOT EXISTS name_es TEXT,
ADD COLUMN IF NOT EXISTS name_en TEXT,
ADD COLUMN IF NOT EXISTS slug_es TEXT,
ADD COLUMN IF NOT EXISTS slug_en TEXT,
ADD COLUMN IF NOT EXISTS description_es TEXT,
ADD COLUMN IF NOT EXISTS description_en TEXT;

-- Migrar datos existentes (asumiendo que están en español)
UPDATE public.product_categories 
SET 
  name_es = name,
  name_en = name, -- Temporalmente igual, se actualizará después
  slug_es = slug,
  slug_en = slug, -- Temporalmente igual, se actualizará después
  description_es = description,
  description_en = description -- Temporalmente igual, se actualizará después
WHERE name_es IS NULL;

-- Crear índices para las nuevas columnas
CREATE INDEX IF NOT EXISTS idx_product_categories_slug_es ON public.product_categories(slug_es);
CREATE INDEX IF NOT EXISTS idx_product_categories_slug_en ON public.product_categories(slug_en);

-- ================================================
-- 2. MODIFICAR TABLA DE PRODUCTOS
-- ================================================

-- Agregar columnas para contenido multilingüe
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS name_es TEXT,
ADD COLUMN IF NOT EXISTS name_en TEXT,
ADD COLUMN IF NOT EXISTS slug_es TEXT,
ADD COLUMN IF NOT EXISTS slug_en TEXT,
ADD COLUMN IF NOT EXISTS description_es TEXT,
ADD COLUMN IF NOT EXISTS description_en TEXT,
ADD COLUMN IF NOT EXISTS material_es TEXT,
ADD COLUMN IF NOT EXISTS material_en TEXT;

-- Migrar datos existentes
UPDATE public.products 
SET 
  name_es = name,
  name_en = name, -- Temporalmente igual
  slug_es = slug,
  slug_en = slug, -- Temporalmente igual
  description_es = description,
  description_en = description, -- Temporalmente igual
  material_es = material,
  material_en = material -- Temporalmente igual
WHERE name_es IS NULL;

-- Crear índices para las nuevas columnas
CREATE INDEX IF NOT EXISTS idx_products_slug_es ON public.products(slug_es);
CREATE INDEX IF NOT EXISTS idx_products_slug_en ON public.products(slug_en);

-- ================================================
-- 3. MODIFICAR TABLA DE ESPECIFICACIONES DE PRODUCTOS
-- ================================================

-- Agregar columnas para contenido multilingüe
ALTER TABLE public.product_specifications 
ADD COLUMN IF NOT EXISTS spec_key_es TEXT,
ADD COLUMN IF NOT EXISTS spec_key_en TEXT,
ADD COLUMN IF NOT EXISTS spec_value_es TEXT,
ADD COLUMN IF NOT EXISTS spec_value_en TEXT;

-- Migrar datos existentes
UPDATE public.product_specifications 
SET 
  spec_key_es = spec_key,
  spec_key_en = spec_key, -- Temporalmente igual
  spec_value_es = spec_value,
  spec_value_en = spec_value -- Temporalmente igual
WHERE spec_key_es IS NULL;

-- ================================================
-- 4. MODIFICAR TABLA DE IMÁGENES DE PRODUCTOS
-- ================================================

-- Agregar columnas para contenido multilingüe
ALTER TABLE public.product_images 
ADD COLUMN IF NOT EXISTS alt_text_es TEXT,
ADD COLUMN IF NOT EXISTS alt_text_en TEXT;

-- Migrar datos existentes
UPDATE public.product_images 
SET 
  alt_text_es = alt_text,
  alt_text_en = alt_text -- Temporalmente igual
WHERE alt_text_es IS NULL;

-- ================================================
-- 5. MODIFICAR TABLA DE CATEGORÍAS DE BLOG
-- ================================================

-- Agregar columnas para contenido multilingüe
ALTER TABLE public.blog_categories 
ADD COLUMN IF NOT EXISTS name_es TEXT,
ADD COLUMN IF NOT EXISTS name_en TEXT,
ADD COLUMN IF NOT EXISTS slug_es TEXT,
ADD COLUMN IF NOT EXISTS slug_en TEXT,
ADD COLUMN IF NOT EXISTS description_es TEXT,
ADD COLUMN IF NOT EXISTS description_en TEXT;

-- Migrar datos existentes
UPDATE public.blog_categories 
SET 
  name_es = name,
  name_en = name, -- Temporalmente igual
  slug_es = slug,
  slug_en = slug, -- Temporalmente igual
  description_es = description,
  description_en = description -- Temporalmente igual
WHERE name_es IS NULL;

-- Crear índices para las nuevas columnas
CREATE INDEX IF NOT EXISTS idx_blog_categories_slug_es ON public.blog_categories(slug_es);
CREATE INDEX IF NOT EXISTS idx_blog_categories_slug_en ON public.blog_categories(slug_en);

-- ================================================
-- 6. MODIFICAR TABLA DE POSTS DE BLOG
-- ================================================

-- Agregar columnas para contenido multilingüe
ALTER TABLE public.blog_posts 
ADD COLUMN IF NOT EXISTS title_es TEXT,
ADD COLUMN IF NOT EXISTS title_en TEXT,
ADD COLUMN IF NOT EXISTS slug_es TEXT,
ADD COLUMN IF NOT EXISTS slug_en TEXT,
ADD COLUMN IF NOT EXISTS excerpt_es TEXT,
ADD COLUMN IF NOT EXISTS excerpt_en TEXT,
ADD COLUMN IF NOT EXISTS content_es TEXT,
ADD COLUMN IF NOT EXISTS content_en TEXT;

-- Migrar datos existentes
UPDATE public.blog_posts 
SET 
  title_es = title,
  title_en = title, -- Temporalmente igual
  slug_es = slug,
  slug_en = slug, -- Temporalmente igual
  excerpt_es = excerpt,
  excerpt_en = excerpt, -- Temporalmente igual
  content_es = content,
  content_en = content -- Temporalmente igual
WHERE title_es IS NULL;

-- Crear índices para las nuevas columnas
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug_es ON public.blog_posts(slug_es);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug_en ON public.blog_posts(slug_en);

-- ================================================
-- 7. MODIFICAR TABLA DE ETIQUETAS DE BLOG
-- ================================================

-- Agregar columnas para contenido multilingüe
ALTER TABLE public.blog_tags 
ADD COLUMN IF NOT EXISTS name_es TEXT,
ADD COLUMN IF NOT EXISTS name_en TEXT,
ADD COLUMN IF NOT EXISTS slug_es TEXT,
ADD COLUMN IF NOT EXISTS slug_en TEXT;

-- Migrar datos existentes
UPDATE public.blog_tags 
SET 
  name_es = name,
  name_en = name, -- Temporalmente igual
  slug_es = slug,
  slug_en = slug -- Temporalmente igual
WHERE name_es IS NULL;

-- Crear índices para las nuevas columnas
CREATE INDEX IF NOT EXISTS idx_blog_tags_slug_es ON public.blog_tags(slug_es);
CREATE INDEX IF NOT EXISTS idx_blog_tags_slug_en ON public.blog_tags(slug_en);

-- ================================================
-- 8. ACTUALIZAR DATOS DE EJEMPLO CON CONTENIDO EN INGLÉS
-- ================================================

-- Actualizar categorías de productos con contenido en inglés
UPDATE public.product_categories 
SET 
  name_en = CASE 
    WHEN slug = 'anillos' THEN 'Rings'
    WHEN slug = 'collares' THEN 'Necklaces'
    WHEN slug = 'aretes' THEN 'Earrings'
    WHEN slug = 'pulseras' THEN 'Bracelets'
    WHEN slug = 'dijes' THEN 'Pendants'
    WHEN slug = 'relojes' THEN 'Watches'
    ELSE name_en
  END,
  slug_en = CASE 
    WHEN slug = 'anillos' THEN 'rings'
    WHEN slug = 'collares' THEN 'necklaces'
    WHEN slug = 'aretes' THEN 'earrings'
    WHEN slug = 'pulseras' THEN 'bracelets'
    WHEN slug = 'dijes' THEN 'pendants'
    WHEN slug = 'relojes' THEN 'watches'
    ELSE slug_en
  END,
  description_en = CASE 
    WHEN slug = 'anillos' THEN 'Gold rings for every occasion'
    WHEN slug = 'collares' THEN 'Gold necklaces and chains'
    WHEN slug = 'aretes' THEN 'Gold earrings and precious stones'
    WHEN slug = 'pulseras' THEN 'Gold bracelets and bangles'
    WHEN slug = 'dijes' THEN 'Gold pendants and medals'
    WHEN slug = 'relojes' THEN 'Gold and luxury watches'
    ELSE description_en
  END;

-- Actualizar categorías de blog con contenido en inglés
UPDATE public.blog_categories 
SET 
  name_en = CASE 
    WHEN slug = 'cuidados' THEN 'Care'
    WHEN slug = 'tendencias' THEN 'Trends'
    WHEN slug = 'educacion' THEN 'Education'
    WHEN slug = 'historias' THEN 'Stories'
    WHEN slug = 'eventos' THEN 'Events'
    ELSE name_en
  END,
  slug_en = CASE 
    WHEN slug = 'cuidados' THEN 'care'
    WHEN slug = 'tendencias' THEN 'trends'
    WHEN slug = 'educacion' THEN 'education'
    WHEN slug = 'historias' THEN 'stories'
    WHEN slug = 'eventos' THEN 'events'
    ELSE slug_en
  END,
  description_en = CASE 
    WHEN slug = 'cuidados' THEN 'Tips and advice for caring for your jewelry'
    WHEN slug = 'tendencias' THEN 'Latest trends in jewelry'
    WHEN slug = 'educacion' THEN 'Learn about gold, carats and more'
    WHEN slug = 'historias' THEN 'Stories and culture of jewelry'
    WHEN slug = 'eventos' THEN 'Events and news from Oro Nacional'
    ELSE description_en
  END;

-- ================================================
-- 9. CREAR FUNCIONES AUXILIARES PARA CONTENIDO MULTILINGÜE
-- ================================================

-- Función para obtener texto localizado de productos
CREATE OR REPLACE FUNCTION get_localized_product_text(
  product_id UUID,
  locale TEXT DEFAULT 'es'
)
RETURNS TABLE (
  name TEXT,
  description TEXT,
  material TEXT,
  slug TEXT
) AS $$
BEGIN
  IF locale = 'en' THEN
    RETURN QUERY
    SELECT 
      p.name_en,
      p.description_en,
      p.material_en,
      p.slug_en
    FROM public.products p
    WHERE p.id = product_id;
  ELSE
    RETURN QUERY
    SELECT 
      p.name_es,
      p.description_es,
      p.material_es,
      p.slug_es
    FROM public.products p
    WHERE p.id = product_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener texto localizado de categorías
CREATE OR REPLACE FUNCTION get_localized_category_text(
  category_id UUID,
  locale TEXT DEFAULT 'es'
)
RETURNS TABLE (
  name TEXT,
  description TEXT,
  slug TEXT
) AS $$
BEGIN
  IF locale = 'en' THEN
    RETURN QUERY
    SELECT 
      c.name_en,
      c.description_en,
      c.slug_en
    FROM public.product_categories c
    WHERE c.id = category_id;
  ELSE
    RETURN QUERY
    SELECT 
      c.name_es,
      c.description_es,
      c.slug_es
    FROM public.product_categories c
    WHERE c.id = category_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- VERIFICACIÓN FINAL
-- ================================================

-- Verificar que las columnas se agregaron correctamente
SELECT 
  'product_categories' as table_name,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name = 'product_categories' 
AND column_name LIKE '%_es' OR column_name LIKE '%_en'
ORDER BY column_name;

SELECT 
  'products' as table_name,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name LIKE '%_es' OR column_name LIKE '%_en'
ORDER BY column_name;

SELECT 
  'blog_categories' as table_name,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name = 'blog_categories' 
AND column_name LIKE '%_es' OR column_name LIKE '%_en'
ORDER BY column_name;

SELECT 
  'blog_posts' as table_name,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name = 'blog_posts' 
AND column_name LIKE '%_es' OR column_name LIKE '%_en'
ORDER BY column_name;
