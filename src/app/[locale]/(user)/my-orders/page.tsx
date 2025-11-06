"use client";

import { useEffect, useState } from "react";
import { useRouter, Link } from "@/i18n/routing";
import Image from "next/image";
import { Package, ArrowLeft, ShoppingBag, Loader2, Eye } from "lucide-react";
import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import { getUserOrders } from "@/lib/supabase/orders";
import type { Order, OrderStatus } from "@/types/order";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const MyOrdersPage = () => {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    } else {
      loadOrders();
    }
  }, [isAuthenticated, router]);

  const loadOrders = async () => {
    setIsLoading(true);
    const data = await getUserOrders();
    setOrders(data);
    setIsLoading(false);
  };

  const getStatusColor = (status: OrderStatus) => {
    const colors: Record<OrderStatus, string> = {
      Pendiente: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      Procesando: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      Enviado: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      Entregado: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      Cancelado: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 mx-auto max-w-7xl px-6 lg:px-8 py-24 lg:py-32">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al inicio
          </Link>
          <h1 className="text-3xl font-semibold text-foreground">
            Mis Pedidos
          </h1>
          <p className="mt-2 text-muted-foreground">
            Bienvenido, {user?.name}
          </p>
        </div>

        {/* Loading */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
          </div>
        ) : orders.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-16">
            <div className="mx-auto w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
              <Package className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              No tienes pedidos aún
            </h2>
            <p className="text-muted-foreground text-center max-w-md mb-8">
              Cuando realices tu primera compra, aparecerá aquí. Explora
              nuestro catálogo de joyas en oro.
            </p>
            <Button
              asChild
              className="bg-[#D4AF37] hover:bg-[#B8941E] text-white"
            >
              <Link href="/catalog">
                <ShoppingBag className="mr-2 h-5 w-5" />
                Ir al Catálogo
              </Link>
            </Button>
          </div>
        ) : (
          /* Orders List */
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl bg-card border border-border p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">
                        Pedido {order.order_number}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Realizado el {formatDate(order.created_at)}
                    </p>
                  </div>
                  <div className="text-left lg:text-right">
                    <p className="text-sm text-muted-foreground mb-1">Total</p>
                    <p className="text-2xl font-bold text-[#D4AF37]">
                      ${order.total.toLocaleString("es-MX")} MXN
                    </p>
                  </div>
                </div>

                {/* Order Items Preview */}
                <div className="border-t border-border pt-4 mb-4">
                  <p className="text-sm font-medium text-foreground mb-3">
                    Productos ({order.items?.length || 0})
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {order.items?.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          {item.product_image ? (
                            <Image
                              src={item.product_image}
                              alt={item.product_name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                              Sin imagen
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {item.product_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Cantidad: {item.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {order.items && order.items.length > 3 && (
                    <p className="text-sm text-muted-foreground mt-3">
                      +{order.items.length - 3} productos más
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Eye className="mr-2 h-4 w-4" />
                        Ver Detalles
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Detalles del Pedido {order.order_number}</DialogTitle>
                        <DialogDescription>
                          Información completa de tu pedido
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-6 mt-4">
                        {/* Estado */}
                        <div>
                          <h4 className="font-semibold text-foreground mb-2">Estado del Pedido</h4>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>

                        {/* Dirección de Envío */}
                        <div>
                          <h4 className="font-semibold text-foreground mb-2">Dirección de Envío</h4>
                          <p className="text-sm text-muted-foreground">{order.customer_name}</p>
                          <p className="text-sm text-muted-foreground">{order.shipping_address}</p>
                          <p className="text-sm text-muted-foreground">
                            {order.shipping_city}, {order.shipping_state} {order.shipping_zip_code}
                          </p>
                        </div>

                        {/* Productos */}
                        <div>
                          <h4 className="font-semibold text-foreground mb-2">Productos</h4>
                          <div className="space-y-3">
                            {order.items?.map((item) => (
                              <div key={item.id} className="flex gap-3 pb-3 border-b border-border last:border-0">
                                <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                  {item.product_image && (
                                    <Image
                                      src={item.product_image}
                                      alt={item.product_name}
                                      fill
                                      className="object-cover"
                                    />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-foreground">{item.product_name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    Cantidad: {item.quantity} × ${item.unit_price.toLocaleString("es-MX")} MXN
                                  </p>
                                  <p className="text-sm font-medium text-[#D4AF37] mt-1">
                                    ${item.subtotal.toLocaleString("es-MX")} MXN
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Resumen */}
                        <div className="border-t border-border pt-4">
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Subtotal</span>
                              <span className="text-foreground">${order.subtotal.toLocaleString("es-MX")} MXN</span>
                            </div>
                            <div className="flex justify-between text-lg font-semibold border-t border-border pt-2">
                              <span className="text-foreground">Total</span>
                              <span className="text-[#D4AF37]">${order.total.toLocaleString("es-MX")} MXN</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default MyOrdersPage;
