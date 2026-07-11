// lib/actions/admin/profile.ts
"use server";

import { createSupabaseServerClient } from "@/lib/server";

export type AdminProfile = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  profile_picture: string | null;
  user_id: string;
};

export async function getAdminProfile(): Promise<{ error?: string; profile?: AdminProfile }> {
  const supabase = await createSupabaseServerClient();

  try {
    const { data: authUser, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authUser.user) {
      return { error: "Not authenticated" };
    }

    const { data: profile, error: profileError } = await supabase
      .from("za_demo_user")
      .select("id, first_name, last_name, email, role, profile_picture, user_id")
      .eq("user_id", authUser.user.id)
      .single();

    if (profileError) {
      return { error: profileError.message };
    }

    return { profile };
  } catch (err: any) {
    console.error("Error fetching admin profile:", err);
    return { error: err.message };
  }
}

export async function getAdminInitials(): Promise<string> {
  const { profile } = await getAdminProfile();
  if (!profile) return "U";
  
  const firstInitial = profile.first_name?.charAt(0) || "";
  const lastInitial = profile.last_name?.charAt(0) || "";
  return `${firstInitial}${lastInitial}`.toUpperCase();
}