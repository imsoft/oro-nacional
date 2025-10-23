import { supabase } from "./client";
import type {
  UserProfile,
  UserAddress,
  UpdateUserProfileData,
  CreateUserAddressData,
  UpdateUserAddressData,
  CompleteUserProfile,
} from "@/types/profile";

/**
 * Get current user's profile from the profiles table
 */
export async function getUserProfile(): Promise<UserProfile | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.error("No authenticated user");
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    // Profile might not exist yet, which is okay
    if (error.code === "PGRST116") {
      return null;
    }
    console.error("Error fetching user profile:", error);
    return null;
  }

  return data as UserProfile;
}

/**
 * Update user profile
 * Note: Profile is created automatically on signup, so we only update here
 */
export async function updateUserProfile(
  profileData: UpdateUserProfileData
): Promise<{ success: boolean; profile?: UserProfile; error?: string }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Usuario no autenticado" };
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(profileData)
    .eq("id", user.id)
    .select()
    .single();

  if (error) {
    console.error("Error updating profile:", error);
    return { success: false, error: "Error al actualizar el perfil" };
  }

  return { success: true, profile: data as UserProfile };
}

/**
 * Get all addresses for current user
 */
export async function getUserAddresses(): Promise<UserAddress[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.error("No authenticated user");
    return [];
  }

  const { data, error } = await supabase
    .from("user_addresses")
    .select("*")
    .eq("user_id", user.id)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching addresses:", error);
    return [];
  }

  return data as UserAddress[];
}

/**
 * Get default address for current user
 */
export async function getDefaultAddress(): Promise<UserAddress | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.error("No authenticated user");
    return null;
  }

  const { data, error } = await supabase
    .from("user_addresses")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_default", true)
    .single();

  if (error) {
    // No default address, which is okay
    if (error.code === "PGRST116") {
      return null;
    }
    console.error("Error fetching default address:", error);
    return null;
  }

  return data as UserAddress;
}

/**
 * Create a new address
 */
export async function createAddress(
  addressData: CreateUserAddressData
): Promise<{ success: boolean; address?: UserAddress; error?: string }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Usuario no autenticado" };
  }

  const { data, error } = await supabase
    .from("user_addresses")
    .insert({
      user_id: user.id,
      ...addressData,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating address:", error);
    return { success: false, error: "Error al crear la dirección" };
  }

  return { success: true, address: data as UserAddress };
}

/**
 * Update an existing address
 */
export async function updateAddress(
  addressId: string,
  addressData: UpdateUserAddressData
): Promise<{ success: boolean; address?: UserAddress; error?: string }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Usuario no autenticado" };
  }

  const { data, error } = await supabase
    .from("user_addresses")
    .update(addressData)
    .eq("id", addressId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    console.error("Error updating address:", error);
    return { success: false, error: "Error al actualizar la dirección" };
  }

  return { success: true, address: data as UserAddress };
}

/**
 * Delete an address
 */
export async function deleteAddress(
  addressId: string
): Promise<{ success: boolean; error?: string }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Usuario no autenticado" };
  }

  const { error } = await supabase
    .from("user_addresses")
    .delete()
    .eq("id", addressId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting address:", error);
    return { success: false, error: "Error al eliminar la dirección" };
  }

  return { success: true };
}

/**
 * Set an address as default
 */
export async function setDefaultAddress(
  addressId: string
): Promise<{ success: boolean; error?: string }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Usuario no autenticado" };
  }

  // The trigger will automatically unset other defaults
  const { error } = await supabase
    .from("user_addresses")
    .update({ is_default: true })
    .eq("id", addressId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error setting default address:", error);
    return { success: false, error: "Error al establecer dirección predeterminada" };
  }

  return { success: true };
}

/**
 * Get complete user profile with addresses
 */
export async function getCompleteUserProfile(): Promise<CompleteUserProfile> {
  const [profile, addresses, defaultAddress] = await Promise.all([
    getUserProfile(),
    getUserAddresses(),
    getDefaultAddress(),
  ]);

  return {
    profile,
    addresses,
    defaultAddress,
  };
}

/**
 * Update user password
 */
export async function updateUserPassword(
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    console.error("Error updating password:", error);
    return { success: false, error: "Error al actualizar la contraseña" };
  }

  return { success: true };
}
