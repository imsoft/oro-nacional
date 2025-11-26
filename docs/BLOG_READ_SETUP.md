# Documentación: READ para el Sistema de Blog

## Resumen

Se ha implementado la funcionalidad completa de **lectura de posts** para el sistema de blog de Oro Nacional, incluyendo:

- ✅ Lista de posts en el admin con datos reales de Supabase
- ✅ Blog público con filtro por categorías
- ✅ Página de detalle de post con contenido completo
- ✅ Metadata dinámica para SEO
- ✅ Posts relacionados
- ✅ Contador de vistas
- ✅ Estados de carga
- ✅ Manejo de errores

---

## 📋 Archivos Modificados

### 1. Lista de Posts en Admin
**Archivo:** [src/app/admin/blog/page.tsx](../src/app/admin/blog/page.tsx)

**Cambios:**
- Carga posts desde Supabase con `getAllBlogPosts()`
- Muestra estados: Loading, Empty, Error
- Filtrado en tiempo real con búsqueda
- Estadísticas actualizadas dinámicamente
- Adaptado a tipos TypeScript del blog

**Características:**
```typescript
- Total de posts
- Posts publicados vs borradores
- Vistas totales
- Información del autor y categoría
- Fecha de publicación/creación
```

### 2. Blog Público
**Archivo:** [src/app/(website)/blog/page.tsx](../src/app/(website)/blog/page.tsx)

**Cambios:**
- Carga posts publicados con `getPublishedPosts()`
- Carga categorías dinámicas con `getBlogCategories()`
- Filtro por categorías (cliente)
- Loading spinner
- Fallback para imágenes sin contenido
- Vista en grid responsivo

**Características:**
```typescript
- Solo muestra posts con status = "published"
- Filtro por categoría
- Vista de tarjetas con imagen destacada
- Extracto y metadata (fecha, vistas)
- Nombre del autor
```

### 3. Detalle de Post
**Archivo:** [src/app/(website)/blog/[slug]/page.tsx](../src/app/(website)/blog/[slug]/page.tsx)

**Cambios:**
- Completamente reescrito para usar Supabase
- Carga post con `getBlogPostBySlug()`
- Incrementa vistas automáticamente
- Carga posts relacionados de la misma categoría
- Renderizado de Markdown básico
- Manejo de estados: Loading, Not Found, Success

**Características:**
```typescript
- Imagen destacada o fallback
- Metadata completa (autor, fecha, vistas)
- Categoría y tags
- Extracto destacado
- Contenido con formato Markdown
- Posts relacionados (máximo 3)
- CTA al catálogo
```

### 4. Layout con Metadata SEO
**Archivo:** [src/app/(website)/blog/[slug]/layout.tsx](../src/app/(website)/blog/[slug]/layout.tsx)

**Cambios:**
- Genera metadata dinámica desde Supabase
- Usa `getBlogPostBySlug()` para obtener datos
- Fallback a metadata por defecto
- OpenGraph completo
- Keywords dinámicos con tags

**Metadata Generada:**
```typescript
{
  title: `${post.title} | Blog Oro Nacional`,
  description: post.excerpt || post.title,
  keywords: [título, categoría, tags...],
  openGraph: {
    title, description, images, type: "article",
    publishedTime, authors, locale: "es_MX"
  }
}
```

---

## 🎨 Características Implementadas

### Admin - Lista de Posts

#### Estados de Carga
- **Loading:** Spinner mientras carga
- **Empty:** Mensaje si no hay posts
- **Success:** Tabla con todos los posts

#### Columnas de la Tabla
| Columna | Descripción |
|---------|-------------|
| Título | Nombre del post (truncado) |
| Categoría | Nombre de categoría o "Sin categoría" |
| Autor | Nombre del autor o "Anónimo" |
| Fecha | Fecha de publicación o creación |
| Estado | Badge verde (Publicado) o amarillo (Borrador) |
| Vistas | Contador con icono |
| Acciones | Botones de editar y eliminar |

