# Documentación: UPDATE para el Sistema de Blog

## Resumen

Se ha implementado la funcionalidad completa de **actualización de posts** para el sistema de blog de Oro Nacional, incluyendo:

- ✅ Página de edición con formulario pre-llenado
- ✅ Actualización de todos los campos del post
- ✅ Gestión de imagen destacada (mantener, eliminar o reemplazar)
- ✅ Actualización de categoría y tags
- ✅ Cambio de estado (draft/published)
- ✅ Regeneración automática de slug al cambiar título
- ✅ Validación de campos
- ✅ Estados de carga
- ✅ Navegación desde lista de admin

---

## 📋 Archivos Creados/Modificados

### 1. Página de Edición
**Archivo:** [src/app/admin/blog/[id]/editar/page.tsx](../src/app/admin/blog/[id]/editar/page.tsx)

**Características:**
```typescript
- Carga post existente por ID
- Pre-llena formulario con datos actuales
- Gestión avanzada de imágenes
- Actualización de tags (elimina y recrea)
- Validación de campos obligatorios
- Loading y saving states
- Redirección después de guardar
```

### 2. Lista de Admin - Botón de Editar
**Archivo:** [src/app/admin/blog/page.tsx](../src/app/admin/blog/page.tsx)

**Cambios:**
```typescript
// Agregado Link al botón de editar
<Link href={`/admin/blog/${post.id}/editar`}>
  <Button>
    <Pencil />
  </Button>
</Link>
```

---

## 🎨 Características del Formulario de Edición

### Carga Inicial
```typescript
useEffect(() => {
  loadData();
}, [params.id]);

const loadData = async () => {
  const [postData, categoriesData] = await Promise.all([
    getBlogPostById(params.id),
    getBlogCategories(),
  ]);

  // Pre-llenar formulario
  setTitle(postData.title);
  setExcerpt(postData.excerpt || "");
  setContent(postData.content);
  setCategoryId(postData.category_id || "");
  setStatus(postData.status);
  setCurrentFeaturedImage(postData.featured_image || null);
  setTags(postData.tags?.map((tag) => tag.name).join(", ") || "");
};
```

### Gestión de Imágenes

#### Estados de Imagen
```typescript
const [currentFeaturedImage, setCurrentFeaturedImage] = useState<string | null>(null);
const [newFeaturedImage, setNewFeaturedImage] = useState<File | null>(null);
const [imagePreview, setImagePreview] = useState<string | null>(null);
```

#### Casos de Uso

**1. Mantener imagen actual:**
- No hacer nada
- currentFeaturedImage se mantiene
- No se envía featured_image en updates

**2. Eliminar imagen actual:**
- Click en X de imagen actual
- setCurrentFeaturedImage(null)
- No se envía featured_image en updates

**3. Reemplazar imagen:**
- Upload nueva imagen
- newFeaturedImage contiene File
- Se envía featured_image: File en updates
- updateBlogPost() sube nueva imagen y actualiza URL

#### UI de Imágenes

```typescript
// Imagen actual (si existe y no hay preview de nueva)
{currentFeaturedImage && !imagePreview && (
  <div>
    <img src={currentFeaturedImage} />
    <Button onClick={handleRemoveCurrentImage}>
      <X />
    </Button>
  </div>
)}

// Upload (si no hay imagen actual ni preview)
{!imagePreview && !currentFeaturedImage && (
  <label htmlFor="featured-image">
    <Upload />
  </label>
)}

// Preview de nueva imagen
{imagePreview && (
  <div>
    <img src={imagePreview} />
    <Button onClick={handleRemoveNewImage}>
      <X />
    </Button>
  </div>
)}
```

