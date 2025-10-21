"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore, CartItem as CartItemType } from "@/stores/cart-store";

interface CartItemProps {
  item: CartItemType;
}

const CartItem = ({ item }: CartItemProps) => {
  const { updateQuantity, removeItem } = useCartStore();

  return (
    <div className="flex gap-4 py-6 border-b border-border last:border-0">
      {/* Imagen */}
      <Link href={`/product/${item.id}`} className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover transition-transform hover:scale-110"
        />
      </Link>

      {/* Información */}
      <div className="flex flex-1 flex-col">
        <div className="flex justify-between">
          <div className="flex-1">
            <Link
              href={`/product/${item.id}`}
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
            {item.engraving && (
              <p className="mt-1 text-xs text-muted-foreground">
                Grabado: &quot;{item.engraving}&quot;
              </p>
            )}
          </div>

          {/* Precio */}
          <div className="text-right">
            <p className="font-semibold text-foreground">
              ${(item.price * item.quantity).toLocaleString("es-MX")} MXN
            </p>
            <p className="text-xs text-muted-foreground">
              ${item.price.toLocaleString("es-MX")} c/u
            </p>
          </div>
        </div>

        {/* Controles de cantidad y eliminar */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-12 text-center font-medium">{item.quantity}</span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => removeItem(item.id)}
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
