// =============================================
// Importación masiva de productos — columnas de la plantilla
// =============================================
// Una fila por talla. Las filas con la misma "Clave" forman un solo producto;
// los datos del producto (nombre, descripción, categoría, imágenes...) se
// toman de la primera fila de cada clave.

export type ColumnKey =
  | 'key'
  | 'nameEs'
  | 'nameEn'
  | 'descriptionEs'
  | 'descriptionEn'
  | 'materialEs'
  | 'materialEn'
  | 'category'
  | 'internalCategory'
  | 'internalSubcategory'
  | 'size'
  | 'weight'
  | 'priceMxn'
  | 'priceUsd'
  | 'stock'
  | 'specifications'
  | 'images'
  | 'active';

export interface ColumnDef {
  key: ColumnKey;
  header: string;
  required?: boolean;
  width: number;
  /** Explicación corta para la hoja de instrucciones. */
  help: string;
  /** Ejemplo para la hoja de instrucciones. */
  example: string;
  /** Nivel: dato del producto (primera fila) o de la talla (cada fila). */
  level: 'product' | 'size';
}

export const COLUMNS: ColumnDef[] = [
  { key: 'key', header: 'Clave', required: true, width: 12, level: 'product', example: 'BA3', help: 'Identificador del producto. Repite la misma clave en cada fila de sus tallas.' },
  { key: 'nameEs', header: 'Nombre (español)', required: true, width: 28, level: 'product', example: 'Arracada BA3', help: 'Nombre que se muestra en la tienda.' },
  { key: 'nameEn', header: 'Nombre (inglés)', width: 24, level: 'product', example: 'BA3 Hoop Earrings', help: 'Opcional. Si va vacío se usa el nombre en español.' },
  { key: 'descriptionEs', header: 'Descripción (español)', width: 40, level: 'product', example: 'Arracada de oro 10K, acabado pulido.', help: 'Opcional.' },
  { key: 'descriptionEn', header: 'Descripción (inglés)', width: 36, level: 'product', example: '10K gold hoop earrings, polished finish.', help: 'Opcional. Si va vacía se usa la de español.' },
  { key: 'materialEs', header: 'Material (español)', required: true, width: 18, level: 'product', example: 'Oro 10K', help: 'Ej. Oro 10K, Oro 14K.' },
  { key: 'materialEn', header: 'Material (inglés)', width: 16, level: 'product', example: '10K Gold', help: 'Opcional.' },
  { key: 'category', header: 'Categoría', required: true, width: 20, level: 'product', example: 'Broqueles', help: 'Elige de la lista. Es la categoría que ve el cliente en la tienda.' },
  { key: 'internalCategory', header: 'Categoría interna', width: 18, level: 'product', example: 'Broquel', help: 'Opcional. Elige de la lista (Gramo, Broquel...). Junto con la subcategoría permite calcular el precio automáticamente.' },
  { key: 'internalSubcategory', header: 'Subcategoría interna', width: 22, level: 'product', example: 'BA', help: 'Opcional. Debe pertenecer a la categoría interna elegida.' },
  { key: 'size', header: 'Talla', width: 12, level: 'size', example: '5 pares', help: 'Una fila por talla. Si el producto no tiene tallas, déjalo vacío (se guarda como "Única").' },
  { key: 'weight', header: 'Gramos o piezas', width: 14, level: 'size', example: '5', help: 'Gramos de oro (o piezas en Broquel). Se usa para calcular el precio cuando no escribes uno.' },
  { key: 'priceMxn', header: 'Precio MXN', width: 13, level: 'size', example: '', help: 'Opcional. Si va vacío se calcula con la calculadora de precios (requiere categoría interna, subcategoría y gramos).' },
  { key: 'priceUsd', header: 'Precio USD', width: 12, level: 'size', example: '', help: 'Opcional. Si va vacío se convierte desde MXN con el tipo de cambio de la tienda.' },
  { key: 'stock', header: 'Existencias', width: 12, level: 'size', example: '1', help: 'Piezas disponibles de esa talla. Si va vacío se guarda 1. Con 0 se muestra como agotado.' },
  { key: 'specifications', header: 'Especificaciones', width: 32, level: 'product', example: 'Quilates: 10K; Milímetros: 12 MM', help: 'Opcional. Pares "nombre: valor" separados por punto y coma.' },
  { key: 'images', header: 'Imágenes', width: 30, level: 'product', example: 'BA3-1.jpg, BA3-2.jpg', help: 'Nombres de archivo dentro del ZIP de imágenes, separados por coma. La primera es la principal.' },
  { key: 'active', header: 'Activo', width: 9, level: 'product', example: 'Sí', help: 'Sí o No. Si va vacío se publica (Sí).' },
];

export const PRODUCTS_SHEET = 'Productos';
export const MAX_IMPORT_ROWS = 1000;
export const MAX_IMAGES_PER_PRODUCT = 10;
export const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];

/** Normaliza texto para comparar nombres: sin acentos, minúsculas, espacios simples. */
export function normalizeName(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}
