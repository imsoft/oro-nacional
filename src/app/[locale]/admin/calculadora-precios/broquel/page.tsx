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
import { updateMultipleProductPrices } from "@/lib/supabase/products";

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

    // 9. * (1 + STRIPE%)
    const subtotalWithStripe = subtotalWithVat * (1 + parameters.stripePercentage);

    // 10. + STRIPE FIJO
    const finalPrice = subtotalWithStripe + parameters.stripeFixedFee;

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
      subtotalWithStripe,
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
    const numValue = parseFloat(value) || 0;
    const newParameters = { ...parameters, [key]: numValue };
    setParameters(newParameters);

    // Auto-save to database
    try {
      await updateBroquelPricingParameters(newParameters);
    } catch (error) {
      console.error("Error saving broquel pricing parameters:", error);
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

  // Removed update functions - subcategories don't have prices to update

  const [isApplyingPrices, setIsApplyingPrices] = useState(false);
  const [applyingToSubcategory, setApplyingToSubcategory] = useState<string | null>(null);

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
                    value={parameters.quotation}
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
            disabled={true}
            className="gap-2 bg-gray-400 text-white cursor-not-allowed"
          >
            Solo Cálculo
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

      {/* Products table with calculations */}
      <Card>
        <CardHeader>
          <CardTitle>Productos y Cálculos de Precio</CardTitle>
          <CardDescription>
            {calculatedSubcategories.length} subcategoría(s) con cálculo de precio final
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-border text-xs">
              <thead className="bg-muted">
                <tr>
                  <th className="sticky left-0 z-10 bg-muted px-2 py-2 text-left text-[10px] font-medium text-muted-foreground uppercase tracking-tight border-r">
                    Nombre
                  </th>
                  <th className="px-2 py-2 text-left text-[10px] font-medium text-muted-foreground uppercase tracking-tight">
                    PZ
                  </th>
                  <th className="px-2 py-2 text-left text-[10px] font-medium text-muted-foreground uppercase tracking-tight">
                    Oro (GRS)
                  </th>
                  <th className="px-2 py-2 text-left text-[10px] font-medium text-muted-foreground uppercase tracking-tight">
                    Kilat.
                  </th>
                  <th className="px-2 py-2 text-left text-[10px] font-medium text-muted-foreground uppercase tracking-tight">
                    Factor
                  </th>
                  <th className="px-2 py-2 text-left text-[10px] font-medium text-muted-foreground uppercase tracking-tight">
                    Merma %
                  </th>
                  <th className="px-2 py-2 text-left text-[10px] font-medium text-muted-foreground uppercase tracking-tight">
                    M. Obra
                  </th>
                  <th className="px-2 py-2 text-left text-[10px] font-medium text-muted-foreground uppercase tracking-tight">
                    Piedra
                  </th>
                  <th className="px-2 py-2 text-left text-[10px] font-medium text-muted-foreground uppercase tracking-tight">
                    Com. Vta
                  </th>
                  <th className="px-2 py-2 text-left text-[10px] font-medium text-muted-foreground uppercase tracking-tight">
                    Envío
                  </th>
                  <th className="px-2 py-2 text-left text-[10px] font-medium text-muted-foreground uppercase tracking-tight bg-blue-50">
                    + Util.
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
                      No hay subcategorías para calcular
                    </td>
                  </tr>
                ) : (
                  calculatedSubcategories.map((calc) => {
                    // Subcategories don't have prices, so no price comparison needed
                    const priceDifference = 0;
                    const isUpdating = updatingSubcategories.has(calc.id);

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
                            value={calc.pz}
                            onChange={(e) =>
                              handleSubcategoryDataChange(calc.id, "pz", e.target.value)
                            }
                            className="w-14 h-7 text-[11px] px-1"
                          />
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap">
                          <Input
                            type="number"
                            step="0.001"
                            value={calc.goldGrams}
                            onChange={(e) =>
                              handleSubcategoryDataChange(calc.id, "goldGrams", e.target.value)
                            }
                            className="w-16 h-7 text-[11px] px-1"
                          />
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap">
                          <Input
                            type="number"
                            step="1"
                            value={calc.carats}
                            onChange={(e) =>
                              handleSubcategoryDataChange(calc.id, "carats", e.target.value)
                            }
                            className="w-14 h-7 text-[11px] px-1"
                            disabled={!isUnlocked}
                          />
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap">
                          <Input
                            type="number"
                            step="0.001"
                            value={calc.factor}
                            onChange={(e) =>
                              handleSubcategoryDataChange(calc.id, "factor", e.target.value)
                            }
                            className="w-16 h-7 text-[11px] px-1"
                            disabled={!isUnlocked}
                          />
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap">
                          <Input
                            type="number"
                            step="0.01"
                            value={calc.merma}
                            onChange={(e) =>
                              handleSubcategoryDataChange(calc.id, "merma", e.target.value)
                            }
                            className="w-16 h-7 text-[11px] px-1"
                            disabled={!isUnlocked}
                          />
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap">
                          <Input
                            type="number"
                            step="0.01"
                            value={calc.laborCost}
                            onChange={(e) =>
                              handleSubcategoryDataChange(calc.id, "laborCost", e.target.value)
                            }
                            className="w-16 h-7 text-[11px] px-1"
                            disabled={!isUnlocked}
                          />
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap">
                          <Input
                            type="number"
                            step="0.01"
                            value={calc.stoneCost}
                            onChange={(e) =>
                              handleSubcategoryDataChange(calc.id, "stoneCost", e.target.value)
                            }
                            className="w-16 h-7 text-[11px] px-1"
                            disabled={!isUnlocked}
                          />
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap">
                          <Input
                            type="number"
                            step="0.01"
                            value={calc.salesCommission}
                            onChange={(e) =>
                              handleSubcategoryDataChange(calc.id, "salesCommission", e.target.value)
                            }
                            className="w-16 h-7 text-[11px] px-1"
                            disabled={!isUnlocked}
                          />
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap">
                          <Input
                            type="number"
                            step="0.01"
                            value={calc.shipping}
                            onChange={(e) =>
                              handleSubcategoryDataChange(calc.id, "shipping", e.target.value)
                            }
                            className="w-20 h-7 text-[11px] px-1"
                            disabled={!isUnlocked}
                          />
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap text-xs bg-blue-50/50">
                          {formatMXN(calc.subtotalWithProfit)}
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap text-xs bg-green-50/50">
                          {formatMXN(calc.subtotalWithVat)}
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap text-xs bg-green-50/50">
                          {formatMXN(calc.subtotalWithStripe)}
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap bg-[#D4AF37]/10 border-l">
                          <div className="space-y-0.5 min-w-[110px]">
                            <div className="font-bold text-foreground text-xs">
                              {formatMXN(calc.finalPrice)}
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                              Precio Calculado: {formatMXN(calc.finalPrice)}
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
    </div>
  );
}
