// User Management Types

export type UserRole = "user" | "admin";

export interface UserWithStats {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone: string | null;
  created_at: string;
  order_count: number;
  total_spent: number;
}

export interface UserStats {
  order_count: number;
  total_spent: number;
  last_order_date: string | null;
}

export interface UserCountByRole {
  total_users: number;
  admin_count: number;
  user_count: number;
}

export interface UpdateUserRoleData {
  userId: string;
  newRole: UserRole;
}

export interface UpdateUserRoleResponse {
  success: boolean;
  user?: UserWithStats;
  error?: string;
}
