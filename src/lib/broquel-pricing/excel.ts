/**
 * Excel de la calculadora de broqueles.
 *
 * Mismo formato que el Excel del cliente ("Calculadora_Broqueles_Oro_Nacional"):
 * parámetros arriba y una fila por modelo con Código, Descripción, Kilataje,
 * Oro (g), Merma, Mano de obra y Piedra. Las columnas de costo (Costo oro,
 * Costo broquel, Costo final) son fórmulas: se ignoran al subir el archivo,
 * porque la plataforma las calcula con sus propios parámetros.
 *
 * exceljs se carga con import() para no inflar el bundle del admin.
 */

import type ExcelJS from "exceljs";
import type { BroquelPricingParameters, SubcategoryBroquelPricingData } from "@/lib/supabase/pricing";

export const BROQUEL_SHEET = "Calculadora Broqueles";
export const MAX_BROQUEL_ROWS = 2000;

export interface BroquelModelRow {
  code: string;
  description: string;
  pricing: SubcategoryBroquelPricingData;
}

export interface ParsedBroquelRow {
  /** Fila del Excel (1 = primera fila) */
  row: number;
  code: string;
  description: string;
  pricing: SubcategoryBroquelPricingData;
  errors: string[];
}

export interface BroquelParseResult {
  rows: ParsedBroquelRow[];
  fileErrors: string[];
}

/** Clave de comparación de códigos: sin espacios y en mayúsculas ("ba-1 " → "BA-1"). */
export const normalizeCode = (code: string): string => code.replace(/\s+/g, "").toUpperCase();

const normalizeHeader = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\*/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

// Encabezados que se leen (texto normalizado → campo)
const HEADER_FIELDS: Record<string, keyof Omit<ParsedBroquelRow, "row" | "errors" | "pricing"> | keyof SubcategoryBroquelPricingData> = {
  codigo: "code",
  clave: "code",
  descripcion: "description",
  kilataje: "carats",
  "oro (g)": "goldGrams",
  "oro (grs)": "goldGrams",
  oro: "goldGrams",
  merma: "merma",
  "mano de obra": "laborCost",
  piedra: "stoneCost",
};

// ---------------------------------------------------------------------------
// Descargar
// ---------------------------------------------------------------------------

const GOLD = "FFD4AF37";
const YELLOW = "FFFFF2CC";
const BLUE_TEXT = "FF1F4E79";

/**
 * Genera el Excel con los modelos actuales y los parámetros de la plataforma.
 * Las columnas de costo llevan fórmulas, así que el cliente puede simular
 * cambios de parámetros en Excel antes de capturarlos en la plataforma.
 */
