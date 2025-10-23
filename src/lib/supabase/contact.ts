import { supabase } from "./client";
import type {
  ContactMessage,
  CreateContactMessageData,
  UpdateContactMessageData,
  ContactMessageStats,
  MessageStatus,
} from "@/types/contact";

/**
 * Submit a contact form message
 * Works for both authenticated and non-authenticated users
 */
export async function createContactMessage(
  messageData: CreateContactMessageData
): Promise<{ success: boolean; message?: ContactMessage; error?: string }> {
  try {
    // Get current user if authenticated (optional)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("contact_messages")
      .insert({
        ...messageData,
        user_id: user?.id || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating contact message:", error);
      return { success: false, error: "Error al enviar el mensaje" };
    }

    return { success: true, message: data as ContactMessage };
  } catch (error) {
    console.error("Error creating contact message:", error);
    return { success: false, error: "Error al enviar el mensaje" };
  }
}

/**
 * Get all contact messages (admin only)
 */
export async function getAllContactMessages(): Promise<ContactMessage[]> {
  const { data, error } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching contact messages:", error);
    return [];
  }

  return data as ContactMessage[];
}

/**
 * Get contact messages by status (admin only)
 */
export async function getContactMessagesByStatus(
  status: MessageStatus
): Promise<ContactMessage[]> {
  const { data, error } = await supabase
    .from("contact_messages")
    .select("*")
    .eq("status", status)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching contact messages by status:", error);
    return [];
  }

  return data as ContactMessage[];
}

/**
 * Get a single contact message by ID (admin only)
 */
export async function getContactMessageById(
  id: string
): Promise<ContactMessage | null> {
  const { data, error } = await supabase
    .from("contact_messages")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching contact message:", error);
    return null;
  }

  return data as ContactMessage;
}

/**
 * Update contact message status and notes (admin only)
 */
export async function updateContactMessage(
  id: string,
  updates: UpdateContactMessageData
): Promise<{ success: boolean; message?: ContactMessage; error?: string }> {
  const { data, error } = await supabase
    .from("contact_messages")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating contact message:", error);
    return { success: false, error: "Error al actualizar el mensaje" };
  }

  return { success: true, message: data as ContactMessage };
}

/**
 * Delete a contact message (admin only)
 */
export async function deleteContactMessage(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from("contact_messages")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting contact message:", error);
    return { success: false, error: "Error al eliminar el mensaje" };
  }

  return { success: true };
}

/**
 * Get contact message statistics (admin only)
 */
export async function getContactMessageStats(): Promise<ContactMessageStats> {
  const { data, error } = await supabase
    .from("contact_messages")
    .select("status");

  if (error) {
    console.error("Error fetching contact message stats:", error);
    return {
      total: 0,
      pending: 0,
      read: 0,
      replied: 0,
      archived: 0,
    };
  }

  const stats = {
    total: data.length,
    pending: data.filter((m) => m.status === "pending").length,
    read: data.filter((m) => m.status === "read").length,
    replied: data.filter((m) => m.status === "replied").length,
    archived: data.filter((m) => m.status === "archived").length,
  };

  return stats;
}

/**
 * Mark message as read (admin only)
 */
export async function markMessageAsRead(
  id: string
): Promise<{ success: boolean; error?: string }> {
  return updateContactMessage(id, { status: "read" });
}

/**
 * Mark message as replied (admin only)
 */
export async function markMessageAsReplied(
  id: string
): Promise<{ success: boolean; error?: string }> {
  return updateContactMessage(id, { status: "replied" });
}

/**
 * Archive message (admin only)
 */
export async function archiveMessage(
  id: string
): Promise<{ success: boolean; error?: string }> {
  return updateContactMessage(id, { status: "archived" });
}
