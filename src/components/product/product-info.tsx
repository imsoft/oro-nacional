"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Link } from "@/i18n/routing";
import { Heart, Share2, ShoppingCart, Shield, Truck, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCartStore } from "@/stores/cart-store";
import { getPricingParameters } from "@/lib/supabase/pricing";
import { useCurrency } from "@/contexts/currency-context";
import { PRODUCT_PLACEHOLDER_IMAGE } from "@/components/catalog/product-display";

type SizeWithPrice = {
  size: string;
  price: number | null;
  price_usd?: number | null;
  stock: number;
  weight?: number; // Gramos de oro o piezas según categoría
};

interface ProductInfoProps {
  product: {
    id: string;
    name: string;
    basePrice?: number | null; // Precio base en MXN (0 o null = sin precio)
    baseGrams?: number; // Gramos base usados para calcular el precio base
    category: string;
    material: string;
    description?: string | null;
    specifications: {
      [key: string]: string;
    };
    sizes?: SizeWithPrice[] | string[];
    basePriceUSD?: number | null;
    weight?: number;
    slug?: string;
    images?: string[];
    internalCategory?: { id: string; name: string } | null;
    internalSubcategory?: { id: string; name: string } | null;
  };
}

// Tasas de interés para pagos a meses (sobre el precio base)
const INTEREST_RATES = {
  0: 0,      // Pago de contado - sin intereses (solo comisión base de Stripe)
  3: 0.05,   // 3 meses - 5% de intereses
  6: 0.075,  // 6 meses - 7.5% de intereses
  9: 0.10,   // 9 meses - 10% de intereses
  12: 0.125, // 12 meses - 12.5% de intereses
};

const INSTALLMENT_MONTHS = [3, 6, 9, 12] as const;

