# Documentación: CREATE para el Sistema de Blog

## Resumen

Se ha implementado la funcionalidad completa de **creación de posts** para el sistema de blog de Oro Nacional, incluyendo:

- ✅ Esquema de base de datos con 4 tablas relacionadas
- ✅ Tipos TypeScript completos
- ✅ Funciones de query para crear posts
- ✅ Formulario de creación de posts en admin
- ✅ Gestión de imágenes destacadas
- ✅ Sistema de categorías y etiquetas
- ✅ Estados: Borrador y Publicado

---

## 🗄️ Configuración de Base de Datos

### Paso 1: Ejecutar el schema de blog

1. Ve a **Supabase Dashboard** → **SQL Editor**
2. Ejecuta el archivo: [supabase/migrations/019_blog_system.sql](../supabase/migrations/019_blog_system.sql)

Este script creará:
- `blog_categories` - Categorías de blog
- `blog_posts` - Posts con contenido
- `blog_tags` - Etiquetas
- `blog_post_tags` - Relación muchos a muchos
- Políticas RLS para seguridad
- Índices para rendimiento
- 5 categorías iniciales

### Paso 2: Configurar Storage para imágenes

1. Ve a **Supabase Dashboard** → **Storage**
2. Click en "**Create a new bucket**"
3. Nombre del bucket: `blog-images`
4. Marca como **Public** ✅
5. Click en "**Save**"

Luego, configura las políticas:

1. Ve a **SQL Editor**
2. Ejecuta el archivo: [supabase/migrations/022_storage_blog_images.sql](../supabase/migrations/022_storage_blog_images.sql)

---

## 📋 Estructura de la Base de Datos

### Tabla: `blog_posts`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Identificador único |
| title | TEXT | Título del post |
| slug | TEXT | URL amigable (auto-generado) |
| excerpt | TEXT | Resumen breve (opcional) |
| content | TEXT | Contenido completo |
| featured_image | TEXT | URL de imagen destacada |
| category_id | UUID | Referencia a categoría |
| author_id | UUID | Referencia al perfil del autor |
| status | TEXT | 'draft' o 'published' |
| views | INTEGER | Contador de vistas |
| published_at | TIMESTAMPTZ | Fecha de publicación |
| created_at | TIMESTAMPTZ | Fecha de creación |
| updated_at | TIMESTAMPTZ | Última actualización |

### Tabla: `blog_categories`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Identificador único |
| name | TEXT | Nombre de la categoría |
| slug | TEXT | URL amigable |
| description | TEXT | Descripción (opcional) |

### Tabla: `blog_tags`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Identificador único |
| name | TEXT | Nombre de la etiqueta |
| slug | TEXT | URL amigable |

### Tabla: `blog_post_tags`

Relación muchos a muchos entre posts y etiquetas.

---

## 🔧 Archivos Creados/Modificados

### Archivos de Base de Datos
- ✅ `supabase/migrations/019_blog_system.sql` - Schema completo del blog
- ✅ `supabase/migrations/022_storage_blog_images.sql` - Configuración de storage

### Tipos TypeScript
- ✅ `src/types/blog.ts` - Interfaces y tipos para blog

### Funciones de Query
- ✅ `src/lib/supabase/blog.ts` - Todas las funciones de query

### Componentes de UI
- ✅ `src/app/admin/blog/nuevo/page.tsx` - Formulario de creación
- ✅ `src/app/admin/blog/page.tsx` - Lista de posts (botón conectado)

---

## 🎨 Características del Formulario de Creación

### Información Básica
- **Título** (obligatorio) - Genera automáticamente el slug
- **Extracto** (opcional) - Resumen para preview
- **Contenido** (obligatorio) - Texto completo con soporte Markdown

### Clasificación
- **Categoría** (opcional) - Selección de categorías existentes
- **Etiquetas** (opcional) - Separadas por comas, se crean automáticamente

### Imagen Destacada
- Upload con preview
- Drag & drop
- Formatos: PNG, JPG, WEBP
- Almacenamiento en Supabase Storage

### Estado de Publicación
- **Borrador** - No visible en el blog público
- **Publicado** - Visible inmediatamente, se establece `published_at`

---

## 🔐 Seguridad y Permisos

### Row Level Security (RLS)

**Categorías:**
- Lectura: Todos
- Escritura: Solo administradores

**Posts:**
- Lectura: Posts publicados (todos), todos los posts (usuarios autenticados)
- Escritura: Solo administradores

