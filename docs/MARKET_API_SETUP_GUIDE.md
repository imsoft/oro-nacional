# Guía Paso a Paso: Configurar APIs del Market Ticker

Esta guía te ayudará a obtener las API keys necesarias para el Market Ticker que muestra el precio del oro y el dólar en tiempo real.

## 🎯 APIs Necesarias

1. **API para Precio del Oro**: Para obtener el precio actual del oro
2. **API para Tipo de Cambio**: Para obtener el tipo de cambio USD/MXN

---

## 📊 Opción 1: APIs Gratuitas (Recomendado para empezar)

### API para Tipo de Cambio USD/MXN (MÁS FÁCIL)

**ExchangeRate-API.com** - ✅ **Gratuita y sin registro necesario**

1. **Sin API Key (Funciona de inmediato)**
   - El código ya está configurado para usar la API pública
   - No necesitas hacer nada, funciona automáticamente
   - Límite: Actualización cada hora aproximadamente

2. **Con API Key (Recomendado para producción)**
   - Ve a: https://www.exchangerate-api.com/
   - Haz clic en **"Get Free Key"**
   - Regístrate (gratis, 1,500 requests/mes)
   - Copia tu API key
   - Agrega a `.env.local`: `EXCHANGE_RATE_API_KEY=tu_key_aqui`

### API para Precio del Oro

**Metals.live API** - ✅ **Gratuita, sin registro necesario inicialmente**

1. **Sin API Key (Funciona de inmediato)**
   - El código ya está configurado para usar la API pública
   - Funciona sin configuración
   - Límite: Puede tener rate limits

2. **Con API Key (Recomendado para producción)**
   - Ve a: https://metals-api.com/
   - Regístrate (tiene plan gratuito)
   - Obtén tu API key
   - Agrega a `.env.local`: `METALS_API_KEY=tu_key_aqui`

---

## 🚀 Opción 2: APIs Alternativas (Si las anteriores no funcionan)

### Para Precio del Oro

#### Opción A: GoldAPI.io (Más confiable)
1. Ve a: https://www.goldapi.io/
2. Regístrate (tiene plan gratuito limitado)
3. Obtén tu API key
4. Necesitarías actualizar el código para usar esta API

#### Opción B: MetalPriceAPI.com
1. Ve a: https://www.metalpriceapi.com/
2. Regístrate (tiene plan gratuito)
3. Obtén tu API key

### Para Tipo de Cambio

#### Opción A: Fixer.io
1. Ve a: https://fixer.io/
2. Regístrate (tiene plan gratuito)
3. Obtén tu API key
4. Agrega a `.env.local`: `FIXER_API_KEY=tu_key_aqui`

#### Opción B: CurrencyAPI.com
1. Ve a: https://currencyapi.com/
2. Regístrate (tiene plan gratuito)
3. Obtén tu API key

---

## 📝 Configuración Rápida (Mínimo Necesario)

Para que el Market Ticker funcione **inmediatamente sin configurar nada**, el código ya está preparado para usar APIs públicas. Solo necesitas:

### Paso 1: Verificar que funciona sin API keys

1. Inicia tu servidor: `pnpm dev`
2. Ve a la página principal
3. Deberías ver el banner del Market Ticker con precios
4. Si ves valores, ¡está funcionando! (puede que no sean 100% precisos)

### Paso 2: Agregar API keys para mejor precisión (Opcional)

Abre tu `.env.local` y agrega:

```env
# Para mejor precisión del precio del oro
METALS_API_KEY=tu_api_key_de_metals_api

# Para mejor precisión del tipo de cambio
EXCHANGE_RATE_API_KEY=tu_api_key_de_exchangerate_api
```

---

## 🎓 Configuración Paso a Paso Recomendada

### Paso 1: Obtener API Key de ExchangeRate-API (Tipo de Cambio)

1. Ve a https://www.exchangerate-api.com/
2. Haz clic en **"Get Free Key"** o **"Sign Up Free"**
3. Completa el formulario de registro:
   - Email
   - Contraseña
   - Confirma tu email