const ProductInfo = ({ product }: ProductInfoProps) => {
  const t = useTranslations("product");
  const tCommon = useTranslations("common");
  const { currency, convertPrice, formatPrice, exchangeRate } = useCurrency();

  // Unidad según categoría interna: Gramo → gramos, Broquel (y similares) → pares
  const categoryName = product.internalCategory?.name?.toLowerCase() ?? "";
  const isByPairs = categoryName === "broquel" || categoryName === "broqueles";
  const formatUnits = (count: number) =>
    isByPairs ? t("pairs", { count }) : t("grams", { count });

  // Determinar si sizes es un array de objetos o strings
  const sizesArray = product.sizes || [];
  const isSizesWithPrice = sizesArray.length > 0 && typeof sizesArray[0] === 'object';
  // Preseleccionar la primera talla con existencias (si ninguna tiene, la primera)
  const firstSize = isSizesWithPrice
    ? ((sizesArray as SizeWithPrice[]).find((s) => s.stock > 0) ?? (sizesArray as SizeWithPrice[])[0]).size
    : (sizesArray[0] as string) || "";

  const [selectedSize, setSelectedSize] = useState(firstSize);
  const [selectedMSI, setSelectedMSI] = useState<number>(0); // 0 = Sin MSI (pago de contado)
  const [isFavorite, setIsFavorite] = useState(false);
  const [stripeParams, setStripeParams] = useState<{ percentage: number; fixedFee: number } | null>(null);
  const { addItem } = useCartStore();

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

  // NO calcular precio dinámicamente - siempre usar el precio guardado desde el formulario
  // El precio debe venir de sizes[].price que se guarda en el formulario de edición/creación

  const selectedSizeObj = isSizesWithPrice && selectedSize
    ? (sizesArray as SizeWithPrice[]).find((s) => s.size === selectedSize)
    : undefined;

  // Precio unitario en MXN (ya incluye IVA) y precio fijo en USD si existe.
  // Prioridad: precio de la talla > precio base del producto. 0 = sin precio.
  const sizePriceMXN = selectedSizeObj?.price ?? 0;
  const basePriceMXN = product.basePrice ?? 0;
  const priceMXN = sizePriceMXN > 0 ? sizePriceMXN : basePriceMXN > 0 ? basePriceMXN : 0;
  const priceUSD = sizePriceMXN > 0
    ? selectedSizeObj?.price_usd ?? null
    : product.basePriceUSD ?? null;
  const hasPrice = priceMXN > 0;
  const isOutOfStock = selectedSizeObj ? selectedSizeObj.stock === 0 : false;

  // Precio en la moneda mostrada (MXN o USD)
  const currentPrice = hasPrice ? convertPrice(priceMXN, priceUSD) : 0;

  // La comisión fija de Stripe está en MXN: convertirla si se muestra en USD
  const fixedFee = stripeParams
    ? currency === 'USD' && exchangeRate > 0
      ? stripeParams.fixedFee / exchangeRate
      : stripeParams.fixedFee
    : 0;

  // Calcular precio final con comisión de Stripe e intereses
  const finalPrice = useMemo(() => {
    if (!stripeParams) return currentPrice;

    const interestRate = INTEREST_RATES[selectedMSI as keyof typeof INTEREST_RATES] || 0;

    // Pago de contado (0 MSI): solo comisión base de Stripe.
    // A meses: intereses sobre el precio base y luego Stripe.
    const priceWithInterest = currentPrice * (1 + interestRate);
    return priceWithInterest * (1 + stripeParams.percentage) + fixedFee;
  }, [currentPrice, selectedMSI, stripeParams, fixedFee]);

  const monthlyPayment = selectedMSI > 0 ? finalPrice / selectedMSI : finalPrice;
  const interestAmount = selectedMSI > 0 ? finalPrice - (currentPrice * (1 + (stripeParams?.percentage || 0)) + fixedFee) : 0;

  const handleShare = async () => {
    const description = product.description ?? "";
    const summary = description.length > 100 ? `${description.substring(0, 100)}...` : description;
    const priceText = hasPrice ? `${formatPrice(currentPrice)} ${currency}` : t("priceOnRequest");
    const shareData = {
      title: `${product.name} - Oro Nacional`,
      text: [summary, priceText].filter(Boolean).join(" - "),
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copiar al portapapeles
        await navigator.clipboard.writeText(shareData.url);
        toast.success(t("linkCopied"));
      }
    } catch (err) {
      console.log("Error sharing:", err);
    }
  };


  const handleAddToCart = () => {
    if (!hasPrice || isOutOfStock) return;

    // El carrito guarda SIEMPRE el precio unitario en MXN (sin comisiones de Stripe/MSI)
    // y, si existe, el precio fijo en USD. La conversión se hace al mostrar/cobrar.
    addItem({
      id: product.id,
      name: product.name,
      price: priceMXN,
      priceUSD,
      image: product.images?.[0] || PRODUCT_PLACEHOLDER_IMAGE,
      material: product.material,
      size: selectedSize || undefined,
      slug: product.slug || "",
    });

    // Mostrar confirmación
    toast.success(t("addedToCart"));
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
        {hasPrice ? (
          <>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-semibold text-foreground">
                {formatPrice(currentPrice)}
              </p>
              <span className="text-lg font-medium text-muted-foreground">
                {currency}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {t("taxIncluded")}
            </p>
          </>
        ) : (
          <p className="text-3xl font-semibold text-foreground">
            {t("priceOnRequest")}
          </p>
        )}
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
              {t("size")} {selectedSize && `- ${selectedSize}`}
            </Label>
            <RadioGroup
              value={selectedSize}
              onValueChange={setSelectedSize}
              className="mt-4 grid grid-cols-4 gap-3"
            >
              {(() => {
                // Normalizar las tallas a un formato consistente
                const normalizedSizes: SizeWithPrice[] = isSizesWithPrice
                  ? (product.sizes as SizeWithPrice[])
                  : (product.sizes as string[]).map(s => ({
                      size: s,
                      price: null,
                      price_usd: null,
                      stock: 1, // Stock por defecto si no hay información de stock por talla
                      weight: undefined
                    }));

                return normalizedSizes.map((sizeObj) => {
                  const isOutOfStock = sizeObj.stock === 0;
                  const weight = sizeObj.weight;
                  const weightText = weight !== undefined && weight !== null && weight > 0
                    ? formatUnits(weight)
                    : null;

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
                        {weightText && (
                          <span className="text-xs font-normal text-muted-foreground mt-0.5">{weightText}</span>
                        )}
                      </Label>
                    </div>
                  );
                });
              })()}
            </RadioGroup>
          </div>
        )}

        {hasPrice ? (
          <>
            {/* Selector de Pagos a Meses */}
            <div>
              <Label className="text-base font-semibold">
                {t("installmentOptions")}
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
                    <span className="text-xs text-muted-foreground">{t("payInFull")}</span>
                    <span className="text-xs font-semibold text-green-600 mt-1">{t("zeroInterest")}</span>
                  </Label>
                </div>
                {INSTALLMENT_MONTHS.map((months) => (
                  <div key={months}>
                    <RadioGroupItem value={months.toString()} id={`msi-${months}`} className="peer sr-only" />
                    <Label
                      htmlFor={`msi-${months}`}
                      className="flex flex-col items-center justify-center rounded-lg border-2 px-4 py-3 text-sm font-medium cursor-pointer transition-all border-muted bg-card hover:bg-muted peer-data-[state=checked]:border-amber-600 peer-data-[state=checked]:bg-amber-50"
                    >
                      <span className="text-xs text-muted-foreground">{t("months", { count: months })}</span>
                      <span className="text-sm font-semibold text-amber-600 mt-1">
                        {t("interestRate", { rate: INTEREST_RATES[months] * 100 })}
                      </span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Información de pago mensual */}
            {selectedMSI > 0 ? (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-amber-900">
                      {t("monthlyPayment", { count: selectedMSI })}
                    </span>
                    <span className="text-lg font-bold text-amber-600">
                      {formatPrice(monthlyPayment)} {currency}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-amber-700">{t("totalToPay")}</span>
                    <span className="font-semibold text-amber-900">{formatPrice(finalPrice)} {currency}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-amber-700">
                      {t("includesInterest", { rate: INTEREST_RATES[selectedMSI as keyof typeof INTEREST_RATES] * 100 })}
                    </span>
                    <span className="font-semibold text-amber-900">+{formatPrice(interestAmount)} {currency}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-green-900">
                    {t("payInFullNoInterest")}
                  </span>
                  <span className="text-lg font-bold text-green-600">
                    {formatPrice(finalPrice)} {currency}
                  </span>
                </div>
                <p className="text-xs text-green-700 mt-2">{t("bestPrice")}</p>
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            {t("priceOnRequestHint")}{" "}
            <Link href="/contact" className="font-medium text-[#D4AF37] hover:text-[#B8941E]">
              {t("contactUs")}
            </Link>
          </p>
        )}

        {/* Botones de acción */}
        <div className="space-y-3">
          <Button
            size="lg"
            className="w-full bg-[#D4AF37] hover:bg-[#B8941E] text-white text-base font-semibold py-6 transition-all duration-300 hover:scale-[1.02]"
            onClick={handleAddToCart}
            disabled={!hasPrice || isOutOfStock}
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            {isOutOfStock
              ? tCommon("outOfStock")
              : hasPrice
                ? tCommon("addToCart")
                : t("priceOnRequest")}
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
            {isFavorite ? t("saved") : tCommon("save")}
          </Button>
          <Button variant="outline" size="lg" className="flex-1" onClick={handleShare}>
            <Share2 className="mr-2 h-5 w-5" />
            {t("share")}
          </Button>
        </div>
      </div>

      {/* Beneficios */}
      <div className="border-t border-border pt-6 space-y-4">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-[#D4AF37] mt-0.5" />
          <div>
            <p className="font-semibold text-sm">{t("certificateTitle")}</p>
            <p className="text-sm text-muted-foreground">
              {t("certificateDescription", { material: product.material })}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Truck className="h-5 w-5 text-[#D4AF37] mt-0.5" />
          <div>
            <p className="font-semibold text-sm">{t("secureShippingTitle")}</p>
            <p className="text-sm text-muted-foreground">
              {t("secureShippingDescription")}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Award className="h-5 w-5 text-[#D4AF37] mt-0.5" />
          <div>
            <p className="font-semibold text-sm">{t("warrantyTitle")}</p>
            <p className="text-sm text-muted-foreground">
              {t("warrantyDescription")}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs de información */}
      {(() => {
        const hasSpecifications = product.specifications && Object.keys(product.specifications).length > 0;
        const defaultTab = hasSpecifications ? "specs" : "care";
        
        return (
          <Tabs defaultValue={defaultTab} className="border-t border-border pt-6">
            <TabsList className={`grid w-full ${hasSpecifications ? 'grid-cols-3' : 'grid-cols-2'}`}>
              {hasSpecifications && (
                <TabsTrigger value="specs">{t("tabSpecs")}</TabsTrigger>
              )}
              <TabsTrigger value="care">{t("tabCare")}</TabsTrigger>
              <TabsTrigger value="shipping">{t("tabShipping")}</TabsTrigger>
            </TabsList>
            {hasSpecifications && (
              <TabsContent value="specs" className="mt-6 space-y-3">
                {Object.entries(product.specifications).map(([key, value]) => {
                  // Solo las especificaciones de peso llevan unidad (no "piezas", "cantidad", etc.)
                  const isWeight = /\b(peso|gramos?|weight|grams?)\b/i.test(key);
                  const displayValue = isWeight && value.trim() !== ""
                    ? (() => {
                        const num = parseFloat(value.replace(",", "."));
                        if (isNaN(num)) return value;
                        return formatUnits(num);
                      })()
                    : value;
                  return (
                    <div
                      key={key}
                      className="flex justify-between py-2 border-b border-border last:border-0"
                    >
                      <span className="font-medium text-sm">{key}</span>
                      <span className="text-sm text-muted-foreground">{displayValue}</span>
                    </div>
                  );
                })}
              </TabsContent>
            )}
            <TabsContent value="care" className="mt-6 space-y-3 text-sm text-muted-foreground">
              <ul className="list-disc list-inside space-y-2">
                {(["care1", "care2", "care3", "care4", "care5"] as const).map((key) => (
                  <li key={key}>{t(key)}</li>
                ))}
              </ul>
            </TabsContent>
            <TabsContent value="shipping" className="mt-6 space-y-3 text-sm text-muted-foreground">
              {(["shippingNational", "shippingTracking", "shippingPackaging", "shippingInsurance"] as const).map((key) => (
                <p key={key}>
                  {t.rich(key, { strong: (chunks) => <strong>{chunks}</strong> })}
                </p>
              ))}
            </TabsContent>
          </Tabs>
        );
      })()}
    </div>
  );
};

export default ProductInfo;
