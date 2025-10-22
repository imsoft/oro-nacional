-- ================================================
-- BLOG SYSTEM SETUP
-- ================================================
-- Este script configura las tablas necesarias para el sistema de blog
-- Ejecutar en Supabase SQL Editor

-- ================================================
-- 1. TABLA DE CATEGORÍAS DE BLOG
-- ================================================
CREATE TABLE IF NOT EXISTS public.blog_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- 2. TABLA DE POSTS DE BLOG
-- ================================================
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image TEXT,
  category_id UUID REFERENCES public.blog_categories(id) ON DELETE SET NULL,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  views INTEGER DEFAULT 0 CHECK (views >= 0),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- 3. TABLA DE ETIQUETAS
-- ================================================
CREATE TABLE IF NOT EXISTS public.blog_tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- 4. TABLA DE RELACIÓN POST-ETIQUETAS
-- ================================================
CREATE TABLE IF NOT EXISTS public.blog_post_tags (
  post_id UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.blog_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- 5. ÍNDICES PARA MEJORAR RENDIMIENTO
-- ================================================
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_author ON public.blog_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON public.blog_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON public.blog_posts(published_at);
CREATE INDEX IF NOT EXISTS idx_blog_categories_slug ON public.blog_categories(slug);
CREATE INDEX IF NOT EXISTS idx_blog_tags_slug ON public.blog_tags(slug);

-- ================================================
-- 6. TRIGGER PARA ACTUALIZAR updated_at
-- ================================================
CREATE OR REPLACE FUNCTION update_blog_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_blog_updated_at();

CREATE TRIGGER update_blog_categories_updated_at
  BEFORE UPDATE ON public.blog_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_blog_updated_at();

-- ================================================
-- 7. ROW LEVEL SECURITY (RLS)
-- ================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_post_tags ENABLE ROW LEVEL SECURITY;

-- Políticas para blog_categories
CREATE POLICY "Cualquiera puede ver categorías" ON public.blog_categories
  FOR SELECT USING (true);

CREATE POLICY "Solo admins pueden insertar categorías" ON public.blog_categories
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Solo admins pueden actualizar categorías" ON public.blog_categories
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Solo admins pueden eliminar categorías" ON public.blog_categories
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Políticas para blog_posts
CREATE POLICY "Cualquiera puede ver posts publicados" ON public.blog_posts
  FOR SELECT USING (status = 'published' OR auth.uid() IS NOT NULL);

CREATE POLICY "Solo admins pueden insertar posts" ON public.blog_posts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Solo admins pueden actualizar posts" ON public.blog_posts
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Solo admins pueden eliminar posts" ON public.blog_posts
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Políticas para blog_tags
CREATE POLICY "Cualquiera puede ver etiquetas" ON public.blog_tags
  FOR SELECT USING (true);

CREATE POLICY "Solo admins pueden insertar etiquetas" ON public.blog_tags
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Solo admins pueden actualizar etiquetas" ON public.blog_tags
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Solo admins pueden eliminar etiquetas" ON public.blog_tags
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Políticas para blog_post_tags
CREATE POLICY "Cualquiera puede ver relación post-tags" ON public.blog_post_tags
  FOR SELECT USING (true);

CREATE POLICY "Solo admins pueden insertar relación post-tags" ON public.blog_post_tags
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Solo admins pueden eliminar relación post-tags" ON public.blog_post_tags
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ================================================
-- 8. DATOS INICIALES - CATEGORÍAS
-- ================================================
INSERT INTO public.blog_categories (name, slug, description) VALUES
  ('Cuidados', 'cuidados', 'Tips y consejos para el cuidado de tus joyas'),
  ('Tendencias', 'tendencias', 'Las últimas tendencias en joyería'),
  ('Educación', 'educacion', 'Aprende sobre oro, quilates y más'),
  ('Historias', 'historias', 'Historias y cultura de la joyería'),
  ('Eventos', 'eventos', 'Eventos y noticias de Oro Nacional')
ON CONFLICT (slug) DO NOTHING;

-- ================================================
-- 9. STORAGE BUCKET PARA IMÁGENES DE BLOG
-- ================================================
-- NOTA: Esto debe ejecutarse desde el Dashboard de Supabase > Storage
-- O usando la API de Supabase

-- Instrucciones para configurar el bucket:
-- 1. Ve a Storage en Supabase Dashboard
-- 2. Crea un nuevo bucket llamado 'blog-images'
-- 3. Configura como público
-- 4. Configura las políticas de storage (ver storage-blog-setup.sql)

COMMENT ON TABLE public.blog_categories IS 'Categorías para organizar los posts del blog';
COMMENT ON TABLE public.blog_posts IS 'Posts del blog con contenido, autor, y metadata';
COMMENT ON TABLE public.blog_tags IS 'Etiquetas para clasificar los posts';
COMMENT ON TABLE public.blog_post_tags IS 'Relación muchos a muchos entre posts y etiquetas';
