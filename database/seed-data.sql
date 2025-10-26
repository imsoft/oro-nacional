-- ============================================
-- DATOS SEED PARA ORO NACIONAL
-- ============================================
-- Este script inserta datos de ejemplo para productos y blog
-- Ejecuta este script DESPUÉS de ejecutar products-setup.sql y blog-setup.sql
-- Supabase SQL Editor -> New Query -> Pega este código -> Run

-- ============================================
-- SEED: CATEGORÍAS DE PRODUCTOS
-- ============================================
-- Las categorías ya están en products-setup.sql, pero aquí las actualizamos con imágenes

UPDATE public.product_categories
SET
  description = 'Anillos de compromiso, matrimonio y fashion en oro de 14k y 18k',
  image_url = 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800'
WHERE slug = 'anillos';

UPDATE public.product_categories
SET
  description = 'Collares y cadenas de oro para toda ocasión',
  image_url = 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800'
WHERE slug = 'collares';

UPDATE public.product_categories
SET
  description = 'Aretes de oro con diseños elegantes y modernos',
  image_url = 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800'
WHERE slug = 'aretes';

UPDATE public.product_categories
SET
  description = 'Esclavas, pulseras y brazaletes de oro artesanales',
  image_url = 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800'
WHERE slug = 'pulseras';

-- ============================================
-- SEED: PRODUCTOS - ANILLOS
-- ============================================

-- Anillo de Compromiso Solitario
INSERT INTO public.products (name, slug, description, category_id, price, stock, material, weight, has_engraving, is_active)
SELECT
  'Anillo de Compromiso Solitario Diamante',
  'anillo-compromiso-solitario-diamante',
  'Elegante anillo de compromiso con diamante de 0.50ct montado en oro blanco de 18k. Diseño clásico tipo solitario que realza el brillo de la piedra. Perfecto para ese momento especial.',
  id,
  45999.00,
  5,
  'Oro blanco 18k',
  3.5,
  true,
  true
FROM public.product_categories WHERE slug = 'anillos';

-- Anillo de Matrimonio Tradicional
INSERT INTO public.products (name, slug, description, category_id, price, stock, material, weight, has_engraving, is_active)
SELECT
  'Argolla de Matrimonio Lisa Oro Amarillo',
  'argolla-matrimonio-lisa-oro-amarillo',
  'Argolla de matrimonio tradicional en oro amarillo de 14k. Diseño liso y atemporal con acabado pulido. Ancho de 4mm, ideal para uso diario. Incluye grabado interno sin costo.',
  id,
  8999.00,
  15,
  'Oro amarillo 14k',
  4.2,
  true,
  true
FROM public.product_categories WHERE slug = 'anillos';

-- Anillo Fashion con Zirconia
INSERT INTO public.products (name, slug, description, category_id, price, stock, material, weight, has_engraving, is_active)
SELECT
  'Anillo Fashion Flores con Zirconias',
  'anillo-fashion-flores-zirconias',
  'Anillo de diseño moderno en oro rosa de 14k con detalle de flores y zirconias incrustadas. Perfecto para uso diario o eventos especiales. Diseño exclusivo de Oro Nacional.',
  id,
  12499.00,
  8,
  'Oro rosa 14k',
  3.8,
  false,
  true
FROM public.product_categories WHERE slug = 'anillos';

-- Anillo Infinity
INSERT INTO public.products (name, slug, description, category_id, price, stock, material, weight, has_engraving, is_active)
SELECT
  'Anillo Infinito con Diamantes',
  'anillo-infinito-diamantes',
  'Hermoso anillo con diseño de símbolo infinito adornado con pequeños diamantes. Oro amarillo de 18k. Representa el amor eterno, ideal como regalo romántico.',
  id,
  18999.00,
  6,
  'Oro amarillo 18k',
  4.1,
  true,
  true
FROM public.product_categories WHERE slug = 'anillos';