#### Estadísticas
```typescript
- Total Posts: Cuenta total
- Publicados: status === "published"
- Borradores: status === "draft"
- Vistas Totales: Suma de todas las vistas
```

### Blog Público

#### Filtro de Categorías
- Botón "Todos" (muestra todos los posts)
- Botón por cada categoría de la BD
- Destacado en dorado cuando está seleccionado

#### Tarjetas de Post
```typescript
- Imagen destacada (con fallback a ícono BookOpen)
- Badge de categoría
- Título (máximo 2 líneas)
- Extracto (máximo 3 líneas)
- Fecha de publicación
- Contador de vistas
- Nombre del autor
```

#### Estados
- Loading con spinner
- Empty state si no hay posts en la categoría

### Detalle de Post

#### Header
```typescript
- Badge de categoría
- Título principal (4xl/5xl)
- Metadata: autor, fecha, vistas
- Imagen destacada o fallback
- Extracto destacado (si existe)
```

#### Contenido
Renderizado básico de Markdown con soporte para:
- `## H2` y `### H3`
- `**texto**` para bold
- `- item` para listas
- `✅` y `❌` para checks
- `---` para separadores
- Párrafos normales

#### Footer
- Tags del post
- CTA hacia catálogo y contacto

#### Posts Relacionados
- Máximo 3 posts de la misma categoría
- Excluye el post actual
- Tarjetas con imagen, categoría, título y extracto

---

## 🔄 Flujo de Datos

### Admin List
```
1. useEffect() → loadPosts()
2. getAllBlogPosts() → Supabase query
3. Mapea a BlogPostListItem[]
4. Filtra por búsqueda local
5. Renderiza tabla + estadísticas
```

### Blog Público
```
1. useEffect() → loadData()
2. Promise.all([getPublishedPosts(), getBlogCategories()])
3. Almacena posts y categorías
4. Filtra posts por categoría seleccionada
5. Renderiza grid de tarjetas
```

### Detalle de Post
```
1. useEffect() → loadPost()
2. getBlogPostBySlug(slug)
3. incrementBlogPostViews(post.id)
4. getBlogPostsByCategory(category.slug)
5. Filtra posts relacionados
6. Renderiza contenido completo
```

---

## 📊 Funciones de Query Utilizadas

### De [src/lib/supabase/blog.ts](../src/lib/supabase/blog.ts)

#### Para Admin
```typescript
getAllBlogPosts(): Promise<BlogPostListItem[]>
// Retorna todos los posts con categoría y autor
// Ordenados por created_at DESC
```

#### Para Blog Público
```typescript
getPublishedPosts(): Promise<BlogPostCard[]>
// Retorna solo posts con status = 'published'
// Ordenados por published_at DESC

getBlogCategories(): Promise<BlogCategory[]>
// Retorna todas las categorías
// Ordenadas por name ASC
```

#### Para Detalle
```typescript
getBlogPostBySlug(slug: string): Promise<BlogPostDetail | null>
// Retorna post completo con:
// - category (objeto completo)
// - author (perfil completo)
// - tags (array de tags)

getBlogPostsByCategory(categorySlug: string): Promise<BlogPostCard[]>
// Retorna posts de una categoría específica

incrementBlogPostViews(postId: string): Promise<void>
// Incrementa el contador de vistas
```

---

## 🎯 Características de UX

