"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Gem, Settings, Loader2, Info, Save, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@/i18n/routing";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getInternalSubcategoriesByCategoryName, getProductsByInternalSubcategory, type InternalSubcategory } from "@/lib/supabase/internal-categories";
import {
  getAllSubcategoryBroquelPricing,
  upsertSubcategoryBroquelPricing,
  getBroquelPricingParameters,
  updateBroquelPricingParameters,
  calculateBroquelBreakdown,
  calculateBroquelPrice,
  DEFAULT_SUBCATEGORY_BROQUEL_PRICING,
  type BroquelPricingParameters,
} from "@/lib/supabase/pricing";
import { BroquelCostsPanel, type BroquelModel } from "@/components/admin/broquel-costs-panel";
import { updateMultipleProductPrices, getProductsWithDetailsBySubcategory } from "@/lib/supabase/products";
import type { ProductListItem } from "@/types/product";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

// Costos de cada modelo (subcategoría). La comisión de venta y las piezas
// son parámetros generales; el envío ya no entra en el precio.
interface ProductBroquelData {
  id: string;
  name: string;
  goldGrams: number; // Oro (GRS)
  carats: number; // Kilataje
  factor: number; // Factor
  merma: number; // Merma %
  laborCost: number; // Mano de obra
  stoneCost: number; // Piedra
  is_active: boolean;
}

// Cálculos completos por modelo (con las piezas base de los parámetros)
interface ProductBroquelCalculation extends ProductBroquelData {
  pz: number; // Piezas base (parámetro general)
  goldCost: number; // Costo oro por pieza
  goldCostWithMerma: number; // Costo oro con merma por pieza
  broquelCost: number; // Costo broquel (antes de utilidad)
  subtotalWithProfit: number; // + Utilidad
  commissionCost: number; // PZ × comisión de venta
  subtotalWithVat: number; // + IVA
  subtotalWithStripe: number; // + Stripe %
  finalPrice: number; // Precio final (fórmula completa)
}

