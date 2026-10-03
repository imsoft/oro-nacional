"use client";

import { useState, useEffect } from "react";
import { useRouter, Link } from "@/i18n/routing";
import { useLocale } from "next-intl";
import Image from "next/image";
import { ArrowLeft, CreditCard, Truck, CheckCircle2, AlertCircle } from "lucide-react";
import { Elements } from '@stripe/react-stripe-js';
import type { Stripe } from '@stripe/stripe-js';
import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCartStore } from "@/stores/cart-store";
import { useAuthStore } from "@/stores/auth-store";
import { supabase } from "@/lib/supabase/client";
import { getStripeClient } from "@/lib/stripe/client";
import { StripePaymentElement } from "@/components/checkout/stripe-payment-element";
import { useCurrency } from "@/contexts/currency-context";

// Pedido pendiente guardado para no duplicarlo si se recarga la página
const PENDING_CHECKOUT_KEY = "oro-nacional-pending-checkout";

interface PendingCheckout {
  signature: string;
  orderId: string;
  orderNumber: string;
  clientSecret: string;
  paymentIntentId: string;
  total: number;
}

const CheckoutPage = () => {
  const router = useRouter();
  const locale = useLocale() as 'es' | 'en';
  const { items } = useCartStore();
  const { user } = useAuthStore();
  const itemCount = useCartStore((state) => state.getItemCount());
  const { formatPrice, currency, convertPrice } = useCurrency();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [stripeClient, setStripeClient] = useState<Stripe | null>(null);
  const [stripeEnabled, setStripeEnabled] = useState(false);
  const [pending, setPending] = useState<PendingCheckout | null>(null);
  const clientSecret = pending?.clientSecret ?? null;

  // Datos de envío
  const [shippingData, setShippingData] = useState({
    fullName: user?.name || "",
    email: user?.email || "",
    phone: "",
    street: "",
    number: "",
    colony: "",
    city: "",
    state: "",
    zipCode: "",
  });

  // Los precios del carrito están en MXN; convertir a la moneda del idioma actual.
  // Es solo para mostrar: el monto que se cobra lo calcula el servidor.
  const cartTotal = items.reduce(
    (sum, item) => sum + convertPrice(item.price, item.priceUSD) * item.quantity,
    0
  );
  // Una vez creado el pedido, mostrar el total confirmado por el servidor
  const finalTotal = pending?.total ?? cartTotal;

  // Identifica el contenido del carrito + datos de envío de un pedido pendiente
  const checkoutSignature = JSON.stringify({
    currency,
    items: items.map((item) => [item.id, item.size ?? null, item.quantity]),
    shippingData,
  });

  const isShippingComplete = Boolean(
    shippingData.fullName && shippingData.email && shippingData.phone &&
    shippingData.street && shippingData.number && shippingData.colony &&
    shippingData.city && shippingData.state && shippingData.zipCode
  );

  // Inicializar Stripe
  useEffect(() => {
    const initStripe = async () => {
      const stripe = await getStripeClient();
      if (stripe) {
        setStripeClient(stripe);
        setStripeEnabled(true);
      }
    };
    initStripe();
  }, []);

  // Recuperar un pedido pendiente tras recargar la página
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(PENDING_CHECKOUT_KEY);
      if (!saved) return;
      const parsed = JSON.parse(saved) as PendingCheckout;
      const savedState = JSON.parse(parsed.signature) as {
        currency: string;
        items: unknown;
        shippingData: typeof shippingData;
      };
      const currentItems = JSON.stringify(
        items.map((item) => [item.id, item.size ?? null, item.quantity])
      );
      // Solo sirve si el carrito y la moneda no cambiaron
      if (
        savedState.currency === currency &&
        JSON.stringify(savedState.items) === currentItems
      ) {
        setShippingData(savedState.shippingData);
        setPending(parsed);
      } else {
        sessionStorage.removeItem(PENDING_CHECKOUT_KEY);
      }
    } catch {
      sessionStorage.removeItem(PENDING_CHECKOUT_KEY);
    }
    // Solo al montar
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Redirigir si el carrito está vacío
    if (items.length === 0) {
      router.push("/cart");
    }
  }, [items, router]);

  const handleShippingChange = (field: string, value: string) => {
    setShippingData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    // Validar datos de envío
    if (!isShippingComplete) {
      setError("Por favor completa todos los campos de envío");
      return false;
    }

    return true;
  };

  // Crear el pedido y el pago en el servidor. El navegador solo manda qué
  // productos quiere; precios y total se calculan en el servidor.
  const startPayment = async () => {
    setError("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;

      // Crear un timeout para la solicitud
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos

      // Si había un pedido pendiente con otros datos, el servidor lo cancela
      let previous: { orderId: string; paymentIntentId: string } | undefined;
      try {
        const saved = sessionStorage.getItem(PENDING_CHECKOUT_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as PendingCheckout;
          previous = { orderId: parsed.orderId, paymentIntentId: parsed.paymentIntentId };
        }
      } catch {
        // Ignorar datos guardados corruptos
      }

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          customer_name: shippingData.fullName,
          customer_email: shippingData.email,
          customer_phone: shippingData.phone,
          shipping_address: `${shippingData.street} ${shippingData.number}, ${shippingData.colony}`,
          shipping_city: shippingData.city,
          shipping_state: shippingData.state,
          shipping_zip_code: shippingData.zipCode,
          shipping_country: "México",
          currency,
          locale,
          previous,
          items: items.map((item) => ({
            product_id: item.id,
            size: item.size ?? null,
            quantity: item.quantity,
          })),
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.clientSecret) {
        setError(data?.error || "No se pudo crear el pedido. Por favor intenta de nuevo.");
        return;
      }

      const newPending: PendingCheckout = {
        signature: checkoutSignature,
        orderId: data.orderId,
        orderNumber: data.orderNumber,
        clientSecret: data.clientSecret,
        paymentIntentId: data.paymentIntentId,
        total: data.total,
      };
      sessionStorage.setItem(PENDING_CHECKOUT_KEY, JSON.stringify(newPending));
      setPending(newPending);
    } catch (err) {
      console.error('Error:', err);
      if (err instanceof Error && err.name === 'AbortError') {
        setError('La solicitud tardó demasiado. Por favor intenta de nuevo.');
      } else {
        setError('Error al crear el pago. Por favor intenta de nuevo.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Volver a editar los datos de envío: se descarta el pago preparado y al
  // continuar se crea un pedido nuevo (el anterior se cancela en el servidor).
  const handleEditShipping = () => {
    setPending(null);
    setError("");
  };

  // Manejar pago exitoso con Stripe
  const handleStripePaymentSuccess = (paymentIntentId: string) => {
    // Los correos y la confirmación del pedido se hacen en el servidor
    // (webhook de Stripe / verificación en la página de confirmación).
    sessionStorage.removeItem(PENDING_CHECKOUT_KEY);
    if (pending) {
      localStorage.setItem("lastOrderNumber", pending.orderNumber);
    }

    const query = new URLSearchParams({
      payment_intent: paymentIntentId,
      payment_intent_client_secret: pending?.clientSecret ?? "",
    });
    router.push(`/checkout/confirmacion?${query.toString()}`);
  };

  // Manejar pago fallido con Stripe
  const handleStripePaymentError = (error: string) => {
    setError(error);
    setIsLoading(false);
  };

  // El pago se hace con el formulario de Stripe; este submit solo evita el
  // envío nativo del formulario (p. ej. al presionar Enter).
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pending) {
      await startPayment();
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 mx-auto max-w-7xl px-6 lg:px-8 py-24 lg:py-32">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/cart"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al carrito
          </Link>
          <h1 className="text-3xl font-semibold text-foreground">
            Finalizar Compra
          </h1>
          <p className="mt-2 text-muted-foreground">
            {itemCount} {itemCount === 1 ? "producto" : "productos"} - Total: {formatPrice(finalTotal)}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#D4AF37] text-white font-semibold">
                1
              </div>
              <span className="ml-2 text-sm font-medium text-foreground">Envío</span>
            </div>
            <div className="w-16 h-1 bg-[#D4AF37]"></div>
            <div className="flex items-center">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#D4AF37] text-white font-semibold">
                2
              </div>
              <span className="ml-2 text-sm font-medium text-foreground">Pago</span>
            </div>
            <div className="w-16 h-1 bg-muted"></div>
            <div className="flex items-center">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted text-muted-foreground font-semibold">
                3
              </div>
              <span className="ml-2 text-sm font-medium text-muted-foreground">Confirmación</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Formulario */}
            <div className="lg:col-span-2 space-y-8">
              {/* Datos de Envío */}
              <div className="rounded-2xl bg-card p-6 lg:p-8 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <Truck className="h-6 w-6 text-[#D4AF37]" />
                  <h2 className="text-xl font-semibold text-foreground">
                    Información de Envío
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="fullName">Nombre Completo *</Label>
                    <Input
                      disabled={Boolean(pending)}
                      id="fullName"
                      value={shippingData.fullName}
                      onChange={(e) => handleShippingChange("fullName", e.target.value)}
                      placeholder="Juan Pérez García"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Correo Electrónico *</Label>
                    <Input
                      disabled={Boolean(pending)}
                      id="email"
                      type="email"
                      value={shippingData.email}
                      onChange={(e) => handleShippingChange("email", e.target.value)}
                      placeholder="tu@email.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono *</Label>
                    <Input
                      disabled={Boolean(pending)}
                      id="phone"
                      type="tel"
                      value={shippingData.phone}
                      onChange={(e) => handleShippingChange("phone", e.target.value)}
                      placeholder="33 1234 5678"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="street">Calle *</Label>
                    <Input
                      disabled={Boolean(pending)}
                      id="street"
                      value={shippingData.street}
                      onChange={(e) => handleShippingChange("street", e.target.value)}
                      placeholder="Magno centro joyero, San Juan de Dios"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="number">Número *</Label>
                    <Input
                      disabled={Boolean(pending)}
                      id="number"
                      value={shippingData.number}
                      onChange={(e) => handleShippingChange("number", e.target.value)}
                      placeholder="123"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="colony">Colonia *</Label>
                    <Input
                      disabled={Boolean(pending)}
                      id="colony"
                      value={shippingData.colony}
                      onChange={(e) => handleShippingChange("colony", e.target.value)}
                      placeholder="Centro"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">Ciudad *</Label>
                    <Input
                      disabled={Boolean(pending)}
                      id="city"
                      value={shippingData.city}
                      onChange={(e) => handleShippingChange("city", e.target.value)}
                      placeholder="Guadalajara"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">Estado *</Label>
                    <Input
                      disabled={Boolean(pending)}
                      id="state"
                      value={shippingData.state}
                      onChange={(e) => handleShippingChange("state", e.target.value)}
                      placeholder="Jalisco"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="zipCode">Código Postal *</Label>
                    <Input
                      disabled={Boolean(pending)}
                      id="zipCode"
                      value={shippingData.zipCode}
                      onChange={(e) => handleShippingChange("zipCode", e.target.value)}
                      placeholder="44100"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Método de Pago */}
              <div className="rounded-2xl bg-card p-6 lg:p-8 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <CreditCard className="h-6 w-6 text-[#D4AF37]" />
                  <h2 className="text-xl font-semibold text-foreground">
                    Método de Pago
                  </h2>
                </div>

                {/* Mensaje informativo */}
                {!isShippingComplete && (
                  <div className="mb-6 p-4 rounded-lg bg-amber-50 border border-amber-200">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-amber-800">
                        <strong>Importante:</strong> Por favor completa todos los datos de envío arriba antes de proceder con el pago.
                      </p>
                    </div>
                  </div>
                )}

                {/* Pago con Tarjeta */}
                <div className="space-y-4 mt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <CreditCard className="h-5 w-5 text-[#D4AF37]" />
                    <h3 className="text-lg font-semibold text-foreground">
                      Pago con Tarjeta
                    </h3>
                  </div>
                    {stripeEnabled && clientSecret && stripeClient ? (
                      <>
                        <div className="flex items-center justify-between gap-4 p-4 rounded-lg bg-muted/50 text-sm">
                          <p className="text-muted-foreground">
                            Pedido <span className="font-medium text-foreground">{pending?.orderNumber}</span> listo para pagar.
                          </p>
                          <Button type="button" variant="outline" size="sm" onClick={handleEditShipping}>
                            Editar datos de envío
                          </Button>
                        </div>
                        <Elements key={clientSecret} stripe={stripeClient} options={{ clientSecret }}>
                          <StripePaymentElement
                            clientSecret={clientSecret}
                            onSuccess={handleStripePaymentSuccess}
                            onError={handleStripePaymentError}
                            isLoading={isLoading}
                          />
                        </Elements>
                      </>
                    ) : stripeEnabled && !clientSecret ? (
                      <Button
                        type="button"
                        onClick={startPayment}
                        disabled={isLoading || !isShippingComplete}
                        className="w-full bg-[#D4AF37] hover:bg-[#B8941E] text-white"
                        size="lg"
                      >
                        {isLoading ? "Preparando pago..." : "Continuar al pago con tarjeta"}
                      </Button>
                    ) : !stripeEnabled ? (
                      <div className="p-4 rounded-lg bg-muted">
                        <p className="text-sm text-muted-foreground">
                          El pago con tarjeta no está disponible en este momento. Por favor contacta con soporte.
                        </p>
                      </div>
                    ) : null}
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 p-4 rounded-lg bg-red-50 border border-red-200">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
            </div>

            {/* Resumen */}
            <div className="lg:col-span-1">
              <div className="rounded-2xl bg-card p-6 shadow-lg sticky top-24">
                <h2 className="text-xl font-semibold text-foreground mb-6">
                  Resumen del Pedido
                </h2>

                {/* Items */}
                <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto">
                  {items.map((item) => (
                    <div key={`${item.id}-${item.size}`} className="flex gap-3">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Cantidad: {item.quantity}
                        </p>
                        <p className="text-sm font-medium text-[#D4AF37]">
                          {formatPrice(convertPrice(item.price, item.priceUSD) * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totales */}
                <div className="space-y-3 border-t border-border pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal (precio de contado)</span>
                    <span className="font-medium">{formatPrice(finalTotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Envío</span>
                    <span className="font-medium text-green-600">GRATIS</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold border-t border-border pt-3 text-[#D4AF37]">
                    <span>Total a Pagar</span>
                    <span>{formatPrice(finalTotal)}</span>
                  </div>
                </div>

                {/* Seguridad */}
                <div className="mt-6 pt-6 border-t border-border">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>Pago 100% seguro y encriptado</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
};

export default CheckoutPage;
