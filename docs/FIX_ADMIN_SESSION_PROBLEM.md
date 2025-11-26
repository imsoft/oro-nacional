# 🔧 Solución: Problema de Sesión en Admin

## 🔴 Problema

Cada vez que haces clic en algo en el dashboard del administrador, te redirige al login.

## 🔍 Causa

El problema está relacionado con las políticas de **Row Level Security (RLS)** en Supabase. Cuando el sistema intenta verificar si eres admin consultando la tabla `profiles`, puede entrar en un ciclo recursivo o no tener permisos debido a políticas mal configuradas.

## ✅ Solución Completa

He realizado dos tipos de correcciones:

### 1. Corrección en el Código (Ya aplicada)

- ✅ Actualizado `auth-store.ts` para usar la función `get_user_profile()` que es `SECURITY DEFINER`
- ✅ Agregado fallback a consulta directa si la función RPC no está disponible
- ✅ Mejorado el `admin/layout.tsx` para verificar la sesión antes de cada renderizado

### 2. Corrección en la Base de Datos (Debes aplicarla)

**Ejecuta el siguiente script en Supabase SQL Editor:**

```sql
-- Ver el archivo: supabase/migrations/ (los scripts de fix RLS están en la carpeta database/ para referencia histórica)
```

**Pasos:**

1. Ve a tu proyecto de Supabase
2. Abre **SQL Editor**
3. Crea una nueva query
4. Los scripts de fix RLS están en la carpeta `database/` para referencia histórica (ya no se usan en producción)
5. Ejecuta el script completo
6. Verifica que no haya errores

## 🧪 Verificación

Después de ejecutar el script SQL:

1. **Cierra sesión** en la aplicación
2. **Inicia sesión** nuevamente como admin
3. **Prueba hacer clic** en diferentes secciones del admin
4. **Deberías poder navegar** sin que te redirija al login

## 🔍 Diagnóstico

Si el problema persiste:

### 1. Revisa la Consola del Navegador

Abre las herramientas de desarrollador (F12) y ve a la pestaña **Console**. Busca errores como:

- `Error checking session`
- `Error getting profile`
- `RLS policy violation`
- `permission denied`

### 2. Verifica las Funciones en Supabase

Ejecuta este query en Supabase SQL Editor:

```sql
SELECT routine_name, routine_type, security_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('is_admin', 'get_user_profile');
```

**Deberías ver:**
- `is_admin` con `security_type = 'DEFINER'`
- `get_user_profile` con `security_type = 'DEFINER'`

### 3. Verifica las Políticas RLS

Ejecuta este query:

```sql
SELECT policyname, cmd, qual
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;
```

**Deberías ver políticas como:**
- `users_view_own_profile`
- `users_update_own_profile`
- `users_insert_own_profile`
- `admins_view_all_profiles` (debe usar `public.is_admin()`)
- `admins_update_all_profiles` (debe usar `public.is_admin()`)

### 4. Prueba la Función Directamente

Ejecuta este query (reemplaza `TU_USER_ID` con tu UUID de usuario):

```sql
-- Verificar que la función funciona
SELECT public.is_admin('TU_USER_ID'::UUID);

-- Debería devolver: true (si eres admin) o false (si no lo eres)
```

## 🆘 Si Nada Funciona

Si después de todo esto el problema persiste:

1. **Desactiva RLS temporalmente** (SOLO PARA DIAGNÓSTICO):

```sql
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
```

2. **Prueba si el admin funciona** sin RLS
3. **Si funciona**, el problema está en las políticas RLS
4. **Reactiva RLS** y revisa las políticas:

```sql
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
```

5. **Contacta al soporte** de Supabase o revisa los logs del servidor

## 📝 Notas Importantes

- **No compartas** las funciones `SECURITY DEFINER` con usuarios no confiables
- **Las funciones** `is_admin()` y `get_user_profile()` se ejecutan con permisos elevados
- **Siempre verifica** que las políticas usen estas funciones, no consultas directas recursivas

## 🎯 Resultado Esperado

Después de aplicar estas correcciones:

- ✅ Puedes navegar en el admin sin problemas
- ✅ No te redirige al login al hacer clic
- ✅ La sesión se mantiene activa
- ✅ Puedes realizar acciones (crear, editar, eliminar) sin problemas

---

**¿Necesitas ayuda?** Revisa los logs de la consola y compártelos para un diagnóstico más específico.

