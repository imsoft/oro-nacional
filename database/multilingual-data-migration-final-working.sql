-- ================================================
-- SCRIPT DE MIGRACIÓN DE DATOS MULTILINGÜES (VERSIÓN FINAL CORREGIDA)
-- ================================================
-- Este script actualiza los datos existentes con contenido en inglés

-- ================================================
-- 1. ACTUALIZAR PRODUCTOS CON CONTENIDO EN INGLÉS
-- ================================================

-- Actualizar productos existentes con traducciones al inglés
UPDATE public.products 
SET 
  name_en = CASE 
    WHEN slug_es = 'anillo-compromiso-solitario-diamante' THEN 'Solitario Diamond Engagement Ring'
    WHEN slug_es = 'anillo-fashion-flores-zirconias' THEN 'Fashion Flower Ring with Zirconias'
    WHEN slug_es = 'anillo-infinito-diamantes' THEN 'Infinity Ring with Diamonds'
    WHEN slug_es = 'argolla-matrimonio-lisa-oro-amarillo' THEN 'Plain Yellow Gold Wedding Band'
    WHEN slug_es = 'aretes-aro-medianos-oro-rosa' THEN 'Medium Hoop Earrings Rose Gold'
    WHEN slug_es = 'aretes-dormilonas-diamante-025ct' THEN 'Diamond Stud Earrings 0.25ct'
    WHEN slug_es = 'aretes-largos-cascada-zirconias' THEN 'Long Cascade Earrings with Zirconias'
    WHEN slug_es = 'cadena-cartier-oro-amarillo-60cm' THEN 'Cartier Chain Yellow Gold 60cm'
    WHEN slug_es = 'collar-corazon-zirconia-central' THEN 'Heart Necklace with Central Zirconia'
    WHEN slug_es = 'gargantilla-moderna-oro-blanco' THEN 'Modern Choker White Gold'
    WHEN slug_es = 'esclava-lisa-tradicional-oro-amarillo' THEN 'Traditional Plain Bracelet Yellow Gold'
    WHEN slug_es = 'pulsera-charm-oro-rosa-dijes' THEN 'Charm Bracelet Rose Gold with Charms'
    WHEN slug_es = 'pulsera-tejida-artesanal-oro-dos-tonos' THEN 'Handwoven Artisan Bracelet Two-Tone Gold'
    ELSE name_en
  END,
  description_en = CASE 
    WHEN slug_es = 'anillo-compromiso-solitario-diamante' THEN 'Elegant solitaire engagement ring featuring a brilliant diamond in 18k yellow gold. Perfect for proposals and special moments.'
    WHEN slug_es = 'anillo-fashion-flores-zirconias' THEN 'Stylish fashion ring with floral design adorned with zirconias. Perfect for everyday wear and special occasions.'
    WHEN slug_es = 'anillo-infinito-diamantes' THEN 'Symbolic infinity ring with small diamonds representing eternal love. Crafted in 18k gold with exquisite detail.'
    WHEN slug_es = 'argolla-matrimonio-lisa-oro-amarillo' THEN 'Classic plain wedding band in 18k yellow gold. Timeless design for your special day.'
    WHEN slug_es = 'aretes-aro-medianos-oro-rosa' THEN 'Elegant medium-sized hoop earrings in 18k rose gold. Perfect for both casual and formal occasions.'
    WHEN slug_es = 'aretes-dormilonas-diamante-025ct' THEN 'Sophisticated diamond stud earrings with 0.25ct diamonds. Set in 18k gold for maximum brilliance.'
    WHEN slug_es = 'aretes-largos-cascada-zirconias' THEN 'Dramatic long cascade earrings with zirconias. Perfect for evening events and special occasions.'
    WHEN slug_es = 'cadena-cartier-oro-amarillo-60cm' THEN 'Luxurious Cartier-style chain in 18k yellow gold. 60cm length perfect for layering or wearing alone.'
    WHEN slug_es = 'collar-corazon-zirconia-central' THEN 'Romantic heart necklace with central zirconia. Symbol of love and affection in 18k gold.'
    WHEN slug_es = 'gargantilla-moderna-oro-blanco' THEN 'Contemporary choker design in 18k white gold. Modern elegance for the sophisticated woman.'
    WHEN slug_es = 'esclava-lisa-tradicional-oro-amarillo' THEN 'Traditional plain bracelet in 18k yellow gold. Classic design that never goes out of style.'
    WHEN slug_es = 'pulsera-charm-oro-rosa-dijes' THEN 'Charming bracelet in 18k rose gold with decorative charms. Personalize with meaningful symbols.'
    WHEN slug_es = 'pulsera-tejida-artesanal-oro-dos-tonos' THEN 'Handcrafted woven bracelet in two-tone gold. Artisan technique creating unique texture and beauty.'
    ELSE description_en
  END,
  material_en = CASE 
    WHEN material_es LIKE '%18k%' THEN '18k Gold'
    WHEN material_es LIKE '%14k%' THEN '14k Gold'
    WHEN material_es LIKE '%Oro Amarillo%' THEN 'Yellow Gold'
    WHEN material_es LIKE '%Oro Rosa%' THEN 'Rose Gold'
    WHEN material_es LIKE '%Oro Blanco%' THEN 'White Gold'
    WHEN material_es LIKE '%Diamante%' THEN 'Diamond'
    WHEN material_es LIKE '%Zirconia%' THEN 'Zirconia'
    ELSE material_en
  END
