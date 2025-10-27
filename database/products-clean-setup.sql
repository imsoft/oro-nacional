-- ============================================
-- SCRIPT DE LIMPIEZA Y CREACIÓN COMPLETA
-- ============================================
-- Este script limpia cualquier residuo y crea todo desde cero

-- ============================================
-- PASO 1: LIMPIAR POLÍTICAS EXISTENTES (si existen)
-- ============================================

-- Eliminar políticas de product_categories (si existen)
DROP POLICY IF EXISTS "Anyone can view categories" ON public.product_categories;
DROP POLICY IF EXISTS "Only admins can insert categories" ON public.product_categories;
DROP POLICY IF EXISTS "Only admins can update categories" ON public.product_categories;
DROP POLICY IF EXISTS "Only admins can delete categories" ON public.product_categories;

-- Eliminar políticas de products (si existen)
DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;
DROP POLICY IF EXISTS "Only admins can insert products" ON public.products;
DROP POLICY IF EXISTS "Only admins can update products" ON public.products;
DROP POLICY IF EXISTS "Only admins can delete products" ON public.products;

-- Eliminar políticas de product_images (si existen)
DROP POLICY IF EXISTS "Anyone can view product images" ON public.product_images;
DROP POLICY IF EXISTS "Only admins can insert product images" ON public.product_images;
DROP POLICY IF EXISTS "Only admins can update product images" ON public.product_images;
DROP POLICY IF EXISTS "Only admins can delete product images" ON public.product_images;

-- Eliminar políticas de product_specifications (si existen)
DROP POLICY IF EXISTS "Anyone can view product specifications" ON public.product_specifications;
DROP POLICY IF EXISTS "Only admins can manage product specifications" ON public.product_specifications;

-- Eliminar políticas de product_sizes (si existen)
DROP POLICY IF EXISTS "Anyone can view product sizes" ON public.product_sizes;
DROP POLICY IF EXISTS "Only admins can manage product sizes" ON public.product_sizes;

-- ============================================
-- PASO 2: ELIMINAR TABLAS EXISTENTES (si existen)
-- ============================================

-- Eliminar tablas en orden inverso (por las foreign keys)
DROP TABLE IF EXISTS public.product_sizes CASCADE;
DROP TABLE IF EXISTS public.product_specifications CASCADE;
DROP TABLE IF EXISTS public.product_images CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.product_categories CASCADE;

-- ============================================
-- PASO 3: CREAR TABLAS DESDE CERO
-- ============================================

-- 1. Crear tabla de categorías de productos
CREATE TABLE public.product_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Crear tabla de productos
CREATE TABLE public.products (
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

-- 3. Crear tabla de imágenes de productos
CREATE TABLE public.product_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  display_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Crear tabla de especificaciones de productos
CREATE TABLE public.product_specifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  spec_key TEXT NOT NULL,
  spec_value TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Crear tabla de tallas/tamaños disponibles
CREATE TABLE public.product_sizes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  size TEXT NOT NULL,
  stock INTEGER DEFAULT 0 CHECK (stock >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, size)
);

-- ============================================
-- PASO 4: HABILITAR RLS
-- ============================================

ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_specifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_sizes ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PASO 5: CREAR POLÍTICAS (CORREGIDAS)
-- ============================================

-- Políticas para categorías
CREATE POLICY "Anyone can view categories"
  ON public.product_categories
  FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert categories"
  ON public.product_categories
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND type = 'admin'
    )
  );

CREATE POLICY "Only admins can update categories"
  ON public.product_categories
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND type = 'admin'
    )
  );

CREATE POLICY "Only admins can delete categories"
  ON public.product_categories
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND type = 'admin'
    )
  );

-- Políticas para productos
CREATE POLICY "Anyone can view active products"
  ON public.products
  FOR SELECT
  USING (is_active = true OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND type = 'admin'
  ));

CREATE POLICY "Only admins can insert products"
  ON public.products
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND type = 'admin'
    )
  );

CREATE POLICY "Only admins can update products"
  ON public.products
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND type = 'admin'
    )
  );

CREATE POLICY "Only admins can delete products"
  ON public.products
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND type = 'admin'
    )
  );

-- Políticas para imágenes
CREATE POLICY "Anyone can view product images"
  ON public.product_images
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.products
      WHERE id = product_id AND (is_active = true OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND type = 'admin'
      ))
    )
  );

CREATE POLICY "Only admins can insert product images"
  ON public.product_images
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND type = 'admin'
    )
  );

CREATE POLICY "Only admins can update product images"
  ON public.product_images
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND type = 'admin'
    )
  );

CREATE POLICY "Only admins can delete product images"
  ON public.product_images
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND type = 'admin'
    )
  );

-- Políticas para especificaciones
CREATE POLICY "Anyone can view product specifications"
  ON public.product_specifications
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.products
      WHERE id = product_id AND (is_active = true OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND type = 'admin'
      ))
    )
  );

CREATE POLICY "Only admins can manage product specifications"
  ON public.product_specifications
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND type = 'admin'
    )
  );

-- Políticas para tallas
CREATE POLICY "Anyone can view product sizes"
  ON public.product_sizes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.products
      WHERE id = product_id AND (is_active = true OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND type = 'admin'
      ))
    )
  );

CREATE POLICY "Only admins can manage product sizes"
  ON public.product_sizes
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND type = 'admin'
    )
  );

-- ============================================
-- PASO 6: CREAR FUNCIONES Y TRIGGERS
-- ============================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION public.handle_product_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER on_product_category_updated
  BEFORE UPDATE ON public.product_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_product_updated_at();

CREATE TRIGGER on_product_updated
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_product_updated_at();

-- ============================================
-- PASO 7: CREAR ÍNDICES
-- ============================================

CREATE INDEX idx_products_slug ON public.products(slug);
CREATE INDEX idx_products_category ON public.products(category_id);
CREATE INDEX idx_products_active ON public.products(is_active);
CREATE INDEX idx_product_images_product_id ON public.product_images(product_id);
CREATE INDEX idx_product_specs_product_id ON public.product_specifications(product_id);
CREATE INDEX idx_product_sizes_product_id ON public.product_sizes(product_id);

-- ============================================
-- PASO 8: INSERTAR DATOS INICIALES
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
-- VERIFICACIÓN FINAL
-- ============================================

-- Verificar que las tablas se crearon
SELECT 'Tablas creadas:' as status;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'product%'
ORDER BY table_name;

-- Verificar que las categorías se insertaron
SELECT 'Categorías insertadas:' as status;
SELECT name, slug FROM public.product_categories ORDER BY name;
