# 📦 Guía de Configuración de Productos - Oro Nacional

Esta guía te ayudará a configurar el sistema de gestión de productos en tu proyecto.

---

## 📋 Índice

1. [Ejecutar Scripts SQL](#1-ejecutar-scripts-sql)
2. [Configurar Storage de Imágenes](#2-configurar-storage-de-imágenes)
3. [Crear tu Primer Producto](#3-crear-tu-primer-producto)
4. [Verificar la Configuración](#4-verificar-la-configuración)
5. [Solución de Problemas](#5-solución-de-problemas)

---

## 1. Ejecutar Scripts SQL

### Paso 1.1: Ejecutar el script de productos

1. Ve a **SQL Editor** en Supabase
2. Abre el archivo `supabase/migrations/` (las tablas de productos ya están creadas en migraciones anteriores)
3. Copia **todo el contenido**
4. Pégalo en el editor SQL de Supabase
5. Haz clic en **Run**
6. Deberías ver el mensaje "Success. No rows returned"

Este script crea:
- ✅ Tabla `product_categories` (categorías de productos)
- ✅ Tabla `products` (productos principales)
- ✅ Tabla `product_images` (imágenes de productos)
- ✅ Tabla `product_specifications` (especificaciones técnicas)
- ✅ Tabla `product_sizes` (tallas/tamaños disponibles)
- ✅ Políticas de seguridad RLS
- ✅ 6 categorías iniciales (Anillos, Collares, Aretes, Pulseras, Dijes, Relojes)

### Paso 1.2: Verificar que las tablas se crearon

Ejecuta esta query en SQL Editor:
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'product%';
```

Deberías ver 5 tablas:
- `product_categories`
- `product_images`
- `product_sizes`
- `product_specifications`
- `products`

---

## 2. Configurar Storage de Imágenes

### Paso 2.1: Crear el bucket de imágenes

1. Ve a **Storage** en el menú lateral de Supabase
2. Haz clic en **"Create bucket"**
3. Configuración:
   - **Name**: `product-images`
   - **Public bucket**: ✅ **Activado** (muy importante)
   - **File size limit**: 5 MB
   - **Allowed mime types**: `image/jpeg, image/png, image/webp`
4. Haz clic en **"Create bucket"**

### Paso 2.2: Configurar políticas de seguridad

1. Ve a **SQL Editor** en Supabase
2. Abre el archivo `supabase/migrations/021_storage_product_images.sql`
3. Copia **todo el contenido**
4. Pégalo en el editor SQL
5. Haz clic en **Run**

Esto configura:
- ✅ Acceso público para ver imágenes
- ✅ Solo admins pueden subir/editar/eliminar imágenes

### Paso 2.3: Verificar el bucket

1. Ve a **Storage** → **product-images**
2. Intenta subir una imagen de prueba
3. Si puedes subirla y verla, ¡todo está correcto!
4. Puedes eliminar la imagen de prueba

---

## 3. Crear tu Primer Producto

### Paso 3.1: Acceder al formulario

1. Inicia sesión como administrador en tu aplicación
2. Ve al **Panel de Administración** (`/admin`)
3. Haz clic en **"Productos"** en el menú lateral
4. Haz clic en el botón **"Nuevo Producto"**

### Paso 3.2: Llenar el formulario

**Información Básica:**
- **Nombre**: Ej. "Anillo de Compromiso Esmeralda"
- **Descripción**: Descripción detallada del producto
- **Categoría**: Selecciona de la lista (Anillos, Collares, etc.)
- **Material**: Ej. "Oro 14k"
- **Precio**: Precio en MXN (Ej. 12500.00)
- **Stock**: Cantidad disponible (Ej. 10)
- **Peso**: Peso en gramos (opcional)
- **Permite grabado**: Marca si el producto permite personalización

**Imágenes:**
- Haz clic en el área de subida de imágenes
- Selecciona una o más imágenes
- La primera imagen será la principal
- Puedes cambiar la imagen principal haciendo clic en "Hacer principal"
- Puedes eliminar imágenes con la X

**Especificaciones (opcional):**
- Haz clic en "Agregar" para agregar especificaciones
- Ejemplo:
  - Material → Oro 14k
  - Piedras → Diamantes naturales 0.50ct
  - Acabado → Pulido alto brillo

**Tallas/Tamaños (opcional):**
- Escribe una talla (Ej: "7", "M", "Grande")
- Presiona "Agregar" o Enter
- Puedes agregar múltiples tallas

### Paso 3.3: Crear el producto

1. Revisa que todos los datos sean correctos
2. Haz clic en **"Crear Producto"**
3. Espera a que se complete el proceso
4. Serás redirigido a la lista de productos

---

## 4. Verificar la Configuración

### Verificar en la Base de Datos

Ejecuta estas queries en SQL Editor:

```sql
-- Ver todas las categorías
SELECT * FROM public.product_categories;

-- Ver productos creados
SELECT * FROM public.products;

-- Ver imágenes de productos
SELECT * FROM public.product_images;

-- Ver especificaciones
SELECT * FROM public.product_specifications;

-- Ver tallas disponibles
SELECT * FROM public.product_sizes;
```

### Verificar en la Aplicación

1. **Como Admin**:
   - Ve a `/admin/productos`
   - Deberías ver tu producto en la lista
   - Verifica que la imagen, precio y stock se muestran correctamente

2. **Como Usuario**:
   - Ve a `/catalog`
   - El producto debería aparecer en el catálogo público

---

## 5. Solución de Problemas

### ❌ Error: "relation 'public.products' does not exist"

**Causa**: El script SQL no se ejecutó correctamente.

**Solución**:
1. Ve a SQL Editor
2. Ejecuta: `SELECT * FROM information_schema.tables WHERE table_name = 'products';`
3. Si no retorna nada, verifica que las migraciones se hayan ejecutado correctamente

---

### ❌ Error: "Failed to upload image" o "Storage bucket not found"

**Causa**: El bucket `product-images` no existe o no es público.

**Solución**:
1. Ve a **Storage** en Supabase
2. Verifica que el bucket `product-images` existe
3. Verifica que está marcado como **Público** (icono de globo)
4. Si no existe, créalo siguiendo el [Paso 2.1](#paso-21-crear-el-bucket-de-imágenes)

---

### ❌ Error: "You don't have permission to upload"

**Causa**: Las políticas de storage no están configuradas.

**Solución**:
1. Ve a SQL Editor
2. Ejecuta todo el contenido de `supabase/migrations/021_storage_product_images.sql`
3. Verifica que tu usuario tiene rol de `admin` en la tabla `profiles`

---

### ❌ Error: "new row violates check constraint"

**Causa**: Los valores ingresados no cumplen con las validaciones.

**Solución**:
- **Precio**: Debe ser un número mayor o igual a 0
- **Stock**: Debe ser un número entero mayor o igual a 0
- **Peso**: Debe ser un número positivo

---

### ❌ Las imágenes no se muestran en el catálogo

**Causa**: El bucket no es público o las URLs no son correctas.

**Solución**:
1. Ve a **Storage** → **product-images**
2. Asegúrate que el bucket está marcado como **Public**
3. Haz clic en una imagen → Verifica que tiene una URL pública
4. En SQL Editor ejecuta:
   ```sql
   SELECT image_url FROM public.product_images;
   ```
5. Las URLs deben empezar con tu URL de Supabase Storage

---

### ❌ No puedo crear productos (botón no responde)

**Causa**: Tu usuario no tiene rol de admin.

**Solución**:
1. Ve a **Table Editor** → **profiles** en Supabase
2. Busca tu usuario por email
3. Cambia el campo `role` a `admin`
4. Cierra sesión y vuelve a iniciar sesión en la app

---

## 📚 Estructura de la Base de Datos

### Tabla `products`
```
- id (UUID)
- name (TEXT)
- slug (TEXT) - Generado automáticamente
- description (TEXT)
- category_id (UUID) - FK a product_categories
- price (DECIMAL)
- stock (INTEGER)
- material (TEXT)
- weight (DECIMAL) - Opcional
- has_engraving (BOOLEAN)
- is_active (BOOLEAN)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

### Relaciones
- Un producto tiene **una categoría** (opcional)
- Un producto tiene **múltiples imágenes**
- Un producto tiene **múltiples especificaciones**
- Un producto tiene **múltiples tallas** (opcional)

---

## 🎯 Próximos Pasos

Después de crear productos, puedes:

1. ✅ **Editar productos** - Implementar la funcionalidad de edición
2. ✅ **Eliminar productos** - Implementar soft delete (is_active = false)
3. ✅ **Gestionar categorías** - CRUD completo de categorías
4. ✅ **Filtros en catálogo** - Filtrar por categoría, precio, material
5. ✅ **Búsqueda de productos** - Buscar por nombre o descripción

---

## ✅ Checklist Final

Antes de continuar, verifica que:

- [ ] El script `products-setup.sql` se ejecutó exitosamente
- [ ] La tabla `products` existe con 6 categorías iniciales
- [ ] El bucket `product-images` está creado y es público
- [ ] Las políticas de storage están configuradas
- [ ] Puedes acceder a `/admin/productos/nuevo` como admin
- [ ] Puedes crear un producto con imágenes
- [ ] El producto aparece en la lista de productos del admin
- [ ] Las imágenes se suben correctamente a Supabase Storage

---

## 🎉 ¡Listo!

Si completaste todos los pasos, tu sistema de productos está funcionando correctamente. Ahora puedes:

1. Crear productos desde el panel de administración
2. Los productos se guardan en Supabase
3. Las imágenes se almacenan en Supabase Storage
4. Todo está protegido con Row Level Security

---

**¿Necesitas ayuda?** Revisa la sección de [Solución de Problemas](#5-solución-de-problemas) o consulta los logs en la consola del navegador.
