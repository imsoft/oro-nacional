#!/bin/bash

# ================================================
# SCRIPT DE PRUEBA PARA INTERNACIONALIZACIÓN
# ================================================
# Este script ayuda a probar la funcionalidad multilingüe

echo "🌍 Probando funcionalidad de internacionalización..."
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: Ejecuta este script desde la raíz del proyecto"
    exit 1
fi

echo "✅ Directorio del proyecto encontrado"
echo ""

# Verificar que las dependencias están instaladas
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    pnpm install
    echo ""
fi

echo "✅ Dependencias instaladas"
echo ""

# Verificar archivos de configuración
echo "🔍 Verificando archivos de configuración..."

if [ -f "src/i18n/routing.ts" ]; then
    echo "✅ Configuración de i18n encontrada"
else
    echo "❌ Error: src/i18n/routing.ts no encontrado"
    exit 1
fi

if [ -f "messages/es.json" ] && [ -f "messages/en.json" ]; then
    echo "✅ Archivos de traducción encontrados"
else
    echo "❌ Error: Archivos de traducción no encontrados"
    exit 1
fi

if [ -f "src/types/multilingual.ts" ]; then
    echo "✅ Tipos multilingües encontrados"
else
    echo "❌ Error: src/types/multilingual.ts no encontrado"
    exit 1
fi

echo ""

# Verificar archivos de base de datos
echo "🗄️ Verificando scripts de migración..."

if [ -f "database/multilingual-migration.sql" ]; then
    echo "✅ Script de migración de esquema encontrado"
else
    echo "❌ Error: database/multilingual-migration.sql no encontrado"
    exit 1
fi

if [ -f "database/multilingual-data-migration.sql" ]; then
    echo "✅ Script de migración de datos encontrado"
else
    echo "❌ Error: database/multilingual-data-migration.sql no encontrado"
    exit 1
fi

echo ""

# Verificar componentes de administración
echo "🛠️ Verificando componentes de administración..."

if [ -f "src/components/admin/multilingual-form.tsx" ]; then
    echo "✅ Componente de formulario multilingüe encontrado"
else
    echo "❌ Error: src/components/admin/multilingual-form.tsx no encontrado"
    exit 1
fi

if [ -f "src/components/admin/product-form-multilingual.tsx" ]; then
    echo "✅ Formulario de producto multilingüe encontrado"
else
    echo "❌ Error: src/components/admin/product-form-multilingual.tsx no encontrado"
    exit 1
fi

if [ -f "src/components/admin/blog-form-multilingual.tsx" ]; then
    echo "✅ Formulario de blog multilingüe encontrado"
else
    echo "❌ Error: src/components/admin/blog-form-multilingual.tsx no encontrado"
    exit 1
fi

echo ""

# Verificar funciones de API
echo "🔌 Verificando funciones de API..."

if [ -f "src/lib/supabase/products-multilingual.ts" ]; then
    echo "✅ Funciones de productos multilingües encontradas"
else
    echo "❌ Error: src/lib/supabase/products-multilingual.ts no encontrado"
    exit 1
fi

if [ -f "src/lib/supabase/blog-multilingual.ts" ]; then
    echo "✅ Funciones de blog multilingües encontradas"
else
    echo "❌ Error: src/lib/supabase/blog-multilingual.ts no encontrado"
    exit 1
fi

echo ""

# Verificar hooks
echo "🎣 Verificando hooks..."

if [ -f "src/hooks/use-multilingual.ts" ]; then
    echo "✅ Hook multilingüe encontrado"
else
    echo "❌ Error: src/hooks/use-multilingual.ts no encontrado"
    exit 1
fi

echo ""

# Verificar documentación
echo "📚 Verificando documentación..."

if [ -f "docs/MULTILINGUAL_SETUP.md" ]; then
    echo "✅ Documentación encontrada"
else
    echo "❌ Error: docs/MULTILINGUAL_SETUP.md no encontrado"
    exit 1
fi

echo ""

# Verificar variables de entorno
echo "🔐 Verificando variables de entorno..."

if [ -f ".env.local" ]; then
    echo "✅ Archivo .env.local encontrado"
    
    if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local && grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env.local; then
        echo "✅ Variables de Supabase configuradas"
    else
        echo "⚠️  Advertencia: Variables de Supabase no configuradas completamente"
        echo "   Asegúrate de configurar NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY"
    fi
else
    echo "⚠️  Advertencia: Archivo .env.local no encontrado"
    echo "   Crea el archivo con las variables de Supabase"
fi

echo ""

# Intentar compilar el proyecto
echo "🔨 Compilando proyecto..."

if pnpm build > /dev/null 2>&1; then
    echo "✅ Compilación exitosa"
else
    echo "❌ Error en la compilación"
    echo "   Ejecuta 'pnpm build' para ver los errores detallados"
    exit 1
fi

echo ""

# Resumen final
echo "🎉 ¡Verificación completada exitosamente!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Ejecuta las migraciones de base de datos en Supabase:"
echo "   - database/multilingual-migration.sql"
echo "   - database/multilingual-data-migration.sql"
echo ""
echo "2. Configura las variables de entorno en .env.local"
echo ""
echo "3. Prueba los formularios de administración:"
echo "   - /admin/productos/nuevo"
echo "   - /admin/blog/nuevo"
echo ""
echo "4. Verifica que el contenido se muestra correctamente en ambos idiomas"
echo ""
echo "📖 Para más información, consulta: docs/MULTILINGUAL_SETUP.md"
echo ""
echo "🌍 ¡Tu sitio web ahora soporta contenido multilingüe!"
