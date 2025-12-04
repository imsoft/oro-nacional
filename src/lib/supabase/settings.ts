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


// ============================================================================
// Store Settings (for /admin/configuracion page)
// ============================================================================

export interface StoreSettings {
  id: string;
  store_name: string;
  contact_email: string;
  phone: string;
  website: string;
  address: string;
  description: string;
  free_shipping_from: number;
  standard_shipping_cost: number;
  express_shipping_cost: number;
  delivery_time: string;
  exchange_rate?: number; // USD to MXN exchange rate (e.g., 0.0588 means 1 USD = 17 MXN)
  created_at: string;
  updated_at: string;
}

export interface UpdateStoreSettingsData {
  store_name?: string;
  contact_email?: string;
  phone?: string;
  website?: string;
  address?: string;
  description?: string;
  free_shipping_from?: number;
  standard_shipping_cost?: number;
  express_shipping_cost?: number;
  delivery_time?: string;
  exchange_rate?: number;
}

/**
 * Get store settings from store_settings table
 * Returns the first (and only) row from store_settings table
 */
export async function getStoreSettings(): Promise<StoreSettings | null> {
  try {
    const { data, error } = await supabase
      .from("store_settings")
      .select("*")
      .limit(1)
      .single();

    if (error) {
      console.error("Error fetching store settings:", error);
      return null;
    }

    return data as StoreSettings;
  } catch (error) {
    console.error("Error in getStoreSettings:", error);
    return null;
  }
}

/**
 * Update store settings
 * Updates the first row in store_settings table
 * If exchange_rate is updated, automatically updates all USD prices
 */
export async function updateStoreSettings(
  settings: UpdateStoreSettingsData
): Promise<{ success: boolean; error?: string; pricesUpdated?: { products: number; sizes: number } }> {
  try {
    // First, get the ID and current exchange_rate of the settings row
    const { data: existingSettings, error: fetchError } = await supabase
      .from("store_settings")
      .select("id, exchange_rate")
      .limit(1)
      .single();

    if (fetchError || !existingSettings) {
      console.error("Error fetching existing settings:", fetchError);
      return {
        success: false,
        error: "No se pudieron cargar las configuraciones existentes",
      };
    }

    // Check if exchange_rate is being updated
    const exchangeRateChanged = 
      settings.exchange_rate !== undefined && 
      settings.exchange_rate !== null &&
      existingSettings.exchange_rate !== settings.exchange_rate;

    // Update the settings
    const { error: updateError } = await supabase
      .from("store_settings")
      .update(settings)
      .eq("id", existingSettings.id);

    if (updateError) {
      console.error("Error updating store settings:", updateError);
      return {
        success: false,
        error: "Error al actualizar las configuraciones",
      };
    }

    // If exchange_rate changed, update all USD prices
    let pricesUpdated: { products: number; sizes: number } | undefined;
    if (exchangeRateChanged && settings.exchange_rate) {
      try {
        const { data, error: rpcError } = await supabase.rpc('update_all_usd_prices', {
          new_exchange_rate: settings.exchange_rate,
          update_all: true, // Actualizar todos los precios, no solo los NULL
        });

        if (rpcError) {
          console.error("Error updating USD prices:", rpcError);
          // No fallar la actualización de settings si falla la actualización de precios
          // pero loguear el error
        } else if (data && data.length > 0) {
          pricesUpdated = {
            products: data[0].products_updated || 0,
            sizes: data[0].sizes_updated || 0,
          };
          console.log(`✅ Updated ${pricesUpdated.products} products and ${pricesUpdated.sizes} sizes with new exchange rate`);
        }
      } catch (rpcError) {
        console.error("Error calling update_all_usd_prices:", rpcError);
        // No fallar la actualización de settings si falla la actualización de precios
      }
    }

    return { success: true, pricesUpdated };
  } catch (error) {
    console.error("Unexpected error updating settings:", error);
    return {
      success: false,
      error: "Error inesperado al actualizar las configuraciones",
    };
  }
}
