"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Star, GripVertical } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface ExistingImage {
  id?: string;
  image_url: string;
  alt_text?: { es: string; en: string };
  display_order: number;
  is_primary: boolean;
}

interface ExistingImageWithId extends Omit<ExistingImage, 'id'> {
  id: string;
}

interface ProductImagesManagerProps {
  existingImages: ExistingImage[];
  newImages: File[];
  onExistingImagesChange: (images: ExistingImage[]) => void;
  onNewImagesChange: (images: File[]) => void;
  onDeleteImage: (imageId: string, index: number) => void;
}

function SortableImageItem({
  image,
  index,
  onDelete,
  onSetPrimary,
}: {
  image: ExistingImageWithId;
  index: number;
  onDelete: () => void;
  onSetPrimary: () => void;
}) {
  const t = useTranslations("admin");

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative border-2 rounded-lg p-2 bg-white hover:border-[#D4AF37] transition-colors"
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 cursor-grab active:cursor-grabbing bg-black/50 rounded p-1 hover:bg-black/70 transition-colors z-10"
      >
        <GripVertical className="w-4 h-4 text-white" />
      </div>

      {/* Imagen */}
      <img
        src={image.image_url}
        alt={`Imagen ${index + 1}`}
        className="w-full h-40 object-cover rounded"
      />

      {/* Botones de acción */}
      <div className="absolute top-2 right-2 flex gap-1">
        <Button
          type="button"
          variant={image.is_primary ? "default" : "secondary"}
          size="sm"
          className={`${
            image.is_primary
              ? "bg-[#D4AF37] hover:bg-[#B8941E]"
              : "bg-white/90 hover:bg-white"
          }`}
          onClick={onSetPrimary}
          title={t('productForm.setPrimaryImage') || 'Establecer como principal'}
        >
          <Star
            className={`w-4 h-4 ${
              image.is_primary ? "fill-white" : "fill-none"
            }`}
          />
        </Button>

        <Button
          type="button"
          variant="destructive"
          size="sm"
          className="bg-red-500 hover:bg-red-600"
          onClick={onDelete}
          title={t('productForm.deleteImage') || 'Eliminar imagen'}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Badge de imagen principal */}
      {image.is_primary && (
        <div className="absolute bottom-2 left-2 bg-[#D4AF37] text-white text-xs px-2 py-1 rounded font-medium">
          {t('productForm.primaryImage') || 'Principal'}
        </div>
      )}

      {/* Número de orden */}
      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
        #{index + 1}
      </div>
    </div>
  );
}

export function ProductImagesManager({
  existingImages,
  newImages,
  onExistingImagesChange,
  onNewImagesChange,
  onDeleteImage,
}: ProductImagesManagerProps) {
  const t = useTranslations("admin");

  // Ensure all images have valid IDs for DnD
  const imagesWithIds: ExistingImageWithId[] = existingImages.map((img, index) => ({
    ...img,
    id: img.id || `temp-${index}-${img.image_url.slice(-20)}`,
  }));

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = imagesWithIds.findIndex((img) => img.id === active.id);
      const newIndex = imagesWithIds.findIndex((img) => img.id === over.id);

      const reorderedImages = arrayMove(imagesWithIds, oldIndex, newIndex).map(
        (img, index) => ({
          ...img,
          display_order: index,
        })
      );

      onExistingImagesChange(reorderedImages);
    }
  };

  const handleSetPrimary = (imageId: string) => {
    const updatedImages = imagesWithIds.map((img) => ({
      ...img,
      is_primary: img.id === imageId,
    }));
    onExistingImagesChange(updatedImages);
  };

  const handleDeleteExistingImage = (imageId: string, index: number) => {
    onDeleteImage(imageId, index);
  };

  return (
    <div className="space-y-6">
      {/* Subir nuevas imágenes */}
      <div>
        <Label htmlFor="images">{t('productForm.uploadImages') || 'Subir Imágenes'}</Label>
        <Input
          id="images"
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            onNewImagesChange([...newImages, ...files]);
          }}
          className="mt-2"
        />
        <p className="text-sm text-muted-foreground mt-1">
          {t('productForm.imagesHint') || 'Puedes subir múltiples imágenes. La primera será la principal por defecto.'}
        </p>
      </div>

      {/* Preview de nuevas imágenes */}
      {newImages.length > 0 && (
        <div>
          <h4 className="font-medium mb-3 text-sm text-muted-foreground">
            {t('productForm.newImages') || 'Nuevas Imágenes'} ({newImages.length})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {newImages.map((file, index) => (
              <div key={index} className="relative border rounded-lg p-2">
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Nueva ${index + 1}`}
                  className="w-full h-32 object-cover rounded"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-1 right-1"
                  onClick={() => {
                    const filtered = newImages.filter((_, i) => i !== index);
                    onNewImagesChange(filtered);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
                <p className="text-xs text-center mt-1 truncate">{file.name}</p>
                {index === 0 && newImages.length > 0 && existingImages.length === 0 && (
                  <div className="absolute bottom-1 left-1 bg-[#D4AF37] text-white text-xs px-2 py-1 rounded">
                    {t('productForm.willBePrimary') || 'Será principal'}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Imágenes existentes con drag and drop */}
      {imagesWithIds.length > 0 && (
        <div>
          <h4 className="font-medium mb-3">
            {t('productForm.existingImages') || 'Imágenes Actuales'} ({imagesWithIds.length})
          </h4>
          <p className="text-sm text-muted-foreground mb-4">
            {t('productForm.dragToReorder') || 'Arrastra para reordenar. Haz clic en la estrella para establecer como imagen principal.'}
          </p>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={imagesWithIds.map((img) => img.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {imagesWithIds.map((image, index) => (
                  <SortableImageItem
                    key={image.id}
                    image={image}
                    index={index}
                    onDelete={() => handleDeleteExistingImage(image.id, index)}
                    onSetPrimary={() => handleSetPrimary(image.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  );
}
