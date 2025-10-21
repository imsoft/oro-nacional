# Panel de Administración - Oro Nacional

## Acceso al Dashboard Administrativo

### Credenciales de Administrador

Para acceder al panel de administración, utiliza las siguientes credenciales:

```
Email: admin@oronacional.com
Contraseña: admin123
```

### URL del Panel

Una vez autenticado, puedes acceder al panel de administración en:
- **URL**: `/admin`
- O haz clic en "Panel de Administración" en el menú de usuario (solo visible para administradores)

---

## Funcionalidades del Dashboard

### 1. Dashboard Principal (`/admin`)
- Estadísticas generales de la tienda
- Ventas totales
- Número de pedidos
- Cantidad de productos
- Posts de blog
- Lista de pedidos recientes
- Métricas rápidas (clientes totales, inventario bajo, tasa de conversión)

### 2. Gestión de Productos (`/admin/productos`)
- Lista completa de productos con:
  - Imagen del producto
  - Nombre y categoría
  - Precio
  - Stock disponible
  - Material
- Búsqueda de productos
- Botones de acción:
  - Editar producto
  - Eliminar producto
  - Crear nuevo producto
- Estadísticas:
  - Total de productos
  - Valor del inventario
  - Productos con stock bajo

### 3. Gestión de Blog (`/admin/blog`)
- Lista de publicaciones con:
  - Título
  - Categoría
  - Autor
  - Fecha de publicación
  - Estado (Publicado/Borrador)
  - Número de vistas
- Búsqueda de posts
- Botones de acción:
  - Editar post
  - Eliminar post
  - Crear nuevo post
- Estadísticas:
  - Total de posts
  - Posts publicados
  - Borradores
  - Vistas totales

### 4. Gestión de Pedidos (`/admin/pedidos`)
- Lista de todos los pedidos con:
  - ID del pedido
  - Información del cliente
  - Productos ordenados
  - Total del pedido
  - Estado (Procesando/Enviado/Entregado)
  - Fecha del pedido
- Filtros:
  - Búsqueda por ID o cliente
  - Filtro por estado
- Botón para ver detalles del pedido
- Estadísticas:
  - Total de pedidos
  - Pedidos en proceso
  - Pedidos enviados
  - Ventas totales

---

## Características del Sistema

### Autenticación y Roles
- Sistema de roles (user/admin)
- Los usuarios admin tienen acceso exclusivo al dashboard
- Redirección automática si no estás autenticado o no eres admin
- Usuario admin creado automáticamente al cargar la aplicación

### Protección de Rutas
- Las rutas `/admin/*` están protegidas
- Solo usuarios con rol "admin" pueden acceder
- Redirección automática a `/login` si no tienes permisos

### Diseño Responsive
- Sidebar colapsable en móvil
- Tablas responsivas
- Diseño adaptado para todas las pantallas

---

## Estado Actual

### ✅ Implementado
- Sistema de autenticación con roles
- Dashboard con estadísticas
- Vista de productos (solo lectura)
- Vista de blog (solo lectura)
- Vista de pedidos (solo lectura)
- Navegación completa
- Links en navbar para admin

### 🔜 Próximos Pasos (Para integración con BD)
- Formularios CRUD completos para productos
- Formularios CRUD completos para blog
- Editor rico de texto para blog
- Upload de imágenes
- Cambio de estado de pedidos
- Gestión de usuarios
- Reportes y analytics avanzados
- Exportación de datos

---

## Notas Técnicas

### Stack Utilizado
- **Framework**: Next.js 15 (App Router)
- **Estado Global**: Zustand
- **UI Components**: shadcn/ui + Radix UI
- **Estilos**: Tailwind CSS
- **Persistencia**: localStorage (temporal, para demostración)

### Estructura de Archivos
```
src/
├── app/
│   └── admin/
│       ├── layout.tsx          # Layout del dashboard
│       ├── page.tsx            # Dashboard principal
│       ├── productos/
│       │   └── page.tsx        # Gestión de productos
│       ├── blog/
│       │   └── page.tsx        # Gestión de blog
│       └── pedidos/
│           └── page.tsx        # Gestión de pedidos
├── stores/
│   └── auth-store.ts           # Store con roles de usuario
└── components/
    └── shared/
        └── navbar.tsx          # Navbar con link admin
```

---

## Cambiar Contraseña de Admin

La contraseña del admin está en el código fuente. Para cambiarla:

1. Abre `src/stores/auth-store.ts`
2. Busca la función `initializeAdmin()`
3. Modifica el campo `password` en el objeto `admin`
4. Reinicia la aplicación

**Importante**: Antes de producción, deberías:
- Hashear las contraseñas
- Usar variables de entorno
- Implementar autenticación con backend real
- Agregar autenticación de dos factores
