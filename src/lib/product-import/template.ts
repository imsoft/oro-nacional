// Genera la plantilla .xlsx con listas desplegables tomadas de la plataforma.
import { COLUMNS, PRODUCTS_SHEET, MAX_IMPORT_ROWS } from './columns';

export interface TemplateLists {
  categories: string[];
  internalCategories: string[];
  internalSubcategories: Array<{ category: string; name: string }>;
}

const GOLD = 'FFD4AF37';
const DARK = 'FF1A1A1A';

const columnLetter = (index: number) => {
  let n = index + 1;
  let s = '';
  while (n > 0) {
    const m = (n - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
};

export async function buildProductTemplate(lists: TemplateLists): Promise<Blob> {
  const ExcelJS = (await import('exceljs')).default;
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Oro Nacional';
  workbook.created = new Date();

  // --- Instrucciones ---
  const help = workbook.addWorksheet('Instrucciones', { properties: { tabColor: { argb: GOLD } } });
  help.columns = [{ width: 26 }, { width: 12 }, { width: 70 }, { width: 34 }];
  help.addRow(['Plantilla de importación de productos — Oro Nacional']).font = { bold: true, size: 14 };
  help.addRow([]);
  [
    '1. Llena la hoja "Productos": una fila por talla. Repite la misma Clave en todas las tallas de un producto.',
    '2. Los datos del producto (nombre, descripción, categoría, imágenes...) se toman de la primera fila de cada Clave.',
    '3. Si no escribes precio, se calcula con la calculadora de precios (requiere categoría interna, subcategoría y gramos o piezas).',
    '4. Junta las fotos en un archivo ZIP y escribe sus nombres en la columna Imágenes.',
    '5. En el panel: Productos → Importar desde Excel. Sube el Excel y el ZIP, revisa la vista previa e importa.',
    'Consulta la hoja "Ejemplo" para ver dos productos llenos.',
  ].forEach((line) => help.addRow([line]));
  help.addRow([]);
  const headerRow = help.addRow(['Columna', 'Obligatoria', 'Qué poner', 'Ejemplo']);
  headerRow.font = { bold: true, color: { argb: DARK } };
  headerRow.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GOLD } };
  });
  COLUMNS.forEach((col) => {
    const row = help.addRow([col.header, col.required ? 'Sí' : 'No', col.help, col.example]);
    row.alignment = { wrapText: true, vertical: 'top' };
  });

  // --- Listas (oculta) para los desplegables ---
  const listSheet = workbook.addWorksheet('Listas', { state: 'veryHidden' });
  const subNames = Array.from(new Set(lists.internalSubcategories.map((s) => s.name))).sort();
  const maxLen = Math.max(lists.categories.length, lists.internalCategories.length, subNames.length, 2);
  for (let i = 0; i < maxLen; i++) {
    listSheet.addRow([
      lists.categories[i] ?? null,
      lists.internalCategories[i] ?? null,
      subNames[i] ?? null,
      i === 0 ? 'Sí' : i === 1 ? 'No' : null,
    ]);
  }
  const range = (col: string, count: number) => `Listas!$${col}$1:$${col}$${Math.max(count, 1)}`;

  // --- Productos ---
  const sheet = workbook.addWorksheet(PRODUCTS_SHEET, {
    views: [{ state: 'frozen', ySplit: 1 }],
    properties: { tabColor: { argb: GOLD } },
  });
  sheet.columns = COLUMNS.map((col) => ({
    header: col.required ? `${col.header} *` : col.header,
    key: col.key,
    width: col.width,
  }));
  const header = sheet.getRow(1);
  header.font = { bold: true, color: { argb: DARK } };
  header.alignment = { vertical: 'middle', wrapText: true };
  header.height = 32;
  header.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GOLD } };
    cell.border = { bottom: { style: 'thin', color: { argb: 'FFB8941E' } } };
  });

  const validations: Partial<Record<string, string>> = {
    category: range('A', lists.categories.length),
    internalCategory: range('B', lists.internalCategories.length),
    internalSubcategory: range('C', subNames.length),
    active: range('D', 2),
  };
  COLUMNS.forEach((col, index) => {
    const letter = columnLetter(index);
    const list = validations[col.key];
    const numeric = col.key === 'weight' || col.key === 'priceMxn' || col.key === 'priceUsd';
    const integer = col.key === 'stock';
    for (let r = 2; r <= MAX_IMPORT_ROWS + 1; r++) {
      const cell = sheet.getCell(`${letter}${r}`);
      if (list) {
        cell.dataValidation = {
          type: 'list',
          allowBlank: true,
          formulae: [list],
          showErrorMessage: true,
          errorTitle: 'Valor no válido',
          error: 'Elige un valor de la lista.',
        };
      } else if (numeric) {
        cell.dataValidation = {
          type: 'decimal',
          operator: 'greaterThanOrEqual',
          allowBlank: true,
          formulae: [0],
          showErrorMessage: true,
          error: 'Escribe un número mayor o igual a 0.',
        };
        cell.numFmt = col.key === 'weight' ? '0.###' : '#,##0.00';
      } else if (integer) {
        cell.dataValidation = {
          type: 'whole',
          operator: 'greaterThanOrEqual',
          allowBlank: true,
          formulae: [0],
          showErrorMessage: true,
          error: 'Escribe un número entero (0 o más).',
        };
      }
    }
  });

  // --- Ejemplo ---
  const example = workbook.addWorksheet('Ejemplo');
  example.columns = COLUMNS.map((col) => ({ header: col.header, key: col.key, width: col.width }));
  example.getRow(1).font = { bold: true };
  const sampleCategory = lists.categories[0] ?? 'Anillos';
  const sampleInternal = lists.internalCategories[0] ?? '';
  const sampleSub = lists.internalSubcategories.find((s) => s.category === sampleInternal)?.name ?? '';
  example.addRow({
    key: 'AN01', nameEs: 'Anillo liso', nameEn: 'Plain ring', descriptionEs: 'Anillo de oro 10K con acabado pulido.',
    materialEs: 'Oro 10K', materialEn: '10K Gold', category: sampleCategory, internalCategory: sampleInternal,
    internalSubcategory: sampleSub, size: '6', weight: 3.2, stock: 1, specifications: 'Quilates: 10K',
    images: 'AN01-1.jpg, AN01-2.jpg', active: 'Sí',
  });
  example.addRow({ key: 'AN01', size: '7', weight: 3.5, stock: 1 });
  example.addRow({ key: 'AN01', size: '8', weight: 3.8, stock: 2 });
  example.addRow({
    key: 'CA02', nameEs: 'Cadena cartier 3 mm', materialEs: 'Oro 10K', category: lists.categories[1] ?? sampleCategory,
    size: '50 cm', priceMxn: 8950, stock: 1, specifications: 'Milímetros: 3 MM; Largo: 50 cm', images: 'CA02.jpg', active: 'Sí',
  });

  // Abrir en la hoja de Productos
  workbook.views = [{ x: 0, y: 0, width: 20000, height: 12000, firstSheet: 0, activeTab: 2, visibility: 'visible' }];

  const buffer = await workbook.xlsx.writeBuffer();
  return new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}
