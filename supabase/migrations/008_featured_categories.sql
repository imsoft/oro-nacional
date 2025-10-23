-- Migration: Featured Categories for Homepage
-- Description: Create categories table and add featured categories functionality

-- Create categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_categories_updated_at_trigger ON categories;

CREATE TRIGGER update_categories_updated_at_trigger
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_categories_updated_at();

-- Create index for featured categories queries
CREATE INDEX IF NOT EXISTS idx_categories_featured ON categories(is_featured, display_order);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- Insert default categories if they don't exist
INSERT INTO categories (name, slug, description, image_url, is_featured, display_order) VALUES
  ('Anillos', 'anillos', 'Anillos de compromiso y matrimonio en oro 14k y 18k', 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', true, 1),
  ('Collares', 'collares', 'Collares elegantes que realzan tu belleza natural', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', true, 2),
  ('Aretes', 'aretes', 'Aretes de diseño único hechos a mano', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', true, 3),
  ('Pulseras', 'pulseras', 'Pulseras únicas que complementan tu estilo', 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', true, 4)
ON CONFLICT (slug) DO UPDATE SET
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  is_featured = EXCLUDED.is_featured,
  display_order = EXCLUDED.display_order;

-- Function to get featured categories for homepage
CREATE OR REPLACE FUNCTION get_featured_categories()
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  description TEXT,
  image_url TEXT,
  display_order INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.name,
    c.slug,
    c.description,
    c.image_url,
    c.display_order
  FROM categories c
  WHERE c.is_featured = true
  ORDER BY c.display_order ASC, c.name ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update category featured status (admin only)
CREATE OR REPLACE FUNCTION update_category_featured(
  category_id UUID,
  featured BOOLEAN,
  category_description TEXT DEFAULT NULL,
  category_image_url TEXT DEFAULT NULL,
  category_display_order INTEGER DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  updated_category categories%ROWTYPE;
BEGIN
  -- Update the category
  UPDATE categories
  SET
    is_featured = featured,
    description = COALESCE(category_description, description),
    image_url = COALESCE(category_image_url, image_url),
    display_order = COALESCE(category_display_order, display_order)
  WHERE id = category_id
  RETURNING * INTO updated_category;

  IF updated_category.id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Category not found'
    );
  END IF;

  RETURN json_build_object(
    'success', true,
    'category', row_to_json(updated_category)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read categories
CREATE POLICY "Anyone can read categories"
  ON categories
  FOR SELECT
  USING (true);

-- Only authenticated users can insert/update/delete categories (will be restricted by app to admins)
CREATE POLICY "Authenticated users can insert categories"
  ON categories
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update categories"
  ON categories
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete categories"
  ON categories
  FOR DELETE
  TO authenticated
  USING (true);

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_featured_categories() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION update_category_featured(UUID, BOOLEAN, TEXT, TEXT, INTEGER) TO authenticated;

-- Note: The update_category_featured function should only be called by admins
-- Application should verify admin role before calling this function
