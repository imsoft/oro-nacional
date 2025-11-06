# 🚀 Configuración Rápida: Market Ticker APIs

## ⚡ Configuración en 2 Minutos

### Opción 1: Sin API Keys (Funciona de Inmediato) ✅

**¡Buenas noticias!** El Market Ticker **ya funciona sin configurar nada**. El código está preparado para usar APIs públicas gratuitas.

1. Simplemente inicia tu servidor: `pnpm dev`
2. Ve a la página principal
3. Verás el banner con precios (pueden no ser 100% precisos, pero funcionan)

### Opción 2: Con API Keys (Recomendado para Mejor Precisión) 🎯

Solo necesitas **2 API keys** (ambas gratuitas):

---

## 📝 Paso 1: Obtener API Key de Tipo de Cambio (5 minutos)

### ExchangeRate-API.com (Gratuita, 1,500 requests/mes)

1. **Ve a**: https://www.exchangerate-api.com/
2. **Haz clic en**: "Get Free Key" o "Sign Up Free"
3. **Regístrate**:
   - Email: tu@email.com
   - Contraseña: (elige una segura)
   - Confirma tu email
4. **Copia tu API key** (aparece en el dashboard, algo como: `abc123def456...`)
5. **Agrega a tu `.env.local`**:
   ```env
   EXCHANGE_RATE_API_KEY=abc123def456...
   ```

✅ **Listo!** Ya tienes tipo de cambio en tiempo real.

---

## 📝 Paso 2: Obtener API Key de Precio del Oro (5 minutos)

### Metals-API.com (Gratuita)

1. **Ve a**: https://metals-api.com/
2. **Haz clic en**: "Get API Key" o "Sign Up"
3. **Selecciona el plan "Starter"** (gratis)
4. **Completa el registro**:
   - Email
   - Contraseña
   - Verifica tu email
5. **Copia tu API key** del dashboard
6. **Agrega a tu `.env.local`**:
   ```env
   METALS_API_KEY=tu_api_key_de_metals_api
   ```

✅ **Listo!** Ya tienes precio del oro en tiempo real.

---

## 🎯 Tu `.env.local` Debería Verse Así:

```env
# Supabase (ya lo tienes)
NEXT_PUBLIC_SUPABASE_URL=https://qvqsmfszujqhciirtkqy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Market Ticker APIs (agrega estas)
EXCHANGE_RATE_API_KEY=tu_api_key_de_exchangerate_api
METALS_API_KEY=tu_api_key_de_metals_api
```

---

## ✅ Verificar que Funciona

1. **Reinicia tu servidor**:
   ```bash
   # Detén el servidor (Ctrl+C)
   pnpm dev
   ```

2. **Ve a la página principal**: `http://localhost:3000`

3. **Verifica el banner**: Deberías ver:
   - 💰 **Oro**: Precio en MXN/oz
   - 💵 **USD/MXN**: Tipo de cambio
   - Indicadores de cambio (↑ o ↓)

4. **Espera 30 segundos**: Los precios se actualizan automáticamente

---

## 🔍 Si No Funciona

### Revisa la Consola del Navegador (F12)
- Busca errores en la pestaña **Console**
- Busca la petición a `/api/market/prices` en la pestaña **Network**

### Revisa los Logs del Servidor
- Busca errores relacionados con las APIs
- Verifica que las API keys estén correctas

### Verifica las API Keys
1. Asegúrate de que estén en `.env.local` (no `.env`)
2. Verifica que no tengan espacios extra
3. Reinicia el servidor después de agregarlas

---

## 💡 Consejos

- **Empieza sin API keys**: El sistema funciona, solo que con valores aproximados
- **Agrega API keys cuando estés listo**: Para mayor precisión
- **Las APIs gratuitas tienen límites**: No te preocupes, son suficientes para desarrollo
- **Para producción**: Considera planes pagos si necesitas más requests

---

## 📞 ¿Necesitas Ayuda?

Si tienes problemas:
1. Verifica que reiniciaste el servidor después de agregar las variables
2. Revisa que las API keys estén correctamente escritas (sin espacios)
3. Prueba acceder a las URLs de las APIs directamente en tu navegador
4. Revisa los logs del servidor para ver errores específicos

¡El Market Ticker debería funcionar perfectamente! 🎉