WHERE name_en = name_es; -- Solo actualizar si aún no se ha traducido

-- ================================================
-- 2. ACTUALIZAR ESPECIFICACIONES DE PRODUCTOS
-- ================================================

-- Actualizar especificaciones comunes
UPDATE public.product_specifications 
SET 
  spec_key_en = CASE 
    WHEN spec_key_es = 'Material' THEN 'Material'
    WHEN spec_key_es = 'Quilates' THEN 'Carats'
    WHEN spec_key_es = 'Peso' THEN 'Weight'
    WHEN spec_key_es = 'Talla' THEN 'Size'
    WHEN spec_key_es = 'Color' THEN 'Color'
    WHEN spec_key_es = 'Claridad' THEN 'Clarity'
    WHEN spec_key_es = 'Corte' THEN 'Cut'
    WHEN spec_key_es = 'Garantía' THEN 'Warranty'
    WHEN spec_key_es = 'Certificado' THEN 'Certificate'
    ELSE spec_key_en
  END,
  spec_value_en = CASE 
    WHEN spec_value_es LIKE '%18k%' THEN '18k Gold'
    WHEN spec_value_es LIKE '%14k%' THEN '14k Gold'
    WHEN spec_value_es LIKE '%Oro Amarillo%' THEN 'Yellow Gold'
    WHEN spec_value_es LIKE '%Oro Rosa%' THEN 'Rose Gold'
    WHEN spec_value_es LIKE '%Oro Blanco%' THEN 'White Gold'
    WHEN spec_value_es LIKE '%Diamante%' THEN 'Diamond'
    WHEN spec_value_es LIKE '%Zirconia%' THEN 'Zirconia'
    WHEN spec_value_es LIKE '%ct%' THEN spec_value_es -- Mantener quilates
    WHEN spec_value_es LIKE '%gramos%' THEN REPLACE(spec_value_es, 'gramos', 'grams')
    WHEN spec_value_es LIKE '%cm%' THEN spec_value_es -- Mantener centímetros
    ELSE spec_value_en
  END
WHERE spec_key_en = spec_key_es; -- Solo actualizar si aún no se ha traducido

-- ================================================
-- 3. CREAR CATEGORÍAS DE BLOG SI NO EXISTEN
-- ================================================

