// =============================================
// Types para el Sistema de Pedidos/Órdenes
// =============================================

export type OrderStatus = 'Pendiente' | 'Procesando' | 'Enviado' | 'Entregado' | 'Cancelado';
export type PaymentMethod = 'Tarjeta';
export type PaymentStatus = 'Pendiente' | 'Pagado' | 'Fallido' | 'Reembolsado';

// Tipo para crear un nuevo pedido
export interface CreateOrderData {
  // Información del cliente
  customer_name: string;
  customer_email: string;
  customer_phone: string;

  // Dirección de envío
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_zip_code: string;
  shipping_country?: string;

  // Método de pago
  payment_method: PaymentMethod;

  // Notas del cliente
  customer_notes?: string;

  // Items del pedido
  items: CreateOrderItemData[];
}

export interface CreateOrderItemData {
  product_id: string;
  product_name: string;
  product_slug: string;
  product_sku?: string;
  product_image?: string;
  quantity: number;
  unit_price: number;
  size?: string;
  material?: string;
}

// Tipo para un item del pedido
export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_slug: string | null;
  product_sku: string | null;
  product_image: string | null;
  quantity: number;
  unit_price: number;
  size: string | null;
  material: string | null;
  subtotal: number;
  created_at: string;
}

// Tipo para un pedido completo
export interface Order {
  id: string;
  order_number: string;
  user_id: string | null;

  // Información del cliente
  customer_name: string;
  customer_email: string;
  customer_phone: string;

  // Dirección de envío
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_zip_code: string;
  shipping_country: string;

  // Información del pedido
  subtotal: number;
  shipping_cost: number;
  tax: number;
  total: number;

  // Estado
  status: OrderStatus;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;

  // Notas
  customer_notes: string | null;
  admin_notes: string | null;

  // Stripe
  stripe_payment_intent_id: string | null;

  // Timestamps
  created_at: string;
  updated_at: string;
  shipped_at: string | null;
  delivered_at: string | null;
  deleted_at: string | null;

  // Relación con items (opcional)
  items?: OrderItem[];
}

// Tipo para listar pedidos (versión resumida)
export interface OrderListItem {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  total: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  created_at: string;
  items_count?: number;
}

// Tipo para actualizar el estado de un pedido
export interface UpdateOrderStatusData {
  status?: OrderStatus;
  payment_status?: PaymentStatus;
  admin_notes?: string;
  shipped_at?: string;
  delivered_at?: string;
}

// Tipo para las estadísticas del dashboard admin
export interface OrderStats {
  total_orders: number;
  pending_orders: number;
  processing_orders: number;
  shipped_orders: number;
  delivered_orders: number;
  cancelled_orders: number;
  total_revenue: number;
  average_order_value: number;
}