**Storage (blog-images):**
- Lectura: Público
- Upload/Delete: Solo administradores

---

## 📝 Uso del Formulario

### Para crear un nuevo post:

1. Inicia sesión como administrador
2. Ve a `/admin/blog`
3. Click en "**Nueva Publicación**"
4. Completa el formulario:
   - Título y contenido son obligatorios
   - Puedes usar Markdown en el contenido
   - Agrega categoría, etiquetas e imagen
   - Selecciona "Borrador" o "Publicado"
5. Click en "**Crear Post**"
6. Serás redirigido a la lista de posts

---

## 🧪 Datos de Prueba

### Categorías Incluidas

El script de setup incluye 5 categorías por defecto:

1. **Cuidados** - Tips y consejos para el cuidado de joyas
2. **Tendencias** - Últimas tendencias en joyería
3. **Educación** - Información sobre oro, quilates, etc.
4. **Historias** - Historias y cultura de la joyería
5. **Events** - Eventos y noticias

---

## 🔄 Funciones Disponibles

### En `src/lib/supabase/blog.ts`

**Categorías:**
- `getBlogCategories()` - Obtener todas
- `getBlogCategoryBySlug(slug)` - Por slug

**Tags:**
- `getBlogTags()` - Obtener todas
- `getOrCreateTags(names[])` - Crear o recuperar tags

**Posts - CREATE:**
- `createBlogPost(data, authorId)` - Crear nuevo post
  - Genera slug automáticamente
  - Sube imagen a Storage
  - Asocia categorías y tags
  - Establece `published_at` si es publicado

**Posts - READ:**
- `getPublishedPosts()` - Posts públicos
- `getAllBlogPosts()` - Todos (admin)
- `getBlogPostBySlug(slug)` - Por slug
- `getBlogPostById(id)` - Por ID
- `getBlogPostsByCategory(slug)` - Por categoría
- `searchBlogPosts(query)` - Buscar
- `incrementBlogPostViews(id)` - Incrementar vistas

---

## ⚙️ Proceso de Creación

Cuando se crea un post, el sistema:

1. **Genera el slug** del título
   ```typescript
   slug = title.toLowerCase()
     .normalize("NFD")
     .replace(/[\u0300-\u036f]/g, "")
     .replace(/[^a-z0-9]+/g, "-")
   ```

2. **Sube la imagen** (si existe) a Supabase Storage
   ```typescript
   bucket: "blog-images"
   filename: "timestamp-slug.ext"
   ```

3. **Inserta el post** en la base de datos
   - Asocia author_id del usuario actual
   - Establece published_at si status = 'published'

4. **Crea/asocia tags**
   - Busca tags existentes o crea nuevas
   - Inserta relaciones en blog_post_tags

---

## 🚀 Próximos Pasos

Para completar el CRUD del blog:

1. **READ** - Implementar visualización de posts
   - Lista en admin (con datos reales)
   - Blog público
   - Página de detalle de post

2. **UPDATE** - Editar posts existentes
   - Formulario de edición
   - Actualizar imágenes
   - Modificar categorías/tags

3. **DELETE** - Eliminar posts
   - Modal de confirmación
   - Eliminar imágenes asociadas

---

## 📚 Referencias

- **Tipos:** [src/types/blog.ts](../src/types/blog.ts)
- **Queries:** [src/lib/supabase/blog.ts](../src/lib/supabase/blog.ts)
- **Formulario:** [src/app/admin/blog/nuevo/page.tsx](../src/app/admin/blog/nuevo/page.tsx)
- **Database:** [supabase/migrations/019_blog_system.sql](../supabase/migrations/019_blog_system.sql)

---

## ❓ Notas Importantes

1. **Slug único:** Si hay conflicto de slug, la inserción fallará. En el futuro se puede agregar lógica para agregar un sufijo numérico.

2. **Markdown:** El contenido soporta Markdown. Para renderizarlo, necesitarás una librería como `react-markdown` o `marked`.

3. **Editor de texto:** Actualmente se usa un `<Textarea>` simple. Se puede mejorar con un editor WYSIWYG como:
   - TinyMCE
   - Quill
   - Tiptap
   - Lexical

4. **Validación de imágenes:** Solo se valida en el cliente. Considera agregar validación de tamaño/tipo en el servidor.

5. **Author ID:** Se toma del usuario autenticado. El sistema asume que solo admins pueden crear posts.
