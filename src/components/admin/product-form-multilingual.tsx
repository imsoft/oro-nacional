"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, Save, Eye, X } from "lucide-react";
import { ProductImagesManager } from "./product-images-manager";
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
  Locale
} from "@/types/multilingual";
import { createProduct, updateProduct, getCategoriesForAdmin } from "@/lib/supabase/products-multilingual";
import { getProductById, deleteProductImages } from "@/lib/supabase/products";

interface ProductFormProps {
  productId?: string;
  initialData?: Partial<ProductFormData>;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ProductForm({ productId, onSuccess, onCancel }: ProductFormProps) {
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
    weight: undefined,
    is_active: true,
    available_languages: ['es'],
    specifications: [],
    sizes: [],
    images: [],
    existing_images: []
  };

  const {
    formData,
    updateField,
    validateForm,
  } = useMultilingualForm<ProductFormData>(defaultData);

  // Cargar categorías
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await getCategoriesForAdmin();
        setCategories(cats);
      } catch (error) {
        console.error("Error loading categories:", error);
      }
    };
    loadCategories();
  }, []);

  // Cargar producto existente para edición
  useEffect(() => {
    const loadProduct = async () => {
      // Validar que productId exista y no sea una cadena vacía
      if (!productId || productId.trim() === "") return;

      setIsLoading(true);
      try {
        const product = await getProductById(productId);
        if (!product) {
          console.error("Product not found");
          setIsLoading(false);
          return;
        }

        // Cargar los datos del producto en el formulario
        updateField("name", { es: product.name_es || "", en: product.name_en || "" });
        updateField("description", { es: product.description_es || "", en: product.description_en || "" });
        updateField("material", { es: product.material_es || "", en: product.material_en || "" });
        updateField("category_id", product.category_id || "");
        updateField("price", product.price || 0);
        updateField("stock", product.stock || 0);
        updateField("weight", product.weight || undefined);
        updateField("is_active", product.is_active);

        // Cargar imágenes existentes
        if (product.images && Array.isArray(product.images)) {
          updateField("existing_images", product.images.map((img: {
            id: string;
            image_url: string;
            alt_text_es?: string;
            alt_text_en?: string;
            display_order: number;
            is_primary: boolean;
          }) => ({
            id: img.id,
            image_url: img.image_url,
            alt_text: { es: img.alt_text_es || "", en: img.alt_text_en || "" },
            display_order: img.display_order,
            is_primary: img.is_primary
          })));
        }

        // Cargar especificaciones (filtrar las que estén vacías)
        if (product.specifications && Array.isArray(product.specifications)) {
          const specs = product.specifications
            .map((spec: {
              spec_key_es?: string;
              spec_key_en?: string;
              spec_value_es?: string;
              spec_value_en?: string;
              display_order: number;
            }) => ({
              spec_key: { es: spec.spec_key_es || "", en: spec.spec_key_en || "" },
              spec_value: { es: spec.spec_value_es || "", en: spec.spec_value_en || "" },
              display_order: spec.display_order
            }))
            .filter(spec =>
              // Solo incluir especificaciones que tengan al menos un valor no vacío
              spec.spec_key.es.trim() !== "" ||
              spec.spec_key.en.trim() !== "" ||
              spec.spec_value.es.trim() !== "" ||
              spec.spec_value.en.trim() !== ""
            );
          updateField("specifications", specs);
        }

        // Cargar tallas/variantes
        if (product.sizes && Array.isArray(product.sizes)) {
          updateField("sizes", product.sizes.map((size: {
            size: string;
            price?: number;
            stock: number;
          }) => ({
            size: size.size,
            price: size.price || product.price || 0,
            stock: size.stock
          })));
        }

      } catch (error) {
        console.error("Error loading product:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProduct();
  }, [productId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDeleteImage = async (imageId: string, index: number) => {
    if (!window.confirm(t('productForm.confirmDeleteImage') || '¿Estás seguro de que deseas eliminar esta imagen?')) {
      return;
    }

    try {
      // Eliminar de la base de datos y storage
      await deleteProductImages([imageId]);

      // Actualizar el estado local
      const newImages = formData.existing_images?.filter((_, i) => i !== index);
      updateField("existing_images", newImages);

      alert(t('productForm.imageDeleted') || 'Imagen eliminada exitosamente');
    } catch (error) {
      console.error('Error deleting image:', error);
      alert(t('productForm.errorDeletingImage') || 'Error al eliminar la imagen. Por favor intenta de nuevo.');
    }
  };

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
        is_active: formData.is_active,
        available_languages: formData.available_languages,
        specifications: formData.specifications.map(spec => ({
          spec_key: spec.spec_key,
          spec_value: spec.spec_value,
          display_order: spec.display_order
        })),
        sizes: formData.sizes.map(size => ({
          size: size.size,
          stock: size.stock,
          price: size.price
        })),
        images: formData.images
      };

      // Validar que productId sea un UUID válido si existe
      if (productId && productId.trim() !== "") {
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
    updateField("specifications", [...formData.specifications, newSpec]);
  };

  const removeSpecification = (index: number) => {
    updateField("specifications", formData.specifications.filter((_, i) => i !== index));
  };

  const updateSpecification = (index: number, field: "spec_key" | "spec_value", value: MultilingualFormData) => {
    const newSpecs = [...formData.specifications];
    newSpecs[index] = { ...newSpecs[index], [field]: value };
    updateField("specifications", newSpecs);
  };

  const addSize = () => {
    const newSize = {
      size: "",
      stock: 0,
      price: formData.price || 0 // Default to base price
    };
    updateField("sizes", [...formData.sizes, newSize]);
  };

  const removeSize = (index: number) => {
    updateField("sizes", formData.sizes.filter((_, i) => i !== index));
  };

  const updateSize = (index: number, field: "size" | "stock" | "price", value: string | number) => {
    const newSizes = [...formData.sizes];
    newSizes[index] = { ...newSizes[index], [field]: value };
    updateField("sizes", newSizes);
  };

  if (isPreviewMode) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">{t('productForm.previewTitle')}</h2>
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
                {formData.name[previewLocale] || t('productForm.noName')}
              </h3>
              <p className="text-gray-600">
                {formData.material[previewLocale] || t('productForm.noMaterial')}
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">{t('productForm.description')}</h4>
              <p className="text-sm text-gray-700">
                {formData.description[previewLocale] || t('productForm.noDescription')}
              </p>
            </div>

            <div>
              <h4 className="font-medium mb-2">{t('productForm.price')}</h4>
              <p className="text-lg font-semibold text-green-600">
                ${formData.price.toLocaleString()}
              </p>
            </div>

            {formData.specifications.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">{t('productForm.specifications')}</h4>
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
                <h4 className="font-medium mb-2">{t('productForm.availableSizes')}</h4>
                <div className="flex flex-wrap gap-2">
                  {formData.sizes.map((size, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-200 rounded text-sm">
                      {size.size} ({size.stock} {t('productForm.available')})
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
          {productId ? t('productForm.editProduct') : t('productForm.newProduct')}
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
            {t('productForm.preview')}
          </Button>
        </div>
      </div>

      <MultilingualForm onSubmit={handleSubmit}>
        <MultilingualCard title={t('productForm.basicInfo')}>
          <div className="space-y-4">
            <MultilingualInput
              label={t('productForm.productName')}
              value={formData.name}
              onChange={(value) => updateField("name", value)}
              placeholder={{ es: "Ej: Anillo de Compromiso", en: "Ex: Engagement Ring" }}
              required
            />

            <MultilingualInput
              label={t('productForm.description')}
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
              label={t('productForm.material')}
              value={formData.material}
              onChange={(value) => updateField("material", value)}
              placeholder={{ es: "Ej: Oro 18k", en: "Ex: 18k Gold" }}
              required
            />
          </div>
        </MultilingualCard>

        <MultilingualCard title={t('productForm.productDetails')}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label htmlFor="category">{t('productForm.category')}</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => {
                  updateField("category_id", value);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('productForm.selectCategory')} />
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

            <div className="space-y-3">
              <Label htmlFor="available_languages">Idioma</Label>
              <Select
                value={formData.available_languages?.[0] || 'es'}
                onValueChange={(value) => {
                  const languages = value === 'es' ? ['es'] : ['en'];
                  updateField("available_languages", languages);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona idioma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="en">Inglés</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label htmlFor="price">{t('productForm.priceLabel')}</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => {
                  updateField("price", parseFloat(e.target.value) || 0);
                }}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="stock">{t('productForm.stock')}</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => {
                  updateField("stock", parseInt(e.target.value) || 0);
                }}
                placeholder="0"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="weight">{t('productForm.weight')}</Label>
              <Input
                id="weight"
                type="number"
                step="0.01"
                min="0"
                value={formData.weight !== undefined ? formData.weight : ""}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "" || value === null) {
                    updateField("weight", undefined);
                  } else {
                    const parsed = parseFloat(value);
                    updateField("weight", isNaN(parsed) ? undefined : parsed);
                  }
                }}
                placeholder=""
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 mt-4">
            <Checkbox
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => {
                updateField("is_active", checked === true);
              }}
            />
            <Label htmlFor="is_active" className="cursor-pointer">{t('productForm.activeProduct')}</Label>
          </div>
        </MultilingualCard>

        <MultilingualCard title={t('productForm.images')}>
          <ProductImagesManager
            existingImages={formData.existing_images || []}
            newImages={formData.images || []}
            onExistingImagesChange={(images) => updateField("existing_images", images)}
            onNewImagesChange={(images) => updateField("images", images)}
            onDeleteImage={handleDeleteImage}
          />
        </MultilingualCard>

        <MultilingualCard title={t('productForm.specifications')}>
          <div className="space-y-4">
            {formData.specifications.map((spec, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{t('productForm.specification')} {index + 1}</h4>
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
                  label={t('productForm.specName')}
                  value={spec.spec_key}
                  onChange={(value) => updateSpecification(index, "spec_key", value)}
                  placeholder={{ es: "Ej: Quilates", en: "Ex: Carats" }}
                />

                <MultilingualInput
                  label={t('productForm.specValue')}
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
              {t('productForm.addSpecification')}
            </Button>
          </div>
        </MultilingualCard>

        <MultilingualCard title={t('productForm.availableSizesTitle')}>
          <div className="space-y-4">
            {formData.sizes.map((size, index) => (
              <div key={index} className="flex items-center gap-4 border rounded-lg p-4">
                <div className="flex-1">
                  <Label htmlFor={`size-${index}`} className="mb-2 block">{t('productForm.size')}</Label>
                  <Input
                    id={`size-${index}`}
                    value={size.size}
                    onChange={(e) => updateSize(index, "size", e.target.value)}
                    placeholder="Ej: 5, 6, 7, 8"
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor={`price-${index}`} className="mb-2 block">Precio (MXN)</Label>
                  <Input
                    id={`price-${index}`}
                    type="number"
                    value={size.price}
                    onChange={(e) => updateSize(index, "price", parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor={`stock-${index}`} className="mb-2 block">{t('productForm.stock')}</Label>
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
              {t('productForm.addSize')}
            </Button>
          </div>
        </MultilingualCard>

        <Separator />

        <div className="flex items-center justify-end gap-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              {t('productForm.cancel')}
            </Button>
          )}
          <Button type="submit" disabled={isLoading}>
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? t('products.saving') : t('products.saveProduct')}
          </Button>
        </div>
      </MultilingualForm>
    </div>
  );
}
