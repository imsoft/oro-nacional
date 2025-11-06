-- =============================================
-- Script de Verificación y Reparación de RLS
-- =============================================
-- Este script verifica el estado actual y repara cualquier problema
-- Ejecuta este script completo en Supabase SQL Editor

-- =============================================
-- PASO 1: Verificar funciones existentes
-- =============================================
SELECT '=== Verificando funciones existentes ===' as status;

SELECT 
  routine_name,
  routine_type,
  security_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('is_admin', 'get_user_profile');

-- =============================================
-- PASO 2: Crear/Actualizar función is_admin
-- =============================================
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM public.profiles
  WHERE id = user_uuid;
  
  RETURN COALESCE(user_role = 'admin', false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- =============================================
-- PASO 3: Crear/Actualizar función get_user_profile
-- =============================================
CREATE OR REPLACE FUNCTION public.get_user_profile(user_uuid UUID DEFAULT auth.uid())
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT,
  role TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.email,
    p.full_name,
    p.role,
    p.phone,
    p.avatar_url,
    p.created_at,
    p.updated_at
  FROM public.profiles p
  WHERE p.id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- =============================================
-- PASO 4: Otorgar permisos a las funciones
-- =============================================
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_user_profile(UUID) TO authenticated, anon;

-- =============================================
-- PASO 5: Verificar políticas actuales
-- =============================================
SELECT '=== Políticas actuales en profiles ===' as status;
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- =============================================
-- PASO 6: Eliminar TODAS las políticas existentes
-- =============================================
DO $$ 
DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'profiles') 
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.profiles';
  END LOOP;
END $$;

-- =============================================
-- PASO 7: Crear políticas correctas sin recursión
-- =============================================

-- Política: Usuarios pueden ver su propio perfil
CREATE POLICY "users_view_own_profile" ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Política: Usuarios pueden actualizar su propio perfil
CREATE POLICY "users_update_own_profile" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Política: Usuarios pueden insertar su propio perfil
CREATE POLICY "users_insert_own_profile" ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Política: Admins pueden ver TODOS los perfiles
-- IMPORTANTE: Usa la función is_admin() para evitar recursión
CREATE POLICY "admins_view_all_profiles" ON public.profiles
  FOR SELECT
  USING (public.is_admin());

-- Política: Admins pueden actualizar TODOS los perfiles
CREATE POLICY "admins_update_all_profiles" ON public.profiles
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Política: Admins pueden eliminar perfiles
CREATE POLICY "admins_delete_profiles" ON public.profiles
  FOR DELETE
  USING (public.is_admin());

-- =============================================
-- PASO 8: Verificar que RLS está habilitado
-- =============================================
SELECT '=== Estado de RLS en profiles ===' as status;
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'profiles';

-- Si RLS no está habilitado, habilitarlo:
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- =============================================
-- PASO 9: Verificación final
-- =============================================
SELECT '=== Verificación final ===' as status;

-- Verificar funciones
SELECT 'Funciones creadas:' as info;
SELECT routine_name, routine_type, security_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('is_admin', 'get_user_profile');

-- Verificar políticas
SELECT 'Políticas creadas:' as info;
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- =============================================
-- INSTRUCCIONES FINALES:
-- =============================================
-- 1. Ejecuta este script completo en Supabase SQL Editor
-- 2. Verifica que no haya errores en la ejecución
-- 3. Cierra sesión y vuelve a iniciar sesión como admin
-- 4. Prueba hacer acciones en el panel de admin
-- 5. Si aún hay problemas, revisa la consola del navegador (F12)
--    y busca errores relacionados con "profiles" o "RLS"
-- =============================================

