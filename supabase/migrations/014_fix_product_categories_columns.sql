-- Migration: Fix product_categories to use only multilingual columns
-- Remove old single-language columns that are causing conflicts

-- Step 1: Drop NOT NULL constraint from old columns
ALTER TABLE public.product_categories
ALTER COLUMN name DROP NOT NULL;

ALTER TABLE public.product_categories
ALTER COLUMN slug DROP NOT NULL;

-- Step 2: Drop unique constraints from old columns
ALTER TABLE public.product_categories
DROP CONSTRAINT IF EXISTS product_categories_name_key;

ALTER TABLE public.product_categories
DROP CONSTRAINT IF EXISTS product_categories_slug_key;

-- Step 3: Make multilingual columns NOT NULL instead
ALTER TABLE public.product_categories
ALTER COLUMN name_es SET NOT NULL;

ALTER TABLE public.product_categories
ALTER COLUMN name_en SET NOT NULL;

ALTER TABLE public.product_categories
ALTER COLUMN slug_es SET NOT NULL;

ALTER TABLE public.product_categories
ALTER COLUMN slug_en SET NOT NULL;

-- Step 4: Add unique constraints to multilingual slug columns
ALTER TABLE public.product_categories
ADD CONSTRAINT product_categories_slug_es_key UNIQUE (slug_es);

ALTER TABLE public.product_categories
ADD CONSTRAINT product_categories_slug_en_key UNIQUE (slug_en);

-- Step 5: Update any existing NULL values in multilingual columns
-- Copy from old columns if multilingual columns are NULL
UPDATE public.product_categories
SET
  name_es = COALESCE(name_es, name),
  name_en = COALESCE(name_en, name),
  slug_es = COALESCE(slug_es, slug),
  slug_en = COALESCE(slug_en, slug),
  description_es = COALESCE(description_es, description),
  description_en = COALESCE(description_en, description)
WHERE name_es IS NULL OR name_en IS NULL OR slug_es IS NULL OR slug_en IS NULL;

-- Step 6: Drop old single-language columns (optional - uncomment if you want to remove them)
-- ALTER TABLE public.product_categories DROP COLUMN IF EXISTS name;
-- ALTER TABLE public.product_categories DROP COLUMN IF EXISTS slug;
-- ALTER TABLE public.product_categories DROP COLUMN IF EXISTS description;

-- Step 7: Add helpful comments
COMMENT ON COLUMN public.product_categories.name_es IS 'Category name in Spanish (required)';
COMMENT ON COLUMN public.product_categories.name_en IS 'Category name in English (required)';
COMMENT ON COLUMN public.product_categories.slug_es IS 'URL-friendly slug in Spanish (required, unique)';
COMMENT ON COLUMN public.product_categories.slug_en IS 'URL-friendly slug in English (required, unique)';
