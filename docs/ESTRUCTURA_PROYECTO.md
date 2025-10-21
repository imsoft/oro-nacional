# 📁 Estructura del Proyecto - Oro Nacional

## 📊 Estructura Actual

```
oro-nacional/
├── public/                          # Archivos estáticos
├── src/
│   ├── app/                         # Rutas de Next.js (App Router)
│   │   ├── (public-routes)/        # 🚀 PROPUESTA: Agrupar rutas públicas
│   │   │   ├── page.tsx            # Home
│   │   │   ├── catalogo/
│   │   │   ├── anillos/
│   │   │   ├── collares/
│   │   │   ├── aretes/
│   │   │   ├── pulseras/
│   │   │   ├── producto/[id]/
│   │   │   ├── blog/
│   │   │   ├── blog/[slug]/
│   │   │   ├── nosotros/
│   │   │   ├── contacto/
│   │   │   ├── envios/
│   │   │   ├── garantia/
│   │   │   ├── cuidados/
│   │   │   ├── preguntas-frecuentes/
│   │   │   ├── terminos/
│   │   │   └── privacidad/
│   │   │
│   │   ├── (auth)/                 # 🚀 PROPUESTA: Agrupar rutas de autenticación
│   │   │   ├── login/
│   │   │   ├── registro/
│   │   │   └── recuperar-contrasena/
│   │   │
│   │   ├── (user)/                 # 🚀 PROPUESTA: Agrupar rutas de usuario
│   │   │   ├── mis-pedidos/
│   │   │   ├── carrito/
│   │   │   └── checkout/
│   │   │       └── confirmacion/
│   │   │
│   │   └── admin/                  # ✅ YA ORGANIZADO: Rutas de administración
│   │       ├── layout.tsx          # Layout con sidebar
│   │       ├── page.tsx            # Dashboard
│   │       ├── productos/
│   │       ├── blog/
│   │       ├── pedidos/
│   │       ├── usuarios/
│   │       └── configuracion/
│   │
│   ├── components/                 # Componentes reutilizables
│   │   ├── ui/                     # ✅ Componentes shadcn/ui
│   │   ├── shared/                 # ✅ Componentes compartidos (Navbar, Footer)
│   │   ├── cart/                   # ✅ Componentes del carrito
│   │   ├── catalog/                # ✅ Componentes del catálogo
│   │   ├── product/                # ✅ Componentes de productos
│   │   ├── contact/                # ✅ Componentes de contacto
│   │   └── about/                  # ✅ Componentes de nosotros
│   │
│   ├── stores/                     # ✅ Stores de Zustand
│   │   ├── auth-store.ts
│   │   └── cart-store.ts
│   │
│   └── lib/                        # ✅ Utilidades y helpers
│       ├── utils.ts
│       └── blog-data.ts
│
├── components.json                 # Configuración de shadcn/ui
├── next.config.ts
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md
```

---

## 🎯 Propuesta de Organización con Route Groups

### ¿Por qué usar Route Groups?

Los Route Groups `(nombre)` en Next.js permiten:
- ✅ Organizar rutas sin afectar la URL
- ✅ Compartir layouts entre grupos de rutas
- ✅ Mejor estructura mental del proyecto
- ✅ Separación de concerns

### Estructura Propuesta:

```
src/app/
├── layout.tsx                      # Layout raíz
├── page.tsx                        # Home page
│
├── (public)/                       # 🆕 Rutas públicas
│   ├── catalogo/
│   ├── anillos/
│   ├── collares/
│   ├── aretes/
│   ├── pulseras/
│   ├── producto/[id]/
│   ├── blog/
│   ├── blog/[slug]/
│   ├── nosotros/
│   ├── contacto/
│   ├── envios/
│   ├── garantia/
│   ├── cuidados/
│   ├── preguntas-frecuentes/
│   ├── terminos/
│   └── privacidad/
│
├── (auth)/                         # 🆕 Autenticación
│   ├── login/
│   ├── registro/
│   └── recuperar-contrasena/
│
├── (dashboard)/                    # 🆕 Usuario autenticado
│   ├── mis-pedidos/
│   ├── perfil/                     # 🆕 OPCIONAL: Perfil de usuario
│   └── favoritos/                  # 🆕 OPCIONAL: Lista de deseos
│
├── (checkout)/                     # 🆕 Proceso de compra
│   ├── carrito/
│   └── checkout/
│       └── confirmacion/
│
└── admin/                          # ✅ Admin (ya tiene su layout)
    ├── layout.tsx
    ├── page.tsx
    ├── productos/
    ├── blog/
    ├── pedidos/
    ├── usuarios/
    └── configuracion/
```

---

## 📋 Plan de Reorganización

### Opción 1: Reorganización Completa (Recomendada para nuevo proyecto)

**Ventajas:**
- ✅ Mejor organización mental
- ✅ Fácil encontrar archivos relacionados
- ✅ Layouts compartidos por grupo

**Desventajas:**
- ⚠️ Requiere mover muchos archivos
- ⚠️ Actualizar imports

### Opción 2: Reorganización Parcial (Recomendada para tu caso)

**Solo reorganizar lo más importante:**

1. **Agrupar rutas de autenticación:**
```
src/app/(auth)/
├── login/
├── registro/
└── recuperar-contrasena/
```

2. **Agrupar rutas de usuario:**
```
src/app/(user)/
├── mis-pedidos/
├── carrito/
└── checkout/
```

3. **Mantener el resto como está**

---

## 🔄 Estructura de Componentes (Actual - BIEN ORGANIZADA)

