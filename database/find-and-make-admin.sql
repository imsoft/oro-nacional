-- =============================================
-- Script para encontrar y convertir usuarios en admin
-- =============================================

-- Paso 1: Ver todos los usuarios existentes
SELECT 
    id,
    email,
    full_name,
    role,
    created_at
FROM public.profiles 
ORDER BY created_at DESC;

-- Paso 2: Si encuentras el usuario que quieres hacer admin, usa su email:
-- (Descomenta y cambia el email)
-- UPDATE public.profiles 
-- SET role = 'admin' 
-- WHERE email = 'el-email-del-usuario@ejemplo.com';

-- Paso 3: Si encuentras el usuario que quieres hacer admin, usa su ID:
-- (Descomenta y cambia el UUID)
-- UPDATE public.profiles 
-- SET id = 'el-uuid-del-usuario'
-- WHERE email = 'el-email-del-usuario@ejemplo.com';

-- Paso 4: Verificar el cambio
SELECT 
    id,
    email,
    full_name,
    role,
    created_at
FROM public.profiles 
WHERE role = 'admin';

-- =============================================
-- ALTERNATIVA: Script automático para el primer usuario
-- =============================================

-- Si quieres hacer admin al primer usuario que encuentre:
UPDATE public.profiles 
SET role = 'admin' 
WHERE id = (
    SELECT id 
    FROM public.profiles 
    ORDER BY created_at ASC 
    LIMIT 1
);

-- Verificar el resultado
SELECT 
    id,
    email,
    full_name,
    role,
    created_at
FROM public.profiles 
WHERE role = 'admin';
