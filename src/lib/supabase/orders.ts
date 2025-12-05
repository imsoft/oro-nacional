// =============================================
// Funciones para el Sistema de Pedidos/Órdenes
// =============================================

import { supabase } from "./client";
import type {
  Order,
  OrderListItem,
  CreateOrderData,
  UpdateOrderStatusData,
  OrderStats,
} from "@/types/order";

// =============================================
// CREATE - Crear un nuevo pedido
// =============================================

export async function createOrder(
  orderData: CreateOrderData
): Promise<{ success: boolean; order?: Order; error?: string }> {
  try {
    // 1. Obtener el usuario actual
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // 2. Calcular totales
    // Los precios de los productos ya incluyen IVA, por lo que no debemos sumarlo nuevamente
    const subtotal = orderData.items.reduce(
      (sum, item) => sum + item.unit_price * item.quantity,
      0
    );
    const shipping_cost = 0; // TODO: Calcular costo de envío basado en ubicación
    // IVA ya está incluido en los precios, por lo que tax = 0
    const tax = 0;
    const total = subtotal + shipping_cost; // Total ya incluye IVA en el subtotal

    // 3. Generar número de pedido
    const { data: orderNumberData, error: orderNumberError } =
      await supabase.rpc("generate_order_number");

    if (orderNumberError) {
      console.error("Error generating order number:", orderNumberError);
      return { success: false, error: "Error al generar número de pedido" };
    }

    // 4. Crear el pedido
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumberData,
        user_id: user?.id || null,
        customer_name: orderData.customer_name,
        customer_email: orderData.customer_email,
        customer_phone: orderData.customer_phone,
        shipping_address: orderData.shipping_address,
        shipping_city: orderData.shipping_city,
        shipping_state: orderData.shipping_state,
        shipping_zip_code: orderData.shipping_zip_code,
        shipping_country: orderData.shipping_country || "México",
        subtotal,
        shipping_cost,
        tax,
        total,
        payment_method: orderData.payment_method,
        customer_notes: orderData.customer_notes || null,
      })
      .select()
      .single();

    if (orderError) {
      console.error("Error creating order:", orderError);
      return { success: false, error: "Error al crear el pedido" };
    }

    // 5. Crear los items del pedido
    const orderItems = orderData.items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.product_name,
      product_slug: item.product_slug,
      product_sku: item.product_sku || null,
      product_image: item.product_image || null,
      quantity: item.quantity,
      unit_price: item.unit_price,
      size: item.size || null,
      material: item.material || null,
      subtotal: item.unit_price * item.quantity,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("Error creating order items:", itemsError);
      // Intentar eliminar el pedido creado
      await supabase.from("orders").delete().eq("id", order.id);
      return { success: false, error: "Error al crear items del pedido" };
    }

    // 6. Obtener el pedido completo con sus items
    const { data: fullOrder } = await supabase
      .from("orders")
      .select(
        `
        *,
        items:order_items(*)
      `
      )
      .eq("id", order.id)
      .single();

    return { success: true, order: fullOrder as Order };
  } catch (error) {
    console.error("Error in createOrder:", error);
    return { success: false, error: "Error inesperado al crear el pedido" };
  }
}

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

    const { error } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", orderId);

    if (error) {
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
    const { error } = await supabase
      .from("orders")
      .update({
        status: "Cancelado",
        admin_notes: reason || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (error) {
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
    const { error } = await supabase
      .from("orders")
      .update({
        deleted_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (error) {
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
      .select("status, total")
      .is("deleted_at", null);

    if (error) {
      console.error("Error fetching order stats:", error);
      return null;
    }

    const stats: OrderStats = {
      total_orders: data.length,
      pending_orders: data.filter((o) => o.status === "Pendiente").length,
      processing_orders: data.filter((o) => o.status === "Procesando").length,
      shipped_orders: data.filter((o) => o.status === "Enviado").length,
      delivered_orders: data.filter((o) => o.status === "Entregado").length,
      cancelled_orders: data.filter((o) => o.status === "Cancelado").length,
      total_revenue: data.reduce((sum, o) => sum + Number(o.total), 0),
      average_order_value:
        data.length > 0
          ? data.reduce((sum, o) => sum + Number(o.total), 0) / data.length
          : 0,
    };

    return stats;
  } catch (error) {
    console.error("Error in getOrderStats:", error);
    return null;
  }
}
