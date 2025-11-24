import { supabase } from "./client";

export interface HeroImage {
  id: string;
  image_url: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Get all active hero images ordered by display_order
 */
export async function getActiveHeroImages(): Promise<HeroImage[]> {
  const { data, error } = await supabase
    .from("hero_images")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true })
    .limit(3);

  if (error) {
    console.error("Error fetching hero images:", error);
    return [];
  }

  return data as HeroImage[];
}

/**
 * Get all hero images (for admin)
 */
export async function getAllHeroImages(): Promise<HeroImage[]> {
  const { data, error } = await supabase
    .from("hero_images")
    .select("*")
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Error fetching all hero images:", error);
    return [];
  }

  return data as HeroImage[];
}

/**
 * Upload a hero image to storage and create database record
 */
export async function uploadHeroImage(
  file: File,
  displayOrder: number
): Promise<HeroImage | null> {
  try {
    // Upload to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `hero-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("hero-images")
      .upload(fileName, file);

    if (uploadError) {
      console.error("Error uploading hero image:", uploadError);
      throw uploadError;
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("hero-images").getPublicUrl(fileName);

    // Create database record
    const { data, error } = await supabase
      .from("hero_images")
      .insert({
        image_url: publicUrl,
        display_order: displayOrder,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating hero image record:", error);
      throw error;
    }

    return data as HeroImage;
  } catch (error) {
    console.error("Error in uploadHeroImage:", error);
    return null;
  }
}

/**
 * Update a hero image
 */
export async function updateHeroImage(
  id: string,
  updates: {
    image_url?: string;
    display_order?: number;
    is_active?: boolean;
  }
): Promise<HeroImage | null> {
  const { data, error } = await supabase
    .from("hero_images")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating hero image:", error);
    return null;
  }

  return data as HeroImage;
}

/**
 * Delete a hero image (both from database and storage)
 */
export async function deleteHeroImage(id: string): Promise<boolean> {
  try {
    // Get the hero image to get the URL
    const { data: heroImage, error: fetchError } = await supabase
      .from("hero_images")
      .select("image_url")
      .eq("id", id)
      .single();

    if (fetchError) {
      console.error("Error fetching hero image for deletion:", fetchError);
      throw fetchError;
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from("hero_images")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Error deleting hero image from database:", deleteError);
      throw deleteError;
    }

    // Delete from storage if it exists
    if (heroImage?.image_url) {
      try {
        const imageUrl = heroImage.image_url;

        // If it's a full URL, extract the path
        if (imageUrl.includes('http')) {
          const url = new URL(imageUrl);
          const pathParts = url.pathname.split('/');
          const bucketIndex = pathParts.findIndex(part => part === 'hero-images');

          if (bucketIndex !== -1 && bucketIndex < pathParts.length - 1) {
            const filePath = pathParts.slice(bucketIndex + 1).join('/');

            const { error: storageError } = await supabase.storage
              .from("hero-images")
              .remove([filePath]);

            if (storageError) {
              console.error("Error deleting hero image from storage:", storageError);
            }
          }
        } else {
          const { error: storageError } = await supabase.storage
            .from("hero-images")
            .remove([imageUrl]);

          if (storageError) {
            console.error("Error deleting hero image from storage:", storageError);
          }
        }
      } catch (error) {
        console.error("Error parsing hero image URL:", error);
      }
    }

    return true;
  } catch (error) {
    console.error("Error in deleteHeroImage:", error);
    return false;
  }
}

/**
 * Replace a hero image (upload new one and delete old one)
 */
export async function replaceHeroImage(
  id: string,
  newFile: File
): Promise<HeroImage | null> {
  try {
    // Get the old hero image
    const { data: oldImage, error: fetchError } = await supabase
      .from("hero_images")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) {
      console.error("Error fetching old hero image:", fetchError);
      throw fetchError;
    }

    // Upload new image
    const fileExt = newFile.name.split('.').pop();
    const fileName = `hero-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("hero-images")
      .upload(fileName, newFile);

    if (uploadError) {
      console.error("Error uploading new hero image:", uploadError);
      throw uploadError;
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("hero-images").getPublicUrl(fileName);

    // Update database record
    const { data, error: updateError } = await supabase
      .from("hero_images")
      .update({ image_url: publicUrl })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating hero image record:", updateError);
      throw updateError;
    }

    // Delete old image from storage
    if (oldImage?.image_url) {
      try {
        const imageUrl = oldImage.image_url;

        if (imageUrl.includes('http')) {
          const url = new URL(imageUrl);
          const pathParts = url.pathname.split('/');
          const bucketIndex = pathParts.findIndex(part => part === 'hero-images');

          if (bucketIndex !== -1 && bucketIndex < pathParts.length - 1) {
            const filePath = pathParts.slice(bucketIndex + 1).join('/');

            const { error: storageError } = await supabase.storage
              .from("hero-images")
              .remove([filePath]);

            if (storageError) {
              console.error("Error deleting old hero image from storage:", storageError);
            }
          }
        } else {
          const { error: storageError } = await supabase.storage
            .from("hero-images")
            .remove([imageUrl]);

          if (storageError) {
            console.error("Error deleting old hero image from storage:", storageError);
          }
        }
      } catch (error) {
        console.error("Error parsing old hero image URL:", error);
      }
    }

    return data as HeroImage;
  } catch (error) {
    console.error("Error in replaceHeroImage:", error);
    return null;
  }
}