-- ============================================
-- SEED: PRODUCTOS - COLLARES
-- ============================================

-- Cadena Cartier
INSERT INTO public.products (name, slug, description, category_id, price, stock, material, weight, has_engraving, is_active)
SELECT
  'Cadena Cartier Oro Amarillo 60cm',
  'cadena-cartier-oro-amarillo-60cm',
  'Elegante cadena tipo Cartier en oro amarillo de 14k. Longitud de 60cm, perfecta para uso diario. Cierre de seguridad tipo mosquetón. Diseño clásico que nunca pasa de moda.',
  id,
  24999.00,
  10,
  'Oro amarillo 14k',
  15.5,
  false,
  true
FROM public.product_categories WHERE slug = 'collares';

-- Collar con Dije Corazón
INSERT INTO public.products (name, slug, description, category_id, price, stock, material, weight, has_engraving, is_active)
SELECT
  'Collar Corazón con Zirconia Central',
  'collar-corazon-zirconia-central',
  'Delicado collar con dije de corazón en oro rosa de 14k y zirconia central. Cadena de 45cm con ajuste a 40cm. Regalo perfecto para expresar amor y cariño.',
  id,
  9999.00,
  12,
  'Oro rosa 14k',
  2.8,
  false,
  true
FROM public.product_categories WHERE slug = 'collares';

-- Gargantilla Moderna
INSERT INTO public.products (name, slug, description, category_id, price, stock, material, weight, has_engraving, is_active)
SELECT
  'Gargantilla Moderna Oro Blanco',
  'gargantilla-moderna-oro-blanco',
  'Gargantilla contemporánea en oro blanco de 18k con diseño minimalista. Longitud ajustable de 35-40cm. Perfecta para estilo moderno y elegante.',
  id,
  16999.00,
  7,
  'Oro blanco 18k',
  8.2,
  false,
  true
FROM public.product_categories WHERE slug = 'collares';

-- ============================================
-- SEED: PRODUCTOS - ARETES
-- ============================================

-- Aretes Dormilonas con Diamante
INSERT INTO public.products (name, slug, description, category_id, price, stock, material, weight, has_engraving, is_active)
SELECT
  'Aretes Dormilonas Diamante 0.25ct',
  'aretes-dormilonas-diamante-025ct',
  'Clásicos aretes dormilonas con diamantes de 0.25ct cada uno. Oro blanco de 18k con cierre de seguridad. Elegancia atemporal para cualquier ocasión.',
  id,
  28999.00,
  6,
  'Oro blanco 18k',
  2.2,
  false,
  true
FROM public.product_categories WHERE slug = 'aretes';

-- Aretes Largos Modernos
INSERT INTO public.products (name, slug, description, category_id, price, stock, material, weight, has_engraving, is_active)
SELECT
  'Aretes Largos Cascada con Zirconias',
  'aretes-largos-cascada-zirconias',
  'Elegantes aretes largos tipo cascada con múltiples zirconias. Oro amarillo de 14k. Diseño moderno perfecto para eventos especiales y fiestas.',
  id,
  14999.00,
  8,
  'Oro amarillo 14k',
  4.5,
  false,
  true
FROM public.product_categories WHERE slug = 'aretes';

-- Aretes de Aro
INSERT INTO public.products (name, slug, description, category_id, price, stock, material, weight, has_engraving, is_active)
SELECT
  'Aretes de Aro Medianos Oro Rosa',
  'aretes-aro-medianos-oro-rosa',
  'Aretes de aro medianos de 3cm de diámetro en oro rosa de 14k. Diseño tubular con cierre de presión. Estilo versátil para uso diario o casual.',
  id,
  11999.00,
  10,
  'Oro rosa 14k',
  3.8,
  false,
  true
FROM public.product_categories WHERE slug = 'aretes';

-- ============================================
-- SEED: PRODUCTOS - PULSERAS/ESCLAVAS
-- ============================================

