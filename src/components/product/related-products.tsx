import { useTranslations } from "next-intl";
import ProductCard from "@/components/catalog/product-card";

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

interface RelatedProductsProps {
  products: Product[];
}

const RelatedProducts = ({ products }: RelatedProductsProps) => {
  const t = useTranslations("product");

  if (products.length === 0) return null;

  return (
    <section className="py-16 lg:py-24 border-t border-border">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-12">
          <h2 className="text-3xl font-semibold text-foreground">
            {t("relatedTitle")}
          </h2>
          <p className="mt-2 text-lg text-muted-foreground">
            {t("relatedSubtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default RelatedProducts;
