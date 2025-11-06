"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Upload, X, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  getProductById,
  getCategories,
  updateProduct,
  deleteProductImages,
  addProductImages,
  updateProductImage,
  deleteProductSpecifications,
  addProductSpecifications,
  deleteProductSizes,
  addProductSizes,
} from "@/lib/supabase/products";
import type { ProductDetail, ProductCategory } from "@/types/product";

interface ExistingImage {
  id: string;
  url: string;
  isPrimary: boolean;
  displayOrder: number;
  toDelete: boolean;
}

interface NewImage {
  file: File;
  preview: string;
  isPrimary: boolean;
}

interface Specification {
  key: string;
  value: string;
}

interface ProductPageProps {
  params: {
    id: string;
  };
}

export default function EditProduct({ params }: ProductPageProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [categories, setCategories] = useState<ProductCategory[]>([]);

  // Product basic info
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [material, setMaterial] = useState("");
  const [weight, setWeight] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Images
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
  const [newImages, setNewImages] = useState<NewImage[]>([]);

  // Specifications
  const [specifications, setSpecifications] = useState<Specification[]>([]);

  // Sizes
  const [sizes, setSizes] = useState<string[]>([]);
  const [newSize, setNewSize] = useState("");

  useEffect(() => {
    loadProduct();
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const loadProduct = async () => {
    setIsLoading(true);
    const productData = await getProductById(params.id);

    if (!productData) {
      alert("Producto no encontrado");
      router.push("/admin/productos");
      return;
    }

    setProduct(productData);

    // Set basic info
    setName(productData.name);
    setDescription(productData.description);
    setCategoryId(productData.category_id || "");
    setPrice(productData.price.toString());
    setStock(productData.stock.toString());
    setMaterial(productData.material);
    setWeight(productData.weight?.toString() || "");
    setIsActive(productData.is_active);

    // Set images
    const sortedImages = productData.images.sort((a, b) => {
      if (a.is_primary) return -1;
      if (b.is_primary) return 1;
      return a.display_order - b.display_order;
    });
    setExistingImages(
      sortedImages.map((img, index) => ({
        id: img.id,
        url: img.image_url,
        isPrimary: img.is_primary,
        displayOrder: index,
        toDelete: false,
      }))
    );

    // Set specifications
    const sortedSpecs = productData.specifications.sort(
      (a, b) => a.display_order - b.display_order
    );
    setSpecifications(
      sortedSpecs.length > 0
        ? sortedSpecs.map((spec) => ({
            key: spec.spec_key,
            value: spec.spec_value,
          }))
        : [{ key: "", value: "" }]
    );

    // Set sizes
    setSizes(productData.sizes.map((s) => s.size));

    setIsLoading(false);
  };

  const loadCategories = async () => {
    const categoriesData = await getCategories();
    setCategories(categoriesData);
  };

  const handleNewImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const totalImages = existingImages.filter((img) => !img.toDelete).length + newImages.length;
    const isFirstImage = totalImages === 0;

    const uploadedImages: NewImage[] = Array.from(files).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      isPrimary: isFirstImage && newImages.length === 0,
    }));

    setNewImages([...newImages, ...uploadedImages]);
  };

  const markExistingImageForDeletion = (index: number) => {
    const updated = [...existingImages];
    updated[index].toDelete = true;

    // If we're deleting the primary image, make another one primary
    if (updated[index].isPrimary) {
      const firstAvailable = updated.find((img) => !img.toDelete);
      if (firstAvailable) {
        firstAvailable.isPrimary = true;
      } else if (newImages.length > 0) {
        const updatedNew = [...newImages];
        updatedNew[0].isPrimary = true;
        setNewImages(updatedNew);
      }
    }

    setExistingImages(updated);
  };

  const removeNewImage = (index: number) => {
    const updated = [...newImages];
    URL.revokeObjectURL(updated[index].preview);
    updated.splice(index, 1);

    // If we removed the primary new image, make another one primary
    const wasPrimary = newImages[index].isPrimary;
    if (wasPrimary && updated.length > 0) {
      updated[0].isPrimary = true;
    } else if (wasPrimary && existingImages.some((img) => !img.toDelete)) {
      const updatedExisting = [...existingImages];
      const firstAvailable = updatedExisting.find((img) => !img.toDelete);
      if (firstAvailable) {
        firstAvailable.isPrimary = true;
        setExistingImages(updatedExisting);
      }
    }

    setNewImages(updated);
  };

  const setPrimaryExistingImage = (index: number) => {
    const updatedExisting = existingImages.map((img, i) => ({
      ...img,
      isPrimary: i === index,
    }));
    setExistingImages(updatedExisting);

    const updatedNew = newImages.map((img) => ({
      ...img,
      isPrimary: false,
    }));
    setNewImages(updatedNew);
  };

  const setPrimaryNewImage = (index: number) => {
    const updatedNew = newImages.map((img, i) => ({
      ...img,
      isPrimary: i === index,
    }));
    setNewImages(updatedNew);

    const updatedExisting = existingImages.map((img) => ({
      ...img,
      isPrimary: false,
    }));
    setExistingImages(updatedExisting);
  };

  const addSpecification = () => {
    setSpecifications([...specifications, { key: "", value: "" }]);
  };

  const updateSpecification = (
    index: number,
    field: "key" | "value",
    value: string
  ) => {
    const updated = [...specifications];
    updated[index][field] = value;
    setSpecifications(updated);
  };

  const removeSpecification = (index: number) => {
    const updated = [...specifications];
    updated.splice(index, 1);
    setSpecifications(updated);
  };

  const addNewSize = () => {
    if (newSize && !sizes.includes(newSize)) {
      setSizes([...sizes, newSize]);
      setNewSize("");
    }
  };

  const removeSize = (size: string) => {
    setSizes(sizes.filter((s) => s !== size));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // 1. Update product basic info
      await updateProduct(params.id, {
        name,
        description,
        category_id: categoryId || null,
        price: parseFloat(price),
        stock: parseInt(stock),
        material,
        weight: weight ? parseFloat(weight) : null,
        has_engraving: false,
        is_active: isActive,
      });

      // 2. Handle images
      // Delete marked images
      const imagesToDelete = existingImages
        .filter((img) => img.toDelete)
        .map((img) => img.id);
      if (imagesToDelete.length > 0) {
        await deleteProductImages(imagesToDelete);
      }

      // Update existing images (primary status and display order)
      const remainingExisting = existingImages.filter((img) => !img.toDelete);
      for (let i = 0; i < remainingExisting.length; i++) {
        await updateProductImage(remainingExisting[i].id, {
          is_primary: remainingExisting[i].isPrimary,
          display_order: i,
        });
      }

      // Upload new images
      if (newImages.length > 0) {
        const startOrder = remainingExisting.length;
        await addProductImages(
          params.id,
          newImages.map((img, index) => ({
            file: img.file,
            isPrimary: img.isPrimary,
            displayOrder: startOrder + index,
          }))
        );
      }

      // 3. Update specifications
      await deleteProductSpecifications(params.id);
      const validSpecs = specifications.filter(
        (spec) => spec.key && spec.value
      );
      if (validSpecs.length > 0) {
        await addProductSpecifications(
          params.id,
          validSpecs.map((spec, index) => ({
            key: spec.key,
            value: spec.value,
            displayOrder: index,
          }))
        );
      }

      // 4. Update sizes
      await deleteProductSizes(params.id);
      if (sizes.length > 0) {
        await addProductSizes(
          params.id,
          sizes.map((size) => ({
            size,
            stock: parseInt(stock), // Use same stock for all sizes
          }))
        );
      }

      // Success! Redirect
      router.push("/admin/productos");
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Error al actualizar el producto. Por favor intenta de nuevo.");
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

  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Producto no encontrado</p>
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
          Volver
        </Button>
        <h1 className="text-3xl font-bold text-foreground">Editar Producto</h1>
        <p className="mt-2 text-muted-foreground">
          Actualiza la información del producto
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="rounded-lg bg-card border border-border p-6">
          <h2 className="text-xl font-semibold mb-4">Información Básica</h2>
          <div className="space-y-4">
            <div className="space-y-3">
              <Label htmlFor="name">
                Nombre del Producto <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="description">
                Descripción <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label htmlFor="category">Categoría</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label htmlFor="material">
                  Material <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="material"
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-3">
                <Label htmlFor="price">
                  Precio (MXN) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="stock">
                  Stock <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="weight">Peso (gramos)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.01"
                  min="0"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="isActive" className="font-normal">
                  Producto activo
                </Label>
              </div>
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="rounded-lg bg-card border border-border p-6">
          <h2 className="text-xl font-semibold mb-4">Imágenes</h2>

          <div className="space-y-4">
            {/* Existing Images */}
            {existingImages.some((img) => !img.toDelete) && (
              <div>
                <Label>Imágenes Actuales</Label>
                <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {existingImages.map((image, index) => (
                    !image.toDelete && (
                      <div key={image.id} className="relative group h-32">
                        <Image
                          src={image.url}
                          alt={`Imagen ${index + 1}`}
                          fill
                          className="object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => markExistingImageForDeletion(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setPrimaryExistingImage(index)}
                          className={`absolute bottom-2 left-2 text-xs px-2 py-1 rounded z-10 ${
                            image.isPrimary
                              ? "bg-[#D4AF37] text-white"
                              : "bg-white text-gray-700 opacity-0 group-hover:opacity-100"
                          } transition-opacity`}
                        >
                          {image.isPrimary ? "Principal" : "Hacer principal"}
                        </button>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}

            {/* New Images */}
            {newImages.length > 0 && (
              <div>
                <Label>Imágenes Nuevas</Label>
                <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {newImages.map((image, index) => (
                    <div key={index} className="relative group h-32">
                      <Image
                        src={image.preview}
                        alt={`Nueva ${index + 1}`}
                        fill
                        className="object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setPrimaryNewImage(index)}
                        className={`absolute bottom-2 left-2 text-xs px-2 py-1 rounded z-10 ${
                          image.isPrimary
                            ? "bg-[#D4AF37] text-white"
                            : "bg-white text-gray-700 opacity-0 group-hover:opacity-100"
                        } transition-opacity`}
                      >
                        {image.isPrimary ? "Principal" : "Hacer principal"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload */}
            <div>
              <Label htmlFor="images">Agregar Más Imágenes</Label>
              <div className="mt-2">
                <label
                  htmlFor="images"
                  className="flex items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-[#D4AF37] transition-colors"
                >
                  <div className="text-center">
                    <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Haz clic para subir imágenes
                    </p>
                  </div>
                  <input
                    id="images"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleNewImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Specifications */}
        <div className="rounded-lg bg-card border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Especificaciones</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addSpecification}
            >
              <Plus className="mr-2 h-4 w-4" />
              Agregar
            </Button>
          </div>

          <div className="space-y-3">
            {specifications.map((spec, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder="Nombre"
                  value={spec.key}
                  onChange={(e) =>
                    updateSpecification(index, "key", e.target.value)
                  }
                  className="flex-1"
                />
                <Input
                  placeholder="Valor"
                  value={spec.value}
                  onChange={(e) =>
                    updateSpecification(index, "value", e.target.value)
                  }
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeSpecification(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Sizes */}
        <div className="rounded-lg bg-card border border-border p-6">
          <h2 className="text-xl font-semibold mb-4">
            Tallas/Tamaños (Opcional)
          </h2>

          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Ej: 7, M, Grande"
                value={newSize}
                onChange={(e) => setNewSize(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addNewSize();
                  }
                }}
              />
              <Button type="button" onClick={addNewSize}>
                Agregar
              </Button>
            </div>

            {sizes.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <div
                    key={size}
                    className="flex items-center gap-2 bg-muted px-3 py-1 rounded-full"
                  >
                    <span className="text-sm">{size}</span>
                    <button
                      type="button"
                      onClick={() => removeSize(size)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="bg-[#D4AF37] hover:bg-[#B8941E] text-white"
            disabled={isSaving}
          >
            {isSaving ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </form>
    </div>
  );
}
