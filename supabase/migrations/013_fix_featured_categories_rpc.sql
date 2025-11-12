-- Migration: Fix featured categories RPC functions
-- This creates the get_featured_categories function for product_categories table

-- Step 1: Drop old functions if they exist
DROP FUNCTION IF EXISTS get_featured_categories();
DROP FUNCTION IF EXISTS update_category_featured(UUID, BOOLEAN, TEXT, INTEGER);

-- Step 2: Create get_featured_categories function using product_categories
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

-- Step 3: Create function to update featured status
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

-- Step 4: Set default featured categories (update existing ones)
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

-- Step 5: Grant execute permissions
GRANT EXECUTE ON FUNCTION get_featured_categories() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION update_category_featured(UUID, BOOLEAN, TEXT, INTEGER) TO authenticated;

-- Step 6: Add helpful comments
COMMENT ON COLUMN product_categories.is_featured IS 'Whether this category should appear in the featured categories section on the homepage';
COMMENT ON COLUMN product_categories.display_order IS 'Order in which featured categories are displayed (lower numbers first)';
COMMENT ON FUNCTION get_featured_categories() IS 'Returns all featured categories with multilingual names and descriptions for the homepage';
