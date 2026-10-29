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
 * Rango de precios de listado (MXN) a partir de las tallas con precio.
 * minUSD/maxUSD son los precios fijos en USD de las tallas más barata y más
 * cara (null cuando no existen). Si ninguna talla tiene precio se usa el
 * precio base/price del producto. Devuelve minMXN = 0 cuando no hay precio.
 */
export function getListingPriceRange(
  product: Pick<Product, "price" | "sizes" | "base_price_usd">
): { minMXN: number; maxMXN: number; minUSD: number | null; maxUSD: number | null } {
  const pricedSizes = (product.sizes ?? []).filter((s) => (s.price ?? 0) > 0);

  if (pricedSizes.length === 0) {
    const { mxn, usd } = getListingPrice(product);
    return { minMXN: mxn, maxMXN: mxn, minUSD: usd, maxUSD: usd };
  }

  let min = pricedSizes[0];
  let max = pricedSizes[0];
  for (const size of pricedSizes) {
    if ((size.price as number) < (min.price as number)) min = size;
    if ((size.price as number) > (max.price as number)) max = size;
  }

  return {
    minMXN: min.price as number,
    maxMXN: max.price as number,
    minUSD: min.price_usd ?? null,
    maxUSD: max.price_usd ?? null,
  };
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

/**
 * Rango de precios listo para mostrar en una tarjeta de producto.
 * - prefix: "desde" cuando hay un solo precio (o todas las tallas cuestan igual)
 * - amount: el monto formateado ("$X" o "$X – $Y") o "Consultar precio"
 * - label: texto completo para compartir / favoritos ("desde $X", "$X – $Y")
 */
export interface ProductPriceRangeDisplay {
  prefix: string | null;
  amount: string;
  label: string;
}

/**
 * Devuelve una función que formatea el rango de precios de un producto en la
 * moneda activa: "desde $X" si todas las tallas cuestan lo mismo (o solo hay
 * un precio), "$X – $Y" cuando difieren, o "Consultar precio" si no hay precio.
 */
export function useProductPriceRangeLabel() {
  const t = useTranslations("product");
  const { convertPrice, formatPrice } = useCurrency();

  return (
    product: Pick<Product, "price" | "sizes" | "base_price_usd">
  ): ProductPriceRangeDisplay => {
    const { minMXN, maxMXN, minUSD, maxUSD } = getListingPriceRange(product);

    if (minMXN <= 0) {
      const amount = t("priceOnRequest");
      return { prefix: null, amount, label: amount };
    }

    const min = convertPrice(minMXN, minUSD);
    const max = convertPrice(maxMXN, maxUSD);

    if (max > min) {
      const amount = `${formatPrice(min)} – ${formatPrice(max)}`;
      return { prefix: null, amount, label: amount };
    }

    const prefix = t("priceFrom");
    const amount = formatPrice(min);
    return { prefix, amount, label: `${prefix} ${amount}` };
  };
}
