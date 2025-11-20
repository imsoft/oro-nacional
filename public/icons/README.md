# Iconos PWA para Oro Nacional

Esta carpeta debe contener los iconos de la aplicación para funcionalidad PWA (Progressive Web App).

## Iconos Requeridos

Necesitas generar los siguientes tamaños de iconos a partir del logo de Oro Nacional:

### Iconos Estándar
- `icon-72x72.png` - 72x72 pixels
- `icon-96x96.png` - 96x96 pixels
- `icon-128x128.png` - 128x128 pixels
- `icon-144x144.png` - 144x144 pixels
- `icon-152x152.png` - 152x152 pixels
- `icon-192x192.png` - 192x192 pixels (Android)
- `icon-384x384.png` - 384x384 pixels
- `icon-512x512.png` - 512x512 pixels (Android splash screen)

### Iconos Apple
También necesitas en la carpeta `/public`:
- `apple-touch-icon.png` - 180x180 pixels (ícono para iOS)
- `favicon.ico` - 16x16, 32x32, 48x48 pixels (favicon multi-size)
- `icon.svg` - Vector SVG del logo

## Cómo Generar los Iconos

### Opción 1: Herramienta Online (Recomendado)
1. Visita https://realfavicongenerator.net/
2. Sube el logo de Oro Nacional (preferiblemente en formato PNG de alta resolución)
3. Configura las opciones para cada plataforma
4. Descarga el paquete completo
5. Coloca los archivos en las carpetas correspondientes

### Opción 2: Herramienta CLI
```bash
npx pwa-asset-generator /path/to/logo.png ./public/icons --icon-only --favicon --type png
```

### Opción 3: Photoshop/GIMP/Figma
1. Abre el logo de Oro Nacional
2. Redimensiona a cada tamaño requerido
3. Exporta como PNG con fondo transparente o de color sólido
4. Guarda cada archivo con el nombre correspondiente

## Especificaciones Técnicas

### Características de los Iconos
- **Formato**: PNG
- **Fondo**: Preferiblemente transparente o color dorado (#D4AF37)
- **Padding**: Deja ~10% de espacio alrededor del logo
- **Purpose**: Los iconos deben ser "maskable" y "any" para compatibilidad

### Iconos Maskable
Los iconos marcados como "maskable" deben tener contenido seguro en el centro:
- El contenido importante debe estar en el 80% central del ícono
- El 20% exterior puede ser recortado por diferentes dispositivos

## Screenshots para PWA

Opcionalmente, también puedes agregar capturas de pantalla en `/public/screenshots/`:
- `home-mobile.png` - 540x720 pixels (captura móvil)
- `home-desktop.png` - 1920x1080 pixels (captura escritorio)

Estas imágenes se muestran en los stores de apps cuando los usuarios instalan la PWA.

## Verificación

Una vez que tengas todos los iconos, verifica que:
1. Todos los archivos existen con los nombres correctos
2. Los tamaños son correctos (usa `file` o propiedades del archivo)
3. Los iconos se ven bien en diferentes fondos
4. El manifest.json apunta a los archivos correctos

## Testing

Para probar los iconos PWA:
1. Ejecuta `pnpm build && pnpm start`
2. Abre Chrome DevTools > Application > Manifest
3. Verifica que todos los iconos se cargan correctamente
4. Prueba instalar la PWA en tu dispositivo

## Referencias

- [Web.dev - Icon Best Practices](https://web.dev/maskable-icon/)
- [PWA Builder](https://www.pwabuilder.com/)
- [Maskable.app - Editor de íconos](https://maskable.app/editor)
