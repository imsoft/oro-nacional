// Lee la plantilla llenada (y el ZIP de imágenes) y la convierte en productos
// listos para crear, con errores y avisos por producto.
import {
  COLUMNS,
  IMAGE_EXTENSIONS,
  MAX_IMAGES_PER_PRODUCT,
  MAX_IMPORT_ROWS,
  PRODUCTS_SHEET,
  normalizeName,
  type ColumnKey,
} from './columns';

export interface ImportLookups {
  categories: Array<{ id: string; name: string }>;
  internalCategories: Array<{ id: string; name: string }>;
  internalSubcategories: Array<{ id: string; name: string; internalCategoryId: string }>;
  existingProductNames: Set<string>;
}

export interface ParsedSize {
  row: number;
  size: string;
  weight: number | null;
  priceMxn: number | null;
  priceUsd: number | null;
  stock: number;
}

export interface ParsedProduct {
  key: string;
  firstRow: number;
  nameEs: string;
  nameEn: string;
  descriptionEs: string;
  descriptionEn: string;
  materialEs: string;
  materialEn: string;
  categoryId: string | null;
  categoryName: string;
  internalCategoryId: string | null;
  internalCategoryName: string;
  internalSubcategoryId: string | null;
  specifications: Array<{ key: string; value: string }>;
  images: File[];
  active: boolean;
  sizes: ParsedSize[];
  errors: string[];
  warnings: string[];
}

export interface ParseResult {
  products: ParsedProduct[];
  /** Errores que impiden leer el archivo completo. */
  fileErrors: string[];
}

type RowValues = Partial<Record<ColumnKey, string>>;

const toNumber = (raw: string | undefined): number | null | 'invalid' => {
  if (raw === undefined || raw.trim() === '') return null;
  const cleaned = raw.replace(/[$,\s]/g, '');
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : 'invalid';
};

const yesNo = (raw: string | undefined): boolean | 'invalid' => {
  if (!raw || raw.trim() === '') return true;
  const v = normalizeName(raw);
  if (['si', 'sí', 's', 'yes', 'y', '1', 'true', 'activo'].includes(v)) return true;
  if (['no', 'n', '0', 'false', 'inactivo'].includes(v)) return false;
  return 'invalid';
};

const imageMime = (name: string) => {
  const ext = name.split('.').pop()?.toLowerCase();
  return ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
};

/** Lee el ZIP de imágenes: nombre de archivo (sin carpeta, normalizado) → File. */
async function readImagesZip(zipFile: File | null): Promise<{ images: Map<string, File>; error?: string }> {
  const images = new Map<string, File>();
  if (!zipFile) return { images };
  try {
    const JSZip = (await import('jszip')).default;
    const zip = await JSZip.loadAsync(await zipFile.arrayBuffer());
    const entries = Object.values(zip.files).filter((entry) => !entry.dir);
    for (const entry of entries) {
      const base = entry.name.split('/').pop() || '';
      if (!base || base.startsWith('.') || entry.name.includes('__MACOSX')) continue;
      const ext = base.split('.').pop()?.toLowerCase() || '';
      if (!IMAGE_EXTENSIONS.includes(ext)) continue;
      const blob = await entry.async('blob');
      images.set(base.toLowerCase(), new File([blob], base, { type: imageMime(base) }));
    }
    return { images };
  } catch {
    return { images, error: 'No se pudo abrir el archivo ZIP de imágenes. Verifica que sea un .zip válido.' };
  }
}

