-- =============================================
-- Script Simple: Hacer Admin al Primer Usuario
-- =============================================

-- Este script hace admin al primer usuario que encuentre en la tabla profiles
UPDATE public.profiles 
SET role = 'admin' 
WHERE id = (
    SELECT id 
    FROM public.profiles 
    ORDER BY created_at ASC 
    LIMIT 1
);

-- Verificar que funcionó
SELECT 
    'Usuario convertido a admin:' as mensaje,
    id,
    email,
    full_name,
    role
FROM public.profiles 
WHERE role = 'admin';
