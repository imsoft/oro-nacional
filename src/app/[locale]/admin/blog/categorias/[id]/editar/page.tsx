"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  MultilingualInput,
  MultilingualForm,
  MultilingualCard,
  useMultilingualForm
} from "@/components/admin/multilingual-form";
import { getBlogCategoryById, updateBlogCategory } from "@/lib/supabase/blog-multilingual";

interface CategoryFormData {
  name: { es: string; en: string };
  description: { es: string; en: string };
}

interface EditCategoryPageProps {
  params: { id: string };
}

export default function EditBlogCategoryPage({ params }: EditCategoryPageProps) {
  const router = useRouter();
  const t = useTranslations("admin.blogCategories");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

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
    loadCategory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const loadCategory = async () => {
    setIsLoadingData(true);
    try {
      const category = await getBlogCategoryById(params.id);
      if (category) {
        setFormData({
          name: category.name,
          description: category.description || { es: "", en: "" },
        });
      } else {
        toast.error("Categoría no encontrada", {
          description: "La categoría que intentas editar no existe o ha sido eliminada.",
        });
        router.push("/admin/blog/categorias");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido al cargar la categoría";
      toast.error("Error al cargar categoría", {
        description: errorMessage,
      });
      router.push("/admin/blog/categorias");
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
        toast.error("Campos requeridos", {
          description: "Por favor completa todos los campos obligatorios en ambos idiomas.",
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

      await updateBlogCategory(params.id, categoryData);
      toast.success("Categoría actualizada", {
        description: `La categoría "${formData.name.es}" se actualizó exitosamente.`,
      });
      router.push("/admin/blog/categorias");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido al actualizar la categoría";
      toast.error("Error al actualizar categoría", {
        description: errorMessage,
      });
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

