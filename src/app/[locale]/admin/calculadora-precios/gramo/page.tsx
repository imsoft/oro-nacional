"use client";

import { useState, useEffect, useMemo } from "react";
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
import { getProductsExcludingCategory, updateProductPrice, updateMultipleProductPrices } from "@/lib/supabase/products";
import {
  getPricingParameters,
  updatePricingParameters,
  getAllProductPricing,
  upsertProductPricing,
  batchUpsertProductPricing
} from "@/lib/supabase/pricing";
import type { ProductListItem } from "@/types/product";
import type {
  PricingParameters,
  ProductPricingData,
  ProductPricingCalculation,
} from "@/types/pricing";

export default function PriceCalculatorPage() {
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmAllDialogOpen, setConfirmAllDialogOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [updatingProducts, setUpdatingProducts] = useState<Set<string>>(new Set());
  const [isUpdatingAll, setIsUpdatingAll] = useState(false);
  const [isSavingParameters, setIsSavingParameters] = useState(false);
  const [isSavingProductData, setIsSavingProductData] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [unlockDialogOpen, setUnlockDialogOpen] = useState(false);
  const [unlockCode, setUnlockCode] = useState("");

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

  // Product pricing data with calculation values - for now example values
  // In production, these should come from the database
  const [productPricingData, setProductPricingData] = useState<
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

      // Load products (excluding Broqueles category)
      const productsData = await getProductsExcludingCategory("Broqueles");
      setProducts(productsData);

      // Load product pricing data from database
      const allPricingData = await getAllProductPricing();

      // Create a map of product pricing data
      const pricingMap = new Map<string, Partial<ProductPricingData>>();
      const pricingDataMap = new Map(
        allPricingData.map((item) => [item.productId, item])
      );

      // Initialize pricing data for all products
      productsData.forEach((product: ProductListItem) => {
        const savedData = pricingDataMap.get(product.id);
        
        // Default values
        const defaults = {
          goldGrams: 5,
          factor: 0.442,
          laborCost: 15,
          stoneCost: 0,
          salesCommission: 30,
          shippingCost: 800,
        };
        
        if (savedData) {
          // Check if values are old defaults and replace with new defaults
          const isOldFactor = savedData.factor === 1.0 || savedData.factor === 1;
          const isOldLaborCost = savedData.laborCost === 50 || savedData.laborCost === 50.0;
          const isOldCommission = savedData.salesCommission === 10 || savedData.salesCommission === 10.0;
          const isOldShipping = savedData.shippingCost === 150 || savedData.shippingCost === 150.0;
          
          // Use saved data, but replace old defaults with new defaults
          const updatedData = {
            goldGrams: savedData.goldGrams ?? defaults.goldGrams,
            factor: isOldFactor ? defaults.factor : (savedData.factor ?? defaults.factor),
            laborCost: isOldLaborCost ? defaults.laborCost : (savedData.laborCost ?? defaults.laborCost),
            stoneCost: savedData.stoneCost ?? defaults.stoneCost,
            salesCommission: isOldCommission ? defaults.salesCommission : (savedData.salesCommission ?? defaults.salesCommission),
            shippingCost: isOldShipping ? defaults.shippingCost : (savedData.shippingCost ?? defaults.shippingCost),
          };
          
          pricingMap.set(product.id, updatedData);
          
          // Auto-update database if old values were detected
          if (isOldFactor || isOldLaborCost || isOldCommission || isOldShipping) {
            upsertProductPricing(product.id, {
              goldGrams: updatedData.goldGrams,
              factor: updatedData.factor,
              laborCost: updatedData.laborCost,
              stoneCost: updatedData.stoneCost,
              salesCommission: updatedData.salesCommission,
              shippingCost: updatedData.shippingCost,
            }).catch((error) => {
              console.error(`Error updating pricing for product ${product.id}:`, error);
            });
          }
        } else {
          // Use default values for new products
          pricingMap.set(product.id, defaults);
        }
      });
      setProductPricingData(pricingMap);
    } catch (error) {
      console.error("Error loading data:", error);
      alert("Error al cargar los datos. Por favor recarga la página.");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to calculate final price of a product
  const calculateProductPrice = (
    product: ProductListItem,
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
    const subtotalWithStripePercentage =
      subtotalWithVat * (1 + parameters.stripePercentage);
    const finalPrice =
      subtotalWithStripePercentage + parameters.stripeFixedFee;

    return {
      id: product.id,
      name: product.name,
      goldGrams,
      factor,
      laborCost,
      stoneCost,
      salesCommission,
      shippingCost,
      material: product.material,
      stock: product.stock,
      category_name: product.category_name,
      primary_image: product.primary_image,
      is_active: product.is_active,
      goldCost,
      materialsCost,
      subtotalBeforeProfit,
      subtotalWithProfit,
      commissionCost,
      subtotalWithCommissions,
      subtotalWithVat,
      subtotalWithStripePercentage,
      finalPrice,
    };
  };

  // Calculate prices for all products
  const calculatedProducts = useMemo(() => {
    return products
      .map((product) => {
        const pricingData = productPricingData.get(product.id) || {};
        return calculateProductPrice(product, pricingData);
      })
      .filter((calc) => calc !== null) as ProductPricingCalculation[];
  }, [products, productPricingData, parameters]);

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

  const handleProductDataChange = async (
    productId: string,
    key: keyof ProductPricingData,
    value: string
  ) => {
    const numValue = parseFloat(value) || 0;

    // Update local state
    setProductPricingData((prev) => {
      const newMap = new Map(prev);
      const currentData = newMap.get(productId) || {};
      const updatedData = { ...currentData, [key]: numValue };
      newMap.set(productId, updatedData);

      // Auto-save to database
      setIsSavingProductData(true);
      const pricingData = {
        goldGrams: updatedData.goldGrams ?? 5,
        factor: updatedData.factor ?? 0.442,
        laborCost: updatedData.laborCost ?? 15,
        stoneCost: updatedData.stoneCost ?? 0,
        salesCommission: updatedData.salesCommission ?? 30,
        shippingCost: updatedData.shippingCost ?? 800,
      };

      upsertProductPricing(productId, pricingData)
        .catch((error) => {
          console.error("Error saving product pricing data:", error);
        })
        .finally(() => {
          setIsSavingProductData(false);
        });

      return newMap;
    });
  };

  const handleUpdatePriceClick = (productId: string) => {
    setSelectedProductId(productId);
    setConfirmDialogOpen(true);
  };

  const handleUpdateAllClick = () => {
    setConfirmAllDialogOpen(true);
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

  const handleConfirmUpdate = async () => {
    if (!selectedProductId) return;

    const product = calculatedProducts.find((p) => p.id === selectedProductId);
    if (!product) return;

    setUpdatingProducts((prev) => new Set(prev).add(selectedProductId));
    setConfirmDialogOpen(false);

    try {
      await updateProductPrice(selectedProductId, product.finalPrice);

      // Update local product list
      setProducts((prev) =>
        prev.map((p) =>
          p.id === selectedProductId ? { ...p, price: product.finalPrice } : p
        )
      );

      // Show success (you could add a toast notification here)
      console.log(`Product ${product.name} price updated to ${product.finalPrice}`);
    } catch (error) {
      console.error("Error updating product price:", error);
      alert("Error al actualizar el precio. Por favor intenta de nuevo.");
    } finally {
      setUpdatingProducts((prev) => {
        const newSet = new Set(prev);
        newSet.delete(selectedProductId);
        return newSet;
      });
      setSelectedProductId(null);
    }
  };

  const handleConfirmUpdateAll = async () => {
    setConfirmAllDialogOpen(false);
    setIsUpdatingAll(true);

    try {
      const priceUpdates = calculatedProducts.map((product) => ({
        id: product.id,
        price: product.finalPrice,
      }));

      const results = await updateMultipleProductPrices(priceUpdates);

      // Update local product list
      setProducts((prev) =>
        prev.map((p) => {
          const calculated = calculatedProducts.find((c) => c.id === p.id);
          return calculated ? { ...p, price: calculated.finalPrice } : p;
        })
      );

      // Show results
      if (results.failed.length > 0) {
        console.error("Some products failed to update:", results.failed);
        alert(
          `Se actualizaron ${results.successful.length} productos correctamente. ${results.failed.length} productos fallaron.`
        );
      } else {
        alert(
          `¡Éxito! Se actualizaron ${results.successful.length} productos correctamente.`
        );
      }
    } catch (error) {
      console.error("Error updating all prices:", error);
      alert("Error al actualizar los precios. Por favor intenta de nuevo.");
    } finally {
      setIsUpdatingAll(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  const selectedProduct = selectedProductId
    ? calculatedProducts.find((p) => p.id === selectedProductId)
    : null;

  const currentSelectedProduct = selectedProductId
    ? products.find((p) => p.id === selectedProductId)
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
            onClick={handleUpdateAllClick}
            disabled={isUpdatingAll || calculatedProducts.length === 0}
            className="gap-2 bg-green-600 hover:bg-green-700 text-white"
          >
            {isUpdatingAll ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Actualizando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Actualizar Todos
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
            {calculatedProducts.length} producto(s) con cálculo de precio final
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
                {calculatedProducts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={15}
                      className="px-6 py-12 text-center text-muted-foreground"
                    >
                      No hay productos para calcular
                    </td>
                  </tr>
                ) : (
                  calculatedProducts.map((calc) => {
                    const currentProduct = products.find((p) => p.id === calc.id);
                    const currentPrice = currentProduct?.price || 0;
                    const priceDifference = calc.finalPrice - currentPrice;
                    const isUpdating = updatingProducts.has(calc.id);

                    return (
                      <tr key={calc.id} className="hover:bg-muted/50">
                        <td className="sticky left-0 z-10 bg-card px-2 py-2 whitespace-nowrap text-xs font-medium text-foreground border-r">
                          <div className="max-w-[150px] truncate">
                            {calc.name}
                          </div>
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap">
                          <Input
                            type="number"
                            step="0.01"
                            value={calc.goldGrams}
                            onChange={(e) =>
                              handleProductDataChange(
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
                              handleProductDataChange(
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
                              handleProductDataChange(
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
                              handleProductDataChange(
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
                              handleProductDataChange(
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
                              handleProductDataChange(
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
                              Actual: {formatMXN(currentPrice)}
                            </div>
                            {priceDifference !== 0 && (
                              <div
                                className={`text-[10px] font-semibold ${
                                  priceDifference > 0
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                {priceDifference > 0 ? "+" : ""}
                                {formatMXN(priceDifference)}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="sticky right-0 z-10 bg-card px-2 py-2 whitespace-nowrap border-l">
                          <Button
                            size="sm"
                            onClick={() => handleUpdatePriceClick(calc.id)}
                            disabled={isUpdating || isUpdatingAll}
                            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            {isUpdating ? (
                              <>
                                <Loader2 className="h-3 w-3 animate-spin" />
                                Guardando...
                              </>
                            ) : (
                              <>
                                <Save className="h-3 w-3" />
                                Aplicar
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
              {selectedProduct && currentSelectedProduct && (
                <>
                  <p>
                    ¿Estás seguro de que deseas actualizar el precio de{" "}
                    <span className="font-semibold text-foreground">
                      {selectedProduct.name}
                    </span>
                    ?
                  </p>
                  <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-800">Precio actual:</span>
                      <span className="font-semibold text-blue-900">
                        {formatMXN(currentSelectedProduct.price)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-800">Precio nuevo:</span>
                      <span className="font-semibold text-blue-900">
                        {formatMXN(selectedProduct.finalPrice)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t border-blue-200">
                      <span className="text-blue-800">Diferencia:</span>
                      <span
                        className={`font-semibold ${
                          selectedProduct.finalPrice - currentSelectedProduct.price > 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {selectedProduct.finalPrice - currentSelectedProduct.price > 0
                          ? "+"
                          : ""}
                        {formatMXN(
                          selectedProduct.finalPrice - currentSelectedProduct.price
                        )}
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
              onClick={handleConfirmUpdate}
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
                  {calculatedProducts.length} producto(s)
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
              onClick={handleConfirmUpdateAll}
              className="bg-green-600 hover:bg-green-700"
            >
              Actualizar Todos los Precios
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
