"use client";

import { useState } from "react";
import { Search, Eye, Package, Truck, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Datos de ejemplo
const mockOrders = [
  {
    id: "ORO-00012345",
    customer: {
      name: "María García",
      email: "maria@email.com",
    },
    items: [
      {
        name: "Anillo de Compromiso Esmeralda",
        quantity: 1,
        price: 12500,
      },
    ],
    total: 12500,
    status: "Enviado",
    date: "2025-01-15",
    shippingAddress: "Av. Chapultepec 123, Guadalajara, Jalisco",
  },
  {
    id: "ORO-00012344",
    customer: {
      name: "Juan Rodríguez",
      email: "juan@email.com",
    },
    items: [
      {
        name: "Collar Infinito Oro Blanco",
        quantity: 1,
        price: 8900,
      },
    ],
    total: 8900,
    status: "Procesando",
    date: "2025-01-14",
    shippingAddress: "Calle Independencia 456, Zapopan, Jalisco",
  },
  {
    id: "ORO-00012343",
    customer: {
      name: "Ana Martínez",
      email: "ana@email.com",
    },
    items: [
      {
        name: "Aretes de Perlas Clásicos",
        quantity: 1,
        price: 5400,
      },
    ],
    total: 5400,
    status: "Entregado",
    date: "2025-01-10",
    shippingAddress: "Blvd. Tlaquepaque 789, Tlaquepaque, Jalisco",
  },
];

export default function PedidosAdmin() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [orders] = useState(mockOrders);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Procesando":
        return <Package className="h-4 w-4" />;
      case "Enviado":
        return <Truck className="h-4 w-4" />;
      case "Entregado":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Procesando":
        return "bg-yellow-100 text-yellow-800";
      case "Enviado":
        return "bg-blue-100 text-blue-800";
      case "Entregado":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Pedidos</h1>
        <p className="mt-2 text-muted-foreground">
          Gestiona y rastrea todos los pedidos
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Buscar por ID o cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="Procesando">Procesando</SelectItem>
            <SelectItem value="Enviado">Enviado</SelectItem>
            <SelectItem value="Entregado">Entregado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders Table */}
      <div className="rounded-lg bg-card border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
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
                  Productos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-muted/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-foreground">
                      {order.id}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-foreground">
                      {order.customer.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {order.customer.email}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-muted-foreground max-w-xs truncate">
                      {order.items.map((item) => item.name).join(", ")}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {order.items.reduce((sum, item) => sum + item.quantity, 0)}{" "}
                      {order.items.reduce((sum, item) => sum + item.quantity, 0) === 1
                        ? "producto"
                        : "productos"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-foreground">
                      ${order.total.toLocaleString("es-MX")} MXN
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {getStatusIcon(order.status)}
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-muted-foreground">
                      {new Date(order.date).toLocaleDateString("es-MX")}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[#D4AF37] hover:text-[#B8941E]"
                    >
                      <Eye className="mr-1 h-4 w-4" />
                      Ver
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-4">
        <div className="rounded-lg bg-card border border-border p-6">
          <div className="text-sm text-muted-foreground">Total Pedidos</div>
          <div className="mt-2 text-3xl font-bold text-foreground">
            {orders.length}
          </div>
        </div>
        <div className="rounded-lg bg-card border border-border p-6">
          <div className="text-sm text-muted-foreground">Procesando</div>
          <div className="mt-2 text-3xl font-bold text-yellow-600">
            {orders.filter((o) => o.status === "Procesando").length}
          </div>
        </div>
        <div className="rounded-lg bg-card border border-border p-6">
          <div className="text-sm text-muted-foreground">Enviados</div>
          <div className="mt-2 text-3xl font-bold text-blue-600">
            {orders.filter((o) => o.status === "Enviado").length}
          </div>
        </div>
        <div className="rounded-lg bg-card border border-border p-6">
          <div className="text-sm text-muted-foreground">Ventas Totales</div>
          <div className="mt-2 text-3xl font-bold text-[#D4AF37]">
            ${orders.reduce((sum, o) => sum + o.total, 0).toLocaleString("es-MX")}
          </div>
        </div>
      </div>
    </div>
  );
}
