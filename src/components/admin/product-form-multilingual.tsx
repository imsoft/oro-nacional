"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, Save, Eye, X, ArrowUp, ArrowDown, GripVertical } from "lucide-react";
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
import {
  getAllInternalCategories,
  getProductInternalCategoriesAndSubcategories,
  updateProductInternalCategoriesAndSubcategories,
  getInternalSubcategories,
} from "@/lib/supabase/internal-categories";
import type { InternalCategory, InternalSubcategory } from "@/lib/supabase/internal-categories";
import { calculateDynamicProductPrice } from "@/lib/supabase/pricing";
import { Calculator, Loader2 } from "lucide-react";
import { getStoreSettings } from "@/lib/supabase/settings";
import { toast } from "sonner";

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
  const [internalCategories, setInternalCategories] = useState<InternalCategory[]>([]);
  const [internalSubcategories, setInternalSubcategories] = useState<Map<string, InternalSubcategory[]>>(new Map());
  const [previewLocale, setPreviewLocale] = useState<Locale>("es");
  const [isLoading, setIsLoading] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [calculatingPriceForIndex, setCalculatingPriceForIndex] = useState<number | null>(null);
  const [productBasePrice, setProductBasePrice] = useState<number | null>(null);
  const [productBasePriceUSD, setProductBasePriceUSD] = useState<number | null>(null);
  const [productBaseGrams, setProductBaseGrams] = useState<number | null>(null);
  const [exchangeRate, setExchangeRate] = useState<number>(18.00); // Tasa de cambio por defecto (18 MXN = 1 USD)
  const [subcategoryBasePrice, setSubcategoryBasePrice] = useState<number | null>(null);
  const [loadingBasePrice, setLoadingBasePrice] = useState(false);

  const defaultData: ProductFormData = {
    name: { es: "", en: "" },
    description: { es: "", en: "" },
    material: { es: "", en: "" },
    category_id: "",
    internal_category_id: undefined,
    internal_subcategory_id: undefined,
    price: 0,
    stock: 0, // Ya no se usa, pero se mantiene para compatibilidad
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

  // Cargar categorías y tasa de cambio
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await getCategoriesForAdmin();
        setCategories(cats);
      } catch (error) {
        console.error("Error loading categories:", error);
        toast.error("Error al cargar categorías", {
          description: "No se pudieron cargar las categorías de productos. Por favor recarga la página."
        });
      }
    };
    loadCategories();

    // Cargar tasa de cambio
    const loadExchangeRate = async () => {
      try {
        const settings = await getStoreSettings();
        if (settings?.exchange_rate) {
          setExchangeRate(settings.exchange_rate);
        }
      } catch (error) {
        console.error("Error loading exchange rate:", error);
        toast.warning("Error al cargar tasa de cambio", {
          description: "Se usará una tasa de cambio predeterminada. Los precios en USD podrían no ser exactos."
        });
      }
    };
    loadExchangeRate();
  }, []);

  // Cargar categorías internas y sus subcategorías
  useEffect(() => {
    const loadInternalCategories = async () => {
      try {
        const cats = await getAllInternalCategories();
        const activeCats = cats.filter(cat => cat.is_active);
        setInternalCategories(activeCats);

        // Cargar subcategorías para cada categoría
        const subcategoriesMap = new Map<string, InternalSubcategory[]>();
        for (const cat of activeCats) {
          try {
            const subs = await getInternalSubcategories(cat.id);
            subcategoriesMap.set(cat.id, subs.filter(sub => sub.is_active));
          } catch (error) {
            console.error(`Error loading subcategories for category ${cat.id}:`, error);
            toast.warning("Error al cargar subcategorías", {
              description: `No se pudieron cargar las subcategorías de ${cat.name}. Algunas opciones podrían no estar disponibles.`
            });
            subcategoriesMap.set(cat.id, []);
          }
        }
        setInternalSubcategories(subcategoriesMap);
      } catch (error) {
        console.error("Error loading internal categories:", error);
        toast.error("Error al cargar categorías internas", {
          description: "No se pudieron cargar las categorías internas para cálculo de precios. Por favor recarga la página."
        });
      }
    };
    loadInternalCategories();
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
          toast.error("Producto no encontrado", {
            description: "No se pudo encontrar el producto solicitado. Verifica el ID e intenta de nuevo."
          });
          setIsLoading(false);
          return;
        }

        // Cargar los datos del producto en el formulario
        updateField("name", { es: product.name_es || "", en: product.name_en || "" });
        updateField("description", { es: product.description_es || "", en: product.description_en || "" });
        updateField("material", { es: product.material_es || "", en: product.material_en || "" });
        updateField("category_id", product.category_id || "");
        updateField("price", 0); // Ya no se usa, pero se mantiene para compatibilidad
        updateField("is_active", product.is_active);

        // Cargar base_price, base_price_usd y base_grams del producto
        setProductBasePrice(product.base_price ?? null);
        setProductBasePriceUSD(product.base_price_usd ?? null);
        setProductBaseGrams(product.base_grams ?? null);

        // Cargar categoría y subcategoría interna del producto (solo la primera)
        try {
          const { categories: productCategories, subcategories: productSubcategories } =
            await getProductInternalCategoriesAndSubcategories(productId);
          const internalCategoryId = productCategories.length > 0 ? productCategories[0].id : undefined;
          const internalSubcategoryId = productSubcategories.length > 0 ? productSubcategories[0].id : undefined;
          updateField("internal_category_id", internalCategoryId);
          updateField("internal_subcategory_id", internalSubcategoryId);
        } catch (error) {
          console.error("Error loading product internal categories:", error);
          toast.warning("Error al cargar categorías internas del producto", {
            description: "No se pudieron cargar las categorías internas. Puedes seleccionarlas manualmente."
          });
          updateField("internal_category_id", undefined);
          updateField("internal_subcategory_id", undefined);
        }

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
          const sortedSizes = [...product.sizes].sort((a: { display_order?: number }, b: { display_order?: number }) => {
            const orderA = a.display_order ?? 999;
            const orderB = b.display_order ?? 999;
            return orderA - orderB;
          });
          updateField("sizes", sortedSizes.map((size: {
            size: string;
            price?: number;
            price_usd?: number | null;
            stock: number;
            weight?: number;
            display_order?: number;
          }, index: number) => ({
            size: size.size,
            price: size.price || product.price || 0,
            price_usd: size.price_usd ?? null, // Cargar precio USD si existe
            stock: size.stock,
            weight: size.weight,
            display_order: size.display_order ?? index
          })));
        }

      } catch (error) {
        console.error("Error loading product:", error);
        toast.error("Error al cargar el producto", {
          description: "No se pudo cargar la información del producto. Por favor recarga la página e intenta de nuevo."
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProduct();
  }, [productId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Calcular el precio base de la subcategoría seleccionada
  useEffect(() => {
    const calculateBasePrice = async () => {
      // Solo calcular si hay categoría y subcategoría interna seleccionadas
      if (!formData.internal_category_id || !formData.internal_subcategory_id) {
        setSubcategoryBasePrice(null);
        return;
      }

      // Obtener el nombre de la categoría interna
      const selectedCategory = internalCategories.find(cat => cat.id === formData.internal_category_id);
      if (!selectedCategory) {
        setSubcategoryBasePrice(null);
        return;
      }

      setLoadingBasePrice(true);

      try {
        // Calcular el precio base de la subcategoría (usando 1 gramo o 1 pieza como base)
        const basePrice = await calculateDynamicProductPrice({
          goldGrams: 1,
          subcategoryId: formData.internal_subcategory_id,
          categoryName: selectedCategory.name!,
        });

        setSubcategoryBasePrice(basePrice);
      } catch (error) {
        console.error("Error calculating base price:", error);
        setSubcategoryBasePrice(null);
      } finally {
        setLoadingBasePrice(false);
      }
    };

    calculateBasePrice();
  }, [formData.internal_category_id, formData.internal_subcategory_id, internalCategories]);

  // Calcular automáticamente los precios cuando cambien los gramos usando la fórmula completa
  useEffect(() => {
    // Solo calcular si hay categoría y subcategoría interna seleccionadas
    if (!formData.internal_category_id || !formData.internal_subcategory_id) {
      return;
    }

    // Obtener el nombre de la categoría interna
    const selectedCategory = internalCategories.find(cat => cat.id === formData.internal_category_id);
    if (!selectedCategory) {
      return;
    }

    // Calcular precio para cada talla que tenga gramos definidos usando la fórmula completa
    const calculatePrices = async () => {
      const newSizes = await Promise.all(
        formData.sizes.map(async (size) => {
          // Si la talla tiene gramos definidos, calcular precio usando la fórmula completa
          if (size.weight && size.weight > 0) {
            try {
              const calculatedPrice = await calculateDynamicProductPrice({
                goldGrams: size.weight,
                subcategoryId: formData.internal_subcategory_id!,
                categoryName: selectedCategory.name!,
              });

              if (calculatedPrice !== null) {
                return {
                  ...size,
                  price: calculatedPrice,
                };
              }
            } catch (error) {
              console.error("Error calculating price for size:", error);
            }
          }
          return size;
        })
      );

      // Actualizar solo si hay cambios
      const hasChanges = newSizes.some((newSize, index) => {
        const oldSize = formData.sizes[index];
        return oldSize && newSize.price !== oldSize.price;
      });

      if (hasChanges) {
        updateField("sizes", newSizes);
      }
    };

    // Solo calcular si hay tallas con gramos definidos
    const hasSizesWithWeight = formData.sizes.some(size => size.weight && size.weight > 0);
    if (hasSizesWithWeight) {
      calculatePrices();
    }
  }, [formData.internal_category_id, formData.internal_subcategory_id, formData.sizes.map(s => `${s.weight || ''}`).join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

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

      toast.success("Imagen eliminada exitosamente", {
        description: "La imagen ha sido eliminada correctamente del producto."
      });
    } catch (error) {
      console.error('Error deleting image:', error);
      if (error instanceof Error) {
        toast.error("Error al eliminar la imagen", {
          description: error.message || "No se pudo eliminar la imagen. Por favor intenta de nuevo."
        });
      } else {
        toast.error("Error al eliminar la imagen", {
          description: "Ocurrió un error inesperado al eliminar la imagen."
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validar campos requeridos
      const requiredFields: (keyof ProductFormData)[] = ["name", "description", "material"];
      if (!validateForm(requiredFields)) {
        toast.error("Campos requeridos faltantes", {
          description: "Por favor completa todos los campos requeridos (Nombre, Descripción y Material) en español."
        });
        setIsLoading(false);
        return;
      }

      // Validar que al menos haya una talla con stock
      if (!formData.sizes || formData.sizes.length === 0) {
        toast.error("Sin tallas disponibles", {
          description: "Debes agregar al menos una talla con stock disponible para el producto."
        });
        setIsLoading(false);
        return;
      }

      // Validar que las tallas tengan datos válidos
      const invalidSizes = formData.sizes.filter(size => !size.size || size.stock < 0 || !size.price || size.price <= 0);
      if (invalidSizes.length > 0) {
        toast.error("Tallas con datos inválidos", {
          description: "Todas las tallas deben tener un nombre, stock válido (0 o mayor) y precio mayor a 0."
        });
        setIsLoading(false);
        return;
      }

      // Validar categoría
      if (!formData.category_id) {
        toast.warning("Categoría no seleccionada", {
          description: "Se recomienda seleccionar una categoría para el producto."
        });
      }

      const productData = {
        name: formData.name,
        description: formData.description,
        material: formData.material,
        category_id: formData.category_id,
        price: 0, // Ya no se usa, pero se mantiene para compatibilidad
        stock: 0, // Ya no se usa, pero se mantiene para compatibilidad
        is_active: formData.is_active,
        available_languages: formData.available_languages,
        specifications: formData.specifications.map(spec => ({
          spec_key: spec.spec_key,
          spec_value: spec.spec_value,
          display_order: spec.display_order
        })),
        sizes: formData.sizes.map((size, index) => ({
          size: size.size,
          stock: size.stock,
          price: size.price,
          price_usd: size.price_usd ?? null,
          weight: size.weight || undefined,
          display_order: size.display_order ?? index
        })),
        base_price_usd: productBasePriceUSD ?? (productBasePrice && exchangeRate > 0 ? Math.round((productBasePrice / exchangeRate) * 100) / 100 : null),
        images: formData.images
      };

      // Validar que productId sea un UUID válido si existe
      let savedProductId: string;
      if (productId && productId.trim() !== "") {
        try {
          await updateProduct(productId, productData);
          savedProductId = productId;
          toast.success("Producto actualizado exitosamente", {
            description: `El producto "${formData.name.es}" ha sido actualizado correctamente.`
          });
        } catch (updateError) {
          console.error("Error updating product:", updateError);
          if (updateError instanceof Error) {
            toast.error("Error al actualizar el producto", {
              description: updateError.message || "No se pudo actualizar el producto. Por favor verifica los datos e intenta de nuevo."
            });
          } else {
            toast.error("Error al actualizar el producto", {
              description: "Ocurrió un error inesperado al actualizar el producto."
            });
          }
          setIsLoading(false);
          return;
        }
      } else {
        try {
          const newProduct = await createProduct(productData);
          savedProductId = newProduct.id;
          toast.success("Producto creado exitosamente", {
            description: `El producto "${formData.name.es}" ha sido creado correctamente.`
          });
        } catch (createError) {
          console.error("Error creating product:", createError);
          if (createError instanceof Error) {
            toast.error("Error al crear el producto", {
              description: createError.message || "No se pudo crear el producto. Por favor verifica los datos e intenta de nuevo."
            });
          } else {
            toast.error("Error al crear el producto", {
              description: "Ocurrió un error inesperado al crear el producto."
            });
          }
          setIsLoading(false);
          return;
        }
      }

      // Guardar categoría y subcategoría interna (solo una de cada una)
      try {
        const internalCategoryIds = formData.internal_category_id ? [formData.internal_category_id] : [];
        const internalSubcategoryIds = formData.internal_subcategory_id ? [formData.internal_subcategory_id] : [];
        await updateProductInternalCategoriesAndSubcategories(
          savedProductId,
          internalCategoryIds,
          internalSubcategoryIds
        );
      } catch (categoryError) {
        console.error("Error updating internal categories:", categoryError);
        toast.warning("Categorías internas no guardadas", {
          description: "El producto se guardó correctamente, pero hubo un error al asignar las categorías internas."
        });
      }

      onSuccess?.();
    } catch (error) {
      console.error("Error saving product:", error);
      if (error instanceof Error) {
        toast.error("Error al guardar el producto", {
          description: error.message || "Ocurrió un error inesperado. Por favor intenta de nuevo."
        });
      } else {
        toast.error("Error al guardar el producto", {
          description: "Ocurrió un error inesperado al guardar el producto."
        });
      }
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
    const maxOrder = formData.sizes.length > 0
      ? Math.max(...formData.sizes.map(s => s.display_order ?? 0))
      : -1;
    const newSize = {
      size: "",
      stock: 0,
      price: 0, // Precio inicial en 0, se debe especificar por talla
      weight: undefined, // Gramos iniciales en undefined
      display_order: maxOrder + 1
    };
    updateField("sizes", [...formData.sizes, newSize]);
  };

  const removeSize = (index: number) => {
    const newSizes = formData.sizes.filter((_, i) => i !== index);
    // Reordenar display_order después de eliminar
    const reorderedSizes = newSizes.map((size, i) => ({
      ...size,
      display_order: i
    }));
    updateField("sizes", reorderedSizes);
  };

  const updateSize = (index: number, field: "size" | "stock" | "price" | "price_usd" | "weight", value: string | number | null | undefined) => {
    const newSizes = [...formData.sizes];
    const updatedSize = { ...newSizes[index], [field]: value };
    
    // Si se actualiza el precio MXN y no hay precio USD manual, calcular automáticamente
    if (field === "price" && typeof value === "number" && value > 0) {
      // Solo calcular automáticamente si no hay un precio USD ya establecido manualmente
      // Conversión: precio_mxn / tasa_mxn (ej: 180 MXN / 18 = 10 USD)
      if (updatedSize.price_usd === null || updatedSize.price_usd === undefined) {
        updatedSize.price_usd = exchangeRate > 0 ? Math.round((value / exchangeRate) * 100) / 100 : null;
      }
    }
    
    newSizes[index] = updatedSize;
    updateField("sizes", newSizes);
  };

  const calculatePriceForSize = async (index: number) => {
    // Validar que haya categoría y subcategoría interna seleccionadas
    if (!formData.internal_category_id || !formData.internal_subcategory_id) {
      alert("Por favor selecciona una categoría interna y subcategoría interna primero.");
      return;
    }

    const size = formData.sizes[index];
    
    // Obtener el nombre de la categoría interna
    const selectedCategory = internalCategories.find(cat => cat.id === formData.internal_category_id);
    if (!selectedCategory) {
      alert("No se encontró la categoría interna seleccionada.");
      return;
    }

    // Determinar el nombre del campo según la categoría
    const isBroquel = selectedCategory.name?.toLowerCase() === "broquel";
    const fieldName = isBroquel ? "piezas" : "gramos";
    
    // Validar que la talla tenga gramos/piezas definidos
    if (!size.weight || size.weight <= 0) {
      toast.warning("Datos incompletos", {
        description: `Por favor ingresa las ${fieldName} para esta talla primero.`
      });
      return;
    }

    setCalculatingPriceForIndex(index);

    try {
      // Siempre calcular usando la fórmula completa
      const calculatedPrice = await calculateDynamicProductPrice({
        goldGrams: size.weight,
        subcategoryId: formData.internal_subcategory_id,
        categoryName: selectedCategory.name,
      });

      if (calculatedPrice !== null) {
        // Actualizar precio MXN y calcular automáticamente el USD
        const newSizes = [...formData.sizes];
        newSizes[index] = {
          ...newSizes[index],
          price: calculatedPrice,
          price_usd: newSizes[index].price_usd ?? (exchangeRate > 0 ? Math.round((calculatedPrice / exchangeRate) * 100) / 100 : null)
        };
        updateField("sizes", newSizes);
        toast.success("Precio calculado", {
          description: `El precio ha sido calculado exitosamente: $${calculatedPrice.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
        });
      } else {
        toast.error("Error en configuración", {
          description: "No se pudo calcular el precio. Por favor verifica la configuración de la subcategoría."
        });
      }
    } catch (error) {
      console.error("Error calculating price:", error);
      if (error instanceof Error) {
        toast.error("Error al calcular el precio", {
          description: error.message || "Ocurrió un error al calcular el precio. Por favor intenta de nuevo."
        });
      } else {
        toast.error("Error al calcular el precio", {
          description: "Ocurrió un error inesperado. Por favor intenta de nuevo."
        });
      }
    } finally {
      setCalculatingPriceForIndex(null);
    }
  };

  const moveSize = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === formData.sizes.length - 1) return;

    const newSizes = [...formData.sizes];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    
    // Intercambiar posiciones
    [newSizes[index], newSizes[targetIndex]] = [newSizes[targetIndex], newSizes[index]];
    
    // Actualizar display_order
    newSizes.forEach((size, i) => {
      size.display_order = i;
    });
    
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
          </div>

          {/* Categorías Internas y Subcategorías */}
          <div className="space-y-3 mt-4">
            <Label htmlFor="internal_categories">{t('productForm.internalCategories') || 'Categorías Internas'}</Label>
            <p className="text-sm text-muted-foreground">
              {t('productForm.internalCategoriesDescription') || 'Selecciona una categoría interna y una subcategoría para este producto (solo uso administrativo)'}
            </p>
            <div className="space-y-4 mt-2">
              <RadioGroup
                value={formData.internal_category_id || ""}
                onValueChange={(value) => {
                  updateField("internal_category_id", value || undefined);
                  // Si se cambia la categoría, limpiar la subcategoría seleccionada
                  updateField("internal_subcategory_id", undefined);
                }}
                className="space-y-3"
              >
                {internalCategories.map((category) => {
                  const subcategories = internalSubcategories.get(category.id) || [];
                  const hasSubcategories = subcategories.length > 0;
                  const isCategorySelected = formData.internal_category_id === category.id;

                  return (
                    <div key={category.id} className="border rounded-lg p-3 space-y-2">
                      {/* Categoría Principal */}
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value={category.id}
                          id={`internal-category-${category.id}`}
                        />
                        <Label
                          htmlFor={`internal-category-${category.id}`}
                          className="text-sm font-medium cursor-pointer flex items-center gap-2"
                        >
                          {category.color && (
                            <div
                              className="w-4 h-4 rounded border border-border"
                              style={{ backgroundColor: category.color }}
                            />
                          )}
                          {category.name}
                        </Label>
                      </div>

                      {/* Subcategorías */}
                      {hasSubcategories && isCategorySelected && (
                        <div className="ml-6 space-y-2 border-l-2 pl-4">
                          <RadioGroup
                            value={formData.internal_subcategory_id || ""}
                            onValueChange={(value) => {
                              updateField("internal_subcategory_id", value || undefined);
                            }}
                            className="space-y-2"
                          >
                            {subcategories.map((subcategory) => (
                              <div key={subcategory.id} className="flex items-center space-x-2">
                                <RadioGroupItem
                                  value={subcategory.id}
                                  id={`internal-subcategory-${subcategory.id}`}
                                />
                                <Label
                                  htmlFor={`internal-subcategory-${subcategory.id}`}
                                  className="text-sm font-normal cursor-pointer flex items-center gap-2"
                                >
                                  {subcategory.color && (
                                    <div
                                      className="w-3 h-3 rounded border border-border"
                                      style={{ backgroundColor: subcategory.color }}
                                    />
                                  )}
                                  <span>
                                    {subcategory.special_code ? (
                                      <>
                                        <span className="font-medium">{subcategory.special_code}</span>
                                        <span className="text-muted-foreground"> - {subcategory.name}</span>
                                      </>
                                    ) : (
                                      subcategory.name
                                    )}
                                  </span>
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>
                        </div>
                      )}
                    </div>
                  );
                })}
              </RadioGroup>
              {internalCategories.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  {t('productForm.noInternalCategories') || 'No hay categorías internas disponibles'}
                </p>
              )}
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
            productName={formData.name[previewLocale] || 'Product'}
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
          {/* Mostrar precio base de la subcategoría */}
          {formData.internal_subcategory_id && subcategoryBasePrice !== null && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-medium text-blue-900">
                {loadingBasePrice ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Calculando precio base...
                  </span>
                ) : (
                  <>
                    <>
                      <span className="text-blue-700">💰 Precio base:</span>{' '}
                      <span className="font-bold text-[#D4AF37]">
                        {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(subcategoryBasePrice)}
                      </span>
                    </>
                  </>
                )}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                {(() => {
                  const selectedCategory = internalCategories.find(cat => cat.id === formData.internal_category_id);
                  const isBroquel = selectedCategory?.name?.toLowerCase() === "broquel";
                  return isBroquel
                    ? "Los precios de las tallas se calcularán proporcionalmente según las piezas"
                    : "Los precios de las tallas se calcularán proporcionalmente según sus gramos";
                })()}
              </p>
            </div>
          )}
          <div className="space-y-4">
            {formData.sizes.map((size, index) => (
              <div key={index} className="flex items-end gap-4 border rounded-lg p-4">
                {/* Botones de reordenamiento */}
                <div className="flex flex-col gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => moveSize(index, "up")}
                    disabled={index === 0}
                    className="h-8 w-8 p-0"
                    title="Mover arriba"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => moveSize(index, "down")}
                    disabled={index === formData.sizes.length - 1}
                    className="h-8 w-8 p-0"
                    title="Mover abajo"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </Button>
                </div>

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
                  <div className="flex gap-2">
                    <Input
                      id={`price-${index}`}
                      type="number"
                      value={size.price}
                      onChange={(e) => updateSize(index, "price", parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      step="0.01"
                      className="flex-1"
                      disabled
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => calculatePriceForSize(index)}
                      disabled={calculatingPriceForIndex === index || !formData.internal_category_id || !formData.internal_subcategory_id || !size.weight}
                      className="h-10 px-3"
                      title="Calcular precio usando la calculadora"
                    >
                      {calculatingPriceForIndex === index ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Calculator className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="flex-1">
                  <Label htmlFor={`price-usd-${index}`} className="mb-2 block">
                    Precio (USD) 
                    <span className="text-xs text-muted-foreground ml-1">(auto)</span>
                  </Label>
                  <Input
                    id={`price-usd-${index}`}
                    type="number"
                    value={size.price_usd ?? (size.price > 0 && exchangeRate > 0 ? Math.round((size.price / exchangeRate) * 100) / 100 : '')}
                    onChange={(e) => {
                      const value = e.target.value === '' ? null : parseFloat(e.target.value);
                      updateSize(index, "price_usd", value);
                    }}
                    placeholder="0.00"
                    step="0.01"
                    className="flex-1"
                    disabled
                    title="Se calcula automáticamente desde MXN."
                  />
                </div>
                <div className="flex-1">
                  {(() => {
                    // Determinar el label según la categoría interna seleccionada
                    const selectedCategory = internalCategories.find(cat => cat.id === formData.internal_category_id);
                    const isBroquel = selectedCategory?.name?.toLowerCase() === "broquel";
                    const label = isBroquel ? "Piezas" : t('productForm.grams');
                    const placeholder = isBroquel ? "1.0" : "0.000";
                    const step = isBroquel ? "0.01" : "0.001";
                    
                    return (
                      <>
                        <Label htmlFor={`grams-${index}`} className="mb-2 block">{label}</Label>
                        <Input
                          id={`grams-${index}`}
                          type="number"
                          step={step}
                          min="0"
                          value={size.weight !== undefined ? size.weight : ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === "" || value === null) {
                              updateSize(index, "weight", undefined);
                            } else {
                              const parsed = parseFloat(value);
                              updateSize(index, "weight", isNaN(parsed) ? undefined : parsed);
                            }
                          }}
                          placeholder={placeholder}
                        />
                      </>
                    );
                  })()}
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
                  className="h-10 w-10 p-0"
                  title="Eliminar talla"
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
