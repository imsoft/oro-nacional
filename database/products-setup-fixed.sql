-- ============================================
-- PRODUCTOS SETUP CORREGIDO - ORO NACIONAL
-- ============================================
-- Script corregido para evitar recursión infinita
-- Cambia 'role' por 'type' en todas las políticas

-- 1. Crear tabla de categorías de productos
CREATE TABLE IF NOT EXISTS public.product_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Crear tabla de productos
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

-- 3. Crear tabla de imágenes de productos
CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  display_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Crear tabla de especificaciones de productos
CREATE TABLE IF NOT EXISTS public.product_specifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  spec_key TEXT NOT NULL,
  spec_value TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Crear tabla de tallas/tamaños disponibles
CREATE TABLE IF NOT EXISTS public.product_sizes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  size TEXT NOT NULL,
  stock INTEGER DEFAULT 0 CHECK (stock >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, size)
);

-- 6. Habilitar Row Level Security (RLS)
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_specifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_sizes ENABLE ROW LEVEL SECURITY;

-- 7. Políticas de seguridad para categorías (CORREGIDAS)

-- Todos pueden ver categorías
CREATE POLICY "Anyone can view categories"
  ON public.product_categories
  FOR SELECT
  USING (true);

-- Solo admins pueden insertar categorías (CORREGIDO: role -> type)
CREATE POLICY "Only admins can insert categories"
  ON public.product_categories
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND type = 'admin'
    )
  );

-- Solo admins pueden actualizar categorías (CORREGIDO: role -> type)
CREATE POLICY "Only admins can update categories"
  ON public.product_categories
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND type = 'admin'
    )
  );

-- Solo admins pueden eliminar categorías (CORREGIDO: role -> type)
CREATE POLICY "Only admins can delete categories"
  ON public.product_categories
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND type = 'admin'
    )
  );

-- 8. Políticas de seguridad para productos (CORREGIDAS)

-- Todos pueden ver productos activos
CREATE POLICY "Anyone can view active products"
  ON public.products
  FOR SELECT
  USING (is_active = true OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND type = 'admin'
  ));

-- Solo admins pueden insertar productos (CORREGIDO: role -> type)
CREATE POLICY "Only admins can insert products"
  ON public.products
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND type = 'admin'
    )
  );

-- Solo admins pueden actualizar productos (CORREGIDO: role -> type)
CREATE POLICY "Only admins can update products"
  ON public.products
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND type = 'admin'
    )
  );

-- Solo admins pueden eliminar productos (CORREGIDO: role -> type)
CREATE POLICY "Only admins can delete products"
  ON public.products
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND type = 'admin'
    )
  );

-- 9. Políticas de seguridad para imágenes de productos (CORREGIDAS)

-- Todos pueden ver imágenes de productos activos
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

-- Solo admins pueden insertar imágenes (CORREGIDO: role -> type)
CREATE POLICY "Only admins can insert product images"
  ON public.product_images
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND type = 'admin'
    )
  );

-- Solo admins pueden actualizar imágenes (CORREGIDO: role -> type)
CREATE POLICY "Only admins can update product images"
  ON public.product_images
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND type = 'admin'
    )
  );

-- Solo admins pueden eliminar imágenes (CORREGIDO: role -> type)
CREATE POLICY "Only admins can delete product images"
  ON public.product_images
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND type = 'admin'
    )
  );

-- 10. Políticas de seguridad para especificaciones (CORREGIDAS)

-- Todos pueden ver especificaciones de productos activos
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

-- Solo admins pueden gestionar especificaciones (CORREGIDO: role -> type)
CREATE POLICY "Only admins can manage product specifications"
  ON public.product_specifications
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND type = 'admin'
    )
  );

-- 11. Políticas de seguridad para tallas (CORREGIDAS)

-- Todos pueden ver tallas de productos activos
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

-- Solo admins pueden gestionar tallas (CORREGIDO: role -> type)
CREATE POLICY "Only admins can manage product sizes"
  ON public.product_sizes
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND type = 'admin'
    )
  );

-- 12. Crear función para actualizar updated_at
CREATE OR REPLACE FUNCTION public.handle_product_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 13. Triggers para updated_at
DROP TRIGGER IF EXISTS on_product_category_updated ON public.product_categories;
CREATE TRIGGER on_product_category_updated
  BEFORE UPDATE ON public.product_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_product_updated_at();

DROP TRIGGER IF EXISTS on_product_updated ON public.products;
CREATE TRIGGER on_product_updated
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_product_updated_at();

-- 14. Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON public.product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_specs_product_id ON public.product_specifications(product_id);
CREATE INDEX IF NOT EXISTS idx_product_sizes_product_id ON public.product_sizes(product_id);

-- 15. Insertar categorías iniciales
INSERT INTO public.product_categories (name, slug, description) VALUES
  ('Anillos', 'anillos', 'Anillos de oro para toda ocasión'),
  ('Collares', 'collares', 'Collares y cadenas de oro'),
  ('Aretes', 'aretes', 'Aretes de oro y piedras preciosas'),
  ('Pulseras', 'pulseras', 'Pulseras y brazaletes de oro'),
  ('Dijes', 'dijes', 'Dijes y medallas de oro'),
  ('Relojes', 'relojes', 'Relojes de oro y lujo')
ON CONFLICT (slug) DO NOTHING;
