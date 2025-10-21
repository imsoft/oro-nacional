"use client";

import {
  Package,
  ShoppingCart,
  FileText,
  TrendingUp,
  Users,
  DollarSign,
} from "lucide-react";

const stats = [
  {
    name: "Ventas Totales",
    value: "$45,231 MXN",
    change: "+20.1%",
    changeType: "positive",
    icon: DollarSign,
  },
  {
    name: "Pedidos",
    value: "23",
    change: "+15.3%",
    changeType: "positive",
    icon: ShoppingCart,
  },
  {
    name: "Productos",
    value: "156",
    change: "+4 nuevos",
    changeType: "neutral",
    icon: Package,
  },
  {
    name: "Posts de Blog",
    value: "12",
    change: "+2 esta semana",
    changeType: "neutral",
    icon: FileText,
  },
];

const recentOrders = [
  {
    id: "ORO-00012345",
    customer: "María García",
    product: "Anillo de Compromiso Esmeralda",
    amount: "$12,500 MXN",
    status: "Enviado",
  },
  {
    id: "ORO-00012344",
    customer: "Juan Rodríguez",
    product: "Collar Infinito Oro Blanco",
    amount: "$8,900 MXN",
    status: "Procesando",
  },
  {
    id: "ORO-00012343",
    customer: "Ana Martínez",
    product: "Aretes de Perlas",
    amount: "$5,400 MXN",
    status: "Entregado",
  },
];

export default function AdminDashboard() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Resumen general de tu tienda
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
            Pedidos Recientes
          </h2>
        </div>
        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  ID Pedido
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Monto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-muted/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                    {order.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {order.customer}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground max-w-xs truncate">
                    {order.product}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                    {order.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        order.status === "Entregado"
                          ? "bg-green-100 text-green-800"
                          : order.status === "Enviado"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg bg-card border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-[#D4AF37]/10 p-3">
              <Users className="h-6 w-6 text-[#D4AF37]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Clientes Totales
              </h3>
              <p className="text-2xl font-bold text-[#D4AF37]">127</p>
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
                Inventario Bajo
              </h3>
              <p className="text-2xl font-bold text-red-600">3</p>
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
                Conversión
              </h3>
              <p className="text-2xl font-bold text-green-600">4.2%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
