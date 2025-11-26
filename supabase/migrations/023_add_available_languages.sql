-- Migration: Add Available Languages Support
-- Description: Add available_languages column to blog_posts and products tables
-- Version: 023
-- Created: 2025-01-XX

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

