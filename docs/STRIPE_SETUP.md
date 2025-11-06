# Configuración de Stripe

Este documento explica cómo configurar Stripe para procesar pagos con tarjeta en Oro Nacional.

## Requisitos Previos

1. Tener una cuenta de Stripe (puedes crearla en [stripe.com](https://stripe.com))
2. Acceso a las API keys de Stripe (disponibles en el Dashboard de Stripe)

## Variables de Entorno

Agrega las siguientes variables de entorno a tu archivo `.env.local`:

```bash
# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_...  # Clave secreta de Stripe (comienza con sk_test_ o sk_live_)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...  # Clave pública de Stripe (comienza con pk_test_ o pk_live_)

# Stripe Webhook Secret (opcional para desarrollo, necesario en producción)
STRIPE_WEBHOOK_SECRET=whsec_...  # Se obtiene al configurar el webhook en Stripe Dashboard
```

### Obtener las API Keys

1. Inicia sesión en tu cuenta de Stripe
2. Ve a **Developers > API keys**
3. Encuentra tus claves:
   - **Publishable key**: Clave pública que puedes compartir (comienza con `pk_test_` en modo test o `pk_live_` en producción)
   - **Secret key**: Clave secreta que NO debes compartir (comienza con `sk_test_` en modo test o `sk_live_` en producción)

## Configurar el Webhook

Los webhooks permiten que Stripe notifique a tu aplicación cuando ocurren eventos de pago (pago exitoso, fallido, etc.).

### Configuración en Desarrollo (usando Stripe CLI)

1. Instala Stripe CLI: https://stripe.com/docs/stripe-cli
2. Ejecuta: `stripe login`
3. Ejecuta: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
4. Copia el webhook secret que aparece (comienza con `whsec_`) y agrégala a tu `.env.local`

### Configuración en Producción

1. Ve a **Developers > Webhooks** en Stripe Dashboard
2. Haz clic en **Add endpoint**
3. Ingresa la URL de tu endpoint: `https://tu-dominio.com/api/stripe/webhook`
4. Selecciona los eventos a escuchar:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
5. Copia el **Signing secret** y agrégala a tus variables de entorno de producción

## Actualizar la Base de Datos

Ejecuta la migración para agregar el campo `stripe_payment_intent_id` a la tabla `orders`:

```sql
-- Ejecutar en Supabase SQL Editor
-- Ver archivo: supabase/migrations/004_add_stripe_fields.sql
```

O ejecuta el SQL directamente:

```sql
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;

CREATE INDEX IF NOT EXISTS idx_orders_stripe_payment_intent_id 
ON orders(stripe_payment_intent_id) 
WHERE stripe_payment_intent_id IS NOT NULL;
```

## Cómo Funciona

### Flujo de Pago con Stripe

1. El usuario completa el formulario de envío en el checkout
2. Cuando selecciona "Tarjeta" como método de pago:
   - Se crea un pedido en la base de datos con estado "Pendiente"
   - Se crea un Payment Intent en Stripe
   - Se muestra el formulario de pago de Stripe (Stripe Elements)
3. El usuario ingresa los datos de su tarjeta
4. Al confirmar el pago:
   - Stripe procesa el pago
   - Si es exitoso, se actualiza el pedido a "Pagado" y estado "Procesando"
   - Se envían correos de confirmación al cliente y al admin
   - El carrito se limpia y se redirige a la página de confirmación

### Flujo de Webhook

1. Stripe envía un webhook a `/api/stripe/webhook` cuando ocurre un evento
2. El webhook verifica la firma para asegurar que viene de Stripe
3. Según el tipo de evento:
   - `payment_intent.succeeded`: Actualiza el pedido a "Pagado" y "Procesando"
   - `payment_intent.payment_failed`: Actualiza el pedido a "Pago Fallido"
   - `payment_intent.canceled`: Actualiza el pedido a "Cancelado"

## Modo de Prueba (Test Mode)

Stripe tiene un modo de prueba que te permite probar pagos sin usar tarjetas reales:

### Tarjetas de Prueba

- **Pago exitoso**: `4242 4242 4242 4242`
- **Pago fallido**: `4000 0000 0000 0002`
- **Requiere autenticación 3D Secure**: `4000 0025 0000 3155`
- **Cualquier fecha futura** (MM/AA)
- **Cualquier CVC de 3 dígitos**

Más tarjetas de prueba: https://stripe.com/docs/testing

## Seguridad

⚠️ **IMPORTANTE**:
- NUNCA compartas tu `STRIPE_SECRET_KEY` públicamente
- NUNCA la incluyas en código que se suba a repositorios públicos
- Usa variables de entorno para todas las claves
- En producción, usa claves de producción (`sk_live_` y `pk_live_`)

## Verificación

Para verificar que todo está configurado correctamente:

1. Agrega las variables de entorno
2. Inicia el servidor: `pnpm dev`
3. Ve al checkout y completa el formulario de envío
4. Selecciona "Tarjeta" como método de pago
5. Deberías ver el formulario de Stripe Elements
6. Usa una tarjeta de prueba para verificar el flujo completo

## Solución de Problemas

### "Stripe is not configured"
- Verifica que `STRIPE_SECRET_KEY` y `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` estén en tu `.env.local`
- Reinicia el servidor después de agregar las variables

### "Error al inicializar el pago con Stripe"
- Verifica que las API keys sean correctas
- Asegúrate de usar claves del mismo modo (test o live)

### El webhook no funciona
- Verifica que `STRIPE_WEBHOOK_SECRET` esté configurado
- En desarrollo, usa Stripe CLI para reenviar eventos localmente
- En producción, verifica que la URL del webhook sea accesible públicamente

## Recursos Adicionales

- [Documentación de Stripe](https://stripe.com/docs)
- [Stripe Elements](https://stripe.com/docs/payments/elements)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Testing con Stripe](https://stripe.com/docs/testing)

