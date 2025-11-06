# Variables de Entorno Requeridas

Este documento lista todas las variables de entorno que necesitas agregar a tu archivo `.env.local`.

## 📋 Lista Completa de Variables

Copia y pega esto en tu archivo `.env.local`:

```env
# =============================================
# Variables de Entorno - Oro Nacional
# =============================================

# =============================================
# Supabase (REQUERIDO)
# =============================================
# Obtén estas credenciales en: https://supabase.com/dashboard/project/_/settings/api
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui

# =============================================
# Resend - Correos Electrónicos (OPCIONAL pero recomendado)
# =============================================
# Obtén tu API key en: https://resend.com/api-keys
# Requerido para enviar correos de contacto y pedidos
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Email desde el cual se enviarán los correos (debe estar verificado en Resend)
RESEND_FROM_EMAIL=noreply@tudominio.com

# Email donde se recibirán las notificaciones de admin (contactos, pedidos nuevos)
RESEND_ADMIN_EMAIL=admin@tudominio.com

# =============================================
# Stripe - Pagos con Tarjeta (OPCIONAL)
# =============================================
# Obtén tus API keys en: https://dashboard.stripe.com/apikeys
# Requerido para procesar pagos con tarjeta
STRIPE_SECRET_KEY=sk_test_TU_CLAVE_SECRETA_AQUI

# Clave pública de Stripe (visible en el frontend)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_TU_CLAVE_PUBLICA_AQUI

# Webhook secret de Stripe (se obtiene al configurar el webhook)
# Obtén el webhook secret en: https://dashboard.stripe.com/webhooks
# Opcional en desarrollo, necesario en producción
STRIPE_WEBHOOK_SECRET=whsec_TU_WEBHOOK_SECRET_AQUI

# =============================================
# Market Ticker - Precios en Tiempo Real (OPCIONAL)
# =============================================
# API para obtener precios de metales preciosos
# Registro: https://metals-api.com/
METALS_API_KEY=tu_api_key_aqui

# API para obtener tipo de cambio USD/MXN
# Registro: https://www.exchangerate-api.com/
EXCHANGE_RATE_API_KEY=tu_api_key_aqui

# API alternativa para tipo de cambio (opcional)
# Registro: https://fixer.io/
FIXER_API_KEY=tu_api_key_aqui
```

## 📝 Descripción de cada Variable

### Supabase (REQUERIDO)
- **NEXT_PUBLIC_SUPABASE_URL**: URL de tu proyecto Supabase
- **NEXT_PUBLIC_SUPABASE_ANON_KEY**: Clave pública anónima de Supabase

### Resend (OPCIONAL pero recomendado)
- **RESEND_API_KEY**: API key de Resend para enviar correos
- **RESEND_FROM_EMAIL**: Email verificado desde el cual se envían los correos
- **RESEND_ADMIN_EMAIL**: Email donde se reciben notificaciones de admin

### Stripe (OPCIONAL)
- **STRIPE_SECRET_KEY**: Clave secreta de Stripe (backend)
- **NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY**: Clave pública de Stripe (frontend)
- **STRIPE_WEBHOOK_SECRET**: Secret para verificar webhooks de Stripe

### Market Ticker (OPCIONAL)
- **METALS_API_KEY**: API key para obtener precios de metales preciosos
- **EXCHANGE_RATE_API_KEY**: API key para obtener tipo de cambio
- **FIXER_API_KEY**: API key alternativa para tipo de cambio

## 🔑 Cómo Obtener cada API Key

### Supabase
1. Ve a https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Ve a **Settings > API**
4. Copia la **URL** y la **anon/public key**

### Resend
1. Ve a https://resend.com/api-keys
2. Crea una nueva API key
3. Copia la key (comienza con `re_`)
4. Verifica tu dominio o email en Resend Dashboard

### Stripe
1. Ve a https://dashboard.stripe.com/apikeys
2. Copia la **Secret key** (comienza con `sk_test_` o `sk_live_`)
3. Copia la **Publishable key** (comienza con `pk_test_` o `pk_live_`)
4. Para el webhook secret, ve a **Developers > Webhooks** y crea un endpoint

### Market Ticker APIs
- **METALS_API_KEY**: https://metals-api.com/ (registro gratuito)
- **EXCHANGE_RATE_API_KEY**: https://www.exchangerate-api.com/ (1,500 requests/mes gratis)
- **FIXER_API_KEY**: https://fixer.io/ (registro gratuito)

## ⚠️ Notas Importantes

1. **Nunca subas tu `.env.local` a GitHub** - Ya está en `.gitignore`
2. **Las variables que empiezan con `NEXT_PUBLIC_`** son visibles en el frontend
3. **Las variables sin `NEXT_PUBLIC_`** solo están disponibles en el servidor
4. **Opcional no significa que no funcione** - El sistema funcionará sin las APIs opcionales, pero con funcionalidad limitada:
   - Sin Resend: Los correos no se enviarán (se loguearán en consola)
   - Sin Stripe: Solo se podrán procesar pedidos con métodos de pago manuales
   - Sin Market APIs: El ticker mostrará valores por defecto

## 🚀 Verificación

Después de agregar las variables, reinicia tu servidor:

```bash
# Detener el servidor (Ctrl+C)
# Reiniciar
pnpm dev
```

Para verificar que todo funciona:
1. Supabase: Intenta iniciar sesión
2. Resend: Envía un mensaje de contacto y verifica que llegue el correo
3. Stripe: Ve al checkout y verifica que aparezca el formulario de Stripe
4. Market Ticker: Verifica que aparezca el banner con precios en la página principal

