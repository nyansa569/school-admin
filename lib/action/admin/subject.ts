// lib/actions/admin/subject.ts
"use server";

import { createSupabaseServerClient } from "@/lib/server";
import { revalidatePath } from "next/cache";

export type Subject = {
  id: number;
  title: string;
  description: string | null;
  subject_code: string | null;
  status: string;
  created_at: string;
};

export async function createSubject(formData: FormData): Promise<{ error?: string; success?: boolean; subjectId?: number }> {
  const supabase = await createSupabaseServerClient();

  try {
    const subjectData = {
      title: formData.get("title")?.toString(),
      description: formData.get("description")?.toString() || null,
      subject_code: formData.get("subject_code")?.toString() || null,
      status: formData.get("status")?.toString() || "active",
    };

    if (!subjectData.title) {
      throw new Error("Subject title is required");
    }

    const { data: subject, error } = await supabase
      .from("za_demo_subject")
      .insert(subjectData)
      .select()
      .single();

    if (error) throw new Error(error.message);

    revalidatePath("/admin/subjects");
    return { success: true, subjectId: subject.id };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function getSubjects(): Promise<{ error?: string; subjects?: Subject[] }> {
  const supabase = await createSupabaseServerClient();

  const { data: subjects, error } = await supabase
    .from("za_demo_subject")
    .select("*")
    .order("title", { ascending: true });

  if (error) return { error: error.message };
  return { subjects: subjects || [] };
}

export async function getSubjectById(id: number): Promise<{ error?: string; subject?: Subject }> {
  const supabase = await createSupabaseServerClient();

  const { data: subject, error } = await supabase
    .from("za_demo_subject")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return { error: error.message };
  return { subject };
}

export async function updateSubject(id: number, formData: FormData): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createSupabaseServerClient();

  try {
    const subjectData = {
      title: formData.get("title")?.toString(),
      description: formData.get("description")?.toString() || null,
      subject_code: formData.get("subject_code")?.toString() || null,
      status: formData.get("status")?.toString(),
    };

    if (!subjectData.title) {
      throw new Error("Subject title is required");
    }

    const { error } = await supabase
      .from("za_demo_subject")
      .update(subjectData)
      .eq("id", id);

    if (error) throw new Error(error.message);

    revalidatePath("/admin/subjects");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function deleteSubject(id: number): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("za_demo_subject")
    .delete()
    .eq("id", id);

  if (error) return { error: error.message };
  
  revalidatePath("/admin/subjects");
  return { success: true };
}