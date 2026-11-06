"use client";

import { useMemo, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Download, FileSpreadsheet, Loader2, Upload, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  calculateBroquelBreakdown,
  upsertSubcategoryBroquelPricing,
  type BroquelPricingParameters,
  type SubcategoryBroquelPricingData,
} from "@/lib/supabase/pricing";
import { createInternalSubcategory, getAllInternalCategories } from "@/lib/supabase/internal-categories";
import {
  buildBroquelWorkbook,
  normalizeCode,
  parseBroquelWorkbook,
  type ParsedBroquelRow,
} from "@/lib/broquel-pricing/excel";

export interface BroquelModel {
  /** id de la subcategoría interna */
  id: string;
  code: string;
  name: string;
  internalCategoryId: string;
  pricing: SubcategoryBroquelPricingData;
}

interface BroquelCostsPanelProps {
  models: BroquelModel[];
  parameters: BroquelPricingParameters;
  /** Se llama después de guardar una importación, para recargar los datos */
  onImported: () => Promise<void> | void;
}

type RowStatus = "new" | "update" | "same" | "error";

interface PreviewRow extends ParsedBroquelRow {
  status: RowStatus;
  model?: BroquelModel;
  currentFinal?: number;
  newFinal: number;
  newBroquelCost: number;
}

const formatMXN = (amount: number) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", minimumFractionDigits: 2 }).format(amount);

const samePricing = (a: SubcategoryBroquelPricingData, b: SubcategoryBroquelPricingData) =>
  Math.abs(a.goldGrams - b.goldGrams) < 1e-6 &&
  Math.abs(a.carats - b.carats) < 1e-6 &&
  Math.abs(a.merma - b.merma) < 1e-6 &&
  Math.abs(a.laborCost - b.laborCost) < 1e-6 &&
  Math.abs(a.stoneCost - b.stoneCost) < 1e-6;

const statusLabel: Record<RowStatus, string> = {
  new: "Nuevo",
  update: "Cambia",
  same: "Sin cambios",
  error: "Error",
};

