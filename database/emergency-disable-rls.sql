-- =============================================
-- Script de Emergencia: Deshabilitar RLS Temporalmente
-- =============================================

-- SOLO USA ESTE SCRIPT SI EL ANTERIOR NO FUNCIONA
-- Este script deshabilita RLS temporalmente para permitir el login

-- Paso 1: Deshabilitar RLS en profiles temporalmente
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Paso 2: Verificar que RLS está deshabilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'profiles';

-- Paso 3: Ahora deberías poder hacer login
-- Una vez que puedas hacer login, ejecuta el script anterior para arreglar RLS

-- =============================================
-- IMPORTANTE: 
-- =============================================
-- 1. Este script deshabilita la seguridad de la tabla profiles
-- 2. Solo úsalo temporalmente para poder hacer login
-- 3. DESPUÉS de poder hacer login, ejecuta el script anterior
-- 4. O ejecuta este script para volver a habilitar RLS:
--    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
-- =============================================
