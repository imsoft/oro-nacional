// User Profile Types
// Uses the existing 'profiles' table from the database

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: "user" | "admin";
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserAddress {
  id: string;
  user_id: string;
  address_type: "shipping" | "billing";
  street: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

// DTOs for creating/updating profiles
export interface UpdateUserProfileData {
  full_name?: string;
  phone?: string;
  avatar_url?: string;
}

export interface CreateUserAddressData {
  address_type?: "shipping" | "billing";
  street: string;
  city: string;
  state: string;
  zip_code: string;
  country?: string;
  is_default?: boolean;
}

export interface UpdateUserAddressData {
  street?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  is_default?: boolean;
}

// Combined profile data for UI
export interface CompleteUserProfile {
  profile: UserProfile | null;
  addresses: UserAddress[];
  defaultAddress: UserAddress | null;
}
