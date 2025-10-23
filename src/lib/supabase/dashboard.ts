import { supabase } from "./client";
import type {
  DashboardStats,
  SalesStats,
  OrdersStats,
  ProductsStats,
  RecentOrder,
  DashboardData,
} from "@/types/dashboard";

/**
 * Get sales statistics from the database
 */
export async function getSalesStats(): Promise<SalesStats> {
  try {
    const { data, error } = await supabase.rpc("get_sales_stats");

    if (error) {
      console.error("Error fetching sales stats:", error);
      return {
        total_sales: 0,
        current_month_sales: 0,
        last_month_sales: 0,
        growth_percentage: 0,
      };
    }

    return data as SalesStats;
  } catch (error) {
    console.error("Error in getSalesStats:", error);
    return {
      total_sales: 0,
      current_month_sales: 0,
      last_month_sales: 0,
      growth_percentage: 0,
    };
  }
}

/**
 * Get orders statistics from the database
 */
export async function getOrdersStats(): Promise<OrdersStats> {
  try {
    const { data, error } = await supabase.rpc("get_orders_stats");

    if (error) {
      console.error("Error fetching orders stats:", error);
      return {
        total_orders: 0,
        current_month_orders: 0,
        last_month_orders: 0,
        growth_percentage: 0,
      };
    }

    return data as OrdersStats;
  } catch (error) {
    console.error("Error in getOrdersStats:", error);
    return {
      total_orders: 0,
      current_month_orders: 0,
      last_month_orders: 0,
      growth_percentage: 0,
    };
  }
}

/**
 * Get products statistics from the database
 */
export async function getProductsStats(): Promise<ProductsStats> {
  try {
    const { data, error } = await supabase.rpc("get_products_stats");

    if (error) {
      console.error("Error fetching products stats:", error);
      return {
        total_products: 0,
        active_products: 0,
        low_stock_products: 0,
        new_products_this_month: 0,
      };
    }

    return data as ProductsStats;
  } catch (error) {
    console.error("Error in getProductsStats:", error);
    return {
      total_products: 0,
      active_products: 0,
      low_stock_products: 0,
      new_products_this_month: 0,
    };
  }
}

/**
 * Get all dashboard statistics
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const [sales, orders, products] = await Promise.all([
    getSalesStats(),
    getOrdersStats(),
    getProductsStats(),
  ]);

  return {
    sales,
    orders,
    products,
  };
}

/**
 * Get recent orders for the dashboard
 */
export async function getRecentOrders(limit: number = 5): Promise<RecentOrder[]> {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("id, order_number, customer_name, total, status, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching recent orders:", error);
      return [];
    }

    return data as RecentOrder[];
  } catch (error) {
    console.error("Error in getRecentOrders:", error);
    return [];
  }
}

/**
 * Get all dashboard data (stats + recent orders)
 */
export async function getDashboardData(): Promise<DashboardData> {
  const [stats, recentOrders] = await Promise.all([
    getDashboardStats(),
    getRecentOrders(5),
  ]);

  return {
    stats,
    recentOrders,
  };
}