DO $$
BEGIN
    -- Crear categoría de cuidados si no existe
    IF NOT EXISTS (SELECT 1 FROM public.blog_categories WHERE slug = 'cuidados') THEN
        INSERT INTO public.blog_categories (
            name, slug, description,
            name_es, name_en, slug_es, slug_en, description_es, description_en,
            created_at, updated_at
        ) VALUES (
            'Cuidados', 'cuidados', 'Consejos para el cuidado de joyería',
            'Cuidados', 'Care', 'cuidados', 'care', 
            'Consejos para el cuidado de joyería', 'Jewelry care tips',
            NOW(), NOW()
        );
    END IF;
    
    -- Crear categoría de tendencias si no existe
    IF NOT EXISTS (SELECT 1 FROM public.blog_categories WHERE slug = 'tendencias') THEN
        INSERT INTO public.blog_categories (
            name, slug, description,
            name_es, name_en, slug_es, slug_en, description_es, description_en,
            created_at, updated_at
        ) VALUES (
            'Tendencias', 'tendencias', 'Últimas tendencias en joyería',
            'Tendencias', 'Trends', 'tendencias', 'trends',
            'Últimas tendencias en joyería', 'Latest jewelry trends',
            NOW(), NOW()
        );
    END IF;
END $$;

-- ================================================
-- 4. CREAR ETIQUETAS DE BLOG CORRECTAMENTE
-- ================================================

DO $$
BEGIN
    -- Crear etiquetas una por una con todas las columnas requeridas
    IF NOT EXISTS (SELECT 1 FROM public.blog_tags WHERE slug = 'cuidados') THEN
        INSERT INTO public.blog_tags (name, slug, name_es, name_en, slug_es, slug_en, created_at) 
        VALUES ('Cuidados', 'cuidados', 'Cuidados', 'Care', 'cuidados', 'care', NOW());
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM public.blog_tags WHERE slug = 'tendencias') THEN
        INSERT INTO public.blog_tags (name, slug, name_es, name_en, slug_es, slug_en, created_at) 
        VALUES ('Tendencias', 'tendencias', 'Tendencias', 'Trends', 'tendencias', 'trends', NOW());
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM public.blog_tags WHERE slug = 'oro') THEN
        INSERT INTO public.blog_tags (name, slug, name_es, name_en, slug_es, slug_en, created_at) 
        VALUES ('Oro', 'oro', 'Oro', 'Gold', 'oro', 'gold', NOW());
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM public.blog_tags WHERE slug = 'educacion') THEN
        INSERT INTO public.blog_tags (name, slug, name_es, name_en, slug_es, slug_en, created_at) 
        VALUES ('Educación', 'educacion', 'Educación', 'Education', 'educacion', 'education', NOW());
    END IF;
END $$;

-- ================================================
-- 5. CREAR POSTS DE BLOG SIN AUTHOR_ID (NULL)
-- ================================================

DO $$
DECLARE
    care_category_id UUID;
    trends_category_id UUID;
