-- Migration: Site Settings
-- Description: Create table for storing site-wide configuration (contact info, business hours, social media, etc.)

-- Create site_settings table
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  setting_type TEXT DEFAULT 'text' CHECK (setting_type IN ('text', 'email', 'phone', 'url', 'json', 'number')),
  description TEXT,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_site_settings_public ON site_settings(is_public);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_site_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_site_settings_updated_at_trigger ON site_settings;

CREATE TRIGGER update_site_settings_updated_at_trigger
  BEFORE UPDATE ON site_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_site_settings_updated_at();

-- Insert default settings
INSERT INTO site_settings (setting_key, setting_value, setting_type, description, is_public) VALUES
  -- Basic Information
  ('store_name', 'Oro Nacional', 'text', 'Nombre de la tienda', true),
  ('store_tagline', 'Elegancia y tradición jalisciense desde 1990', 'text', 'Eslogan de la tienda', true),

  -- Contact Information
  ('contact_email', 'contacto@oronacional.com', 'email', 'Email de contacto principal', true),
  ('contact_phone', '+52 33 1234 5678', 'phone', 'Teléfono de contacto', true),
  ('whatsapp_phone', '+523312345678', 'phone', 'Número de WhatsApp (sin espacios ni +)', true),

  -- Address
  ('address_street', 'Av. Chapultepec 234', 'text', 'Calle y número', true),
  ('address_colony', 'Col. Americana', 'text', 'Colonia', true),
  ('address_city', 'Guadalajara', 'text', 'Ciudad', true),
  ('address_state', 'Jalisco', 'text', 'Estado', true),
  ('address_zip', '44160', 'text', 'Código postal', true),
  ('address_country', 'México', 'text', 'País', true),

  -- Business Hours (stored as JSON)
  ('business_hours', '{"monday":"10:00 AM - 7:00 PM","tuesday":"10:00 AM - 7:00 PM","wednesday":"10:00 AM - 7:00 PM","thursday":"10:00 AM - 7:00 PM","friday":"10:00 AM - 7:00 PM","saturday":"10:00 AM - 3:00 PM","sunday":"Cerrado"}', 'json', 'Horarios de atención', true),
  ('business_hours_summary', 'Lunes a Viernes: 10:00 AM - 7:00 PM', 'text', 'Resumen de horarios', true),

  -- Social Media
  ('social_facebook', 'https://facebook.com/oronacional', 'url', 'URL de Facebook', true),
  ('social_instagram', 'https://instagram.com/oronacional', 'url', 'URL de Instagram', true),
  ('social_twitter', 'https://twitter.com/oronacional', 'url', 'URL de Twitter', true),

  -- Social Media Handles
  ('facebook_handle', '@OroNacional', 'text', 'Usuario de Facebook', true),
  ('instagram_handle', '@OroNacional', 'text', 'Usuario de Instagram', true),
  ('twitter_handle', '@OroNacional', 'text', 'Usuario de Twitter', true)
ON CONFLICT (setting_key) DO NOTHING;

-- Function to get all public settings
CREATE OR REPLACE FUNCTION get_public_settings()
RETURNS TABLE (
  setting_key TEXT,
  setting_value TEXT,
  setting_type TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.setting_key,
    s.setting_value,
    s.setting_type
  FROM site_settings s
  WHERE s.is_public = true
  ORDER BY s.setting_key;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all settings (admin only)
CREATE OR REPLACE FUNCTION get_all_settings()
RETURNS TABLE (
  id UUID,
  setting_key TEXT,
  setting_value TEXT,
  setting_type TEXT,
  description TEXT,
  is_public BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.setting_key,
    s.setting_value,
    s.setting_type,
    s.description,
    s.is_public
  FROM site_settings s
  ORDER BY s.setting_key;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get a single setting by key
CREATE OR REPLACE FUNCTION get_setting(key TEXT)
RETURNS TEXT AS $$
DECLARE
  setting_val TEXT;
BEGIN
  SELECT setting_value INTO setting_val
  FROM site_settings
  WHERE setting_key = key AND is_public = true;

  RETURN setting_val;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update a setting (admin only)
CREATE OR REPLACE FUNCTION update_setting(
  key TEXT,
  value TEXT
)
RETURNS JSON AS $$
DECLARE
  updated_setting site_settings%ROWTYPE;
BEGIN
  UPDATE site_settings
  SET setting_value = value
  WHERE setting_key = key
  RETURNING * INTO updated_setting;

  IF updated_setting.id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Setting not found'
    );
  END IF;

  RETURN json_build_object(
    'success', true,
    'setting', row_to_json(updated_setting)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update multiple settings at once (admin only)
CREATE OR REPLACE FUNCTION update_settings(settings JSON)
RETURNS JSON AS $$
DECLARE
  setting_record RECORD;
  updated_count INTEGER := 0;
BEGIN
  FOR setting_record IN SELECT * FROM json_each_text(settings)
  LOOP
    UPDATE site_settings
    SET setting_value = setting_record.value
    WHERE setting_key = setting_record.key;

    IF FOUND THEN
      updated_count := updated_count + 1;
    END IF;
  END LOOP;

  RETURN json_build_object(
    'success', true,
    'updated_count', updated_count
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Row Level Security
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read public settings
CREATE POLICY "Anyone can read public settings"
  ON site_settings
  FOR SELECT
  USING (is_public = true);

-- Only authenticated users can read all settings (will be restricted by app to admins)
CREATE POLICY "Authenticated users can read all settings"
  ON site_settings
  FOR SELECT
  TO authenticated
  USING (true);

-- Only authenticated users can update settings (will be restricted by app to admins)
CREATE POLICY "Authenticated users can update settings"
  ON site_settings
  FOR UPDATE
  TO authenticated
  USING (true);

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_public_settings() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_all_settings() TO authenticated;
GRANT EXECUTE ON FUNCTION get_setting(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION update_setting(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_settings(JSON) TO authenticated;

-- Note: The update functions should only be called by admins
-- Application should verify admin role before calling these functions