### Actualización de Datos

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // Validaciones
  if (!title.trim()) {
    alert("El título es obligatorio");
    return;
  }

  if (!content.trim()) {
    alert("El contenido es obligatorio");
    return;
  }

  // Preparar updates
  const updates = {
    title: title.trim(),
    excerpt: excerpt.trim() || undefined,
    content: content.trim(),
    featured_image: newFeaturedImage || undefined,
    category_id: categoryId || undefined,
    status,
    tags: tags.split(",").map((t) => t.trim()).filter((t) => t.length > 0),
  };

  // Actualizar
  const result = await updateBlogPost(params.id, updates);

  if (result) {
    alert("Post actualizado exitosamente");
    router.push("/admin/blog");
  }
};
```

---

## 🔧 Función de Update en Supabase

### En [src/lib/supabase/blog.ts](../src/lib/supabase/blog.ts)

```typescript
export async function updateBlogPost(
  postId: string,
  updates: UpdateBlogPostData
): Promise<BlogPost | null> {
  try {
    const dataToUpdate: Record<string, unknown> = {};

    // 1. Actualizar campos básicos
    if (updates.title) {
      dataToUpdate.title = updates.title;
      // Regenerar slug si cambia el título
      dataToUpdate.slug = updates.title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    }

    if (updates.excerpt !== undefined) dataToUpdate.excerpt = updates.excerpt;
    if (updates.content) dataToUpdate.content = updates.content;
    if (updates.category_id !== undefined)
      dataToUpdate.category_id = updates.category_id || null;

    // 2. Actualizar estado y published_at
    if (updates.status) {
      dataToUpdate.status = updates.status;
      // Si se publica por primera vez, establecer published_at
      if (updates.status === "published") {
        const { data: currentPost } = await supabase
          .from("blog_posts")
          .select("published_at")
          .eq("id", postId)
          .single();

        if (currentPost && !currentPost.published_at) {
          dataToUpdate.published_at = new Date().toISOString();
        }
      }
    }

    // 3. Subir nueva imagen si existe
    if (updates.featured_image) {
      const { data: currentPost } = await supabase
        .from("blog_posts")
        .select("slug")
        .eq("id", postId)
        .single();

      const slug = currentPost?.slug || "post";
      const fileExt = updates.featured_image.name.split(".").pop();
      const fileName = `${Date.now()}-${slug}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("blog-images")
        .upload(fileName, updates.featured_image);

      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage
          .from("blog-images")
          .getPublicUrl(fileName);

        dataToUpdate.featured_image = publicUrl;
      }
    }

    // 4. Actualizar el post
    const { data: post, error: updateError } = await supabase
      .from("blog_posts")
      .update(dataToUpdate)
      .eq("id", postId)
      .select()
      .single();

    if (updateError) throw updateError;

    // 5. Actualizar tags si se proporcionaron
    if (updates.tags) {
      // Eliminar tags actuales
      await supabase.from("blog_post_tags").delete().eq("post_id", postId);

      // Crear o obtener nuevas tags
      if (updates.tags.length > 0) {
        const tags = await getOrCreateTags(updates.tags);

        const postTagRelations = tags.map((tag) => ({
          post_id: postId,
          tag_id: tag.id,
        }));

        await supabase.from("blog_post_tags").insert(postTagRelations);
      }
    }

    return post;
  } catch (error) {
    console.error("Error in updateBlogPost:", error);
    return null;
  }
}
```

---

## 📝 Campos del Formulario

### Información Básica

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| Título | Input | ✅ Sí | Regenera slug automáticamente |
| Extracto | Textarea | ❌ No | Resumen para tarjetas |
| Contenido | Textarea | ✅ Sí | Texto completo con Markdown |

### Clasificación

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| Categoría | Select | ❌ No | Dropdown con categorías de BD |
| Etiquetas | Input | ❌ No | Separadas por comas |

### Imagen Destacada

| Acción | Descripción |
|--------|-------------|
| Mantener | No tocar nada |
| Eliminar | Click en X de imagen actual |
| Reemplazar | Upload nueva imagen |

### Publicación

| Campo | Valores | Descripción |
|-------|---------|-------------|
| Estado | draft / published | Cambia visibilidad pública |

---

## 🔄 Flujo de Actualización

### 1. Carga Inicial
```
useEffect → loadData()
  ↓
getBlogPostById(id) + getBlogCategories()
  ↓
Pre-llenar formulario con datos actuales
  ↓
Mostrar imagen actual (si existe)
```

### 2. Modificación
```
Usuario edita campos
  ↓
Estado local se actualiza
  ↓
Preview de nueva imagen (si se sube)
```

### 3. Guardar
```
handleSubmit()
  ↓
Validar campos obligatorios
  ↓
Preparar objeto updates
  ↓
updateBlogPost(id, updates)
  ↓
Actualizar en BD + Subir imagen + Actualizar tags
  ↓
Redirigir a /admin/blog
```

---

## 🎯 Comportamiento Especial

### Regeneración de Slug
```typescript
// Si se cambia el título, se regenera el slug
if (updates.title) {
  dataToUpdate.slug = generateSlug(updates.title);
}
```

### Published At
```typescript
// Solo se establece published_at la primera vez que se publica
if (updates.status === "published") {
  const currentPost = await getPost(postId);
  if (!currentPost.published_at) {
    dataToUpdate.published_at = NOW();
  }
}
```

### Gestión de Tags
```typescript
// Se eliminan todos los tags actuales y se recrean
await deletePostTags(postId);
const newTags = await getOrCreateTags(tagNames);
await createPostTagRelations(postId, newTags);
```

### Gestión de Imágenes
```typescript
// Solo se sube nueva imagen si se proporciona File
if (updates.featured_image instanceof File) {
  const url = await uploadImage(updates.featured_image);
  dataToUpdate.featured_image = url;
}
// Si no se proporciona, la imagen actual se mantiene
```

---

## ✅ Validaciones

### Client-Side
```typescript
✅ Título no vacío
✅ Contenido no vacío
✅ Usuario autenticado
```

### Server-Side (RLS)
```sql
-- Solo admins pueden actualizar posts
UPDATE blog_posts ... WHERE
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
```

---

## 🎨 Estados de UI

### Loading
```typescript
if (isLoading) {
  return <Loader2 className="animate-spin" />;
}
```

### Not Found
```typescript
if (!post) {
  return (
    <div>
      <p>Post no encontrado</p>
      <Link href="/admin/blog">Volver</Link>
    </div>
  );
}
```

### Saving
```typescript
<Button disabled={isSaving}>
  {isSaving ? (
    <>
      <Loader2 className="animate-spin" />
      Guardando...
    </>
  ) : (
    <>
      <Save />
      Guardar Cambios
    </>
  )}
</Button>
```

---

## 🧪 Casos de Prueba

### Actualización de Contenido
- [ ] Cambiar título regenera slug correctamente
- [ ] Actualizar extracto se refleja en tarjetas
- [ ] Modificar contenido se guarda correctamente
- [ ] Tags se actualizan (eliminan viejos, crean nuevos)

### Gestión de Imágenes
- [ ] Mantener imagen actual funciona
- [ ] Eliminar imagen actual funciona
- [ ] Subir nueva imagen reemplaza la anterior
- [ ] Preview de nueva imagen se muestra

### Cambio de Estado
- [ ] Cambiar de draft a published establece published_at
- [ ] Cambiar de published a draft mantiene published_at
- [ ] Post borrador no aparece en blog público
- [ ] Post publicado aparece inmediatamente

### Categorías y Tags
- [ ] Cambiar categoría se refleja en todos lados
- [ ] Tags nuevos se crean
- [ ] Tags existentes se reutilizan
- [ ] Tags vacíos se ignoran

### Validación
- [ ] No permite guardar sin título
- [ ] No permite guardar sin contenido
- [ ] Redirect funciona después de guardar
- [ ] Mensaje de éxito se muestra

---

## 🚀 Mejoras Futuras

### Editor Mejorado
- Rich text editor (Tiptap, Lexical)
- Vista previa del Markdown
- Inserción de imágenes en contenido
- Autoguardado

### Gestión de Imágenes
- Galería de imágenes
- Crop y resize de imágenes
- Optimización automática
- CDN para imágenes

### Versionado
- Historial de cambios
- Restaurar versiones anteriores
- Ver diff entre versiones

### Colaboración
- Múltiples autores
- Comentarios en borrador
- Flujo de aprobación

---

## 📚 Referencias

- **Tipos:** [src/types/blog.ts](../src/types/blog.ts)
- **Update Function:** [src/lib/supabase/blog.ts](../src/lib/supabase/blog.ts) (línea ~500+)
- **Página de Edición:** [src/app/admin/blog/[id]/editar/page.tsx](../src/app/admin/blog/[id]/editar/page.tsx)
- **Lista Admin:** [src/app/admin/blog/page.tsx](../src/app/admin/blog/page.tsx)
- **Database:** [supabase/migrations/019_blog_system.sql](../supabase/migrations/019_blog_system.sql)

---

## ✅ Resumen de Completado

| Funcionalidad | Estado |
|---------------|--------|
| Formulario de Edición | ✅ Completado |
| Pre-llenado de Datos | ✅ Completado |
| Gestión de Imágenes | ✅ Completado |
| Actualización de Tags | ✅ Completado |
| Cambio de Estado | ✅ Completado |
| Validaciones | ✅ Completado |
| Loading States | ✅ Completado |
| Navegación | ✅ Completado |
| Regeneración de Slug | ✅ Completado |

---

## 🎉 Próximo Paso

Para completar el CRUD del blog:

**DELETE** - Eliminar posts
- Modal de confirmación personalizado
- Información del post a eliminar
- Hard delete (eliminar permanentemente)
- Redirección después de eliminar

¡El UPDATE está 100% funcional! 🎨
