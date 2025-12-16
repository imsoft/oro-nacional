"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Plus, Pencil, Trash2, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  getAllProductCategories,
  deleteProductCategory,
} from "@/lib/supabase/products-multilingual";
import { Link } from "@/i18n/routing";
import { toast } from "sonner";

interface ProductCategoryListItem {
  id: string;
  name: {
    es: string;
    en: string;
  };
  slug: {
    es: string;
    en: string;
  };
  description?: {
    es: string;
    en: string;
  };
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export default function ProductCategoriesAdmin() {
  const t = useTranslations("admin.productCategories");
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState<ProductCategoryListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<ProductCategoryListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const data = await getAllProductCategories();
      setCategories(data);
    } catch (error) {
      console.error("Error loading categories:", error);
      toast.error("Error al cargar categorías", {
        description: "No se pudieron cargar las categorías de productos. Por favor recarga la página."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (category: ProductCategoryListItem) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
    setError(null);
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;

    setIsDeleting(true);
    setError(null);
    try {
      await deleteProductCategory(categoryToDelete.id);
      setCategories((prev) => prev.filter((c) => c.id !== categoryToDelete.id));
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
      toast.success("Categoría eliminada exitosamente", {
        description: `La categoría "${categoryToDelete.name.es}" ha sido eliminada correctamente.`
      });
    } catch (err: unknown) {
      console.error("Error deleting category:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      const displayError = errorMessage.includes("products")
        ? t("deleteErrorWithProducts")
        : t("deleteError");
      setError(displayError);

      if (errorMessage.includes("products")) {
        toast.error("No se puede eliminar la categoría", {
          description: "Esta categoría tiene productos asociados. Primero debes eliminar o reasignar los productos."
        });
      } else {
        toast.error("Error al eliminar categoría", {
          description: err instanceof Error ? err.message : "Ocurrió un error inesperado al eliminar la categoría."
        });
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredCategories = categories.filter((category) => {
    const search = searchTerm.toLowerCase();
    return (
      category.name.es.toLowerCase().includes(search) ||
      category.name.en.toLowerCase().includes(search) ||
      category.slug.es.toLowerCase().includes(search) ||
      category.slug.en.toLowerCase().includes(search)
    );
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t("title")}</h1>
          <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Button
          className="bg-[#D4AF37] hover:bg-[#B8941E] text-white"
          asChild
        >
          <Link href="/admin/productos/categorias/nuevo">
            <Plus className="mr-2 h-5 w-5" />
            {t("newCategory")}
          </Link>
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder={t("searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Categories Table */}
      <div className="rounded-lg bg-card border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t("nameColumn")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t("slugColumn")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t("descriptionColumn")}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t("actionsColumn")}
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                    {searchTerm
                      ? t("noCategoriesFound")
                      : t("noCategories")}
                  </td>
                </tr>
              ) : (
                filteredCategories.map((category) => (
                  <tr key={category.id} className="hover:bg-muted/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          {category.name.es}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {category.name.en}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-muted-foreground">
                          {category.slug.es}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {category.slug.en}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-muted-foreground max-w-md truncate">
                        {category.description?.es || t("noDescription")}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          asChild
                        >
                          <Link href={`/admin/productos/categorias/${category.id}/editar`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteClick(category)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-8">
        <div className="rounded-lg bg-card border border-border p-6">
          <div className="text-sm text-muted-foreground">{t("totalCategories")}</div>
          <div className="mt-2 text-3xl font-bold text-foreground">
            {categories.length}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              {t("deleteCategory")}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3 pt-3">
              <p>
                {t("deleteConfirm")}{" "}
                <span className="font-semibold text-foreground">
                  {categoryToDelete?.name.es} / {categoryToDelete?.name.en}
                </span>
                ?
              </p>
              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
                <p className="text-sm text-amber-800">
                  {t("deleteWarning")}
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              {t("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600 text-white"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("deleting")}
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t("deleteCategory")}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

