"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import {
  Package,
  ShoppingCart,
  FileText,
  TrendingUp,
  DollarSign,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getDashboardData } from "@/lib/supabase/dashboard";
import { getOrderById } from "@/lib/supabase/orders";
import type { DashboardData } from "@/types/dashboard";
import type { Order } from "@/types/order";

export default function AdminDashboard() {
  const t = useTranslations('admin.dashboard');
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoadingOrder, setIsLoadingOrder] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    const dashboardData = await getDashboardData();
    setData(dashboardData);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleViewOrder = async (orderId: string) => {
    setIsLoadingOrder(true);
    setIsDialogOpen(true);
    try {
      const order = await getOrderById(orderId);
      setSelectedOrder(order);
    } catch (error) {
      console.error("Error loading order:", error);
    } finally {
      setIsLoadingOrder(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Entregado":
      case "Delivered":
        return "bg-green-100 text-green-800";
      case "Enviado":
      case "Shipped":
        return "bg-blue-100 text-blue-800";
      case "Procesando":
      case "Processing":
        return "bg-yellow-100 text-yellow-800";
      case "Pendiente":
      case "Pending":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusTranslation = (status: string) => {
    switch (status) {
      case "Entregado":
        return t('delivered');
      case "Enviado":
        return t('shipped');
      case "Procesando":
        return t('processing');
      case "Pendiente":
        return t('pending');
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{t('errorLoading')}</p>
      </div>
    );
  }

  const stats = [
    {
      name: t('totalSales'),
      value: `$${data.stats.sales.total_sales.toLocaleString("es-MX")} MXN`,
      change: `${data.stats.sales.growth_percentage >= 0 ? "+" : ""}${data.stats.sales.growth_percentage.toFixed(1)}%`,
      changeType: data.stats.sales.growth_percentage >= 0 ? "positive" : "negative",
      icon: DollarSign,
    },
    {
      name: t('orders'),
      value: data.stats.orders.total_orders.toString(),
      change: `${data.stats.orders.growth_percentage >= 0 ? "+" : ""}${data.stats.orders.growth_percentage.toFixed(1)}%`,
      changeType: data.stats.orders.growth_percentage >= 0 ? "positive" : "negative",
      icon: ShoppingCart,
    },
    {
      name: t('products'),
      value: data.stats.products.total_products.toString(),
      change: data.stats.products.new_products_this_month > 0
        ? `+${data.stats.products.new_products_this_month} ${t('newProducts')}`
        : t('noNewProducts'),
      changeType: "neutral",
      icon: Package,
    },
    {
      name: t('lowStock'),
      value: data.stats.products.low_stock_products.toString(),
      change: t('productsWithLowStock'),
      changeType: data.stats.products.low_stock_products > 5 ? "negative" : "neutral",
      icon: FileText,
    },
  ];
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">{t('title')}</h1>
        <p className="mt-2 text-muted-foreground">
          {t('subtitle')}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="overflow-hidden rounded-lg bg-card border border-border p-6 shadow-sm"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="rounded-lg bg-[#D4AF37]/10 p-3">
                    <Icon className="h-6 w-6 text-[#D4AF37]" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <dl className="space-y-1">
                    <dt className="text-sm font-medium text-muted-foreground truncate">
                      {stat.name}
                    </dt>
                    <dd className="space-y-1">
                      <div className="text-2xl font-semibold text-foreground break-words">
                        {stat.value}
                      </div>
                      <div
                        className={`flex items-center text-sm font-semibold ${
                          stat.changeType === "positive"
                            ? "text-green-600"
                            : stat.changeType === "negative"
                            ? "text-red-600"
                            : "text-muted-foreground"
                        }`}
                      >
                        {stat.changeType === "positive" && (
                          <TrendingUp className="h-4 w-4 mr-1 flex-shrink-0" />
                        )}
                        <span className="truncate">{stat.change}</span>
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Orders */}
      <div className="rounded-lg bg-card border border-border shadow-sm">
        <div className="px-6 py-5 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            {t('recentOrders')}
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('orderId')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('customer')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('paymentMethod')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('amount')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('date')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {data.recentOrders.length > 0 ? (
                data.recentOrders.map((order) => (
                  <tr 
                    key={order.id} 
                    className="hover:bg-muted/50 cursor-pointer"
                    onClick={() => handleViewOrder(order.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                      {order.order_number}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      <div className="space-y-1">
                        <div className="font-medium text-foreground">{order.customer_name}</div>
                        <div className="text-xs">{order.customer_email}</div>
                        <div className="text-xs">{order.customer_phone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      <div className="space-y-1">
                        <div>{order.payment_method}</div>
                        <span
                          className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                            order.payment_status === "Pagado" || order.payment_status === "Paid"
                              ? "bg-green-100 text-green-800"
                              : order.payment_status === "Pendiente" || order.payment_status === "Pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : order.payment_status === "Fallido" || order.payment_status === "Failed"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {order.payment_status === "Pagado" ? t('paid') :
                           order.payment_status === "Pendiente" ? t('pending') :
                           order.payment_status === "Fallido" ? t('failed') : order.payment_status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                      ${order.total.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                          order.status === "Entregado" || order.status === "Delivered"
                            ? "bg-green-100 text-green-800"
                            : order.status === "Enviado" || order.status === "Shipped"
                            ? "bg-blue-100 text-blue-800"
                            : order.status === "Procesando" || order.status === "Processing"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {order.status === "Entregado" ? t('delivered') :
                         order.status === "Enviado" ? t('shipped') :
                         order.status === "Procesando" ? t('processing') :
                         order.status === "Pendiente" ? t('pending') : order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString("es-MX", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-muted-foreground">
                    {t('noRecentOrders')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('orderDetails')}</DialogTitle>
            <DialogDescription>
              {selectedOrder?.order_number}
            </DialogDescription>
          </DialogHeader>

          {isLoadingOrder ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
            </div>
          ) : selectedOrder ? (
            <div className="space-y-6 mt-4">
              {/* Customer Information */}
              <div>
                <h4 className="font-semibold text-foreground mb-2">{t('customer')}</h4>
                <p className="text-sm text-muted-foreground">{selectedOrder.customer_name}</p>
                <p className="text-sm text-muted-foreground">{selectedOrder.customer_email}</p>
                {selectedOrder.customer_phone && (
                  <p className="text-sm text-muted-foreground">{selectedOrder.customer_phone}</p>
                )}
              </div>

              {/* Shipping Address */}
              <div>
                <h4 className="font-semibold text-foreground mb-2">Dirección de Envío</h4>
                <p className="text-sm text-muted-foreground">{selectedOrder.shipping_address}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedOrder.shipping_city}, {selectedOrder.shipping_state} {selectedOrder.shipping_zip_code}
                </p>
                <p className="text-sm text-muted-foreground">{selectedOrder.shipping_country}</p>
              </div>

              {/* Order Status */}
              <div>
                <h4 className="font-semibold text-foreground mb-2">{t('status')}</h4>
                <div className="flex gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Estado del Pedido</p>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                      {getStatusTranslation(selectedOrder.status)}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Estado de Pago</p>
                    <span
                      className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        selectedOrder.payment_status === "Pagado"
                          ? "bg-green-100 text-green-800"
                          : selectedOrder.payment_status === "Pendiente"
                          ? "bg-yellow-100 text-yellow-800"
                          : selectedOrder.payment_status === "Fallido"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {selectedOrder.payment_status === "Pagado" ? t('paid') :
                       selectedOrder.payment_status === "Pendiente" ? t('pending') :
                       selectedOrder.payment_status === "Fallido" ? t('failed') : selectedOrder.payment_status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="font-semibold text-foreground mb-3">Productos ({selectedOrder.items?.length || 0})</h4>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item) => (
                    <div key={item.id} className="flex gap-4 pb-3 border-b border-border last:border-0">
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
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
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{item.product_name}</p>
                        {item.size && (
                          <p className="text-xs text-muted-foreground">Talla: {item.size}</p>
                        )}
                        {item.material && (
                          <p className="text-xs text-muted-foreground">Material: {item.material}</p>
                        )}
                        <p className="text-sm text-muted-foreground mt-1">
                          Cantidad: {item.quantity} × ${item.unit_price.toLocaleString("es-MX")} MXN
                        </p>
                        <p className="text-sm font-semibold text-[#D4AF37] mt-1">
                          Subtotal: ${item.subtotal.toLocaleString("es-MX")} MXN
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="border-t border-border pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">${selectedOrder.subtotal.toLocaleString("es-MX")} MXN</span>
                  </div>
                  {selectedOrder.shipping_cost > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Envío</span>
                      <span className="text-foreground">${selectedOrder.shipping_cost.toLocaleString("es-MX")} MXN</span>
                    </div>
                  )}
                  {selectedOrder.tax > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">IVA</span>
                      <span className="text-foreground">${selectedOrder.tax.toLocaleString("es-MX")} MXN</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-semibold border-t border-border pt-2">
                    <span className="text-foreground">{t('amount')}</span>
                    <span className="text-[#D4AF37]">${selectedOrder.total.toLocaleString("es-MX")} MXN</span>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              {selectedOrder.payment_method && (
                <div>
                  <h4 className="font-semibold text-foreground mb-2">{t('paymentMethod')}</h4>
                  <p className="text-sm text-muted-foreground">{selectedOrder.payment_method}</p>
                </div>
              )}

              {/* Notes */}
              {selectedOrder.customer_notes && (
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Notas del Cliente</h4>
                  <p className="text-sm text-muted-foreground">{selectedOrder.customer_notes}</p>
                </div>
              )}

              {selectedOrder.admin_notes && (
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Notas del Admin</h4>
                  <p className="text-sm text-muted-foreground">{selectedOrder.admin_notes}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No se pudo cargar la información del pedido
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg bg-card border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="rounded-lg bg-[#D4AF37]/10 p-3">
                <Package className="h-6 w-6 text-[#D4AF37]" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-foreground truncate">
                {t('activeProducts')}
              </h3>
              <p className="text-2xl font-bold text-[#D4AF37] mt-1">
                {data.stats.products.active_products}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-card border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="rounded-lg bg-[#D4AF37]/10 p-3">
                <Package className="h-6 w-6 text-[#D4AF37]" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-foreground truncate">
                {t('lowStock')}
              </h3>
              <p className={`text-2xl font-bold mt-1 ${data.stats.products.low_stock_products > 5 ? "text-red-600" : "text-green-600"}`}>
                {data.stats.products.low_stock_products}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-card border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="rounded-lg bg-[#D4AF37]/10 p-3">
                <TrendingUp className="h-6 w-6 text-[#D4AF37]" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-foreground truncate">
                {t('currentMonthSales')}
              </h3>
              <p className="text-2xl font-bold text-green-600 mt-1 break-words">
                ${data.stats.sales.current_month_sales.toLocaleString("es-MX")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
