"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Search, Eye, Loader2, Package, DollarSign, TrendingUp, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getAllOrders, getOrderStats, updateOrderStatus, getOrderById } from "@/lib/supabase/orders";
import type { OrderListItem, OrderStatus, OrderStats, Order } from "@/types/order";
import Image from "next/image";

export default function OrdersAdmin() {
  const t = useTranslations('admin.orders');
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoadingOrder, setIsLoadingOrder] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const [ordersData, statsData] = await Promise.all([
      getAllOrders(),
      getOrderStats(),
    ]);
    setOrders(ordersData);
    setStats(statsData);
    setIsLoading(false);
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    const result = await updateOrderStatus(orderId, { status: newStatus });
    if (result.success) {
      loadData();
    }
  };

  const handleViewOrder = async (orderId: string) => {
    setIsLoadingOrder(true);
    const orderData = await getOrderById(orderId);
    setSelectedOrder(orderData);
    setIsLoadingOrder(false);
  };

  const getStatusColor = (status: OrderStatus) => {
    const colors: Record<OrderStatus, string> = {
      Pendiente: "bg-yellow-100 text-yellow-800",
      Procesando: "bg-blue-100 text-blue-800",
      Enviado: "bg-purple-100 text-purple-800",
      Entregado: "bg-green-100 text-green-800",
      Cancelado: "bg-red-100 text-red-800",
    };
    return colors[status];
  };

  const getStatusTranslation = (status: OrderStatus) => {
    const translations: Record<OrderStatus, string> = {
      Pendiente: t('pending'),
      Procesando: t('processing'),
      Enviado: t('shipped'),
      Entregado: t('delivered'),
      Cancelado: t('cancelled'),
    };
    return translations[status];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">{t('title')}</h1>
        <p className="mt-2 text-muted-foreground">
          {t('subtitle')}
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="rounded-lg bg-card p-6 shadow-sm border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('totalOrders')}</p>
                <p className="text-2xl font-bold text-foreground">{stats.total_orders}</p>
              </div>
              <Package className="h-8 w-8 text-[#D4AF37]" />
            </div>
          </div>

          <div className="rounded-lg bg-card p-6 shadow-sm border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('totalRevenue')}</p>
                <p className="text-2xl font-bold text-foreground">
                  ${stats.total_revenue.toLocaleString("es-MX")}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="rounded-lg bg-card p-6 shadow-sm border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('averageTicket')}</p>
                <p className="text-2xl font-bold text-foreground">
                  ${stats.average_order_value.toLocaleString("es-MX")}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="rounded-lg bg-card p-6 shadow-sm border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('pendingOrders')}</p>
                <p className="text-2xl font-bold text-foreground">{stats.pending_orders}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('searchPlaceholder')}
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t('status')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('allStatuses')}</SelectItem>
            <SelectItem value="Pendiente">{t('pending')}</SelectItem>
            <SelectItem value="Procesando">{t('processing')}</SelectItem>
            <SelectItem value="Enviado">{t('shipped')}</SelectItem>
            <SelectItem value="Entregado">{t('delivered')}</SelectItem>
            <SelectItem value="Cancelado">{t('cancelled')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders Table */}
      <div className="rounded-lg bg-card border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase">
                  {t('order')}
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase">
                  {t('customer')}
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase">
                  {t('total')}
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase">
                  {t('status')}
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase">
                  {t('date')}
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase">
                  {t('actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    {t('noOrdersFound')}
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-foreground">
                        {order.order_number}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {order.customer_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {order.customer_email}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-foreground">
                        ${order.total.toLocaleString("es-MX")} MXN
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Select
                        value={order.status}
                        onValueChange={(value) =>
                          handleStatusChange(order.id, value as OrderStatus)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {getStatusTranslation(order.status)}
                          </span>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pendiente">{t('pending')}</SelectItem>
                          <SelectItem value="Procesando">{t('processing')}</SelectItem>
                          <SelectItem value="Enviado">{t('shipped')}</SelectItem>
                          <SelectItem value="Entregado">{t('delivered')}</SelectItem>
                          <SelectItem value="Cancelado">{t('cancelled')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewOrder(order.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>{t('orderDetails')}</DialogTitle>
                            <DialogDescription>
                              {order.order_number}
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
                                    <p className="text-sm text-foreground">{selectedOrder.payment_status}</p>
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
                                    <span className="text-foreground">{t('total')}</span>
                                    <span className="text-[#D4AF37]">${selectedOrder.total.toLocaleString("es-MX")} MXN</span>
                                  </div>
                                </div>
                              </div>

                              {/* Payment Method */}
                              {selectedOrder.payment_method && (
                                <div>
                                  <h4 className="font-semibold text-foreground mb-2">Método de Pago</h4>
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
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
