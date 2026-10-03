// =============================================
// Funciones para el Sistema de Pedidos/Órdenes
// =============================================

import { supabase } from "./client";
import type {
  Order,
  OrderListItem,
  UpdateOrderStatusData,
  OrderStats,
} from "@/types/order";

// La creación de pedidos se hace en el servidor (src/lib/orders/server.ts
// vía /api/checkout), donde los precios se calculan desde la base de datos.

// =============================================
// READ - Obtener pedidos
// =============================================

// Obtener todos los pedidos del usuario actual
export async function getUserOrders(): Promise<Order[]> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        items:order_items(*)
      `
      )
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching user orders:", error);
      return [];
    }

    return (data as Order[]) || [];
  } catch (error) {
    console.error("Error in getUserOrders:", error);
    return [];
  }
}

// Obtener un pedido específico por ID
export async function getOrderById(orderId: string): Promise<Order | null> {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        items:order_items(*)
      `
      )
      .eq("id", orderId)
      .is("deleted_at", null)
      .single();

    if (error) {
      console.error("Error fetching order by id:", error);
      return null;
    }

    return data as Order;
  } catch (error) {
    console.error("Error in getOrderById:", error);
    return null;
  }
}

// Obtener un pedido por número de pedido
export async function getOrderByNumber(
  orderNumber: string
): Promise<Order | null> {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        items:order_items(*)
      `
      )
      .eq("order_number", orderNumber)
      .is("deleted_at", null)
      .single();

    if (error) {
      console.error("Error fetching order by number:", error);
      return null;
    }

    return data as Order;
  } catch (error) {
    console.error("Error in getOrderByNumber:", error);
    return null;
  }
}

// =============================================
// ADMIN - Funciones para administración
// =============================================

// Obtener todos los pedidos (admin)
export async function getAllOrders(): Promise<OrderListItem[]> {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        id,
        order_number,
        customer_name,
        customer_email,
        total,
        status,
        payment_status,
        created_at
      `
      )
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching all orders:", error);
      return [];
    }

    return (data as OrderListItem[]) || [];
  } catch (error) {
    console.error("Error in getAllOrders:", error);
    return [];
  }
}

// Actualizar estado de un pedido (admin)
export async function updateOrderStatus(
  orderId: string,
  updates: UpdateOrderStatusData
): Promise<{ success: boolean; error?: string }> {
  try {
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    // RLS no da error si filtra la fila: confirmar que sí se actualizó
    const { data, error } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", orderId)
      .select("id");

    if (error || !data || data.length === 0) {
      console.error("Error updating order status:", error);
      return { success: false, error: "Error al actualizar el pedido" };
    }

    return { success: true };
  } catch (error) {
    console.error("Error in updateOrderStatus:", error);
    return { success: false, error: "Error inesperado al actualizar" };
  }
}

// Cancelar un pedido (admin)
export async function cancelOrder(
  orderId: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await supabase
      .from("orders")
      .update({
        status: "Cancelado",
        admin_notes: reason || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .select("id");

    if (error || !data || data.length === 0) {
      console.error("Error cancelling order:", error);
      return { success: false, error: "Error al cancelar el pedido" };
    }

    return { success: true };
  } catch (error) {
    console.error("Error in cancelOrder:", error);
    return { success: false, error: "Error inesperado al cancelar" };
  }
}

// Soft delete de un pedido (admin)
export async function softDeleteOrder(
  orderId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await supabase
      .from("orders")
      .update({
        deleted_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .select("id");

    if (error || !data || data.length === 0) {
      console.error("Error soft deleting order:", error);
      return { success: false, error: "Error al eliminar el pedido" };
    }

    return { success: true };
  } catch (error) {
    console.error("Error in softDeleteOrder:", error);
    return { success: false, error: "Error inesperado al eliminar" };
  }
}

// Obtener estadísticas de pedidos (admin)
export async function getOrderStats(): Promise<OrderStats | null> {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("status, total, payment_status")
      .is("deleted_at", null);

    if (error) {
      console.error("Error fetching order stats:", error);
      return null;
    }

    // Los ingresos solo cuentan pedidos pagados y no cancelados
    const paidOrders = data.filter(
      (o) => o.payment_status === "Pagado" && o.status !== "Cancelado"
    );
    const revenue = paidOrders.reduce((sum, o) => sum + Number(o.total), 0);

    const stats: OrderStats = {
      total_orders: data.length,
      pending_orders: data.filter((o) => o.status === "Pendiente").length,
      processing_orders: data.filter((o) => o.status === "Procesando").length,
      shipped_orders: data.filter((o) => o.status === "Enviado").length,
      delivered_orders: data.filter((o) => o.status === "Entregado").length,
      cancelled_orders: data.filter((o) => o.status === "Cancelado").length,
      total_revenue: revenue,
      average_order_value:
        paidOrders.length > 0 ? revenue / paidOrders.length : 0,
    };

    return stats;
  } catch (error) {
    console.error("Error in getOrderStats:", error);
    return null;
  }
}
