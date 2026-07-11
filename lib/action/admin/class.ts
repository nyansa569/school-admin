// lib/actions/admin/class.ts
"use server";

import { createSupabaseServerClient } from "@/lib/server";
import { revalidatePath } from "next/cache";

export type Class = {
  id: number;
  name: string;
  sequence: number;
  section: string | null;
  class_code: string | null;
  assigned_teacher: number | null;
  status: string;
  max_students: number | null;
  level: string;
  created_at: string;
  teacher?: {
    id: number;
    first_name: string;
    last_name: string;
  };
};

export type Department = {
  id: number;
  name: string;
  dep_code: string;
  head_teacher: number | null;
  description: string | null;
  status: string;
  created_at: string;
};

export type TeacherSubjectClass = {
  id: number;
  teacher_id: number;
  subject_id: number;
  class_id: number;
  academic_year_id: number;
  term_id: number | null;
  is_class_teacher: boolean;
  created_at: string;
  teacher?: {
    id: number;
    first_name: string;
    last_name: string;
  };
  subject?: {
    id: number;
    title: string;
    subject_code: string;
  };
  class?: {
    id: number;
    name: string;
    level: string;
  };
  academic_year?: {
    id: number;
    year: number;
    name: string;
  };
  term?: {
    id: number;
    term_number: number;
    name: string;
  };
};

export type AcademicYear = {
  id: number;
  year: number;
  name: string;
  is_active: boolean;
  start_date: string;
  end_date: string;
  status: string;
  created_at: string;
  terms?: Term[];
};

export type Term = {
  id: number;
  academic_year_id: number;
  term_number: 1 | 2 | 3;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
};

export type ClassSubject = {
  id: number;
  class_id: number;
  subject_id: number;
  academic_year_id: number;
  term_id: number | null;
  is_mandatory: boolean;
  weekly_hours: number | null;
  status: string;
  created_at: string;
  class?: {
    id: number;
    name: string;
    level: string;
    section: string | null;
  };
  subject?: {
    id: number;
    title: string;
    subject_code: string;
  };
  academic_year?: {
    id: number;
    year: number;
    name: string;
  };
  term?: {
    id: number;
    term_number: number;
    name: string;
  };
};

// ==================== CLASS CRUD ====================

