"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";
import { Globe, CheckCircle, AlertCircle } from "lucide-react";
import type { MultilingualFormData, Locale } from "@/types/multilingual";

interface MultilingualInputProps {
  label: string;
  value: MultilingualFormData;
  onChange: (value: MultilingualFormData) => void;
  placeholder?: MultilingualFormData;
  type?: "text" | "textarea";
  required?: boolean;
  className?: string;
}

export function MultilingualInput({
  label,
  value,
  onChange,
  placeholder = { es: "", en: "" },
  type = "text",
  required = false,
  className = ""
}: MultilingualInputProps) {
  const t = useTranslations("admin");
  const [activeTab, setActiveTab] = useState<Locale>("es");

  const handleChange = (locale: Locale, newValue: string) => {
    onChange({
      ...value,
      [locale]: newValue
    });
  };

  const isComplete = value.es.trim() !== "" && value.en.trim() !== "";
  const isPartial = value.es.trim() !== "" || value.en.trim() !== "";

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <div className="flex items-center gap-2">
          {isComplete && (
            <Badge variant="secondary" className="text-green-600 bg-green-50">
              <CheckCircle className="w-3 h-3 mr-1" />
              {t('multilingual.complete')}
            </Badge>
          )}
          {isPartial && !isComplete && (
            <Badge variant="secondary" className="text-yellow-600 bg-yellow-50">
              <AlertCircle className="w-3 h-3 mr-1" />
              {t('multilingual.partial')}
            </Badge>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as Locale)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="es" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            {t('multilingual.spanish')}
            {value.es.trim() !== "" && (
              <CheckCircle className="w-3 h-3 text-green-600" />
            )}
          </TabsTrigger>
          <TabsTrigger value="en" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            {t('multilingual.english')}
            {value.en.trim() !== "" && (
              <CheckCircle className="w-3 h-3 text-green-600" />
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="es" className="mt-2">
          {type === "textarea" ? (
            <Textarea
              value={value.es}
              onChange={(e) => handleChange("es", e.target.value)}
              placeholder={placeholder.es}
              className="min-h-[100px]"
            />
          ) : (
            <Input
              value={value.es}
              onChange={(e) => handleChange("es", e.target.value)}
              placeholder={placeholder.es}
            />
          )}
        </TabsContent>

        <TabsContent value="en" className="mt-2">
          {type === "textarea" ? (
            <Textarea
              value={value.en}
              onChange={(e) => handleChange("en", e.target.value)}
              placeholder={placeholder.en}
              className="min-h-[100px]"
            />
          ) : (
            <Input
              value={value.en}
              onChange={(e) => handleChange("en", e.target.value)}
              placeholder={placeholder.en}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface MultilingualFormProps {
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  className?: string;
}

export function MultilingualForm({ children, onSubmit, className = "" }: MultilingualFormProps) {
  return (
    <form onSubmit={onSubmit} className={`space-y-6 ${className}`}>
      {children}
    </form>
  );
}

interface MultilingualCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function MultilingualCard({ title, children, className = "" }: MultilingualCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="w-5 h-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}

interface LanguageToggleProps {
  currentLocale: Locale;
  onLocaleChange: (locale: Locale) => void;
  className?: string;
}

export function LanguageToggle({ currentLocale, onLocaleChange, className = "" }: LanguageToggleProps) {
  const t = useTranslations("admin");
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-sm text-gray-600">{t('multilingual.preview')}:</span>
      <Tabs value={currentLocale} onValueChange={(value) => onLocaleChange(value as Locale)}>
        <TabsList>
          <TabsTrigger value="es">ES</TabsTrigger>
          <TabsTrigger value="en">EN</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}

interface MultilingualPreviewProps {
  locale: Locale;
  children: React.ReactNode;
  className?: string;
}

export function MultilingualPreview({ locale, children, className = "" }: MultilingualPreviewProps) {
  const t = useTranslations("admin");
  return (
    <div className={`border rounded-lg p-4 bg-gray-50 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <Globe className="w-4 h-4" />
        <span className="text-sm font-medium">
          {t('multilingual.preview')} - {locale === "es" ? t('multilingual.spanish') : t('multilingual.english')}
        </span>
      </div>
      {children}
    </div>
  );
}

// Hook para manejar formularios multilingües
export function useMultilingualForm<T>(
  initialData: T
) {
  const t = useTranslations("admin");
  const [formData, setFormData] = useState<T>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (field: keyof T, value: MultilingualFormData | string | number | boolean | undefined) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error del campo
    if (errors[field as string]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const validateForm = (requiredFields: (keyof T)[]): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    requiredFields.forEach(field => {
      const value = formData[field] as MultilingualFormData;
      if (value && typeof value === 'object' && 'es' in value && 'en' in value) {
        if (!value.es.trim() || !value.en.trim()) {
          newErrors[field as string] = t('multilingual.required');
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const resetForm = () => {
    setFormData(initialData);
    setErrors({});
  };

  return {
    formData,
    errors,
    updateField,
    validateForm,
    resetForm,
    setFormData
  };
}
