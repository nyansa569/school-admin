// lib/actions/admin/department.ts
"use server";

import { createSupabaseServerClient } from "@/lib/server";
import { revalidatePath } from "next/cache";

export type Department = {
  id: number;
  name: string;
  dep_id: string | null;
  head_teacher: number | null;
  code: string | null;
  status: string;
  created_at: string;
  head_teacher_details?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
};

export async function getDepartments(): Promise<{ error?: string; departments?: Department[] }> {
  const supabase = await createSupabaseServerClient();

  const { data: departments, error } = await supabase
    .from("za_demo_department")
    .select(`
      *,
      head_teacher_details:head_teacher (
        id,
        first_name,
        last_name,
        email
      )
    `)
    .order("name", { ascending: true });

  if (error) return { error: error.message };
  return { departments: departments || [] };
}

export async function getDepartmentById(id: number): Promise<{ error?: string; department?: Department }> {
  const supabase = await createSupabaseServerClient();

  const { data: department, error } = await supabase
    .from("za_demo_department")
    .select(`
      *,
      head_teacher_details:head_teacher (
        id,
        first_name,
        last_name,
        email
      )
    `)
    .eq("id", id)
    .single();

  if (error) return { error: error.message };
  return { department };
}

export async function createDepartment(formData: FormData): Promise<{ error?: string; success?: boolean; departmentId?: number }> {
  const supabase = await createSupabaseServerClient();

  try {
    const departmentData = {
      name: formData.get("name")?.toString(),
      dep_id: formData.get("dep_id")?.toString() || null,
      head_teacher: formData.get("head_teacher") ? parseInt(formData.get("head_teacher")!.toString()) : null,
      code: formData.get("code")?.toString() || null,
      status: formData.get("status")?.toString() || "active",
    };

    if (!departmentData.name) {
      throw new Error("Department name is required");
    }

    const { data: department, error } = await supabase
      .from("za_demo_department")
      .insert(departmentData)
      .select()
      .single();

    if (error) throw new Error(error.message);

    revalidatePath("/admin/departments");
    return { success: true, departmentId: department.id };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function updateDepartment(id: number, formData: FormData): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createSupabaseServerClient();

  try {
    const departmentData = {
      name: formData.get("name")?.toString(),
      dep_id: formData.get("dep_id")?.toString() || null,
      head_teacher: formData.get("head_teacher") ? parseInt(formData.get("head_teacher")!.toString()) : null,
      code: formData.get("code")?.toString() || null,
      status: formData.get("status")?.toString(),
    };

    if (!departmentData.name) {
      throw new Error("Department name is required");
    }

    const { error } = await supabase
      .from("za_demo_department")
      .update(departmentData)
      .eq("id", id);

    if (error) throw new Error(error.message);

    revalidatePath("/admin/departments");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function deleteDepartment(id: number): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("za_demo_department")
    .update({ status: "inactive" })
    .eq("id", id);

  if (error) return { error: error.message };
  
  revalidatePath("/admin/departments");
  return { success: true };
}

export async function hardDeleteDepartment(id: number): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("za_demo_department")
    .delete()
    .eq("id", id);

  if (error) return { error: error.message };
  
  revalidatePath("/admin/departments");
  return { success: true };
}

export async function getStaffForDropdown(): Promise<{ error?: string; staff?: any[] }> {
  const supabase = await createSupabaseServerClient();

  const { data: staff, error } = await supabase
    .from("za_demo_staff")
    .select("id, first_name, last_name, email, role")
    .eq("status", "active")
    .order("first_name", { ascending: true });

  if (error) return { error: error.message };
  return { staff: staff || [] };
}

export async function getDepartmentStats(): Promise<{ error?: string; stats?: any }> {
  const supabase = await createSupabaseServerClient();

  const { data: departments, error } = await supabase
    .from("za_demo_department")
    .select("id, status")
    .eq("status", "active");

  if (error) return { error: error.message };

  const { data: staffByDept } = await supabase
    .from("za_demo_staff")
    .select("department_id")
    .not("department_id", "is", null);

  const departmentStaffCount = new Map();
  staffByDept?.forEach((staff: any) => {
    departmentStaffCount.set(staff.department_id, (departmentStaffCount.get(staff.department_id) || 0) + 1);
  });

  return {
    stats: {
      totalDepartments: departments?.length || 0,
      activeDepartments: departments?.filter(d => d.status === "active").length || 0,
    },
  };
}