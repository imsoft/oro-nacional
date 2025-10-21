"use client";

import { useState } from "react";
import Link from "next/link";
import { CreditCard, Truck, Shield, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCartStore } from "@/stores/cart-store";

const OrderSummary = () => {
  const total = useCartStore((state) => state.getTotal());
  const itemCount = useCartStore((state) => state.getItemCount());
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);

  const shippingCosts = {
    standard: 0, // Gratis
    express: 200,
  };

  const shippingCost = shippingCosts[shippingMethod as keyof typeof shippingCosts];
  const subtotal = total;
  const finalTotal = subtotal + shippingCost - discount;

  const applyCoupon = () => {
    // Lógica simple de cupón de ejemplo
    if (couponCode.toUpperCase() === "BIENVENIDO10") {
      setDiscount(subtotal * 0.1); // 10% de descuento
      alert("¡Cupón aplicado! 10% de descuento");
    } else if (couponCode) {
      alert("Cupón no válido");
    }
  };

  return (
    <div className="rounded-2xl bg-card p-6 lg:p-8 shadow-lg sticky top-24">
      <h2 className="text-xl font-semibold text-foreground mb-6">
        Resumen del Pedido
      </h2>

      {/* Opciones de envío */}
      <div className="mb-6">
        <Label className="text-sm font-semibold mb-3 block">
          Método de Envío
        </Label>
        <RadioGroup value={shippingMethod} onValueChange={setShippingMethod}>
          <div className="space-y-3">
            <div className="flex items-center space-x-2 rounded-lg border-2 border-muted p-4 has-[:checked]:border-[#D4AF37] has-[:checked]:bg-[#D4AF37]/5 transition-all">
              <RadioGroupItem value="standard" id="standard" />
              <Label
                htmlFor="standard"
                className="flex-1 cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Truck className="h-5 w-5 text-[#D4AF37]" />
                  <div>
                    <p className="font-medium">Envío Estándar</p>
                    <p className="text-xs text-muted-foreground">3-5 días hábiles</p>
                  </div>
                </div>
                <span className="font-semibold text-green-600">GRATIS</span>
              </Label>
            </div>

            <div className="flex items-center space-x-2 rounded-lg border-2 border-muted p-4 has-[:checked]:border-[#D4AF37] has-[:checked]:bg-[#D4AF37]/5 transition-all">
              <RadioGroupItem value="express" id="express" />
              <Label
                htmlFor="express"
                className="flex-1 cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Truck className="h-5 w-5 text-[#D4AF37]" />
                  <div>
                    <p className="font-medium">Envío Express</p>
                    <p className="text-xs text-muted-foreground">1-2 días hábiles</p>
                  </div>
                </div>
                <span className="font-semibold">$200 MXN</span>
              </Label>
            </div>
          </div>
        </RadioGroup>
      </div>

      {/* Cupón de descuento */}
      <div className="mb-6 pb-6 border-b border-border">
        <Label htmlFor="coupon" className="text-sm font-semibold mb-2 block">
          Código de Descuento
        </Label>
        <div className="flex gap-2">
          <Input
            id="coupon"
            type="text"
            placeholder="Ej: BIENVENIDO10"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
          />
          <Button
            variant="outline"
            onClick={applyCoupon}
            className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-white"
          >
            Aplicar
          </Button>
        </div>
      </div>

      {/* Desglose de precios */}
      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            Subtotal ({itemCount} {itemCount === 1 ? "producto" : "productos"})
          </span>
          <span className="font-medium">${subtotal.toLocaleString("es-MX")} MXN</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Envío</span>
          <span className="font-medium">
            {shippingCost === 0 ? (
              <span className="text-green-600">GRATIS</span>
            ) : (
              `$${shippingCost.toLocaleString("es-MX")} MXN`
            )}
          </span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Descuento</span>
            <span className="font-medium text-green-600">
              -${discount.toLocaleString("es-MX")} MXN
            </span>
          </div>
        )}

        <div className="pt-3 border-t border-border">
          <div className="flex justify-between">
            <span className="text-lg font-semibold">Total</span>
            <span className="text-2xl font-semibold text-[#D4AF37]">
              ${finalTotal.toLocaleString("es-MX")} MXN
            </span>
          </div>
        </div>
      </div>

      {/* Botón de checkout */}
      <Button
        asChild
        size="lg"
        className="w-full bg-[#D4AF37] hover:bg-[#B8941E] text-white mb-4"
      >
        <Link href="/checkout">
          <CreditCard className="mr-2 h-5 w-5" />
          Proceder al Pago
        </Link>
      </Button>

      {/* Beneficios */}
      <div className="space-y-3 pt-4 border-t border-border">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Shield className="h-4 w-4 text-[#D4AF37]" />
          <span>Compra 100% segura</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Truck className="h-4 w-4 text-[#D4AF37]" />
          <span>Envío asegurado incluido</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Tag className="h-4 w-4 text-[#D4AF37]" />
          <span>30 días para cambios</span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
