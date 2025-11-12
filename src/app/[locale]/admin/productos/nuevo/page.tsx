"use client";

import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductForm } from "@/components/admin/product-form-multilingual";

export default function NewProductPage() {
  const router = useRouter();
  const t = useTranslations("admin");

  const handleSuccess = () => {
    router.push("/admin/productos");
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4 -ml-2"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("back")}
        </Button>
        <h1 className="text-3xl font-bold text-foreground">{t("productForm.newProduct")}</h1>
        <p className="mt-2 text-muted-foreground">
          {t("productForm.newProductSubtitle")}
        </p>
      </div>

      {/* Product Form */}
      <ProductForm onSuccess={handleSuccess} onCancel={handleCancel} />
    </div>
  );
}