-- Esclava Clásica
INSERT INTO public.products (name, slug, description, category_id, price, stock, material, weight, has_engraving, is_active)
SELECT
  'Esclava Lisa Tradicional Oro Amarillo',
  'esclava-lisa-tradicional-oro-amarillo',
  'Esclava tradicional jalisciense en oro amarillo de 14k. Diseño liso y elegante con cierre de seguridad. Pieza artesanal que representa la tradición de Jalisco.',
  id,
  32999.00,
  5,
  'Oro amarillo 14k',
  22.5,
  true,
  true
FROM public.product_categories WHERE slug = 'pulseras';

-- Pulsera Tejida
INSERT INTO public.products (name, slug, description, category_id, price, stock, material, weight, has_engraving, is_active)
SELECT
  'Pulsera Tejida Artesanal Oro Dos Tonos',
  'pulsera-tejida-artesanal-dos-tonos',
  'Hermosa pulsera tejida a mano combinando oro amarillo y blanco de 14k. Técnica artesanal jalisciense. Diseño único y sofisticado. Longitud: 18cm.',
  id,
  25999.00,
  4,
  'Oro 14k dos tonos',
  18.8,
  false,
  true
FROM public.product_categories WHERE slug = 'pulseras';

-- Pulsera con Dijes
INSERT INTO public.products (name, slug, description, category_id, price, stock, material, weight, has_engraving, is_active)
SELECT
  'Pulsera Charm Oro Rosa con Dijes',
  'pulsera-charm-oro-rosa-dijes',
  'Pulsera tipo charm en oro rosa de 14k con 5 dijes intercambiables. Incluye corazón, estrella, infinito, ancla y llave. Cierre ajustable. Perfecta para personalizar.',
  id,
  19999.00,
  7,
  'Oro rosa 14k',
  12.3,
  false,
  true
FROM public.product_categories WHERE slug = 'pulseras';

-- ============================================
-- VERIFICACIÓN DE PRODUCTOS INSERTADOS
-- ============================================
-- Descomentar para verificar:
-- SELECT p.name, p.price, c.name as category
-- FROM public.products p
-- JOIN public.product_categories c ON p.category_id = c.id
-- ORDER BY c.name, p.name;

-- ============================================
-- SEED: CATEGORÍAS DE BLOG
-- ============================================
INSERT INTO public.blog_categories (name, slug, description) VALUES
  ('Guías de Compra', 'guias-de-compra', 'Consejos para elegir la joyería perfecta'),
  ('Cuidado de Joyas', 'cuidado-de-joyas', 'Tips para mantener tus joyas como nuevas'),
  ('Tendencias', 'tendencias', 'Las últimas tendencias en joyería'),
  ('Historia y Cultura', 'historia-y-cultura', 'La tradición jalisciense en joyería'),
  ('Eventos Especiales', 'eventos-especiales', 'Joyería para bodas, compromisos y más')
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- NOTAS IMPORTANTES
-- ============================================
--
-- 1. Las imágenes de productos usan URLs de Unsplash como placeholder
--    Deberás reemplazarlas con las URLs de tu bucket de Supabase Storage
--
-- 2. Para agregar imágenes a los productos, usa:
--    INSERT INTO public.product_images (product_id, image_url, alt_text, is_primary)
--    VALUES ('uuid-del-producto', 'url-de-la-imagen', 'texto-alt', true);
--
-- 3. Para agregar especificaciones:
--    INSERT INTO public.product_specifications (product_id, spec_key, spec_value)
--    VALUES ('uuid-del-producto', 'Quilates', '14k');
--
-- 4. Para agregar tallas (para anillos):
--    INSERT INTO public.product_sizes (product_id, size, stock)
--    VALUES ('uuid-del-producto', '6', 2);
--
-- 5. Los precios son en pesos mexicanos (MXN)
--
-- 6. Para crear posts de blog, necesitarás el author_id de un perfil admin
--
-- ============================================
