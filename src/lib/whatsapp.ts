/**
 * Utilidades para números de WhatsApp.
 */

/** Solo dígitos; a un número mexicano de 10 dígitos le antepone la lada 52. */
export function normalizeWhatsAppNumber(raw: string | null | undefined): string {
  const digits = (raw ?? "").replace(/\D/g, "");
  if (!digits) return "";
  return digits.length === 10 ? `52${digits}` : digits;
}

/** Enlace para abrir el chat (wa.me). Devuelve null si el número está vacío. */
export function getWhatsAppHref(raw: string | null | undefined, text?: string): string | null {
  const number = normalizeWhatsAppNumber(raw);
  if (!number) return null;
  const query = text ? `?text=${encodeURIComponent(text)}` : "";
  return `https://wa.me/${number}${query}`;
}
