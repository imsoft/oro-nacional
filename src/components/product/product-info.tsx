"use client";

import { useState } from "react";
import { Heart, Share2, ShoppingCart, MessageCircle, Shield, Truck, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ProductInfoProps {
  product: {
    id: number;
    name: string;
    price: string;
    category: string;
    material: string;
    description: string;
    specifications: {
      [key: string]: string;
    };
    sizes?: string[];
    stock?: number;
    weight?: number;
    slug?: string;
  };
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || "");
  const [isFavorite, setIsFavorite] = useState(false);

  const handleShare = async () => {
    const shareData = {
      title: `${product.name} - Oro Nacional`,
      text: `${product.description.substring(0, 100)}... - ${product.price}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copiar al portapapeles
        await navigator.clipboard.writeText(shareData.url);
        alert("¡Enlace copiado al portapapeles!");
      }
    } catch (err) {
      console.log("Error sharing:", err);
    }
  };

  const handleWhatsApp = () => {
    const message = `¡Hola! Me interesa este producto: ${product.name} - ${product.price}`;
    const whatsappUrl = `https://wa.me/523312345678?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleAddToCart = () => {
    // TODO: Implementar lógica del carrito
    console.log('Agregando al carrito:', {
      product: product.name,
      size: selectedSize,
      price: product.price
    });
    alert('¡Producto agregado al carrito!');
  };

  return (
    <div className="space-y-6">
      {/* Categoría y nombre */}
      <div>
        <p className="text-sm font-medium text-[#D4AF37] uppercase tracking-wide">
          {product.category}
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-foreground sm:text-4xl">
          {product.name}
        </h1>
      </div>

      {/* Precio */}
      <div className="flex items-baseline gap-4">
        <p className="text-4xl font-semibold text-foreground">{product.price}</p>
        <p className="text-sm text-muted-foreground">IVA incluido</p>
      </div>

      {/* Descripción */}
      <p className="text-lg text-muted-foreground leading-relaxed">
        {product.description}
      </p>

      <div className="border-t border-border pt-6 space-y-6">
        {/* Selector de talla */}
        {product.sizes && product.sizes.length > 0 && (
          <div>
            <Label className="text-base font-semibold">
              Talla {selectedSize && `- ${selectedSize}`}
            </Label>
            <RadioGroup
              value={selectedSize}
              onValueChange={setSelectedSize}
              className="mt-4 grid grid-cols-4 gap-3"
            >
              {product.sizes.map((size) => (
                <div key={size}>
                  <RadioGroupItem
                    value={size}
                    id={size}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={size}
                    className="flex items-center justify-center rounded-lg border-2 border-muted bg-card px-4 py-3 text-sm font-medium hover:bg-muted cursor-pointer peer-data-[state=checked]:border-[#D4AF37] peer-data-[state=checked]:bg-[#D4AF37]/10 transition-all"
                  >
                    {size}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )}


        {/* Botones de acción */}
        <div className="space-y-3">
          <Button
            size="lg"
            className="w-full bg-[#D4AF37] hover:bg-[#B8941E] text-white text-base font-semibold py-6 transition-all duration-300 hover:scale-[1.02]"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            {product.stock === 0 ? 'Agotado' : 'Agregar al Carrito'}
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="w-full border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-white text-base font-semibold py-6 transition-all duration-300"
            onClick={handleWhatsApp}
          >
            <MessageCircle className="mr-2 h-5 w-5" />
            Contactar por WhatsApp
          </Button>
        </div>

        {/* Información de stock */}
        {product.stock !== undefined && (
          <div className="text-center">
            {product.stock > 0 ? (
              <p className="text-sm text-green-600 font-medium">
                ✓ Disponible ({product.stock} en stock)
              </p>
            ) : (
              <p className="text-sm text-red-600 font-medium">
                ✗ Agotado - Contacta para disponibilidad
              </p>
            )}
          </div>
        )}

        {/* Botones secundarios */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="lg"
            className="flex-1"
            onClick={() => setIsFavorite(!isFavorite)}
          >
            <Heart
              className={`mr-2 h-5 w-5 ${isFavorite ? "fill-red-500 text-red-500" : ""}`}
            />
            {isFavorite ? "Guardado" : "Guardar"}
          </Button>
          <Button variant="outline" size="lg" className="flex-1" onClick={handleShare}>
            <Share2 className="mr-2 h-5 w-5" />
            Compartir
          </Button>
        </div>
      </div>

      {/* Beneficios */}
      <div className="border-t border-border pt-6 space-y-4">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-[#D4AF37] mt-0.5" />
          <div>
            <p className="font-semibold text-sm">Certificado de Autenticidad</p>
            <p className="text-sm text-muted-foreground">
              Oro {product.material} certificado
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Truck className="h-5 w-5 text-[#D4AF37] mt-0.5" />
          <div>
            <p className="font-semibold text-sm">Envío Seguro Gratis</p>
            <p className="text-sm text-muted-foreground">
              A toda la República Mexicana
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Award className="h-5 w-5 text-[#D4AF37] mt-0.5" />
          <div>
            <p className="font-semibold text-sm">Garantía de por Vida</p>
            <p className="text-sm text-muted-foreground">
              En todos nuestros productos
            </p>
          </div>
        </div>
      </div>

      {/* Tabs de información */}
      <Tabs defaultValue="specs" className="border-t border-border pt-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="specs">Especificaciones</TabsTrigger>
          <TabsTrigger value="care">Cuidados</TabsTrigger>
          <TabsTrigger value="shipping">Envío</TabsTrigger>
        </TabsList>
        <TabsContent value="specs" className="mt-6 space-y-3">
          {Object.entries(product.specifications).map(([key, value]) => (
            <div
              key={key}
              className="flex justify-between py-2 border-b border-border last:border-0"
            >
              <span className="font-medium text-sm">{key}</span>
              <span className="text-sm text-muted-foreground">{value}</span>
            </div>
          ))}
        </TabsContent>
        <TabsContent value="care" className="mt-6 space-y-3 text-sm text-muted-foreground">
          <ul className="list-disc list-inside space-y-2">
            <li>Limpie con un paño suave y seco después de cada uso</li>
            <li>Evite el contacto con productos químicos, perfumes y lociones</li>
            <li>Guarde en un lugar seco, preferiblemente en su caja original</li>
            <li>Para limpieza profunda, use agua tibia con jabón neutro</li>
            <li>Evite usar su joyería mientras hace ejercicio o tareas pesadas</li>
          </ul>
        </TabsContent>
        <TabsContent value="shipping" className="mt-6 space-y-3 text-sm text-muted-foreground">
          <p>
            <strong>Envío Nacional:</strong> Gratis a toda la República Mexicana.
            Tiempo estimado de entrega: 3-5 días hábiles.
          </p>
          <p>
            <strong>Seguimiento:</strong> Recibirás un número de rastreo una vez
            que tu pedido sea enviado.
          </p>
          <p>
            <strong>Empaque:</strong> Todos nuestros productos se envían en cajas
            de regalo elegantes con certificado de autenticidad.
          </p>
          <p>
            <strong>Seguro:</strong> Todos los envíos están asegurados contra
            pérdida o daño.
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductInfo;
