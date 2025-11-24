"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Upload, Loader2, Trash2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  getAllHeroImages,
  replaceHeroImage,
  deleteHeroImage,
  uploadHeroImage,
  type HeroImage,
} from "@/lib/supabase/hero-images";

export default function HeroImagesAdmin() {
  const t = useTranslations('admin.hero');
  const [heroImages, setHeroImages] = useState<HeroImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<HeroImage | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadHeroImages();
  }, []);

  const loadHeroImages = async () => {
    setIsLoading(true);
    const images = await getAllHeroImages();
    setHeroImages(images);
    setIsLoading(false);
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
    heroImage?: HeroImage
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert(t('invalidFileType') || 'Por favor selecciona un archivo de imagen válido.');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert(t('fileTooLarge') || 'El archivo es demasiado grande. Máximo 5MB.');
      return;
    }

    try {
      if (heroImage) {
        // Replace existing image
        const index = heroImages.findIndex((img) => img.id === heroImage.id);
        setUploadingIndex(index);
        const updatedImage = await replaceHeroImage(heroImage.id, file);
        if (updatedImage) {
          await loadHeroImages();
        } else {
          alert(t('uploadError') || 'Error al subir la imagen. Por favor intenta de nuevo.');
        }
      } else {
        // Add new image (if less than 3)
        if (heroImages.length >= 3) {
          alert(t('maxImagesReached') || 'Ya tienes el máximo de 3 imágenes.');
          return;
        }
        setUploadingIndex(heroImages.length);
        const newImage = await uploadHeroImage(file, heroImages.length);
        if (newImage) {
          await loadHeroImages();
        } else {
          alert(t('uploadError') || 'Error al subir la imagen. Por favor intenta de nuevo.');
        }
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert(t('uploadError') || 'Error al subir la imagen. Por favor intenta de nuevo.');
    } finally {
      setUploadingIndex(null);
    }
  };

  const handleDeleteClick = (image: HeroImage) => {
    setImageToDelete(image);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!imageToDelete) return;

    setIsDeleting(true);
    try {
      const success = await deleteHeroImage(imageToDelete.id);
      if (success) {
        await loadHeroImages();
        setDeleteDialogOpen(false);
        setImageToDelete(null);
      } else {
        alert(t('deleteError') || 'Error al eliminar la imagen. Por favor intenta de nuevo.');
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      alert(t('deleteError') || 'Error al eliminar la imagen. Por favor intenta de nuevo.');
    } finally {
      setIsDeleting(false);
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground mt-2">{t('subtitle')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('imagesTitle')}</CardTitle>
          <CardDescription>{t('imagesDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Existing images */}
            {heroImages.map((image, index) => (
              <div key={image.id} className="relative group">
                <div className="aspect-video relative rounded-lg overflow-hidden border-2 border-border bg-muted">
                  <Image
                    src={image.image_url}
                    alt={`Hero image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  {uploadingIndex === index && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
                    </div>
                  )}
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{t('image')} {index + 1}</span>
                    {image.is_active && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">
                        <Check className="h-3 w-3" />
                        {t('active')}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={uploadingIndex !== null}
                      onClick={() => document.getElementById(`file-${image.id}`)?.click()}
                    >
                      <Upload className="h-4 w-4 mr-1" />
                      {t('replace')}
                    </Button>
                    <input
                      id={`file-${image.id}`}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileChange(e, image)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      disabled={uploadingIndex !== null}
                      onClick={() => handleDeleteClick(image)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {/* Add new image slot (if less than 3) */}
            {heroImages.length < 3 && (
              <div className="relative group">
                <button
                  onClick={() => document.getElementById('file-new')?.click()}
                  disabled={uploadingIndex !== null}
                  className="aspect-video w-full rounded-lg border-2 border-dashed border-border bg-muted hover:bg-muted/80 transition-colors flex flex-col items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadingIndex === heroImages.length ? (
                    <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <span className="text-sm font-medium text-muted-foreground">
                        {t('uploadNew')}
                      </span>
                    </>
                  )}
                </button>
                <input
                  id="file-new"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileChange(e)}
                />
              </div>
            )}
          </div>

          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h3 className="text-sm font-medium mb-2">{t('tips')}</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• {t('tip1')}</li>
              <li>• {t('tip2')}</li>
              <li>• {t('tip3')}</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('deleteDescription')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600 text-white"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('deleting')}
                </>
              ) : (
                t('delete')
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
