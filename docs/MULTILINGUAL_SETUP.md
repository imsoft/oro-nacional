# 🌍 Internacionalización (i18n) - Oro Nacional

Este documento explica cómo implementar y usar el sistema de internacionalización completo para productos y blog en español e inglés.

## 📋 Tabla de Contenidos

- [Instalación](#instalación)
- [Migración de Base de Datos](#migración-de-base-de-datos)
- [Estructura de Archivos](#estructura-de-archivos)
- [Uso de Componentes](#uso-de-componentes)
- [API Multilingüe](#api-multilingüe)
- [Administración](#administración)
- [Ejemplos de Uso](#ejemplos-de-uso)

## 🚀 Instalación

### 1. Ejecutar Migración de Base de Datos

```sql
-- Ejecutar en el SQL Editor de Supabase
-- 1. Primero ejecutar: multilingual-migration.sql
-- 2. Luego ejecutar: multilingual-data-migration.sql
```

### 2. Instalar Dependencias

```bash
pnpm install
```

## 🗄️ Migración de Base de Datos

### Paso 1: Modificar Esquema

Ejecuta el archivo `database/multilingual-migration.sql` en Supabase:

```sql
-- Este script:
-- ✅ Agrega columnas _es y _en a todas las tablas
-- ✅ Migra datos existentes
-- ✅ Crea índices para búsquedas
-- ✅ Crea funciones auxiliares
```

### Paso 2: Migrar Datos

Ejecuta el archivo `database/multilingual-data-migration.sql`:

```sql
-- Este script:
-- ✅ Actualiza productos con contenido en inglés
-- ✅ Crea posts de blog de ejemplo
-- ✅ Crea etiquetas multilingües
-- ✅ Asocia etiquetas con posts
```

## 📁 Estructura de Archivos

```
src/
├── types/
│   └── multilingual.ts          # Tipos TypeScript para contenido multilingüe
├── lib/supabase/
│   ├── products-multilingual.ts # Funciones de productos con i18n
│   └── blog-multilingual.ts     # Funciones de blog con i18n
├── components/admin/
│   ├── multilingual-form.tsx    # Componentes base para formularios
│   ├── product-form-multilingual.tsx
│   └── blog-form-multilingual.tsx
├── components/shared/
│   └── multilingual-grids.tsx   # Componentes de ejemplo
└── hooks/
    └── use-multilingual.ts      # Hook personalizado para i18n
```

## 🎯 Uso de Componentes

### Hook Multilingüe

```tsx
import { useMultilingualContent } from "@/hooks/use-multilingual";

function MyComponent() {
  const { locale, getLocalizedText, getLocalizedContent } = useMultilingualContent();
  
  const product = {
    name: { es: "Anillo de Oro", en: "Gold Ring" },
    description: { es: "Descripción en español", en: "Description in English" }
  };
  
  return (
    <div>
      <h1>{getLocalizedText(product.name)}</h1>
      <p>{getLocalizedContent(product.description)}</p>
    </div>
  );
}
```

### Formulario de Producto Multilingüe

```tsx
import { ProductForm } from "@/components/admin/product-form-multilingual";

function AdminProductPage() {
  return (
    <ProductForm
      onSuccess={() => {
        // Redirigir o mostrar mensaje de éxito
      }}
    />
  );
}
```

### Formulario de Blog Multilingüe

```tsx
import { BlogPostForm } from "@/components/admin/blog-form-multilingual";

function AdminBlogPage() {
  return (
    <BlogPostForm
      onSuccess={() => {
        // Redirigir o mostrar mensaje de éxito
      }}
    />
  );
}
```

## 🔌 API Multilingüe

### Obtener Productos

```tsx
import { getProducts } from "@/lib/supabase/products-multilingual";

// Obtener productos en español (por defecto)
const productsES = await getProducts('es');

// Obtener productos en inglés
const productsEN = await getProducts('en');
```

### Obtener Posts de Blog

```tsx
import { getBlogPosts } from "@/lib/supabase/blog-multilingual";

// Obtener posts en español
const postsES = await getBlogPosts('es');

// Obtener posts en inglés
const postsEN = await getBlogPosts('en');
```

### Crear Producto

```tsx
import { createProduct } from "@/lib/supabase/products-multilingual";

const newProduct = await createProduct({
  name: {
    es: "Anillo de Compromiso",
    en: "Engagement Ring"
  },
  description: {
    es: "Hermoso anillo de compromiso en oro 18k",
    en: "Beautiful engagement ring in 18k gold"
  },
  material: {
    es: "Oro 18k",
    en: "18k Gold"
  },
  category_id: "category-uuid",
  price: 25000,
  stock: 5,
  has_engraving: true,
  is_active: true
});
```

## 🛠️ Administración

### Panel de Administración Multilingüe

Los formularios de administración incluyen:

- ✅ **Pestañas de idioma**: Español e Inglés
- ✅ **Validación**: Campos requeridos en ambos idiomas
- ✅ **Vista previa**: Ver cómo se ve el contenido en cada idioma
- ✅ **Indicadores visuales**: Estado de completitud del contenido
- ✅ **Generación automática de slugs**: Para ambos idiomas

### Características del Formulario

1. **Campos Multilingües**:
   - Nombre del producto/post
   - Descripción
   - Material (para productos)
   - Excerpt (para posts)

2. **Validación**:
   - Campos requeridos en ambos idiomas
   - Indicadores visuales de completitud
   - Mensajes de error específicos

3. **Vista Previa**:
   - Cambio de idioma en tiempo real
   - Vista previa del contenido final
   - Formato de publicación

## 📝 Ejemplos de Uso

### Página de Producto

```tsx
import { getProductBySlug } from "@/lib/supabase/products-multilingual";
import { useCurrentLocale } from "@/hooks/use-multilingual";

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const locale = useCurrentLocale();
  const product = await getProductBySlug(params.slug, locale);
  
  if (!product) {
    return <div>Producto no encontrado</div>;
  }
  
  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <p>Material: {product.material}</p>
      <p>Precio: ${product.price.toLocaleString()}</p>
    </div>
  );
}
```

### Página de Blog

```tsx
import { getBlogPostBySlug } from "@/lib/supabase/blog-multilingual";
import { useCurrentLocale } from "@/hooks/use-multilingual";

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const locale = useCurrentLocale();
  const post = await getBlogPostBySlug(params.slug, locale);
  
  if (!post) {
    return <div>Post no encontrado</div>;
  }
  
  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.excerpt}</p>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  );
}
```

## 🔧 Configuración Avanzada

### Personalizar Traducciones

Edita los archivos de traducción:

- `messages/es.json` - Traducciones en español
- `messages/en.json` - Traducciones en inglés

### Agregar Nuevos Idiomas

1. Actualizar `src/i18n/routing.ts`:
```tsx
export const routing = defineRouting({
  locales: ['es', 'en', 'fr'], // Agregar francés
  defaultLocale: 'es',
  localePrefix: 'as-needed'
});
```

2. Crear `messages/fr.json`
3. Actualizar tipos en `src/types/multilingual.ts`
4. Modificar funciones de base de datos

## 🐛 Solución de Problemas

### Error: "Column does not exist"

```sql
-- Verificar que las columnas existen
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'products' AND column_name LIKE '%_en';
```

### Error: "Function does not exist"

```sql
-- Recrear funciones auxiliares
-- Ejecutar nuevamente: multilingual-migration.sql
```

### Contenido no se muestra en inglés

1. Verificar que los datos tienen contenido en inglés
2. Verificar que el locale se está pasando correctamente
3. Revisar la función `getLocalizedText`

## 📊 Monitoreo

### Verificar Datos Multilingües

```sql
-- Productos con contenido en inglés
SELECT COUNT(*) FROM products WHERE name_en IS NOT NULL AND name_en != name_es;

-- Posts de blog con contenido en inglés
SELECT COUNT(*) FROM blog_posts WHERE title_en IS NOT NULL AND title_en != title_es;

-- Categorías con contenido en inglés
SELECT COUNT(*) FROM product_categories WHERE name_en IS NOT NULL AND name_en != name_es;
```

## 🚀 Próximos Pasos

1. **Ejecutar migraciones** en Supabase
2. **Probar formularios** de administración
3. **Actualizar páginas existentes** para usar las nuevas funciones
4. **Configurar SEO** para URLs multilingües
5. **Implementar caché** para mejor rendimiento

## 📞 Soporte

Si tienes problemas con la implementación:

1. Verifica que todas las migraciones se ejecutaron correctamente
2. Revisa los logs de la consola del navegador
3. Verifica que las variables de entorno de Supabase están configuradas
4. Consulta la documentación de Next.js i18n

---

¡Tu sitio web ahora soporta contenido multilingüe completo! 🌍✨
