// Contact Message Types

export type MessageStatus = "pending" | "read" | "replied" | "archived";

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: MessageStatus;
  user_id: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

// DTO for creating a new contact message
export interface CreateContactMessageData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

// DTO for updating a contact message (admin only)
export interface UpdateContactMessageData {
  status?: MessageStatus;
  admin_notes?: string;
}

// Stats for admin dashboard
export interface ContactMessageStats {
  total: number;
  pending: number;
  read: number;
  replied: number;
  archived: number;
}
