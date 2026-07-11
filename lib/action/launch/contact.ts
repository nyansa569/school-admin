// lib/actions/launch/contact.ts
"use server";

import { createSupabaseServerClient } from "@/lib/server";
import { revalidatePath } from "next/cache";

export type ContactFormData = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

export type ContactResult = {
  success: boolean;
  error?: string;
  messageId?: number;
};

// Subject mapping for database storage
const subjectMap: Record<string, string> = {
  admission: "Admission Inquiry",
  programs: "Program Information",
  tuition: "Tuition & Fees",
  events: "School Events",
  complaint: "Complaint/Suggestion",
  other: "Other Inquiry",
};

// Validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate phone format (optional, Ghana format)
function isValidPhone(phone: string): boolean {
  if (!phone) return true;
  const phoneRegex = /^(\+233|0)[0-9]{9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
}

// Sanitize input to prevent XSS
function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, "")
    .trim()
    .slice(0, 5000);
}

// Get IP address (you may need to pass this from the client)
async function getClientIP(): Promise<string | null> {
  // This would typically come from headers in a Route Handler
  // For now, return null
  return null;
}

// Main contact form submission
export async function submitContactForm(formData: FormData): Promise<ContactResult> {
  const supabase = await createSupabaseServerClient();

  try {
    // Extract and sanitize form data
    const name = sanitizeInput(formData.get("name")?.toString() || "");
    const email = formData.get("email")?.toString()?.toLowerCase().trim() || "";
    const phone = formData.get("phone")?.toString()?.trim() || "";
    const subjectKey = formData.get("subject")?.toString() || "";
    const message = sanitizeInput(formData.get("message")?.toString() || "");

    // Map subject to display value
    const subject = subjectMap[subjectKey] || subjectKey || "General Inquiry";

    // Validate required fields
    if (!name || name.length < 2) {
      return { success: false, error: "Please enter your full name (minimum 2 characters)" };
    }

    if (!email) {
      return { success: false, error: "Please enter your email address" };
    }

    if (!isValidEmail(email)) {
      return { success: false, error: "Please enter a valid email address" };
    }

    if (!subjectKey) {
      return { success: false, error: "Please select a subject" };
    }

    if (!message || message.length < 10) {
      return { success: false, error: "Please enter a message (minimum 10 characters)" };
    }

    if (message.length > 5000) {
      return { success: false, error: "Message is too long. Please limit to 5000 characters" };
    }

    // Validate phone if provided
    if (phone && !isValidPhone(phone)) {
      return { success: false, error: "Please enter a valid phone number (e.g., 0541234567 or +233541234567)" };
    }

    // Check for spam (basic rate limiting by email - last message within 5 minutes)
    const fiveMinutesAgo = new Date();
    fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);

    const { data: recentMessage, error: recentError } = await supabase
      .from("za_demo_contact_message")
      .select("id")
      .eq("email", email)
      .gte("created_at", fiveMinutesAgo.toISOString())
      .limit(1);

    if (!recentError && recentMessage && recentMessage.length > 0) {
      return { success: false, error: "You have submitted a message recently. Please wait a few minutes before sending another." };
    }

    // Insert contact message
    const { data: messageData, error: insertError } = await supabase
      .from("za_demo_contact_message")
      .insert({
        name,
        email,
        phone: phone || null,
        subject,
        message,
        status: "pending",
        is_read: false,
        ip_address: await getClientIP(),
      })
      .select()
      .single();

    if (insertError) throw new Error(`Failed to send message: ${insertError.message}`);

    // Optional: Send email notification to school admin
    // This would be implemented separately with a email service like Resend, Nodemailer, etc.
    // await sendContactNotificationEmail({ name, email, phone, subject, message });

    revalidatePath("/contact");
    return { success: true, messageId: messageData.id };

  } catch (err: any) {
    console.error("Contact form submission error:", err);
    return { success: false, error: err.message || "Failed to send message. Please try again." };
  }
}

// Admin: Get all contact messages (for admin dashboard)
export async function getContactMessages(filters?: {
  status?: string;
  is_read?: boolean;
  fromDate?: string;
  toDate?: string;
  limit?: number;
  offset?: number;
}) {
  const supabase = await createSupabaseServerClient();

  try {
    let query = supabase
      .from("za_demo_contact_message")
      .select("*", { count: "exact" })
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (filters?.status) {
      query = query.eq("status", filters.status);
    }
    if (filters?.is_read !== undefined) {
      query = query.eq("is_read", filters.is_read);
    }
    if (filters?.fromDate) {
      query = query.gte("created_at", filters.fromDate);
    }
    if (filters?.toDate) {
      query = query.lte("created_at", filters.toDate);
    }
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1);
    }

    const { data: messages, error, count } = await query;

    if (error) throw new Error(error.message);

    return { messages: messages || [], total: count || 0 };
  } catch (err: any) {
    console.error("Error fetching contact messages:", err);
    return { error: err.message, messages: [], total: 0 };
  }
}

// Admin: Get single contact message
export async function getContactMessageById(id: number) {
  const supabase = await createSupabaseServerClient();

  try {
    const { data: message, error } = await supabase
      .from("za_demo_contact_message")
      .select("*")
      .eq("id", id)
      .is("deleted_at", null)
      .single();

    if (error) throw new Error(error.message);

    // Mark as read if not already
    if (!message.is_read) {
      await supabase
        .from("za_demo_contact_message")
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
          status: "read",
        })
        .eq("id", id);
    }

    return { message };
  } catch (err: any) {
    console.error("Error fetching contact message:", err);
    return { error: err.message };
  }
}

// Admin: Mark message as read
export async function markMessageAsRead(id: number) {
  const supabase = await createSupabaseServerClient();

  try {
    const { error } = await supabase
      .from("za_demo_contact_message")
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
        status: "read",
      })
      .eq("id", id);

    if (error) throw new Error(error.message);

    revalidatePath("/admin/contact");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

// Admin: Reply to message
export async function replyToMessage(
  id: number,
  replyMessage: string,
  staffId: number
) {
  const supabase = await createSupabaseServerClient();

  try {
    const { error } = await supabase
      .from("za_demo_contact_message")
      .update({
        status: "replied",
        replied_at: new Date().toISOString(),
        replied_by: staffId,
        reply_message: replyMessage,
      })
      .eq("id", id);

    if (error) throw new Error(error.message);

    // Optional: Send email reply notification
    // await sendReplyEmail(message.email, replyMessage);

    revalidatePath("/admin/contact");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

// Admin: Archive or mark as spam
export async function updateMessageStatus(id: number, status: "archived" | "spam") {
  const supabase = await createSupabaseServerClient();

  try {
    const { error } = await supabase
      .from("za_demo_contact_message")
      .update({ status })
      .eq("id", id);

    if (error) throw new Error(error.message);

    revalidatePath("/admin/contact");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

// Admin: Delete message (soft delete)
export async function deleteContactMessage(id: number) {
  const supabase = await createSupabaseServerClient();

  try {
    const { error } = await supabase
      .from("za_demo_contact_message")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw new Error(error.message);

    revalidatePath("/admin/contact");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

// Get unread message count (for admin badge)
export async function getUnreadMessageCount() {
  const supabase = await createSupabaseServerClient();

  try {
    const { count, error } = await supabase
      .from("za_demo_contact_message")
      .select("id", { count: "exact", head: true })
      .eq("is_read", false)
      .eq("status", "pending")
      .is("deleted_at", null);

    if (error) throw new Error(error.message);

    return { count: count || 0 };
  } catch (err: any) {
    console.error("Error getting unread count:", err);
    return { count: 0 };
  }
}