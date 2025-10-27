"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

const ProductGallery = ({ images, productName }: ProductGalleryProps) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  // Si no hay imágenes, mostrar placeholder
  if (!images || images.length === 0) {
    return (
      <div className="space-y-4">
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <div className="text-6xl mb-4">📷</div>
            <p className="text-lg font-medium">Imagen no disponible</p>
            <p className="text-sm">Próximamente</p>
          </div>
        </div>
      </div>
    );
  }

  // Filtrar imágenes que han fallado
  const validImages = images.filter((_, index) => !imageErrors.has(index));
  
  // Si todas las imágenes han fallado, mostrar placeholder
  if (validImages.length === 0) {
    return (
      <div className="space-y-4">
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <div className="text-6xl mb-4">📷</div>
            <p className="text-lg font-medium">Imagen no disponible</p>
            <p className="text-sm">Error al cargar la imagen</p>
          </div>
        </div>
      </div>
    );
  }

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % validImages.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + validImages.length) % validImages.length);
  };

  const handleImageError = (index: number) => {
    setImageErrors(prev => new Set([...prev, index]));
  };

  return (
    <div className="space-y-4">
      {/* Imagen principal */}
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted">
        <Image
          src={validImages[selectedImage]}
          alt={`${productName} - Vista ${selectedImage + 1}`}
          fill
          className="object-cover"
          priority
          onError={() => handleImageError(selectedImage)}
        />

        {/* Botones de navegación */}
        {validImages.length > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white"
              onClick={prevImage}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white"
              onClick={nextImage}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </>
        )}

        {/* Indicador de imagen */}
        {validImages.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {validImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`h-2 w-2 rounded-full transition-all duration-300 ${
                  index === selectedImage
                    ? "bg-[#D4AF37] w-6"
                    : "bg-white/60 hover:bg-white/80"
                }`}
                aria-label={`Ver imagen ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Miniaturas */}
      {validImages.length > 1 && (
        <div className="grid grid-cols-4 gap-4">
          {validImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={`relative aspect-square overflow-hidden rounded-lg transition-all duration-300 ${
                index === selectedImage
                  ? "ring-2 ring-[#D4AF37] ring-offset-2"
                  : "opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={image}
                alt={`${productName} - Miniatura ${index + 1}`}
                fill
                className="object-cover"
                onError={() => handleImageError(index)}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGallery;
