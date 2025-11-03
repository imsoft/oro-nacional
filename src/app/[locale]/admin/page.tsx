"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  Package,
  ShoppingCart,
  FileText,
  TrendingUp,
  DollarSign,
  Loader2,
} from "lucide-react";
import { getDashboardData } from "@/lib/supabase/dashboard";
import type { DashboardData } from "@/types/dashboard";

export default function AdminDashboard() {
  const t = useTranslations('admin.dashboard');
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    const dashboardData = await getDashboardData();
    setData(dashboardData);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="rounded-lg bg-[#D4AF37]/10 p-3">
                    <Icon className="h-6 w-6 text-[#D4AF37]" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-muted-foreground truncate">
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-foreground">
                        {stat.value}
                      </div>
                      <div
                        className={`ml-2 flex items-baseline text-sm font-semibold ${
                          stat.changeType === "positive"
                            ? "text-green-600"
                            : "text-muted-foreground"
                        }`}
                      >
                        {stat.changeType === "positive" && (
                          <TrendingUp className="h-4 w-4 mr-1" />
                        )}
                        {stat.change}
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
        <div className="overflow-hidden">
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
                  {t('product')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('amount')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('status')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {data.recentOrders.length > 0 ? (
                data.recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                      {order.order_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {order.customer_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground max-w-xs truncate">
                      {t('orders')} #{order.order_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                      ${order.total.toLocaleString("es-MX")} MXN
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
                         order.status === "Procesando" ? t('processing') : order.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-muted-foreground">
                    {t('noRecentOrders')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg bg-card border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-[#D4AF37]/10 p-3">
              <Package className="h-6 w-6 text-[#D4AF37]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                {t('activeProducts')}
              </h3>
              <p className="text-2xl font-bold text-[#D4AF37]">
                {data.stats.products.active_products}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-card border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-[#D4AF37]/10 p-3">
              <Package className="h-6 w-6 text-[#D4AF37]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                {t('lowStock')}
              </h3>
              <p className={`text-2xl font-bold ${data.stats.products.low_stock_products > 5 ? "text-red-600" : "text-green-600"}`}>
                {data.stats.products.low_stock_products}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-card border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-[#D4AF37]/10 p-3">
              <TrendingUp className="h-6 w-6 text-[#D4AF37]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                {t('currentMonthSales')}
              </h3>
              <p className="text-2xl font-bold text-green-600">
                ${data.stats.sales.current_month_sales.toLocaleString("es-MX")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
