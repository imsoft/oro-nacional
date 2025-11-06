# 📧 Configuración de Correos Electrónicos con Resend

Este documento explica cómo configurar y usar el sistema de correos electrónicos con Resend en Oro Nacional.

## 📋 Tabla de Contenidos

- [Requisitos](#requisitos)
- [Configuración](#configuración)
- [Variables de Entorno](#variables-de-entorno)
- [Plantillas de Correo](#plantillas-de-correo)
- [Uso](#uso)
- [Modo Desarrollo](#modo-desarrollo)

## 🚀 Requisitos

1. Cuenta en [Resend](https://resend.com)
2. API Key de Resend
3. Dominio verificado en Resend (opcional, pero recomendado)

## ⚙️ Configuración

### 1. Obtener API Key de Resend

1. Ve a [Resend Dashboard](https://resend.com/api-keys)
2. Crea una nueva API Key
3. Copia la API Key generada

### 2. Configurar Variables de Entorno

Agrega las siguientes variables a tu archivo `.env.local`:

```env
# Resend Configuration
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@tudominio.com
RESEND_ADMIN_EMAIL=admin@tudominio.com
```

**Nota:** 
- `RESEND_FROM_EMAIL`: Debe ser un email verificado en Resend o un dominio verificado
- `RESEND_ADMIN_EMAIL`: Email donde se recibirán las notificaciones de admin

## 📧 Plantillas de Correo

El sistema incluye las siguientes plantillas de correo:

### 1. Contact Form Email
- **Para:** Admin de Oro Nacional
- **Cuándo:** Cuando un cliente envía un mensaje desde el formulario de contacto
- **Archivo:** `emails/contact-form-email.tsx`

### 2. Contact Confirmation Email
- **Para:** Cliente
- **Cuándo:** Cuando un cliente envía un mensaje desde el formulario de contacto
- **Archivo:** `emails/contact-confirmation-email.tsx`

### 3. Order Confirmation Email
- **Para:** Cliente
- **Cuándo:** Cuando un cliente realiza una compra
- **Archivo:** `emails/order-confirmation-email.tsx`

### 4. Order Notification Email
- **Para:** Admin de Oro Nacional
- **Cuándo:** Cuando se recibe un nuevo pedido
- **Archivo:** `emails/order-notification-email.tsx`

## 🌍 Internacionalización

Todas las plantillas de correo soportan español e inglés. El idioma se determina automáticamente según el idioma del sitio web en el momento de la acción.

## 🔧 Uso

### Envío Automático

Los correos se envían automáticamente cuando:

1. **Formulario de Contacto:**
   - Se envía un correo de notificación al admin
   - Se envía un correo de confirmación al cliente

2. **Proceso de Checkout:**
   - Se envía un correo de confirmación al cliente
   - Se envía un correo de notificación al admin

### Envío Manual

Si necesitas enviar correos manualmente, puedes usar las funciones en `src/lib/email/resend.ts`:

```typescript
import { sendContactConfirmationEmail } from '@/lib/email/resend';

await sendContactConfirmationEmail('Juan Pérez', 'juan@example.com', 'es');
```

## 🛠️ Modo Desarrollo

Si no tienes configurada la API Key de Resend, el sistema funcionará en modo desarrollo:

- Los correos no se enviarán realmente
- Se mostrarán logs en la consola indicando qué correos se enviarían
- El formato es: `📧 [DEV] Email would be sent: {...}`

Esto permite desarrollar y probar la funcionalidad sin necesidad de configurar Resend inmediatamente.

## 📝 API Routes

El sistema incluye las siguientes API routes:

- `POST /api/email/contact` - Envía correos relacionados con el formulario de contacto
- `POST /api/email/order` - Envía correos relacionados con pedidos

### Ejemplo de uso:

```typescript
// Contact form
await fetch('/api/email/contact', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messageId: 'message-id',
    locale: 'es',
  }),
});

// Order
await fetch('/api/email/order', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    orderId: 'order-id',
    locale: 'es',
  }),
});
```

## 🎨 Personalización

### Modificar Plantillas

Las plantillas están en la carpeta `emails/`. Puedes modificarlas para cambiar el diseño, colores, o contenido.

### Cambiar Colores

El color principal de Oro Nacional (`#D4AF37`) está definido en cada plantilla. Puedes cambiarlo modificando los estilos en cada archivo.

### Agregar Nuevas Plantillas

1. Crea un nuevo archivo en `emails/`
2. Usa React Email components de `@react-email/components`
3. Agrega la función de envío en `src/lib/email/resend.ts`
4. Crea una API route si es necesario

## ⚠️ Notas Importantes

1. **Límites de Resend:**
   - Plan gratuito: 3,000 emails/mes
   - Plan Pro: 50,000 emails/mes
   - Verifica los límites en [Resend Pricing](https://resend.com/pricing)

2. **Verificación de Dominio:**
   - Para usar un dominio personalizado, debes verificarlo en Resend
   - Esto mejora la deliverabilidad de los correos

3. **Spam:**
   - Los correos se envían de forma asíncrona
   - Si falla el envío, no afecta la funcionalidad principal
   - Los errores se registran en la consola

4. **Privacidad:**
   - Los correos contienen información sensible
   - Asegúrate de cumplir con las regulaciones de privacidad (GDPR, etc.)

## 🐛 Solución de Problemas

### Los correos no se envían

1. Verifica que `RESEND_API_KEY` esté configurada correctamente
2. Verifica que `RESEND_FROM_EMAIL` esté verificado en Resend
3. Revisa los logs de la consola para ver errores
4. Verifica los logs de Resend en el dashboard

### Errores de autenticación

- Verifica que la API Key sea válida
- Asegúrate de que no haya espacios en la variable de entorno

### Correos en spam

- Verifica tu dominio en Resend
- Usa SPF y DKIM records
- Evita palabras que puedan activar filtros de spam

