// User Profile Types

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
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

// DTOs for creating/updating
export interface CreateUserProfileData {
  full_name: string;
  phone?: string;
}

export interface UpdateUserProfileData {
  full_name?: string;
  phone?: string;
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
