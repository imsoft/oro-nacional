-- ============================================
-- MIGRACIÓN: Agregar soporte de idiomas disponibles
-- ============================================
-- Este script agrega la columna available_languages a las tablas
-- blog_posts y products para controlar en qué idiomas se muestra el contenido

-- ============================================
-- BLOG POSTS
-- ============================================

-- Verificar si la columna existe en blog_posts
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_name = 'blog_posts'
        AND column_name = 'available_languages'
    ) THEN
        -- Agregar columna si no existe
        ALTER TABLE blog_posts
        ADD COLUMN available_languages TEXT[] DEFAULT ARRAY['es', 'en'];

        RAISE NOTICE 'Columna available_languages agregada a blog_posts';
    ELSE
        RAISE NOTICE 'La columna available_languages ya existe en blog_posts';
    END IF;
END $$;

-- Actualizar posts existentes que tengan NULL
UPDATE blog_posts
SET available_languages = ARRAY['es', 'en']
WHERE available_languages IS NULL;

-- ============================================
-- PRODUCTS
-- ============================================

-- Verificar si la columna existe en products
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_name = 'products'
        AND column_name = 'available_languages'
    ) THEN
        -- Agregar columna si no existe
        ALTER TABLE products
        ADD COLUMN available_languages TEXT[] DEFAULT ARRAY['es', 'en'];

        RAISE NOTICE 'Columna available_languages agregada a products';
    ELSE
        RAISE NOTICE 'La columna available_languages ya existe en products';
    END IF;
END $$;

-- Actualizar productos existentes que tengan NULL
UPDATE products
SET available_languages = ARRAY['es', 'en']
WHERE available_languages IS NULL;

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Verificar que todo esté correcto
SELECT
    'blog_posts' as tabla,
    COUNT(*) as total_registros,
    COUNT(CASE WHEN available_languages IS NULL THEN 1 END) as con_null,
    COUNT(CASE WHEN available_languages = ARRAY['es', 'en'] THEN 1 END) as con_ambos_idiomas,
    COUNT(CASE WHEN available_languages = ARRAY['es'] THEN 1 END) as solo_espanol,
    COUNT(CASE WHEN available_languages = ARRAY['en'] THEN 1 END) as solo_ingles
FROM blog_posts

UNION ALL

SELECT
    'products' as tabla,
    COUNT(*) as total_registros,
    COUNT(CASE WHEN available_languages IS NULL THEN 1 END) as con_null,
    COUNT(CASE WHEN available_languages = ARRAY['es', 'en'] THEN 1 END) as con_ambos_idiomas,
    COUNT(CASE WHEN available_languages = ARRAY['es'] THEN 1 END) as solo_espanol,
    COUNT(CASE WHEN available_languages = ARRAY['en'] THEN 1 END) as solo_ingles
FROM products;
