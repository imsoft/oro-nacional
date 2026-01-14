"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Calculator, Settings, Loader2, Info, Save, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  getPricingParameters,
  updatePricingParameters,
  getAllSubcategoryPricing,
  upsertSubcategoryPricing,
  type SubcategoryPricingData,
} from "@/lib/supabase/pricing";
import type {
  PricingParameters,
  ProductPricingData,
  ProductPricingCalculation,
} from "@/types/pricing";

export default function PriceCalculatorPage() {
  const [subcategories, setSubcategories] = useState<InternalSubcategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmAllDialogOpen, setConfirmAllDialogOpen] = useState(false);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(null);
  const [updatingSubcategories, setUpdatingSubcategories] = useState<Set<string>>(new Set());
  const [isUpdatingAll, setIsUpdatingAll] = useState(false);
  const [isSavingParameters, setIsSavingParameters] = useState(false);
  const [isSavingSubcategoryData, setIsSavingSubcategoryData] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [unlockDialogOpen, setUnlockDialogOpen] = useState(false);
  const [unlockCode, setUnlockCode] = useState("");

  // Products by subcategory for accordion display
  const [subcategoryProducts, setSubcategoryProducts] = useState<Map<string, ProductListItem[]>>(new Map());
  const [loadingProducts, setLoadingProducts] = useState<Set<string>>(new Set());

  // Refs for debouncing save operations
  const saveTimeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // Format currency in Mexican Pesos
  const formatMXN = (amount: number): string => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Pricing parameters - default values
  const [parameters, setParameters] = useState<PricingParameters>({
    goldQuotation: 1500, // Gold price per gram in MXN
    profitMargin: 0.3, // 30% profit
    vat: 0.16, // 16% VAT
    stripePercentage: 0.036, // 3.6% Stripe commission
    stripeFixedFee: 3, // $3 MXN Stripe fixed fee
  });

  // Subcategory pricing data with calculation values
  const [subcategoryPricingData, setSubcategoryPricingData] = useState<
    Map<string, Partial<ProductPricingData>>
  >(new Map());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load pricing parameters from database
      const params = await getPricingParameters();
      if (params) {
        setParameters(params);
      }

      // Obtener subcategorías de la categoría interna "Gramo"
      const subcategoriesData = await getInternalSubcategoriesByCategoryName("Gramo");
      setSubcategories(subcategoriesData);

      // Load saved pricing data from database
      const savedPricingData = await getAllSubcategoryPricing();
      
      // Initialize pricing data for all subcategories with default values or saved data
      const defaults = {
        goldGrams: 5,
        factor: 0.442,
        laborCost: 15,
        stoneCost: 0,
        salesCommission: 30,
        shippingCost: 800,
      };
      
      const pricingMap = new Map<string, Partial<ProductPricingData>>();
      subcategoriesData.forEach((subcategory) => {
        // Use saved data if available, otherwise use defaults
        const saved = savedPricingData.get(subcategory.id);
        pricingMap.set(subcategory.id, saved || defaults);
      });
      setSubcategoryPricingData(pricingMap);
    } catch (error) {
      console.error("Error loading data:", error);
      alert("Error al cargar los datos. Por favor recarga la página.");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to calculate final price of a subcategory
  const calculateSubcategoryPrice = (
    subcategory: InternalSubcategory,
    pricingData: Partial<ProductPricingData>
  ): ProductPricingCalculation | null => {
    // Default values if not defined - use nullish coalescing to preserve 0 values
    const goldGrams = pricingData.goldGrams ?? 5;
    const factor = pricingData.factor ?? 0.442;
    const laborCost = pricingData.laborCost ?? 15;
    const stoneCost = pricingData.stoneCost ?? 0;
    const salesCommission = pricingData.salesCommission ?? 30;
    const shippingCost = pricingData.shippingCost ?? 800;

    // Formula: ((($H$2*D5*F5)+(D5*(H5+I5)))*(1+J5)+(D5*K5)+L5)*(1+M5)*(1+N5)+O5
    const goldCost = parameters.goldQuotation * goldGrams * factor;
    const materialsCost = goldGrams * (laborCost + stoneCost);
    const subtotalBeforeProfit = goldCost + materialsCost;
    const subtotalWithProfit =
      subtotalBeforeProfit * (1 + parameters.profitMargin);
    const commissionCost = goldGrams * salesCommission;
    const subtotalWithCommissions =
      subtotalWithProfit + commissionCost + shippingCost;
    const subtotalWithVat = subtotalWithCommissions * (1 + parameters.vat);

    // INCLUIR comisiones de Stripe en el precio final: 3.6% + $3 MXN
    const stripePercentage = 0.036; // 3.6%
    const stripeFixedFee = 3; // $3 MXN
    const finalPrice = (subtotalWithVat * (1 + stripePercentage)) + stripeFixedFee;

    return {
      id: subcategory.id,
      name: subcategory.name,
      goldGrams,
      factor,
      laborCost,
      stoneCost,
      salesCommission,
      shippingCost,
      material: "",
      stock: 0,
      category_name: "",
      primary_image: undefined,
      is_active: subcategory.is_active,
      goldCost,
      materialsCost,
      subtotalBeforeProfit,
      subtotalWithProfit,
      commissionCost,
      subtotalWithCommissions,
      subtotalWithVat,
      subtotalWithStripePercentage: subtotalWithVat * (1 + parameters.stripePercentage), // Solo para mostrar en la tabla
      finalPrice,
    };
  };

  // Calculate prices for all subcategories
  const calculatedSubcategories = useMemo(() => {
    return subcategories
      .map((subcategory) => {
        const pricingData = subcategoryPricingData.get(subcategory.id) || {};
        return calculateSubcategoryPrice(subcategory, pricingData);
      })
      .filter((calc) => calc !== null) as ProductPricingCalculation[];
  }, [subcategories, subcategoryPricingData, parameters]);

  const handleParameterChange = async (key: keyof PricingParameters, value: string) => {
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

    // Auto-save to database asynchronously (don't block UI)
    setIsSavingParameters(true);
    try {
      await updatePricingParameters(newParameters);
      // Don't update state after save - keep local state to prevent re-render and focus loss
    } catch (error) {
      console.error("Error saving pricing parameters:", error);
      // Revert on error
      const params = await getPricingParameters();
      if (params) {
        setParameters(params);
      }
    } finally {
      setIsSavingParameters(false);
    }
  };

  const handleSubcategoryDataChange = async (
    subcategoryId: string,
    key: keyof ProductPricingData,
    value: string
  ) => {
    const numValue = parseFloat(value) || 0;

    // Update local state
    setSubcategoryPricingData((prev) => {
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
          await upsertSubcategoryPricing(subcategoryId, {
            goldGrams: updatedData.goldGrams ?? 5,
            factor: updatedData.factor ?? 0.442,
            laborCost: updatedData.laborCost ?? 15,
            stoneCost: updatedData.stoneCost ?? 0,
            salesCommission: updatedData.salesCommission ?? 30,
            shippingCost: updatedData.shippingCost ?? 800,
          });
          saveTimeoutsRef.current.delete(subcategoryId);
        } catch (error) {
          console.error("Error saving subcategory pricing:", error);
          saveTimeoutsRef.current.delete(subcategoryId);
        }
      }, 1000); // 1 second debounce
      
      saveTimeoutsRef.current.set(subcategoryId, timeout);
      
      return newMap;
    });
  };

  // Removed update functions - subcategories are for calculation only

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

    const baseGrams = calc.goldGrams;
    if (!baseGrams || baseGrams <= 0) {
      alert("Error: Los gramos base deben ser mayores a 0.");
      return;
    }

    if (!confirm(`¿Estás seguro de aplicar el precio ${formatMXN(finalPrice)} (base: ${baseGrams} gr) a todos los productos con esta subcategoría?`)) {
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

      // Actualizar precios base y calcular precios de tallas proporcionalmente
      const priceUpdates = productIds.map(id => ({
        id,
        price: finalPrice,
        baseGrams: baseGrams,
      }));

      const results = await updateMultipleProductPrices(priceUpdates);

      if (results.failed.length > 0) {
        alert(
          `Se actualizaron ${results.successful.length} productos correctamente. ${results.failed.length} productos fallaron.`
        );
      } else {
        alert(
          `¡Éxito! Se actualizaron ${results.successful.length} productos correctamente. Los precios de las tallas se calcularon proporcionalmente.`
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
    setConfirmApplyAllDialogOpen(true);
  };

  const confirmApplyAllPrices = async () => {
    setConfirmApplyAllDialogOpen(false);
    setIsApplyingAllPrices(true);

    try {
      let totalSuccessful = 0;
      let totalFailed = 0;
      const failedSubcategories: Array<{ name: string; error: string }> = [];

      // Iterar sobre todas las subcategorías calculadas
      for (const calc of calculatedSubcategories) {
        const baseGrams = calc.goldGrams;
        if (!baseGrams || baseGrams <= 0) {
          failedSubcategories.push({
            name: calc.name,
            error: "Gramos base inválidos",
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

          // Actualizar precios base y calcular precios de tallas proporcionalmente
          const priceUpdates = productIds.map(id => ({
            id,
            price: calc.finalPrice,
            baseGrams: baseGrams,
          }));

          const results = await updateMultipleProductPrices(priceUpdates);
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
          `¡Éxito! Se actualizaron ${totalSuccessful} productos correctamente en todas las subcategorías. Los precios de las tallas se calcularon proporcionalmente.`
        );
      }
    } catch (error) {
      console.error("Error applying all prices:", error);
      alert("Error al aplicar los precios. Por favor intenta de nuevo.");
    } finally {
      setIsApplyingAllPrices(false);
    }
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  const selectedSubcategory = selectedSubcategoryId
    ? calculatedSubcategories.find((s) => s.id === selectedSubcategoryId)
    : null;
  
  const selectedSubcategoryOriginal = selectedSubcategoryId
    ? subcategories.find((s) => s.id === selectedSubcategoryId)
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Calculator className="h-8 w-8 text-[#D4AF37]" />
            <h1 className="text-3xl font-bold text-foreground">
              Calculadora de Precios
            </h1>
          </div>
          <p className="mt-2 text-muted-foreground">
            Calcula el precio final de todos los productos con la fórmula de
            costos
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
                  Ajusta los parámetros globales para el cálculo de precios
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="goldQuotation">
                      Cotización del Oro (MXN/gr)
                    </Label>
                    <Input
                      id="goldQuotation"
                      type="number"
                      step="0.01"
                      value={parameters.goldQuotation || ""}
                      onChange={(e) =>
                        handleParameterChange("goldQuotation", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profitMargin">Utilidad (%)</Label>
                    <Input
                      id="profitMargin"
                      type="number"
                      step="0.01"
                      value={parameters.profitMargin * 100}
                      onChange={(e) =>
                        handleParameterChange(
                          "profitMargin",
                          (parseFloat(e.target.value) / 100).toString()
                        )
                      }
                      disabled={!isUnlocked}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vat">IVA (%)</Label>
                    <Input
                      id="vat"
                      type="number"
                      step="0.01"
                      value={parameters.vat * 100}
                      onChange={(e) =>
                        handleParameterChange(
                          "vat",
                          (parseFloat(e.target.value) / 100).toString()
                        )
                      }
                      disabled={!isUnlocked}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stripePercentage">Stripe (%)</Label>
                    <Input
                      id="stripePercentage"
                      type="number"
                      step="0.01"
                      value={parameters.stripePercentage * 100}
                      onChange={(e) =>
                        handleParameterChange(
                          "stripePercentage",
                          (parseFloat(e.target.value) / 100).toString()
                        )
                      }
                      disabled={!isUnlocked}
                    />
                  </div>
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
            </DialogContent>
          </Dialog>
          <Button
            onClick={handleApplyAllPrices}
            disabled={isApplyingAllPrices || calculatedSubcategories.length === 0}
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
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Cotización Oro</p>
              <p className="text-lg font-semibold">
                {formatMXN(parameters.goldQuotation)}/gr
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
          </div>
        </CardContent>
      </Card>

      {/* Calculation Formula */}
      <Card className="border-blue-200 bg-blue-50/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Calculator className="h-5 w-5" />
            Fórmula de Cálculo - Gramo
          </CardTitle>
          <CardDescription className="text-blue-700">
            Así se calcula el precio final para cada subcategoría
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <p className="text-sm font-semibold text-blue-900 mb-3">Precio Final =</p>
            <p className="text-xs font-mono text-gray-800 leading-relaxed bg-gray-50 p-3 rounded border">
              (((Cotización × Oro × Factor) + (Oro × (Mano de obra + Piedra))) × (1 + Utilidad) + (Oro × Comisión de venta) + Envío) × (1 + IVA) × (1 + Stripe %) + Stripe fijo
            </p>

            <div className="mt-4 space-y-2 text-xs text-gray-700 border-t pt-3">
              <p className="font-semibold text-blue-900 mb-2">Desglose de componentes:</p>
              <div className="space-y-1.5 ml-2">
                <p><span className="font-semibold text-blue-800">Costo Oro:</span> Cotización × Oro(grs) × Factor</p>
                <p><span className="font-semibold text-blue-800">Costo Materiales:</span> Oro(grs) × (Mano de Obra + Piedra)</p>
                <p><span className="font-semibold text-blue-800">Costo Comisión:</span> Oro(grs) × Comisión de Venta</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <p className="text-xs text-blue-900">
              <span className="font-semibold">Nota importante:</span> Las comisiones de Stripe ({(parameters.stripePercentage * 100).toFixed(2)}% + {formatMXN(parameters.stripeFixedFee)}) SÍ se incluyen en el precio final calculado. El cliente verá este precio final en el sitio web y NO habrá cargos adicionales en el checkout.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-3 border border-amber-200">
              <p className="text-xs font-semibold text-amber-900 mb-2">Variables por Subcategoría:</p>
              <ul className="text-xs text-amber-800 space-y-1">
                <li>• Oro (grs)</li>
                <li>• Factor</li>
                <li>• Mano de Obra</li>
                <li>• Piedra</li>
                <li>• Comisión</li>
                <li>• Envío</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
              <p className="text-xs font-semibold text-green-900 mb-2">Parámetros Globales:</p>
              <ul className="text-xs text-green-800 space-y-1">
                <li>• Cotización del Oro</li>
                <li>• Utilidad (%)</li>
                <li>• IVA (%)</li>
                <li>• Stripe (%) - Solo para referencia</li>
                <li>• Stripe Fijo - Solo para referencia</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

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
                            <span>Precio Final: <span className="font-bold text-[#D4AF37]">{formatMXN(calc.finalPrice)}</span></span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApplyPriceToProducts(calc.id, calc.finalPrice);
                          }}
                          disabled={isApplyingPrices || applyingToSubcategory === calc.id}
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
                        <div className="bg-amber-50/50 rounded-lg p-4 border border-amber-200">
                          <h4 className="font-semibold text-sm mb-3 text-amber-900">Variables de Cálculo</h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="space-y-1">
                              <Label htmlFor={`goldGrams-${calc.id}`} className="text-xs">Oro (grs)</Label>
                              <Input
                                id={`goldGrams-${calc.id}`}
                                type="number"
                                step="0.01"
                                value={calc.goldGrams}
                                onChange={(e) => handleSubcategoryDataChange(calc.id, "goldGrams", e.target.value)}
                                className="h-8"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor={`factor-${calc.id}`} className="text-xs">Factor</Label>
                              <Input
                                id={`factor-${calc.id}`}
                                type="number"
                                step="0.01"
                                value={calc.factor}
                                onChange={(e) => handleSubcategoryDataChange(calc.id, "factor", e.target.value)}
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
                            <div className="space-y-1">
                              <Label htmlFor={`salesCommission-${calc.id}`} className="text-xs">Comisión</Label>
                              <Input
                                id={`salesCommission-${calc.id}`}
                                type="number"
                                step="0.01"
                                value={calc.salesCommission}
                                onChange={(e) => handleSubcategoryDataChange(calc.id, "salesCommission", e.target.value)}
                                disabled={!isUnlocked}
                                className="h-8"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor={`shippingCost-${calc.id}`} className="text-xs">Envío</Label>
                              <Input
                                id={`shippingCost-${calc.id}`}
                                type="number"
                                step="0.01"
                                value={calc.shippingCost}
                                onChange={(e) => handleSubcategoryDataChange(calc.id, "shippingCost", e.target.value)}
                                disabled={!isUnlocked}
                                className="h-8"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Resultados de cálculo */}
                        <div className="bg-blue-50/50 rounded-lg p-4 border border-blue-200">
                          <h4 className="font-semibold text-sm mb-3 text-blue-900">Desglose de Costos</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-xs text-muted-foreground">Costo Oro</p>
                              <p className="font-semibold">{formatMXN(calc.goldCost)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Materiales</p>
                              <p className="font-semibold">{formatMXN(calc.materialsCost)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">+ Utilidad</p>
                              <p className="font-semibold">{formatMXN(calc.subtotalWithProfit)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">+ Comisiones</p>
                              <p className="font-semibold">{formatMXN(calc.subtotalWithCommissions)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">+ IVA</p>
                              <p className="font-semibold">{formatMXN(calc.subtotalWithVat)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">+ Stripe %</p>
                              <p className="font-semibold">{formatMXN(calc.subtotalWithStripePercentage)}</p>
                            </div>
                            <div className="col-span-2">
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
                                      <span>Precio actual: <span className="font-semibold">{formatMXN(product.price)}</span></span>
                                      <span>Nuevo precio: <span className="font-semibold text-[#D4AF37]">{formatMXN(calc.finalPrice)}</span></span>
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
                                        <h4 className="font-semibold text-sm border-b pb-2">Desglose del Cálculo - Método Gramo</h4>
                                        <div className="space-y-2 text-xs">
                                          <div className="flex justify-between items-center">
                                            <span className="text-muted-foreground">1. Costo del Oro:</span>
                                            <span className="font-mono">{calc.goldGrams}g × {formatMXN(parameters?.goldQuotation || 0)} = {formatMXN(calc.goldCost)}</span>
                                          </div>
                                          <div className="flex justify-between items-center">
                                            <span className="text-muted-foreground">2. Materiales (Factor {calc.factor}):</span>
                                            <span className="font-mono">{formatMXN(calc.goldCost)} × {calc.factor} = {formatMXN(calc.materialsCost)}</span>
                                          </div>
                                          <div className="flex justify-between items-center">
                                            <span className="text-muted-foreground">3. + Mano de Obra:</span>
                                            <span className="font-mono">{formatMXN(calc.materialsCost)} + {formatMXN(calc.laborCost)} = {formatMXN(calc.materialsCost + calc.laborCost)}</span>
                                          </div>
                                          <div className="flex justify-between items-center">
                                            <span className="text-muted-foreground">4. + Piedra:</span>
                                            <span className="font-mono">{formatMXN(calc.materialsCost + calc.laborCost)} + {formatMXN(calc.stoneCost)} = {formatMXN(calc.materialsCost + calc.laborCost + calc.stoneCost)}</span>
                                          </div>
                                          <div className="flex justify-between items-center border-t pt-2">
                                            <span className="text-muted-foreground">5. + Utilidad ({parameters?.profitMargin || 0}%):</span>
                                            <span className="font-mono font-semibold">{formatMXN(calc.subtotalWithProfit)}</span>
                                          </div>
                                          <div className="flex justify-between items-center">
                                            <span className="text-muted-foreground">6. + Comisión ({calc.salesCommission}):</span>
                                            <span className="font-mono">{formatMXN(calc.subtotalWithCommissions)}</span>
                                          </div>
                                          <div className="flex justify-between items-center">
                                            <span className="text-muted-foreground">7. + Envío:</span>
                                            <span className="font-mono">{formatMXN(calc.subtotalWithCommissions)} + {formatMXN(calc.shippingCost)}</span>
                                          </div>
                                          <div className="flex justify-between items-center">
                                            <span className="text-muted-foreground">8. + IVA ({parameters?.vat || 0}%):</span>
                                            <span className="font-mono font-semibold">{formatMXN(calc.subtotalWithVat)}</span>
                                          </div>
                                          <div className="flex justify-between items-center">
                                            <span className="text-muted-foreground">9. + Stripe ({parameters?.stripePercentage || 0}%):</span>
                                            <span className="font-mono font-semibold">{formatMXN(calc.subtotalWithStripePercentage)}</span>
                                          </div>
                                          <div className="flex justify-between items-center border-t pt-2 bg-amber-50 -mx-2 px-2 py-2 rounded">
                                            <span className="font-semibold">Precio Final:</span>
                                            <span className="font-bold text-lg text-[#D4AF37]">{formatMXN(calc.finalPrice)}</span>
                                          </div>
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
              className="bg-blue-600 hover:bg-blue-700"
            >
              Actualizar Precio
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
                  {calculatedSubcategories.length} producto(s)
                </span>
                ?
              </p>
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
                <p className="text-sm text-amber-800">
                  ⚠️ Esta acción actualizará todos los precios de los productos
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
              className="bg-green-600 hover:bg-green-700"
            >
              Actualizar Todos los Precios
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
                  <li>Calculará proporcionalmente los precios de todas las tallas</li>
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