export async function parseProductImport(
  excelFile: File,
  zipFile: File | null,
  lookups: ImportLookups
): Promise<ParseResult> {
  const fileErrors: string[] = [];
  const ExcelJS = (await import('exceljs')).default;
  const workbook = new ExcelJS.Workbook();

  try {
    await workbook.xlsx.load(await excelFile.arrayBuffer());
  } catch {
    return { products: [], fileErrors: ['No se pudo leer el archivo. Usa la plantilla en formato .xlsx.'] };
  }

  const sheet = workbook.getWorksheet(PRODUCTS_SHEET) ?? workbook.worksheets.find((ws) => ws.state === 'visible');
  if (!sheet) {
    return { products: [], fileErrors: [`No se encontró la hoja "${PRODUCTS_SHEET}".`] };
  }

  // Ubicar columnas por encabezado (tolera columnas reordenadas y el "*")
  const headerMap = new Map<number, ColumnKey>();
  sheet.getRow(1).eachCell((cell, colNumber) => {
    const text = normalizeName(cell.text.replace('*', ''));
    const col = COLUMNS.find((c) => normalizeName(c.header) === text);
    if (col) headerMap.set(colNumber, col.key);
  });
  const missing = COLUMNS.filter((c) => c.required && ![...headerMap.values()].includes(c.key));
  if (missing.length > 0) {
    return {
      products: [],
      fileErrors: [`Faltan columnas obligatorias: ${missing.map((c) => c.header).join(', ')}. Descarga la plantilla de nuevo.`],
    };
  }

  // Leer filas con datos
  const rows: Array<{ row: number; values: RowValues }> = [];
  sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) return;
    const values: RowValues = {};
    headerMap.forEach((key, colNumber) => {
      const text = row.getCell(colNumber).text?.trim() ?? '';
      if (text) values[key] = text;
    });
    if (Object.keys(values).length > 0) rows.push({ row: rowNumber, values });
  });

  if (rows.length === 0) {
    return { products: [], fileErrors: ['La hoja "Productos" no tiene filas con datos.'] };
  }
  if (rows.length > MAX_IMPORT_ROWS) {
    fileErrors.push(`El archivo tiene ${rows.length} filas; el máximo por importación es ${MAX_IMPORT_ROWS}. Divide el archivo.`);
    return { products: [], fileErrors };
  }

  const { images: zipImages, error: zipError } = await readImagesZip(zipFile);
  if (zipError) fileErrors.push(zipError);

  const categoryByName = new Map(lookups.categories.map((c) => [normalizeName(c.name), c]));
  const internalByName = new Map(lookups.internalCategories.map((c) => [normalizeName(c.name), c]));

  // Agrupar por clave conservando el orden del archivo
  const groups = new Map<string, Array<{ row: number; values: RowValues }>>();
  const rowsWithoutKey: number[] = [];
  for (const entry of rows) {
    const key = entry.values.key?.trim();
    if (!key) {
      rowsWithoutKey.push(entry.row);
      continue;
    }
    const normalized = key.toUpperCase();
    if (!groups.has(normalized)) groups.set(normalized, []);
    groups.get(normalized)!.push(entry);
  }
  if (rowsWithoutKey.length > 0) {
    fileErrors.push(`Filas sin Clave (se ignoran): ${rowsWithoutKey.slice(0, 15).join(', ')}${rowsWithoutKey.length > 15 ? '…' : ''}.`);
  }

  const products: ParsedProduct[] = [];
  const namesInFile = new Map<string, string>();

  for (const [key, groupRows] of groups) {
    const first = groupRows[0];
    const v = first.values;
    const errors: string[] = [];
    const warnings: string[] = [];

    const nameEs = v.nameEs ?? '';
    const materialEs = v.materialEs ?? '';
    if (!nameEs) errors.push('Falta el nombre en español.');
    if (!materialEs) errors.push('Falta el material.');

    // Categoría pública
    const categoryName = v.category ?? '';
    const category = categoryName ? categoryByName.get(normalizeName(categoryName)) : undefined;
    if (!categoryName) errors.push('Falta la categoría.');
    else if (!category) errors.push(`La categoría "${categoryName}" no existe en la tienda.`);

    // Categoría y subcategoría interna
    const internalName = v.internalCategory ?? '';
    const internal = internalName ? internalByName.get(normalizeName(internalName)) : undefined;
    if (internalName && !internal) errors.push(`La categoría interna "${internalName}" no existe.`);
    const subName = v.internalSubcategory ?? '';
    let subcategoryId: string | null = null;
    if (subName) {
      if (!internal) {
        errors.push('Indica la categoría interna de la subcategoría.');
      } else {
        const sub = lookups.internalSubcategories.find(
          (s) => s.internalCategoryId === internal.id && normalizeName(s.name) === normalizeName(subName)
        );
        if (sub) subcategoryId = sub.id;
        else errors.push(`La subcategoría "${subName}" no pertenece a "${internal.name}".`);
      }
    }

    // Activo
    const active = yesNo(v.active);
    if (active === 'invalid') errors.push(`"Activo" debe ser Sí o No (se encontró "${v.active}").`);

    // Especificaciones "clave: valor; clave: valor"
    const specifications: Array<{ key: string; value: string }> = [];
    if (v.specifications) {
      for (const part of v.specifications.split(';')) {
        const trimmed = part.trim();
        if (!trimmed) continue;
        const idx = trimmed.indexOf(':');
        if (idx <= 0) {
          warnings.push(`Especificación sin formato "nombre: valor": "${trimmed}" (se ignora).`);
          continue;
        }
        specifications.push({ key: trimmed.slice(0, idx).trim(), value: trimmed.slice(idx + 1).trim() });
      }
    }

    // Imágenes desde el ZIP
    const images: File[] = [];
    if (v.images) {
      const names = v.images.split(/[,;\n]/).map((n) => n.trim()).filter(Boolean);
      if (names.length > MAX_IMAGES_PER_PRODUCT) {
        warnings.push(`Tiene ${names.length} imágenes; solo se suben las primeras ${MAX_IMAGES_PER_PRODUCT}.`);
      }
      for (const name of names.slice(0, MAX_IMAGES_PER_PRODUCT)) {
        const file = zipImages.get(name.split('/').pop()!.toLowerCase());
        if (file) images.push(file);
        else if (!zipFile) errors.push(`La imagen "${name}" requiere subir el ZIP de imágenes.`);
        else errors.push(`La imagen "${name}" no está en el ZIP.`);
      }
    } else {
      warnings.push('Sin imágenes: se mostrará la imagen genérica hasta que agregues fotos.');
    }

    // Tallas (una por fila)
    const sizes: ParsedSize[] = [];
    const seenSizes = new Set<string>();
    groupRows.forEach((entry, index) => {
      const r = entry.values;
      if (index > 0) {
        // Datos de producto repetidos con valor distinto en filas posteriores
        const conflicting = COLUMNS.filter(
          (c) => c.level === 'product' && c.key !== 'key' && r[c.key] && v[c.key] && r[c.key] !== v[c.key]
        );
        if (conflicting.length > 0) {
          warnings.push(`Fila ${entry.row}: ${conflicting.map((c) => c.header).join(', ')} se toma de la fila ${first.row}.`);
        }
      }

      const sizeName = r.size || (groupRows.length === 1 ? 'Única' : '');
      if (!sizeName) {
        errors.push(`Fila ${entry.row}: falta la talla (el producto tiene varias filas).`);
        return;
      }
      if (seenSizes.has(normalizeName(sizeName))) {
        errors.push(`Fila ${entry.row}: la talla "${sizeName}" está repetida.`);
        return;
      }
      seenSizes.add(normalizeName(sizeName));

      const weight = toNumber(r.weight);
      const priceMxn = toNumber(r.priceMxn);
      const priceUsd = toNumber(r.priceUsd);
      const stock = toNumber(r.stock);
      if (weight === 'invalid' || (typeof weight === 'number' && weight < 0)) errors.push(`Fila ${entry.row}: "Gramos o piezas" no es un número válido.`);
      if (priceMxn === 'invalid' || (typeof priceMxn === 'number' && priceMxn < 0)) errors.push(`Fila ${entry.row}: "Precio MXN" no es un número válido.`);
      if (priceUsd === 'invalid' || (typeof priceUsd === 'number' && priceUsd < 0)) errors.push(`Fila ${entry.row}: "Precio USD" no es un número válido.`);
      if (stock === 'invalid' || (typeof stock === 'number' && (stock < 0 || !Number.isInteger(stock)))) errors.push(`Fila ${entry.row}: "Existencias" debe ser un número entero (0 o más).`);

      const numOrNull = (n: number | null | 'invalid') => (typeof n === 'number' && n > 0 ? n : null);
      const finalPrice = numOrNull(priceMxn);
      const finalWeight = numOrNull(weight);
      if (!finalPrice && !(subcategoryId && finalWeight)) {
        errors.push(`Fila ${entry.row}: sin precio. Escribe el precio MXN o indica categoría interna, subcategoría y gramos para calcularlo.`);
      }

      sizes.push({
        row: entry.row,
        size: sizeName,
        weight: finalWeight,
        priceMxn: finalPrice,
        priceUsd: numOrNull(priceUsd),
        stock: typeof stock === 'number' && stock >= 0 ? Math.floor(stock) : 1,
      });
    });

    // Duplicados
    const normalizedName = normalizeName(nameEs);
    if (normalizedName && lookups.existingProductNames.has(normalizedName)) {
      warnings.push('Ya existe un producto con este nombre en la tienda; se creará otro.');
    }
    if (normalizedName && namesInFile.has(normalizedName)) {
      warnings.push(`Mismo nombre que la clave ${namesInFile.get(normalizedName)} del archivo.`);
    } else if (normalizedName) {
      namesInFile.set(normalizedName, key);
    }

    products.push({
      key,
      firstRow: first.row,
      nameEs,
      nameEn: v.nameEn ?? '',
      descriptionEs: v.descriptionEs ?? '',
      descriptionEn: v.descriptionEn ?? '',
      materialEs,
      materialEn: v.materialEn ?? '',
      categoryId: category?.id ?? null,
      categoryName: category?.name.trim() ?? categoryName,
      internalCategoryId: internal?.id ?? null,
      internalCategoryName: internal?.name ?? '',
      internalSubcategoryId: subcategoryId,
      specifications,
      images,
      active: active === true,
      sizes,
      errors,
      warnings,
    });
  }

  if (zipFile && zipImages.size === 0 && !zipError) {
    fileErrors.push('El ZIP no contiene imágenes .jpg, .png o .webp.');
  }

  return { products, fileErrors };
}
