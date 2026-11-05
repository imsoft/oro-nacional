<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Oro Nacional: guía para trabajar en este proyecto

Tienda en línea de joyería de oro de Oro Nacional (Guadalajara, Jalisco), en producción en https://www.oronacional.com. La desarrolla y mantiene imSoft. La tienda vende en MXN y USD, en español e inglés, y tiene un panel de administración completo.

Este archivo es el contexto de arranque. Léelo completo antes de hacer cambios.

## Stack

- **Next.js 16** (App Router, Turbopack, `params` asíncronos) con **React 19** y TypeScript. Lee el bloque de arriba: las APIs de Next cambian entre versiones.
- **next-intl**: idiomas `es` (predeterminado, sin prefijo en la URL) y `en` (prefijo `/en`). El middleware vive en `src/proxy.ts` (en Next 16 `middleware.ts` se llama `proxy.ts`).
- **Tailwind CSS + shadcn/ui** (`src/components/ui`), iconos de `lucide-react`, avisos con `sonner`.
- **Supabase**: Postgres con RLS, Auth y Storage (bucket `product-images`).
- **Stripe** (API `2026-08-26.dahlia`): Payment Element con PaymentIntent y enlaces de pago.
- **Resend + react-email** para los correos transaccionales.
- **zustand** para el carrito, los favoritos y la sesión (`src/stores`).
- **exceljs + jszip** para la importación masiva de productos, cargados con `import()` dinámico solo en el navegador.
- Despliegue en **Vercel (plan Hobby)**: cada push a `main` publica en producción.
- Gestor de paquetes: **pnpm**.

## Comandos

```bash
pnpm dev      # servidor local (Turbopack)
pnpm build    # compilación de producción; correrlo antes de cada push
pnpm lint     # ESLint
npx tsc --noEmit   # revisión de tipos
```

No hay pruebas automatizadas. Para verificar, corre build, tipos y lint, y revisa la pantalla en el navegador (escritorio y móvil).

## Estructura

```
src/
  app/[locale]/
    (website)/   inicio, nosotros, blog, contacto, FAQ, cuidados, envíos, privacidad, términos
    (catalog)/   catalog, rings, necklaces, bracelets, earrings, product/[slug]
    (checkout)/  cart, checkout, checkout/confirmacion
    (user)/      profile, my-orders, favorites
    (auth)/      login, register, reset-password, update-password
    admin/       panel (protegido en admin-shell.tsx: solo role = admin)
    pago/[orderId]  página pública de pago para enlaces a meses con plazo fijo
    [...rest]    404 con la marca
  app/api/
    checkout/            crea el pedido y el PaymentIntent (precios resueltos en servidor)
    checkout/status/     estado del pago para la pantalla de confirmación
    stripe/webhook/      confirma pagos y actualiza pedidos
    pago/[orderId]/      resumen y cobro de enlaces a meses
    admin/payment-links/ crea enlaces de pago (requiere admin)
    admin/orders/status/ cambia el estado del pedido y envía el correo al cliente
    email/               formulario de contacto, reenvío de verificación
    settings/            tipo de cambio y cotización del oro (lectura pública)
    market/prices/       datos del ticker de mercado
  components/  por área (admin, catalog, product, checkout, shared, ui...)
  lib/
    supabase/       acceso a datos por dominio (products, orders, pricing, blog, settings...)
    supabase/admin.ts  cliente con service role: solo en servidor
    orders/server.ts   creación de pedidos y finalizePaidOrder
    payment-links/     enlaces de pago e intereses de meses (installments.ts)
    product-import/    plantilla Excel y lectura de la importación masiva
    email/resend.ts    envío de todos los correos
    site-contact.ts    teléfono, correo, dirección y redes: fuente única
    seo.ts, whatsapp.ts
  stores/      cart-store (persist v2, precios en MXN), favorites-store, auth-store
  contexts/currency-context.tsx  MXN/USD para mostrar precios
  types/       tipos por dominio
messages/es.json, messages/en.json   todos los textos de la interfaz
emails/        plantillas react-email; emails/components/email-layout.tsx es el diseño común
supabase/migrations/       migraciones SQL numeradas (la última es 058)
supabase/email-templates/  plantillas HTML de Auth para pegar en el panel de Supabase
docs/          guías antiguas de configuración (pueden estar desactualizadas)
```

## Modelo de datos (lo esencial)

- **products**: `name_es/en`, `slug_es/en`, `description_es/en`, `material_es/en`, `category_id`, `is_active`, `available_languages`, `base_price_usd`.
- **product_sizes**: cada talla tiene su propio `price` (MXN), `price_usd`, `stock` y `weight` (gramos, o piezas en Broquel). El precio real vive en las tallas, no en `products`.
- **product_specifications** (clave y valor en es/en) y **product_images** (archivos en Storage).
- **product_categories**: categorías públicas (Anillos, Cadenas, Esclavas...). Algunos nombres en la base traen espacios al final; normaliza al comparar.
- **Categorías internas** (Gramo y Broquel) con subcategorías: definen cómo se calcula el precio. Solo las leen usuarios autenticados.
- **orders / order_items**: pedidos de la tienda y de los enlaces de pago (`installments_plan`, `base_amount`).
- **profiles**: `role` (`admin` o cliente). La función SQL `is_store_admin()` se usa en las políticas RLS; un usuario no puede cambiarse su propio rol.
- **store_settings**: tipo de cambio, datos de contacto y otros ajustes de la tienda.

