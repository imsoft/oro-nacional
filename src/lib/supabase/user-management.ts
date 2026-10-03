import { supabase } from "./client";
import type {
  UserWithStats,
  UserStats,
  UserCountByRole,
  UpdateUserRoleData,
  UpdateUserRoleResponse,
} from "@/types/user-management";

/**
 * Get all users with their order statistics
 */
export async function getUsersWithStats(): Promise<UserWithStats[]> {
  try {
    const { data, error } = await supabase.rpc("get_users_with_stats");

    if (error) {
      console.error("Error fetching users with stats:", error);
      return [];
    }

    return data as UserWithStats[];
  } catch (error) {
    console.error("Error in getUsersWithStats:", error);
    return [];
  }
}

/**
 * Get statistics for a specific user
 */
export async function getUserStats(userId: string): Promise<UserStats | null> {
  try {
    const { data, error } = await supabase.rpc("get_user_stats", {
      user_uuid: userId,
    });

    if (error) {
      console.error("Error fetching user stats:", error);
      return null;
    }

    return data as UserStats;
  } catch (error) {
    console.error("Error in getUserStats:", error);
    return null;
  }
}

/**
 * Get user count by role
 */
export async function getUserCountByRole(): Promise<UserCountByRole> {
  try {
    const { data, error } = await supabase.rpc("get_user_count_by_role");

    if (error) {
      console.error("Error fetching user count by role:", error);
      return {
        total_users: 0,
        admin_count: 0,
        user_count: 0,
      };
    }

    return data as UserCountByRole;
  } catch (error) {
    console.error("Error in getUserCountByRole:", error);
    return {
      total_users: 0,
      admin_count: 0,
      user_count: 0,
    };
  }
}

/**
 * Update a user's role (admin only)
 */
export async function updateUserRole(
  updateData: UpdateUserRoleData
): Promise<UpdateUserRoleResponse> {
  try {
    const { data, error } = await supabase.rpc("update_user_role", {
      user_uuid: updateData.userId,
      new_role: updateData.newRole,
    });

    if (error) {
      console.error("Error updating user role:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    const result = data as { success: boolean; user?: unknown; error?: string };

    if (!result.success) {
      return {
        success: false,
        error: result.error || "Error desconocido",
      };
    }

    return {
      success: true,
      user: result.user as UserWithStats,
    };
  } catch (error) {
    console.error("Error in updateUserRole:", error);
    return {
      success: false,
      error: "Error al actualizar el rol del usuario",
    };
  }
}

/**
 * Delete a user (admin only) — NOT SUPPORTED FROM THE CLIENT.
 *
 * Deleting a user requires removing the row in `auth.users`, which can only
 * be done with the service role key (`supabase.auth.admin.deleteUser`) from a
 * server-side route that verifies the caller is an admin. The previous
 * implementation only deleted the `profiles` row, leaving the auth user able
 * to sign in with a broken account, so it was removed on purpose.
 *
 * This function has no callers. To support user deletion, add an
 * admin-protected API route that calls `auth.admin.deleteUser(userId)` and
 * let the foreign keys cascade to `profiles` and related data.
 */
export async function deleteUser(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  console.error(
    `deleteUser(${userId}): deleting users is not supported from the client`
  );
  return {
    success: false,
    error: "Eliminar usuarios no está soportado desde el cliente",
  };
}
