-- ============================================
-- AGREGAR COLUMNA AVATAR_URL A PROFILES
-- ============================================
-- Ejecuta este script SOLO si ya creaste la tabla profiles
-- sin la columna avatar_url

-- Agregar columna avatar_url
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Verificar que se agregó correctamente
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_name = 'profiles' AND column_name = 'avatar_url';
