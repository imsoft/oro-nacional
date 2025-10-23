// Dashboard Statistics Types

export interface SalesStats {
  total_sales: number;
  current_month_sales: number;
  last_month_sales: number;
  growth_percentage: number;
}

export interface OrdersStats {
  total_orders: number;
  current_month_orders: number;
  last_month_orders: number;
  growth_percentage: number;
}

export interface ProductsStats {
  total_products: number;
  active_products: number;
  low_stock_products: number;
  new_products_this_month: number;
}

export interface DashboardStats {
  sales: SalesStats;
  orders: OrdersStats;
  products: ProductsStats;
}

export interface RecentOrder {
  id: string;
  order_number: string;
  customer_name: string;
  total: number;
  status: string;
  created_at: string;
}

export interface DashboardData {
  stats: DashboardStats;
  recentOrders: RecentOrder[];
}
