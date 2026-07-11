// lib/auth/index.ts
import { createSupabaseServerClient } from "@/lib/server";

export type AuthSession = {
  userId: string;
  user: {
    id: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    role?: string;
    profile_picture?: string;
  };
};

export async function getSession(): Promise<AuthSession | null> {
  const supabase = await createSupabaseServerClient();

  const { data: user, error } = await supabase.auth.getUser();

  if (error || !user) return null;

  const { data: userProfile } = await supabase
    .from("za_demo_user")
    .select("*")
    .eq("user_id", user.user.id)
    .single();

  if (!userProfile) return null;

  return {
    userId: user.user.id,
    user: {
      id: user.user.id,
      email: user.user.email ?? undefined,
      first_name: userProfile?.first_name ?? undefined,
      last_name: userProfile?.last_name,
      role: userProfile?.role,
      profile_picture: userProfile?.profile_picture,
    },
  };
}