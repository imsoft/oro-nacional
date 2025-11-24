-- Fix RLS policies for hero_images table
-- Drop existing policies
DROP POLICY IF EXISTS "Hero images are viewable by everyone" ON hero_images;
DROP POLICY IF EXISTS "Authenticated users can insert hero images" ON hero_images;
DROP POLICY IF EXISTS "Authenticated users can update hero images" ON hero_images;
DROP POLICY IF EXISTS "Authenticated users can delete hero images" ON hero_images;

-- Create new policies with correct checks
-- Policy: Anyone can view active hero images (public access)
CREATE POLICY "Hero images are viewable by everyone"
  ON hero_images FOR SELECT
  USING (is_active = true);

-- Policy: Authenticated users can view all hero images (for admin)
CREATE POLICY "Authenticated users can view all hero images"
  ON hero_images FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Policy: Authenticated users can insert hero images
CREATE POLICY "Authenticated users can insert hero images"
  ON hero_images FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Authenticated users can update hero images
CREATE POLICY "Authenticated users can update hero images"
  ON hero_images FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Authenticated users can delete hero images
CREATE POLICY "Authenticated users can delete hero images"
  ON hero_images FOR DELETE
  TO authenticated
  USING (true);
