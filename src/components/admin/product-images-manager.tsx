"use client";

import { useState, useEffect } from "react";
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

interface NewImageItem {
  id: string;
  file: File;
  preview: string;
  display_order: number;
  is_primary: boolean;
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
  isNew = false,
}: {
  image: ExistingImageWithId | NewImageItem;
  index: number;
  onDelete: () => void;
  onSetPrimary: () => void;
  isNew?: boolean;
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

  const imageUrl = 'preview' in image ? image.preview : image.image_url;

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
        src={imageUrl}
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

      {/* Badge de nueva imagen */}
      {isNew && (
        <div className="absolute bottom-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
          {t('productForm.newImage') || 'Nueva'}
        </div>
      )}

      {/* Número de orden */}
      <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-black/70 text-white text-xs px-2 py-1 rounded">
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
  const [newImagesWithMetadata, setNewImagesWithMetadata] = useState<NewImageItem[]>([]);

  // Convertir File[] a NewImageItem[] con metadata
  useEffect(() => {
    const convertedImages = newImages.map((file, index) => {
      // Buscar si ya existe en el estado para preservar is_primary
      const existingItem = newImagesWithMetadata.find(
        item => item.file.name === file.name && item.file.size === file.size
      );

      return {
        id: `new-${index}-${file.name}`,
        file,
        preview: URL.createObjectURL(file),
        display_order: index,
        is_primary: existingItem?.is_primary ?? (index === 0 && existingImages.length === 0),
      };
    });

    setNewImagesWithMetadata(convertedImages);

    // Cleanup URLs cuando el componente se desmonte o las imágenes cambien
    return () => {
      convertedImages.forEach(item => URL.revokeObjectURL(item.preview));
    };
  }, [newImages, existingImages.length]);

  // Ensure all existing images have valid IDs for DnD
  const existingImagesWithIds: ExistingImageWithId[] = existingImages.map((img, index) => ({
    ...img,
    id: img.id || `temp-${index}-${img.image_url.slice(-20)}`,
  }));

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Combinar todas las imágenes para un único contexto de DnD
  const allImages = [...existingImagesWithIds, ...newImagesWithMetadata];

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = allImages.findIndex((img) => img.id === active.id);
      const newIndex = allImages.findIndex((img) => img.id === over.id);

      const reorderedImages = arrayMove(allImages, oldIndex, newIndex).map(
        (img, index) => ({
          ...img,
          display_order: index,
        })
      );

      // Separar imágenes existentes y nuevas
      const existingReordered = reorderedImages
        .filter((img): img is ExistingImageWithId => !('preview' in img))
        .map((img, index) => ({ ...img, display_order: index }));

      const newReordered = reorderedImages
        .filter((img): img is NewImageItem => 'preview' in img)
        .map((img, index) => ({ ...img, display_order: index }));

      onExistingImagesChange(existingReordered);

      // Actualizar el orden de los archivos
      const reorderedFiles = newReordered.map(item => item.file);
      onNewImagesChange(reorderedFiles);
    }
  };

  const handleSetPrimary = (imageId: string) => {
    const isNewImage = imageId.startsWith('new-');

    if (isNewImage) {
      // Actualizar nuevas imágenes
      const updatedNew = newImagesWithMetadata.map((img) => ({
        ...img,
        is_primary: img.id === imageId,
      }));
      setNewImagesWithMetadata(updatedNew);

      // Quitar primary de imágenes existentes
      if (existingImagesWithIds.length > 0) {
        const updatedExisting = existingImagesWithIds.map((img) => ({
          ...img,
          is_primary: false,
        }));
        onExistingImagesChange(updatedExisting);
      }
    } else {
      // Actualizar imágenes existentes
      const updatedExisting = existingImagesWithIds.map((img) => ({
        ...img,
        is_primary: img.id === imageId,
      }));
      onExistingImagesChange(updatedExisting);

      // Quitar primary de nuevas imágenes
      if (newImagesWithMetadata.length > 0) {
        const updatedNew = newImagesWithMetadata.map((img) => ({
          ...img,
          is_primary: false,
        }));
        setNewImagesWithMetadata(updatedNew);
      }
    }
  };

  const handleDeleteExistingImage = (imageId: string, index: number) => {
    onDeleteImage(imageId, index);
  };

  const handleDeleteNewImage = (index: number) => {
    const filtered = newImages.filter((_, i) => i !== index);
    onNewImagesChange(filtered);
  };

  const totalImages = allImages.length;

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
          {t('productForm.imagesHint') || 'Puedes subir múltiples imágenes. Arrastra para reordenar y haz clic en la estrella para establecer como principal.'}
        </p>
      </div>

      {/* Todas las imágenes con drag and drop */}
      {totalImages > 0 && (
        <div>
          <h4 className="font-medium mb-3">
            {t('productForm.allImages') || 'Todas las Imágenes'} ({totalImages})
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
              items={allImages.map((img) => img.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allImages.map((image, index) => {
                  const isNew = 'preview' in image;
                  const actualIndex = isNew
                    ? newImagesWithMetadata.findIndex(img => img.id === image.id)
                    : existingImagesWithIds.findIndex(img => img.id === image.id);

                  return (
                    <SortableImageItem
                      key={image.id}
                      image={image}
                      index={index}
                      isNew={isNew}
                      onDelete={() =>
                        isNew
                          ? handleDeleteNewImage(actualIndex)
                          : handleDeleteExistingImage(image.id, actualIndex)
                      }
                      onSetPrimary={() => handleSetPrimary(image.id)}
                    />
                  );
                })}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  );
}
