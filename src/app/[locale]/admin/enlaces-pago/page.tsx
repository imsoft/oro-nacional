"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import {
  Check,
  Copy,
  ExternalLink,
  Link2,
  Loader2,
  MessageCircle,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/lib/supabase/client";
import { getAllProducts } from "@/lib/supabase/products";
import { getStoreSettings } from "@/lib/supabase/settings";
import { getPricingParameters } from "@/lib/supabase/pricing";
import type { ProductListItem, ProductSize } from "@/types/product";
import { toast } from "sonner";
import { normalizeWhatsAppNumber } from "@/lib/whatsapp";

type Currency = "MXN" | "USD";
type Mode = "products" | "amount";

interface SelectedItem {
  key: string;
  product: ProductListItem;
  size: string | null;
  quantity: number;
}

interface GeneratedLink {
  orderId: string;
  orderNumber: string;
  url: string;
  expiresAt: string | null;
  total: number;
  currency: Currency;
  installmentsEnabled: boolean;
}

interface LinkRow {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  description: string | null;
  total: number;
  currency: Currency;
  paymentStatus: "Pendiente" | "Pagado" | "Fallido" | "Reembolsado";
  status: "Pendiente" | "Procesando" | "Enviado" | "Entregado" | "Cancelado";
  url: string | null;
  expiresAt: string | null;
  installmentsEnabled: boolean;
  installmentsMonths: number | null;
  createdAt: string;
}

const DEFAULT_EXCHANGE_RATE = 18;
const NO_SIZE = "__none__";

const STRIPE_FEE_VAT = 0.16; // IVA sobre la comisión de Stripe

// Planes de meses sin intereses de Stripe México: comisión adicional para la
// tienda (sobre el total, más IVA) y monto mínimo de compra que pide Stripe.
// `enabled` debe coincidir con los planes activados en el Dashboard de Stripe
// (Configuración → Métodos de pago → Meses sin intereses).
const STRIPE_INSTALLMENT_FEES = [
  { months: 3, rate: 0.05, minMXN: 300, enabled: true },
  { months: 6, rate: 0.075, minMXN: 600, enabled: true },
  { months: 9, rate: 0.1, minMXN: 900, enabled: false },
  { months: 12, rate: 0.125, minMXN: 1200, enabled: true },
  { months: 18, rate: 0.175, minMXN: 1800, enabled: false },
  { months: 24, rate: 0.225, minMXN: 2400, enabled: false },
];

/**
 * Desglose de lo que cobra Stripe y lo que recibe la tienda.
 * La cuota fija está en MXN; para USD se convierte con el tipo de cambio.
 */
const getStripeBreakdown = (
  total: number,
  currency: Currency,
  fees: { percentage: number; fixedFeeMXN: number },
  exchangeRate: number
) => {
  const fixedFee = currency === "USD" ? fees.fixedFeeMXN / exchangeRate : fees.fixedFeeMXN;
  const commission = total > 0 ? total * fees.percentage + fixedFee : 0;
  const vat = commission * STRIPE_FEE_VAT;
  const stripeTotal = commission + vat;
  return {
    commission,
    vat,
    stripeTotal,
    net: Math.max(0, total - stripeTotal),
    percentageLabel: `${(fees.percentage * 100).toFixed(1)}%`,
    fixedFee,
  };
};

const formatMoney = (amount: number, currency: Currency) =>
  new Intl.NumberFormat(currency === "USD" ? "en-US" : "es-MX", {
    style: "currency",
    currency,
  }).format(amount);

