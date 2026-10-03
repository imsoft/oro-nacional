"use client";

import { useTranslations } from "next-intl";
import { useCurrency } from "@/contexts/currency-context";
import type { Product } from "@/types/product";

// Imagen local usada cuando un producto o categoría no tiene imagen
export const PRODUCT_PLACEHOLDER_IMAGE = "/placeholder-product.svg";

const PRICE_SLIDER_STEP = 5000;

/**
 * Imagen principal de un producto: la marcada como primaria, si no la primera,
 * y si no hay ninguna el placeholder local.
 */
export function getPrimaryImageUrl(
  images?: Array<{ image_url?: string | null; is_primary?: boolean }> | null
): string {
  return (
    images?.find((img) => img.is_primary && img.image_url)?.image_url ||
    images?.find((img) => img.image_url)?.image_url ||
    PRODUCT_PLACEHOLDER_IMAGE
  );
}

/**
 * Precio de listado en MXN (y su precio fijo en USD si existe).
 * Devuelve mxn = 0 cuando el producto no tiene precio definido.
 */
export function getListingPrice(
  product: Pick<Product, "price" | "sizes" | "base_price_usd">
): { mxn: number; usd: number | null } {
  const firstSize = product.sizes?.[0];
  if (firstSize && (firstSize.price ?? 0) > 0) {
    return { mxn: firstSize.price as number, usd: firstSize.price_usd ?? null };
  }
  if ((product.price ?? 0) > 0) {
    return { mxn: product.price, usd: product.base_price_usd ?? null };
  }
  const pricedSize = product.sizes?.find((s) => (s.price ?? 0) > 0);
  if (pricedSize) {
    return { mxn: pricedSize.price as number, usd: pricedSize.price_usd ?? null };
  }
  return { mxn: 0, usd: null };
}

/**
 * Tope del filtro de precio (MXN) derivado de los productos cargados,
 * redondeado hacia arriba al paso del slider.
 */
export function getPriceSliderMax(prices: number[]): number {
  const max = prices.reduce((acc, p) => (p > acc ? p : acc), 0);
  return Math.max(PRICE_SLIDER_STEP, Math.ceil(max / PRICE_SLIDER_STEP) * PRICE_SLIDER_STEP);
}

export { PRICE_SLIDER_STEP };

/**
 * Devuelve una función que formatea el precio de listado en la moneda activa,
 * o "Consultar precio" cuando el producto no tiene precio.
 */
export function useProductPriceLabel() {
  const t = useTranslations("product");
  const { convertPrice, formatPrice } = useCurrency();

  return (product: Pick<Product, "price" | "sizes" | "base_price_usd">): string => {
    const { mxn, usd } = getListingPrice(product);
    return mxn > 0 ? formatPrice(convertPrice(mxn, usd)) : t("priceOnRequest");
  };
}
