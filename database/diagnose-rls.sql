-- =============================================
-- Script de Diagnóstico: Ver Estado Actual de RLS
-- =============================================

-- Ver todas las políticas en profiles
SELECT 
    'Políticas en profiles:' as info,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- Ver estado de RLS
SELECT 
    'Estado RLS:' as info,
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'profiles';

-- Ver si hay políticas que se referencian a sí mismas
SELECT 
    'Políticas problemáticas:' as info,
    policyname,
    qual
FROM pg_policies 
WHERE tablename = 'profiles'
AND qual LIKE '%profiles%';

-- Ver estructura de la tabla profiles
SELECT 
    'Estructura tabla:' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;
