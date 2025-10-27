-- =============================================
-- Script para Diagnosticar y Arreglar Recursión en RLS
-- =============================================

-- Paso 1: Ver todas las políticas existentes en la tabla profiles
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- Paso 2: Ver el estado de RLS en la tabla profiles
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'profiles';

-- Paso 3: Eliminar TODAS las políticas problemáticas de profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can delete profiles" ON public.profiles;

-- Paso 4: Crear políticas simples y seguras
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
CREATE POLICY "admins_view_all_profiles" ON public.profiles
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Política para que los admins actualicen todos los perfiles
CREATE POLICY "admins_update_all_profiles" ON public.profiles
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Paso 5: Verificar que las políticas se crearon correctamente
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- Paso 6: Verificar que RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'profiles';

-- =============================================
-- INSTRUCCIONES:
-- =============================================
-- 1. Ejecuta este script completo en Supabase SQL Editor
-- 2. Si sigues teniendo problemas, ejecuta también:
--    ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
--    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
-- =============================================
