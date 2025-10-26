# Plantillas de Correo - Oro Nacional

Este directorio contiene las plantillas de correo electrónico profesionales para el sistema de autenticación de Oro Nacional.

## 📧 Plantillas Disponibles

### 1. **confirm-signup.html** - Confirmación de Registro
Enviado cuando un nuevo usuario se registra en la plataforma.

**Variables disponibles:**
- `{{ .ConfirmationURL }}` - URL de confirmación de email
- `{{ .SiteURL }}` - URL base del sitio web

**Características:**
- Mensaje de bienvenida personalizado
- Lista de beneficios de la cuenta
- Diseño elegante con colores de marca (#D4AF37)
- Enlace de confirmación destacado
- Notas de seguridad
- Enlace alternativo para copiar/pegar

---

### 2. **reset-password.html** - Restablecer Contraseña
Enviado cuando un usuario solicita restablecer su contraseña.

**Variables disponibles:**
- `{{ .ConfirmationURL }}` - URL para restablecer contraseña
- `{{ .SiteURL }}` - URL base del sitio web

**Características:**
- Advertencia de seguridad prominente
- Consejos para crear contraseña segura
- Expiración clara del enlace (1 hora)
- Instrucciones para usuarios que no solicitaron el cambio
- Diseño responsive

---

### 3. **invite-user.html** - Invitación de Usuario
Enviado cuando se invita a un nuevo usuario a la plataforma.

**Variables disponibles:**
- `{{ .ConfirmationURL }}` - URL para aceptar invitación
- `{{ .SiteURL }}` - URL base del sitio web

**Características:**
- Mensaje exclusivo y especial
- Beneficios destacados para usuarios invitados
- Descuentos de bienvenida
- Expiración de invitación (7 días)

---

### 4. **magic-link.html** - Enlace Mágico de Acceso
Enviado cuando un usuario solicita acceso sin contraseña.

**Variables disponibles:**
- `{{ .ConfirmationURL }}` - URL de acceso directo
- `{{ .SiteURL }}` - URL base del sitio web

**Características:**
- Acceso rápido sin contraseña
- Expiración corta del enlace (15 minutos)
- Explicación clara del proceso
- Seguridad reforzada

---

## 🎨 Elementos de Diseño

Todas las plantillas incluyen:

### Colores de Marca
- **Oro Principal:** `#D4AF37`
- **Oro Hover:** `#B8941E`
- **Negro:** `#1a1a1a`
- **Gris Oscuro:** `#2d2d2d`

### Estructura
1. **Header:** Logo y eslogan de Oro Nacional
2. **Contenido Principal:** Mensaje personalizado con CTA
3. **Footer:** Enlaces útiles, información de contacto y redes sociales

### Componentes Reutilizables
- Botones CTA con efecto hover
- Cajas de información (info, warning, security)
- Enlaces alternativos para accesibilidad
- Divisores decorativos con gradiente dorado
- Footer corporativo completo

---

## 📝 Cómo Configurar en Supabase

### Opción 1: A través del Dashboard (Recomendado)

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Navega a **Authentication** → **Email Templates**
3. Selecciona la plantilla que deseas editar
4. Copia el contenido del archivo HTML correspondiente
5. Pega el contenido en el editor de Supabase
6. Guarda los cambios

### Opción 2: A través de la CLI de Supabase

```bash
# Navega al directorio del proyecto
cd /path/to/oro-nacional

# Aplica las plantillas usando supabase CLI
supabase db push
```

---

## 🔧 Variables de Supabase

Las plantillas utilizan variables de Supabase que se reemplazan automáticamente:

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `{{ .ConfirmationURL }}` | URL de confirmación generada por Supabase | `https://tuapp.supabase.co/auth/v1/verify?token=...` |
| `{{ .SiteURL }}` | URL de tu sitio web | `https://oronacional.com` |
| `{{ .Token }}` | Token de verificación (si se usa manualmente) | `abc123...` |
| `{{ .TokenHash }}` | Hash del token | `xyz789...` |

---

## ✅ Checklist de Configuración

Antes de poner en producción, verifica:

- [ ] Actualizar URLs del sitio (`{{ .SiteURL }}`)
- [ ] Verificar información de contacto en el footer
- [ ] Actualizar número de teléfono: `+52 33 1234 5678`
- [ ] Actualizar email de contacto: `contacto@oronacional.com`
- [ ] Actualizar dirección física
- [ ] Probar cada plantilla enviando correos de prueba
- [ ] Verificar responsive design en móviles
- [ ] Comprobar que los enlaces funcionan correctamente
- [ ] Revisar ortografía y gramática

---

## 🧪 Probar las Plantillas

### Método 1: Vista Previa en Navegador
1. Abre cualquier archivo `.html` en tu navegador
2. Inspecciona el diseño y colores
3. Ajusta el ancho de la ventana para probar responsive

### Método 2: Enviar Correo de Prueba desde Supabase
1. Ve a **Authentication** → **Users**
2. Crea un usuario de prueba
3. Verifica que el correo llegue correctamente
4. Revisa formato, imágenes y enlaces

### Método 3: Servicio de Vista Previa de Emails
Usa servicios como [Litmus](https://litmus.com) o [Email on Acid](https://www.emailonacid.com/) para:
- Probar en múltiples clientes de correo
- Verificar compatibilidad móvil
- Detectar problemas de spam

---

## 📱 Responsive Design

Todas las plantillas están optimizadas para:
- ✅ Gmail (Web, iOS, Android)
- ✅ Outlook (Web, Desktop)
- ✅ Apple Mail (iOS, macOS)
- ✅ Yahoo Mail
- ✅ Thunderbird
- ✅ Otros clientes principales

---

## 🔒 Seguridad

Las plantillas incluyen:
- Avisos de expiración de enlaces
- Advertencias de seguridad claras
- Instrucciones para usuarios que no solicitaron acciones
- Enlaces solo desde dominios oficiales
- Recordatorios de nunca compartir contraseñas

---

## 🎯 Mejores Prácticas

1. **Personalización:**
   - Usa variables dinámicas cuando sea posible
   - Mantén el tono profesional pero cercano
   - Adapta el contenido al contexto mexicano/jalisciense

2. **Testing:**
   - Prueba cada plantilla antes de producción
   - Verifica enlaces en diferentes dispositivos
   - Revisa tiempos de carga de imágenes

3. **Mantenimiento:**
   - Actualiza información de contacto regularmente
   - Revisa enlaces rotos trimestralmente
   - Mantén consistencia con el diseño del sitio web

4. **Accesibilidad:**
   - Usa texto alternativo en imágenes
   - Mantén buen contraste de colores
   - Proporciona enlaces de texto como alternativa

---

## 📞 Información de Contacto a Actualizar

Antes de usar en producción, actualiza:

```html
<!-- En el footer de cada plantilla -->
📍 [Tu Dirección Real], Guadalajara, Jalisco, México
📞 +52 [Tu Teléfono Real]
📧 [Tu Email Real]
```

---

## 🚀 Próximos Pasos

Después de configurar las plantillas:

1. Configura tu dominio de correo personalizado en Supabase
2. Verifica registros SPF, DKIM y DMARC
3. Monitorea tasas de entrega y apertura
4. Ajusta contenido según feedback de usuarios
5. Considera agregar plantillas adicionales:
   - Confirmación de pedido
   - Envío de producto
   - Bienvenida post-compra
   - Recordatorio de carrito abandonado

---

## 📄 Licencia

Estas plantillas son propiedad de Oro Nacional y están diseñadas específicamente para su uso en el sistema de autenticación de la plataforma.

---

**Última actualización:** Enero 2025
**Diseñado por:** Claude Code
**Para:** Oro Nacional - Joyería Elegante en Jalisco
