"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/routing";
import { CheckCircle2, Package, Mail, Home, ShoppingBag, Loader2, AlertCircle, Clock } from "lucide-react";
import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cart-store";
import { useAuthStore } from "@/stores/auth-store";

type PaymentState = "checking" | "succeeded" | "processing" | "failed" | "unknown";

const ConfirmationPage = () => {
  const clearCart = useCartStore((state) => state.clearCart);
  const { user } = useAuthStore();
  const [orderNumber, setOrderNumber] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [paymentState, setPaymentState] = useState<PaymentState>("checking");

  useEffect(() => {
    // Stripe agrega estos parámetros al regresar de un pago con redirección;
    // el checkout los manda igual cuando el pago se confirma sin redirección.
    const params = new URLSearchParams(window.location.search);
    const paymentIntentId = params.get("payment_intent");
    const clientSecret = params.get("payment_intent_client_secret");

    const savedOrderNumber = localStorage.getItem("lastOrderNumber");
    if (savedOrderNumber) {
      setOrderNumber(savedOrderNumber);
    }

    if (!paymentIntentId || !clientSecret) {
      // Sin referencia de pago no se puede confirmar nada
      setPaymentState("unknown");
      return;
    }

    let cancelled = false;

    const verifyPayment = async () => {
      try {
        const response = await fetch("/api/checkout/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentIntentId, clientSecret }),
        });
        const data = await response.json().catch(() => null);
        if (cancelled) return;

        if (!response.ok || !data?.status) {
          setPaymentState("unknown");
          return;
        }

        if (data.orderNumber) setOrderNumber(data.orderNumber);
        if (data.email) setCustomerEmail(data.email);

        if (data.status === "succeeded" || data.status === "processing") {
          setPaymentState(data.status);
          // Solo vaciar el carrito cuando el pago realmente se hizo
          clearCart();
          localStorage.removeItem("lastOrderNumber");
          sessionStorage.removeItem("oro-nacional-pending-checkout");
        } else {
          setPaymentState("failed");
        }
      } catch {
        if (!cancelled) setPaymentState("unknown");
      }
    };

    verifyPayment();

    return () => {
      cancelled = true;
    };
  }, [clearCart]);

  if (paymentState !== "succeeded") {
    const content = {
      checking: {
        icon: <Loader2 className="h-12 w-12 text-[#D4AF37] animate-spin" />,
        title: "Verificando tu pago...",
        description: "Esto solo toma unos segundos.",
      },
      processing: {
        icon: <Clock className="h-12 w-12 text-[#D4AF37]" />,
        title: "Tu pago se está procesando",
        description:
          "Te enviaremos un correo de confirmación en cuanto se acredite. No es necesario que pagues de nuevo.",
      },
      failed: {
        icon: <AlertCircle className="h-12 w-12 text-red-600" />,
        title: "El pago no se completó",
        description:
          "No se realizó ningún cargo. Tus productos siguen en el carrito para que puedas intentarlo de nuevo.",
      },
      unknown: {
        icon: <AlertCircle className="h-12 w-12 text-amber-600" />,
        title: "No pudimos confirmar tu pago",
        description:
          "Si completaste el pago, recibirás un correo de confirmación. Si tienes dudas, contáctanos antes de intentar de nuevo.",
      },
    }[paymentState];

    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />

        <main className="flex-1 flex items-center justify-center px-6 pt-32 pb-24">
          <div className="w-full max-w-md text-center">
            <div className="mx-auto w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
              {content.icon}
            </div>
            <h1 className="text-2xl font-semibold text-foreground mb-2">
              {content.title}
            </h1>
            <p className="text-muted-foreground mb-2">{content.description}</p>
            {orderNumber && paymentState !== "checking" && (
              <p className="text-sm text-muted-foreground mb-6">
                Número de pedido:{" "}
                <span className="font-medium text-foreground">{orderNumber}</span>
              </p>
            )}

            {paymentState !== "checking" && (
              <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
                {paymentState === "failed" && (
                  <Button asChild size="lg" className="bg-[#D4AF37] hover:bg-[#B8941E] text-white">
                    <Link href="/checkout">Intentar de nuevo</Link>
                  </Button>
                )}
                <Button asChild size="lg" variant="outline">
                  <Link href="/contact">Contáctanos</Link>
                </Button>
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-6 pt-32 pb-24">
        <div className="w-full max-w-2xl">
          {/* Success Icon */}
          <div className="text-center mb-8">
            <div className="mx-auto w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-6 animate-[scale-in_0.5s_ease-out]">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-semibold text-foreground mb-2">
              ¡Pedido Confirmado!
            </h1>
            <p className="text-muted-foreground">
              Tu compra ha sido procesada exitosamente
            </p>
          </div>

          {/* Order Details */}
          <div className="rounded-2xl bg-card p-8 shadow-lg mb-8">
            <div className="text-center mb-6 pb-6 border-b border-border">
              <p className="text-sm text-muted-foreground mb-1">
                Número de pedido
              </p>
              <p className="text-2xl font-bold text-[#D4AF37]">
                {orderNumber}
              </p>
            </div>

            {/* Info Cards */}
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                <div className="rounded-full bg-[#D4AF37]/10 p-2 flex-shrink-0">
                  <Mail className="h-5 w-5 text-[#D4AF37]" />
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">
                    Confirmación enviada
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Hemos enviado un correo de confirmación a{" "}
                    <span className="font-medium text-foreground">
                      {customerEmail || user?.email || "tu correo"}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                <div className="rounded-full bg-[#D4AF37]/10 p-2 flex-shrink-0">
                  <Package className="h-5 w-5 text-[#D4AF37]" />
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">
                    Tiempo de entrega estimado
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Tu pedido llegará en 3-5 días hábiles. Recibirás un correo
                    con el número de rastreo cuando se envíe.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                <div className="rounded-full bg-[#D4AF37]/10 p-2 flex-shrink-0">
                  <CheckCircle2 className="h-5 w-5 text-[#D4AF37]" />
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">
                    ¿Qué sigue?
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Estamos preparando tu pedido con el mayor cuidado. Pronto
                    recibirás actualizaciones sobre el estado de tu envío.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              asChild
              size="lg"
              className="flex-1 bg-[#D4AF37] hover:bg-[#B8941E] text-white"
            >
              <Link href="/my-orders">
                <Package className="mr-2 h-5 w-5" />
                Ver Mis Pedidos
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="flex-1"
            >
              <Link href="/">
                <Home className="mr-2 h-5 w-5" />
                Volver al Inicio
              </Link>
            </Button>
          </div>

          {/* Continue Shopping */}
          <div className="mt-8 text-center">
            <Link
              href="/catalog"
              className="inline-flex items-center gap-2 text-sm text-[#D4AF37] hover:text-[#B8941E] transition-colors"
            >
              <ShoppingBag className="h-4 w-4" />
              Seguir Comprando
            </Link>
          </div>

          {/* Help Section */}
          <div className="mt-12 p-6 rounded-lg bg-muted/50 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              ¿Necesitas ayuda con tu pedido?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/contact"
                className="text-sm font-medium text-[#D4AF37] hover:underline"
              >
                Contáctanos
              </Link>
              <span className="hidden sm:block text-muted-foreground">•</span>
              <Link
                href="/faq"
                className="text-sm font-medium text-[#D4AF37] hover:underline"
              >
                Preguntas Frecuentes
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ConfirmationPage;
