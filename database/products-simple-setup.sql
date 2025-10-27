-- ============================================
-- SCRIPT SIMPLIFICADO - SOLO TABLAS BÁSICAS
-- ============================================
-- Este script crea solo las tablas sin políticas RLS
-- Para evitar problemas de permisos

-- ============================================
-- CREAR TABLAS BÁSICAS
-- ============================================

-- 1. Categorías de productos
CREATE TABLE IF NOT EXISTS public.product_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Productos
CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  category_id UUID REFERENCES public.product_categories(id) ON DELETE SET NULL,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  material TEXT NOT NULL,
  weight DECIMAL(8, 2),
  has_engraving BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Imágenes de productos
CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  display_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Especificaciones de productos
CREATE TABLE IF NOT EXISTS public.product_specifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  spec_key TEXT NOT NULL,
  spec_value TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tallas de productos
CREATE TABLE IF NOT EXISTS public.product_sizes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  size TEXT NOT NULL,
  stock INTEGER DEFAULT 0 CHECK (stock >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, size)
);

-- ============================================
-- CREAR ÍNDICES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON public.product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_specs_product_id ON public.product_specifications(product_id);
CREATE INDEX IF NOT EXISTS idx_product_sizes_product_id ON public.product_sizes(product_id);

-- ============================================
-- INSERTAR DATOS INICIALES
-- ============================================

INSERT INTO public.product_categories (name, slug, description) VALUES
  ('Anillos', 'anillos', 'Anillos de oro para toda ocasión'),
  ('Collares', 'collares', 'Collares y cadenas de oro'),
  ('Aretes', 'aretes', 'Aretes de oro y piedras preciosas'),
  ('Pulseras', 'pulseras', 'Pulseras y brazaletes de oro'),
  ('Dijes', 'dijes', 'Dijes y medallas de oro'),
  ('Relojes', 'relojes', 'Relojes de oro y lujo')
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- INSERTAR PRODUCTOS DE EJEMPLO
-- ============================================

-- Anillo de ejemplo
INSERT INTO public.products (name, slug, description, category_id, price, stock, material, weight, has_engraving, is_active)
SELECT
  'Anillo de Compromiso Solitario Diamante',
  'anillo-compromiso-solitario-diamante',
  'Elegante anillo de compromiso con diamante de 0.50ct montado en oro blanco de 18k.',
  id,
  45999.00,
  5,
  'Oro blanco 18k',
  3.5,
  true,
  true
FROM public.product_categories WHERE slug = 'anillos'
ON CONFLICT (slug) DO NOTHING;

-- Collar de ejemplo
INSERT INTO public.products (name, slug, description, category_id, price, stock, material, weight, has_engraving, is_active)
SELECT
  'Cadena Cartier Oro Amarillo 60cm',
  'cadena-cartier-oro-amarillo-60cm',
  'Elegante cadena tipo Cartier en oro amarillo de 14k. Longitud de 60cm.',
  id,
  24999.00,
  10,
  'Oro amarillo 14k',
  15.5,
  false,
  true
FROM public.product_categories WHERE slug = 'collares'
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Verificar tablas creadas
SELECT 'Tablas creadas:' as status;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'product%'
ORDER BY table_name;

-- Verificar categorías
SELECT 'Categorías:' as status;
SELECT name, slug FROM public.product_categories ORDER BY name;

-- Verificar productos
SELECT 'Productos:' as status;
SELECT p.name, p.price, c.name as category
FROM public.products p
JOIN public.product_categories c ON p.category_id = c.id
ORDER BY c.name, p.name;
