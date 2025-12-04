"use client";

import { Link } from "@/i18n/routing";
import { CreditCard, Shield, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cart-store";
import { useCurrency } from "@/contexts/currency-context";

const OrderSummary = () => {
  const total = useCartStore((state) => state.getTotal());
  const itemCount = useCartStore((state) => state.getItemCount());
  const { formatPrice } = useCurrency();

  const subtotal = total;
  const finalTotal = subtotal;

  return (
    <div className="rounded-2xl bg-card p-6 lg:p-8 shadow-lg sticky top-24">
      <h2 className="text-xl font-semibold text-foreground mb-6">
        Resumen del Pedido
      </h2>

      {/* Desglose de precios */}
      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            Subtotal ({itemCount} {itemCount === 1 ? "producto" : "productos"})
          </span>
          <span className="font-medium">{formatPrice(subtotal)}</span>
        </div>

        <div className="pt-3 border-t border-border">
          <div className="flex justify-between">
            <span className="text-lg font-semibold">Total</span>
            <span className="text-2xl font-semibold text-[#D4AF37]">
              {formatPrice(finalTotal)}
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
          <Tag className="h-4 w-4 text-[#D4AF37]" />
          <span>30 días para cambios</span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
