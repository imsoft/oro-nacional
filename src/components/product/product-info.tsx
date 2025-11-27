"use client";

import { useState, useEffect, useMemo } from "react";
import { Heart, Share2, ShoppingCart, Shield, Truck, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCartStore } from "@/stores/cart-store";
import { getPricingParameters } from "@/lib/supabase/pricing";

interface ProductInfoProps {
  product: {
    id: string;
    name: string;
    price: string;
    basePrice?: number;
    category: string;
    material: string;
    description: string;
    specifications: {
      [key: string]: string;
    };
    sizes?: Array<{
      size: string;
      price: number;
      stock: number;
      weight?: number; // Gramos de oro
    }> | string[];
    weight?: number;
    slug?: string;
    images?: string[];
  };
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  // Determinar si sizes es un array de objetos o strings
  const sizesArray = product.sizes || [];
  const isSizesWithPrice = sizesArray.length > 0 && typeof sizesArray[0] === 'object';
  const firstSize = isSizesWithPrice 
    ? (sizesArray[0] as { size: string; price: number; stock: number }).size
    : (sizesArray[0] as string) || "";
  
  const [selectedSize, setSelectedSize] = useState(firstSize);
  const [selectedMSI, setSelectedMSI] = useState<number>(0); // 0 = Sin MSI (pago de contado)
  const [isFavorite, setIsFavorite] = useState(false);
  const [stripeParams, setStripeParams] = useState<{ percentage: number; fixedFee: number } | null>(null);
  const { addItem } = useCartStore();

  // Comisiones adicionales de MSI (sobre el precio base)
  const MSI_FEES = {
    0: 0,      // Sin MSI (pago de contado - solo comisión base de Stripe)
    3: 0.05,   // 3 meses - 5%
    6: 0.075,  // 6 meses - 7.5%
    9: 0.10,   // 9 meses - 10%
    12: 0.125, // 12 meses - 12.5%
  };

  // Obtener parámetros de Stripe desde la base de datos
  useEffect(() => {
    const loadStripeParams = async () => {
      try {
        const params = await getPricingParameters();
        setStripeParams({
          percentage: params.stripePercentage,
          fixedFee: params.stripeFixedFee,
        });
      } catch (error) {
        console.error("Error loading Stripe parameters:", error);
        // Valores por defecto si falla la carga
        setStripeParams({
          percentage: 0.036, // 3.6%
          fixedFee: 3.00,   // $3 MXN
        });
      }
    };
    loadStripeParams();
  }, []);

  // Calcular precio base según talla seleccionada (ya incluye IVA)
  const currentPrice = useMemo(() => {
    if (!isSizesWithPrice || !selectedSize) {
      return product.basePrice ?? parseFloat(product.price.replace(/[^0-9.-]+/g, ""));
    }

    const selectedSizeObj = (sizesArray as Array<{ size: string; price: number; stock: number }>)
      .find(s => s.size === selectedSize);

    return selectedSizeObj?.price ?? product.basePrice ?? parseFloat(product.price.replace(/[^0-9.-]+/g, ""));
  }, [isSizesWithPrice, selectedSize, sizesArray, product.basePrice, product.price]);

  // Calcular precio final con comisión de Stripe y MSI
  const finalPrice = useMemo(() => {
    if (!stripeParams) return currentPrice;

    const basePrice = currentPrice;
    const msiFee = MSI_FEES[selectedMSI as keyof typeof MSI_FEES] || 0;

    // Si es pago de contado (0 MSI), solo aplicar comisión base de Stripe
    if (selectedMSI === 0) {
      return basePrice * (1 + stripeParams.percentage) + stripeParams.fixedFee;
    }

    // Si es MSI, aplicar comisión adicional de MSI sobre el precio base, luego Stripe
    const priceWithMSI = basePrice * (1 + msiFee);
    return priceWithMSI * (1 + stripeParams.percentage) + stripeParams.fixedFee;
  }, [currentPrice, selectedMSI, stripeParams]);
  const displayPrice = `$${finalPrice.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN`;
  const monthlyPayment = selectedMSI > 0 ? finalPrice / selectedMSI : finalPrice;

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