export default function BroquelCalculatorPage() {
  const [subcategories, setSubcategories] = useState<InternalSubcategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmAllDialogOpen, setConfirmAllDialogOpen] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [unlockDialogOpen, setUnlockDialogOpen] = useState(false);
  const [unlockCode, setUnlockCode] = useState("");
  const [selectedSubcategoryId, setSelectedProductId] = useState<string | null>(null);
  const [updatingSubcategories, setUpdatingProducts] = useState<Set<string>>(new Set());
  const [isUpdatingAll, setIsUpdatingAll] = useState(false);

  // Products by subcategory for accordion display
  const [subcategoryProducts, setSubcategoryProducts] = useState<Map<string, ProductListItem[]>>(new Map());
  const [loadingProducts, setLoadingProducts] = useState<Set<string>>(new Set());

  // Refs for debouncing save operations
  const saveTimeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  // Debounce para guardar los parámetros globales (evita guardar en cada tecla)
  const parametersSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Convertir decimal a porcentaje sin artefactos de punto flotante (0.07 -> 7, no 7.000000000000001)
  const toPercent = (value: number): number => parseFloat((value * 100).toFixed(4));
  // Convertir el valor de un input de porcentaje a decimal (permite dejar el campo vacío)
  const percentInputToDecimal = (value: string): string =>
    value === "" ? "" : (parseFloat(value) / 100).toString();

  // Format currency in Mexican Pesos
  const formatMXN = (amount: number): string => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Parámetros globales
  const [parameters, setParameters] = useState<BroquelPricingParameters>({
    quotation: 2550, // Cotización
    profitMargin: 0.08, // 8% utilidad
    vat: 0.16, // 16% IVA
    stripePercentage: 0.036, // 3.6% Stripe
    stripeFixedFee: 3.00, // $3 MXN Stripe fijo
    salesCommission: 0, // Comisión de venta por pieza
    pz: 1, // Piezas base
  });

  // Datos por subcategoría - valores por defecto
  const [productBroquelData, setProductBroquelData] = useState<
    Map<string, Partial<ProductBroquelData>>
  >(new Map());

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      // Load broquel pricing parameters from database
      const params = await getBroquelPricingParameters();
      setParameters(params);

      // Obtener subcategorías de la categoría interna "Broquel"
      const subcategoriesData = await getInternalSubcategoriesByCategoryName("Broquel");
      setSubcategories(subcategoriesData);

      // Load saved pricing data from database
      const savedPricingData = await getAllSubcategoryBroquelPricing();

      // Initialize broquel data with default values or saved data
      const defaults = { ...DEFAULT_SUBCATEGORY_BROQUEL_PRICING };

      const broquelMap = new Map<string, Partial<ProductBroquelData>>();
      subcategoriesData.forEach((subcategory: InternalSubcategory) => {
        // Use saved data if available, otherwise use defaults
        const saved = savedPricingData.get(subcategory.id);
        broquelMap.set(subcategory.id, saved || defaults);
    });
    setProductBroquelData(broquelMap);
    } catch (error) {
      console.error("Error loading broquel data:", error);
      alert("Error al cargar los datos. Por favor recarga la página.");
    } finally {
    setIsLoading(false);
    }
  };

  // Costos y precio final de un modelo, con la misma fórmula que el Excel del cliente
  // (ver calculateBroquelBreakdown). El envío no se incluye: se cobra aparte.
  const calculateSubcategoryPrice = (
    subcategoryItem: InternalSubcategory,
    broquelData: Partial<ProductBroquelData>
  ): ProductBroquelCalculation | null => {
    // Usar ?? para conservar valores en 0
    const pricing = {
      goldGrams: broquelData.goldGrams ?? 0,
      carats: broquelData.carats ?? DEFAULT_SUBCATEGORY_BROQUEL_PRICING.carats,
      factor: 0, // No se usa en la fórmula
      merma: broquelData.merma ?? DEFAULT_SUBCATEGORY_BROQUEL_PRICING.merma,
      laborCost: broquelData.laborCost ?? 0,
      stoneCost: broquelData.stoneCost ?? 0,
    };
    const breakdown = calculateBroquelBreakdown(pricing, parameters);

    return {
      id: subcategoryItem.id,
      name: subcategoryItem.name,
      ...pricing,
      is_active: subcategoryItem.is_active,
      pz: parameters.pz,
      ...breakdown,
      subtotalWithStripe: breakdown.subtotalWithVat * (1 + parameters.stripePercentage),
    };
  };

  // Modelos para la tabla de costos (código = special_code de la subcategoría)
  const brokerModels: BroquelModel[] = useMemo(
    () =>
      subcategories.map((sub) => {
        const data = productBroquelData.get(sub.id) || {};
        return {
          id: sub.id,
          code: sub.special_code || sub.name,
          name: sub.name,
          internalCategoryId: sub.internal_category_id,
          pricing: {
            goldGrams: data.goldGrams ?? 0,
            carats: data.carats ?? DEFAULT_SUBCATEGORY_BROQUEL_PRICING.carats,
            factor: 0,
            merma: data.merma ?? DEFAULT_SUBCATEGORY_BROQUEL_PRICING.merma,
            laborCost: data.laborCost ?? 0,
            stoneCost: data.stoneCost ?? 0,
          },
        };
      }),
    [subcategories, productBroquelData]
  );

  // Calculate prices for all subcategories
  const calculatedSubcategories = useMemo(() => {
    return subcategories
      .map((subcategory) => {
        const broquelData = productBroquelData.get(subcategory.id) || {};
        return calculateSubcategoryPrice(subcategory, broquelData);
      })
      .filter((calc) => calc !== null) as ProductBroquelCalculation[];
  }, [subcategories, productBroquelData, parameters]);

  const handleParameterChange = async (key: keyof BroquelPricingParameters, value: string) => {
    // Allow empty string for better UX while typing
    if (value === "" || value === "-") {
      setParameters({ ...parameters, [key]: 0 });
      return;
    }
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      return; // Don't update if invalid number
    }
    
    const newParameters = { ...parameters, [key]: numValue };
    // Update state immediately for responsive UI
    setParameters(newParameters);

    // Auto-save to database with debounce (no guardar en cada tecla)
    if (parametersSaveTimeoutRef.current) {
      clearTimeout(parametersSaveTimeoutRef.current);
    }
    parametersSaveTimeoutRef.current = setTimeout(async () => {
      parametersSaveTimeoutRef.current = null;
      try {
        await updateBroquelPricingParameters(newParameters);
        // Don't update state after save - keep local state to prevent re-render and focus loss
      } catch (error) {
        console.error("Error saving broquel pricing parameters:", error);
        alert("Error al guardar los parámetros. Se restauraron los valores guardados.");
        // Revert on error
        const params = await getBroquelPricingParameters();
        setParameters(params);
      }
    }, 800); // 800 ms debounce
  };

  // Precio de una talla según sus piezas usando la fórmula completa (igual que el formulario de productos).
  // En productos Broquel, product_sizes.weight guarda el número de piezas.
  const getSizePriceForCalc = (calc: ProductBroquelCalculation, pieces: number): number =>
    calculateBroquelPrice(
      {
        goldGrams: calc.goldGrams,
        carats: calc.carats,
        factor: calc.factor,
        merma: calc.merma,
        laborCost: calc.laborCost,
        stoneCost: calc.stoneCost,
      },
      parameters,
      pieces
    );

  // Rango de precios (mín – máx) para mostrar
  const formatPriceRange = (prices: number[], fallback: number): string => {
    const valid = prices.filter((price) => Number.isFinite(price) && price > 0);
    if (valid.length === 0) return formatMXN(fallback);
    const min = Math.min(...valid);
    const max = Math.max(...valid);
    return min === max ? formatMXN(min) : `${formatMXN(min)} – ${formatMXN(max)}`;
  };

  // Precio actual del producto: precios de sus tallas o, si no tiene, el precio base
  const getCurrentPriceLabel = (product: ProductListItem): string =>
    formatPriceRange(
      (product.sizes || []).map((size) => Number(size.price)),
      product.base_price ?? product.price ?? 0
    );

  // Precio nuevo que se aplicaría a cada talla del producto
  const getNewPriceLabel = (product: ProductListItem, calc: ProductBroquelCalculation): string =>
    formatPriceRange(
      (product.sizes || []).map((size) =>
        size.weight && size.weight > 0 ? getSizePriceForCalc(calc, Number(size.weight)) : calc.finalPrice
      ),
      calc.finalPrice
    );

  // Recargar los productos de una subcategoría ya abierta (después de aplicar precios)
  const reloadProductsForSubcategory = async (subcategoryId: string) => {
    if (!subcategoryProducts.has(subcategoryId)) return;
    try {
      const products = await getProductsWithDetailsBySubcategory(subcategoryId);
      setSubcategoryProducts(prev => new Map(prev).set(subcategoryId, products));
    } catch (error) {
      console.error(`Error reloading products for subcategory ${subcategoryId}:`, error);
    }
  };

  const handleSubcategoryDataChange = async (
    subcategoryId: string,
    key: keyof ProductBroquelData,
    value: string
  ) => {
    const numValue = parseFloat(value) || 0;
    setProductBroquelData((prev) => {
      const newMap = new Map(prev);
      const currentData = newMap.get(subcategoryId) || {};
      const updatedData = { ...currentData, [key]: numValue };
      newMap.set(subcategoryId, updatedData);
      
      // Clear existing timeout for this subcategory
      const existingTimeout = saveTimeoutsRef.current.get(subcategoryId);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }
      
      // Auto-save to database with debounce
      const timeout = setTimeout(async () => {
        try {
          await upsertSubcategoryBroquelPricing(subcategoryId, {
            goldGrams: updatedData.goldGrams ?? DEFAULT_SUBCATEGORY_BROQUEL_PRICING.goldGrams,
            carats: updatedData.carats ?? DEFAULT_SUBCATEGORY_BROQUEL_PRICING.carats,
            factor: updatedData.factor ?? DEFAULT_SUBCATEGORY_BROQUEL_PRICING.factor,
            merma: updatedData.merma ?? DEFAULT_SUBCATEGORY_BROQUEL_PRICING.merma,
            laborCost: updatedData.laborCost ?? DEFAULT_SUBCATEGORY_BROQUEL_PRICING.laborCost,
            stoneCost: updatedData.stoneCost ?? DEFAULT_SUBCATEGORY_BROQUEL_PRICING.stoneCost,
          });
          saveTimeoutsRef.current.delete(subcategoryId);
        } catch (error) {
          console.error("Error saving subcategory broquel pricing:", error);
          saveTimeoutsRef.current.delete(subcategoryId);
          // Mostrar el error para que el admin sepa que el cambio NO se guardó
          const message = (error as { message?: string } | null)?.message || "Error desconocido";
          alert(`Error al guardar los datos de la subcategoría. Los cambios no se guardaron.\n\n${message}`);
        }
      }, 1000); // 1 second debounce
      
      saveTimeoutsRef.current.set(subcategoryId, timeout);
      
      return newMap;
    });
  };

  const handleUnlockSubmit = () => {
    if (unlockCode === "2487") {
      setIsUnlocked(true);
      setUnlockDialogOpen(false);
      setUnlockCode("");
    } else {
      alert("Código incorrecto");
      setUnlockCode("");
    }
  };

  // Load products for a subcategory when accordion is opened
  const loadProductsForSubcategory = async (subcategoryId: string) => {
    // Skip if already loaded or loading
    if (subcategoryProducts.has(subcategoryId) || loadingProducts.has(subcategoryId)) {
      return;
    }

    setLoadingProducts(prev => new Set(prev).add(subcategoryId));

    try {
      const products = await getProductsWithDetailsBySubcategory(subcategoryId);
      setSubcategoryProducts(prev => new Map(prev).set(subcategoryId, products));
    } catch (error) {
      console.error(`Error loading products for subcategory ${subcategoryId}:`, error);
    } finally {
      setLoadingProducts(prev => {
        const newSet = new Set(prev);
        newSet.delete(subcategoryId);
        return newSet;
      });
    }
  };

  // Removed update functions - subcategories don't have prices to update

  const [isApplyingPrices, setIsApplyingPrices] = useState(false);
  const [applyingToSubcategory, setApplyingToSubcategory] = useState<string | null>(null);
  const [isApplyingAllPrices, setIsApplyingAllPrices] = useState(false);
  const [confirmApplyAllDialogOpen, setConfirmApplyAllDialogOpen] = useState(false);

  const handleApplyPriceToProducts = async (subcategoryId: string, finalPrice: number) => {
    // Get the calculation data to find baseGrams
    const calc = calculatedSubcategories.find(c => c.id === subcategoryId);
    if (!calc) {
      alert("Error: No se pudo encontrar la información de cálculo.");
      return;
    }

    if (!(parameters.quotation > 0)) {
      alert("Error: La cotización del oro debe ser mayor a 0 para aplicar precios.");
      return;
    }

    // Para Broquel: las tallas guardan PIEZAS en `weight`, así que la base se expresa en piezas
    // (misma unidad que product_sizes.weight) y cada talla se calcula con la fórmula completa.
    const basePieces = parameters.pz;
    if (!basePieces || basePieces <= 0) {
      alert("Error: Las piezas base (PZ) deben ser mayores a 0.");
      return;
    }

    if (!confirm(`¿Estás seguro de aplicar el precio ${formatMXN(finalPrice)} (base: ${basePieces} pz de ${calc.goldGrams} gr c/u) a todos los productos con esta subcategoría? El precio de cada talla se calculará con la fórmula completa según sus piezas.`)) {
      return;
    }

    setIsApplyingPrices(true);
    setApplyingToSubcategory(subcategoryId);

    try {
      // Obtener todos los productos con esta subcategoría
      const productIds = await getProductsByInternalSubcategory(subcategoryId);
      
      if (productIds.length === 0) {
        alert("No hay productos con esta subcategoría para actualizar.");
        return;
      }

      // Actualizar precios base y calcular el precio de cada talla con la fórmula completa según sus piezas
      const priceUpdates = productIds.map(id => ({
        id,
        price: finalPrice,
        baseGrams: basePieces,
        getSizePrice: (pieces: number) => getSizePriceForCalc(calc, pieces),
      }));

      const results = await updateMultipleProductPrices(priceUpdates);
      await reloadProductsForSubcategory(subcategoryId);

      if (results.failed.length > 0) {
        alert(
          `Se actualizaron ${results.successful.length} productos correctamente. ${results.failed.length} productos fallaron.\n\n${results.failed.map(f => `- ${f.error}`).join('\n')}`
        );
      } else {
        alert(
          `¡Éxito! Se actualizaron ${results.successful.length} productos correctamente. Los precios de las tallas se calcularon con la fórmula completa según sus piezas.`
        );
      }
    } catch (error) {
      console.error("Error applying prices to products:", error);
      alert("Error al aplicar los precios. Por favor intenta de nuevo.");
    } finally {
      setIsApplyingPrices(false);
      setApplyingToSubcategory(null);
    }
  };

  const handleApplyAllPrices = async () => {
    if (!(parameters.quotation > 0)) {
      alert("Error: La cotización del oro debe ser mayor a 0 para aplicar precios.");
      return;
    }
    setConfirmApplyAllDialogOpen(true);
  };

  const confirmApplyAllPrices = async () => {
    setConfirmApplyAllDialogOpen(false);
    if (!(parameters.quotation > 0)) {
      alert("Error: La cotización del oro debe ser mayor a 0 para aplicar precios.");
      return;
    }
    setIsApplyingAllPrices(true);

    try {
      let totalSuccessful = 0;
      let totalFailed = 0;
      const failedSubcategories: Array<{ name: string; error: string }> = [];

      // Iterar sobre todas las subcategorías calculadas
      for (const calc of calculatedSubcategories) {
        // Para Broquel: la base se expresa en piezas (misma unidad que product_sizes.weight)
        const basePieces = parameters.pz;
        if (!basePieces || basePieces <= 0) {
          failedSubcategories.push({
            name: calc.name,
            error: "Piezas base inválidas",
          });
          totalFailed++;
          continue;
        }

        try {
          // Obtener todos los productos con esta subcategoría
          const productIds = await getProductsByInternalSubcategory(calc.id);

          if (productIds.length === 0) {
            continue; // No hay productos, continuar con la siguiente
          }

          // Actualizar precios base y calcular el precio de cada talla con la fórmula completa según sus piezas
          const priceUpdates = productIds.map(id => ({
            id,
            price: calc.finalPrice,
            baseGrams: basePieces,
            getSizePrice: (pieces: number) => getSizePriceForCalc(calc, pieces),
          }));

          const results = await updateMultipleProductPrices(priceUpdates);
          await reloadProductsForSubcategory(calc.id);
          totalSuccessful += results.successful.length;
          totalFailed += results.failed.length;

          // Agregar fallos a la lista
          results.failed.forEach(failed => {
            failedSubcategories.push({
              name: calc.name,
              error: failed.error,
            });
          });
        } catch (error) {
          console.error(`Error applying prices for subcategory ${calc.name}:`, error);
          failedSubcategories.push({
            name: calc.name,
            error: error instanceof Error ? error.message : "Error desconocido",
          });
          totalFailed++;
        }
      }

      // Mostrar resultados
      if (totalFailed > 0) {
        alert(
          `Se actualizaron ${totalSuccessful} productos correctamente. ${totalFailed} productos fallaron.\n\nSubcategorías con errores:\n${failedSubcategories.map(f => `- ${f.name}: ${f.error}`).join('\n')}`
        );
      } else {
        alert(
          `¡Éxito! Se actualizaron ${totalSuccessful} productos correctamente en todas las subcategorías. Los precios de las tallas se calcularon con la fórmula completa según sus piezas.`
        );
      }
    } catch (error) {
      console.error("Error applying all prices:", error);
      alert("Error al aplicar los precios. Por favor intenta de nuevo.");
    } finally {
      setIsApplyingAllPrices(false);
    }
  };

  // Removed update functions - subcategories don't have prices to update

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  const selectedSubcategory = selectedSubcategoryId
    ? calculatedSubcategories.find((p) => p.id === selectedSubcategoryId)
    : null;

  const selectedSubcategoryOriginal = selectedSubcategoryId
    ? subcategories.find((s) => s.id === selectedSubcategoryId)
    : null;

  // Removed currentSelectedSubcategory - subcategories don't have prices

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/admin/calculadora-precios">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <Gem className="h-8 w-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-foreground">
              Calculadora por Broquel
            </h1>
          </div>
          <p className="mt-2 text-muted-foreground ml-14">
            Calcula el precio final de subcategorías tipo broquel
          </p>
        </div>
        <div className="flex gap-2">
          {!isUnlocked && (
            <Dialog open={unlockDialogOpen} onOpenChange={setUnlockDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 border-amber-500 text-amber-600 hover:bg-amber-50">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Desbloquear Campos
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Desbloquear Campos de Edición</DialogTitle>
                  <DialogDescription>
                    Ingresa el código para habilitar la edición de todos los campos
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="unlockCode">Código de Desbloqueo</Label>
                    <Input
                      id="unlockCode"
                      type="password"
                      value={unlockCode}
                      onChange={(e) => setUnlockCode(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleUnlockSubmit();
                        }
                      }}
                      placeholder="Ingresa el código"
                    />
                  </div>
                  <Button onClick={handleUnlockSubmit} className="w-full">
                    Desbloquear
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
          <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Settings className="h-4 w-4" />
                Parámetros
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Parámetros de Cálculo</DialogTitle>
                <DialogDescription>
                  Ajusta los parámetros globales para el cálculo de precios por broquel
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="quotation">Cotización (MXN)</Label>
                  <Input
                    id="quotation"
                    type="number"
                    step="0.01"
                    value={parameters.quotation || ""}
                    onChange={(e) =>
                      handleParameterChange("quotation", e.target.value)
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="profitMargin">Utilidad (%)</Label>
                    <Input
                      id="profitMargin"
                      type="number"
                      step="0.01"
                      value={toPercent(parameters.profitMargin)}
                      onChange={(e) =>
                        handleParameterChange(
                          "profitMargin",
                          percentInputToDecimal(e.target.value)
                        )
                      }
                      disabled={!isUnlocked}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vat">IVA (%)</Label>
                    <Input
                      id="vat"
                      type="number"
                      step="0.01"
                      value={toPercent(parameters.vat)}
                      onChange={(e) =>
                        handleParameterChange(
                          "vat",
                          percentInputToDecimal(e.target.value)
                        )
                      }
                      disabled={!isUnlocked}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="stripePercentage">Stripe (%)</Label>
                    <Input
                      id="stripePercentage"
                      type="number"
                      step="0.01"
                      value={toPercent(parameters.stripePercentage)}
                      onChange={(e) =>
                        handleParameterChange(
                          "stripePercentage",
                          percentInputToDecimal(e.target.value)
                        )
                      }
                      disabled={!isUnlocked}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stripeFixedFee">
                      Comisión Fija Stripe (MXN)
                    </Label>
                    <Input
                      id="stripeFixedFee"
                      type="number"
                      step="0.01"
                      value={parameters.stripeFixedFee}
                      onChange={(e) =>
                        handleParameterChange("stripeFixedFee", e.target.value)
                      }
                      disabled={!isUnlocked}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pz">PZ (piezas base)</Label>
                    <Input
                      id="pz"
                      type="number"
                      step="1"
                      min="1"
                      value={parameters.pz}
                      onChange={(e) => handleParameterChange("pz", e.target.value)}
                      disabled={!isUnlocked}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salesCommission">Comisión de venta por pieza (MXN)</Label>
                    <Input
                      id="salesCommission"
                      type="number"
                      step="0.01"
                      value={parameters.salesCommission}
                      onChange={(e) => handleParameterChange("salesCommission", e.target.value)}
                      disabled={!isUnlocked}
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Estos parámetros se aplican a todos los modelos de broquel. El envío ya no se incluye en el precio: se cobra aparte al cliente.
                </p>
              </div>
            </DialogContent>
          </Dialog>
          <Button
            onClick={handleApplyAllPrices}
            disabled={isApplyingAllPrices || calculatedSubcategories.length === 0 || !(parameters.quotation > 0)}
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:text-white disabled:opacity-50"
          >
            {isApplyingAllPrices ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Aplicando a todos...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Aplicar a Todos
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Current parameters information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Parámetros Actuales
          </CardTitle>
          <CardDescription>
            Valores utilizados para calcular los precios finales
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Cotización</p>
              <p className="text-lg font-semibold">
                {formatMXN(parameters.quotation)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Utilidad</p>
              <p className="text-lg font-semibold">
                {(parameters.profitMargin * 100).toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">IVA</p>
              <p className="text-lg font-semibold">
                {(parameters.vat * 100).toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Stripe %</p>
              <p className="text-lg font-semibold">
                {(parameters.stripePercentage * 100).toFixed(2)}%
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Stripe Fija</p>
              <p className="text-lg font-semibold">
                {formatMXN(parameters.stripeFixedFee)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">PZ</p>
              <p className="text-lg font-semibold">{parameters.pz}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Comisión de venta</p>
              <p className="text-lg font-semibold">{formatMXN(parameters.salesCommission)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calculation Formula */}
      <Card className="border-purple-200 bg-purple-50/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-900">
            <Gem className="h-5 w-5" />
            Fórmula de Cálculo - Broquel
          </CardTitle>
          <CardDescription className="text-purple-700">
            Así se calcula el precio final para cada subcategoría tipo broquel
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-white rounded-lg p-4 border border-purple-200">
            <p className="text-sm font-semibold text-purple-900 mb-3">Precio Final =</p>
            <p className="text-xs font-mono text-gray-800 leading-relaxed bg-gray-50 p-3 rounded border break-words">
              ((((Cotización × Kilataje / 24 × Oro) × (1 + Merma) + Mano de obra + Piedra) × PZ) × (1 + Utilidad) + (PZ × Comisión de venta)) × (1 + IVA) × (1 + Stripe %) + Stripe fijo
            </p>

            <div className="mt-4 space-y-2 text-xs text-gray-700 border-t pt-3">
              <p className="font-semibold text-purple-900 mb-2">Desglose de componentes:</p>
              <div className="space-y-1.5 ml-2">
                <p><span className="font-semibold text-purple-800">Costo Oro:</span> Cotización × (Kilataje / 24) × Oro(grs)</p>
                <p><span className="font-semibold text-purple-800">Costo Oro con Merma:</span> Costo Oro × (1 + Merma%)</p>
                <p><span className="font-semibold text-purple-800">Costo Broquel:</span> (Costo Oro con Merma + Mano de Obra + Piedra) × PZ</p>
                <p><span className="font-semibold text-purple-800">Costo Comisión:</span> PZ × Comisión de Venta</p>
                <p><span className="font-semibold text-purple-800">Envío:</span> ya no se incluye; se cobra aparte al cliente</p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
            <p className="text-xs text-purple-900">
              <span className="font-semibold">Nota importante:</span> Las comisiones de Stripe ({(parameters.stripePercentage * 100).toFixed(2)}% + {formatMXN(parameters.stripeFixedFee)}) SÍ se incluyen en el precio final calculado. El cliente verá este precio final en el sitio web y NO habrá cargos adicionales en el checkout.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
              <p className="text-xs font-semibold text-purple-900 mb-2">Costos por Modelo:</p>
              <ul className="text-xs text-purple-800 space-y-1">
                <li>• Oro (grs)</li>
                <li>• Kilataje</li>
                <li>• Merma %</li>
                <li>• Mano de Obra</li>
                <li>• Piedra</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
              <p className="text-xs font-semibold text-green-900 mb-2">Parámetros Globales:</p>
              <ul className="text-xs text-green-800 space-y-1">
                <li>• Cotización</li>
                <li>• Utilidad (%)</li>
                <li>• IVA (%)</li>
                <li>• Stripe (%)</li>
                <li>• Stripe Fijo</li>
                <li>• PZ (Piezas)</li>
                <li>• Comisión de Venta</li>
              </ul>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <p className="text-xs font-semibold text-blue-900 mb-2">Diferencia con Gramo:</p>
            <p className="text-xs text-blue-800">
              La fórmula de Broquel considera el <span className="font-semibold">kilataje</span> (pureza del oro)
              y aplica una <span className="font-semibold">merma</span> al costo del oro. Además, los cálculos
              se multiplican por el número de <span className="font-semibold">piezas (PZ)</span> del producto.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de costos por modelo con carga desde Excel */}
      <BroquelCostsPanel
        models={brokerModels}
        parameters={parameters}
        onImported={loadProducts}
      />

      {/* Products accordions with calculations */}
      <Card>
        <CardHeader>
          <CardTitle>Subcategorías y Cálculos de Precio</CardTitle>
          <CardDescription>
            {calculatedSubcategories.length} subcategoría(s) con cálculo de precio final
          </CardDescription>
        </CardHeader>
        <CardContent>
          {calculatedSubcategories.length === 0 ? (
            <div className="px-6 py-12 text-center text-muted-foreground">
              No hay subcategorías para calcular
            </div>
          ) : (
            <Accordion type="multiple" className="w-full">
              {calculatedSubcategories.map((calc) => {
                const subcategory = subcategories.find(s => s.id === calc.id);
                const products = subcategoryProducts.get(calc.id) || [];
                const isLoadingProductsForThis = loadingProducts.has(calc.id);

                    return (
                  <AccordionItem key={calc.id} value={calc.id}>
                    <AccordionTrigger
                      className="hover:no-underline"
                      onClick={() => loadProductsForSubcategory(calc.id)}
                    >
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="flex flex-col items-start gap-1">
                          <div className="font-semibold text-left">
                            {subcategory?.special_code ? (
                              <>
                                <span className="text-foreground">{subcategory.special_code}</span>
                                <span className="text-muted-foreground"> - {calc.name}</span>
                              </>
                            ) : (
                              calc.name
                            )}
                          </div>
                          <div className="flex gap-4 text-xs text-muted-foreground">
                            <span>Oro: {calc.goldGrams}g</span>
                            <span>Costo Broquel: <span className="font-semibold text-foreground">{formatMXN(calc.broquelCost)}</span></span>
                            <span>Precio Final: <span className="font-bold text-[#D4AF37]">{formatMXN(calc.finalPrice)}</span></span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApplyPriceToProducts(calc.id, calc.finalPrice);
                          }}
                          disabled={isApplyingPrices || applyingToSubcategory === calc.id || !(parameters.quotation > 0)}
                          className="gap-2 bg-green-600 hover:bg-green-700 text-white"
                        >
                          {isApplyingPrices && applyingToSubcategory === calc.id ? (
                            <>
                              <Loader2 className="h-3 w-3 animate-spin" />
                              Aplicando...
                            </>
                          ) : (
                            <>
                              <Save className="h-3 w-3" />
                              Aplicar
                            </>
                          )}
                        </Button>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-6 pt-4">
                        {/* Variables de entrada */}
                        <div className="bg-purple-50/50 rounded-lg p-4 border border-purple-200">
                          <h4 className="font-semibold text-sm mb-3 text-purple-900">Variables de Cálculo</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="space-y-1">
                              <Label htmlFor={`goldGrams-${calc.id}`} className="text-xs">Oro (grs)</Label>
                          <Input
                                id={`goldGrams-${calc.id}`}
                            type="number"
                            step="0.001"
                            value={calc.goldGrams}
                                onChange={(e) => handleSubcategoryDataChange(calc.id, "goldGrams", e.target.value)}
                                className="h-8"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor={`carats-${calc.id}`} className="text-xs">Kilataje</Label>
                          <Input
                                id={`carats-${calc.id}`}
                            type="number"
                            step="1"
                            value={calc.carats}
                                onChange={(e) => handleSubcategoryDataChange(calc.id, "carats", e.target.value)}
                            disabled={!isUnlocked}
                                className="h-8"
                          />
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor={`merma-${calc.id}`} className="text-xs">Merma %</Label>
                          <Input
                                id={`merma-${calc.id}`}
                            type="number"
                            step="0.01"
                            value={calc.merma}
                                onChange={(e) => handleSubcategoryDataChange(calc.id, "merma", e.target.value)}
                            disabled={!isUnlocked}
                                className="h-8"
                          />
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor={`laborCost-${calc.id}`} className="text-xs">Mano de Obra</Label>
                          <Input
                                id={`laborCost-${calc.id}`}
                            type="number"
                            step="0.01"
                            value={calc.laborCost}
                                onChange={(e) => handleSubcategoryDataChange(calc.id, "laborCost", e.target.value)}
                            disabled={!isUnlocked}
                                className="h-8"
                          />
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor={`stoneCost-${calc.id}`} className="text-xs">Piedra</Label>
                          <Input
                                id={`stoneCost-${calc.id}`}
                            type="number"
                            step="0.01"
                            value={calc.stoneCost}
                                onChange={(e) => handleSubcategoryDataChange(calc.id, "stoneCost", e.target.value)}
                            disabled={!isUnlocked}
                                className="h-8"
                          />
                            </div>
                            </div>
                              </div>

                        {/* Resultados de cálculo */}
                        <div className="bg-blue-50/50 rounded-lg p-4 border border-blue-200">
                          <h4 className="font-semibold text-sm mb-3 text-blue-900">Desglose de Costos</h4>
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                            <div>
                              <p className="text-xs text-muted-foreground">Costo Broquel</p>
                              <p className="font-semibold">{formatMXN(calc.broquelCost)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">+ Utilidad</p>
                              <p className="font-semibold">{formatMXN(calc.subtotalWithProfit)}</p>
                          </div>
                            <div>
                              <p className="text-xs text-muted-foreground">+ IVA</p>
                              <p className="font-semibold">{formatMXN(calc.subtotalWithVat)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">+ Stripe %</p>
                              <p className="font-semibold">{formatMXN(calc.subtotalWithStripe)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Precio Final</p>
                              <p className="font-bold text-lg text-[#D4AF37]">{formatMXN(calc.finalPrice)}</p>
                            </div>
                          </div>
                        </div>

                        {/* Productos relacionados */}
                        <div className="bg-green-50/50 rounded-lg p-4 border border-green-200">
                          <h4 className="font-semibold text-sm mb-3 text-green-900">Productos Relacionados</h4>
                          {isLoadingProductsForThis ? (
                            <div className="flex items-center justify-center py-8">
                              <Loader2 className="h-6 w-6 animate-spin text-green-600" />
                              <span className="ml-2 text-sm text-muted-foreground">Cargando productos...</span>
                            </div>
                          ) : products.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No hay productos con esta subcategoría</p>
                          ) : (
                            <div className="space-y-3">
                              {products.map((product) => (
                                <div key={product.id} className="bg-white rounded-lg p-3 border border-green-100 flex items-center gap-4">
                                  {product.primary_image && (
                                    <img
                                      src={product.primary_image}
                                      alt={product.name}
                                      className="w-16 h-16 object-cover rounded"
                                    />
                                  )}
                                  <div className="flex-1">
                                    <h5 className="font-medium text-sm">{product.name}</h5>
                                    <p className="text-xs text-muted-foreground">Material: {product.material}</p>
                                    <div className="flex gap-4 mt-1 text-xs">
                                      <span>Precio actual: <span className="font-semibold">{getCurrentPriceLabel(product)}</span></span>
                                      <span>Nuevo precio: <span className="font-semibold text-[#D4AF37]">{getNewPriceLabel(product, calc)}</span></span>
                                    </div>
                                  </div>
                                  <HoverCard>
                                    <HoverCardTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                        <Info className="h-4 w-4" />
                          </Button>
                                    </HoverCardTrigger>
                                    <HoverCardContent className="w-96" align="end">
                                      <div className="space-y-3">
                                        <h4 className="font-semibold text-sm border-b pb-2">📊 Cómo se calculó el precio paso a paso</h4>
                                        <div className="space-y-3 text-xs">
                                          {(() => {
                                            // Calcular valores intermedios para el desglose
                                            const goldCostPerPiece = calc.goldCost;
                                            const mermaDecimal = calc.merma / 100;
                                            const goldCostWithMermaPerPiece = calc.goldCostWithMerma;
                                            const subtotalBeforeProfitPerPiece = goldCostWithMermaPerPiece + calc.laborCost + calc.stoneCost;
                                            const subtotalByPieces = calc.broquelCost;
                                            const commissionCost = calc.commissionCost;
                                            const subtotalWithCommission = calc.subtotalWithProfit + commissionCost;
                                            const stripePercentage = parameters.stripePercentage;
                                            const stripeFixedFee = parameters.stripeFixedFee;

                                            return (
                                              <>
                                                <div className="bg-blue-50 p-2 rounded border border-blue-200">
                                                  <p className="font-semibold text-blue-900 mb-1">Paso 1: ¿Cuánto cuesta el oro por cada pieza?</p>
                                                  <p className="text-gray-700">El precio del oro es {formatMXN(parameters?.quotation || 0)} por gramo</p>
                                                  <p className="text-gray-700">Este producto es de {calc.carats} kilates (eso es {calc.carats}/24 = {(calc.carats / 24).toFixed(4)} del oro puro)</p>
                                                  <p className="text-gray-700">Cada pieza tiene {calc.goldGrams} gramos de oro</p>
                                                  <p className="font-mono font-semibold text-blue-900 mt-1">
                                                    {formatMXN(parameters?.quotation || 0)} × ({calc.carats} ÷ 24) × {calc.goldGrams} = {formatMXN(goldCostPerPiece)}
                                                  </p>
                                                  <p className="text-xs text-blue-700 mt-2 italic border-t border-blue-200 pt-1">
                                                    📝 Fórmula: (Cotización × (Kilataje ÷ 24) × Oro(gr))
                                                  </p>
                                                </div>

                                                <div className="bg-amber-50 p-2 rounded border border-amber-200">
                                                  <p className="font-semibold text-amber-900 mb-1">Paso 2: Agregamos la merma ({calc.merma}%)</p>
                                                  <p className="text-gray-700">Cuando trabajamos el oro, siempre se pierde un poco (eso es la merma)</p>
                                                  <p className="text-gray-700">Agregamos {calc.merma}% al costo del oro</p>
                                                  <p className="font-mono font-semibold text-amber-900 mt-1">
                                                    {formatMXN(goldCostPerPiece)} × {(1 + mermaDecimal).toFixed(2)} = {formatMXN(goldCostWithMermaPerPiece)}
                                                  </p>
                                                  <p className="text-xs text-amber-700 mt-2 italic border-t border-amber-200 pt-1">
                                                    📝 Fórmula: (Costo oro × (1 + Merma%))
                                                  </p>
                                                </div>

                                                <div className="bg-green-50 p-2 rounded border border-green-200">
                                                  <p className="font-semibold text-green-900 mb-1">Paso 3: Agregamos la mano de obra y las piedras (por pieza)</p>
                                                  <p className="text-gray-700">Costo del oro con merma: {formatMXN(goldCostWithMermaPerPiece)}</p>
                                                  <p className="text-gray-700">Mano de obra: {formatMXN(calc.laborCost)}</p>
                                                  <p className="text-gray-700">Piedras: {formatMXN(calc.stoneCost)}</p>
                                                  <p className="font-mono font-semibold text-green-900 mt-1">
                                                    {formatMXN(goldCostWithMermaPerPiece)} + {formatMXN(calc.laborCost)} + {formatMXN(calc.stoneCost)} = {formatMXN(subtotalBeforeProfitPerPiece)}
                                                  </p>
                                                  <p className="text-xs text-green-700 mt-2 italic border-t border-green-200 pt-1">
                                                    📝 Fórmula: (Costo oro con merma + Mano de obra + Piedra)
                                                  </p>
                                                </div>

                                                <div className="bg-purple-50 p-2 rounded border border-purple-200">
                                                  <p className="font-semibold text-purple-900 mb-1">Paso 4: Costo broquel (multiplicamos por el número de piezas)</p>
                                                  <p className="text-gray-700">Cada pieza cuesta: {formatMXN(subtotalBeforeProfitPerPiece)}</p>
                                                  <p className="text-gray-700">Este producto tiene {calc.pz} pieza{calc.pz !== 1 ? 's' : ''}</p>
                                                  <p className="font-mono font-semibold text-purple-900 mt-1">
                                                    {formatMXN(subtotalBeforeProfitPerPiece)} × {calc.pz} = {formatMXN(subtotalByPieces)}
                                                  </p>
                                                  <p className="text-xs text-purple-700 mt-2 italic border-t border-purple-200 pt-1">
                                                    📝 Fórmula: (Subtotal por pieza × Piezas)
                                                  </p>
                                                </div>

                                                <div className="bg-yellow-50 p-2 rounded border border-yellow-200">
                                                  <p className="font-semibold text-yellow-900 mb-1">Paso 5: Agregamos la ganancia ({toPercent(parameters?.profitMargin || 0)}%)</p>
                                                  <p className="text-gray-700">Tomamos el subtotal anterior y le agregamos {toPercent(parameters?.profitMargin || 0)}% de ganancia</p>
                                                  <p className="font-mono font-semibold text-yellow-900 mt-1">
                                                    {formatMXN(subtotalByPieces)} × {(1 + (parameters?.profitMargin || 0)).toFixed(2)} = {formatMXN(calc.subtotalWithProfit)}
                                                  </p>
                                                  <p className="text-xs text-yellow-700 mt-2 italic border-t border-yellow-200 pt-1">
                                                    📝 Fórmula: (Subtotal por piezas × (1 + Utilidad%))
                                                  </p>
                                                </div>

                                                <div className="bg-orange-50 p-2 rounded border border-orange-200">
                                                  <p className="font-semibold text-orange-900 mb-1">Paso 6: Agregamos la comisión de venta</p>
                                                  <p className="text-gray-700">Por cada pieza cobramos {formatMXN(parameters.salesCommission)} de comisión</p>
                                                  <p className="text-gray-700">Este producto tiene {calc.pz} pieza{calc.pz !== 1 ? 's' : ''}</p>
                                                  <p className="font-mono font-semibold text-orange-900 mt-1">
                                                    {calc.pz} × {formatMXN(parameters.salesCommission)} = {formatMXN(commissionCost)}
                                                  </p>
                                                  <p className="text-xs text-orange-700 mt-2 italic border-t border-orange-200 pt-1">
                                                    📝 Fórmula: (Piezas × Comisión de venta)
                                                  </p>
                                                </div>

                                                <div className="bg-pink-50 p-2 rounded border border-pink-200">
                                                  <p className="font-semibold text-pink-900 mb-1">Paso 7: Sumamos la comisión al subtotal</p>
                                                  <p className="text-gray-700">Subtotal con ganancia: {formatMXN(calc.subtotalWithProfit)}</p>
                                                  <p className="text-gray-700">Comisión de venta: {formatMXN(commissionCost)}</p>
                                                  <p className="font-mono font-semibold text-pink-900 mt-1">
                                                    {formatMXN(calc.subtotalWithProfit)} + {formatMXN(commissionCost)} = {formatMXN(subtotalWithCommission)}
                                                  </p>
                                                  <p className="text-xs text-pink-700 mt-2 italic border-t border-pink-200 pt-1">
                                                    📝 Fórmula: (Subtotal con utilidad + Comisión de venta)
                                                  </p>
                                                </div>

                                                <div className="bg-indigo-50 p-2 rounded border border-indigo-200">
                                                  <p className="font-semibold text-indigo-900 mb-1">Paso 8: Agregamos el IVA ({toPercent(parameters?.vat || 0)}%)</p>
                                                  <p className="text-gray-700">El gobierno cobra {toPercent(parameters?.vat || 0)}% de impuesto</p>
                                                  <p className="text-gray-700">Multiplicamos el subtotal anterior por {(1 + (parameters?.vat || 0)).toFixed(2)}</p>
                                                  <p className="font-mono font-semibold text-indigo-900 mt-1">
                                                    {formatMXN(subtotalWithCommission)} × {(1 + (parameters?.vat || 0)).toFixed(2)} = {formatMXN(calc.subtotalWithVat)}
                                                  </p>
                                                  <p className="text-xs text-indigo-700 mt-2 italic border-t border-indigo-200 pt-1">
                                                    📝 Fórmula: (Subtotal con comisión × (1 + IVA%))
                                                  </p>
                                                </div>

                                                <div className="bg-teal-50 p-2 rounded border border-teal-200">
                                                  <p className="font-semibold text-teal-900 mb-1">Paso 9: Agregamos la comisión de Stripe</p>
                                                  <p className="text-gray-700">Stripe cobra {toPercent(parameters?.stripePercentage || 0)}% más {formatMXN(parameters?.stripeFixedFee || 0)} fijos</p>
                                                  <p className="text-gray-700">Primero multiplicamos por {(1 + stripePercentage).toFixed(4)}</p>
                                                  <p className="text-gray-700">Luego sumamos {formatMXN(stripeFixedFee)}</p>
                                                  <p className="font-mono font-semibold text-teal-900 mt-1">
                                                    ({formatMXN(calc.subtotalWithVat)} × {(1 + stripePercentage).toFixed(4)}) + {formatMXN(stripeFixedFee)} = {formatMXN(calc.finalPrice)}
                                                  </p>
                                                  <p className="text-xs text-teal-700 mt-2 italic border-t border-teal-200 pt-1">
                                                    📝 Fórmula: ((Subtotal con IVA × (1 + Stripe%)) + Stripe fijo)
                                                  </p>
                                                </div>

                                                <div className="flex justify-between items-center border-t-2 border-purple-400 pt-3 bg-purple-50 -mx-2 px-2 py-2 rounded">
                                                  <span className="font-bold text-base">💰 Precio Final que paga el cliente:</span>
                                                  <span className="font-bold text-xl text-[#D4AF37]">{formatMXN(calc.finalPrice)}</span>
                                                </div>
                                              </>
                                            );
                                          })()}
                                        </div>
                                      </div>
                                    </HoverCardContent>
                                  </HoverCard>
                                </div>
                              ))}
                            </div>
                          )}
          </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          )}
        </CardContent>
      </Card>

      {/* Confirm individual update dialog */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-blue-600" />
              Confirmar Actualización de Precio
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3 pt-3">
              {selectedSubcategory && (
                <>
                  <p>
                    Precio calculado para{" "}
                    <span className="font-semibold text-foreground">
                      {selectedSubcategoryOriginal?.special_code ? (
                        <>
                          <span>{selectedSubcategoryOriginal.special_code}</span>
                          <span className="text-muted-foreground"> - {selectedSubcategory?.name || ""}</span>
                        </>
                      ) : (
                        selectedSubcategory?.name || ""
                      )}
                    </span>
                  </p>
                  <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-800">Precio Calculado:</span>
                      <span className="font-semibold text-blue-900">
                        {formatMXN(selectedSubcategory.finalPrice)}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={true}
              className="bg-gray-400 cursor-not-allowed"
            >
              Solo Cálculo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm update all dialog */}
      <AlertDialog open={confirmAllDialogOpen} onOpenChange={setConfirmAllDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              Confirmar Actualización Masiva
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3 pt-3">
              <p>
                ¿Estás seguro de que deseas actualizar los precios de{" "}
                <span className="font-semibold text-foreground">
                  {calculatedSubcategories.length} subcategoría(s)
                </span>
                ?
              </p>
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
                <p className="text-sm text-amber-800">
                  ⚠️ Esta acción actualizará todos los precios de los subcategorías
                  en la base de datos según los cálculos actuales. Esta acción
                  no se puede deshacer.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={true}
              className="bg-gray-400 cursor-not-allowed"
            >
              Solo Cálculo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm apply all prices dialog */}
      <AlertDialog open={confirmApplyAllDialogOpen} onOpenChange={setConfirmApplyAllDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              Confirmar Aplicar Precios a Todos
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3 pt-3">
              <p>
                ¿Estás seguro de que deseas aplicar los precios finales calculados a todos los productos de{" "}
                <span className="font-semibold text-foreground">
                  {calculatedSubcategories.length} subcategoría(s)
                </span>
                ?
              </p>
              <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 space-y-2">
                <p className="text-sm text-blue-800 font-medium">
                  Esta acción:
                </p>
                <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
                  <li>Actualizará el precio base de todos los productos</li>
                  <li>Calculará el precio de cada talla con la fórmula completa según sus piezas</li>
                  <li>Aplicará los precios según los cálculos actuales de cada subcategoría</li>
                </ul>
              </div>
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
                <p className="text-sm text-amber-800">
                  ⚠️ Esta acción no se puede deshacer. Asegúrate de que los cálculos sean correctos antes de continuar.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmApplyAllPrices}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
            >
              Aplicar a Todos
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
