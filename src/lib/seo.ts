import type { Metadata } from "next";

/**
 * Helpers de SEO para construir URLs localizadas.
 *
 * El routing usa `localePrefix: 'as-needed'` (ver src/i18n/routing.ts), por lo
 * que las URLs en español NO llevan prefijo (/blog) y las de inglés sí
 * (/en/blog). /es/... redirige a /..., así que nunca debe emitirse como
 * canonical, hreflang, og:url ni en el sitemap.
 */

export type SiteLocale = "es" | "en";

// Debe coincidir con `defaultLocale` de src/i18n/routing.ts
export const DEFAULT_LOCALE: SiteLocale = "es";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.oronacional.com"
).replace(/\/+$/, "");

export function toSiteLocale(locale: string | undefined | null): SiteLocale {
  return locale === "en" ? "en" : DEFAULT_LOCALE;
}

/**
 * Ruta localizada sin dominio. `path` es la ruta interna sin locale
 * ("" o "/" para el inicio, "/blog", "/product/mi-slug"...).
 */
export function localizedPath(path: string, locale: string): string {
  const clean = path === "/" ? "" : path;
  const normalized = clean && !clean.startsWith("/") ? `/${clean}` : clean;
  return toSiteLocale(locale) === DEFAULT_LOCALE
    ? normalized
    : `/${toSiteLocale(locale)}${normalized}`;
}

/** URL absoluta localizada (el inicio en español es `${SITE_URL}/`). */
export function localizedUrl(path: string, locale: string): string {
  return `${SITE_URL}${localizedPath(path, locale) || "/"}`;
}

/** Locale en formato Open Graph. */
export function ogLocale(locale: string): "es_MX" | "en_US" {
  return toSiteLocale(locale) === "en" ? "en_US" : "es_MX";
}

/** Locale en formato BCP 47 para fechas y `lang`. */
export function dateLocale(locale: string): "es-MX" | "en-US" {
  return toSiteLocale(locale) === "en" ? "en-US" : "es-MX";
}

/**
 * Construye `alternates` (canonical + hreflang + x-default) para una ruta.
 * Si la ruta difiere por idioma (p. ej. slugs traducidos) se puede pasar
 * `paths` con la ruta de cada locale.
 */
export function buildAlternates(
  path: string,
  locale: string,
  paths?: Partial<Record<SiteLocale, string>>
): NonNullable<Metadata["alternates"]> {
  const esPath = paths?.es ?? path;
  const enPath = paths?.en ?? path;
  const currentPath = toSiteLocale(locale) === "en" ? enPath : esPath;

  return {
    canonical: localizedUrl(currentPath, locale),
    languages: {
      "es-MX": localizedUrl(esPath, "es"),
      "en-US": localizedUrl(enPath, "en"),
      "x-default": localizedUrl(esPath, DEFAULT_LOCALE),
    },
  };
}