  const handleAddToCart = () => {
    // Usar el precio final que incluye comisiones de Stripe y MSI
    addItem({
      id: product.id,
      name: product.name,
      price: finalPrice,
      image: product.images?.[0] || "/placeholder-product.jpg",
      material: product.material,
      size: selectedSize || undefined,
      slug: product.slug || "",
    });
    
    // Mostrar confirmación
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
        <p className="text-4xl font-semibold text-foreground">{displayPrice}</p>
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
              {(() => {
                // Normalizar las tallas a un formato consistente
                const normalizedSizes: Array<{ size: string; price: number; stock: number }> = isSizesWithPrice
                  ? (product.sizes as Array<{ size: string; price: number; stock: number }>)
                  : (product.sizes as string[]).map(s => ({ 
                      size: s, 
                      price: currentPrice, 
                      stock: 1 // Stock por defecto si no hay información de stock por talla
                    }));

                return normalizedSizes.map((sizeObj) => {
                  const isOutOfStock = sizeObj.stock === 0;
                  
                  return (
                    <div key={sizeObj.size}>
                      <RadioGroupItem
                        value={sizeObj.size}
                        id={sizeObj.size}
                        className="peer sr-only"
                        disabled={isOutOfStock}
                      />
                      <Label
                        htmlFor={sizeObj.size}
                        className={`flex flex-col items-center justify-center rounded-lg border-2 px-4 py-3 text-sm font-medium cursor-pointer transition-all ${
                          isOutOfStock
                            ? 'border-muted bg-muted/50 opacity-50 cursor-not-allowed'
                            : 'border-muted bg-card hover:bg-muted peer-data-[state=checked]:border-[#D4AF37] peer-data-[state=checked]:bg-[#D4AF37]/10'
                        }`}
                      >
                        <span>{sizeObj.size}</span>
                        {isSizesWithPrice && (
                          <span className="text-xs text-muted-foreground mt-1">
                            ${sizeObj.price.toLocaleString("es-MX")}
                          </span>
                        )}
                      </Label>
                    </div>
                  );
                });
              })()}
            </RadioGroup>
          </div>
        )}

        {/* Selector de MSI */}
        <div>
          <Label className="text-base font-semibold">
            Meses Sin Intereses (MSI)
          </Label>
          <RadioGroup
            value={selectedMSI.toString()}
            onValueChange={(value) => setSelectedMSI(parseInt(value))}
            className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-3"
          >
            <div>
              <RadioGroupItem value="0" id="msi-0" className="peer sr-only" />
              <Label
                htmlFor="msi-0"
                className="flex flex-col items-center justify-center rounded-lg border-2 px-4 py-3 text-sm font-medium cursor-pointer transition-all border-muted bg-card hover:bg-muted peer-data-[state=checked]:border-[#D4AF37] peer-data-[state=checked]:bg-[#D4AF37]/10"
              >
                <span className="text-xs text-muted-foreground">De contado</span>
                <span className="text-xs font-semibold mt-1">Sin recargo</span>
              </Label>
            </div>
            <div>
              <RadioGroupItem value="3" id="msi-3" className="peer sr-only" />
              <Label
                htmlFor="msi-3"
                className="flex flex-col items-center justify-center rounded-lg border-2 px-4 py-3 text-sm font-medium cursor-pointer transition-all border-muted bg-card hover:bg-muted peer-data-[state=checked]:border-[#D4AF37] peer-data-[state=checked]:bg-[#D4AF37]/10"
              >
                <span className="text-xs text-muted-foreground">3 meses</span>
                <span className="text-sm font-semibold text-blue-600 mt-1">5%</span>
              </Label>
            </div>
            <div>
              <RadioGroupItem value="6" id="msi-6" className="peer sr-only" />
              <Label
                htmlFor="msi-6"
                className="flex flex-col items-center justify-center rounded-lg border-2 px-4 py-3 text-sm font-medium cursor-pointer transition-all border-muted bg-card hover:bg-muted peer-data-[state=checked]:border-[#D4AF37] peer-data-[state=checked]:bg-[#D4AF37]/10"
              >
                <span className="text-xs text-muted-foreground">6 meses</span>
                <span className="text-sm font-semibold text-blue-600 mt-1">7.5%</span>
              </Label>
            </div>
            <div>
              <RadioGroupItem value="9" id="msi-9" className="peer sr-only" />
              <Label
                htmlFor="msi-9"
                className="flex flex-col items-center justify-center rounded-lg border-2 px-4 py-3 text-sm font-medium cursor-pointer transition-all border-muted bg-card hover:bg-muted peer-data-[state=checked]:border-[#D4AF37] peer-data-[state=checked]:bg-[#D4AF37]/10"
              >
                <span className="text-xs text-muted-foreground">9 meses</span>
                <span className="text-sm font-semibold text-blue-600 mt-1">10%</span>
              </Label>
            </div>
            <div>
              <RadioGroupItem value="12" id="msi-12" className="peer sr-only" />
              <Label
                htmlFor="msi-12"
                className="flex flex-col items-center justify-center rounded-lg border-2 px-4 py-3 text-sm font-medium cursor-pointer transition-all border-muted bg-card hover:bg-muted peer-data-[state=checked]:border-[#D4AF37] peer-data-[state=checked]:bg-[#D4AF37]/10"
              >
                <span className="text-xs text-muted-foreground">12 meses</span>
                <span className="text-sm font-semibold text-blue-600 mt-1">12.5%</span>
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Información de pago mensual */}
        {selectedMSI > 0 && (
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Pago mensual ({selectedMSI} meses):
              </span>
              <span className="text-base font-semibold text-[#D4AF37]">
                ${monthlyPayment.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN
              </span>
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="space-y-3">
          <Button
            size="lg"
            className="w-full bg-[#D4AF37] hover:bg-[#B8941E] text-white text-base font-semibold py-6 transition-all duration-300 hover:scale-[1.02]"
            onClick={handleAddToCart}
            disabled={(() => {
              // Verificar stock de la talla seleccionada
              if (!isSizesWithPrice || !selectedSize) return false;
              const selectedSizeObj = (sizesArray as Array<{ size: string; price: number; stock: number }>)
                .find(s => s.size === selectedSize);
              return selectedSizeObj ? selectedSizeObj.stock === 0 : false;
            })()}
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            {(() => {
              if (!isSizesWithPrice || !selectedSize) return 'Agregar al Carrito';
              const selectedSizeObj = (sizesArray as Array<{ size: string; price: number; stock: number }>)
                .find(s => s.size === selectedSize);
              return selectedSizeObj && selectedSizeObj.stock === 0 ? 'Agotado' : 'Agregar al Carrito';
            })()}
          </Button>
        </div>

        {/* Información de stock */}
        {isSizesWithPrice && selectedSize && (() => {
          const selectedSizeObj = (sizesArray as Array<{ size: string; price: number; stock: number }>)
            .find(s => s.size === selectedSize);
          if (!selectedSizeObj) return null;
          return (
            <div className="text-center">
              {selectedSizeObj.stock > 0 ? (
                <p className="text-sm text-green-600 font-medium">
                  ✓ Disponible ({selectedSizeObj.stock} en stock)
                </p>
              ) : (
                <p className="text-sm text-red-600 font-medium">
                  ✗ Agotado - Contacta para disponibilidad
                </p>
              )}
            </div>
          );
        })()}

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
            <p className="font-semibold text-sm">Garantía de Manufactura</p>
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