4. Una vez registrado, verás tu API key en el dashboard
5. Copia la API key (algo como: `abc123def456...`)
6. Agrega a tu `.env.local`:
   ```
   EXCHANGE_RATE_API_KEY=abc123def456...
   ```

**✅ Ventajas:**
- 1,500 requests/mes gratis
- Actualización en tiempo real
- Sin tarjeta de crédito
- Muy confiable

### Paso 2: Obtener API Key de Metals-API (Precio del Oro)

1. Ve a https://metals-api.com/
2. Haz clic en **"Get API Key"** o **"Sign Up"**
3. Completa el registro:
   - Email
   - Contraseña
   - Selecciona el plan **"Starter"** (gratis)
4. Verifica tu email
5. Ve a tu dashboard y copia tu API key
6. Agrega a tu `.env.local`:
   ```
   METALS_API_KEY=tu_api_key_de_metals_api
   ```

**✅ Ventajas:**
- Plan gratuito disponible
- Precios actualizados
- Fácil de usar

---

## 🧪 Probar que Funciona

1. Agrega las API keys a tu `.env.local`
2. Reinicia tu servidor:
   ```bash
   # Detén el servidor (Ctrl+C)
   pnpm dev
   ```
3. Ve a la página principal: `http://localhost:3000`
4. Deberías ver el banner con:
   - Precio del oro en MXN/oz
   - Tipo de cambio USD/MXN
   - Indicadores de cambio (↑ o ↓)

### Verificar en la Consola

Abre las herramientas de desarrollador (F12) y ve a la pestaña **Network**:
- Busca una petición a `/api/market/prices`
- Debería devolver datos JSON con precios

---

## 🔧 Solución de Problemas

### El ticker no muestra precios

1. **Verifica que el servidor esté corriendo**: `pnpm dev`
2. **Revisa la consola del navegador**: Puede haber errores
3. **Revisa los logs del servidor**: Puede haber errores de conexión a las APIs
4. **Verifica las API keys**: Asegúrate de que estén correctamente escritas en `.env.local`
5. **Reinicia el servidor**: Después de agregar variables de entorno

### Los precios no se actualizan

1. **Verifica que las APIs estén funcionando**: Puedes probar las URLs directamente en el navegador
2. **Revisa los rate limits**: Algunas APIs gratuitas tienen límites
3. **Verifica la conexión a internet**: Las APIs necesitan conexión

### Error 429 (Too Many Requests)

- Has excedido el límite de requests de la API
- Espera unos minutos o considera obtener una API key con más límites
- El código tiene fallbacks, así que seguirá funcionando con valores por defecto

---

## 📚 Recursos Útiles

### Documentación de las APIs

- **ExchangeRate-API**: https://www.exchangerate-api.com/docs
- **Metals-API**: https://metals-api.com/documentation
- **Fixer.io**: https://fixer.io/documentation

### URLs de Prueba

Puedes probar estas URLs directamente en tu navegador:

**Tipo de Cambio (sin API key):**
```
https://api.exchangerate-api.com/v4/latest/USD
```

**Precio del Oro (sin API key - puede no funcionar):**
```
https://api.metals.live/v1/spot/gold
```

---

## ✅ Checklist Final

- [ ] Agregué `EXCHANGE_RATE_API_KEY` a `.env.local` (opcional pero recomendado)
- [ ] Agregué `METALS_API_KEY` a `.env.local` (opcional pero recomendado)
- [ ] Reinicié el servidor después de agregar las variables
- [ ] Verifiqué que el Market Ticker aparece en la página principal
- [ ] Los precios se están mostrando correctamente
- [ ] Los precios se actualizan cada 30 segundos

---

## 💡 Consejos

1. **Empieza sin API keys**: El sistema funciona sin ellas usando APIs públicas
2. **Agrega API keys gradualmente**: Empieza con ExchangeRate-API (más fácil)
3. **Monitorea los límites**: Las APIs gratuitas tienen límites, úsalas con moderación
4. **Para producción**: Considera planes pagos para mayor confiabilidad

---

¿Necesitas ayuda con algún paso específico? ¡Pregúntame!

