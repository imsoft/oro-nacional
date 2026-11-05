"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@/i18n/routing";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Download,
  FileArchive,
  FileSpreadsheet,
  Loader2,
  Upload,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { getCategories, createProduct } from "@/lib/supabase/products-multilingual";
import { getAllProducts } from "@/lib/supabase/products";
import {
  getAllInternalCategories,
  getInternalSubcategories,
  updateProductInternalCategoriesAndSubcategories,
} from "@/lib/supabase/internal-categories";
import { calculateDynamicProductPrice } from "@/lib/supabase/pricing";
import { getStoreSettings } from "@/lib/supabase/settings";
import { buildProductTemplate } from "@/lib/product-import/template";
import { normalizeName } from "@/lib/product-import/columns";
import {
  parseProductImport,
  type ImportLookups,
  type ParsedProduct,
} from "@/lib/product-import/parse";

type Step = "upload" | "review" | "importing" | "done";
type ImportStatus = { key: string; name: string; ok: boolean; message?: string; productId?: string };

const formatMoney = (amount: number) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(amount);

const round2 = (n: number) => Math.round(n * 100) / 100;

export default function ImportProductsPage() {
  const [lookups, setLookups] = useState<ImportLookups | null>(null);
  const [templateLists, setTemplateLists] = useState<{
    categories: string[];
    internalCategories: string[];
    internalSubcategories: Array<{ category: string; name: string }>;
  } | null>(null);
  const [exchangeRate, setExchangeRate] = useState(18);
  const [loadingLookups, setLoadingLookups] = useState(true);

  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [step, setStep] = useState<Step>("upload");
  const [isParsing, setIsParsing] = useState(false);
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  const [products, setProducts] = useState<ParsedProduct[]>([]);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ImportStatus[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const excelInput = useRef<HTMLInputElement>(null);
  const zipInput = useRef<HTMLInputElement>(null);

  // Catálogos actuales de la plataforma (para validar y para las listas de la plantilla)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [categories, internalCategories, existing, settings] = await Promise.all([
          getCategories("es"),
          getAllInternalCategories(),
          getAllProducts(),
          getStoreSettings(),
        ]);
        const activeInternal = internalCategories.filter((c) => c.is_active);
        const subLists = await Promise.all(activeInternal.map((c) => getInternalSubcategories(c.id)));
        if (cancelled) return;

        const subcategories = activeInternal.flatMap((cat, i) =>
          subLists[i]
            .filter((s) => (s as { is_active?: boolean }).is_active !== false)
            .map((s) => ({ id: s.id, name: s.name, internalCategoryId: cat.id, categoryName: cat.name }))
        );

        setLookups({
          categories: categories.map((c) => ({ id: c.id as string, name: (c.name as string).trim() })),
          internalCategories: activeInternal.map((c) => ({ id: c.id, name: c.name })),
          internalSubcategories: subcategories.map((s) => ({ id: s.id, name: s.name, internalCategoryId: s.internalCategoryId })),
          existingProductNames: new Set(existing.map((p) => normalizeName(p.name))),
        });
        setTemplateLists({
          categories: categories.map((c) => (c.name as string).trim()),
          internalCategories: activeInternal.map((c) => c.name),
          internalSubcategories: subcategories.map((s) => ({ category: s.categoryName, name: s.name })),
        });
        const rate = Number(settings?.exchange_rate);
        if (rate > 0) setExchangeRate(rate);
      } catch (error) {
        console.error("Error loading import lookups:", error);
        toast.error("No se pudieron cargar las categorías", { description: "Recarga la página e intenta de nuevo." });
      } finally {
        if (!cancelled) setLoadingLookups(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Evitar cerrar la página a media importación
  useEffect(() => {
    if (step !== "importing") return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [step]);

  const handleDownloadTemplate = async () => {
    if (!templateLists) return;
    try {
      const blob = await buildProductTemplate(templateLists);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "plantilla-productos-oro-nacional.xlsx";
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error building template:", error);
      toast.error("No se pudo generar la plantilla");
    }
  };

  /** Calcula con la calculadora los precios que vienen vacíos. */
  const fillCalculatedPrices = async (items: ParsedProduct[]) => {
    const cache = new Map<string, number | null>();
    for (const product of items) {
      if (product.errors.length > 0 || !product.internalSubcategoryId) continue;
      for (const size of product.sizes) {
        if (size.priceMxn || !size.weight) continue;
        const cacheKey = `${product.internalSubcategoryId}|${size.weight}`;
        if (!cache.has(cacheKey)) {
          try {
            cache.set(
              cacheKey,
              await calculateDynamicProductPrice({
                goldGrams: size.weight,
                subcategoryId: product.internalSubcategoryId,
                categoryName: product.internalCategoryName,
              })
            );
          } catch {
            cache.set(cacheKey, null);
          }
        }
        const price = cache.get(cacheKey);
        if (price && price > 0) {
          size.priceMxn = round2(price);
        } else {
          product.errors.push(`Fila ${size.row}: no se pudo calcular el precio con la calculadora. Escribe el precio MXN.`);
        }
      }
    }
  };

  const handleReview = async () => {
    if (!excelFile || !lookups) return;
    setIsParsing(true);
    setFileErrors([]);
    try {
      const result = await parseProductImport(excelFile, zipFile, lookups);
      await fillCalculatedPrices(result.products);
      setFileErrors(result.fileErrors);
      setProducts(result.products);
      if (result.products.length > 0) setStep("review");
    } catch (error) {
      console.error("Error parsing import:", error);
      setFileErrors(["No se pudo leer el archivo. Verifica que sea la plantilla en formato .xlsx."]);
    } finally {
      setIsParsing(false);
    }
  };

  const validProducts = useMemo(() => products.filter((p) => p.errors.length === 0), [products]);
  const invalidCount = products.length - validProducts.length;

  const handleImport = async () => {
    if (validProducts.length === 0) return;
    setStep("importing");
    setProgress(0);
    const statuses: ImportStatus[] = [];

    for (let i = 0; i < validProducts.length; i++) {
      const p = validProducts[i];
      try {
        const created = await createProduct(
          {
            name: { es: p.nameEs, en: p.nameEn || p.nameEs },
            description: { es: p.descriptionEs, en: p.descriptionEn || p.descriptionEs },
            material: { es: p.materialEs, en: p.materialEn || p.materialEs },
            category_id: p.categoryId ?? "",
            price: 0,
            stock: 0,
            is_active: p.active,
            available_languages: ["es", "en"],
            specifications: p.specifications.map((spec, index) => ({
              spec_key: { es: spec.key, en: spec.key },
              spec_value: { es: spec.value, en: spec.value },
              display_order: index,
            })),
            sizes: p.sizes.map((size) => ({
              size: size.size,
              stock: size.stock,
              price: size.priceMxn ?? 0,
              price_usd:
                size.priceUsd ??
                (size.priceMxn && exchangeRate > 0 ? round2(size.priceMxn / exchangeRate) : null),
              weight: size.weight ?? undefined,
            })),
            images: p.images,
          },
          { primaryImageIndex: 0 }
        );

        if (p.internalCategoryId) {
          await updateProductInternalCategoriesAndSubcategories(
            created.id,
            [p.internalCategoryId],
            p.internalSubcategoryId ? [p.internalSubcategoryId] : []
          );
        }

        const imageErrors = (created as { imageErrors?: string[] }).imageErrors || [];
        statuses.push({
          key: p.key,
          name: p.nameEs,
          ok: true,
          productId: created.id,
          message: imageErrors.length > 0 ? `${imageErrors.length} imagen(es) no se subieron` : undefined,
        });
      } catch (error) {
        statuses.push({
          key: p.key,
          name: p.nameEs,
          ok: false,
          message: error instanceof Error ? error.message : "Error inesperado",
        });
      }
      setProgress(i + 1);
      setResults([...statuses]);
    }

    setStep("done");
    const created = statuses.filter((s) => s.ok).length;
    toast.success(`Importación terminada: ${created} de ${validProducts.length} productos creados`);
  };

  const reset = () => {
    setStep("upload");
    setProducts([]);
    setResults([]);
    setFileErrors([]);
    setExcelFile(null);
    setZipFile(null);
    setProgress(0);
    if (excelInput.current) excelInput.current.value = "";
    if (zipInput.current) zipInput.current.value = "";
  };

  const priceRange = (p: ParsedProduct) => {
    const prices = p.sizes.map((s) => s.priceMxn).filter((x): x is number => !!x);
    if (prices.length === 0) return "—";
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return min === max ? formatMoney(min) : `${formatMoney(min)} – ${formatMoney(max)}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/productos"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Volver a productos
        </Link>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <FileSpreadsheet className="h-6 w-6 text-[#D4AF37]" aria-hidden="true" />
          Importar productos desde Excel
        </h2>
        <p className="text-muted-foreground">
          Llena la plantilla, súbela con un ZIP de fotos y revisa la vista previa antes de crear los productos.
        </p>
      </div>

      {/* Paso 1: plantilla */}
      <section className="rounded-lg border bg-card p-6 space-y-3">
        <h3 className="font-semibold text-foreground">1. Descarga la plantilla</h3>
        <p className="text-sm text-muted-foreground">
          Incluye instrucciones, un ejemplo y listas con las categorías actuales de la tienda. Una fila por talla; repite la
          misma Clave en las tallas de un producto.
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={handleDownloadTemplate}
          disabled={loadingLookups || !templateLists}
        >
          {loadingLookups ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Download className="mr-2 h-4 w-4" aria-hidden="true" />
          )}
          Descargar plantilla (.xlsx)
        </Button>
      </section>

      {/* Paso 2: subir */}
      {(step === "upload" || step === "review") && (
        <section className="rounded-lg border bg-card p-6 space-y-4">
          <h3 className="font-semibold text-foreground">2. Sube tus archivos</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="excel-file">
                Plantilla llena (.xlsx) <span className="text-red-600" aria-hidden="true">*</span>
              </Label>
              <input
                ref={excelInput}
                id="excel-file"
                type="file"
                accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={(e) => {
                  setExcelFile(e.target.files?.[0] ?? null);
                  setStep("upload");
                }}
                className="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-[#D4AF37]/15 file:px-3 file:py-2 file:text-sm file:font-medium file:text-[#1a1a1a] hover:file:bg-[#D4AF37]/25 cursor-pointer"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zip-file">
                Fotos en ZIP <span className="font-normal text-muted-foreground">(opcional)</span>
              </Label>
              <input
                ref={zipInput}
                id="zip-file"
                type="file"
                accept=".zip,application/zip"
                onChange={(e) => {
                  setZipFile(e.target.files?.[0] ?? null);
                  setStep("upload");
                }}
                className="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-[#D4AF37]/15 file:px-3 file:py-2 file:text-sm file:font-medium file:text-[#1a1a1a] hover:file:bg-[#D4AF37]/25 cursor-pointer"
              />
              <p className="text-xs text-muted-foreground">
                Fotos .jpg, .png o .webp. Sus nombres deben coincidir con la columna Imágenes.
              </p>
            </div>
          </div>
          <Button
            type="button"
            onClick={handleReview}
            disabled={!excelFile || isParsing || !lookups}
            className="bg-[#D4AF37] text-[#1a1a1a] hover:bg-[#B8941E]"
          >
            {isParsing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                Revisando archivo…
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" aria-hidden="true" />
                Revisar archivo
              </>
            )}
          </Button>

          {fileErrors.length > 0 && (
            <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 space-y-1">
              {fileErrors.map((error, i) => (
                <p key={i} className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  {error}
                </p>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Paso 3: vista previa */}
      {step === "review" && (
        <section className="rounded-lg border bg-card overflow-hidden">
          <div className="p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b">
            <div>
              <h3 className="font-semibold text-foreground">3. Revisa antes de importar</h3>
              <p className="text-sm text-muted-foreground">
                {products.length} productos en el archivo ·{" "}
                <span className="text-green-700 font-medium">{validProducts.length} listos</span>
                {invalidCount > 0 && (
                  <>
                    {" "}· <span className="text-red-700 font-medium">{invalidCount} con errores (no se importan)</span>
                  </>
                )}
              </p>
            </div>
            <Button
              type="button"
              onClick={handleImport}
              disabled={validProducts.length === 0}
              className="bg-[#D4AF37] text-[#1a1a1a] hover:bg-[#B8941E]"
            >
              Importar {validProducts.length} producto{validProducts.length === 1 ? "" : "s"}
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Clave</th>
                  <th className="px-4 py-3">Producto</th>
                  <th className="px-4 py-3">Categoría</th>
                  <th className="px-4 py-3">Tallas</th>
                  <th className="px-4 py-3">Precio</th>
                  <th className="px-4 py-3">Fotos</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const hasErrors = p.errors.length > 0;
                  const messages = [...p.errors, ...p.warnings];
                  const isOpen = expanded === p.key;
                  return (
                    <tr key={p.key} className="border-t align-top">
                      <td className="px-4 py-3">
                        {hasErrors ? (
                          <span className="inline-flex items-center gap-1 text-red-700 font-medium">
                            <XCircle className="h-4 w-4" aria-hidden="true" /> Error
                          </span>
                        ) : p.warnings.length > 0 ? (
                          <span className="inline-flex items-center gap-1 text-amber-700 font-medium">
                            <AlertTriangle className="h-4 w-4" aria-hidden="true" /> Aviso
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-green-700 font-medium">
                            <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> Listo
                          </span>
                        )}
                        {messages.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setExpanded(isOpen ? null : p.key)}
                            className="block text-xs text-muted-foreground underline mt-1"
                            aria-expanded={isOpen}
                          >
                            {isOpen ? "Ocultar" : `Ver ${messages.length} detalle${messages.length === 1 ? "" : "s"}`}
                          </button>
                        )}
                        {isOpen && (
                          <ul className="mt-2 space-y-1 text-xs">
                            {p.errors.map((m, i) => (
                              <li key={`e${i}`} className="text-red-700">• {m}</li>
                            ))}
                            {p.warnings.map((m, i) => (
                              <li key={`w${i}`} className="text-amber-700">• {m}</li>
                            ))}
                          </ul>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">{p.key}</td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-foreground">{p.nameEs || "—"}</span>
                        <span className="block text-xs text-muted-foreground">
                          {p.materialEs}
                          {!p.active && " · Inactivo"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {p.categoryName || "—"}
                        {p.internalCategoryName && (
                          <span className="block text-xs text-muted-foreground">{p.internalCategoryName}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {p.sizes.length}
                        <span className="block text-xs text-muted-foreground max-w-40 truncate" title={p.sizes.map((s) => s.size).join(", ")}>
                          {p.sizes.map((s) => s.size).join(", ")}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap tabular-nums">{priceRange(p)}</td>
                      <td className="px-4 py-3">{p.images.length}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Paso 4: importando / resultado */}
      {(step === "importing" || step === "done") && (
        <section className="rounded-lg border bg-card p-6 space-y-4" aria-live="polite">
          <h3 className="font-semibold text-foreground">
            {step === "importing" ? "Importando productos…" : "Importación terminada"}
          </h3>
          <div>
            <div className="flex justify-between text-sm text-muted-foreground mb-1">
              <span>
                {progress} de {validProducts.length}
              </span>
              {step === "importing" && <span>No cierres esta página</span>}
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-[#D4AF37] transition-all"
                style={{ width: `${validProducts.length ? (progress / validProducts.length) * 100 : 0}%` }}
              />
            </div>
          </div>
          {step === "done" && (
            <p className="text-sm">
              <span className="text-green-700 font-medium">{results.filter((r) => r.ok).length} creados</span>
              {results.some((r) => !r.ok) && (
                <>
                  {" "}· <span className="text-red-700 font-medium">{results.filter((r) => !r.ok).length} con error</span>
                </>
              )}
            </p>
          )}
          <ul className="divide-y rounded-md border text-sm max-h-96 overflow-y-auto">
            {results.map((r) => (
              <li key={r.key} className="flex items-start justify-between gap-4 px-4 py-2">
                <span className="flex items-start gap-2 min-w-0">
                  {r.ok ? (
                    <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-700 flex-shrink-0" aria-hidden="true" />
                  ) : (
                    <XCircle className="h-4 w-4 mt-0.5 text-red-700 flex-shrink-0" aria-hidden="true" />
                  )}
                  <span className="min-w-0">
                    <span className="font-mono text-xs mr-2">{r.key}</span>
                    {r.name}
                    {r.message && <span className={`block text-xs ${r.ok ? "text-amber-700" : "text-red-700"}`}>{r.message}</span>}
                  </span>
                </span>
                {r.ok && r.productId && (
                  <Link href={`/admin/productos/${r.productId}/editar`} className="text-xs text-[#B8941E] hover:underline whitespace-nowrap">
                    Ver producto
                  </Link>
                )}
              </li>
            ))}
          </ul>
          {step === "done" && (
            <div className="flex flex-wrap gap-3">
              <Button asChild className="bg-[#D4AF37] text-[#1a1a1a] hover:bg-[#B8941E]">
                <Link href="/admin/productos">
                  <FileArchive className="mr-2 h-4 w-4" aria-hidden="true" />
                  Ir a productos
                </Link>
              </Button>
              <Button type="button" variant="outline" onClick={reset}>
                Importar otro archivo
              </Button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