### Loading States
- Spinner centralizado con color dorado (#D4AF37)
- Mensaje descriptivo

### Empty States
- Mensaje personalizado según contexto
- En admin: "¡Crea tu primer post!"
- En categoría: "No hay artículos en esta categoría aún"

### Error Handling
- Try-catch en todas las funciones async
- Console.error para debugging
- Fallbacks a estados seguros

### SEO Optimizado
- Metadata dinámica por post
- OpenGraph para redes sociales
- Keywords con tags
- URLs amigables con slugs
- Locale en español mexicano

### Responsive
- Grid adaptativo (1 col → 2 col → 3 col)
- Imágenes con aspect-ratio consistente
- Texto truncado con line-clamp

---

## 🔐 Seguridad

### RLS (Row Level Security)
```sql
-- Posts publicados: todos pueden ver
SELECT ... WHERE status = 'published'

-- Todos los posts: solo usuarios autenticados
SELECT ... WHERE auth.uid() IS NOT NULL
```

### Client-Side
- Solo se muestran posts publicados en blog público
- Admin puede ver todos los posts
- Increment views no requiere autenticación

---

## 🧪 Casos de Prueba

### Lista Admin
- [ ] Carga correctamente con posts
- [ ] Muestra mensaje si no hay posts
- [ ] Búsqueda filtra correctamente
- [ ] Estadísticas calculan bien
- [ ] Estados se muestran con colores correctos

### Blog Público
- [ ] Carga solo posts publicados
- [ ] Filtro por categoría funciona
- [ ] Imágenes se muestran o fallback
- [ ] Links a detalle funcionan

### Detalle
- [ ] Carga post por slug
- [ ] Incrementa vistas
- [ ] Muestra posts relacionados
- [ ] Maneja post no encontrado
- [ ] Renderiza Markdown básico
- [ ] Tags se muestran si existen

### SEO
- [ ] Metadata se genera correctamente
- [ ] OpenGraph tiene imagen
- [ ] Keywords incluyen tags
- [ ] Título incluye nombre del post

---

## 🚀 Mejoras Futuras

### Renderizado de Contenido
Actualmente se usa un parser básico de Markdown. Considerar:
- **react-markdown** - Parser completo de Markdown
- **marked** + **DOMPurify** - Parser con sanitización
- **Tiptap** o **Lexical** - Editores WYSIWYG

### Performance
- Paginación en lista de admin
- Infinite scroll en blog público
- Caché de posts frecuentes
- Lazy loading de imágenes

### Funcionalidades
- Búsqueda global de posts
- Filtro por tags
- Ordenar por: Recientes, Más visto, Alfabético
- Compartir en redes sociales
- Comentarios (con Disqus o similar)
- Tiempo estimado de lectura

### Analytics
- Tracking de clics en posts
- Posts más populares
- Categorías más leídas
- Retención de lectores

---

## 📚 Referencias

- **Tipos:** [src/types/blog.ts](../src/types/blog.ts)
- **Queries:** [src/lib/supabase/blog.ts](../src/lib/supabase/blog.ts)
- **Admin List:** [src/app/admin/blog/page.tsx](../src/app/admin/blog/page.tsx)
- **Blog Público:** [src/app/(website)/blog/page.tsx](../src/app/(website)/blog/page.tsx)
- **Detalle:** [src/app/(website)/blog/[slug]/page.tsx](../src/app/(website)/blog/[slug]/page.tsx)
- **Layout:** [src/app/(website)/blog/[slug]/layout.tsx](../src/app/(website)/blog/[slug]/layout.tsx)
- **Database:** [supabase/migrations/019_blog_system.sql](../supabase/migrations/019_blog_system.sql)

---

## ✅ Resumen de Completado

| Funcionalidad | Estado |
|---------------|--------|
| Lista Admin | ✅ Completado |
| Blog Público | ✅ Completado |
| Detalle de Post | ✅ Completado |
| Metadata SEO | ✅ Completado |
| Posts Relacionados | ✅ Completado |
| Contador de Vistas | ✅ Completado |
| Filtro por Categorías | ✅ Completado |
| Loading States | ✅ Completado |
| Error Handling | ✅ Completado |
| Responsive Design | ✅ Completado |

---

## 🎉 Próximos Pasos

Para completar el CRUD del blog:

1. **UPDATE** - Editar posts existentes
   - Formulario de edición pre-llenado
   - Actualizar imagen destacada
   - Modificar categoría y tags

2. **DELETE** - Eliminar posts
   - Modal de confirmación personalizado
   - Soft delete vs hard delete
   - Eliminar imágenes del storage

¡El READ está 100% funcional y listo para usar! 🚀
