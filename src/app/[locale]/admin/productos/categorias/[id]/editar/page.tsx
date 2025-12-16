"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  MultilingualInput,
  MultilingualForm,
  MultilingualCard,
  useMultilingualForm
} from "@/components/admin/multilingual-form";
import { getProductCategoryById, updateCategory } from "@/lib/supabase/products-multilingual";
import { toast } from "sonner";

interface CategoryFormData {
  name: { es: string; en: string };
  description: { es: string; en: string };
}

interface EditCategoryPageProps {
  params: Promise<{ id: string }>;
}

export default function EditProductCategoryPage({ params }: EditCategoryPageProps) {
  const router = useRouter();
  const t = useTranslations("admin.productCategories");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [categoryId, setCategoryId] = useState<string>("");

  const defaultData: CategoryFormData = {
    name: { es: "", en: "" },
    description: { es: "", en: "" },
  };

  const {
    formData,
    updateField,
    validateForm,
    setFormData,
  } = useMultilingualForm<CategoryFormData>(defaultData);

  useEffect(() => {
    const loadParams = async () => {
      const resolvedParams = await params;
      setCategoryId(resolvedParams.id);
    };
    loadParams();
  }, [params]);

  useEffect(() => {
    if (categoryId) {
      loadCategory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId]);

  const loadCategory = async () => {
    setIsLoadingData(true);
    try {
      const category = await getProductCategoryById(categoryId);
      if (category) {
        setFormData({
          name: category.name,
          description: category.description || { es: "", en: "" },
        });
      } else {
        toast.error("Categoría no encontrada", {
          description: "No se pudo encontrar la categoría solicitada. Verifica el ID e intenta de nuevo."
        });
        router.push("/admin/productos/categorias");
      }
    } catch (error) {
      console.error("Error loading category:", error);
      if (error instanceof Error) {
        toast.error("Error al cargar la categoría", {
          description: error.message || "No se pudo cargar la información de la categoría."
        });
      } else {
        toast.error("Error al cargar la categoría", {
          description: "Ocurrió un error inesperado al cargar la categoría."
        });
      }
      router.push("/admin/productos/categorias");
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validar campos requeridos
      const requiredFields: (keyof CategoryFormData)[] = ["name"];
      if (!validateForm(requiredFields)) {
        toast.error("Campos requeridos faltantes", {
          description: "Por favor completa el nombre de la categoría en español antes de continuar."
        });
        setIsLoading(false);
        return;
      }

      // Validar que el nombre en español no esté vacío
      if (!formData.name.es || formData.name.es.trim() === "") {
        toast.error("Nombre en español requerido", {
          description: "Debes proporcionar un nombre en español para la categoría."
        });
        setIsLoading(false);
        return;
      }

      const categoryData = {
        name: formData.name,
        description: formData.description.es || formData.description.en
          ? formData.description
          : undefined,
      };

      await updateCategory(categoryId, categoryData);
      toast.success("Categoría actualizada exitosamente", {
        description: `La categoría "${formData.name.es}" ha sido actualizada correctamente.`
      });
      router.push("/admin/productos/categorias");
    } catch (error) {
      console.error("Error updating category:", error);
      if (error instanceof Error) {
        toast.error("Error al actualizar la categoría", {
          description: error.message || "No se pudo actualizar la categoría. Por favor intenta de nuevo."
        });
      } else {
        toast.error("Error al actualizar la categoría", {
          description: "Ocurrió un error inesperado al actualizar la categoría."
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

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
        <h1 className="text-3xl font-bold text-foreground">{t("editCategory")}</h1>
        <p className="mt-2 text-muted-foreground">
          {t("editCategorySubtitle")}
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
                es: "Ej: Anillos", 
                en: "Ex: Rings" 
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
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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

