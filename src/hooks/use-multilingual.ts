"use client";

import { useLocale } from "next-intl";
import type { Locale } from "@/types/multilingual";

export function useCurrentLocale(): Locale {
  const locale = useLocale();
  return locale as Locale;
}

export function useMultilingualContent() {
  const locale = useCurrentLocale();
  
  const getLocalizedText = (text: { es: string; en: string }) => {
    return text[locale] || text.es || text.en || '';
  };

  const getLocalizedContent = (content: { es: string; en: string }) => {
    return content[locale] || content.es || content.en || '';
  };

  return {
    locale,
    getLocalizedText,
    getLocalizedContent
  };
}
