import { supabase } from "./client";
import type {
  SiteSetting,
  PublicSetting,
  SiteSettings,
  BusinessHours,
  UpdateSettingsData,
  UpdateSettingResponse,
  UpdateSettingsResponse,
} from "@/types/settings";

/**
 * Get all public settings and parse them into a SiteSettings object
 */
export async function getSiteSettings(): Promise<SiteSettings | null> {
  try {
    const { data, error } = await supabase.rpc("get_public_settings");

    if (error) {
      console.error("Error fetching site settings:", error);
      return null;
    }

    const settings = data as PublicSetting[];

    // Convert array of settings to SiteSettings object
    const settingsObj: Partial<SiteSettings> = {};

    settings.forEach((setting) => {
      const key = setting.setting_key as keyof SiteSettings;

      // Parse JSON values
      if (setting.setting_type === "json" && key === "business_hours") {
        try {
          settingsObj[key] = JSON.parse(setting.setting_value) as BusinessHours;
        } catch (e) {
          console.error(`Error parsing JSON for ${key}:`, e);
        }
      } else {
        settingsObj[key] = setting.setting_value as never;
      }
    });

    return settingsObj as SiteSettings;
  } catch (error) {
    console.error("Error in getSiteSettings:", error);
    return null;
  }
}

/**
 * Get a single setting by key
 */
export async function getSetting(key: string): Promise<string | null> {
  try {
    const { data, error } = await supabase.rpc("get_setting", { key });

    if (error) {
      console.error(`Error fetching setting ${key}:`, error);
      return null;
    }

    return data as string;
  } catch (error) {
    console.error(`Error in getSetting(${key}):`, error);
    return null;
  }
}

/**
 * Get all settings (admin only - includes non-public settings)
 */
export async function getAllSettings(): Promise<SiteSetting[]> {
  try {
    const { data, error } = await supabase.rpc("get_all_settings");

    if (error) {
      console.error("Error fetching all settings:", error);
      return [];
    }

    return data as SiteSetting[];
  } catch (error) {
    console.error("Error in getAllSettings:", error);
    return [];
  }
}

/**
 * Update a single setting (admin only)
 */
export async function updateSetting(
  key: string,
  value: string
): Promise<UpdateSettingResponse> {
  try {
    const { data, error } = await supabase.rpc("update_setting", {
      key,
      value,
    });

    if (error) {
      console.error(`Error updating setting ${key}:`, error);
      return {
        success: false,
        error: error.message,
      };
    }

    const result = data as { success: boolean; setting?: unknown; error?: string };

    if (!result.success) {
      return {
        success: false,
        error: result.error || "Error desconocido",
      };
    }

    return {
      success: true,
      setting: result.setting as SiteSetting,
    };
  } catch (error) {
    console.error(`Error in updateSetting(${key}):`, error);
    return {
      success: false,
      error: "Error al actualizar la configuración",
    };
  }
}

/**
 * Update multiple settings at once (admin only)
 */
export async function updateSettings(
  settings: UpdateSettingsData
): Promise<UpdateSettingsResponse> {
  try {
    const { data, error } = await supabase.rpc("update_settings", {
      settings: JSON.stringify(settings),
    });

    if (error) {
      console.error("Error updating settings:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    const result = data as { success: boolean; updated_count?: number; error?: string };

    if (!result.success) {
      return {
        success: false,
        error: result.error || "Error desconocido",
      };
    }

    return {
      success: true,
      updated_count: result.updated_count,
    };
  } catch (error) {
    console.error("Error in updateSettings:", error);
    return {
      success: false,
      error: "Error al actualizar las configuraciones",
    };
  }
}

/**
 * Helper function to get formatted address
 */
export function getFormattedAddress(settings: SiteSettings | null): string {
  if (!settings) return "";

  return `${settings.address_street}, ${settings.address_colony}, ${settings.address_city}, ${settings.address_state} ${settings.address_zip}, ${settings.address_country}`;
}

/**
 * Helper function to get WhatsApp link
 */
export function getWhatsAppLink(settings: SiteSettings | null): string {
  if (!settings) return "#";

  return `https://wa.me/${settings.whatsapp_phone}`;
}