const formatDate = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleString("es-MX", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "—";

/** Mismo criterio de precio que el servidor, solo para la vista previa. */
const previewUnitPrice = (
  product: ProductListItem,
  sizeName: string | null,
  currency: Currency,
  exchangeRate: number
): number => {
  const sizes = [...(product.sizes || [])].sort(
    (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)
  );
  const size: ProductSize | undefined = sizeName
    ? sizes.find((s) => s.size === sizeName)
    : sizes[0];
  const sizePrice = size?.price && size.price > 0 ? size.price : null;
  const mxn = sizePrice ?? (product.base_price && product.base_price > 0 ? product.base_price : product.price) ?? 0;
  if (currency === "MXN") return mxn;
  const fixedUsd = sizePrice && size?.price_usd && size.price_usd > 0 ? size.price_usd : null;
  return fixedUsd ?? mxn / exchangeRate;
};

function StripeBreakdown({
  total,
  currency,
  fees,
  exchangeRate,
  installments = false,
  t,
}: {
  total: number;
  currency: Currency;
  fees: { percentage: number; fixedFeeMXN: number };
  exchangeRate: number;
  installments?: boolean;
  t: ReturnType<typeof useTranslations>;
}) {
  if (total <= 0) return null;
  const b = getStripeBreakdown(total, currency, fees, exchangeRate);
  const row = (label: string, value: string, cls = "") => (
    <div className={`flex items-center justify-between gap-4 ${cls}`}>
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium tabular-nums">{value}</span>
    </div>
  );
  return (
    <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm space-y-1.5">
      <p className="font-semibold text-foreground mb-2">{t("breakdownTitle")}</p>
      {row(t("breakdownCustomerPays"), formatMoney(total, currency))}
      {row(
        t("breakdownStripeFee", {
          percentage: b.percentageLabel,
          fixed: formatMoney(b.fixedFee, currency),
        }),
        `− ${formatMoney(b.commission, currency)}`
      )}
      {row(t("breakdownVat"), `− ${formatMoney(b.vat, currency)}`)}
      <div className="border-t border-border pt-2 mt-2 flex items-center justify-between gap-4">
        <span className="font-semibold text-foreground">{t("breakdownNet")}</span>
        <span className="text-lg font-bold text-green-700 tabular-nums">{formatMoney(b.net, currency)}</span>
      </div>
      {installments && (
        <div className="border-t border-border pt-3 mt-3 space-y-1">
          <p className="font-medium text-foreground">{t("breakdownInstallmentsTitle")}</p>
          <p className="text-xs text-muted-foreground mb-2">{t("breakdownInstallmentsHint")}</p>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-muted-foreground">
                <th className="text-left font-medium py-1">{t("breakdownPlan")}</th>
                <th className="text-right font-medium py-1">{t("breakdownPlanFee")}</th>
                <th className="text-right font-medium py-1">{t("breakdownNet")}</th>
              </tr>
            </thead>
            <tbody>
              {STRIPE_INSTALLMENT_FEES.filter((plan) => plan.enabled).map((plan) => {
                const extra = total * plan.rate;
                const extraVat = extra * STRIPE_FEE_VAT;
                const net = Math.max(0, b.net - extra - extraVat);
                return (
                  <tr key={plan.months} className="border-t border-border/60">
                    <td className="py-1">
                      {t("breakdownMonths", { months: plan.months })}
                      {total < plan.minMXN && (
                        <span className="block text-[11px] text-amber-700">
                          {t("breakdownPlanMin", { min: formatMoney(plan.minMXN, "MXN") })}
                        </span>
                      )}
                    </td>
                    <td className="py-1 text-right tabular-nums">
                      +{(plan.rate * 100).toFixed(1)}% · − {formatMoney(extra + extraVat, currency)}
                    </td>
                    <td className="py-1 text-right tabular-nums font-medium">{formatMoney(net, currency)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-xs text-muted-foreground pt-1">{t("breakdownNote")}</p>
    </div>
  );
}

export default function PaymentLinksAdmin() {
  const t = useTranslations("admin.paymentLinks");

  const [mode, setMode] = useState<Mode>("products");
  const [currency, setCurrency] = useState<Currency>("MXN");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerWhatsapp, setCustomerWhatsapp] = useState("");
  // Meses sin intereses (solo MXN; los planes se configuran en Stripe)
  const [installmentsEnabled, setInstallmentsEnabled] = useState(false);

  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [exchangeRate, setExchangeRate] = useState(DEFAULT_EXCHANGE_RATE);
  // Comisión de Stripe México: porcentaje + cuota fija (en MXN) + IVA sobre la comisión
  const [stripeFees, setStripeFees] = useState({ percentage: 0.036, fixedFeeMXN: 3 });
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<SelectedItem[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<GeneratedLink | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const [links, setLinks] = useState<LinkRow[]>([]);
  const [isLoadingLinks, setIsLoadingLinks] = useState(true);
  // Momento de la última carga, para marcar enlaces vencidos sin leer el reloj en el render
  const [now, setNow] = useState(0);

  const getAccessToken = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  }, []);

  const loadLinks = useCallback(async () => {
    try {
      const token = await getAccessToken();
      if (!token) {
        toast.error(t("sessionError"));
        return;
      }
      const response = await fetch("/api/admin/payment-links", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("load_failed");
      const data = await response.json();
      setLinks(data.links || []);
      setNow(Date.now());
    } catch {
      toast.error(t("loadError"));
    } finally {
      setIsLoadingLinks(false);
    }
  }, [getAccessToken, t]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [productsData, settings, pricing] = await Promise.all([
        getAllProducts(),
        getStoreSettings(),
        getPricingParameters().catch(() => null),
        loadLinks(),
      ]);
      if (cancelled) return;
      if (pricing && pricing.stripePercentage > 0) {
        setStripeFees({ percentage: pricing.stripePercentage, fixedFeeMXN: pricing.stripeFixedFee });
      }
      setProducts(productsData.filter((p) => p.is_active));
      const rate = Number(settings?.exchange_rate);
      if (Number.isFinite(rate) && rate > 0) setExchangeRate(rate);
      setIsLoadingProducts(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [loadLinks]);

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return [];
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          (p.category_name || "").toLowerCase().includes(term)
      )
      .slice(0, 8);
  }, [products, search]);

  const addProduct = (product: ProductListItem) => {
    const sizes = [...(product.sizes || [])].sort(
      (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)
    );
    const size = sizes[0]?.size ?? null;
    setSelected((prev) => [
      ...prev,
      { key: `${product.id}-${Date.now()}`, product, size, quantity: 1 },
    ]);
    setSearch("");
  };

  const updateItem = (key: string, patch: Partial<SelectedItem>) => {
    setSelected((prev) => prev.map((item) => (item.key === key ? { ...item, ...patch } : item)));
  };

  const removeItem = (key: string) => {
    setSelected((prev) => prev.filter((item) => item.key !== key));
  };

  const previewTotal = useMemo(() => {
    if (mode === "amount") {
      const value = Number(amount);
      return Number.isFinite(value) && value > 0 ? value : 0;
    }
    return selected.reduce(
      (sum, item) =>
        sum + previewUnitPrice(item.product, item.size, currency, exchangeRate) * item.quantity,
      0
    );
  }, [mode, amount, selected, currency, exchangeRate]);

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      toast.success(t("copied"));
      setTimeout(() => setCopiedUrl((current) => (current === url ? null : current)), 2000);
    } catch {
      toast.error(t("createError"));
    }
  };

  const buildWhatsappUrl = (
    link: { url: string; total: number; currency: Currency; expiresAt: string | null },
    name: string,
    phone: string
  ) => {
    const digits = normalizeWhatsAppNumber(phone);
    const values = {
      name: name.trim(),
      total: formatMoney(link.total, link.currency),
      url: link.url,
      date: formatDate(link.expiresAt),
    };
    const message = name.trim() ? t("whatsappMessage", values) : t("whatsappMessageNoName", values);
    return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (mode === "products" && selected.length === 0) {
      toast.error(t("validationItems"));
      return;
    }
    if (mode === "amount") {
      const value = Number(amount);
      if (!Number.isFinite(value) || value <= 0) {
        toast.error(t("validationAmount"));
        return;
      }
      if (!description.trim()) {
        toast.error(t("validationDescription"));
        return;
      }
    }

    setIsSubmitting(true);
    setResult(null);
    try {
      const token = await getAccessToken();
      if (!token) {
        toast.error(t("sessionError"));
        return;
      }

      const response = await fetch("/api/admin/payment-links", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          kind: mode,
          currency,
          description: description.trim() || undefined,
          customer_name: customerName.trim() || undefined,
          customer_email: customerEmail.trim() || undefined,
          customer_whatsapp: customerWhatsapp.trim() || undefined,
          installments_enabled: installmentsEnabled && currency === "MXN",
          ...(mode === "amount"
            ? { amount: Math.round(Number(amount) * 100) / 100 }
            : {
                items: selected.map((item) => ({
                  product_id: item.product.id,
                  size: item.size,
                  quantity: Math.max(1, item.quantity),
                })),
              }),
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        toast.error(t("createError"), { description: data.error });
        return;
      }

      setResult(data as GeneratedLink);
      toast.success(t("linkReady"));
      setSelected([]);
      setAmount("");
      setDescription("");
      loadLinks();
    } catch {
      toast.error(t("createError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const linkStatus = (link: LinkRow): { label: string; className: string } => {
    if (link.paymentStatus === "Pagado") {
      return { label: t("statusPaid"), className: "bg-green-100 text-green-800 border-green-200" };
    }
    if (link.paymentStatus === "Fallido") {
      return { label: t("statusFailed"), className: "bg-red-100 text-red-800 border-red-200" };
    }
    // Un enlace vencido queda Cancelado por el webhook; mostrarlo como Vencido
    if (link.expiresAt && new Date(link.expiresAt).getTime() < now) {
      return { label: t("statusExpired"), className: "bg-gray-100 text-gray-700 border-gray-200" };
    }
    if (link.status === "Cancelado") {
      return { label: t("statusCancelled"), className: "bg-gray-100 text-gray-700 border-gray-200" };
    }
    return { label: t("statusPending"), className: "bg-amber-100 text-amber-800 border-amber-200" };
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Link2 className="h-6 w-6 text-[#D4AF37]" />
          {t("title")}
        </h2>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className={`grid gap-6 ${result ? "lg:grid-cols-[1fr_380px]" : ""}`}>
        {/* Formulario */}
        <form onSubmit={handleSubmit} className="rounded-lg border bg-card p-6 space-y-6">
          <Tabs value={mode} onValueChange={(value) => setMode(value as Mode)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="products">{t("tabProducts")}</TabsTrigger>
              <TabsTrigger value="amount">{t("tabAmount")}</TabsTrigger>
            </TabsList>

            <TabsContent value="products" className="space-y-4 pt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={isLoadingProducts ? t("loadingProducts") : t("searchProducts")}
                  disabled={isLoadingProducts}
                  className="pl-9"
                />
                {search.trim() && (
                  <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover shadow-md max-h-80 overflow-auto">
                    {filteredProducts.length === 0 ? (
                      <p className="p-3 text-sm text-muted-foreground">{t("noProducts")}</p>
                    ) : (
                      filteredProducts.map((product) => (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => addProduct(product)}
                          className="flex w-full items-center gap-3 p-2 text-left hover:bg-accent"
                        >
                          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-muted">
                            {product.primary_image && (
                              <Image
                                src={product.primary_image}
                                alt={product.name}
                                fill
                                sizes="40px"
                                className="object-cover"
                              />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{product.name}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              {product.category_name} ·{" "}
                              {formatMoney(previewUnitPrice(product, null, currency, exchangeRate), currency)}
                            </p>
                          </div>
                          <Plus className="h-4 w-4 text-[#D4AF37]" />
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>{t("selectedProducts")}</Label>
                {selected.length === 0 ? (
                  <p className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
                    {t("noSelected")}
                  </p>
                ) : (
                  <div className="overflow-x-auto rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("product")}</TableHead>
                          <TableHead>{t("size")}</TableHead>
                          <TableHead className="w-24">{t("quantity")}</TableHead>
                          <TableHead className="text-right">{t("unitPrice")}</TableHead>
                          <TableHead className="w-12" />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selected.map((item) => {
                          const sizes = [...(item.product.sizes || [])].sort(
                            (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)
                          );
                          return (
                            <TableRow key={item.key}>
                              <TableCell className="font-medium">{item.product.name}</TableCell>
                              <TableCell>
                                {sizes.length > 0 ? (
                                  <Select
                                    value={item.size ?? NO_SIZE}
                                    onValueChange={(value) =>
                                      updateItem(item.key, { size: value === NO_SIZE ? null : value })
                                    }
                                  >
                                    <SelectTrigger className="w-32">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {sizes.map((size) => (
                                        <SelectItem key={size.id} value={size.size}>
                                          {size.size}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  <span className="text-sm text-muted-foreground">{t("noSize")}</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  min={1}
                                  max={99}
                                  value={item.quantity === 0 ? "" : item.quantity}
                                  onChange={(e) =>
                                    // Permitir borrar el campo mientras se escribe; se corrige al salir
                                    updateItem(item.key, {
                                      quantity: e.target.value === "" ? 0 : Math.min(99, Math.floor(Number(e.target.value) || 0)),
                                    })
                                  }
                                  onBlur={() => {
                                    if (item.quantity < 1) updateItem(item.key, { quantity: 1 });
                                  }}
                                  className="w-20"
                                />
                              </TableCell>
                              <TableCell className="text-right whitespace-nowrap">
                                {formatMoney(
                                  previewUnitPrice(item.product, item.size, currency, exchangeRate),
                                  currency
                                )}
                              </TableCell>
                              <TableCell>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeItem(item.key)}
                                  aria-label={t("remove")}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description-products">
                  {t("description")} <span className="font-normal text-muted-foreground">{t("optional")}</span>
                </Label>
                <Input
                  id="description-products"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t("descriptionOptionalPlaceholder")}
                  maxLength={200}
                />
              </div>
            </TabsContent>

            <TabsContent value="amount" className="space-y-4 pt-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="amount">
                    {t("amount")} <span className="text-red-600" aria-hidden="true">*</span>
                  </Label>
                  <Input
                    id="amount"
                    required
                    type="number"
                    min={0.01}
                    step={0.01}
                    inputMode="decimal"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description-amount">
                    {t("description")} <span className="text-red-600" aria-hidden="true">*</span>
                  </Label>
                  <Input
                    id="description-amount"
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t("descriptionPlaceholder")}
                    maxLength={200}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Campos comunes */}
          <div className="space-y-4 border-t pt-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{t("currency")}</Label>
                <Select value={currency} onValueChange={(value) => setCurrency(value as Currency)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MXN">MXN</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <p className="text-sm font-medium">{t("customerData")}</p>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="customer-name">{t("customerName")}</Label>
                <Input
                  id="customer-name"
                  autoComplete="off"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  maxLength={200}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer-email">{t("customerEmail")}</Label>
                <Input
                  id="customer-email"
                  autoComplete="off"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  maxLength={200}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer-whatsapp">{t("customerWhatsapp")}</Label>
                <Input
                  id="customer-whatsapp"
                  autoComplete="off"
                  inputMode="tel"
                  type="tel"
                  value={customerWhatsapp}
                  onChange={(e) => setCustomerWhatsapp(e.target.value)}
                  placeholder={t("whatsappHint")}
                  maxLength={40}
                />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border p-4 space-y-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <Checkbox
                checked={installmentsEnabled && currency === "MXN"}
                disabled={currency !== "MXN"}
                onCheckedChange={(checked) => setInstallmentsEnabled(checked === true)}
                className="mt-0.5"
              />
              <span>
                <span className="text-sm font-medium text-foreground">{t("installmentsLabel")}</span>
                <span className="block text-xs text-muted-foreground">
                  {currency === "MXN" ? t("installmentsHint") : t("installmentsOnlyMxn")}
                </span>
              </span>
            </label>
          </div>

          <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{t("estimatedTotal")}</p>
              <p className="text-2xl font-bold text-[#D4AF37]">{formatMoney(previewTotal, currency)}</p>
              <p className="text-xs text-muted-foreground">{t("previewNote")}</p>
              <div className="mt-3">
                <StripeBreakdown
                  total={previewTotal}
                  currency={currency}
                  fees={stripeFees}
                  exchangeRate={exchangeRate}
                  installments={installmentsEnabled && currency === "MXN"}
                  t={t}
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#D4AF37] text-[#1a1a1a] hover:bg-[#B8941E]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("generating")}
                </>
              ) : (
                <>
                  <Link2 className="mr-2 h-4 w-4" />
                  {t("generate")}
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Resultado: solo aparece cuando ya hay un enlace (antes mostraba una palomita vacía) */}
        {result && (
        <aside
          className="rounded-lg border border-green-200 bg-card p-6 h-fit space-y-4 order-first lg:order-none lg:sticky lg:top-4"
          aria-live="polite"
        >
          <h3 className="font-semibold flex items-center gap-2 text-green-700">
            <Check className="h-5 w-5" aria-hidden="true" />
            {t("linkReady")}
          </h3>
          {(
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">{t("order")}</p>
                <p className="font-mono font-medium">{result.orderNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("colTotal")}</p>
                <p className="text-xl font-bold text-[#D4AF37]">
                  {formatMoney(result.total, result.currency)}
                </p>
              </div>
              <StripeBreakdown
                total={result.total}
                currency={result.currency}
                fees={stripeFees}
                exchangeRate={exchangeRate}
                installments={result.installmentsEnabled}
                t={t}
              />
              <div className="rounded-md bg-muted p-3 text-xs [overflow-wrap:anywhere] select-all font-mono">{result.url}</div>
              <p className="text-xs text-muted-foreground">
                {t("expiresAt", { date: formatDate(result.expiresAt) })}
              </p>
              <div className="flex flex-col gap-2">
                <Button type="button" variant="outline" onClick={() => copyToClipboard(result.url)}>
                  {copiedUrl === result.url ? (
                    <Check className="mr-2 h-4 w-4" />
                  ) : (
                    <Copy className="mr-2 h-4 w-4" />
                  )}
                  {t("copy")}
                </Button>
                <Button asChild className="bg-[#25D366] text-white hover:bg-[#1DA851]">
                  <a
                    href={buildWhatsappUrl(result, customerName, customerWhatsapp)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    {t("sendWhatsapp")}
                  </a>
                </Button>
              </div>
            </div>
          )}
        </aside>
        )}
      </div>

      {/* Historial */}
      <div className="rounded-lg border bg-card">
        <div className="border-b p-4">
          <h3 className="font-semibold">{t("history")}</h3>
        </div>
        {isLoadingLinks ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-[#D4AF37]" />
          </div>
        ) : links.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">{t("noLinks")}</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("colNumber")}</TableHead>
                  <TableHead>{t("colDescription")}</TableHead>
                  <TableHead>{t("colCustomer")}</TableHead>
                  <TableHead className="text-right">{t("colTotal")}</TableHead>
                  <TableHead>{t("colStatus")}</TableHead>
                  <TableHead>{t("colExpires")}</TableHead>
                  <TableHead className="text-right">{t("colActions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {links.map((link) => {
                  const status = linkStatus(link);
                  const canShare =
                    !!link.url && status.label === t("statusPending");
                  return (
                    <TableRow key={link.id}>
                      <TableCell className="font-mono text-xs">{link.orderNumber}</TableCell>
                      <TableCell className="max-w-60 truncate">
                        {link.description || "—"}
                      </TableCell>
                      <TableCell className="max-w-45 truncate">{link.customerName}</TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        {formatMoney(link.total, link.currency)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={status.className}>
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                        {formatDate(link.expiresAt)}
                        {link.installmentsEnabled && (
                          <span className="block text-xs text-[#B8941E]">
                            {link.installmentsMonths
                              ? t("paidInMonths", { months: link.installmentsMonths })
                              : t("installmentsBadge")}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          {canShare && link.url && (
                            <>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => copyToClipboard(link.url as string)}
                                aria-label={t("copy")}
                              >
                                {copiedUrl === link.url ? (
                                  <Check className="h-4 w-4" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                              <Button variant="ghost" size="icon" asChild aria-label={t("sendWhatsapp")}>
                                <a
                                  href={buildWhatsappUrl(
                                    { url: link.url, total: link.total, currency: link.currency, expiresAt: link.expiresAt },
                                    link.customerName === "Por confirmar" ? "" : link.customerName,
                                    link.customerPhone === "Por confirmar" ? "" : link.customerPhone
                                  )}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <MessageCircle className="h-4 w-4 text-[#25D366]" />
                                </a>
                              </Button>
                            </>
                          )}
                          <Button variant="ghost" size="icon" asChild aria-label={t("viewOrders")}>
                            <Link href="/admin/pedidos">
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
