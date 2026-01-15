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
  type SubcategoryBroquelPricingData,
  getBroquelPricingParameters,
  updateBroquelPricingParameters,
  type BroquelPricingParameters,
} from "@/lib/supabase/pricing";
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

// Datos específicos por subcategoría
interface ProductBroquelData {
  id: string;
  name: string;
  pz: number; // Piezas
  goldGrams: number; // Oro (GRS)
  carats: number; // Kilataje
  factor: number; // Factor
  merma: number; // Merma %
  laborCost: number; // Mano de obra
  stoneCost: number; // Piedra
  salesCommission: number; // Comisión de venta
  shipping: number; // Envío
  material: string;
  stock: number;
  category_name?: string;
  primary_image?: string;
  is_active: boolean;
}

// Cálculos completos por subcategoría
interface ProductBroquelCalculation extends ProductBroquelData {
  subtotalBeforeProfit: number; // Subtotal antes de utilidad
  subtotalWithProfit: number; // + Utilidad
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
      const defaults = {
        pz: 1.0,
        goldGrams: 0.185,
        carats: 10,
        factor: 0.000,
        merma: 8.00, // 8%
        laborCost: 20.00,
        stoneCost: 0.00,
        salesCommission: 30.00,
        shipping: 800.00,
      };

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

  // Función para calcular el precio final de un subcategoría broquel
  // Fórmula del Excel: =((((($I$2*F7/24*E7)*(1+H7)+I7+J7))*D7)*(1+K7)+(D7*L7)+M7)*(1+N7)*(1+O7)+P7
  // I2=COTIZACIÓN, F7=KILATAJE, E7=ORO(GRS), H7=MERMA, I7=MANO DE OBRA, J7=PIEDRA, D7=PZ, K7=UTILIDAD, L7=COMISIÓN DE VENTA, M7=ENVÍO, N7=IVA, O7=STRIPE%, P7=STRIPE FIJO
  const calculateSubcategoryPrice = (
    subcategoryItem: InternalSubcategory,
    broquelData: Partial<ProductBroquelData>
  ): ProductBroquelCalculation | null => {
    const pz = broquelData.pz || 1;
    const goldGrams = broquelData.goldGrams || 0;
    const carats = broquelData.carats ?? 10;
    const merma = ((broquelData.merma ?? 8) / 100); // Convertir % a decimal, default 8%
    const laborCost = broquelData.laborCost || 0;
    const stoneCost = broquelData.stoneCost || 0;
    const shipping = broquelData.shipping ?? 800;
    const salesCommission = broquelData.salesCommission || 30.00;

    // Fórmula Excel paso a paso:
    // 1. (COTIZACIÓN * KILATAJE / 24 * ORO(GRS))
    const goldCost = parameters.quotation * (carats / 24) * goldGrams;

    // 2. goldCost * (1 + MERMA%)
    const goldCostWithMerma = goldCost * (1 + merma);

    // 3. + MANO DE OBRA + PIEDRA
    const subtotalBeforeProfit = goldCostWithMerma + laborCost + stoneCost;

    // 4. * PZ
    const subtotalByPieces = subtotalBeforeProfit * pz;

    // 5. * (1 + UTILIDAD)
    const subtotalWithProfit = subtotalByPieces * (1 + parameters.profitMargin);

    // 6. + (PZ * COMISIÓN DE VENTA)
    const commissionCost = pz * salesCommission;
    const subtotalWithCommission = subtotalWithProfit + commissionCost;

    // 7. + ENVÍO
    const subtotalWithShipping = subtotalWithCommission + shipping;

    // 8. * (1 + IVA)
    const subtotalWithVat = subtotalWithShipping * (1 + parameters.vat);

    // 9. INCLUIR comisiones de Stripe en el precio final: 3.6% + $3 MXN
    const stripePercentage = 0.036; // 3.6%
    const stripeFixedFee = 3; // $3 MXN
    const finalPrice = (subtotalWithVat * (1 + stripePercentage)) + stripeFixedFee;

    return {
      id: subcategoryItem.id,
      name: subcategoryItem.name,
      pz,
      goldGrams,
      carats,
      factor: 0, // No se usa en la fórmula nueva
      merma: broquelData.merma ?? 8,
      laborCost,
      stoneCost,
      shipping,
      material: "",
      stock: 0,
      category_name: "",
      primary_image: undefined,
      is_active: subcategoryItem.is_active,
      salesCommission,
      subtotalBeforeProfit: subtotalByPieces,
      subtotalWithProfit,
      subtotalWithVat,
      subtotalWithStripe: subtotalWithVat * (1 + parameters.stripePercentage), // Solo para mostrar en la tabla
      finalPrice,
    };
  };

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

