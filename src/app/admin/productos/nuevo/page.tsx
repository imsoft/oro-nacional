"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, X, Plus } from "lucide-react";
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
import { supabase } from "@/lib/supabase/client";

interface ProductImage {
  file: File;
  preview: string;
  isPrimary: boolean;
}

interface Specification {
  key: string;
  value: string;
}

export default function NuevoProducto() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Product basic info
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [material, setMaterial] = useState("");
  const [weight, setWeight] = useState("");
  const [hasEngraving, setHasEngraving] = useState(false);

  // Images
  const [images, setImages] = useState<ProductImage[]>([]);

  // Specifications
  const [specifications, setSpecifications] = useState<Specification[]>([
    { key: "", value: "" },
  ]);

  // Sizes
  const [sizes, setSizes] = useState<string[]>([]);
  const [newSize, setNewSize] = useState("");

  // Categories (mock data - will be fetched from DB)
  const categories = [
    { id: "1", name: "Anillos" },
    { id: "2", name: "Collares" },
    { id: "3", name: "Aretes" },
    { id: "4", name: "Pulseras" },
    { id: "5", name: "Dijes" },
    { id: "6", name: "Relojes" },
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: ProductImage[] = Array.from(files).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      isPrimary: images.length === 0, // First image is primary
    }));

    setImages([...images, ...newImages]);
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    URL.revokeObjectURL(newImages[index].preview);
    newImages.splice(index, 1);

    // If we removed the primary image, make the first one primary
    if (newImages.length > 0 && !newImages.some((img) => img.isPrimary)) {
      newImages[0].isPrimary = true;
    }

    setImages(newImages);
  };

  const setPrimaryImage = (index: number) => {
    const newImages = images.map((img, i) => ({
      ...img,
      isPrimary: i === index,
    }));
    setImages(newImages);
  };

  const addSpecification = () => {
    setSpecifications([...specifications, { key: "", value: "" }]);
  };

  const updateSpecification = (
    index: number,
    field: "key" | "value",
    value: string
  ) => {
    const newSpecs = [...specifications];
    newSpecs[index][field] = value;
    setSpecifications(newSpecs);
  };

  const removeSpecification = (index: number) => {
    const newSpecs = [...specifications];
    newSpecs.splice(index, 1);
    setSpecifications(newSpecs);
  };

  const addSize = () => {
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
    setIsLoading(true);

    try {
      // 1. Create slug from name
      const slug = name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      // 2. Insert product
      const { data: product, error: productError } = await supabase
        .from("products")
        .insert({
          name,
          slug,
          description,
          category_id: categoryId || null,
          price: parseFloat(price),
          stock: parseInt(stock),
          material,
          weight: weight ? parseFloat(weight) : null,
          has_engraving: hasEngraving,
          is_active: true,
        })
        .select()
        .single();

      if (productError) throw productError;

      // 3. Upload images and create image records
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        const fileExt = image.file.name.split(".").pop();
        const fileName = `${product.id}/${Date.now()}-${i}.${fileExt}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(fileName, image.file);

        if (uploadError) throw uploadError;

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from("product-images").getPublicUrl(fileName);

        // Create image record
        const { error: imageError } = await supabase
          .from("product_images")
          .insert({
            product_id: product.id,
            image_url: publicUrl,
            alt_text: name,
            display_order: i,
            is_primary: image.isPrimary,
          });

        if (imageError) throw imageError;
      }

      // 4. Insert specifications
      const validSpecs = specifications.filter(
        (spec) => spec.key && spec.value
      );
      if (validSpecs.length > 0) {
        const { error: specsError } = await supabase
          .from("product_specifications")
          .insert(
            validSpecs.map((spec, index) => ({
              product_id: product.id,
              spec_key: spec.key,
              spec_value: spec.value,
              display_order: index,
            }))
          );

        if (specsError) throw specsError;
      }

      // 5. Insert sizes
      if (sizes.length > 0) {
        const { error: sizesError } = await supabase
          .from("product_sizes")
          .insert(
            sizes.map((size) => ({
              product_id: product.id,
              size,
              stock: parseInt(stock), // Initially same stock for all sizes
            }))
          );

        if (sizesError) throw sizesError;
      }

      // Success! Redirect to products page
      router.push("/admin/productos");
    } catch (error) {
      console.error("Error creating product:", error);
      alert("Error al crear el producto. Por favor intenta de nuevo.");
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
          Volver
        </Button>
        <h1 className="text-3xl font-bold text-foreground">Nuevo Producto</h1>
        <p className="mt-2 text-muted-foreground">
          Agrega un nuevo producto a tu catálogo
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="rounded-lg bg-card border border-border p-6">
          <h2 className="text-xl font-semibold mb-4">Información Básica</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">
                Nombre del Producto <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Anillo de Compromiso Esmeralda"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">
                Descripción <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe el producto en detalle..."
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
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

              <div>
                <Label htmlFor="material">
                  Material <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="material"
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  placeholder="Ej: Oro 14k"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
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
                  placeholder="12500.00"
                  required
                />
              </div>

              <div>
                <Label htmlFor="stock">
                  Stock <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="10"
                  required
                />
              </div>

              <div>
                <Label htmlFor="weight">Peso (gramos)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.01"
                  min="0"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="3.5"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="hasEngraving"
                checked={hasEngraving}
                onChange={(e) => setHasEngraving(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="hasEngraving" className="font-normal">
                Permite grabado personalizado
              </Label>
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="rounded-lg bg-card border border-border p-6">
          <h2 className="text-xl font-semibold mb-4">Imágenes</h2>

          <div className="space-y-4">
            <div>
              <Label htmlFor="images">Subir Imágenes</Label>
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
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image.preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPrimaryImage(index)}
                      className={`absolute bottom-2 left-2 text-xs px-2 py-1 rounded ${
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
            )}
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
                  placeholder="Nombre (Ej: Material)"
                  value={spec.key}
                  onChange={(e) =>
                    updateSpecification(index, "key", e.target.value)
                  }
                  className="flex-1"
                />
                <Input
                  placeholder="Valor (Ej: Oro 14k)"
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
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSize();
                  }
                }}
              />
              <Button type="button" onClick={addSize}>
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
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="bg-[#D4AF37] hover:bg-[#B8941E] text-white"
            disabled={isLoading}
          >
            {isLoading ? "Creando..." : "Crear Producto"}
          </Button>
        </div>
      </form>
    </div>
  );
}