BEGIN
    -- Obtener IDs de categorías
    SELECT id INTO care_category_id FROM public.blog_categories WHERE slug = 'cuidados';
    SELECT id INTO trends_category_id FROM public.blog_categories WHERE slug = 'tendencias';
    
    -- Crear primer post si no existe (sin author_id para evitar foreign key error)
    IF NOT EXISTS (SELECT 1 FROM public.blog_posts WHERE slug = 'guia-cuidado-joyeria-oro') THEN
        INSERT INTO public.blog_posts (
            title, slug, excerpt, content, featured_image, status, views, published_at, 
            created_at, updated_at, author_id, category_id,
            title_es, title_en, slug_es, slug_en, excerpt_es, excerpt_en, content_es, content_en
        ) VALUES (
            'Guía Completa para el Cuidado de Joyería de Oro',
            'guia-cuidado-joyeria-oro',
            'Aprende cómo mantener tu joyería de oro en perfecto estado con estos consejos profesionales.',
            'El oro es un metal precioso que requiere cuidados especiales para mantener su brillo y belleza. En esta guía completa, te enseñamos todo lo que necesitas saber sobre el cuidado de tu joyería de oro.

## Limpieza Regular

La limpieza regular es fundamental para mantener el brillo de tu joyería. Utiliza agua tibia y jabón suave, evitando productos químicos agresivos.

## Almacenamiento Correcto

Guarda tu joyería en un lugar seco y alejado de la luz directa. Usa bolsas de tela suave o cajas forradas para evitar rayones.

## Evita Productos Químicos

Perfumes, lociones y productos de limpieza pueden dañar el oro. Siempre ponte la joyería después de aplicar estos productos.',
            'https://example.com/gold-care-guide.jpg',
            'published',
            0,
            NOW(),
            NOW(),
            NOW(),
            NULL, -- Sin author_id para evitar foreign key error
            care_category_id,
            'Guía Completa para el Cuidado de Joyería de Oro',
            'Complete Guide to Gold Jewelry Care',
            'guia-cuidado-joyeria-oro',
            'complete-guide-gold-jewelry-care',
            'Aprende cómo mantener tu joyería de oro en perfecto estado con estos consejos profesionales.',
            'Learn how to keep your gold jewelry in perfect condition with these professional tips.',
            'El oro es un metal precioso que requiere cuidados especiales para mantener su brillo y belleza. En esta guía completa, te enseñamos todo lo que necesitas saber sobre el cuidado de tu joyería de oro.

## Limpieza Regular

La limpieza regular es fundamental para mantener el brillo de tu joyería. Utiliza agua tibia y jabón suave, evitando productos químicos agresivos.

## Almacenamiento Correcto

Guarda tu joyería en un lugar seco y alejado de la luz directa. Usa bolsas de tela suave o cajas forradas para evitar rayones.

## Evita Productos Químicos

Perfumes, lociones y productos de limpieza pueden dañar el oro. Siempre ponte la joyería después de aplicar estos productos.',
            'Gold is a precious metal that requires special care to maintain its shine and beauty. In this complete guide, we teach you everything you need to know about caring for your gold jewelry.

## Regular Cleaning

Regular cleaning is essential to maintain the shine of your jewelry. Use warm water and mild soap, avoiding aggressive chemical products.

## Proper Storage

Store your jewelry in a dry place away from direct light. Use soft cloth bags or lined boxes to avoid scratches.

## Avoid Chemicals

Perfumes, lotions, and cleaning products can damage gold. Always put on jewelry after applying these products.'
        );
    END IF;
    
    -- Crear segundo post si no existe (sin author_id para evitar foreign key error)
    IF NOT EXISTS (SELECT 1 FROM public.blog_posts WHERE slug = 'tendencias-joyeria-2025') THEN
        INSERT INTO public.blog_posts (
            title, slug, excerpt, content, featured_image, status, views, published_at, 
            created_at, updated_at, author_id, category_id,
            title_es, title_en, slug_es, slug_en, excerpt_es, excerpt_en, content_es, content_en
        ) VALUES (
            'Tendencias en Joyería para 2025',
            'tendencias-joyeria-2025',
            'Descubre las últimas tendencias en joyería que marcarán el 2025.',
            'El mundo de la joyería está en constante evolución, y 2025 promete traer innovaciones emocionantes. Te presentamos las tendencias que dominarán el mercado este año.

## Oro Rosa y Amarillo

Los tonos cálidos del oro siguen siendo protagonistas, especialmente el oro rosa que aporta elegancia y modernidad.

## Diseños Minimalistas

La simplicidad y elegancia de los diseños minimalistas continúan ganando terreno en el mercado de la joyería fina.',
            'https://example.com/jewelry-trends-2025.jpg',
            'published',
            0,
            NOW(),
            NOW(),
            NOW(),
            NULL, -- Sin author_id para evitar foreign key error
            trends_category_id,
            'Tendencias en Joyería para 2025',
            'Jewelry Trends for 2025',
            'tendencias-joyeria-2025',
            'jewelry-trends-2025',
            'Descubre las últimas tendencias en joyería que marcarán el 2025.',
            'Discover the latest jewelry trends that will define 2025.',
            'El mundo de la joyería está en constante evolución, y 2025 promete traer innovaciones emocionantes. Te presentamos las tendencias que dominarán el mercado este año.

## Oro Rosa y Amarillo

Los tonos cálidos del oro siguen siendo protagonistas, especialmente el oro rosa que aporta elegancia y modernidad.

## Diseños Minimalistas

La simplicidad y elegancia de los diseños minimalistas continúan ganando terreno en el mercado de la joyería fina.',
            'The world of jewelry is constantly evolving, and 2025 promises to bring exciting innovations. We present you the trends that will dominate the market this year.

## Rose and Yellow Gold

Warm gold tones continue to be protagonists, especially rose gold which brings elegance and modernity.

## Minimalist Designs

The simplicity and elegance of minimalist designs continue to gain ground in the fine jewelry market.'
        );
    END IF;
