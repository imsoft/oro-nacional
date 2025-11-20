-- Migration: Create settings table for store configuration
-- This table stores all configurable settings for the store

-- Create settings table
CREATE TABLE IF NOT EXISTS public.store_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Store Information
  store_name TEXT NOT NULL DEFAULT 'Oro Nacional',
  contact_email TEXT NOT NULL DEFAULT 'contacto@oronacional.com',
  phone TEXT NOT NULL DEFAULT '+52 33 1234 5678',
  website TEXT NOT NULL DEFAULT 'https://oronacional.com',
  address TEXT NOT NULL DEFAULT 'Guadalajara, Jalisco, México',
  description TEXT NOT NULL DEFAULT 'Elegancia y tradición jalisciense desde 1990. Especialistas en joyería fina de oro.',

  -- Shipping Configuration
  free_shipping_from NUMERIC(10, 2) DEFAULT 3000.00,
  standard_shipping_cost NUMERIC(10, 2) DEFAULT 0.00,
  express_shipping_cost NUMERIC(10, 2) DEFAULT 200.00,
  delivery_time TEXT DEFAULT '3-5',

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_store_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_store_settings_timestamp
  BEFORE UPDATE ON public.store_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_store_settings_updated_at();

-- Insert default settings (only if table is empty)
INSERT INTO public.store_settings (
  store_name,
  contact_email,
  phone,
  website,
  address,
  description,
  free_shipping_from,
  standard_shipping_cost,
  express_shipping_cost,
  delivery_time
)
SELECT
  'Oro Nacional',
  'contacto@oronacional.com',
  '+52 33 1234 5678',
  'https://oronacional.com',
  'Guadalajara, Jalisco, México',
  'Elegancia y tradición jalisciense desde 1990. Especialistas en joyería fina de oro.',
  3000.00,
  0.00,
  200.00,
  '3-5'
WHERE NOT EXISTS (SELECT 1 FROM public.store_settings);

-- Enable RLS
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Anyone can read settings
CREATE POLICY "Anyone can view store settings"
  ON public.store_settings
  FOR SELECT
  USING (true);

-- Only authenticated users can update settings
CREATE POLICY "Authenticated users can update store settings"
  ON public.store_settings
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Add helpful comments
COMMENT ON TABLE public.store_settings IS 'Store configuration and settings';
COMMENT ON COLUMN public.store_settings.store_name IS 'Name of the store';
COMMENT ON COLUMN public.store_settings.contact_email IS 'Primary contact email';
COMMENT ON COLUMN public.store_settings.phone IS 'Contact phone number';
COMMENT ON COLUMN public.store_settings.website IS 'Store website URL';
COMMENT ON COLUMN public.store_settings.address IS 'Physical store address';
COMMENT ON COLUMN public.store_settings.description IS 'Store description';
COMMENT ON COLUMN public.store_settings.free_shipping_from IS 'Minimum order amount for free shipping';
COMMENT ON COLUMN public.store_settings.standard_shipping_cost IS 'Cost of standard shipping';
COMMENT ON COLUMN public.store_settings.express_shipping_cost IS 'Cost of express shipping';
COMMENT ON COLUMN public.store_settings.delivery_time IS 'Estimated delivery time (e.g., "3-5 días")';