## Reglas de negocio importantes

- **Precios.** Se calculan con `calculateDynamicProductPrice` en `src/lib/supabase/pricing.ts`, a partir de la cotización del oro, los parámetros de la subcategoría y los gramos (o piezas en Broquel). Las calculadoras del admin están en `admin/calculadora-precios`. Si cambia el tipo de cambio, la migración 052 recalcula los precios USD.
- **El checkout no confía en el navegador.** El cliente manda solo producto, talla y cantidad; `/api/checkout` resuelve precios y total en el servidor. El webhook de Stripe es quien marca un pedido como pagado (`finalizePaidOrder`).
- **Meses con intereses.** Son enlaces de pago con plazo fijo de 3, 6 o 12 meses (mínimos $300, $600 y $1,200). El total se "infla" para cubrir la comisión de Stripe más IVA: `total = base / (1 − tasa × 1.16)`. La lógica vive en `src/lib/payment-links/installments.ts`. Stripe Checkout no permite fijar el plazo, por eso existe la página propia `/pago/[orderId]`, que confirma el PaymentIntent con `plan: { type: 'fixed_count', ... }`. Solo tarjetas de crédito mexicanas. En los textos siempre es "meses **con** intereses", nunca "sin intereses".
- **Importación desde Excel** (`/admin/productos/importar`): una fila por talla, agrupadas por la columna Clave; fotos en un ZIP enlazadas por nombre de archivo; los precios vacíos se calculan con la calculadora. Si agregas un campo al producto, actualiza `src/lib/product-import/columns.ts`, `template.ts` y `parse.ts`.
- **Contacto oficial.** Teléfono y WhatsApp 33 1608 3664. Cámbialo solo en `src/lib/site-contact.ts` (y en `store_settings` si aplica), nunca escrito a mano en componentes.
- **Correos.** Todos usan `EmailLayout` (tema claro, logo, pie con contacto). Los asuntos van en español y sin emojis. Hay correo por cada cambio de estado del pedido.

## Convenciones

- **Idioma.** La interfaz pública va en es y en, con textos en `messages/*.json` y `useTranslations`. Al agregar una clave, ponla en **ambos** archivos. El panel de administración está mayormente en español, con algunos textos escritos directo en el código. Los comentarios y los mensajes de commit van en español.
- **Enlaces internos.** Usa `Link`, `useRouter`, `redirect` de `@/i18n/routing`, no los de `next/link`, para conservar el idioma.
- **Imágenes.** `images.unoptimized: true` en `next.config.ts`: el optimizador de Vercel agotó la cuota del plan Hobby y respondía 402. No lo reactives sin cambiar de plan.
- **Diseño.** Dorado de marca `#D4AF37` (hover `#B8941E`). Los botones dorados llevan **texto oscuro `#1a1a1a`**, no blanco (contraste 8.3:1 contra 2.1:1). Etiquetas visibles en formularios, errores con `role="alert"`, todo responsive desde 390 px.
- **Seguridad.**
  - `SUPABASE_SERVICE_ROLE_KEY` y `STRIPE_SECRET_KEY` solo en código de servidor (rutas `app/api`, `lib/*/server.ts`, `lib/supabase/admin.ts`).
  - Las rutas de API del admin comprueban el rol en el servidor.
  - Las páginas privadas (admin, cuenta, pago) llevan `noindex`.
  - Las cabeceras de seguridad están en `next.config.ts`.
- **Base de datos.** Cada cambio de esquema es una migración nueva con el siguiente número (`059_...sql`). Las migraciones **no** se aplican solas: el usuario las corre en el SQL Editor de Supabase. Avisa siempre cuando un cambio requiera migración.

## Variables de entorno

Ver `.env.example`. Las principales:

- Supabase: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
- Stripe: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`.
- Resend: `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `RESEND_ADMIN_EMAIL`.
- Sitio y analítica: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_GA_MEASUREMENT_ID`.

En producción viven en Vercel. Nunca subas `.env` ni `.env.local`.

## Flujo de trabajo

1. Haz el cambio y corre `npx tsc --noEmit`, `pnpm lint` y `pnpm build`.
2. Revisa en el navegador las pantallas afectadas, en escritorio y móvil. Si creas rutas temporales de vista previa (por ejemplo `src/app/[locale]/zz-preview/`), bórralas antes del commit.
3. Haz commit en `main` con un mensaje en español del estilo `feat: ...` o `fix: ...`.
4. Push solo cuando se pida: publica en producción de inmediato.
5. Si el cambio necesita migración SQL, variables nuevas en Vercel o ajustes en Stripe o Supabase, dilo explícitamente: esos pasos los hace una persona.