END $$;

-- ================================================
-- 6. ASOCIAR ETIQUETAS CON POSTS DE BLOG
-- ================================================

-- Asociar etiquetas con posts (solo si no existen las asociaciones)
INSERT INTO public.blog_post_tags (post_id, tag_id)
SELECT 
  bp.id,
  bt.id
FROM public.blog_posts bp
CROSS JOIN public.blog_tags bt
WHERE bp.slug = 'guia-cuidado-joyeria-oro'
AND bt.slug IN ('cuidados', 'oro', 'educacion')
AND NOT EXISTS (
  SELECT 1 FROM public.blog_post_tags bpt 
  WHERE bpt.post_id = bp.id AND bpt.tag_id = bt.id
);

INSERT INTO public.blog_post_tags (post_id, tag_id)
SELECT 
  bp.id,
  bt.id
FROM public.blog_posts bp
CROSS JOIN public.blog_tags bt
WHERE bp.slug = 'tendencias-joyeria-2025'
AND bt.slug IN ('tendencias', 'oro')
AND NOT EXISTS (
  SELECT 1 FROM public.blog_post_tags bpt 
  WHERE bpt.post_id = bp.id AND bpt.tag_id = bt.id
);

-- ================================================
-- 7. VERIFICACIÓN FINAL
-- ================================================

-- Verificar productos con contenido en inglés
SELECT 
  'Products with English content' as check_type,
  COUNT(*) as count
FROM public.products 
WHERE name_en IS NOT NULL AND name_en != name_es;

-- Verificar categorías con contenido en inglés
SELECT 
  'Categories with English content' as check_type,
  COUNT(*) as count
FROM public.product_categories 
WHERE name_en IS NOT NULL AND name_en != name_es;

-- Verificar posts de blog con contenido en inglés
SELECT 
  'Blog posts with English content' as check_type,
  COUNT(*) as count
FROM public.blog_posts 
WHERE title_en IS NOT NULL AND title_en != title_es;

-- Verificar etiquetas de blog con contenido en inglés
SELECT 
  'Blog tags with English content' as check_type,
  COUNT(*) as count
FROM public.blog_tags 
WHERE name_en IS NOT NULL AND name_en != name_es;

-- Verificar categorías de blog con contenido en inglés
SELECT 
  'Blog categories with English content' as check_type,
  COUNT(*) as count
FROM public.blog_categories 
WHERE name_en IS NOT NULL AND name_en != name_es;

-- Mostrar algunos ejemplos de productos traducidos
SELECT 
  name_es,
  name_en,
  material_es,
  material_en
FROM public.products 
WHERE name_en IS NOT NULL AND name_en != name_es
LIMIT 5;

-- Mostrar algunos ejemplos de posts de blog traducidos
SELECT 
  title_es,
  title_en,
  slug_es,
  slug_en
FROM public.blog_posts 
WHERE title_en IS NOT NULL AND title_en != title_es
LIMIT 3;

-- Mostrar estructura de las tablas para verificar
SELECT 
  'blog_tags structure' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'blog_tags' 
ORDER BY ordinal_position;
