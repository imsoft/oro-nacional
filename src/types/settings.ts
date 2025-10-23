// Site Settings Types

export type SettingType = "text" | "email" | "phone" | "url" | "json" | "number";

export interface SiteSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  setting_type: SettingType;
  description: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface PublicSetting {
  setting_key: string;
  setting_value: string;
  setting_type: SettingType;
}

export interface BusinessHours {
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
}

export interface SiteSettings {
  // Basic Information
  store_name: string;
  store_tagline: string;

  // Contact Information
  contact_email: string;
  contact_phone: string;
  whatsapp_phone: string;

  // Address
  address_street: string;
  address_colony: string;
  address_city: string;
  address_state: string;
  address_zip: string;
  address_country: string;

  // Business Hours
  business_hours: BusinessHours;
  business_hours_summary: string;

  // Social Media URLs
  social_facebook: string;
  social_instagram: string;
  social_twitter: string;

  // Social Media Handles
  facebook_handle: string;
  instagram_handle: string;
  twitter_handle: string;
}

export interface UpdateSettingsData {
  [key: string]: string;
}

export interface UpdateSettingResponse {
  success: boolean;
  setting?: SiteSetting;
  error?: string;
}

export interface UpdateSettingsResponse {
  success: boolean;
  updated_count?: number;
  error?: string;
}
