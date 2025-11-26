# Migraciones de Base de Datos

Esta carpeta contiene todas las migraciones formales de Supabase para el proyecto Oro Nacional.

## Estructura

Las migraciones están numeradas secuencialmente y se ejecutan automáticamente cuando se despliega o sincroniza la base de datos con el CLI de Supabase.

## Migraciones Principales

- **019_blog_system.sql**: Sistema completo de blog (categorías, posts, etiquetas)
- **020_multilingual_support.sql**: Soporte multilingüe (español/inglés) para productos, categorías y blog
- **021_storage_product_images.sql**: Políticas de storage para imágenes de productos
- **022_storage_blog_images.sql**: Políticas de storage para imágenes del blog
- **023_add_available_languages.sql**: Agregar columna `available_languages` a productos y posts

## Uso

Para aplicar las migraciones:

```bash
# Con Supabase CLI
supabase db push

# O ejecutar manualmente en Supabase Dashboard > SQL Editor
```

## Nota sobre Scripts Antiguos

Los scripts que estaban en la carpeta `database/` (como fixes temporales, diagnósticos, etc.) han sido consolidados aquí. Los scripts de setup importantes se han convertido en migraciones formales numeradas.

