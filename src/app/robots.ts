import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.oronacional.com';

  // Rutas privadas / transaccionales. Se listan sin prefijo (español, locale
  // por defecto) y con /en. Sin diagonal final para cubrir también la ruta
  // exacta (p. ej. /cart además de /cart/...).
  const privateRoutes = [
    '/admin',
    '/checkout',
    '/cart',
    '/login',
    '/register',
    '/profile',
    '/my-orders',
    '/favorites',
    '/reset-password',
  ];

  const disallow = [
    '/api/',
    '/_next/',
    ...privateRoutes,
    ...privateRoutes.map((route) => `/en${route}`),
  ];

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow,
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
