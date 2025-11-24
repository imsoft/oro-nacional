# 🔧 Solución: No se pueden eliminar productos

## Problema
No se pueden eliminar productos desde `/admin/productos`. El soft delete (cambiar `is_active` a `false`) no funciona.

## Causa Probable
Las políticas de Row Level Security (RLS) en Supabase no permiten UPDATE a usuarios autenticados en la tabla `products`.

## ✅ Solución

### PASO 1: Ejecutar Script SQL en Supabase

1. Ve a **Supabase Dashboard**
2. Click en **SQL Editor** (menú lateral izquierdo)
3. Click en **New Query**
4. Copia y pega el contenido del archivo: `supabase/FIX_PRODUCTS_DELETE_POLICIES.sql`
5. Click en **Run** (o presiona Ctrl/Cmd + Enter)

### PASO 2: Verificar las Políticas

Después de ejecutar el script, deberías ver una política llamada:
- `products_update_authenticated` - Permite UPDATE a usuarios autenticados

### PASO 3: Verificar en la Aplicación

1. Ve a: https://www.oronacional.com/admin/productos
2. Abre la **Consola del Navegador** (F12 → Console)
3. Intenta eliminar un producto
4. Observa los mensajes en la consola

## 🔍 Diagnóstico Manual

Si aún no funciona, ejecuta esto en Supabase SQL Editor:

```sql
-- Ver todas las políticas de la tabla products
SELECT
  tablename,
  policyname,
  permissive,
  roles,
  cmd as command,
  CASE
    WHEN qual IS NOT NULL THEN 'Tiene USING'
    ELSE 'Sin USING'
  END as tiene_using,
  CASE
    WHEN with_check IS NOT NULL THEN 'Tiene WITH CHECK'
    ELSE 'Sin WITH CHECK'
  END as tiene_with_check
FROM pg_policies
WHERE tablename = 'products'
ORDER BY policyname;
```

**Deberías ver al menos:**
- Una política para SELECT (lectura)
- Una política para UPDATE (actualización) - **ESTA ES LA CLAVE**

## 🛡️ Política Correcta para UPDATE

La política debe ser así:

```sql
CREATE POLICY "products_update_authenticated"
ON products
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);
```

Esto permite que cualquier usuario **autenticado** pueda actualizar cualquier producto (incluyendo cambiar `is_active`).

## ❓ Verificaciones Adicionales

### 1. ¿El usuario está autenticado?

En la consola del navegador, ejecuta:
```javascript
console.log('Usuario autenticado:', await (await fetch('/api/auth/session')).json())
```

### 2. ¿RLS está habilitado?

En Supabase SQL Editor:
```sql
SELECT
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'products';
```

Debe mostrar `rls_enabled = true`

### 3. ¿El ID del producto es válido?

En la consola del navegador, cuando intentes eliminar verás:
```
Attempting to delete product: {id: "xxx-xxx-xxx", name: "..."}
```

Verifica que el `id` no sea una cadena vacía.

## 📞 Si Aún No Funciona

Comparte en la consola del navegador:
1. Los mensajes que aparecen cuando intentas eliminar
2. El resultado de esta query en Supabase:

```sql
SELECT * FROM pg_policies WHERE tablename = 'products';
```

## 🎯 Solución Rápida Temporal

Si necesitas eliminar productos urgentemente mientras arreglas las políticas, puedes hacerlo directamente en Supabase:

1. Ve a **Table Editor** → **products**
2. Encuentra el producto que quieres "eliminar"
3. Edita la fila y cambia `is_active` a `false`
4. Guarda

El producto ya no aparecerá en la página pública pero seguirá visible en el admin.
