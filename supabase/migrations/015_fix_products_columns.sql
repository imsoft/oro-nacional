-- Migration: Fix products table to use only multilingual columns
-- Remove old single-language columns that are causing conflicts

-- Step 1: Drop NOT NULL constraint from old columns
ALTER TABLE public.products
ALTER COLUMN name DROP NOT NULL;

ALTER TABLE public.products
ALTER COLUMN slug DROP NOT NULL;

-- Step 2: Drop unique constraints from old columns
ALTER TABLE public.products
DROP CONSTRAINT IF EXISTS products_name_key;

ALTER TABLE public.products
DROP CONSTRAINT IF EXISTS products_slug_key;

-- Step 3: Make multilingual columns NOT NULL instead
ALTER TABLE public.products
ALTER COLUMN name_es SET NOT NULL;

ALTER TABLE public.products
ALTER COLUMN name_en SET NOT NULL;

ALTER TABLE public.products
ALTER COLUMN slug_es SET NOT NULL;

ALTER TABLE public.products
ALTER COLUMN slug_en SET NOT NULL;

ALTER TABLE public.products
ALTER COLUMN material_es SET NOT NULL;

ALTER TABLE public.products
ALTER COLUMN material_en SET NOT NULL;

ALTER TABLE public.products
ALTER COLUMN description_es SET NOT NULL;

ALTER TABLE public.products
ALTER COLUMN description_en SET NOT NULL;

-- Step 4: Add unique constraints to multilingual slug columns
ALTER TABLE public.products
ADD CONSTRAINT products_slug_es_key UNIQUE (slug_es);

ALTER TABLE public.products
ADD CONSTRAINT products_slug_en_key UNIQUE (slug_en);

-- Step 5: Update any existing NULL values in multilingual columns
-- Copy from old columns if multilingual columns are NULL
UPDATE public.products
SET
  name_es = COALESCE(name_es, name),
  name_en = COALESCE(name_en, name),
  slug_es = COALESCE(slug_es, slug),
  slug_en = COALESCE(slug_en, slug),
  material_es = COALESCE(material_es, material),
  material_en = COALESCE(material_en, material),
  description_es = COALESCE(description_es, description),
  description_en = COALESCE(description_en, description)
WHERE name_es IS NULL OR name_en IS NULL OR slug_es IS NULL OR slug_en IS NULL
   OR material_es IS NULL OR material_en IS NULL OR description_es IS NULL OR description_en IS NULL;

-- Step 6: Drop old single-language columns (optional - uncomment if you want to remove them)
-- ALTER TABLE public.products DROP COLUMN IF EXISTS name;
-- ALTER TABLE public.products DROP COLUMN IF EXISTS slug;
-- ALTER TABLE public.products DROP COLUMN IF EXISTS description;
-- ALTER TABLE public.products DROP COLUMN IF EXISTS material;

-- Step 7: Add helpful comments
COMMENT ON COLUMN public.products.name_es IS 'Product name in Spanish (required)';
COMMENT ON COLUMN public.products.name_en IS 'Product name in English (required)';
COMMENT ON COLUMN public.products.slug_es IS 'URL-friendly slug in Spanish (required, unique)';
COMMENT ON COLUMN public.products.slug_en IS 'URL-friendly slug in English (required, unique)';
COMMENT ON COLUMN public.products.material_es IS 'Material description in Spanish (required)';
COMMENT ON COLUMN public.products.material_en IS 'Material description in English (required)';
COMMENT ON COLUMN public.products.description_es IS 'Product description in Spanish (required)';
COMMENT ON COLUMN public.products.description_en IS 'Product description in English (required)';
