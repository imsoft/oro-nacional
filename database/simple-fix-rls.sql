-- =============================================
-- Script Simple para Arreglar Recursión RLS
-- =============================================

-- Paso 1: Deshabilitar RLS temporalmente
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Paso 2: Eliminar todas las políticas existentes
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can delete profiles" ON public.profiles;
DROP POLICY IF EXISTS "users_view_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "users_update_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "users_insert_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "admins_view_all_profiles" ON public.profiles;
DROP POLICY IF EXISTS "admins_update_all_profiles" ON public.profiles;

-- Paso 3: Habilitar RLS nuevamente
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

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

-- Paso 5: Verificar que todo está funcionando
SELECT 'Políticas creadas:' as status;
SELECT policyname FROM pg_policies WHERE tablename = 'profiles';

SELECT 'RLS habilitado:' as status;
SELECT rowsecurity FROM pg_tables WHERE tablename = 'profiles';

-- =============================================
-- INSTRUCCIONES:
-- =============================================
-- 1. Ejecuta este script completo en Supabase SQL Editor
-- 2. Intenta hacer login nuevamente
-- 3. Si sigues teniendo problemas, ejecuta solo:
--    ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
-- =============================================
