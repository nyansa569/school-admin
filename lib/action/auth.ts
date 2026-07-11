// lib/action/auth.ts
"use server";

import { createSupabaseServerClient } from "@/lib/server";
import { revalidatePath } from "next/cache";

type LogoutState = {
  error?: string;
};

type LoginState = {
  error?: string;
  role?: string;
};

type SignupState = {
  error?: string;
  success?: boolean;
};

export async function login(
  prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const supabase = await createSupabaseServerClient();

  const email = formData.get("email")?.toString().trim() || "";
  const password = formData.get("password")?.toString() || "";

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  const { data: authData, error: signInError } =
    await supabase.auth.signInWithPassword({ email, password });

  if (signInError || !authData.user) {
    return { error: signInError?.message || "Invalid credentials" };
  }

  const userId = authData.user.id;

  const { data: profile, error: profileError } = await supabase
    .from("za_demo_user")
    .select("role")
    .eq("user_id", userId)
    .single();

  if (profileError || !profile) {
    return { error: "Unable to fetch user profile" };
  }

  return {
    role: profile.role,
  };
}

// lib/action/auth.ts (updated signup function)

export async function signup(
  prevState: SignupState,
  formData: FormData
): Promise<SignupState> {
  const supabase = await createSupabaseServerClient();

  const email = formData.get("email")?.toString().trim() || "";
  const password = formData.get("password")?.toString() || "";
  const firstName = formData.get("firstName")?.toString().trim() || "";
  const lastName = formData.get("lastName")?.toString().trim() || "";

  if (!email || !password || !firstName || !lastName) {
    return { error: "All fields are required" };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters" };
  }

  // Check if user already exists in za_demo_user
  const { data: existingUser, error: checkError } = await supabase
    .from("za_demo_user")
    .select("email")
    .eq("email", email)
    .maybeSingle();

  if (checkError) {
    return { error: "Error checking existing user: " + checkError.message };
  }

  if (existingUser) {
    return { error: "An account with this email already exists. Please login instead." };
  }

  // Check if user already exists in auth.users (Supabase Auth)
  const { data: authUsers, error: authCheckError } = await supabase.auth.admin.listUsers();
  
  if (!authCheckError && authUsers) {
    const existingAuthUser = authUsers.users.find(
      (user) => user.email?.toLowerCase() === email.toLowerCase()
    );
    
    if (existingAuthUser) {
      return { 
        error: "An account with this email already exists in the system. Please contact administrator."
      };
    }
  }

  // Create new user
  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (signUpError || !authData.user) {
    return { error: signUpError?.message || "Signup failed" };
  }

  const userId = authData.user.id;

  const { error: profileError } = await supabase.from("za_demo_user").insert({
    user_id: userId,
    first_name: firstName,
    last_name: lastName,
    email: email,
    role: "admin",
  });

  if (profileError) {
    // Rollback - delete the auth user
    await supabase.auth.admin.deleteUser(userId);
    return { error: "Failed to create user profile: " + profileError.message };
  }

  return { success: true };
}

export async function logout(): Promise<LogoutState> {
  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/");
    return {};
  } catch (err) {
    console.error("Logout error:", err);
    return { error: "Internal server error" };
  }
}