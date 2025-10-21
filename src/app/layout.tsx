import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Oro Nacional - Joyería Fina en Guadalajara, Jalisco | Anillos, Collares y Aretes de Oro",
  description: "Descubre la mejor joyería en Guadalajara, Jalisco. Oro Nacional ofrece anillos de compromiso, collares, aretes y pulseras de oro con más de 30 años de tradición artesanal. Envíos a toda la república mexicana.",
  keywords: "joyería Guadalajara, joyería Jalisco, anillos de oro, collares de oro, aretes de oro, joyería fina México, anillos de compromiso Guadalajara, oro 14k, oro 18k, joyería artesanal Jalisco",
  openGraph: {
    title: "Oro Nacional - Joyería Fina en Guadalajara, Jalisco",
    description: "Elegancia y tradición jalisciense en joyería fina. Descubre nuestra exclusiva colección de anillos, collares y aretes de oro.",
    type: "website",
    locale: "es_MX",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
