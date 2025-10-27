"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, Save, Eye } from "lucide-react";
import { 
  MultilingualInput, 
  MultilingualForm, 
  MultilingualCard,
  LanguageToggle,
  MultilingualPreview,
  useMultilingualForm
} from "./multilingual-form";
import type { 
  ProductFormData, 
  MultilingualFormData, 
  Locale,
  MultilingualCategory 
} from "@/types/multilingual";
import { createProduct, updateProduct, getCategories } from "@/lib/supabase/products-multilingual";

interface ProductFormProps {
  productId?: string;
  initialData?: Partial<ProductFormData>;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ProductForm({ productId, initialData, onSuccess, onCancel }: ProductFormProps) {
  const t = useTranslations("admin");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [categories, setCategories] = useState<any[]>([]);
  const [previewLocale, setPreviewLocale] = useState<Locale>("es");
  const [isLoading, setIsLoading] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const defaultData: ProductFormData = {
    name: { es: "", en: "" },
    description: { es: "", en: "" },
    material: { es: "", en: "" },
    category_id: "",
    price: 0,
    stock: 0,
    weight: 0,
    has_engraving: false,
    is_active: true,
    specifications: [],
    sizes: []
  };

  const {
    formData,
    errors,
    updateField,
    validateForm,
    resetForm
  } = useMultilingualForm<ProductFormData>(defaultData);

  // Cargar categorías
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await getCategories("es");
        setCategories(cats);
      } catch (error) {
        console.error("Error loading categories:", error);
      }
    };
    loadCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validar campos requeridos
      const requiredFields: (keyof ProductFormData)[] = ["name", "description", "material"];
      if (!validateForm(requiredFields)) {
        setIsLoading(false);
        return;
      }

      const productData = {
        name: formData.name,
        description: formData.description,
        material: formData.material,
        category_id: formData.category_id,
        price: formData.price,
        stock: formData.stock,
        weight: formData.weight || undefined,
        has_engraving: formData.has_engraving,
        is_active: formData.is_active,
        specifications: formData.specifications.map(spec => ({
          spec_key: spec.spec_key,
          spec_value: spec.spec_value,
          display_order: spec.display_order
        })),
        sizes: formData.sizes.map(size => ({
          size: size.size,
          stock: size.stock
        }))
      };

      if (productId) {
        await updateProduct(productId, productData);
      } else {
        await createProduct(productData);
      }

      onSuccess?.();
    } catch (error) {
      console.error("Error saving product:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addSpecification = () => {
    const newSpec = {
      spec_key: { es: "", en: "" },
      spec_value: { es: "", en: "" },
      display_order: formData.specifications.length
    };
    // Para campos no multilingües, necesitamos una solución temporal
    console.log('Adding specification:', newSpec);
  };

  const removeSpecification = (index: number) => {
    const newSpecs = formData.specifications.filter((_, i) => i !== index);
    // Para campos no multilingües, necesitamos una solución temporal
    console.log('Removing specification at index:', index);
  };

  const updateSpecification = (index: number, field: "spec_key" | "spec_value", value: MultilingualFormData) => {
    const newSpecs = [...formData.specifications];
    newSpecs[index] = { ...newSpecs[index], [field]: value };
    // Para campos no multilingües, necesitamos una solución temporal
    console.log('Updating specification:', { index, field, value });
  };

  const addSize = () => {
    const newSize = {
      size: "",
      stock: 0
    };
    // Para campos no multilingües, necesitamos una solución temporal
    console.log('Adding size:', newSize);
  };

  const removeSize = (index: number) => {
    const newSizes = formData.sizes.filter((_, i) => i !== index);
    // Para campos no multilingües, necesitamos una solución temporal
    console.log('Removing size at index:', index);
  };

  const updateSize = (index: number, field: "size" | "stock", value: string | number) => {
    const newSizes = [...formData.sizes];
    newSizes[index] = { ...newSizes[index], [field]: value };
    // Para campos no multilingües, necesitamos una solución temporal
    console.log('Updating size:', { index, field, value });
  };

  if (isPreviewMode) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Vista Previa del Producto</h2>
          <div className="flex items-center gap-2">
            <LanguageToggle 
              currentLocale={previewLocale} 
              onLocaleChange={setPreviewLocale} 
            />
            <Button
              variant="outline"
              onClick={() => setIsPreviewMode(false)}
            >
              Editar
            </Button>
          </div>
        </div>

        <MultilingualPreview locale={previewLocale}>
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold">
                {formData.name[previewLocale] || "Sin nombre"}
              </h3>
              <p className="text-gray-600">
                {formData.material[previewLocale] || "Sin material"}
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Descripción:</h4>
              <p className="text-sm text-gray-700">
                {formData.description[previewLocale] || "Sin descripción"}
              </p>
            </div>

            <div>
              <h4 className="font-medium mb-2">Precio:</h4>
              <p className="text-lg font-semibold text-green-600">
                ${formData.price.toLocaleString()}
              </p>
            </div>

            {formData.specifications.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Especificaciones:</h4>
                <ul className="space-y-1">
                  {formData.specifications.map((spec, index) => (
                    <li key={index} className="text-sm">
                      <strong>{spec.spec_key[previewLocale]}:</strong> {spec.spec_value[previewLocale]}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {formData.sizes.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Tallas Disponibles:</h4>
                <div className="flex flex-wrap gap-2">
                  {formData.sizes.map((size, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-200 rounded text-sm">
                      {size.size} ({size.stock} disponibles)
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </MultilingualPreview>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {productId ? "Editar Producto" : "Nuevo Producto"}
        </h2>
        <div className="flex items-center gap-2">
          <LanguageToggle 
            currentLocale={previewLocale} 
            onLocaleChange={setPreviewLocale} 
          />
          <Button
            variant="outline"
            onClick={() => setIsPreviewMode(true)}
            disabled={!formData.name.es || !formData.name.en}
          >
            <Eye className="w-4 h-4 mr-2" />
            Vista Previa
          </Button>
        </div>
      </div>

      <MultilingualForm onSubmit={handleSubmit}>
        <MultilingualCard title="Información Básica">
          <div className="space-y-4">
            <MultilingualInput
              label="Nombre del Producto"
              value={formData.name}
              onChange={(value) => updateField("name", value)}
              placeholder={{ es: "Ej: Anillo de Compromiso", en: "Ex: Engagement Ring" }}
              required
            />

            <MultilingualInput
              label="Descripción"
              value={formData.description}
              onChange={(value) => updateField("description", value)}
              placeholder={{ 
                es: "Descripción detallada del producto...", 
                en: "Detailed product description..." 
              }}
              type="textarea"
              required
            />

            <MultilingualInput
              label="Material"
              value={formData.material}
              onChange={(value) => updateField("material", value)}
              placeholder={{ es: "Ej: Oro 18k", en: "Ex: 18k Gold" }}
              required
            />
          </div>
        </MultilingualCard>

        <MultilingualCard title="Detalles del Producto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Categoría</Label>
              <Select 
                value={formData.category_id} 
                onValueChange={(value) => {
                  // Para campos no multilingües, necesitamos una solución temporal
                  console.log('Updating category_id:', value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name.es} / {category.name.en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Precio (MXN)</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => {
                  // Para campos no multilingües, necesitamos una solución temporal
                  console.log('Updating price:', parseFloat(e.target.value) || 0);
                }}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock}
                onChange={(e) => {
                  // Para campos no multilingües, necesitamos una solución temporal
                  console.log('Updating stock:', parseInt(e.target.value) || 0);
                }}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">Peso (gramos)</Label>
              <Input
                id="weight"
                type="number"
                value={formData.weight || ""}
                onChange={(e) => {
                  // Para campos no multilingües, necesitamos una solución temporal
                  console.log('Updating weight:', parseFloat(e.target.value) || undefined);
                }}
                placeholder="0.0"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 mt-4">
            <Checkbox
              id="has_engraving"
              checked={formData.has_engraving}
              onCheckedChange={(checked) => {
                // Para campos no multilingües, necesitamos una solución temporal
                console.log('Updating has_engraving:', checked);
              }}
            />
            <Label htmlFor="has_engraving">Disponible para grabado</Label>
          </div>

          <div className="flex items-center space-x-2 mt-2">
            <Checkbox
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => {
                // Para campos no multilingües, necesitamos una solución temporal
                console.log('Updating is_active:', checked);
              }}
            />
            <Label htmlFor="is_active">Producto activo</Label>
          </div>
        </MultilingualCard>

        <MultilingualCard title="Especificaciones">
          <div className="space-y-4">
            {formData.specifications.map((spec, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Especificación {index + 1}</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeSpecification(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <MultilingualInput
                  label="Nombre de la especificación"
                  value={spec.spec_key}
                  onChange={(value) => updateSpecification(index, "spec_key", value)}
                  placeholder={{ es: "Ej: Quilates", en: "Ex: Carats" }}
                />

                <MultilingualInput
                  label="Valor de la especificación"
                  value={spec.spec_value}
                  onChange={(value) => updateSpecification(index, "spec_value", value)}
                  placeholder={{ es: "Ej: 0.5ct", en: "Ex: 0.5ct" }}
                />
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={addSpecification}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar Especificación
            </Button>
          </div>
        </MultilingualCard>

        <MultilingualCard title="Tallas Disponibles">
          <div className="space-y-4">
            {formData.sizes.map((size, index) => (
              <div key={index} className="flex items-center gap-4 border rounded-lg p-4">
                <div className="flex-1">
                  <Label htmlFor={`size-${index}`}>Talla</Label>
                  <Input
                    id={`size-${index}`}
                    value={size.size}
                    onChange={(e) => updateSize(index, "size", e.target.value)}
                    placeholder="Ej: M, L, XL"
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor={`stock-${index}`}>Stock</Label>
                  <Input
                    id={`stock-${index}`}
                    type="number"
                    value={size.stock}
                    onChange={(e) => updateSize(index, "stock", parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeSize(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={addSize}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar Talla
            </Button>
          </div>
        </MultilingualCard>

        <Separator />

        <div className="flex items-center justify-end gap-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={isLoading}>
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? "Guardando..." : "Guardar Producto"}
          </Button>
        </div>
      </MultilingualForm>
    </div>
  );
}
