import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.oronacional.com'),
  title: {
    default: 'Oro Nacional - Joyería Elegante en Jalisco',
    template: '%s | Oro Nacional'
  },
  description: 'Joyería elegante desde el corazón de Jalisco. Anillos, collares, aretes y esclavas de oro.',
  applicationName: 'Oro Nacional',
  authors: [{ name: 'Oro Nacional' }],
  generator: 'Next.js',
  referrer: 'origin-when-cross-origin',
  creator: 'Oro Nacional',
  publisher: 'Oro Nacional',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Oro Nacional',
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
    other: {
      'msvalidate.01': process.env.NEXT_PUBLIC_BING_VERIFICATION || '',
    },
  },
  // Sin `alternates` aquí: el canonical y los hreflang se definen por ruta
  // (ver src/lib/seo.ts) para que ninguna página herede el canonical del inicio.
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#D4AF37',
};

// Las etiquetas <html> y <body> se renderizan en src/app/[locale]/layout.tsx
// para poder establecer `lang` con el locale activo (todas las rutas viven
// bajo [locale]).
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