export async function buildBroquelWorkbook(
  models: BroquelModelRow[],
  params: BroquelPricingParameters
): Promise<Blob> {
  const { default: ExcelJSLib } = await import("exceljs");
  const wb = new ExcelJSLib.Workbook();
  wb.creator = "Oro Nacional";
  const ws = wb.addWorksheet(BROQUEL_SHEET, { views: [{ state: "frozen", ySplit: 15 }] });

  ws.columns = [
    { width: 12 }, // A Código
    { width: 40 }, // B Descripción
    { width: 10 }, // C Kilataje
    { width: 10 }, // D Oro
    { width: 9 }, // E Merma
    { width: 13 }, // F Costo oro
    { width: 16 }, // G Costo oro con merma
    { width: 13 }, // H Mano de obra
    { width: 10 }, // I Piedra
    { width: 15 }, // J Costo broquel
    { width: 15 }, // K Costo final
  ];

  ws.getCell("A1").value = "Calculadora por Broquel";
  ws.getCell("A1").font = { bold: true, size: 16 };
  ws.getCell("A2").value = "Modelos de broquel de Oro Nacional";
  ws.getCell("A2").font = { color: { argb: "FF71717A" } };
  ws.getCell("A3").value =
    "Para actualizar costos: edita las filas de modelos y súbelo en Admin → Calculadora de precios → Broquel → Subir Excel.";
  ws.getCell("A3").font = { italic: true, size: 10, color: { argb: "FF71717A" } };

  ws.getCell("A5").value = "PARÁMETROS (los oficiales se cambian en la plataforma; aquí sirven para simular)";
  ws.getCell("A5").font = { bold: true };

  const paramRows: Array<[string, number, string]> = [
    ["Cotización", params.quotation, '"$"#,##0.00'],
    ["Utilidad", params.profitMargin, "0.00%"],
    ["IVA", params.vat, "0.00%"],
    ["Stripe %", params.stripePercentage, "0.00%"],
    ["Stripe fija", params.stripeFixedFee, '"$"#,##0.00'],
    ["PZ", params.pz, "0.##"],
    ["Comisión de venta", params.salesCommission, '"$"#,##0.00'],
  ];
  paramRows.forEach(([label, value, numFmt], i) => {
    const r = 6 + i;
    ws.getCell(`A${r}`).value = label;
    const cell = ws.getCell(`B${r}`);
    cell.value = value;
    cell.numFmt = numFmt;
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: YELLOW } };
    cell.font = { color: { argb: BLUE_TEXT } };
  });

  const headers = [
    "Código",
    "Descripción",
    "Kilataje",
    "Oro (g)",
    "Merma",
    "Costo oro",
    "Costo oro con merma",
    "Mano de obra",
    "Piedra",
    "Costo broquel",
    "Costo final",
  ];
  const headerRow = ws.getRow(15);
  headers.forEach((h, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = h;
    cell.font = { bold: true, color: { argb: "FF1A1A1A" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: GOLD } };
    cell.alignment = { vertical: "middle", wrapText: true };
  });
  headerRow.height = 30;

  const money = '"$"#,##0.00';
  models.forEach((model, i) => {
    const r = 16 + i;
    const row = ws.getRow(r);
    row.getCell(1).value = model.code;
    row.getCell(2).value = model.description;
    row.getCell(3).value = model.pricing.carats;
    row.getCell(4).value = model.pricing.goldGrams;
    row.getCell(4).numFmt = "0.0000";
    // En el Excel la merma va como fracción con formato % (8 % = 0.08)
    row.getCell(5).value = model.pricing.merma / 100;
    row.getCell(5).numFmt = "0%";
    row.getCell(6).value = { formula: `$B$6*(C${r}/24)*D${r}` };
    row.getCell(7).value = { formula: `F${r}*(1+E${r})` };
    row.getCell(8).value = model.pricing.laborCost;
    row.getCell(9).value = model.pricing.stoneCost;
    row.getCell(10).value = { formula: `(G${r}+H${r}+I${r})*$B$11` };
    row.getCell(11).value = { formula: `((J${r}*(1+$B$7)+$B$11*$B$12)*(1+$B$8)*(1+$B$9))+$B$10` };
    [6, 7, 8, 9, 10, 11].forEach((c) => (row.getCell(c).numFmt = money));
    row.getCell(10).font = { bold: true };
    row.getCell(11).font = { bold: true };
    [1, 2, 3, 4, 5, 8, 9].forEach((c) => (row.getCell(c).font = { color: { argb: BLUE_TEXT } }));
  });

  const notesStart = 16 + models.length + 1;
  const notes = [
    `${models.length} modelos.`,
    "Costo broquel = (costo oro con merma + mano de obra + piedra) × PZ.",
    "Costo final = costo broquel con utilidad, comisión de venta, IVA y Stripe (% y fija).",
    "El costo de envío no se incluye: se cobra aparte al cliente.",
    "Al subir el archivo solo se leen Código, Descripción, Kilataje, Oro (g), Merma, Mano de obra y Piedra. Los costos los calcula la plataforma.",
    "Para agregar un modelo nuevo, agrega una fila con un código que no exista.",
    "Celdas en azul = datos que puedes editar; negro = fórmula.",
  ];
  notes.forEach((text, i) => {
    const cell = ws.getCell(`A${notesStart + i}`);
    cell.value = text;
    cell.font = { size: 10, color: { argb: "FF52525B" } };
  });

  const buffer = await wb.xlsx.writeBuffer();
  return new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

// ---------------------------------------------------------------------------
// Subir
// ---------------------------------------------------------------------------

/** Valor de una celda como texto, resolviendo fórmulas y texto enriquecido. */
function cellText(cell: ExcelJS.Cell): string {
  const v = cell.value as unknown;
  if (v === null || v === undefined) return "";
  if (typeof v === "object") {
    const obj = v as { result?: unknown; richText?: Array<{ text: string }>; text?: string };
    if (obj.richText) return obj.richText.map((t) => t.text).join("").trim();
    if (obj.text !== undefined) return String(obj.text).trim();
    if (obj.result !== undefined && obj.result !== null) return String(obj.result).trim();
    return "";
  }
  return String(v).trim();
}

/** Valor numérico de una celda ("$19.32", "8%", "0,14" también valen). */
function cellNumber(cell: ExcelJS.Cell): { value: number | null; raw: string; percent: boolean } {
  const v = cell.value as unknown;
  if (typeof v === "number") return { value: v, raw: String(v), percent: false };
  if (v && typeof v === "object" && typeof (v as { result?: unknown }).result === "number") {
    const n = (v as { result: number }).result;
    return { value: n, raw: String(n), percent: false };
  }
  const raw = cellText(cell);
  if (!raw) return { value: null, raw, percent: false };
  const percent = raw.includes("%");
  const cleaned = raw.replace(/[$%\s]/g, "").replace(",", ".");
  const n = Number(cleaned);
  return { value: Number.isFinite(n) ? n : NaN, raw, percent };
}

