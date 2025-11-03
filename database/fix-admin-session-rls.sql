-- =============================================
-- Script para Arreglar Problema de Sesión Admin
-- =============================================
-- Este script crea una función SECURITY DEFINER para evitar
-- el problema de recursión de RLS que causa cierre de sesión

-- Paso 1: Crear función para verificar si un usuario es admin
-- Esta función usa SECURITY DEFINER para que no sea afectada por RLS
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

-- Paso 2: Crear función para obtener perfil sin problema de RLS
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

-- Paso 3: Ver política actuales antes de eliminarlas
SELECT 'Políticas actuales:' as status;
SELECT policyname FROM pg_policies WHERE tablename = 'profiles';

-- Paso 4: Eliminar todas las políticas de admin que causan recursión
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "users_view_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "users_update_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "users_insert_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "admins_view_all_profiles" ON public.profiles;
DROP POLICY IF EXISTS "admins_update_all_profiles" ON public.profiles;

-- Paso 5: Crear políticas sin recursión usando las funciones
-- Política para que los usuarios vean su propio perfil
CREATE POLICY "users_view_own_profile" ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Política para que los usuarios actualicen su propio perfil
CREATE POLICY "users_update_own_profile" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Política para que los usuarios inserten su propio perfil
CREATE POLICY "users_insert_own_profile" ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Política para que los admins vean todos los perfiles
-- USANDO LA FUNCIÓN para evitar recursión
CREATE POLICY "admins_view_all_profiles" ON public.profiles
  FOR SELECT
  USING (public.is_admin());

-- Política para que los admins actualicen todos los perfiles
-- USANDO LA FUNCIÓN para evitar recursión
CREATE POLICY "admins_update_all_profiles" ON public.profiles
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Paso 6: Grant permisos para usar las funciones
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_user_profile(UUID) TO authenticated, anon;

-- Paso 7: Verificar que las políticas se crearon correctamente
SELECT 'Políticas después del fix:' as status;
SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'profiles';

-- Verificar que las funciones se crearon
SELECT 'Funciones creadas:' as status;
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('is_admin', 'get_user_profile');

-- =============================================
-- INSTRUCCIONES:
-- =============================================
-- 1. Ejecuta este script completo en Supabase SQL Editor
-- 2. Intenta hacer login como admin nuevamente
-- 3. Verifica que puedes hacer acciones en el admin sin que te saque
-- 4. Si aún hay problemas, revisa los logs de la consola del navegador
-- =============================================

