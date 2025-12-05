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
import { updateMultipleProductPrices } from "@/lib/supabase/products";
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
      setParameters(params);

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
    // NO incluir comisiones de Stripe en el precio base - se aplicarán al momento del pago
    // const subtotalWithStripePercentage =
    //   subtotalWithVat * (1 + parameters.stripePercentage);
    // const finalPrice =
    //   subtotalWithStripePercentage + parameters.stripeFixedFee;
    const finalPrice = subtotalWithVat; // Precio base sin comisiones de Stripe

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
    const numValue = parseFloat(value) || 0;
    const newParameters = { ...parameters, [key]: numValue };
    setParameters(newParameters);

    // Auto-save to database
    setIsSavingParameters(true);
    try {
      await updatePricingParameters(newParameters);
    } catch (error) {
      console.error("Error saving pricing parameters:", error);
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
                      value={parameters.goldQuotation}
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

      {/* Products table with calculations */}
      <Card>
        <CardHeader>
          <CardTitle>Productos y Cálculos de Precio</CardTitle>
          <CardDescription>
            {calculatedSubcategories.length} producto(s) con cálculo de precio final
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-border text-xs">
              <thead className="bg-muted">
                <tr>
                  <th className="sticky left-0 z-10 bg-muted px-2 py-2 text-left text-[10px] font-medium text-muted-foreground uppercase tracking-tight border-r">
                    Producto
                  </th>
                  <th className="px-2 py-2 text-left text-[10px] font-medium text-muted-foreground uppercase tracking-tight">
                    Oro (grs)
                  </th>
                  <th className="px-2 py-2 text-left text-[10px] font-medium text-muted-foreground uppercase tracking-tight">
                    Factor
                  </th>
                  <th className="px-2 py-2 text-left text-[10px] font-medium text-muted-foreground uppercase tracking-tight">
                    M. Obra
                  </th>
                  <th className="px-2 py-2 text-left text-[10px] font-medium text-muted-foreground uppercase tracking-tight">
                    Piedra
                  </th>
                  <th className="px-2 py-2 text-left text-[10px] font-medium text-muted-foreground uppercase tracking-tight">
                    Comis.
                  </th>
                  <th className="px-2 py-2 text-left text-[10px] font-medium text-muted-foreground uppercase tracking-tight">
                    Envío
                  </th>
                  <th className="px-2 py-2 text-left text-[10px] font-medium text-muted-foreground uppercase tracking-tight bg-amber-50">
                    Costo Oro
                  </th>
                  <th className="px-2 py-2 text-left text-[10px] font-medium text-muted-foreground uppercase tracking-tight bg-amber-50">
                    Materiales
                  </th>
                  <th className="px-2 py-2 text-left text-[10px] font-medium text-muted-foreground uppercase tracking-tight bg-blue-50">
                    + Util.
                  </th>
                  <th className="px-2 py-2 text-left text-[10px] font-medium text-muted-foreground uppercase tracking-tight bg-blue-50">
                    + Comis.
                  </th>
                  <th className="px-2 py-2 text-left text-[10px] font-medium text-muted-foreground uppercase tracking-tight bg-green-50">
                    + IVA
                  </th>
                  <th className="px-2 py-2 text-left text-[10px] font-medium text-muted-foreground uppercase tracking-tight bg-green-50">
                    + Stripe
                  </th>
                  <th className="px-2 py-2 text-left text-[10px] font-medium text-foreground uppercase tracking-tight bg-[#D4AF37]/10 border-l">
                    Precio Final
                  </th>
                  <th className="sticky right-0 z-10 bg-muted px-2 py-2 text-left text-[10px] font-medium text-muted-foreground uppercase tracking-tight border-l">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {calculatedSubcategories.length === 0 ? (
                  <tr>
                    <td
                      colSpan={15}
                      className="px-6 py-12 text-center text-muted-foreground"
                    >
                      No hay productos para calcular
                    </td>
                  </tr>
                ) : (
                  calculatedSubcategories.map((calc) => {
                    // Subcategories don't have prices, so no price comparison needed
                    const priceDifference = 0;
                    const isUpdating = false;

                    return (
                      <tr key={calc.id} className="hover:bg-muted/50">
                        <td className="sticky left-0 z-10 bg-card px-2 py-2 whitespace-nowrap text-xs font-medium text-foreground border-r">
                          <div className="max-w-[150px] truncate">
                            {(() => {
                              const subcategory = subcategories.find(s => s.id === calc.id);
                              return subcategory?.special_code ? (
                                <>
                                  <span className="font-medium">{subcategory.special_code}</span>
                                  <span className="text-muted-foreground"> - {calc.name}</span>
                                </>
                              ) : (
                                calc.name
                              );
                            })()}
                          </div>
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap">
                          <Input
                            type="number"
                            step="0.01"
                            value={calc.goldGrams}
                            onChange={(e) =>
                              handleSubcategoryDataChange(
                                calc.id,
                                "goldGrams",
                                e.target.value
                              )
                            }
                            className="w-16 h-7 text-[11px] px-1"
                          />
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap">
                          <Input
                            type="number"
                            step="0.01"
                            value={calc.factor}
                            onChange={(e) =>
                              handleSubcategoryDataChange(
                                calc.id,
                                "factor",
                                e.target.value
                              )
                            }
                            disabled={!isUnlocked}
                            className="w-16 h-7 text-[11px] px-1"
                          />
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap">
                          <Input
                            type="number"
                            step="0.01"
                            value={calc.laborCost}
                            onChange={(e) =>
                              handleSubcategoryDataChange(
                                calc.id,
                                "laborCost",
                                e.target.value
                              )
                            }
                            disabled={!isUnlocked}
                            className="w-16 h-7 text-[11px] px-1"
                          />
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap">
                          <Input
                            type="number"
                            step="0.01"
                            value={calc.stoneCost}
                            onChange={(e) =>
                              handleSubcategoryDataChange(
                                calc.id,
                                "stoneCost",
                                e.target.value
                              )
                            }
                            disabled={!isUnlocked}
                            className="w-16 h-7 text-[11px] px-1"
                          />
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap">
                          <Input
                            type="number"
                            step="0.01"
                            value={calc.salesCommission}
                            onChange={(e) =>
                              handleSubcategoryDataChange(
                                calc.id,
                                "salesCommission",
                                e.target.value
                              )
                            }
                            disabled={!isUnlocked}
                            className="w-16 h-7 text-[11px] px-1"
                          />
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap">
                          <Input
                            type="number"
                            step="0.01"
                            value={calc.shippingCost}
                            onChange={(e) =>
                              handleSubcategoryDataChange(
                                calc.id,
                                "shippingCost",
                                e.target.value
                              )
                            }
                            disabled={!isUnlocked}
                            className="w-16 h-7 text-[11px] px-1"
                          />
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap text-xs bg-amber-50/50">
                          {formatMXN(calc.goldCost)}
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap text-xs bg-amber-50/50">
                          {formatMXN(calc.materialsCost)}
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap text-xs bg-blue-50/50">
                          {formatMXN(calc.subtotalWithProfit)}
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap text-xs bg-blue-50/50">
                          {formatMXN(calc.subtotalWithCommissions)}
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap text-xs bg-green-50/50">
                          {formatMXN(calc.subtotalWithVat)}
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap text-xs bg-green-50/50">
                          {formatMXN(calc.subtotalWithStripePercentage)}
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap bg-[#D4AF37]/10 border-l">
                          <div className="space-y-0.5 min-w-[110px]">
                            <div className="font-bold text-foreground text-xs">
                              {formatMXN(calc.finalPrice)}
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                              Precio Calculado
                            </div>
                          </div>
                        </td>
                        <td className="sticky right-0 z-10 bg-card px-2 py-2 whitespace-nowrap border-l">
                          <Button
                            size="sm"
                            onClick={() => handleApplyPriceToProducts(calc.id, calc.finalPrice)}
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
                                Aplicar Precio
                              </>
                            )}
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
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
