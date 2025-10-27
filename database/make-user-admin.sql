-- =============================================
-- Script para convertir un usuario en administrador
-- =============================================

-- Opción 1: Convertir usuario por email
-- Reemplaza 'usuario@ejemplo.com' con el email del usuario que quieres hacer admin
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'usuario@ejemplo.com';

-- Opción 2: Convertir usuario por ID específico
-- Reemplaza 'uuid-del-usuario' con el ID UUID del usuario
UPDATE public.profiles 
SET role = 'admin' 
WHERE id = 'uuid-del-usuario';

-- Opción 3: Convertir el primer usuario encontrado (si solo hay uno)
UPDATE public.profiles 
SET role = 'admin' 
WHERE id = (SELECT id FROM public.profiles LIMIT 1);

-- Opción 4: Crear un usuario admin temporal si no existe ninguno
INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role,
    phone,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'admin@oro-nacional.com',
    'Administrador Oro Nacional',
    'admin',
    '+52 33 1234 5678',
    NOW(),
    NOW()
) ON CONFLICT (email) DO UPDATE SET role = 'admin';

-- Verificar que el usuario ahora es admin
SELECT 
    id,
    email,
    full_name,
    role,
    created_at
FROM public.profiles 
WHERE role = 'admin';

-- =============================================
-- INSTRUCCIONES DE USO:
-- =============================================
-- 1. Ejecuta solo UNA de las opciones (1, 2, 3 o 4)
-- 2. Para la Opción 1: Cambia 'usuario@ejemplo.com' por el email real
-- 3. Para la Opción 2: Cambia 'uuid-del-usuario' por el UUID real del usuario
-- 4. La Opción 3 es segura si solo tienes un usuario en la tabla
-- 5. La Opción 4 crea un usuario admin temporal si no tienes usuarios
-- =============================================
