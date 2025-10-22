# 🚀 Guía de Configuración de Supabase para Oro Nacional

Esta guía te llevará paso a paso para configurar Supabase en tu proyecto.

---

## 📋 Índice

1. [Crear Proyecto en Supabase](#1-crear-proyecto-en-supabase)
2. [Configurar Variables de Entorno](#2-configurar-variables-de-entorno)
3. [Ejecutar Script SQL](#3-ejecutar-script-sql)
4. [Crear Usuario Admin](#4-crear-usuario-admin)
5. [Probar la Autenticación](#5-probar-la-autenticación)
6. [Solución de Problemas](#6-solución-de-problemas)

---

## 1. Crear Proyecto en Supabase

### Paso 1.1: Crear cuenta
1. Ve a [supabase.com](https://supabase.com)
2. Haz clic en "Start your project"
3. Inicia sesión con GitHub, Google o email

### Paso 1.2: Crear nuevo proyecto
1. Haz clic en "New Project"
2. Rellena los datos:
   - **Name**: `oro-nacional` (o el nombre que prefieras)
   - **Database Password**: Crea una contraseña segura y **guárdala en un lugar seguro**
   - **Region**: Elige la región más cercana (ej: `South America (São Paulo)`)
   - **Pricing Plan**: Free (es suficiente para empezar)
3. Haz clic en "Create new project"
4. Espera 1-2 minutos mientras se crea el proyecto

### Paso 1.3: Obtener credenciales
1. Una vez creado el proyecto, ve a **Settings** (⚙️ en la barra lateral izquierda)
2. Haz clic en **API**
3. En la sección "Project API keys", encontrarás:
   - **Project URL** (ejemplo: `https://abcdefghijklmno.supabase.co`)
   - **anon public** key (un string muy largo)
4. **Copia ambos valores** (los necesitarás en el siguiente paso)

---

## 2. Configurar Variables de Entorno

### Paso 2.1: Editar archivo .env.local
1. Abre el archivo `.env.local` en la raíz del proyecto
2. Reemplaza los valores placeholder con tus credenciales:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

### Paso 2.2: Reiniciar el servidor de desarrollo
```bash
# Detener el servidor si está corriendo (Ctrl+C)
# Luego reiniciar:
pnpm dev
```

---

## 3. Ejecutar Script SQL

### Paso 3.1: Abrir SQL Editor en Supabase
1. En tu proyecto de Supabase, ve a **SQL Editor** (icono </> en la barra lateral)
2. Haz clic en "New query"

### Paso 3.2: Copiar y ejecutar el script
1. Abre el archivo `database/supabase-setup.sql` en el proyecto
2. Copia **todo el contenido** del archivo
3. Pégalo en el editor SQL de Supabase
4. Haz clic en el botón **"Run"** (o presiona Cmd/Ctrl + Enter)
5. Deberías ver el mensaje "Success. No rows returned"

### Paso 3.3: Verificar que todo funcionó
1. Ve a **Table Editor** en la barra lateral de Supabase
2. Deberías ver la tabla `profiles` creada
3. La tabla debe tener las columnas:
   - `id` (uuid)
   - `email` (text)
   - `full_name` (text)
   - `role` (text)
   - `phone` (text)
   - `created_at` (timestamptz)
   - `updated_at` (timestamptz)

---

## 4. Crear Usuario Admin

Hay dos formas de crear un usuario administrador:

### Opción A: Desde la aplicación (Recomendado)

1. Ve a tu aplicación en el navegador: `http://localhost:3000`
2. Ve a la página de **Registro** (`/register`)
3. Regístrate con:
   - **Nombre**: Administrador
   - **Email**: admin@oronacional.com
   - **Contraseña**: Tu contraseña segura

4. Luego, en Supabase:
   - Ve a **SQL Editor**
   - Ejecuta esta query para hacer admin al usuario:
   ```sql
   UPDATE public.profiles
   SET role = 'admin'
   WHERE email = 'admin@oronacional.com';
   ```

### Opción B: Desde Supabase Dashboard

1. Ve a **Authentication** → **Users** en Supabase
2. Haz clic en "Add user" → "Create new user"
3. Ingresa:
   - **Email**: admin@oronacional.com
   - **Password**: Tu contraseña segura
   - **Auto Confirm User**: ✅ Activado
4. Haz clic en "Create user"
5. Luego, en **SQL Editor**, ejecuta:
   ```sql
   UPDATE public.profiles
   SET role = 'admin',
       full_name = 'Administrador'
   WHERE email = 'admin@oronacional.com';
   ```

---

## 5. Probar la Autenticación

### Paso 5.1: Probar Registro
1. Ve a `http://localhost:3000/register`
2. Regístrate con un email de prueba
3. Deberías ser redirigido y ver tu nombre en el navbar
4. Verifica en Supabase:
   - **Authentication** → **Users**: Deberías ver el nuevo usuario
   - **Table Editor** → **profiles**: Deberías ver el perfil creado

### Paso 5.2: Probar Login
1. Cierra sesión haciendo clic en tu nombre → "Cerrar Sesión"
2. Ve a `http://localhost:3000/login`
3. Inicia sesión con las credenciales que acabas de crear
4. Deberías ver tu nombre en el navbar nuevamente

### Paso 5.3: Probar Panel Admin
1. Cierra sesión
2. Inicia sesión con el usuario admin: `admin@oronacional.com`
3. En el menú de usuario, deberías ver "Panel de Administración"
4. Haz clic y deberías acceder a `/admin`

---

## 6. Solución de Problemas

### ❌ Error: "Missing Supabase environment variables"
**Causa**: Las variables de entorno no están configuradas correctamente.

**Solución**:
1. Verifica que `.env.local` existe en la raíz del proyecto
2. Verifica que las variables empiezan con `NEXT_PUBLIC_`
3. Reinicia el servidor de desarrollo

### ❌ Error: "relation 'public.profiles' does not exist"
**Causa**: El script SQL no se ejecutó correctamente.

**Solución**:
1. Ve a **SQL Editor** en Supabase
2. Ejecuta esta query para verificar:
   ```sql
   SELECT * FROM information_schema.tables WHERE table_name = 'profiles';
   ```
3. Si no retorna nada, vuelve a ejecutar el script `database/supabase-setup.sql`

### ❌ Error: "Invalid login credentials"
**Causa**: El email o contraseña son incorrectos.

**Solución**:
1. Ve a **Authentication** → **Users** en Supabase
2. Verifica que el usuario existe
3. Si no existe, créalo nuevamente
4. Si existe pero no funciona, resetea la contraseña desde Supabase

### ❌ El perfil no se crea automáticamente
**Causa**: El trigger no está funcionando correctamente.

**Solución**:
1. Ve a **SQL Editor** en Supabase
2. Ejecuta esta query para verificar el trigger:
   ```sql
   SELECT * FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created';
   ```
3. Si no existe, vuelve a ejecutar la sección del trigger en `database/supabase-setup.sql`
4. Como alternativa, crea el perfil manualmente:
   ```sql
   INSERT INTO public.profiles (id, email, full_name, role)
   SELECT id, email, raw_user_meta_data->>'full_name', 'user'
   FROM auth.users
   WHERE email = 'tu-email@example.com';
   ```

### ❌ No puedo acceder al panel de admin
**Causa**: El usuario no tiene rol de admin.

**Solución**:
1. Ve a **Table Editor** → **profiles** en Supabase
2. Busca tu usuario
3. Cambia el campo `role` a `admin`
4. O ejecuta en SQL Editor:
   ```sql
   UPDATE public.profiles SET role = 'admin' WHERE email = 'tu-email@example.com';
   ```

### ❌ La sesión no persiste al recargar
**Causa**: Problema con localStorage o el token de Supabase.

**Solución**:
1. Abre las DevTools del navegador (F12)
2. Ve a **Application** → **Local Storage**
3. Elimina las claves relacionadas con Supabase
4. Vuelve a iniciar sesión

---

## 📚 Recursos Adicionales

- [Documentación de Supabase](https://supabase.com/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)

---

## ✅ Checklist Final

Antes de continuar con el desarrollo, verifica que:

- [ ] El proyecto de Supabase está creado
- [ ] Las variables de entorno están configuradas en `.env.local`
- [ ] El script SQL se ejecutó exitosamente
- [ ] La tabla `profiles` existe en Supabase
- [ ] Puedes registrar nuevos usuarios desde la app
- [ ] Puedes iniciar sesión con usuarios existentes
- [ ] El usuario admin puede acceder a `/admin`
- [ ] La sesión persiste al recargar la página
- [ ] El logout funciona correctamente

---

## 🎉 ¡Listo!

Si completaste todos los pasos, tu autenticación con Supabase está funcionando correctamente. Ahora puedes continuar con:

1. Implementar productos en la base de datos
2. Implementar el carrito de compras persistente
3. Implementar pedidos
4. Implementar blog
5. Implementar favoritos en la base de datos

---

**¿Necesitas ayuda?** Revisa la sección de [Solución de Problemas](#6-solución-de-problemas) o consulta los logs en la consola del navegador y en el terminal.
