import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";
import Breadcrumbs from "@/components/shared/breadcrumbs";
import ProductGallery from "@/components/product/product-gallery";
import ProductInfo from "@/components/product/product-info";
import RelatedProducts from "@/components/product/related-products";

// Datos de ejemplo - en producción vendrían de una API o base de datos
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const productsData: { [key: string]: any } = {
  "1": {
    id: 1,
    name: "Anillo de Compromiso Esmeralda",
    price: "$12,500 MXN",
    category: "Anillos de Oro",
    material: "14k",
    description:
      "Elegante anillo de compromiso elaborado en oro de 14k con diamantes naturales de alta calidad. Diseño artesanal único que combina la tradición jalisciense con la elegancia moderna. Cada pieza es cuidadosamente elaborada por nuestros maestros joyeros con más de 30 años de experiencia.",
    images: [
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1603561596112-0a132b757442?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80&brightness=0.9",
      "https://images.unsplash.com/photo-1603561596112-0a132b757442?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80&brightness=1.1",
    ],
    specifications: {
      Material: "Oro 14k",
      "Peso aproximado": "3.5 gramos",
      Piedras: "Diamantes naturales 0.50ct",
      Acabado: "Pulido alto brillo",
      Origen: "Guadalajara, Jalisco",
      Garantía: "De por vida",
    },
    sizes: ["5", "6", "7", "8", "9", "10"],
    hasEngraving: true,
  },
  "2": {
    id: 2,
    name: "Collar Infinito de Oro Blanco",
    price: "$18,900 MXN",
    category: "Collares de Oro",
    material: "18k",
    description:
      "Hermoso collar de oro blanco 18k con diseño de símbolo infinito. Representa el amor eterno y la elegancia atemporal. Elaborado con técnicas artesanales tradicionales de Jalisco, cada detalle refleja la maestría de nuestros joyeros.",
    images: [
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80&brightness=1.1",
    ],
    specifications: {
      Material: "Oro blanco 18k",
      "Peso aproximado": "4.2 gramos",
      Longitud: "45cm ajustable",
      Acabado: "Rodio brillante",
      Origen: "Guadalajara, Jalisco",
      Garantía: "De por vida",
    },
    sizes: [],
    hasEngraving: true,
  },
};

const relatedProducts = [
  {
    id: 5,
    name: "Anillo Solitario Clásico",
    description: "Anillo de compromiso en oro 18k con diamante central",
    price: "$22,000 MXN",
    image:
      "https://images.unsplash.com/photo-1603561596112-0a132b757442?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    category: "Anillos de Oro",
    material: "Oro 18k",
  },
  {
    id: 10,
    name: "Anillo de Eternidad con Diamantes",
    description: "Anillo de oro amarillo 18k con diamantes alrededor",
    price: "$18,900 MXN",
    image:
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    category: "Anillos de Oro",
    material: "Oro Amarillo",
  },
  {
    id: 9,
    name: "Anillo de Matrimonio Clásico",
    description: "Argolla de matrimonio en oro blanco 14k pulido",
    price: "$5,500 MXN",
    image:
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    category: "Anillos de Oro",
    material: "Oro Blanco",
  },
  {
    id: 11,
    name: "Anillo Cocktail con Esmeralda",
    description: "Anillo de oro rosa 14k con esmeralda central y diamantes",
    price: "$28,500 MXN",
    image:
      "https://images.unsplash.com/photo-1603561596112-0a132b757442?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    category: "Anillos de Oro",
    material: "Oro Rosa",
  },
];

interface ProductPageProps {
  params: {
    id: string;
  };
}

export default function ProductPage({ params }: ProductPageProps) {
  const product = productsData[params.id];

  // Si el producto no existe, mostrar un mensaje
  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20 text-center">
          <h1 className="text-3xl font-semibold text-foreground">
            Producto no encontrado
          </h1>
          <p className="mt-4 text-muted-foreground">
            El producto que buscas no existe o ha sido eliminado.
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: "Catálogo", href: "/catalog" },
            { label: product.category, href: `/${product.category.toLowerCase().replace(" de oro", "").replace(" ", "-")}` },
            { label: product.name, href: `/product/${product.id}` },
          ]}
        />

        {/* Contenido del producto */}
        <div className="py-8 lg:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Galería de imágenes */}
            <ProductGallery images={product.images} productName={product.name} />

            {/* Información del producto */}
            <ProductInfo product={product} />
          </div>
        </div>
      </main>

      {/* Productos relacionados */}
      <RelatedProducts products={relatedProducts} />

      <Footer />
    </div>
  );
}
