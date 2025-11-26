# Fix: Problema de Sesión de Administrador

## 🔴 Problema

Al realizar cualquier acción en el panel de administrador, el sistema cierra la sesión del usuario.

## 🔍 Causa Raíz

El problema está en las políticas de Row Level Security (RLS) de la tabla `profiles`. Cuando el sistema intenta verificar si un usuario es admin usando una política que consulta la tabla `profiles`, se crea una recursión infinita:

1. El sistema necesita verificar si el usuario es admin
2. Consulta la tabla `profiles` con RLS habilitado
3. La política RLS necesita verificar si el usuario es admin
4. **LOOP**: Vuelve al paso 1

Esto causa que las consultas fallen y el sistema determine que el usuario no está autenticado correctamente, cerrando la sesión.

### Ejemplo de Política Problemática

```sql
-- PROBLEMA: Esta política consulta profiles para verificar el rol
CREATE POLICY "admins_view_all_profiles" ON public.profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles  -- ← RECURSIVO!
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );
```

## ✅ Solución

Usar funciones `SECURITY DEFINER` para evitar que las políticas RLS sean recursivas. Estas funciones se ejecutan con los permisos del usuario que las creó, no con los permisos del usuario que las invoca.

### 1. Función para Verificar si es Admin

```sql
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
```

### 2. Políticas Actualizadas

Ahora las políticas usan la función en lugar de hacer la consulta directamente:

```sql
CREATE POLICY "admins_view_all_profiles" ON public.profiles
  FOR SELECT
  USING (public.is_admin());  -- ← Usa la función, no recursivo
```

## 📋 Pasos para Aplicar el Fix

1. **Accede a Supabase SQL Editor**
   - Ve a tu proyecto en Supabase
   - Abre "SQL Editor"
   - Crea una nueva query

2. **Ejecuta el Script de Fix**
   - Los scripts de fix RLS están en la carpeta `database/` para referencia histórica (ya no se usan en producción)
   - Copia todo el contenido
   - Pégalo en el SQL Editor
   - Ejecuta el script (Run)

3. **Verifica que se Aplicaron los Cambios**
   - Deberías ver mensajes de confirmación en los resultados
   - Las políticas deberían estar listadas
   - Las funciones deberían estar creadas

4. **Prueba el Panel Admin**
   - Haz logout si estás logueado
   - Inicia sesión como admin
   - Intenta realizar alguna acción (crear producto, etc.)
   - Verifica que NO te saque de la sesión

## 🧪 Verificación

### Verificar Políticas

```sql
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles';
```

Deberías ver:
- `users_view_own_profile`
- `users_update_own_profile`
- `users_insert_own_profile`
- `admins_view_all_profiles` (con `qual: public.is_admin()`)
- `admins_update_all_profiles` (con `qual: public.is_admin()`)

### Verificar Funciones

```sql
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('is_admin', 'get_user_profile');
```

Deberías ver ambas funciones listadas.

### Probar la Función

```sql
-- Debería retornar true si eres admin
SELECT public.is_admin();

-- Debería retornar tu perfil
SELECT * FROM public.get_user_profile();
```

## 🔧 Scripts Disponibles

- **Nota**: Los scripts de fix RLS están en la carpeta `database/` para referencia histórica. Las migraciones formales están en `supabase/migrations/`

## ⚠️ Importante

**NO deshabilitar RLS** como solución temporal. Esto crearía un riesgo de seguridad grave. La solución correcta es usar funciones `SECURITY DEFINER`.

## 📚 Referencias

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL SECURITY DEFINER Functions](https://www.postgresql.org/docs/current/sql-createfunction.html)
- [Supabase Auth Best Practices](https://supabase.com/docs/guides/auth/auth-helpers/auth-ui)

## 🆘 Si el Problema Persiste

1. Verifica los logs de la consola del navegador
2. Revisa los logs de Supabase
3. Verifica que estás usando las credenciales correctas de admin
4. Asegúrate de que el usuario en la tabla `profiles` tenga `role = 'admin'`

```sql
-- Verificar que tu usuario es admin
SELECT id, email, role FROM public.profiles WHERE role = 'admin';
```

