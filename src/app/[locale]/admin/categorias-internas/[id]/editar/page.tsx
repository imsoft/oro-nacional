"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getInternalCategoryById,
  updateInternalCategory,
  getInternalSubcategories,
  createInternalSubcategory,
  updateInternalSubcategory,
  deleteInternalSubcategory,
  type InternalSubcategory,
} from "@/lib/supabase/internal-categories";
import { Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface EditInternalCategoryPageProps {
  params: Promise<{ id: string }>;
}

export default function EditInternalCategoryPage({ params }: EditInternalCategoryPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const t = useTranslations("admin.internalCategories");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [subcategories, setSubcategories] = useState<InternalSubcategory[]>([]);
  const [isLoadingSubcategories, setIsLoadingSubcategories] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newSubcategoryData, setNewSubcategoryData] = useState({
    name: "",
    special_code: "",
  });
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "",
    is_active: true,
  });

  const categoryId = resolvedParams.id;

  // Validar que el ID sea un UUID válido
  const isValidUUID = (id: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  };

  useEffect(() => {
    // Solo cargar si el ID es válido
    if (categoryId && isValidUUID(categoryId)) {
      loadCategory();
      loadSubcategories();
    } else if (categoryId) {
      // Si hay un ID pero no es válido, redirigir
      alert(t("categoryNotFound") || "ID de categoría inválido");
      router.push("/admin/categorias-internas");
    }
  }, [categoryId]);

  const loadCategory = async () => {
    if (!categoryId || !isValidUUID(categoryId)) {
      return;
    }

    setIsLoading(true);
    try {
      const category = await getInternalCategoryById(categoryId);
      if (!category) {
        alert(t("categoryNotFound") || "Categoría no encontrada");
        router.push("/admin/categorias-internas");
        return;
      }

      setFormData({
        name: category.name,
        description: category.description || "",
        color: category.color || "",
        is_active: category.is_active,
      });
    } catch (error: any) {
      console.error("Error loading category:", error);
      // Solo mostrar error si no es el error de "no encontrado"
      if (error?.code !== "PGRST116") {
        alert(t("loadError") || "Error al cargar la categoría");
      } else {
        alert(t("categoryNotFound") || "Categoría no encontrada");
      }
      router.push("/admin/categorias-internas");
    } finally {
      setIsLoading(false);
    }
  };

  const loadSubcategories = async () => {
    if (!categoryId || !isValidUUID(categoryId)) {
      return;
    }

    setIsLoadingSubcategories(true);
    try {
      const subs = await getInternalSubcategories(categoryId);
      setSubcategories(subs);
    } catch (error) {
      console.error("Error loading subcategories:", error);
    } finally {
      setIsLoadingSubcategories(false);
    }
  };

  const handleAddSubcategory = async () => {
    if (!newSubcategoryData.name.trim()) {
      alert(t("subcategoryNameRequired") || "El nombre es requerido");
      return;
    }

    try {
      const newSubcategory = await createInternalSubcategory({
        internal_category_id: categoryId,
        name: newSubcategoryData.name.trim(),
        special_code: newSubcategoryData.special_code.trim() || undefined,
        display_order: subcategories.length,
      });
      setSubcategories([...subcategories, newSubcategory]);
      // Limpiar el formulario y cerrar el diálogo
      setNewSubcategoryData({ name: "", special_code: "" });
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error("Error creating subcategory:", error);
      alert(t("createSubcategoryError") || "Error al crear la subcategoría");
    }
  };

  const handleUpdateSubcategory = async (subcategoryId: string, field: string, value: string | boolean) => {
    try {
      // Si el campo es special_code y el valor es una cadena vacía, establecerlo como null
      const updateValue = field === "special_code" && value === "" ? null : value;
      const updated = await updateInternalSubcategory(subcategoryId, { [field]: updateValue });
      setSubcategories(subcategories.map(sub => sub.id === subcategoryId ? updated : sub));
    } catch (error) {
      console.error("Error updating subcategory:", error);
      alert(t("updateSubcategoryError") || "Error al actualizar la subcategoría");
    }
  };

  const handleDeleteSubcategory = async (subcategoryId: string) => {
    if (!confirm(t("deleteSubcategoryConfirm") || "¿Estás seguro de eliminar esta subcategoría?")) {
      return;
    }

    try {
      await deleteInternalSubcategory(subcategoryId);
      setSubcategories(subcategories.filter(sub => sub.id !== subcategoryId));
    } catch (error) {
      console.error("Error deleting subcategory:", error);
      alert(t("deleteSubcategoryError") || "Error al eliminar la subcategoría");
    }
  };

  const handleMoveSubcategory = async (subcategoryId: string, direction: "up" | "down") => {
    const index = subcategories.findIndex(sub => sub.id === subcategoryId);
    if (index === -1) return;

    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= subcategories.length) return;

    const newOrder = subcategories[newIndex].display_order;
    const currentOrder = subcategories[index].display_order;

    try {
      await updateInternalSubcategory(subcategoryId, { display_order: newOrder });
      await updateInternalSubcategory(subcategories[newIndex].id, { display_order: currentOrder });
      await loadSubcategories();
    } catch (error) {
      console.error("Error moving subcategory:", error);
      alert(t("moveSubcategoryError") || "Error al mover la subcategoría");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (!formData.name.trim()) {
        alert(t("nameRequired") || "El nombre es requerido");
        setIsSaving(false);
        return;
      }

      await updateInternalCategory(categoryId, {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        color: formData.color.trim() || undefined,
        is_active: formData.is_active,
      });

      router.push("/admin/categorias-internas");
    } catch (error) {
      console.error("Error updating category:", error);
      alert(t("updateError") || "Error al actualizar la categoría. Por favor intenta de nuevo.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  return (
    <div className="w-full">
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

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>{t("basicInfo")}</CardTitle>
            <CardDescription>
              {t("basicInfoDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                {t("categoryName")} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t("namePlaceholder")}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t("description")}</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={t("descriptionPlaceholder")}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">{t("color")}</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="color"
                  type="color"
                  value={formData.color || "#D4AF37"}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-20 h-10"
                />
                <Input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  placeholder="#D4AF37"
                  pattern="^#[0-9A-Fa-f]{6}$"
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {t("colorDescription")}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_active: checked === true })
                }
              />
              <Label htmlFor="is_active" className="cursor-pointer">
                {t("isActive")}
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Subcategorías */}
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{t("subcategories") || "Subcategorías"}</CardTitle>
                <CardDescription>
                  {t("subcategoriesDescription") || "Gestiona las subcategorías de esta categoría interna"}
                </CardDescription>
              </div>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isLoadingSubcategories}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {t("addSubcategory") || "Agregar Subcategoría"}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>{t("addSubcategory") || "Agregar Subcategoría"}</DialogTitle>
                    <DialogDescription>
                      {t("addSubcategoryDescription") || "Ingresa el nombre y código especial de la nueva subcategoría"}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="new-subcategory-code">
                        {t("specialCode") || "Código Especial"} <span className="text-muted-foreground text-xs">({t("optional") || "opcional"})</span>
                      </Label>
                      <Input
                        id="new-subcategory-code"
                        value={newSubcategoryData.special_code}
                        onChange={(e) => setNewSubcategoryData({ ...newSubcategoryData, special_code: e.target.value })}
                        placeholder={t("specialCodePlaceholder") || "Ej: ABC123"}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="new-subcategory-name">
                        {t("subcategoryName") || "Nombre"} <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="new-subcategory-name"
                        value={newSubcategoryData.name}
                        onChange={(e) => setNewSubcategoryData({ ...newSubcategoryData, name: e.target.value })}
                        placeholder={t("subcategoryNamePlaceholder") || "Nombre de la subcategoría"}
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsAddDialogOpen(false);
                        setNewSubcategoryData({ name: "", special_code: "" });
                      }}
                    >
                      {t("cancel") || "Cancelar"}
                    </Button>
                    <Button
                      type="button"
                      onClick={handleAddSubcategory}
                      disabled={!newSubcategoryData.name.trim()}
                    >
                      {t("add") || "Agregar"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingSubcategories ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-[#D4AF37]" />
              </div>
            ) : subcategories.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                {t("noSubcategories") || "No hay subcategorías. Haz clic en 'Agregar Subcategoría' para crear una."}
              </p>
            ) : (
              <div className="space-y-3">
                {subcategories.map((subcategory, index) => (
                  <div
                    key={subcategory.id}
                    className="flex items-center gap-3 p-3 border rounded-lg bg-card"
                  >
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleMoveSubcategory(subcategory.id, "up")}
                        disabled={index === 0}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleMoveSubcategory(subcategory.id, "down")}
                        disabled={index === subcategories.length - 1}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                      <Input
                        value={subcategory.special_code || ""}
                        onChange={(e) => handleUpdateSubcategory(subcategory.id, "special_code", e.target.value)}
                        placeholder={t("specialCode") || "Código Especial"}
                        className="h-9"
                      />
                      <Input
                        value={subcategory.name}
                        onChange={(e) => handleUpdateSubcategory(subcategory.id, "name", e.target.value)}
                        placeholder={t("subcategoryName") || "Nombre"}
                        className="h-9"
                      />
                      <div className="flex items-center gap-2">
                        {subcategory.color && (
                          <div
                            className="w-6 h-6 rounded border border-border"
                            style={{ backgroundColor: subcategory.color }}
                          />
                        )}
                        <Input
                          type="color"
                          value={subcategory.color || "#D4AF37"}
                          onChange={(e) => handleUpdateSubcategory(subcategory.id, "color", e.target.value)}
                          className="w-16 h-9"
                        />
                        <Input
                          type="text"
                          value={subcategory.color || ""}
                          onChange={(e) => handleUpdateSubcategory(subcategory.id, "color", e.target.value)}
                          placeholder="#D4AF37"
                          className="flex-1 h-9"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={subcategory.is_active}
                          onCheckedChange={(checked) =>
                            handleUpdateSubcategory(subcategory.id, "is_active", checked === true)
                          }
                        />
                        <Label className="text-sm">{t("isActive")}</Label>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDeleteSubcategory(subcategory.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSaving}
          >
            {t("cancel")}
          </Button>
          <Button
            type="submit"
            className="bg-[#D4AF37] hover:bg-[#B8941E] text-white"
            disabled={isSaving}
          >
            {isSaving ? (
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
      </form>
    </div>
  );
}

