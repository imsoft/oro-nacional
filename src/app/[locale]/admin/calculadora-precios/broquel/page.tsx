"use client";

import { useState, useEffect, useMemo } from "react";
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
import { getAllProducts, updateProductPrice, updateMultipleProductPrices } from "@/lib/supabase/products";
import type { ProductListItem } from "@/types/product";

interface BroquelParameters {
  baseCost: number; // Costo base por pieza
  profitMargin: number; // Margen de utilidad
  vat: number; // IVA
  stripePercentage: number; // Comisión Stripe %
  stripeFixedFee: number; // Comisión fija Stripe
}

interface ProductBroquelData {
  id: string;
  name: string;
  baseCost: number;
  material: string;
  stock: number;
  category_name?: string;
  primary_image?: string;
  is_active: boolean;
}

interface ProductBroquelCalculation extends ProductBroquelData {
  costWithProfit: number;
  costWithVat: number;
  costWithStripePercentage: number;
  finalPrice: number;
}

export default function BroquelCalculatorPage() {
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

  // Broquel pricing parameters
  const [parameters, setParameters] = useState<BroquelParameters>({
    baseCost: 100, // $100 MXN base cost per piece
    profitMargin: 0.3, // 30% profit
    vat: 0.16, // 16% VAT
    stripePercentage: 0.036, // 3.6% Stripe commission
    stripeFixedFee: 3, // $3 MXN Stripe fixed fee
  });

  // Product base costs - in production these should come from database
  const [productBaseCosts, setProductBaseCosts] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setIsLoading(true);
    const data = await getAllProducts();
    setProducts(data);

    // Initialize base costs with default values
    const costsMap = new Map<string, number>();
    data.forEach((product) => {
      costsMap.set(product.id, 100); // Default $100 MXN per piece
    });
    setProductBaseCosts(costsMap);
    setIsLoading(false);
  };

  // Function to calculate final price of a broquel product
  const calculateProductPrice = (
    product: ProductListItem,
    baseCost: number
  ): ProductBroquelCalculation => {
    // Formula for broquel: ((baseCost * (1 + profitMargin)) * (1 + vat)) * (1 + stripePercentage) + stripeFixedFee
    const costWithProfit = baseCost * (1 + parameters.profitMargin);
    const costWithVat = costWithProfit * (1 + parameters.vat);
    const costWithStripePercentage = costWithVat * (1 + parameters.stripePercentage);
    const finalPrice = costWithStripePercentage + parameters.stripeFixedFee;

    return {
      id: product.id,
      name: product.name,
      baseCost,
      material: product.material,
      stock: product.stock,
      category_name: product.category_name,
      primary_image: product.primary_image,
      is_active: product.is_active,
      costWithProfit,
      costWithVat,
      costWithStripePercentage,
      finalPrice,
    };
  };

  // Calculate prices for all products
  const calculatedProducts = useMemo(() => {
    return products
      .map((product) => {
        const baseCost = productBaseCosts.get(product.id) || 100;
        return calculateProductPrice(product, baseCost);
      });
  }, [products, productBaseCosts, parameters]);

  const handleParameterChange = (key: keyof BroquelParameters, value: string) => {
    const numValue = parseFloat(value) || 0;
    setParameters((prev) => ({ ...prev, [key]: numValue }));
  };

  const handleBaseCostChange = (productId: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setProductBaseCosts((prev) => {
      const newMap = new Map(prev);
      newMap.set(productId, numValue);
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
            Calcula el precio final de productos tipo broquel con precio fijo por pieza
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
                  Ajusta los parámetros globales para el cálculo de precios por broquel
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="baseCost">
                    Costo Base por Defecto (MXN/pieza)
                  </Label>
                  <Input
                    id="baseCost"
                    type="number"
                    step="0.01"
                    value={parameters.baseCost}
                    onChange={(e) =>
                      handleParameterChange("baseCost", e.target.value)
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
                    />
                  </div>
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
              <p className="text-sm text-muted-foreground">Costo Base</p>
              <p className="text-lg font-semibold">
                {formatMXN(parameters.baseCost)}
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
                    Costo Base
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider bg-blue-50">
                    + Utilidad
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider bg-green-50">
                    + IVA
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider bg-green-50">
                    + Stripe %
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
                      colSpan={7}
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
                            value={calc.baseCost}
                            onChange={(e) =>
                              handleBaseCostChange(calc.id, e.target.value)
                            }
                            className="w-24 h-8 text-xs"
                          />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm bg-blue-50/50">
                          {formatMXN(calc.costWithProfit)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm bg-green-50/50">
                          {formatMXN(calc.costWithVat)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm bg-green-50/50">
                          {formatMXN(calc.costWithStripePercentage)}
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
