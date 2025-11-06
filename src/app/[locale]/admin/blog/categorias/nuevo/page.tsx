"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  MultilingualInput, 
  MultilingualForm, 
  MultilingualCard,
  useMultilingualForm
} from "@/components/admin/multilingual-form";
import { createBlogCategory } from "@/lib/supabase/blog-multilingual";

interface CategoryFormData {
  name: { es: string; en: string };
  description: { es: string; en: string };
}

export default function NewBlogCategoryPage() {
  const router = useRouter();
  const t = useTranslations("admin.blogCategories");
  const [isLoading, setIsLoading] = useState(false);

  const defaultData: CategoryFormData = {
    name: { es: "", en: "" },
    description: { es: "", en: "" },
  };

  const {
    formData,
    updateField,
    validateForm,
  } = useMultilingualForm<CategoryFormData>(defaultData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validar campos requeridos
      const requiredFields: (keyof CategoryFormData)[] = ["name"];
      if (!validateForm(requiredFields)) {
        setIsLoading(false);
        return;
      }

      const categoryData = {
        name: formData.name,
        description: formData.description.es || formData.description.en 
          ? formData.description 
          : undefined,
      };

      await createBlogCategory(categoryData);
      router.push("/admin/blog/categorias");
    } catch (error) {
      console.error("Error creating category:", error);
      alert(t("createError") || "Error al crear la categoría. Por favor intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl">
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
        <h1 className="text-3xl font-bold text-foreground">{t("newCategory")}</h1>
        <p className="mt-2 text-muted-foreground">
          {t("newCategorySubtitle")}
        </p>
      </div>

      <MultilingualForm onSubmit={handleSubmit}>
        <MultilingualCard title={t("basicInfo")}>
          <div className="space-y-4">
            <MultilingualInput
              label={t("categoryName")}
              value={formData.name}
              onChange={(value) => updateField("name", value)}
              placeholder={{ 
                es: "Ej: Cuidados", 
                en: "Ex: Care" 
              }}
              required
            />

            <MultilingualInput
              label={t("description")}
              value={formData.description}
              onChange={(value) => updateField("description", value)}
              placeholder={{ 
                es: "Descripción de la categoría...", 
                en: "Category description..." 
              }}
              type="textarea"
            />
          </div>
        </MultilingualCard>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            {t("cancel")}
          </Button>
          <Button
            type="submit"
            className="bg-[#D4AF37] hover:bg-[#B8941E] text-white"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Save className="mr-2 h-4 w-4 animate-spin" />
                {t("saving")}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {t("saveCategory")}
              </>
            )}
          </Button>
        </div>
      </MultilingualForm>
    </div>
  );
}

