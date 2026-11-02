"use client";

import { use, useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import type { Stripe } from "@stripe/stripe-js";
import { AlertCircle, CalendarClock, Loader2, Lock, MessageCircle } from "lucide-react";
import { useRouter } from "@/i18n/routing";
import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getStripeClient } from "@/lib/stripe/client";
import { getWhatsAppHref } from "@/lib/whatsapp";
import { SITE_CONTACT } from "@/lib/site-contact";

interface LinkInfo {
  orderNumber: string;
  description: string | null;
  items: Array<{ name: string; quantity: number; unitPrice: number }>;
  baseAmount: number;
  total: number;
  currency: "MXN" | "USD";
  months: number;
  monthly: number;
  expiresAt: string | null;
  state: "pending" | "paid" | "expired" | "cancelled";
  customer: { name: string; email: string; phone: string };
}

const formatMoney = (amount: number) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(amount);

/** Formulario de pago: datos del cliente + tarjeta (Stripe Payment Element). */
function PaymentForm({ orderId, info }: { orderId: string; info: LinkInfo }) {
  const t = useTranslations("paymentLink.pay");
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();

  const [name, setName] = useState(info.customer.name);
  const [email, setEmail] = useState(info.customer.email);
  const [phone, setPhone] = useState(info.customer.phone);
  const [isPaying, setIsPaying] = useState(false);
  const [error, setError] = useState("");

  const finish = useCallback(
    async (paymentIntentId: string, clientSecret: string) => {
      // Confirma el pedido y envía los correos sin esperar al webhook
      await fetch("/api/checkout/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentIntentId, clientSecret }),
      }).catch(() => undefined);
      router.push(`/pago/gracias?order=${encodeURIComponent(info.orderNumber)}`);
    },
    [info.orderNumber, router]
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) return;
    setError("");

    const phoneDigits = phone.replace(/\D/g, "");
    if (!name.trim() || !email.trim() || phoneDigits.length < 8) {
      setError(t("errorCustomer"));
      return;
    }

    setIsPaying(true);
    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setError(submitError.message || t("errorGeneric"));
        return;
      }

      const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
        elements,
        params: { billing_details: { name: name.trim(), email: email.trim(), phone: phoneDigits } },
      });
      if (pmError || !paymentMethod) {
        setError(pmError?.message || t("errorGeneric"));
        return;
      }

      const response = await fetch(`/api/pago/${orderId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethodId: paymentMethod.id, name, email, phone }),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.clientSecret) {
        setError(data?.error || t("errorGeneric"));
        return;
      }

      let status: string = data.status;
      if (status === "requires_action") {
        // Verificación del banco (3D Secure)
        const { error: actionError, paymentIntent } = await stripe.handleNextAction({
          clientSecret: data.clientSecret,
        });
        if (actionError) {
          setError(actionError.message || t("errorGeneric"));
          return;
        }
        status = paymentIntent?.status || status;
      }

      if (status === "succeeded" || status === "processing") {
        await finish(data.paymentIntentId, data.clientSecret);
        return;
      }

      setError(t("errorDeclined"));
    } catch {
      setError(t("errorGeneric"));
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold text-foreground mb-2">{t("yourData")}</legend>
        <div className="space-y-2">
          <Label htmlFor="pay-name">
            {t("name")} <span className="text-red-600" aria-hidden="true">*</span>
          </Label>
          <Input id="pay-name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="pay-email">
              {t("email")} <span className="text-red-600" aria-hidden="true">*</span>
            </Label>
            <Input
              id="pay-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pay-phone">
              WhatsApp <span className="text-red-600" aria-hidden="true">*</span>
            </Label>
            <Input
              id="pay-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="33 1234 5678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-lg font-semibold text-foreground mb-2">{t("card")}</legend>
        <p className="text-sm text-muted-foreground">{t("cardHint", { months: info.months })}</p>
        <div className="rounded-lg border border-border p-4 bg-background">
          <PaymentElement options={{ layout: "tabs", wallets: { applePay: "never", googlePay: "never" } }} />
        </div>
      </fieldset>

      {error && (
        <div role="alert" className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <Button
        type="submit"
        size="lg"
        disabled={!stripe || isPaying}
        className="w-full bg-[#D4AF37] text-[#1a1a1a] hover:bg-[#B8941E]"
      >
        {isPaying ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
            {t("paying")}
          </>
        ) : (
          <>
            <Lock className="mr-2 h-4 w-4" aria-hidden="true" />
            {t("payButton", { total: formatMoney(info.total), months: info.months })}
          </>
        )}
      </Button>
      <p className="text-center text-xs text-muted-foreground">{t("secureNote")}</p>
    </form>
  );
}

export default function PaymentLinkPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params);
  const t = useTranslations("paymentLink.pay");
  const router = useRouter();
  const [info, setInfo] = useState<LinkInfo | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [stripeClient, setStripeClient] = useState<Stripe | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Regreso de una verificación del banco con redirección (3D Secure)
      const query = new URLSearchParams(window.location.search);
      const returnedIntent = query.get("payment_intent");
      const returnedSecret = query.get("payment_intent_client_secret");

      const [response, stripe] = await Promise.all([
        fetch(`/api/pago/${orderId}`).catch(() => null),
        getStripeClient(),
      ]);
      const data = response && response.ok ? ((await response.json()) as LinkInfo) : null;
      if (cancelled) return;

      if (!data) {
        setLoadError(true);
        return;
      }

      if (returnedIntent && returnedSecret) {
        await fetch("/api/checkout/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentIntentId: returnedIntent, clientSecret: returnedSecret }),
        }).catch(() => undefined);
        router.replace(`/pago/gracias?order=${encodeURIComponent(data.orderNumber)}`);
        return;
      }

      setStripeClient(stripe);
      setInfo(data);
    })();
    return () => {
      cancelled = true;
    };
  }, [orderId, router]);

  const contactHref =
    getWhatsAppHref(SITE_CONTACT.phone, info ? t("whatsappMessage", { order: info.orderNumber }) : undefined) ??
    "/contact";

  const notice = (title: string, body: string) => (
    <div className="mx-auto max-w-md text-center py-8">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <AlertCircle className="h-10 w-10 text-amber-600" aria-hidden="true" />
      </div>
      <h1 className="text-2xl font-semibold text-foreground mb-2">{title}</h1>
      <p className="text-muted-foreground mb-6">{body}</p>
      <Button asChild variant="outline">
        <a href={contactHref} target="_blank" rel="noopener noreferrer">
          <MessageCircle className="mr-2 h-4 w-4" aria-hidden="true" />
          {t("contact")}
        </a>
      </Button>
    </div>
  );

  let content: React.ReactNode;
  if (loadError) {
    content = notice(t("notFoundTitle"), t("notFoundBody"));
  } else if (!info) {
    content = (
      <div className="flex justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" aria-label={t("loading")} />
      </div>
    );
  } else if (info.state === "paid") {
    content = notice(t("paidTitle"), t("paidBody", { order: info.orderNumber }));
  } else if (info.state === "expired") {
    content = notice(t("expiredTitle"), t("expiredBody"));
  } else if (info.state === "cancelled") {
    content = notice(t("cancelledTitle"), t("cancelledBody"));
  } else if (!stripeClient) {
    content = notice(t("unavailableTitle"), t("unavailableBody"));
  } else {
    content = (
      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0 rounded-2xl bg-card p-5 sm:p-8 shadow-lg">
          <Elements
            stripe={stripeClient}
            options={{
              mode: "payment",
              amount: Math.round(info.total * 100),
              currency: "mxn",
              paymentMethodCreation: "manual",
              paymentMethodTypes: ["card"],
              locale: "es",
              appearance: {
                theme: "stripe",
                variables: { colorPrimary: "#B8941E", borderRadius: "8px" },
              },
            }}
          >
            <PaymentForm orderId={orderId} info={info} />
          </Elements>
        </div>

        {/* Resumen */}
        <aside className="min-w-0 rounded-2xl bg-card p-5 sm:p-6 shadow-lg h-fit space-y-4 order-first lg:order-none">
          <div>
            <p className="text-sm text-muted-foreground">{t("order")}</p>
            <p className="font-mono font-medium">{info.orderNumber}</p>
          </div>
          {info.description && <p className="text-sm text-foreground">{info.description}</p>}
          <ul className="space-y-2 text-sm border-t border-border pt-4">
            {info.items.map((item, index) => (
              <li key={index} className="flex justify-between gap-4">
                <span className="text-muted-foreground [overflow-wrap:anywhere]">
                  {item.quantity > 1 ? `${item.quantity} × ` : ""}
                  {item.name}
                </span>
                <span className="font-medium tabular-nums whitespace-nowrap">
                  {formatMoney(item.unitPrice * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <div className="border-t border-border pt-4">
            <div className="flex items-baseline justify-between gap-4">
              <span className="font-semibold text-foreground">{t("total")}</span>
              <span className="text-2xl font-bold text-[#B8941E] tabular-nums">{formatMoney(info.total)}</span>
            </div>
            <div className="mt-3 flex items-start gap-2 rounded-lg bg-[#D4AF37]/10 p-3 text-sm text-foreground">
              <CalendarClock className="h-5 w-5 flex-shrink-0 text-[#B8941E]" aria-hidden="true" />
              <span>{t("monthlyLine", { months: info.months, monthly: formatMoney(info.monthly) })}</span>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">{t("financingNote", { months: info.months })}</p>
          </div>
        </aside>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 w-full mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-32 pb-24">
        {info && info.state === "pending" && stripeClient && (
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-foreground">{t("title")}</h1>
            <p className="mt-2 text-muted-foreground">{t("subtitle", { months: info.months })}</p>
          </div>
        )}
        {content}
      </main>
      <Footer />
    </div>
  );
}