export async function parseBroquelWorkbook(file: File): Promise<BroquelParseResult> {
  const fileErrors: string[] = [];
  const { default: ExcelJSLib } = await import("exceljs");
  const wb = new ExcelJSLib.Workbook();
  try {
    await wb.xlsx.load(await file.arrayBuffer());
  } catch {
    return { rows: [], fileErrors: ["No se pudo leer el archivo. Verifica que sea un Excel .xlsx."] };
  }

  // Hoja: la de la calculadora o, si no existe, la primera con una fila "Código"
  const candidates = [wb.getWorksheet(BROQUEL_SHEET), ...wb.worksheets].filter(
    (ws): ws is ExcelJS.Worksheet => !!ws
  );

  let sheet: ExcelJS.Worksheet | null = null;
  let headerRowNumber = 0;
  const columns = new Map<string, number>();

  for (const ws of candidates) {
    const limit = Math.min(ws.rowCount, 60);
    for (let r = 1; r <= limit && !sheet; r++) {
      const row = ws.getRow(r);
      const found = new Map<string, number>();
      row.eachCell({ includeEmpty: false }, (cell, col) => {
        const field = HEADER_FIELDS[normalizeHeader(cellText(cell))];
        if (field && !found.has(field)) found.set(field, col);
      });
      if (found.has("code") && found.has("goldGrams")) {
        sheet = ws;
        headerRowNumber = r;
        found.forEach((col, field) => columns.set(field, col));
      }
    }
    if (sheet) break;
  }

  if (!sheet) {
    return {
      rows: [],
      fileErrors: ['No se encontró la tabla de modelos. Debe tener una fila de encabezados con "Código" y "Oro (g)".'],
    };
  }

  const missing = (["carats", "merma", "laborCost", "stoneCost"] as const).filter((f) => !columns.has(f));
  if (missing.length > 0) {
    const names: Record<string, string> = {
      carats: "Kilataje",
      merma: "Merma",
      laborCost: "Mano de obra",
      stoneCost: "Piedra",
    };
    fileErrors.push(`Faltan columnas: ${missing.map((m) => names[m]).join(", ")}.`);
    return { rows: [], fileErrors };
  }

  const col = (field: string) => columns.get(field) as number;
  const rows: ParsedBroquelRow[] = [];
  const seen = new Map<string, number>();

  for (let r = headerRowNumber + 1; r <= sheet.rowCount; r++) {
    const row = sheet.getRow(r);
    const code = cellText(row.getCell(col("code")));
    const gold = cellNumber(row.getCell(col("goldGrams")));
    const carats = cellNumber(row.getCell(col("carats")));

    // Filas vacías y notas al pie (texto sin oro ni kilataje) no son modelos
    if (gold.value === null && carats.value === null) continue;

    if (rows.length >= MAX_BROQUEL_ROWS) {
      fileErrors.push(`El archivo tiene más de ${MAX_BROQUEL_ROWS} modelos; divide la carga en varios archivos.`);
      break;
    }

    const errors: string[] = [];
    const description = columns.has("description") ? cellText(row.getCell(col("description"))) : "";
    const merma = cellNumber(row.getCell(col("merma")));
    const labor = cellNumber(row.getCell(col("laborCost")));
    const stone = cellNumber(row.getCell(col("stoneCost")));

    if (!code) errors.push("Falta el código.");

    const check = (
      label: string,
      n: { value: number | null; raw: string },
      opts: { required?: boolean; positive?: boolean; max?: number } = {}
    ): number => {
      if (n.value === null) {
        if (opts.required) errors.push(`Falta ${label}.`);
        return 0;
      }
      if (Number.isNaN(n.value)) {
        errors.push(`${label} no es un número ("${n.raw}").`);
        return 0;
      }
      if (n.value < 0 || (opts.positive && n.value === 0)) {
        errors.push(`${label} debe ser mayor a 0.`);
        return 0;
      }
      if (opts.max !== undefined && n.value > opts.max) {
        errors.push(`${label} no puede ser mayor a ${opts.max}.`);
      }
      return n.value;
    };

    const caratsValue = check("el kilataje", carats, { required: true, positive: true, max: 24 });
    const goldValue = check("el oro (g)", gold, { required: true, positive: true });
    const laborValue = check("la mano de obra", labor);
    const stoneValue = check("la piedra", stone);

    // Merma: el Excel la guarda como fracción (0.08 = 8 %); también se acepta "8%" o 8
    let mermaPercent = check("la merma", merma);
    if (merma.value !== null && !Number.isNaN(merma.value)) {
      mermaPercent = merma.percent || merma.value > 1 ? merma.value : merma.value * 100;
      if (mermaPercent > 100) errors.push("La merma no puede ser mayor a 100 %.");
    }

    const key = normalizeCode(code);
    if (code) {
      const firstRow = seen.get(key);
      if (firstRow) errors.push(`El código ${code} ya aparece en la fila ${firstRow}.`);
      else seen.set(key, r);
    }

    rows.push({
      row: r,
      code: code.trim(),
      description,
      pricing: {
        goldGrams: goldValue,
        carats: caratsValue,
        factor: 0,
        merma: Math.round(mermaPercent * 100) / 100,
        laborCost: laborValue,
        stoneCost: stoneValue,
      },
      errors,
    });
  }

  if (rows.length === 0 && fileErrors.length === 0) {
    fileErrors.push("La tabla de modelos está vacía.");
  }

  return { rows, fileErrors };
}
