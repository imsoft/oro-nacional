"use client";

import Image from "next/image";
import { Link } from "@/i18n/routing";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore, CartItem as CartItemType } from "@/stores/cart-store";
import { useCurrency } from "@/contexts/currency-context";

interface CartItemProps {
  item: CartItemType;
}

const CartItem = ({ item }: CartItemProps) => {
  const { updateQuantity, removeItem } = useCartStore();
  const { formatPrice, convertPrice } = useCurrency();
  // item.price está en MXN; convertir a la moneda del idioma actual
  const unitPrice = convertPrice(item.price, item.priceUSD);

  return (
    <div className="flex gap-4 py-6 border-b border-border last:border-0">
      {/* Imagen */}
      <Link href={`/product/${item.slug}`} className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover transition-transform hover:scale-110"
        />
      </Link>

      {/* Información */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
          <div className="min-w-0 flex-1">
            <Link
              href={`/product/${item.slug}`}
              className="font-semibold text-foreground hover:text-[#D4AF37] transition-colors"
            >
              {item.name}
            </Link>
            <p className="mt-1 text-sm text-muted-foreground">{item.material}</p>
            {item.size && (
              <p className="mt-1 text-xs text-muted-foreground">
                Talla: {item.size}
              </p>
            )}
          </div>

          {/* Precio */}
          <div className="sm:text-right">
            <p className="font-semibold text-foreground tabular-nums">
              {formatPrice(unitPrice * item.quantity)}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatPrice(unitPrice)} c/u
            </p>
          </div>
        </div>

        {/* Controles de cantidad y eliminar */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10"
              aria-label="Quitar una pieza"
              onClick={() => updateQuantity(item.id, item.quantity - 1, item.size)}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-10 text-center font-medium tabular-nums" aria-live="polite">{item.quantity}</span>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10"
              aria-label="Agregar una pieza"
              onClick={() => updateQuantity(item.id, item.quantity + 1, item.size)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => removeItem(item.id, item.size)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