export async function createClass(formData: FormData): Promise<{ error?: string; success?: boolean; classId?: number }> {
  const supabase = await createSupabaseServerClient();

  try {
    const classData = {
      name: formData.get("name")?.toString(),
      sequence: parseInt(formData.get("sequence")?.toString() || "0"),
      section: formData.get("section")?.toString() || null,
      class_code: formData.get("class_code")?.toString() || null,
      assigned_teacher: formData.get("assigned_teacher") ? parseInt(formData.get("assigned_teacher")!.toString()) : null,
      status: formData.get("status")?.toString() || "active",
      max_students: formData.get("max_students") ? parseInt(formData.get("max_students")!.toString()) : null,
      level: formData.get("level")?.toString() || "primary",
    };

    console.log("Creating class with data:", classData);

    if (!classData.name) throw new Error("Class name is required");
    if (classData.sequence < 0) throw new Error("Sequence must be a positive number");

    const { data: classItem, error } = await supabase
      .from("za_demo_class")
      .insert(classData)
      .select()
      .single();

      console.log("Create class result:", { classItem, error });

    if (error) throw new Error(error.message);

    revalidatePath("/admin/classes");
    return { success: true, classId: classItem.id };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function getClasses(): Promise<{ error?: string; classes?: Class[] }> {
  const supabase = await createSupabaseServerClient();

  const { data: classes, error } = await supabase
    .from("za_demo_class")
    .select(`
      *,
      teacher:assigned_teacher (
        id,
        first_name,
        last_name
      )
    `)
    .is("deleted_at", null)
    .order("sequence", { ascending: true });

  if (error) return { error: error.message };
  return { classes: classes || [] };
}

export async function getClassById(id: number): Promise<{ error?: string; class?: Class }> {
  const supabase = await createSupabaseServerClient();

  const { data: classItem, error } = await supabase
    .from("za_demo_class")
    .select(`
      *,
      teacher:assigned_teacher (
        id,
        first_name,
        last_name
      )
    `)
    .eq("id", id)
    .is("deleted_at", null)
    .single();

  if (error) return { error: error.message };
  return { class: classItem };
}

export async function updateClass(id: number, formData: FormData): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createSupabaseServerClient();

  try {
    const classData = {
      name: formData.get("name")?.toString(),
      sequence: parseInt(formData.get("sequence")?.toString() || "0"),
      section: formData.get("section")?.toString() || null,
      class_code: formData.get("class_code")?.toString() || null,
      assigned_teacher: formData.get("assigned_teacher") ? parseInt(formData.get("assigned_teacher")!.toString()) : null,
      status: formData.get("status")?.toString(),
      max_students: formData.get("max_students") ? parseInt(formData.get("max_students")!.toString()) : null,
      level: formData.get("level")?.toString(),
    };

    if (!classData.name) throw new Error("Class name is required");

    const { error } = await supabase
      .from("za_demo_class")
      .update(classData)
      .eq("id", id);

    if (error) throw new Error(error.message);

    revalidatePath("/admin/classes");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function deleteClass(id: number): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("za_demo_class")
    .update({ status: "deleted", deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { error: error.message };
  
  revalidatePath("/admin/classes");
  return { success: true };
}

// ==================== DEPARTMENT CRUD ====================

export async function createDepartment(formData: FormData): Promise<{ error?: string; success?: boolean; departmentId?: number }> {
  const supabase = await createSupabaseServerClient();

  try {
    const departmentData = {
      name: formData.get("name")?.toString(),
      dep_code: formData.get("dep_code")?.toString(),
      head_teacher: formData.get("head_teacher") ? parseInt(formData.get("head_teacher")!.toString()) : null,
      description: formData.get("description")?.toString() || null,
      status: "active",
    };

    if (!departmentData.name) throw new Error("Department name is required");
    if (!departmentData.dep_code) throw new Error("Department code is required");

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

export async function getDepartments(): Promise<{ error?: string; departments?: Department[] }> {
  const supabase = await createSupabaseServerClient();

  const { data: departments, error } = await supabase
    .from("za_demo_department")
    .select("*")
    .eq("status", "active")
    .is("deleted_at", null)
    .order("name", { ascending: true });

  if (error) return { error: error.message };
  return { departments: departments || [] };
}

export async function updateDepartment(id: number, formData: FormData): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createSupabaseServerClient();

  try {
    const departmentData = {
      name: formData.get("name")?.toString(),
      dep_code: formData.get("dep_code")?.toString(),
      head_teacher: formData.get("head_teacher") ? parseInt(formData.get("head_teacher")!.toString()) : null,
      description: formData.get("description")?.toString() || null,
    };

    if (!departmentData.name) throw new Error("Department name is required");

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
    .update({ status: "inactive", deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { error: error.message };
  
  revalidatePath("/admin/departments");
  return { success: true };
}

// ==================== TEACHER SUBJECT CLASS ASSIGNMENT ====================

export async function assignTeacherToSubjectClass(formData: FormData): Promise<{ error?: string; success?: boolean; assignmentId?: number }> {
  const supabase = await createSupabaseServerClient();

  try {
    const assignmentData = {
      teacher_id: parseInt(formData.get("teacher_id")!.toString()),
      subject_id: parseInt(formData.get("subject_id")!.toString()),
      class_id: parseInt(formData.get("class_id")!.toString()),
      academic_year_id: formData.get("academic_year_id") ? parseInt(formData.get("academic_year_id")!.toString()) : null,
      term_id: formData.get("term_id") ? parseInt(formData.get("term_id")!.toString()) : null,
      is_class_teacher: formData.get("is_class_teacher") === "true",
    };

    if (!assignmentData.teacher_id || !assignmentData.subject_id || !assignmentData.class_id) {
      throw new Error("Teacher, subject, and class are required");
    }

    const { data: existing } = await supabase
      .from("za_demo_teacher_subject_class")
      .select("id")
      .eq("teacher_id", assignmentData.teacher_id)
      .eq("subject_id", assignmentData.subject_id)
      .eq("class_id", assignmentData.class_id)
      .eq("academic_year_id", assignmentData.academic_year_id)
      .maybeSingle();

    if (existing) {
      throw new Error("This assignment already exists");
    }

    const { data: assignment, error } = await supabase
      .from("za_demo_teacher_subject_class")
      .insert(assignmentData)
      .select()
      .single();

    if (error) throw new Error(error.message);

    revalidatePath("/admin/assignments");
    return { success: true, assignmentId: assignment.id };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function getTeacherSubjectClassAssignments(): Promise<{ error?: string; assignments?: TeacherSubjectClass[] }> {
  const supabase = await createSupabaseServerClient();

  const { data: assignments, error } = await supabase
    .from("za_demo_teacher_subject_class")
    .select(`
      *,
      teacher:teacher_id (
        id,
        first_name,
        last_name
      ),
      subject:subject_id (
        id,
        title,
        subject_code
      ),
      class:class_id (
        id,
        name,
        level
      ),
      academic_year:academic_year_id (
        id,
        year,
        name
      ),
      term:term_id (
        id,
        term_number,
        name
      )
    `)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) return { error: error.message };
  return { assignments: assignments || [] };
}

export async function getAssignmentsByTeacher(teacherId: number): Promise<{ error?: string; assignments?: TeacherSubjectClass[] }> {
  const supabase = await createSupabaseServerClient();

  const { data: assignments, error } = await supabase
    .from("za_demo_teacher_subject_class")
    .select(`
      *,
      subject:subject_id (
        id,
        title,
        subject_code
      ),
      class:class_id (
        id,
        name,
        level
      ),
      academic_year:academic_year_id (
        id,
        year,
        name
      ),
      term:term_id (
        id,
        term_number,
        name
      )
    `)
    .eq("teacher_id", teacherId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) return { error: error.message };
  return { assignments: assignments || [] };
}

export async function getAssignmentsByClass(classId: number): Promise<{ error?: string; assignments?: TeacherSubjectClass[] }> {
  const supabase = await createSupabaseServerClient();

  const { data: assignments, error } = await supabase
    .from("za_demo_teacher_subject_class")
    .select(`
      *,
      teacher:teacher_id (
        id,
        first_name,
        last_name
      ),
      subject:subject_id (
        id,
        title,
        subject_code
      ),
      academic_year:academic_year_id (
        id,
        year,
        name
      ),
      term:term_id (
        id,
        term_number,
        name
      )
    `)
    .eq("class_id", classId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) return { error: error.message };
  return { assignments: assignments || [] };
}

export async function deleteTeacherSubjectClassAssignment(id: number): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("za_demo_teacher_subject_class")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { error: error.message };
  
  revalidatePath("/admin/assignments");
  return { success: true };
}

// ==================== ACADEMIC YEAR CRUD ====================

export async function createAcademicYear(formData: FormData): Promise<{ error?: string; success?: boolean; yearId?: number }> {
  const supabase = await createSupabaseServerClient();

  try {
    const yearData = {
      year: parseInt(formData.get("year")!.toString()),
      name: formData.get("name")?.toString(),
      start_date: formData.get("start_date")?.toString(),
      end_date: formData.get("end_date")?.toString(),
      is_active: formData.get("is_active") === "true",
      status: "active",
    };

    if (!yearData.year) throw new Error("Year is required");
    if (!yearData.name) throw new Error("Academic year name is required");
    if (!yearData.start_date) throw new Error("Start date is required");
    if (!yearData.end_date) throw new Error("End date is required");

    // If setting as active, deactivate all other academic years first
    if (yearData.is_active) {
      await supabase
        .from("za_demo_academic_year")
        .update({ is_active: false })
        .neq("is_active", false);
    }

    const { data: year, error } = await supabase
      .from("za_demo_academic_year")
      .insert(yearData)
      .select()
      .single();

    if (error) throw new Error(error.message);

    // Create terms for this academic year (Term 1, 2, 3)
    const termsData = [
      {
        academic_year_id: year.id,
        term_number: 1,
        name: "Term 1",
        start_date: yearData.start_date,
        end_date: null,
        is_active: yearData.is_active,
        status: "active",
      },
      {
        academic_year_id: year.id,
        term_number: 2,
        name: "Term 2",
        start_date: null,
        end_date: null,
        is_active: false,
        status: "active",
      },
      {
        academic_year_id: year.id,
        term_number: 3,
        name: "Term 3",
        start_date: null,
        end_date: null,
        is_active: false,
        status: "active",
      },
    ];

    const { error: termsError } = await supabase
      .from("za_demo_term")
      .insert(termsData);

    if (termsError) console.error("Terms creation warning:", termsError.message);

    revalidatePath("/admin/academic-years");
    return { success: true, yearId: year.id };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function getAcademicYears(): Promise<{ error?: string; years?: AcademicYear[] }> {
  const supabase = await createSupabaseServerClient();

  const { data: years, error } = await supabase
    .from("za_demo_academic_year")
    .select(`
      *,
      terms:za_demo_term(*)
    `)
    .eq("status", "active")
    .is("deleted_at", null)
    .order("year", { ascending: false });

  if (error) return { error: error.message };
  return { years: years || [] };
}

export async function updateAcademicYear(id: number, formData: FormData): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createSupabaseServerClient();

  try {
    const wasActive = formData.get("was_active") === "true";
    const isActive = formData.get("is_active") === "true";
    
    const yearData = {
      year: parseInt(formData.get("year")!.toString()),
      name: formData.get("name")?.toString(),
      start_date: formData.get("start_date")?.toString() || null,
      end_date: formData.get("end_date")?.toString() || null,
      is_active: isActive,
    };

    // If setting as active, deactivate all other academic years first
    if (isActive && !wasActive) {
      await supabase
        .from("za_demo_academic_year")
        .update({ is_active: false })
        .neq("id", id);
      
      // Also update terms - set Term 1 as active for this academic year
      await supabase
        .from("za_demo_term")
        .update({ is_active: false })
        .neq("academic_year_id", id);
      
      await supabase
        .from("za_demo_term")
        .update({ is_active: true })
        .eq("academic_year_id", id)
        .eq("term_number", 1);
    }

    const { error } = await supabase
      .from("za_demo_academic_year")
      .update(yearData)
      .eq("id", id);

    if (error) throw new Error(error.message);

    revalidatePath("/admin/academic-years");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function deleteAcademicYear(id: number): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createSupabaseServerClient();

  // Soft delete academic year
  const { error } = await supabase
    .from("za_demo_academic_year")
    .update({ status: "deleted", deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { error: error.message };
  
  // Also soft delete all associated terms
  await supabase
    .from("za_demo_term")
    .update({ status: "deleted", deleted_at: new Date().toISOString() })
    .eq("academic_year_id", id);
  
  revalidatePath("/admin/academic-years");
  return { success: true };
}

// ==================== TERM CRUD ====================
// Note: Terms are auto-created when academic year is created
// These functions are for manual adjustments if needed

export async function getTermById(id: number): Promise<{ error?: string; term?: Term }> {
  const supabase = await createSupabaseServerClient();

  const { data: term, error } = await supabase
    .from("za_demo_term")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .single();

  if (error) return { error: error.message };
  return { term };
}

export async function updateTermDates(id: number, startDate: string, endDate: string): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createSupabaseServerClient();

  try {
    const { error } = await supabase
      .from("za_demo_term")
      .update({
        start_date: startDate,
        end_date: endDate,
      })
      .eq("id", id);

    if (error) throw new Error(error.message);

    revalidatePath("/admin/academic-years");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function activateTerm(termId: number, academicYearId: number): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createSupabaseServerClient();

  try {
    // Deactivate all terms in this academic year
    await supabase
      .from("za_demo_term")
      .update({ is_active: false })
      .eq("academic_year_id", academicYearId);

    // Activate the selected term
    const { error } = await supabase
      .from("za_demo_term")
      .update({ is_active: true })
      .eq("id", termId);

    if (error) throw new Error(error.message);

    revalidatePath("/admin/academic-years");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

// ==================== HELPER FUNCTIONS ====================

export async function getAvailableTeachers(): Promise<{ error?: string; teachers?: any[] }> {
  const supabase = await createSupabaseServerClient();

  const { data: teachers, error } = await supabase
    .from("za_demo_staff")
    .select("id, first_name, last_name, email")
    .eq("role", "teacher")
    .eq("status", "active")
    .is("deleted_at", null)
    .order("first_name", { ascending: true });

  if (error) return { error: error.message };
  return { teachers: teachers || [] };
}

export async function getAvailableSubjects(): Promise<{ error?: string; subjects?: any[] }> {
  const supabase = await createSupabaseServerClient();

  const { data: subjects, error } = await supabase
    .from("za_demo_subject")
    .select("id, title, subject_code")
    .eq("status", "active")
    .is("deleted_at", null)
    .order("title", { ascending: true });

  if (error) return { error: error.message };
  return { subjects: subjects || [] };
}

export async function getAvailableClasses(): Promise<{ error?: string; classes?: any[] }> {
  const supabase = await createSupabaseServerClient();

  const { data: classes, error } = await supabase
    .from("za_demo_class")
    .select("id, name, level, section")
    .eq("status", "active")
    .is("deleted_at", null)
    .order("sequence", { ascending: true });

  if (error) return { error: error.message };
  return { classes: classes || [] };
}

export async function getAvailableAcademicYears(): Promise<{ error?: string; years?: any[] }> {
  const supabase = await createSupabaseServerClient();

  const { data: years, error } = await supabase
    .from("za_demo_academic_year")
    .select("id, year, name, is_active")
    .eq("status", "active")
    .is("deleted_at", null)
    .order("year", { ascending: false });

  if (error) return { error: error.message };
  return { years: years || [] };
}

export async function getAvailableTerms(academicYearId: number): Promise<{ error?: string; terms?: any[] }> {
  const supabase = await createSupabaseServerClient();

  const { data: terms, error } = await supabase
    .from("za_demo_term")
    .select("id, term_number, name, is_active")
    .eq("academic_year_id", academicYearId)
    .eq("status", "active")
    .is("deleted_at", null)
    .order("term_number", { ascending: true });

  if (error) return { error: error.message };
  return { terms: terms || [] };
}

// ==================== BULK ASSIGNMENTS ====================

export async function assignTeacherToMultipleSubjects(
  teacherId: number,
  classId: number,
  subjectIds: number[],
  academicYearId?: number,
  termId?: number
): Promise<{ error?: string; success?: boolean; assignedCount?: number }> {
  const supabase = await createSupabaseServerClient();

  try {
    const assignments = subjectIds.map(subjectId => ({
      teacher_id: teacherId,
      subject_id: subjectId,
      class_id: classId,
      academic_year_id: academicYearId || null,
      term_id: termId || null,
    }));

    const { error, count } = await supabase
      .from("za_demo_teacher_subject_class")
      .insert(assignments);

    if (error) throw new Error(error.message);

    revalidatePath("/admin/assignments");
    return { success: true, assignedCount: count || 0 };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function assignStudentsToClass(classId: number, studentIds: number[]): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createSupabaseServerClient();

  try {
    const { error } = await supabase
      .from("za_demo_student")
      .update({ current_class_id: classId })
      .in("id", studentIds);

    if (error) throw new Error(error.message);

    revalidatePath("/admin/students");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

// ==================== CLASS SUBJECT RELATIONSHIP ====================

export async function assignSubjectToClass(
  classId: number,
  subjectId: number,
  academicYearId: number,
  termId?: number,
  isMandatory: boolean = true,
  weeklyHours: number = 1
): Promise<{ error?: string; success?: boolean; classSubjectId?: number }> {
  const supabase = await createSupabaseServerClient();

  try {
    const { data: existing, error: checkError } = await supabase
      .from("za_demo_class_subject")
      .select("id")
      .eq("class_id", classId)
      .eq("subject_id", subjectId)
      .eq("academic_year_id", academicYearId)
      .eq("term_id", termId)
      .maybeSingle();

    if (checkError) throw new Error(checkError.message);

    if (existing) {
      const { error: updateError } = await supabase
        .from("za_demo_class_subject")
        .update({ status: "active", is_mandatory: isMandatory, weekly_hours: weeklyHours })
        .eq("id", existing.id);

      if (updateError) throw new Error(updateError.message);
      
      revalidatePath("/admin/class-subjects");
      return { success: true, classSubjectId: existing.id };
    }

    const { data: classSubject, error: insertError } = await supabase
      .from("za_demo_class_subject")
      .insert({
        class_id: classId,
        subject_id: subjectId,
        academic_year_id: academicYearId,
        term_id: termId || null,
        is_mandatory: isMandatory,
        weekly_hours: weeklyHours,
        status: "active"
      })
      .select()
      .single();

    if (insertError) throw new Error(insertError.message);

    revalidatePath("/admin/class-subjects");
    return { success: true, classSubjectId: classSubject.id };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function removeSubjectFromClass(
  classId: number,
  subjectId: number,
  academicYearId: number,
  termId?: number
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createSupabaseServerClient();

  try {
    let query = supabase
      .from("za_demo_class_subject")
      .update({ status: "inactive" })
      .eq("class_id", classId)
      .eq("subject_id", subjectId)
      .eq("academic_year_id", academicYearId);

    if (termId) {
      query = query.eq("term_id", termId);
    }

    const { error } = await query;

    if (error) throw new Error(error.message);

    revalidatePath("/admin/class-subjects");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

// In lib/action/admin/class.ts, update getClassSubjects:

export async function getClassSubjects(
  classId?: number, 
  academicYearId?: number, 
  termId?: number
): Promise<{ error?: string; subjects?: ClassSubject[] }> {
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("za_demo_class_subject")
    .select(`
      *,
      class:class_id (
        id,
        name,
        level,
        section
      ),
      subject:subject_id (
        id,
        title,
        subject_code
      ),
      academic_year:academic_year_id (
        id,
        year,
        name
      ),
      term:term_id (
        id,
        term_number,
        name
      )
    `)
    .eq("status", "active");

  // Only add class_id filter if provided
  if (classId) {
    query = query.eq("class_id", classId);
  }
  
  if (academicYearId) {
    query = query.eq("academic_year_id", academicYearId);
  }
  if (termId) {
    query = query.eq("term_id", termId);
  }

  const { data: subjects, error } = await query.order("created_at", { ascending: true });

  if (error) return { error: error.message };
  return { subjects: subjects || [] };
}