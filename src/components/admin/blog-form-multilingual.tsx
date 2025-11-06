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
import { Badge } from "@/components/ui/badge";
import { Save, Eye, Plus, X } from "lucide-react";
import { 
  MultilingualInput, 
  MultilingualForm, 
  MultilingualCard,
  LanguageToggle,
  MultilingualPreview,
  useMultilingualForm
} from "./multilingual-form";
import type { 
  BlogPostFormData, 
  MultilingualFormData, 
  Locale,
  MultilingualBlogCategory,
  MultilingualBlogTag 
} from "@/types/multilingual";
import { 
  createBlogPost, 
  updateBlogPost, 
  getBlogCategories, 
  getBlogTags 
} from "@/lib/supabase/blog-multilingual";

interface BlogPostFormProps {
  postId?: string;
  initialData?: Partial<BlogPostFormData>;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function BlogPostForm({ postId, initialData, onSuccess, onCancel }: BlogPostFormProps) {
  const t = useTranslations("admin");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [categories, setCategories] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [tags, setTags] = useState<any[]>([]);
  const [previewLocale, setPreviewLocale] = useState<Locale>("es");
  const [isLoading, setIsLoading] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const defaultData: BlogPostFormData = {
    title: { es: "", en: "" },
    excerpt: { es: "", en: "" },
    content: { es: "", en: "" },
    category_id: "",
    status: "draft",
    tags: [],
    available_languages: ['es', 'en']
  };

  const {
    formData,
    updateField,
    validateForm,
    resetForm
  } = useMultilingualForm<BlogPostFormData>(defaultData);

  // Función para actualizar campos no multilingües
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateNonMultilingualField = (field: keyof BlogPostFormData, value: any) => {
    // Esta función necesitaría acceso a setFormData, pero por ahora usamos updateField
    // TODO: Mejorar el hook para manejar campos no multilingües
  };

  // Cargar categorías y etiquetas
  useEffect(() => {
    const loadData = async () => {
      try {
        const [cats, tagList] = await Promise.all([
          getBlogCategories("es"),
          getBlogTags("es")
        ]);
        setCategories(cats);
        setTags(tagList);
        
        // Si hay datos iniciales, cargar las etiquetas seleccionadas
        if (initialData?.tags) {
          setSelectedTags(initialData.tags);
        }
      } catch (error) {
        console.error("Error loading blog data:", error);
      }
    };
    loadData();
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validar campos requeridos
      const requiredFields: (keyof BlogPostFormData)[] = ["title", "content"];
      if (!validateForm(requiredFields)) {
        setIsLoading(false);
        return;
      }

      const postData = {
        title: formData.title,
        excerpt: formData.excerpt,
        content: formData.content,
        category_id: formData.category_id || undefined,
        status: formData.status,
        tags: selectedTags,
        available_languages: formData.available_languages
      };

      if (postId) {
        await updateBlogPost(postId, postData);
      } else {
        // Para crear un nuevo post, necesitamos el author_id
        // Esto debería venir del contexto de autenticación
        const authorId = "current-user-id"; // TODO: Obtener del contexto de auth
        await createBlogPost(postData, authorId);
      }

      onSuccess?.();
    } catch (error) {
      console.error("Error saving blog post:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const addNewTag = async (name: MultilingualFormData) => {
    try {
      // TODO: Implementar creación de nueva etiqueta
      console.log("Creating new tag:", name);
    } catch (error) {
      console.error("Error creating tag:", error);
    }
  };

  if (isPreviewMode) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">{t('blog.preview')}</h2>
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
          <article className="space-y-6">
            <header>
              <h1 className="text-3xl font-bold mb-4">
                {formData.title[previewLocale] || t('blog.noTitle')}
              </h1>
              
              {formData.excerpt[previewLocale] && (
                <p className="text-lg text-gray-600 mb-4">
                  {formData.excerpt[previewLocale]}
                </p>
              )}

              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>{t('blog.statusLabel')} {formData.status === "published" ? t('blog.published') : t('blog.draft')}</span>
                {formData.category_id && (
                  <span>
                    {t('blog.categoryLabel')} {categories.find(c => c.id === formData.category_id)?.name[previewLocale]}
                  </span>
                )}
              </div>
            </header>

            <Separator />

            <div className="prose max-w-none">
              <div dangerouslySetInnerHTML={{ 
                __html: formData.content[previewLocale]?.replace(/\n/g, '<br>') || t('blog.noContent') 
              }} />
            </div>

            {selectedTags.length > 0 && (
              <div>
                <h3 className="font-medium mb-2">{t('blog.tags')}:</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedTags.map(tagId => {
                    const tag = tags.find(t => t.id === tagId);
                    return tag ? (
                      <Badge key={tagId} variant="secondary">
                        {tag.name[previewLocale]}
                      </Badge>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </article>
        </MultilingualPreview>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {postId ? t('blog.editPost') : t('blog.newPost')}
        </h2>
        <div className="flex items-center gap-2">
          <LanguageToggle 
            currentLocale={previewLocale} 
            onLocaleChange={setPreviewLocale} 
          />
          <Button
            variant="outline"
            onClick={() => setIsPreviewMode(true)}
            disabled={!formData.title.es || !formData.title.en}
          >
            <Eye className="w-4 h-4 mr-2" />
            {t('blog.preview')}
          </Button>
        </div>
      </div>

      <MultilingualForm onSubmit={handleSubmit}>
        <MultilingualCard title={t('blog.basicInfo')}>
          <div className="space-y-4">
            <MultilingualInput
              label={t('blog.postTitle')}
              value={formData.title}
              onChange={(value) => updateField("title", value)}
              placeholder={{ 
                es: "Ej: Cómo cuidar tu joyería de oro", 
                en: "Ex: How to care for your gold jewelry" 
              }}
              required
            />

            <MultilingualInput
              label={t('blog.excerpt')}
              value={formData.excerpt}
              onChange={(value) => updateField("excerpt", value)}
              placeholder={{ 
                es: "Breve descripción del contenido del post...", 
                en: "Brief description of the post content..." 
              }}
              type="textarea"
            />

            <MultilingualInput
              label={t('blog.content')}
              value={formData.content}
              onChange={(value) => updateField("content", value)}
              placeholder={{ 
                es: "Contenido completo del post...", 
                en: "Full post content..." 
              }}
              type="textarea"
              required
            />
          </div>
        </MultilingualCard>

        <MultilingualCard title={t('blog.settings')}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label htmlFor="category">{t('blog.category')}</Label>
              <Select 
                value={formData.category_id || ""} 
                onValueChange={(value) => {
                  updateField("category_id", value);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('blog.selectCategory')} />
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
              <Label htmlFor="status">{t('blog.status')}</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => {
                  updateField("status", value as 'draft' | 'published');
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">{t('blog.draft')}</SelectItem>
                  <SelectItem value="published">{t('blog.published')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label htmlFor="available_languages">{t('blog.availableLanguages')}</Label>
              <Select 
                value={formData.available_languages.join(',')} 
                onValueChange={(value) => {
                  const languages = value === 'both' ? ['es', 'en'] : value === 'es' ? ['es'] : ['en'];
                  updateField("available_languages", languages);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('blog.selectLanguages')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="both">{t('blog.bothLanguages')}</SelectItem>
                  <SelectItem value="es">{t('blog.spanishOnly')}</SelectItem>
                  <SelectItem value="en">{t('blog.englishOnly')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </MultilingualCard>

        <MultilingualCard title={t('blog.tags')}>
          <div className="space-y-4">
            <div>
              <Label>{t('blog.availableTags')}</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleTag(tag.id)}
                  >
                    {tag.name.es} / {tag.name.en}
                    {selectedTags.includes(tag.id) && (
                      <X className="w-3 h-3 ml-1" />
                    )}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label>{t('blog.selectedTags')}</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedTags.map(tagId => {
                  const tag = tags.find(t => t.id === tagId);
                  return tag ? (
                    <Badge key={tagId} variant="default">
                      {tag.name.es} / {tag.name.en}
                    </Badge>
                  ) : null;
                })}
              </div>
            </div>

            {/* TODO: Implementar creación de nuevas etiquetas */}
            <div className="border-t pt-4">
              <Label>{t('blog.createNewTag')}</Label>
              <div className="mt-2">
                <MultilingualInput
                  label={t('blog.tagName')}
                  value={{ es: "", en: "" }}
                  onChange={(value) => {
                    // TODO: Implementar creación de etiqueta
                    console.log("New tag:", value);
                  }}
                  placeholder={{ es: "Ej: Joyería", en: "Ex: Jewelry" }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    // TODO: Implementar creación de etiqueta
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t('blog.createTag')}
                </Button>
              </div>
            </div>
          </div>
        </MultilingualCard>

        <Separator />

        <div className="flex items-center justify-end gap-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              {t('common.cancel')}
            </Button>
          )}
          <Button type="submit" disabled={isLoading}>
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? t('blog.saving') : t('blog.savePost')}
          </Button>
        </div>
      </MultilingualForm>
    </div>
  );
}