```
src/components/
├── ui/                             ✅ Componentes base de shadcn
│   ├── button.tsx
│   ├── input.tsx
│   ├── card.tsx
│   ├── dropdown-menu.tsx
│   ├── tabs.tsx
│   ├── select.tsx
│   ├── textarea.tsx
│   └── ... (11 componentes más)
│
├── shared/                         ✅ Componentes globales
│   ├── navbar.tsx                  # Navegación principal
│   ├── footer.tsx                  # Footer global
│   └── breadcrumbs.tsx             # Migas de pan
│
├── cart/                           ✅ Funcionalidad del carrito
│   ├── cart-item.tsx               # Item individual
│   └── order-summary.tsx           # Resumen de orden
│
├── catalog/                        ✅ Catálogo de productos
│   ├── catalog-filters.tsx         # Filtros
│   ├── catalog-header.tsx          # Header
│   ├── category-filters.tsx        # Filtros por categoría
│   └── products-grid.tsx           # Grid de productos
│
├── product/                        ✅ Detalle de producto
│   ├── product-gallery.tsx         # Galería de imágenes
│   ├── product-info.tsx            # Información
│   └── related-products.tsx        # Productos relacionados
│
├── contact/                        ✅ Página de contacto
│   ├── contact-form.tsx            # Formulario
│   └── contact-info.tsx            # Información
│
└── about/                          ✅ Página de nosotros
    └── artisan-process.tsx         # Proceso artesanal
```

**CONCLUSIÓN:** La estructura de componentes está PERFECTA. No necesita cambios.

---

## 📦 Stores (Actual - BIEN ORGANIZADA)

```
src/stores/
├── auth-store.ts                   ✅ Autenticación y roles
└── cart-store.ts                   ✅ Carrito de compras
```

**CONCLUSIÓN:** Stores bien organizados. Posibles adiciones futuras:
- `product-store.ts` - Gestión de productos (admin)
- `order-store.ts` - Gestión de pedidos
- `ui-store.ts` - Estado de UI (modales, loading, etc)

---

## 🛠️ Lib (Actual - BIEN ORGANIZADA)

```
src/lib/
├── utils.ts                        ✅ Utilidades de Tailwind
└── blog-data.ts                    ✅ Datos del blog
```

**POSIBLES ADICIONES:**
```
src/lib/
├── utils.ts
├── blog-data.ts
├── products-data.ts                # 🆕 Datos de productos
├── validations.ts                  # 🆕 Validaciones de formularios
├── formatters.ts                   # 🆕 Formateo de fechas, moneda, etc
└── constants.ts                    # 🆕 Constantes globales
```

---

## 📁 Posibles Nuevas Carpetas

### 1. **Types** (TypeScript)
```
src/types/
├── product.ts                      # Tipos de productos
├── order.ts                        # Tipos de pedidos
├── user.ts                         # Tipos de usuarios
└── index.ts                        # Export barrel
```

### 2. **Hooks** (Custom hooks)
```
src/hooks/
├── use-cart.ts                     # Hook del carrito
├── use-auth.ts                     # Hook de autenticación
├── use-debounce.ts                 # Hook de debounce
└── use-local-storage.ts            # Hook de localStorage
```

### 3. **Services** (API calls - futuro)
```
src/services/
├── api.ts                          # Configuración de API
├── products.service.ts             # Servicios de productos
├── orders.service.ts               # Servicios de pedidos
└── auth.service.ts                 # Servicios de auth
```

---

## 🎨 Recomendación Final

### Para tu proyecto ACTUAL:

**✅ MANTENER como está:**
- `src/components/` - Perfecto
- `src/stores/` - Perfecto
- `src/lib/` - Perfecto
- `src/app/admin/` - Perfecto

**🔄 OPCIONAL: Reorganizar solo si quieres:**
- Agrupar rutas de auth en `(auth)`
- Agrupar rutas de usuario en `(user)`
- Agrupar rutas de checkout en `(checkout)`

**🆕 AGREGAR cuando sea necesario:**
- `src/types/` - Cuando tengas más tipos compartidos
- `src/hooks/` - Si creas custom hooks reutilizables
- `src/services/` - Cuando integres con backend

---

## 📊 Comandos para Reorganizar (Si decides hacerlo)

### Paso 1: Crear Route Groups

```bash
# Crear carpetas de grupos
mkdir -p src/app/\(auth\)
mkdir -p src/app/\(user\)
mkdir -p src/app/\(checkout\)
mkdir -p src/app/\(public\)
```

### Paso 2: Mover archivos de autenticación

```bash
mv src/app/login src/app/\(auth\)/
mv src/app/registro src/app/\(auth\)/
mv src/app/recuperar-contrasena src/app/\(auth\)/
```

### Paso 3: Mover archivos de usuario

```bash
mv src/app/mis-pedidos src/app/\(user\)/
```

### Paso 4: Mover archivos de checkout

```bash
mv src/app/carrito src/app/\(checkout\)/
mv src/app/checkout src/app/\(checkout\)/
```

**IMPORTANTE:** Después de mover, NO necesitas actualizar imports porque las URLs se mantienen igual.

---

## ✅ Conclusión

Tu proyecto **YA ESTÁ BIEN ORGANIZADO**.

Si quieres mejorar aún más:
1. Usa Route Groups para agrupar rutas relacionadas
2. Agrega carpetas `types/` y `hooks/` cuando sea necesario
3. Mantén la estructura de `components/` como está (está perfecta)

**Mi recomendación:**
- No hagas cambios grandes ahora
- Cuando integres backend, agrega `services/` y `types/`
- La estructura actual es limpia y escalable
