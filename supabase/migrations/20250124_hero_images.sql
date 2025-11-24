-- Create hero_images table
CREATE TABLE IF NOT EXISTS hero_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  CONSTRAINT hero_images_display_order_unique UNIQUE (display_order)
);

-- Add RLS policies
ALTER TABLE hero_images ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view active hero images
CREATE POLICY "Hero images are viewable by everyone"
  ON hero_images FOR SELECT
  USING (is_active = true);

-- Policy: Only authenticated users can insert hero images
CREATE POLICY "Authenticated users can insert hero images"
  ON hero_images FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Policy: Only authenticated users can update hero images
CREATE POLICY "Authenticated users can update hero images"
  ON hero_images FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Policy: Only authenticated users can delete hero images
CREATE POLICY "Authenticated users can delete hero images"
  ON hero_images FOR DELETE
  USING (auth.role() = 'authenticated');

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_hero_images_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER hero_images_updated_at
  BEFORE UPDATE ON hero_images
  FOR EACH ROW
  EXECUTE FUNCTION update_hero_images_updated_at();

-- Insert 3 default hero images (you'll need to replace these URLs with actual images)
INSERT INTO hero_images (image_url, display_order, is_active) VALUES
  ('https://images.unsplash.com/photo-1611591437281-460bfbe1220a?ixlib=rb-4.0.3&auto=format&fit=crop&w=2830&q=80', 0, true),
  ('https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=2830&q=80', 1, true),
  ('https://images.unsplash.com/photo-1603561596112-0a132b757442?ixlib=rb-4.0.3&auto=format&fit=crop&w=2830&q=80', 2, true);