export function BroquelCostsPanel({ models, parameters, onImported }: BroquelCostsPanelProps) {
  const [search, setSearch] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  const [preview, setPreview] = useState<PreviewRow[]>([]);
  const fileInput = useRef<HTMLInputElement>(null);

  const rows = useMemo(
    () =>
      models.map((model) => ({
        model,
        breakdown: calculateBroquelBreakdown(model.pricing, parameters),
      })),
    [models, parameters]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      ({ model }) => model.code.toLowerCase().includes(q) || model.name.toLowerCase().includes(q)
    );
  }, [rows, search]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const blob = await buildBroquelWorkbook(
        models.map((m) => ({ code: m.code, description: m.name, pricing: m.pricing })),
        parameters
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "calculadora-broqueles-oro-nacional.xlsx";
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting broquel workbook:", error);
      toast.error("No se pudo generar el Excel");
    } finally {
      setIsExporting(false);
    }
  };

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setIsParsing(true);
    setFileErrors([]);
    setPreview([]);
    try {
      const result = await parseBroquelWorkbook(file);
      const byCode = new Map(models.map((m) => [normalizeCode(m.code), m]));
      setFileErrors(result.fileErrors);
      // Primero lo que requiere atención: errores, cambios, nuevos y al final sin cambios
      const order: Record<RowStatus, number> = { error: 0, update: 1, new: 2, same: 3 };
      setPreview(
        result.rows.map((row) => {
          const model = byCode.get(normalizeCode(row.code));
          const next = calculateBroquelBreakdown(row.pricing, parameters);
          const status: RowStatus =
            row.errors.length > 0 ? "error" : !model ? "new" : samePricing(model.pricing, row.pricing) ? "same" : "update";
          return {
            ...row,
            status,
            model,
            currentFinal: model ? calculateBroquelBreakdown(model.pricing, parameters).finalPrice : undefined,
            newFinal: next.finalPrice,
            newBroquelCost: next.broquelCost,
          };
        }).sort((a, b) => order[a.status] - order[b.status] || a.row - b.row)
      );
      setDialogOpen(true);
    } catch (error) {
      console.error("Error parsing broquel workbook:", error);
      toast.error("No se pudo leer el archivo");
    } finally {
      setIsParsing(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  const pending = preview.filter((r) => r.status === "new" || r.status === "update");
  const counts = {
    new: preview.filter((r) => r.status === "new").length,
    update: preview.filter((r) => r.status === "update").length,
    same: preview.filter((r) => r.status === "same").length,
    error: preview.filter((r) => r.status === "error").length,
  };

  const handleSave = async () => {
    if (pending.length === 0) return;
    setIsSaving(true);
    setProgress(0);
    let saved = 0;
    const failed: string[] = [];

    // Categoría interna "Broquel" para los modelos nuevos
    let broquelCategoryId: string | undefined = models[0]?.internalCategoryId;
    if (!broquelCategoryId && counts.new > 0) {
      const categories = await getAllInternalCategories();
      broquelCategoryId = categories.find((c) => c.name.trim().toLowerCase().startsWith("broquel"))?.id;
    }

    for (let i = 0; i < pending.length; i++) {
      const row = pending[i];
      try {
        let subcategoryId = row.model?.id;
        if (!subcategoryId) {
          if (!broquelCategoryId) throw new Error('No existe la categoría interna "Broquel"');
          const created = await createInternalSubcategory({
            internal_category_id: broquelCategoryId,
            name: row.description || row.code,
            special_code: row.code,
            is_active: true,
            display_order: models.length + i,
          });
          subcategoryId = created.id;
        }
        await upsertSubcategoryBroquelPricing(subcategoryId, row.pricing);
        saved++;
      } catch (error) {
        const message = (error as { message?: string } | null)?.message || "Error desconocido";
        failed.push(`${row.code}: ${message}`);
      }
      setProgress(i + 1);
    }

    setIsSaving(false);
    await onImported();

    if (failed.length > 0) {
      toast.error(`Se guardaron ${saved} de ${pending.length} modelos`, {
        description: failed.slice(0, 5).join("\n"),
        duration: 12000,
      });
    } else {
      toast.success(`Se guardaron ${saved} modelos`, {
        description: 'Usa "Aplicar a todos" para actualizar los precios de los productos en la tienda.',
        duration: 10000,
      });
      setDialogOpen(false);
      setPreview([]);
    }
  };

  return (
    <Card>
      <CardHeader className="gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1.5">
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-[#D4AF37]" aria-hidden="true" />
            Costos por modelo
          </CardTitle>
          <CardDescription>
            Costo broquel = (costo oro con merma + mano de obra + piedra) × PZ. Costo final = con utilidad, comisión, IVA
            y Stripe. El envío no se incluye.
          </CardDescription>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={handleExport} disabled={isExporting || models.length === 0}>
            {isExporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Download className="mr-2 h-4 w-4" aria-hidden="true" />
            )}
            Descargar Excel
          </Button>
          <Button
            type="button"
            onClick={() => fileInput.current?.click()}
            disabled={isParsing}
            className="bg-[#D4AF37] text-[#1a1a1a] hover:bg-[#B8941E]"
          >
            {isParsing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Upload className="mr-2 h-4 w-4" aria-hidden="true" />
            )}
            Subir Excel
          </Button>
          <input
            ref={fileInput}
            type="file"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            className="sr-only"
            aria-label="Subir Excel de costos de broqueles"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          type="search"
          placeholder="Buscar por código o descripción"
          aria-label="Buscar modelo"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-3 py-2">Código</th>
                <th className="px-3 py-2">Descripción</th>
                <th className="px-3 py-2 text-right">Kilataje</th>
                <th className="px-3 py-2 text-right">Oro (g)</th>
                <th className="px-3 py-2 text-right">Merma</th>
                <th className="px-3 py-2 text-right">Costo oro con merma</th>
                <th className="px-3 py-2 text-right">Mano de obra</th>
                <th className="px-3 py-2 text-right">Piedra</th>
                <th className="px-3 py-2 text-right">Costo broquel</th>
                <th className="px-3 py-2 text-right">Costo final</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-3 py-8 text-center text-muted-foreground">
                    {models.length === 0 ? "Aún no hay modelos. Sube el Excel para cargarlos." : "Sin resultados"}
                  </td>
                </tr>
              ) : (
                filtered.map(({ model, breakdown }) => (
                  <tr key={model.id} className="border-t">
                    <td className="px-3 py-2 font-mono text-xs whitespace-nowrap">{model.code || "—"}</td>
                    <td className="px-3 py-2 min-w-48">{model.name}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{model.pricing.carats}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{model.pricing.goldGrams}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{model.pricing.merma}%</td>
                    <td className="px-3 py-2 text-right tabular-nums">{formatMXN(breakdown.goldCostWithMerma)}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{formatMXN(model.pricing.laborCost)}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{formatMXN(model.pricing.stoneCost)}</td>
                    <td className="px-3 py-2 text-right tabular-nums font-semibold">{formatMXN(breakdown.broquelCost)}</td>
                    <td className="px-3 py-2 text-right tabular-nums font-bold text-[#B8941E]">
                      {formatMXN(breakdown.finalPrice)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={(open) => !isSaving && setDialogOpen(open)}>
        <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Revisa los costos antes de guardar</DialogTitle>
            <DialogDescription>
              {preview.length} modelos en el archivo · {counts.update} cambian · {counts.new} nuevos · {counts.same} sin
              cambios
              {counts.error > 0 && ` · ${counts.error} con errores (no se guardan)`}. Los costos finales usan los parámetros
              actuales de la plataforma.
            </DialogDescription>
          </DialogHeader>

          {fileErrors.length > 0 && (
            <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 space-y-1">
              {fileErrors.map((error, i) => (
                <p key={i} className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  {error}
                </p>
              ))}
            </div>
          )}

          {preview.length > 0 && (
            <div className="overflow-x-auto rounded-md border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2">Estado</th>
                    <th className="px-3 py-2">Código</th>
                    <th className="px-3 py-2">Descripción</th>
                    <th className="px-3 py-2 text-right">Costo broquel</th>
                    <th className="px-3 py-2 text-right">Costo final actual</th>
                    <th className="px-3 py-2 text-right">Costo final nuevo</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row) => (
                    <tr key={`${row.row}-${row.code}`} className="border-t align-top">
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 font-medium ${
                            row.status === "error"
                              ? "text-red-700"
                              : row.status === "same"
                                ? "text-muted-foreground"
                                : "text-green-700"
                          }`}
                        >
                          {row.status === "error" ? (
                            <XCircle className="h-4 w-4" aria-hidden="true" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                          )}
                          {statusLabel[row.status]}
                        </span>
                        {row.errors.length > 0 && (
                          <ul className="mt-1 text-xs text-red-700">
                            {row.errors.map((e, i) => (
                              <li key={i}>
                                Fila {row.row}: {e}
                              </li>
                            ))}
                          </ul>
                        )}
                      </td>
                      <td className="px-3 py-2 font-mono text-xs whitespace-nowrap">{row.code || "—"}</td>
                      <td className="px-3 py-2">{row.model?.name || row.description}</td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        {row.status === "error" ? "—" : formatMXN(row.newBroquelCost)}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                        {row.currentFinal !== undefined ? formatMXN(row.currentFinal) : "—"}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums font-semibold">
                        {row.status === "error" ? "—" : formatMXN(row.newFinal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground" aria-live="polite">
              {isSaving
                ? `Guardando ${progress} de ${pending.length}…`
                : "Guardar actualiza los costos de la calculadora. Los precios de la tienda cambian hasta que uses “Aplicar a todos”."}
            </p>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={isSaving}>
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                disabled={isSaving || pending.length === 0}
                className="bg-[#D4AF37] text-[#1a1a1a] hover:bg-[#B8941E]"
              >
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
                Guardar {pending.length} modelo{pending.length === 1 ? "" : "s"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
