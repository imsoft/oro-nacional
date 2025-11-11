-- Migration: Consolidate categories tables
-- This migration removes the duplicate 'categories' table and uses only 'product_categories'
-- with multilingual support and featured categories functionality

-- Step 1: Add is_featured and display_order columns to product_categories if they don't exist
ALTER TABLE public.product_categories
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Step 2: Create index for featured categories queries
CREATE INDEX IF NOT EXISTS idx_product_categories_featured
ON public.product_categories(is_featured, display_order);

-- Step 3: Migrate data from categories to product_categories if categories table exists
DO $$
DECLARE
  category_record RECORD;
BEGIN
  -- Check if categories table exists
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'categories'
  ) THEN
    -- Loop through categories and update or insert into product_categories
    FOR category_record IN
      SELECT id, name::text as name, slug, description::text as description, image_url, is_featured, display_order
      FROM public.categories
    LOOP
      -- Try to find matching product_category by slug and update featured status
      UPDATE public.product_categories
      SET
        is_featured = category_record.is_featured,
        display_order = category_record.display_order,
        image_url = COALESCE(image_url, category_record.image_url),
        name_es = COALESCE(name_es, category_record.name),
        name_en = COALESCE(name_en, category_record.name),
        description_es = COALESCE(description_es, category_record.description),
        description_en = COALESCE(description_en, category_record.description)
      WHERE slug = category_record.slug OR slug_es = category_record.slug;
    END LOOP;
  END IF;
END $$;

-- Step 4: Drop the old categories table and related objects
DROP TRIGGER IF EXISTS update_categories_updated_at_trigger ON public.categories;
DROP FUNCTION IF EXISTS update_categories_updated_at();
DROP FUNCTION IF EXISTS update_category_featured(UUID, BOOLEAN, JSONB, JSONB, TEXT, INTEGER);
DROP FUNCTION IF EXISTS update_category_featured(UUID, BOOLEAN, TEXT, TEXT, INTEGER);
DROP FUNCTION IF EXISTS get_featured_categories();
DROP TABLE IF EXISTS public.categories CASCADE;

-- Step 5: Create new get_featured_categories function using product_categories
CREATE OR REPLACE FUNCTION get_featured_categories()
RETURNS TABLE (
  id UUID,
  name JSONB,
  slug TEXT,
  description JSONB,
  image_url TEXT,
  display_order INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pc.id,
    jsonb_build_object('es', pc.name_es, 'en', pc.name_en) as name,
    COALESCE(pc.slug_es, pc.slug) as slug,
    jsonb_build_object('es', pc.description_es, 'en', pc.description_en) as description,
    pc.image_url,
    pc.display_order
  FROM product_categories pc
  WHERE pc.is_featured = true
  ORDER BY pc.display_order ASC, pc.name_es ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Create function to update featured status
CREATE OR REPLACE FUNCTION update_category_featured(
  category_id UUID,
  featured BOOLEAN,
  category_image_url TEXT DEFAULT NULL,
  category_display_order INTEGER DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  updated_category product_categories%ROWTYPE;
BEGIN
  -- Update the category
  UPDATE product_categories
  SET
    is_featured = featured,
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

-- Step 7: Set default featured categories (update existing ones)
UPDATE product_categories
SET is_featured = true, display_order = 1
WHERE slug_es = 'anillos' OR slug = 'anillos';

UPDATE product_categories
SET is_featured = true, display_order = 2
WHERE slug_es = 'collares' OR slug = 'collares';

UPDATE product_categories
SET is_featured = true, display_order = 3
WHERE slug_es = 'aretes' OR slug = 'aretes';

UPDATE product_categories
SET is_featured = true, display_order = 4
WHERE slug_es = 'pulseras' OR slug = 'pulseras';

-- Step 8: Grant execute permissions
GRANT EXECUTE ON FUNCTION get_featured_categories() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION update_category_featured(UUID, BOOLEAN, TEXT, INTEGER) TO authenticated;

-- Step 9: Add helpful comments
COMMENT ON COLUMN product_categories.is_featured IS 'Whether this category should appear in the featured categories section on the homepage';
COMMENT ON COLUMN product_categories.display_order IS 'Order in which featured categories are displayed (lower numbers first)';
COMMENT ON FUNCTION get_featured_categories() IS 'Returns all featured categories with multilingual names and descriptions for the homepage';
