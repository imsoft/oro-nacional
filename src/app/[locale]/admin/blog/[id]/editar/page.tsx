"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/i18n/routing";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, Upload, X, Loader2 } from "lucide-react";
import { Link } from "@/i18n/routing";
import {
  getBlogPostById,
  getBlogCategories,
  updateBlogPost,
} from "@/lib/supabase/blog";
import { useAuthStore } from "@/stores/auth-store";
import type { BlogCategory, BlogPostDetail } from "@/types/blog";

export default function EditPostPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  // Form state
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [tags, setTags] = useState<string>("");
  const [availableLanguages, setAvailableLanguages] = useState<string[]>(["es", "en"]);
  const [currentFeaturedImage, setCurrentFeaturedImage] = useState<string | null>(null);
  const [newFeaturedImage, setNewFeaturedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Data state
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [post, setPost] = useState<BlogPostDetail | null>(null);

  // Cargar post y categorías
  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [postData, categoriesData] = await Promise.all([
        getBlogPostById(params.id),
        getBlogCategories(),
      ]);

      if (!postData) {
        alert("Post no encontrado");
        router.push("/admin/blog");
        return;
      }

      // Llenar el formulario con los datos del post
      setPost(postData);
      setTitle(postData.title);
      setExcerpt(postData.excerpt || "");
      setContent(postData.content);
      setCategoryId(postData.category_id || "");
      setStatus(postData.status);
      setAvailableLanguages(postData.available_languages || ["es", "en"]);
      setCurrentFeaturedImage(postData.featured_image || null);
      setTags(postData.tags?.map((tag) => tag.name).join(", ") || "");
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error loading post:", error);
      alert("Error al cargar el post");
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar cambio de imagen
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewFeaturedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Eliminar imagen nueva
  const handleRemoveNewImage = () => {
    setNewFeaturedImage(null);
    setImagePreview(null);
  };

  // Eliminar imagen actual
  const handleRemoveCurrentImage = () => {
    setCurrentFeaturedImage(null);
  };

  // Enviar formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert("Debes iniciar sesión para editar un post");
      return;
    }

    if (!title.trim()) {
      alert("El título es obligatorio");
      return;
    }

    if (!content.trim()) {
      alert("El contenido es obligatorio");
      return;
    }

    setIsSaving(true);

    try {
      const updates = {
        title: title.trim(),
        excerpt: excerpt.trim() || undefined,
        content: content.trim(),
        featured_image: newFeaturedImage || undefined,
        category_id: categoryId || undefined,
        status,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t.length > 0),
        available_languages: availableLanguages,
      };

      const result = await updateBlogPost(params.id, updates);

      if (result) {
        alert("Post actualizado exitosamente");
        router.push("/admin/blog");
      } else {
        alert("Error al actualizar el post. Por favor intenta de nuevo.");
      }
    } catch (error) {
      console.error("Error updating post:", error);
      alert("Error al actualizar el post. Por favor intenta de nuevo.");
    } finally {
      setIsSaving(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Post no encontrado</p>
        <Link href="/admin/blog" className="text-[#D4AF37] hover:underline mt-4 inline-block">
          Volver al blog
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/blog"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al Blog
        </Link>
        <h1 className="text-3xl font-bold text-foreground">Editar Post</h1>
        <p className="mt-2 text-muted-foreground">
          Modifica la información de tu publicación
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Información Básica */}
        <div className="rounded-lg bg-card border border-border p-6 space-y-6">
          <h2 className="text-xl font-semibold text-foreground">
            Información Básica
          </h2>

          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Título <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Cómo cuidar tus joyas de oro"
              required
            />
          </div>

          {/* Extracto */}
          <div className="space-y-2">
            <Label htmlFor="excerpt">Extracto</Label>
            <Textarea
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Un breve resumen del post (opcional)"
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Este texto se mostrará en las tarjetas de vista previa
            </p>
          </div>

          {/* Contenido */}
          <div className="space-y-2">
            <Label htmlFor="content">
              Contenido <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escribe el contenido completo de tu post aquí..."
              rows={15}
              required
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Puedes usar Markdown para dar formato al contenido
            </p>
          </div>
        </div>

        {/* Categoría y Etiquetas */}
        <div className="rounded-lg bg-card border border-border p-6 space-y-6">
          <h2 className="text-xl font-semibold text-foreground">
            Clasificación
          </h2>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Categoría */}
            <div className="space-y-2">
              <Label htmlFor="category">Categoría</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sin categoría</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Etiquetas */}
            <div className="space-y-2">
              <Label htmlFor="tags">Etiquetas</Label>
              <Input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="oro, cuidados, limpieza"
              />
              <p className="text-xs text-muted-foreground">
                Separa las etiquetas con comas
              </p>
            </div>
          </div>
        </div>

        {/* Imagen Destacada */}
        <div className="rounded-lg bg-card border border-border p-6 space-y-6">
          <h2 className="text-xl font-semibold text-foreground">
            Imagen Destacada
          </h2>

          {/* Imagen actual */}
          {currentFeaturedImage && !imagePreview && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Imagen actual:</p>
              <div className="relative rounded-lg overflow-hidden border border-border h-64">
                <Image
                  src={currentFeaturedImage}
                  alt="Current featured"
                  fill
                  className="object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 z-10"
                  onClick={handleRemoveCurrentImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Puedes mantener esta imagen o subir una nueva
              </p>
            </div>
          )}

          {/* Nueva imagen o upload */}
          {!imagePreview && !currentFeaturedImage && (
            <div className="space-y-4">
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="featured-image"
                  className="flex flex-col items-center justify-center w-full h-64 border-2 border-border border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-10 h-10 mb-3 text-muted-foreground" />
                    <p className="mb-2 text-sm text-muted-foreground">
                      <span className="font-semibold">Click para subir</span> o
                      arrastra y suelta
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG, WEBP (MAX. 5MB)
                    </p>
                  </div>
                  <input
                    id="featured-image"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
            </div>
          )}

          {/* Preview de nueva imagen */}
          {imagePreview && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Nueva imagen:</p>
              <div className="relative rounded-lg overflow-hidden border border-border h-64">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 z-10"
                  onClick={handleRemoveNewImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Estado de Publicación */}
        <div className="rounded-lg bg-card border border-border p-6 space-y-6">
          <h2 className="text-xl font-semibold text-foreground">
            Publicación
          </h2>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select
                value={status}
                onValueChange={(value) => setStatus(value as "draft" | "published")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Borrador</SelectItem>
                  <SelectItem value="published">Publicado</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Los borradores no aparecerán en el blog público
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="available_languages">Idiomas Disponibles</Label>
              <Select
                value={availableLanguages.join(",")}
                onValueChange={(value) => {
                  const languages = value === "both" ? ["es", "en"] : value === "es" ? ["es"] : ["en"];
                  setAvailableLanguages(languages);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona idiomas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="both">Ambos idiomas (ES/EN)</SelectItem>
                  <SelectItem value="es">Solo Español</SelectItem>
                  <SelectItem value="en">Solo Inglés</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                El post se mostrará solo en los idiomas seleccionados
              </p>
            </div>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex items-center justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/blog")}
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="bg-[#D4AF37] hover:bg-[#B8941E] text-white"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-5 w-5" />
                Guardar Cambios
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
