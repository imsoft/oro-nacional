# Configuración del Market Ticker

Este documento explica cómo funciona el banner de precios en tiempo real (Market Ticker) que muestra el precio del oro y del dólar.

## Descripción

El Market Ticker es un banner que aparece en la parte superior de la página principal, justo debajo del navbar. Muestra:

- **Precio del Oro**: Precio actual del oro en MXN por onza
- **Tipo de Cambio USD/MXN**: Precio actual del dólar estadounidense en pesos mexicanos
- **Cambios y Porcentajes**: Muestra si los precios subieron o bajaron respecto a la última actualización
- **Actualización en Tiempo Real**: Se actualiza cada 30 segundos automáticamente

## Funcionalidades

1. **Actualización Automática**: Los precios se actualizan cada 30 segundos
2. **Indicadores Visuales**: 
   - Verde cuando los precios suben (↑)
   - Rojo cuando los precios bajan (↓)
   - Gris cuando no hay cambio
3. **Animaciones**: Efectos de transición suaves cuando los precios cambian
4. **Responsive**: Se adapta a diferentes tamaños de pantalla

## APIs Utilizadas

### Para el Precio del Oro

El sistema intenta obtener el precio del oro de varias fuentes en este orden:

1. **metals-api.com** (si tienes `METALS_API_KEY`)
   - Registro: https://metals-api.com/
   - Free tier disponible
   - Más preciso y confiable

2. **API pública de metals.live** (sin API key)
   - Puede tener límites de rate
   - Funciona sin configuración

3. **Fallback**: Calcula el precio basado en el precio aproximado del oro en USD multiplicado por el tipo de cambio USD/MXN

### Para el Tipo de Cambio USD/MXN

El sistema intenta obtener el tipo de cambio de varias fuentes:

1. **exchangerate-api.com** con API key (si tienes `EXCHANGE_RATE_API_KEY`)
   - Registro: https://www.exchangerate-api.com/
   - Free tier: 1,500 requests/mes
   - Más confiable

2. **exchangerate-api.com público** (sin API key)
   - Gratis pero puede tener límites
   - Funciona sin configuración

3. **fixer.io** (si tienes `FIXER_API_KEY`)
   - Alternativa adicional
   - Registro: https://fixer.io/

4. **Fallback**: Valor por defecto de 17.0 MXN por USD

## Variables de Entorno Opcionales

Puedes agregar estas variables de entorno a tu `.env.local` para mejorar la precisión y confiabilidad:

```bash
# API Key para metales preciosos (opcional, recomendado)
METALS_API_KEY=tu_api_key_aqui

# API Key para tipo de cambio (opcional, recomendado)
EXCHANGE_RATE_API_KEY=tu_api_key_aqui

# API Key alternativa para tipo de cambio (opcional)
FIXER_API_KEY=tu_api_key_aqui
```

## Cómo Obtener las API Keys

### metals-api.com

1. Ve a https://metals-api.com/
2. Crea una cuenta gratuita
3. Ve a tu dashboard y copia tu API key
4. Agrégalo a `.env.local` como `METALS_API_KEY`

### exchangerate-api.com

1. Ve a https://www.exchangerate-api.com/
2. Crea una cuenta gratuita (1,500 requests/mes gratis)
3. Ve a tu dashboard y copia tu API key
4. Agrégalo a `.env.local` como `EXCHANGE_RATE_API_KEY`

### fixer.io

1. Ve a https://fixer.io/
2. Crea una cuenta gratuita
3. Copia tu API key
4. Agrégalo a `.env.local` como `FIXER_API_KEY`

## Notas Importantes

- **Funciona sin API keys**: El sistema puede funcionar sin API keys usando APIs públicas, aunque con posibles límites de rate
- **Actualización cada 30 segundos**: Los precios se actualizan automáticamente cada 30 segundos
- **Cache en servidor**: Los precios se calculan en el servidor para evitar exponer API keys en el cliente
- **Valores por defecto**: Si las APIs fallan, se muestran valores por defecto razonables
- **Manejo de errores**: Si hay errores, el banner no se muestra (para no confundir a los usuarios)

## Personalización

### Cambiar la frecuencia de actualización

Edita `src/components/shared/market-ticker.tsx`:

```typescript
// Cambiar de 30000 (30 segundos) a otro valor en milisegundos
const interval = setInterval(fetchMarketData, 30000);
```

### Cambiar el diseño

El componente está en `src/components/shared/market-ticker.tsx` y puedes personalizar:

- Colores: Actualmente usa tonos dorados (`#D4AF37`, `#B8941E`)
- Tamaño de fuente
- Posición de elementos
- Animaciones

### Agregar más activos

Para agregar más activos (plata, platino, etc.), edita:

1. `src/app/api/market/prices/route.ts` - Agrega la función para obtener el precio
2. `src/components/shared/market-ticker.tsx` - Agrega el display del nuevo activo

## Solución de Problemas

### El banner no se muestra

1. Verifica que la API `/api/market/prices` esté funcionando
2. Abre las herramientas de desarrollador y revisa la consola
3. Verifica que no haya errores en el servidor

### Los precios no se actualizan

1. Verifica que el intervalo esté funcionando (revisa la consola del navegador)
2. Verifica que la API esté respondiendo correctamente
3. Revisa los logs del servidor para ver si hay errores

### Los precios parecen incorrectos

1. Verifica que las API keys sean correctas
2. Algunas APIs pueden tener límites de rate - considera usar API keys
3. Los valores pueden variar según la fuente - esto es normal

## Recursos Adicionales

- [metals-api.com Documentation](https://metals-api.com/documentation)
- [exchangerate-api.com Documentation](https://www.exchangerate-api.com/docs)
- [fixer.io Documentation](https://fixer.io/documentation)