    // Auto-save to database asynchronously (don't block UI)
    try {
      await updateBroquelPricingParameters(newParameters);
      // Don't update state after save - keep local state to prevent re-render and focus loss
    } catch (error) {
      console.error("Error saving broquel pricing parameters:", error);
      // Revert on error
      const params = await getBroquelPricingParameters();
      setParameters(params);
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
            pz: updatedData.pz ?? 1.0,
            goldGrams: updatedData.goldGrams ?? 0.185,
            carats: updatedData.carats ?? 10,
            factor: updatedData.factor ?? 0.000,
            merma: updatedData.merma ?? 8.00,
            laborCost: updatedData.laborCost ?? 20.00,
            stoneCost: updatedData.stoneCost ?? 0.00,
            salesCommission: updatedData.salesCommission ?? 30.00,
            shipping: updatedData.shipping ?? 800.00,
          });
          saveTimeoutsRef.current.delete(subcategoryId);
        } catch (error) {
          console.error("Error saving subcategory broquel pricing:", error);
          saveTimeoutsRef.current.delete(subcategoryId);
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

    // Para Broquel: baseGrams = goldGrams × pz (gramos totales de todas las piezas)
    const baseGrams = calc.goldGrams * calc.pz;
    if (!baseGrams || baseGrams <= 0) {
      alert("Error: Los gramos base deben ser mayores a 0.");
      return;
    }

    if (!confirm(`¿Estás seguro de aplicar el precio ${formatMXN(finalPrice)} (base: ${calc.goldGrams} gr/pz × ${calc.pz} pz = ${baseGrams} gr) a todos los productos con esta subcategoría?`)) {
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
        // Para Broquel: baseGrams = goldGrams × pz (gramos totales de todas las piezas)
        const baseGrams = calc.goldGrams * calc.pz;
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
                </div>
                <div className="grid grid-cols-2 gap-4">
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
              (((((Cotización × Kilataje / 24 × Oro) × (1 + Merma) + Mano de obra + Piedra)) × PZ) × (1 + Utilidad) + (PZ × Comisión de venta) + Envío) × (1 + IVA) × (1 + Stripe %) + Stripe fijo
            </p>

            <div className="mt-4 space-y-2 text-xs text-gray-700 border-t pt-3">
              <p className="font-semibold text-purple-900 mb-2">Desglose de componentes:</p>
              <div className="space-y-1.5 ml-2">
                <p><span className="font-semibold text-purple-800">Costo Oro:</span> Cotización × (Kilataje / 24) × Oro(grs)</p>
                <p><span className="font-semibold text-purple-800">Costo Oro con Merma:</span> Costo Oro × (1 + Merma%)</p>
                <p><span className="font-semibold text-purple-800">Subtotal Base:</span> (Costo Oro con Merma + Mano de Obra + Piedra) × PZ</p>
                <p><span className="font-semibold text-purple-800">Costo Comisión:</span> PZ × Comisión de Venta</p>
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
              <p className="text-xs font-semibold text-purple-900 mb-2">Variables por Subcategoría:</p>
              <ul className="text-xs text-purple-800 space-y-1">
                <li>• PZ (Piezas)</li>
                <li>• Oro (grs)</li>
                <li>• Kilataje</li>
                <li>• Merma %</li>
                <li>• Mano de Obra</li>
                <li>• Piedra</li>
                <li>• Comisión de Venta</li>
                <li>• Envío</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
              <p className="text-xs font-semibold text-green-900 mb-2">Parámetros Globales:</p>
              <ul className="text-xs text-green-800 space-y-1">
                <li>• Cotización</li>
                <li>• Utilidad (%)</li>
                <li>• IVA (%)</li>
                <li>• Stripe (%) - Solo para referencia</li>
                <li>• Stripe Fijo - Solo para referencia</li>
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
                            <span>PZ: {calc.pz}</span>
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
                        <div className="bg-purple-50/50 rounded-lg p-4 border border-purple-200">
                          <h4 className="font-semibold text-sm mb-3 text-purple-900">Variables de Cálculo</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="space-y-1">
                              <Label htmlFor={`pz-${calc.id}`} className="text-xs">PZ (Piezas)</Label>
                          <Input
                                id={`pz-${calc.id}`}
                            type="number"
                            step="0.01"
                            value={calc.pz}
                                onChange={(e) => handleSubcategoryDataChange(calc.id, "pz", e.target.value)}
                                className="h-8"
                              />
                            </div>
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
                            <div className="space-y-1">
                              <Label htmlFor={`salesCommission-${calc.id}`} className="text-xs">Comisión Venta</Label>
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
                              <Label htmlFor={`shipping-${calc.id}`} className="text-xs">Envío</Label>
                          <Input
                                id={`shipping-${calc.id}`}
                            type="number"
                            step="0.01"
                            value={calc.shipping}
                                onChange={(e) => handleSubcategoryDataChange(calc.id, "shipping", e.target.value)}
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
                                        <h4 className="font-semibold text-sm border-b pb-2">📊 Cómo se calculó el precio paso a paso</h4>
                                        <div className="space-y-3 text-xs">
                                          {(() => {
                                            // Calcular valores intermedios para el desglose
                                            const goldCostPerPiece = (parameters?.quotation || 0) * (calc.carats / 24) * calc.goldGrams;
                                            const mermaDecimal = calc.merma / 100;
                                            const goldCostWithMermaPerPiece = goldCostPerPiece * (1 + mermaDecimal);
                                            const subtotalBeforeProfitPerPiece = goldCostWithMermaPerPiece + calc.laborCost + calc.stoneCost;
                                            const subtotalByPieces = subtotalBeforeProfitPerPiece * calc.pz;
                                            const commissionCost = calc.pz * calc.salesCommission;
                                            const subtotalWithCommission = calc.subtotalWithProfit + commissionCost;
                                            const subtotalWithShipping = subtotalWithCommission + calc.shipping;
                                            const stripePercentage = 0.036;
                                            const stripeFixedFee = 3;

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
                                                  <p className="font-semibold text-purple-900 mb-1">Paso 4: Multiplicamos por el número de piezas</p>
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
                                                  <p className="font-semibold text-yellow-900 mb-1">Paso 5: Agregamos la ganancia ({(parameters?.profitMargin || 0) * 100}%)</p>
                                                  <p className="text-gray-700">Tomamos el subtotal anterior y le agregamos {(parameters?.profitMargin || 0) * 100}% de ganancia</p>
                                                  <p className="font-mono font-semibold text-yellow-900 mt-1">
                                                    {formatMXN(subtotalByPieces)} × {(1 + (parameters?.profitMargin || 0)).toFixed(2)} = {formatMXN(calc.subtotalWithProfit)}
                                                  </p>
                                                  <p className="text-xs text-yellow-700 mt-2 italic border-t border-yellow-200 pt-1">
                                                    📝 Fórmula: (Subtotal por piezas × (1 + Utilidad%))
                                                  </p>
                                                </div>

                                                <div className="bg-orange-50 p-2 rounded border border-orange-200">
                                                  <p className="font-semibold text-orange-900 mb-1">Paso 6: Agregamos la comisión de venta</p>
                                                  <p className="text-gray-700">Por cada pieza cobramos {formatMXN(calc.salesCommission)} de comisión</p>
                                                  <p className="text-gray-700">Este producto tiene {calc.pz} pieza{calc.pz !== 1 ? 's' : ''}</p>
                                                  <p className="font-mono font-semibold text-orange-900 mt-1">
                                                    {calc.pz} × {formatMXN(calc.salesCommission)} = {formatMXN(commissionCost)}
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

                                                <div className="bg-red-50 p-2 rounded border border-red-200">
                                                  <p className="font-semibold text-red-900 mb-1">Paso 8: Agregamos el costo de envío</p>
                                                  <p className="text-gray-700">Subtotal con comisión: {formatMXN(subtotalWithCommission)}</p>
                                                  <p className="text-gray-700">Costo de envío: {formatMXN(calc.shipping)}</p>
                                                  <p className="font-mono font-semibold text-red-900 mt-1">
                                                    {formatMXN(subtotalWithCommission)} + {formatMXN(calc.shipping)} = {formatMXN(subtotalWithShipping)}
                                                  </p>
                                                  <p className="text-xs text-red-700 mt-2 italic border-t border-red-200 pt-1">
                                                    📝 Fórmula: (Subtotal con comisión + Envío)
                                                  </p>
                                                </div>

                                                <div className="bg-indigo-50 p-2 rounded border border-indigo-200">
                                                  <p className="font-semibold text-indigo-900 mb-1">Paso 9: Agregamos el IVA ({(parameters?.vat || 0) * 100}%)</p>
                                                  <p className="text-gray-700">El gobierno cobra {(parameters?.vat || 0) * 100}% de impuesto</p>
                                                  <p className="text-gray-700">Multiplicamos el subtotal anterior por {(1 + (parameters?.vat || 0)).toFixed(2)}</p>
                                                  <p className="font-mono font-semibold text-indigo-900 mt-1">
                                                    {formatMXN(subtotalWithShipping)} × {(1 + (parameters?.vat || 0)).toFixed(2)} = {formatMXN(calc.subtotalWithVat)}
                                                  </p>
                                                  <p className="text-xs text-indigo-700 mt-2 italic border-t border-indigo-200 pt-1">
                                                    📝 Fórmula: (Subtotal con envío × (1 + IVA%))
                                                  </p>
                                                </div>

                                                <div className="bg-teal-50 p-2 rounded border border-teal-200">
                                                  <p className="font-semibold text-teal-900 mb-1">Paso 10: Agregamos la comisión de Stripe</p>
                                                  <p className="text-gray-700">Stripe cobra {(parameters?.stripePercentage || 0) * 100}% más {formatMXN(parameters?.stripeFixedFee || 0)} fijos</p>
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
