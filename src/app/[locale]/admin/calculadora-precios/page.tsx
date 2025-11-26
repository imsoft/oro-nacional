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
import { getAllProducts, updateProductPrice, updateMultipleProductPrices } from "@/lib/supabase/products";
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
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setIsLoading(true);
    const data = await getAllProducts();
    setProducts(data);

    // Initialize pricing data with default values
    const pricingMap = new Map<string, Partial<ProductPricingData>>();
    data.forEach((product) => {
      pricingMap.set(product.id, {
        goldGrams: 5, // Default value
        factor: 1.0,
        laborCost: 50,
        stoneCost: 0,
        salesCommission: 10,
        shippingCost: 150,
      });
    });
    setProductPricingData(pricingMap);
    setIsLoading(false);
  };

  // Function to calculate final price of a product
  const calculateProductPrice = (
    product: ProductListItem,
    pricingData: Partial<ProductPricingData>
  ): ProductPricingCalculation | null => {
    // Default values if not defined
    const goldGrams = pricingData.goldGrams || 0;
    const factor = pricingData.factor || 1;
    const laborCost = pricingData.laborCost || 0;
    const stoneCost = pricingData.stoneCost || 0;
    const salesCommission = pricingData.salesCommission || 0;
    const shippingCost = pricingData.shippingCost || 0;

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

  const handleParameterChange = (key: keyof PricingParameters, value: string) => {
    const numValue = parseFloat(value) || 0;
    setParameters((prev) => ({ ...prev, [key]: numValue }));
  };

  const handleProductDataChange = (
    productId: string,
    key: keyof ProductPricingData,
    value: string
  ) => {
    const numValue = parseFloat(value) || 0;
    setProductPricingData((prev) => {
      const newMap = new Map(prev);
      const currentData = newMap.get(productId) || {};
      newMap.set(productId, { ...currentData, [key]: numValue });
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
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted">
                <tr>
                  <th className="sticky left-0 z-10 bg-muted px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider border-r">
                    Producto
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Oro (grs)
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Factor
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Mano Obra
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Piedra
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Comisión
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Envío
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider bg-amber-50">
                    Costo Oro
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider bg-amber-50">
                    Materiales
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider bg-blue-50">
                    + Utilidad
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider bg-blue-50">
                    + Comisiones
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider bg-green-50">
                    + IVA
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider bg-green-50">
                    + Stripe
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider bg-[#D4AF37]/10 border-l">
                    Precio Final
                  </th>
                  <th className="sticky right-0 z-10 bg-muted px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider border-l">
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
                        <td className="sticky left-0 z-10 bg-card px-4 py-3 whitespace-nowrap text-sm font-medium text-foreground border-r">
                          <div className="max-w-[200px] truncate">
                            {calc.name}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
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
                            className="w-20 h-8 text-xs"
                          />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
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
                            className="w-20 h-8 text-xs"
                          />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
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
                            className="w-20 h-8 text-xs"
                          />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
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
                            className="w-20 h-8 text-xs"
                          />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
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
                            className="w-20 h-8 text-xs"
                          />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
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
                            className="w-20 h-8 text-xs"
                          />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm bg-amber-50/50">
                          {formatMXN(calc.goldCost)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm bg-amber-50/50">
                          {formatMXN(calc.materialsCost)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm bg-blue-50/50">
                          {formatMXN(calc.subtotalWithProfit)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm bg-blue-50/50">
                          {formatMXN(calc.subtotalWithCommissions)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm bg-green-50/50">
                          {formatMXN(calc.subtotalWithVat)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm bg-green-50/50">
                          {formatMXN(calc.subtotalWithStripePercentage)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm bg-[#D4AF37]/10 border-l">
                          <div className="space-y-1">
                            <div className="font-bold text-foreground">
                              {formatMXN(calc.finalPrice)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Actual: {formatMXN(currentPrice)}
                            </div>
                            {priceDifference !== 0 && (
                              <div
                                className={`text-xs font-semibold ${
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
                        <td className="sticky right-0 z-10 bg-card px-4 py-3 whitespace-nowrap text-sm border-l">
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
