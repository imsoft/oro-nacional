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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCartStore } from "@/stores/cart-store";
import { useAuthStore } from "@/stores/auth-store";
import { createOrder } from "@/lib/supabase/orders";
import { getStripeClient } from "@/lib/stripe/client";
import { StripePaymentElement } from "@/components/checkout/stripe-payment-element";
import { InstallmentSelector, type InstallmentOption } from "@/components/checkout/installment-selector";
import type { CreateOrderData, PaymentMethod } from "@/types/order";
import { getStoreSettings } from "@/lib/supabase/settings";
import type { StoreSettings } from "@/lib/supabase/settings";
import { Phone, Mail, MapPin } from "lucide-react";
import { useCurrency } from "@/contexts/currency-context";

const CheckoutPage = () => {
  const router = useRouter();
  const locale = useLocale() as 'es' | 'en';
  const { items, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const total = useCartStore((state) => state.getTotal());
  const itemCount = useCartStore((state) => state.getItemCount());
  const { formatPrice, currency, convertPrice, exchangeRate } = useCurrency();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [stripeClient, setStripeClient] = useState<Stripe | null>(null);
  const [stripeEnabled, setStripeEnabled] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null);

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

  // Método de pago
  const [paymentMethod, setPaymentMethod] = useState<"card" | "transfer" | "cash">("card");

  // Meses sin intereses
  const [selectedInstallments, setSelectedInstallments] = useState<InstallmentOption>(1);

  const shippingCost = 0; // Envío gratis
  // El total del carrito está en MXN, convertirlo a la moneda del contexto
  const finalTotalMXN = total + shippingCost;
  // Convertir a la moneda seleccionada para mostrar y para Stripe
  const finalTotal = currency === 'USD' 
    ? (exchangeRate > 0 ? finalTotalMXN / exchangeRate : finalTotalMXN)
    : finalTotalMXN;

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

  // Cargar datos de configuración de la tienda
  useEffect(() => {
    const loadSettings = async () => {
      const settings = await getStoreSettings();
      setStoreSettings(settings);
    };
    loadSettings();
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
    if (!shippingData.fullName || !shippingData.email || !shippingData.phone ||
        !shippingData.street || !shippingData.number || !shippingData.colony ||
        !shippingData.city || !shippingData.state || !shippingData.zipCode) {
      setError("Por favor completa todos los campos de envío");
      return false;
    }

    return true;
  };

  // Crear pedido antes de procesar el pago con Stripe
  const createOrderForStripe = async (): Promise<string | null> => {
    if (orderId) return orderId;

    const paymentMethodMap: Record<string, PaymentMethod> = {
      card: "Tarjeta",
      transfer: "Transferencia",
      cash: "Efectivo",
    };

    const orderData: CreateOrderData = {
      customer_name: shippingData.fullName,
      customer_email: shippingData.email,
      customer_phone: shippingData.phone,
      shipping_address: `${shippingData.street} ${shippingData.number}, ${shippingData.colony}`,
      shipping_city: shippingData.city,
      shipping_state: shippingData.state,
      shipping_zip_code: shippingData.zipCode,
      shipping_country: "México",
      payment_method: paymentMethodMap[paymentMethod],
      items: items.map((item) => ({
        product_id: item.id,
        product_name: item.name,
        product_slug: item.slug,
        product_sku: undefined,
        product_image: item.image,
        quantity: item.quantity,
        unit_price: item.price,
        size: item.size,
        material: item.material,
      })),
    };

    const result = await createOrder(orderData);
    if (result.success && result.order) {
      setOrderId(result.order.id);
      return result.order.id;
    }
    return null;
  };

  // Limpiar clientSecret cuando cambia el método de pago
  useEffect(() => {
    if (paymentMethod !== 'card') {
      setClientSecret(null);
      setOrderId(null);
    }
  }, [paymentMethod]);

  // Manejar pago exitoso con Stripe
  const handleStripePaymentSuccess = async (paymentIntentId: string) => {
    try {
      if (!orderId) {
        setError("Error: No se encontró el ID del pedido");
        return;
      }

      // Enviar correos electrónicos
      try {
        const emailResponse = await fetch('/api/email/order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderId: orderId,
            locale,
          }),
        });

        if (!emailResponse.ok) {
          console.error('Error sending emails:', await emailResponse.text());
        }
      } catch (error) {
        console.error('Error sending emails:', error);
      }

      // Limpiar carrito
      clearCart();

      // Guardar información del pedido
      localStorage.setItem("lastOrderNumber", orderId);
      localStorage.setItem("paymentIntentId", paymentIntentId);

      // Redirigir a página de confirmación
      router.push("/checkout/confirmacion");
    } catch (err) {
      console.error("Error after payment:", err);
      setError("Error al procesar el pedido después del pago");
    }
  };

  // Manejar pago fallido con Stripe
  const handleStripePaymentError = (error: string) => {
    setError(error);
    setIsLoading(false);
  };

  // Manejar submit para métodos de pago que no son tarjeta
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    // Si es pago con tarjeta y Stripe está habilitado, el pago se maneja con Stripe Payment Element
    // No crear el pedido directamente, debe pasar por el flujo de Stripe
    if (paymentMethod === 'card' && stripeEnabled) {
      setError("Por favor, primero crea el Payment Intent haciendo clic en 'Continuar al pago con tarjeta'");
      return;
    }

    setIsLoading(true);

    try {
      const paymentMethodMap: Record<string, PaymentMethod> = {
        card: "Tarjeta",
        transfer: "Transferencia",
        cash: "Efectivo",
      };

      const orderData: CreateOrderData = {
        customer_name: shippingData.fullName,
        customer_email: shippingData.email,
        customer_phone: shippingData.phone,
        shipping_address: `${shippingData.street} ${shippingData.number}, ${shippingData.colony}`,
        shipping_city: shippingData.city,
        shipping_state: shippingData.state,
        shipping_zip_code: shippingData.zipCode,
        shipping_country: "México",
        payment_method: paymentMethodMap[paymentMethod],
        items: items.map((item) => ({
          product_id: item.id,
          product_name: item.name,
          product_slug: item.slug,
          product_sku: undefined,
          product_image: item.image,
          quantity: item.quantity,
          unit_price: item.price,
          size: item.size,
          material: item.material,
        })),
      };

      const result = await createOrder(orderData);

      if (!result.success || !result.order) {
        setError(result.error || "Error al procesar el pedido");
        setIsLoading(false);
        return;
      }

      // Enviar correos electrónicos
      try {
        const emailResponse = await fetch('/api/email/order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderId: result.order.id,
            locale,
          }),
        });

        if (!emailResponse.ok) {
          console.error('Error sending emails:', await emailResponse.text());
        }
      } catch (error) {
        console.error('Error sending emails:', error);
      }

      // Guardar el número de pedido en localStorage para la página de confirmación
      localStorage.setItem("lastOrderNumber", result.order.order_number);

      // Limpiar carrito
      clearCart();

      // Redirigir a página de confirmación
      router.push("/checkout/confirmacion");
    } catch (err) {
      console.error("Error al procesar el pedido:", err);
      setError("Error inesperado al procesar el pedido. Por favor intenta de nuevo.");
      setIsLoading(false);
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

                <Tabs value={paymentMethod} onValueChange={(value) => {
                  setPaymentMethod(value as "card" | "transfer" | "cash");
                  setClientSecret(null);
                  setOrderId(null);
                  // Resetear MSI al cambiar de método de pago
                  setSelectedInstallments(1);
                }}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="card">Tarjeta</TabsTrigger>
                    <TabsTrigger value="transfer">Transferencia</TabsTrigger>
                    <TabsTrigger value="cash">Efectivo</TabsTrigger>
                  </TabsList>

                  <TabsContent value="card" className="space-y-4 mt-6">
                    {/* Selector de Meses Sin Intereses */}
                    {stripeEnabled && currency === 'MXN' && (
                      <InstallmentSelector
                        total={finalTotal}
                        selectedInstallments={selectedInstallments}
                        onInstallmentChange={(installments) => {
                          setSelectedInstallments(installments);
                          // Resetear clientSecret para forzar la creación de un nuevo payment intent
                          setClientSecret(null);
                          setOrderId(null);
                        }}
                      />
                    )}
                    {stripeEnabled && currency === 'USD' && (
                      <div className="rounded-lg bg-muted/50 p-4 border border-border">
                        <p className="text-sm text-muted-foreground">
                          Los meses sin intereses (MSI) están disponibles solo para pagos en MXN. 
                          Para usar MSI, cambia el idioma a Español.
                        </p>
                      </div>
                    )}

                    {stripeEnabled && clientSecret && stripeClient ? (
                      <Elements stripe={stripeClient} options={{ clientSecret }}>
                        <StripePaymentElement
                          clientSecret={clientSecret}
                          onSuccess={handleStripePaymentSuccess}
                          onError={handleStripePaymentError}
                          isLoading={isLoading}
                        />
                      </Elements>
                    ) : stripeEnabled && !clientSecret ? (
                      <Button
                        type="button"
                        onClick={async () => {
                          setIsLoading(true);
                          setError("");

                          try {
                            // Crear pedido
                            console.log('Creating order for Stripe...');
                            const createdOrderId = await createOrderForStripe();
                            console.log('Order created with ID:', createdOrderId);

                            if (!createdOrderId) {
                              setError("Error al crear el pedido");
                              setIsLoading(false);
                              return;
                            }

                            // Crear Payment Intent
                            console.log('Creating Payment Intent...');
                            // Determinar la moneda según el contexto (español → MXN, inglés → USD)
                            const stripeCurrency = currency.toLowerCase();
                            // El amount debe estar en unidades (el API lo convertirá a centavos)
                            const stripeAmount = currency === 'USD' 
                              ? finalTotal // Ya está en USD
                              : finalTotalMXN; // En MXN
                            
                            const response = await fetch('/api/stripe/create-payment-intent', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                amount: stripeAmount,
                                currency: stripeCurrency,
                                orderId: createdOrderId,
                                customerEmail: shippingData.email,
                                installments: selectedInstallments,
                              }),
                            });

                            if (!response.ok) {
                              const errorText = await response.text();
                              console.error('API Error:', response.status, errorText);
                              setError(`Error ${response.status}: ${errorText || 'No se pudo crear el pago'}`);
                              setIsLoading(false);
                              return;
                            }

                            const data = await response.json();
                            console.log('Payment Intent created:', data);
                            setClientSecret(data.clientSecret);
                          } catch (err) {
                            console.error('Error:', err);
                            setError(err instanceof Error ? err.message : 'Error desconocido');
                          } finally {
                            setIsLoading(false);
                          }
                        }}
                        disabled={isLoading || !shippingData.fullName || !shippingData.email || !shippingData.phone ||
                          !shippingData.street || !shippingData.number || !shippingData.colony ||
                          !shippingData.city || !shippingData.state || !shippingData.zipCode}
                        className="w-full bg-[#D4AF37] hover:bg-[#B8941E] text-white"
                        size="lg"
                      >
                        {isLoading ? "Preparando pago..." : "Continuar al pago con tarjeta"}
                      </Button>
                    ) : !stripeEnabled ? (
                      <div className="p-4 rounded-lg bg-muted">
                        <p className="text-sm text-muted-foreground">
                          El pago con tarjeta no está disponible en este momento. Por favor selecciona otro método de pago.
                        </p>
                      </div>
                    ) : null}
                  </TabsContent>

                  <TabsContent value="transfer" className="mt-6">
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg bg-muted">
                        <p className="text-sm text-muted-foreground mb-4">
                          Realiza tu transferencia bancaria y envía el comprobante. Recibirás los datos bancarios completos después de confirmar tu pedido.
                        </p>
                        <div className="space-y-2 text-sm">
                          <p className="font-medium">Banco: BBVA</p>
                          <p>Los datos completos se enviarán a tu correo</p>
                        </div>
                      </div>

                      {storeSettings && (
                        <div className="p-4 rounded-lg border border-[#D4AF37]/20 bg-[#D4AF37]/5">
                          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                            <Phone className="h-4 w-4 text-[#D4AF37]" />
                            Datos de Contacto
                          </h3>
                          <div className="space-y-2 text-sm">
                            {storeSettings.phone && (
                              <div className="flex items-start gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                <div>
                                  <span className="text-muted-foreground">Teléfono: </span>
                                  <a 
                                    href={`tel:${storeSettings.phone.replace(/\s/g, '')}`}
                                    className="text-foreground font-medium hover:text-[#D4AF37] transition-colors"
                                  >
                                    {storeSettings.phone}
                                  </a>
                                </div>
                              </div>
                            )}
                            {storeSettings.contact_email && (
                              <div className="flex items-start gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                <div>
                                  <span className="text-muted-foreground">Email: </span>
                                  <a 
                                    href={`mailto:${storeSettings.contact_email}`}
                                    className="text-foreground font-medium hover:text-[#D4AF37] transition-colors break-all"
                                  >
                                    {storeSettings.contact_email}
                                  </a>
                                </div>
                              </div>
                            )}
                            {storeSettings.address && (
                              <div className="flex items-start gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                <div className="text-foreground">
                                  <div className="font-medium">Dirección:</div>
                                  <div className="text-muted-foreground">
                                    {storeSettings.address}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="cash" className="mt-6">
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg bg-muted">
                        <p className="text-sm text-muted-foreground mb-4">
                          Podrás pagar en efectivo al recibir tu pedido. Nuestro repartidor
                          llevará una terminal para pagos con tarjeta también.
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Para coordinar la entrega y el pago, contáctanos usando los datos a continuación.
                        </p>
                      </div>

                      {storeSettings && (
                        <div className="p-4 rounded-lg border border-[#D4AF37]/20 bg-[#D4AF37]/5">
                          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                            <Phone className="h-4 w-4 text-[#D4AF37]" />
                            Datos de Contacto
                          </h3>
                          <div className="space-y-2 text-sm">
                            {storeSettings.phone && (
                              <div className="flex items-start gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                <div>
                                  <span className="text-muted-foreground">Teléfono: </span>
                                  <a 
                                    href={`tel:${storeSettings.phone.replace(/\s/g, '')}`}
                                    className="text-foreground font-medium hover:text-[#D4AF37] transition-colors"
                                  >
                                    {storeSettings.phone}
                                  </a>
                                </div>
                              </div>
                            )}
                            {storeSettings.contact_email && (
                              <div className="flex items-start gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                <div>
                                  <span className="text-muted-foreground">Email: </span>
                                  <a 
                                    href={`mailto:${storeSettings.contact_email}`}
                                    className="text-foreground font-medium hover:text-[#D4AF37] transition-colors break-all"
                                  >
                                    {storeSettings.contact_email}
                                  </a>
                                </div>
                              </div>
                            )}
                            {storeSettings.address && (
                              <div className="flex items-start gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                <div className="text-foreground">
                                  <div className="font-medium">Dirección:</div>
                                  <div className="text-muted-foreground">
                                    {storeSettings.address}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
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
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totales */}
                <div className="space-y-3 border-t border-border pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Envío</span>
                    <span className="font-medium text-green-600">GRATIS</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold border-t border-border pt-3">
                    <span>Total</span>
                    <span className="text-[#D4AF37]">{formatPrice(finalTotal)}</span>
                  </div>
                </div>

                {/* Botón - Solo mostrar si no es pago con tarjeta usando Stripe */}
                {!(paymentMethod === 'card' && stripeEnabled) && (
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full mt-6 bg-[#D4AF37] hover:bg-[#B8941E] text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? "Procesando..." : "Confirmar Pedido"}
                  </Button>
                )}

                {/* Seguridad */}
                <div className="mt-6 pt-6 border-t border-border">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>Pago 100% seguro y encriptado</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>Garantía de satisfacción 30 días</span>
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
