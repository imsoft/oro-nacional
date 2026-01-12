"use client";

import { useState, useEffect, useMemo } from "react";
import { Heart, Share2, ShoppingCart, Shield, Truck, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCartStore } from "@/stores/cart-store";
import { getPricingParameters, calculateDynamicProductPrice } from "@/lib/supabase/pricing";
import { useCurrency } from "@/contexts/currency-context";

interface ProductInfoProps {
  product: {
    id: string;
    name: string;
    price: string;
    basePrice?: number;
    baseGrams?: number; // Gramos base usados para calcular el precio base
    category: string;
    material: string;
    description: string;
    specifications: {
      [key: string]: string;
    };
    sizes?: Array<{
      size: string;
      price: number;
      price_usd?: number | null;
      stock: number;
      weight?: number; // Gramos de oro
    }> | string[];
    basePriceUSD?: number | null;
    weight?: number;
    slug?: string;
    images?: string[];
    internalCategory?: { id: string; name: string } | null;
    internalSubcategory?: { id: string; name: string } | null;
  };
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  const { currency, convertPrice, formatPrice } = useCurrency();
  
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
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);
  const [isCalculatingPrice, setIsCalculatingPrice] = useState(false);
  const { addItem } = useCartStore();

  // Tasas de interés para pagos a meses (sobre el precio base)
  const INTEREST_RATES = {
    0: 0,      // Pago de contado - sin intereses (solo comisión base de Stripe)
    3: 0.05,   // 3 meses - 5% de intereses
    6: 0.075,  // 6 meses - 7.5% de intereses
    9: 0.10,   // 9 meses - 10% de intereses
    12: 0.125, // 12 meses - 12.5% de intereses
  };

  // Obtener parámetros de Stripe desde la base de datos
  useEffect(() => {
    const loadStripeParams = async () => {
      try {
        const params = await getPricingParameters();
        if (params) {
          setStripeParams({
            percentage: params.stripePercentage,
            fixedFee: params.stripeFixedFee,
          });
        }
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

  // Calcular precio dinámicamente si hay categoría/subcategoría interna y gramos
  useEffect(() => {
    const calculatePrice = async () => {
      // Solo calcular si hay categoría interna, subcategoría interna y gramos
      if (
        !product.internalCategory ||
        !product.internalSubcategory ||
        !isSizesWithPrice ||
        !selectedSize
      ) {
        setCalculatedPrice(null);
        return;
      }

      const selectedSizeObj = (sizesArray as Array<{ size: string; price: number; stock: number; weight?: number }>)
        .find(s => s.size === selectedSize);

      // Si no hay gramos en la talla, no calcular dinámicamente
      if (!selectedSizeObj?.weight) {
        setCalculatedPrice(null);
        return;
      }

      setIsCalculatingPrice(true);
      try {
        // Si hay precio base y gramos base, calcular proporcionalmente
        if (product.basePrice && product.baseGrams && product.baseGrams > 0) {
          // Calcular precio proporcional: basePrice * (sizeWeight / baseGrams)
          const proportionalPrice = product.basePrice * (selectedSizeObj.weight / product.baseGrams);
          setCalculatedPrice(Math.round(proportionalPrice * 100) / 100); // Redondear a 2 decimales
        } else {
          // Si no hay precio base, calcular dinámicamente desde cero
          const dynamicPrice = await calculateDynamicProductPrice({
            goldGrams: selectedSizeObj.weight,
            subcategoryId: product.internalSubcategory.id,
            categoryName: product.internalCategory.name,
          });

          setCalculatedPrice(dynamicPrice);
        }
      } catch (error) {
        console.error("Error calculating dynamic price:", error);
        setCalculatedPrice(null);
      } finally {
        setIsCalculatingPrice(false);
      }
    };

    calculatePrice();
  }, [selectedSize, product.internalCategory, product.internalSubcategory, product.basePrice, product.baseGrams, isSizesWithPrice, sizesArray]);

  // Calcular precio base según talla seleccionada (ya incluye IVA)
  // Si hay precio calculado dinámicamente, usarlo; si no, usar el precio guardado
  const currentPrice = useMemo(() => {
    // Si hay precio calculado dinámicamente, usarlo
    if (calculatedPrice !== null) {
      return calculatedPrice;
    }

    // Si no, usar el precio guardado
    if (!isSizesWithPrice || !selectedSize) {
      const basePriceMXN = product.basePrice ?? parseFloat(product.price.replace(/[^0-9.-]+/g, ""));
      return convertPrice(basePriceMXN, product.basePriceUSD);
    }

    const selectedSizeObj = (sizesArray as Array<{ size: string; price: number; price_usd?: number | null; stock: number }>)
      .find(s => s.size === selectedSize);

    const priceMXN = selectedSizeObj?.price ?? product.basePrice ?? parseFloat(product.price.replace(/[^0-9.-]+/g, ""));
    return convertPrice(priceMXN, selectedSizeObj?.price_usd ?? product.basePriceUSD);
  }, [calculatedPrice, isSizesWithPrice, selectedSize, sizesArray, product.basePrice, product.basePriceUSD, product.price, convertPrice]);

  // Calcular precio final con comisión de Stripe e intereses
  const finalPrice = useMemo(() => {
    if (!stripeParams) return currentPrice;

    const basePrice = currentPrice;
    const interestRate = INTEREST_RATES[selectedMSI as keyof typeof INTEREST_RATES] || 0;

    // Si es pago de contado (0 MSI), solo aplicar comisión base de Stripe
    if (selectedMSI === 0) {
      return basePrice * (1 + stripeParams.percentage) + stripeParams.fixedFee;
    }

    // Si es a meses, aplicar intereses sobre el precio base, luego Stripe
    const priceWithInterest = basePrice * (1 + interestRate);
    return priceWithInterest * (1 + stripeParams.percentage) + stripeParams.fixedFee;
  }, [currentPrice, selectedMSI, stripeParams]);

  const displayPrice = formatPrice(finalPrice);
  const monthlyPayment = selectedMSI > 0 ? finalPrice / selectedMSI : finalPrice;
  const interestAmount = selectedMSI > 0 ? finalPrice - (currentPrice * (1 + (stripeParams?.percentage || 0)) + (stripeParams?.fixedFee || 0)) : 0;

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
    // Usar el precio base de la talla seleccionada (sin comisiones de Stripe/MSI)
    // Las comisiones se aplicarán al momento del pago
    addItem({
      id: product.id,
      name: product.name,
      price: currentPrice,
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
        <div className="flex items-baseline gap-2">
          <p className="text-4xl font-semibold text-foreground">
            {isCalculatingPrice ? "Calculando..." : formatPrice(currentPrice)}
          </p>
          {!isCalculatingPrice && (
            <span className="text-lg font-medium text-muted-foreground">
              {currency}
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {calculatedPrice !== null ? "Precio calculado dinámicamente" : "IVA incluido"}
        </p>
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
                const normalizedSizes: Array<{ size: string; price: number; price_usd?: number | null; stock: number; weight?: number }> = isSizesWithPrice
                  ? (product.sizes as Array<{ size: string; price: number; price_usd?: number | null; stock: number; weight?: number }>)
                  : (product.sizes as string[]).map(s => ({
                      size: s,
                      price: currentPrice,
                      price_usd: product.basePriceUSD,
                      stock: 1, // Stock por defecto si no hay información de stock por talla
                      weight: undefined
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
                      </Label>
                    </div>
                  );
                });
              })()}
            </RadioGroup>
          </div>
        )}

        {/* Selector de Pagos a Meses */}
        <div>
          <Label className="text-base font-semibold">
            Opciones de Pago a Meses
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
                className="flex flex-col items-center justify-center rounded-lg border-2 px-4 py-3 text-sm font-medium cursor-pointer transition-all border-muted bg-card hover:bg-muted peer-data-[state=checked]:border-green-600 peer-data-[state=checked]:bg-green-50"
              >
                <span className="text-xs text-muted-foreground">De contado</span>
                <span className="text-xs font-semibold text-green-600 mt-1">0% interés</span>
              </Label>
            </div>
            <div>
              <RadioGroupItem value="3" id="msi-3" className="peer sr-only" />
              <Label
                htmlFor="msi-3"
                className="flex flex-col items-center justify-center rounded-lg border-2 px-4 py-3 text-sm font-medium cursor-pointer transition-all border-muted bg-card hover:bg-muted peer-data-[state=checked]:border-amber-600 peer-data-[state=checked]:bg-amber-50"
              >
                <span className="text-xs text-muted-foreground">3 meses</span>
                <span className="text-sm font-semibold text-amber-600 mt-1">5% interés</span>
              </Label>
            </div>
            <div>
              <RadioGroupItem value="6" id="msi-6" className="peer sr-only" />
              <Label
                htmlFor="msi-6"
                className="flex flex-col items-center justify-center rounded-lg border-2 px-4 py-3 text-sm font-medium cursor-pointer transition-all border-muted bg-card hover:bg-muted peer-data-[state=checked]:border-amber-600 peer-data-[state=checked]:bg-amber-50"
              >
                <span className="text-xs text-muted-foreground">6 meses</span>
                <span className="text-sm font-semibold text-amber-600 mt-1">7.5% interés</span>
              </Label>
            </div>
            <div>
              <RadioGroupItem value="9" id="msi-9" className="peer sr-only" />
              <Label
                htmlFor="msi-9"
                className="flex flex-col items-center justify-center rounded-lg border-2 px-4 py-3 text-sm font-medium cursor-pointer transition-all border-muted bg-card hover:bg-muted peer-data-[state=checked]:border-amber-600 peer-data-[state=checked]:bg-amber-50"
              >
                <span className="text-xs text-muted-foreground">9 meses</span>
                <span className="text-sm font-semibold text-amber-600 mt-1">10% interés</span>
              </Label>
            </div>
            <div>
              <RadioGroupItem value="12" id="msi-12" className="peer sr-only" />
              <Label
                htmlFor="msi-12"
                className="flex flex-col items-center justify-center rounded-lg border-2 px-4 py-3 text-sm font-medium cursor-pointer transition-all border-muted bg-card hover:bg-muted peer-data-[state=checked]:border-amber-600 peer-data-[state=checked]:bg-amber-50"
              >
                <span className="text-xs text-muted-foreground">12 meses</span>
                <span className="text-sm font-semibold text-amber-600 mt-1">12.5% interés</span>
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Información de pago mensual */}
        {selectedMSI > 0 ? (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-amber-900">
                  Pago mensual ({selectedMSI} meses):
                </span>
                <span className="text-lg font-bold text-amber-600">
                  {formatPrice(monthlyPayment)} {currency}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-amber-700">Total a pagar:</span>
                <span className="font-semibold text-amber-900">{formatPrice(finalPrice)} {currency}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-amber-700">Incluye intereses del {(INTEREST_RATES[selectedMSI as keyof typeof INTEREST_RATES] * 100)}%:</span>
                <span className="font-semibold text-amber-900">+{formatPrice(interestAmount)} {currency}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-green-900">
                Pago de contado (sin intereses):
              </span>
              <span className="text-lg font-bold text-green-600">
                {formatPrice(finalPrice)} {currency}
              </span>
            </div>
            <p className="text-xs text-green-700 mt-2">✓ Mejor precio disponible</p>
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
