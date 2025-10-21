import type { Metadata } from "next";

// En producción, esto vendría de una API o base de datos
const productsMetadata: { [key: string]: Metadata } = {
  "1": {
    title: "Anillo de Compromiso Esmeralda - Oro 14k con Diamantes | Oro Nacional Guadalajara",
    description:
      "Anillo de compromiso artesanal en oro 14k con diamantes naturales. Diseño único elaborado en Guadalajara, Jalisco. Certificado de autenticidad. Envío gratis a toda la República Mexicana.",
    keywords:
      "anillo compromiso oro 14k, anillo diamantes Guadalajara, anillo oro artesanal, joyería Jalisco",
    openGraph: {
      title: "Anillo de Compromiso Esmeralda - Oro 14k | Oro Nacional",
      description: "Anillo de compromiso artesanal con diamantes naturales. Oro 14k certificado.",
      type: "website",
      locale: "es_MX",
    },
  },
  "2": {
    title: "Collar Infinito de Oro Blanco 18k - Elegancia Atemporal | Oro Nacional Guadalajara",
    description:
      "Collar de oro blanco 18k con diseño infinito. Joyería artesanal de Guadalajara, Jalisco. Certificado de autenticidad incluido. Envío seguro gratis.",
    keywords:
      "collar oro blanco 18k, collar infinito oro, joyería Guadalajara, collar oro artesanal",
    openGraph: {
      title: "Collar Infinito de Oro Blanco 18k | Oro Nacional",
      description: "Collar artesanal de oro blanco 18k con diseño de infinito.",
      type: "website",
      locale: "es_MX",
    },
  },
};

interface ProductLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({
  params,
}: ProductLayoutProps): Promise<Metadata> {
  // Obtener metadata del producto
  const { id } = await params;
  const metadata = productsMetadata[id];

  // Metadata por defecto si no existe el producto
  if (!metadata) {
    return {
      title: "Producto | Oro Nacional Guadalajara",
      description: "Joyería fina de oro en Guadalajara, Jalisco.",
    };
  }

  return metadata;
}

export default function ProductLayout({ children }: ProductLayoutProps) {
  return <>{children}</>;
}
