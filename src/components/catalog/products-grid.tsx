"use client";

import { useTranslations } from "next-intl";
import ProductCard from "./product-card";

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string;
  category: string;
  material: string;
  slug: string;
}

interface ProductsGridProps {
  products: Product[];
  viewMode: "grid" | "list";
}

const ProductsGrid = ({ products, viewMode }: ProductsGridProps) => {
  const t = useTranslations("catalog");

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <div className="text-center">
          <h3 className="text-2xl font-semibold text-foreground mb-2">
            {t("noProductsFound")}
          </h3>
          <p className="text-muted-foreground">
            {t("adjustFilters")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={
        viewMode === "grid"
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          : "flex flex-col gap-6"
      }
    >
      {products.map((product) => (
        <ProductCard key={product.id} {...product} />
      ))}
    </div>
  );
};

export default ProductsGrid;
