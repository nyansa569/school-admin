// lib/actions/teacher/profile.ts
"use server";

import { createSupabaseServerClient } from "@/lib/server";
import { revalidatePath } from "next/cache";

// =============================================
// TYPE DEFINITIONS
// =============================================

type ClassType = {
  id: number;
  name: string;
  level: string;
  section?: string;
  sequence: number;
};

type SubjectType = {
  id: number;
  title: string;
  subject_code: string;
  credit_hours?: number;
  is_elective?: boolean;
};

type TermType = {
  id: number;
  term_number: number;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
};

type AcademicYearType = {
  id: number;
  year: number;
  name: string;
  is_active: boolean;
};

type AssignmentType = {
  id: number;
  subject_id: number;
  class_id: number;
  academic_year_id: number;
  term_id: number | null;
  is_class_teacher: boolean;
  subject: SubjectType;
  class: ClassType;
  academic_year?: AcademicYearType;
  term?: TermType;
};

type StudentType = {
  id: number;
  first_name: string;
  last_name: string;
  other_names: string | null;
  gender: string;
  admission_number: string;
  student_number: string;
  image: string | null;
  status: string;
  guardian?: {
    first_name: string;
    last_name: string;
    phone: string | null;
  } | null;
};

// =============================================
// HELPER FUNCTIONS
// =============================================

async function getCurrentStaffId(supabase: any): Promise<number | null> {
  const { data: authUser } = await supabase.auth.getUser();
  if (!authUser?.user) return null;

  const { data: staff } = await supabase
    .from("za_demo_staff")
    .select("id")
    .eq("user_id", authUser.user.id)
    .single();

  return staff?.id || null;
}

async function getCurrentStaff(supabase: any): Promise<any | null> {
  const { data: authUser } = await supabase.auth.getUser();
  if (!authUser?.user) return null;

  const { data: staff } = await supabase
    .from("za_demo_staff")
    .select("*")
    .eq("user_id", authUser.user.id)
    .single();

  return staff;
}

// =============================================
// GET TEACHER PROFILE
// =============================================

export async function getTeacherProfile() {
  const supabase = await createSupabaseServerClient();

  const { data: authUser, error: authError } = await supabase.auth.getUser();
  if (authError || !authUser.user) {
    return { error: "Unauthorized" };
  }

  // Get staff record with relations
  const { data: staff, error: staffError } = await supabase
    .from("za_demo_staff")
    .select(`
      *,
      user:user_id (
        profile_picture,
        has_password_changed,
        last_login_at
      ),
      contact:contact_id (
        id,
        email,
        phone,
        address,
        city,
        town,
        postal_code,
        country
      ),
      department:department_id (
        id,
        name,
        dep_code,
        description
      )
    `)
    .eq("user_id", authUser.user.id)
    .is("deleted_at", null)
    .single();

  if (staffError || !staff) {
    return { error: "Teacher profile not found" };
  }

  // Get active academic year for filtering current assignments
  const { data: activeYear } = await supabase
    .from("za_demo_academic_year")
    .select("id, year, name, is_active")
    .eq("is_active", true)
    .eq("status", "active")
    .single();

  // Get teacher's assignments (class-subject mapping)
  let assignmentsQuery = supabase
    .from("za_demo_teacher_subject_class")
    .select(`
      id,
      subject_id,
      class_id,
      academic_year_id,
      term_id,
      is_class_teacher,
      status,
      subject:subject_id (
        id,
        title,
        subject_code,
        credit_hours,
        is_elective
      ),
      class:class_id (
        id,
        name,
        level,
        section,
        sequence
      ),
      academic_year:academic_year_id (
        id,
        year,
        name,
        is_active
      ),
      term:term_id (
        id,
        term_number,
        name,
        start_date,
        end_date,
        is_active
      )
    `)
    .eq("teacher_id", staff.id)
    .eq("status", "active")
    .is("deleted_at", null);

  // If there's an active academic year, prioritize it
  if (activeYear) {
    assignmentsQuery = assignmentsQuery.eq("academic_year_id", activeYear.id);
  }

  const { data: assignmentsData, error: assignmentsError } = await assignmentsQuery;

  if (assignmentsError) {
    console.error("Error fetching assignments:", assignmentsError);
  }

  // Process assignments to handle nested array responses from Supabase
  const assignments: AssignmentType[] = (assignmentsData || []).map((item: any) => ({
    id: item.id,
    subject_id: item.subject_id,
    class_id: item.class_id,
    academic_year_id: item.academic_year_id,
    term_id: item.term_id,
    is_class_teacher: item.is_class_teacher,
    subject: Array.isArray(item.subject) ? item.subject[0] : item.subject,
    class: Array.isArray(item.class) ? item.class[0] : item.class,
    academic_year: item.academic_year ? (Array.isArray(item.academic_year) ? item.academic_year[0] : item.academic_year) : null,
    term: item.term ? (Array.isArray(item.term) ? item.term[0] : item.term) : null,
  }));

  // Extract unique classes from assignments
  const uniqueClasses: ClassType[] = [];
  const classMap = new Map<number, ClassType>();
  assignments.forEach((item) => {
    if (item.class && !classMap.has(item.class.id)) {
      classMap.set(item.class.id, item.class);
      uniqueClasses.push(item.class);
    }
  });

  // Extract unique subjects from assignments
  const uniqueSubjects: SubjectType[] = [];
  const subjectMap = new Map<number, SubjectType>();
  assignments.forEach((item) => {
    if (item.subject && !subjectMap.has(item.subject.id)) {
      subjectMap.set(item.subject.id, item.subject);
      uniqueSubjects.push(item.subject);
    }
  });

  // Get active term if applicable
  const { data: activeTerm } = await supabase
    .from("za_demo_term")
    .select("id, term_number, name, start_date, end_date, is_active")
    .eq("is_active", true)
    .eq("status", "active")
    .maybeSingle();

  return {
    profile: {
      id: staff.id,
      staff_number: staff.staff_number,
      first_name: staff.first_name,
      last_name: staff.last_name,
      other_names: staff.other_names,
      email: staff.email,
      phone: staff.phone,
      gender: staff.gender,
      qualification: staff.qualification,
      specialization: staff.specialization,
      role: staff.role,
      employment_type: staff.employment_type,
      employment_status: staff.employment_status,
      hire_date: staff.hire_date,
      profile_picture: staff.user?.profile_picture,
      has_password_changed: staff.user?.has_password_changed || false,
      contact: staff.contact,
      department: staff.department,
      assigned_classes: uniqueClasses,
      assigned_subjects: uniqueSubjects,
      assignments: assignments,
      active_academic_year: activeYear,
      active_term: activeTerm,
    },
  };
}

// =============================================
// UPDATE TEACHER PASSWORD
// =============================================

export async function updateTeacherPassword(
  currentPassword: string,
  newPassword: string,
  confirmPassword: string,
) {
  const supabase = await createSupabaseServerClient();

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: "All password fields are required" };
  }

  if (newPassword !== confirmPassword) {
    return { error: "New passwords do not match" };
  }

  if (newPassword.length < 6) {
    return { error: "Password must be at least 6 characters" };
  }

  const { data: authUser, error: authError } = await supabase.auth.getUser();
  if (authError || !authUser.user) {
    return { error: "Unauthorized" };
  }

  const email = authUser.user.email;
  if (!email) {
    return { error: "User email not found" };
  }

  // Verify current password
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password: currentPassword,
  });

  if (signInError) {
    return { error: "Current password is incorrect" };
  }

  // Update password
  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (updateError) {
    return { error: updateError.message };
  }

  // Update has_password_changed flag
  await supabase
    .from("za_demo_user")
    .update({ has_password_changed: true })
    .eq("user_id", authUser.user.id);

  revalidatePath("/teacher/profile");
  return { success: true };
}

// =============================================
// UPDATE TEACHER CONTACT INFO
// =============================================

export async function updateTeacherContact(formData: FormData) {
  const supabase = await createSupabaseServerClient();

  const { data: authUser, error: authError } = await supabase.auth.getUser();
  if (authError || !authUser.user) {
    return { error: "Unauthorized" };
  }

  const { data: staff, error: staffError } = await supabase
    .from("za_demo_staff")
    .select("id, contact_id")
    .eq("user_id", authUser.user.id)
    .single();

  if (staffError || !staff) {
    return { error: "Teacher not found" };
  }

  const phone = formData.get("phone")?.toString() || null;
  const address = formData.get("address")?.toString() || null;
  const city = formData.get("city")?.toString() || null;
  const town = formData.get("town")?.toString() || null;
  const postalCode = formData.get("postal_code")?.toString() || null;

  if (staff.contact_id) {
    // Update existing contact
    const { error: updateError } = await supabase
      .from("za_demo_contact")
      .update({ 
        phone, 
        address, 
        city, 
        town, 
        postal_code: postalCode,
        updated_at: new Date().toISOString()
      })
      .eq("id", staff.contact_id);

    if (updateError) {
      return { error: updateError.message };
    }
  } else {
    // Create new contact
    const { data: newContact, error: insertError } = await supabase
      .from("za_demo_contact")
      .insert({ 
        phone, 
        address, 
        city, 
        town, 
        postal_code: postalCode,
        email: authUser.user.email,
        country: "Ghana"
      })
      .select()
      .single();

    if (insertError) {
      return { error: insertError.message };
    }

    if (newContact) {
      const { error: staffUpdateError } = await supabase
        .from("za_demo_staff")
        .update({ contact_id: newContact.id })
        .eq("id", staff.id);

      if (staffUpdateError) {
        return { error: staffUpdateError.message };
      }
    }
  }

  revalidatePath("/teacher/profile");
  return { success: true };
}

// =============================================
// GET STUDENTS BY CLASS
// =============================================

export async function getStudentsByClass(classId: number) {
  const supabase = await createSupabaseServerClient();

  // Verify teacher is authorized to access this class
  const staffId = await getCurrentStaffId(supabase);
  if (!staffId) {
    return { error: "Unauthorized" };
  }

  const { data: hasAccess, error: accessError } = await supabase
    .from("za_demo_teacher_subject_class")
    .select("id")
    .eq("teacher_id", staffId)
    .eq("class_id", classId)
    .eq("status", "active")
    .maybeSingle();

  if (accessError || !hasAccess) {
    return { error: "You do not have access to this class" };
  }

  // Get students in the class using current_class_id (correct column name)
  const { data: students, error } = await supabase
    .from("za_demo_student")
    .select(`
      id,
      first_name,
      last_name,
      other_names,
      gender,
      admission_number,
      student_number,
      image,
      status,
      guardian:guardian_id (
        first_name,
        last_name,
        phone
      )
    `)
    .eq("current_class_id", classId)  // Fixed: was "current_class", should be "current_class_id"
    .eq("status", "active")
    .is("deleted_at", null)
    .order("last_name", { ascending: true });

  if (error) {
    return { error: error.message };
  }

  // Format students with full name
  const formattedStudents: StudentType[] = (students || []).map((student: any) => ({
    ...student,
    full_name: `${student.first_name} ${student.last_name}${student.other_names ? ` ${student.other_names}` : ''}`,
  }));

  return { students: formattedStudents };
}

// =============================================
// GET TEACHER STATISTICS
// =============================================

export async function getTeacherStats() {
  const supabase = await createSupabaseServerClient();

  const staffId = await getCurrentStaffId(supabase);
  if (!staffId) {
    return { error: "Unauthorized" };
  }

  // Get teacher's assignments
  const { data: assignments, error: assignmentsError } = await supabase
    .from("za_demo_teacher_subject_class")
    .select("class_id, subject_id")
    .eq("teacher_id", staffId)
    .eq("status", "active")
    .is("deleted_at", null);

  if (assignmentsError) {
    return { error: assignmentsError.message };
  }

  const uniqueClasses = new Set<number>();
  const uniqueSubjects = new Set<number>();

  assignments?.forEach((item: any) => {
    if (item.class_id) uniqueClasses.add(item.class_id);
    if (item.subject_id) uniqueSubjects.add(item.subject_id);
  });

  const classIds = Array.from(uniqueClasses);
  let totalStudents = 0;

  if (classIds.length > 0) {
    // Fixed: use current_class_id instead of current_class
    const { count, error: countError } = await supabase
      .from("za_demo_student")
      .select("id", { count: "exact", head: true })
      .in("current_class_id", classIds)  // Fixed: was "current_class"
      .eq("status", "active")
      .is("deleted_at", null);

    if (!countError) {
      totalStudents = count || 0;
    }
  }

  // Get current active term info
  const { data: activeTerm } = await supabase
    .from("za_demo_term")
    .select("id, term_number, name, start_date, end_date")
    .eq("is_active", true)
    .eq("status", "active")
    .maybeSingle();

  const { data: activeYear } = await supabase
    .from("za_demo_academic_year")
    .select("id, year, name")
    .eq("is_active", true)
    .eq("status", "active")
    .maybeSingle();

  return {
    stats: {
      totalStudents,
      totalClasses: uniqueClasses.size,
      totalSubjects: uniqueSubjects.size,
    },
    active_term: activeTerm,
    active_academic_year: activeYear,
  };
}

// =============================================
// GET TEACHER'S CLASSES WITH SUBJECTS
// =============================================

export async function getTeacherClasses() {
  const supabase = await createSupabaseServerClient();

  const staffId = await getCurrentStaffId(supabase);
  if (!staffId) {
    return { error: "Unauthorized" };
  }

  const { data: assignments, error } = await supabase
    .from("za_demo_teacher_subject_class")
    .select(`
      id,
      class_id,
      subject_id,
      academic_year_id,
      term_id,
      is_class_teacher,
      class:class_id (
        id,
        name,
        level,
        section,
        sequence
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
      )
    `)
    .eq("teacher_id", staffId)
    .eq("status", "active")
    .is("deleted_at", null)
    .order("class_id");

  if (error) {
    return { error: error.message };
  }

  // Group by class
  const classesMap = new Map<number, any>();
  
  (assignments || []).forEach((item: any) => {
    const classData = Array.isArray(item.class) ? item.class[0] : item.class;
    const subjectData = Array.isArray(item.subject) ? item.subject[0] : item.subject;
    
    if (!classData) return;

    if (!classesMap.has(classData.id)) {
      classesMap.set(classData.id, {
        ...classData,
        subjects: [],
        is_class_teacher: item.is_class_teacher,
      });
    }
    
    if (subjectData) {
      classesMap.get(classData.id).subjects.push(subjectData);
    }
  });

  const classes = Array.from(classesMap.values());

  return { classes };
}

// =============================================
// GET TEACHER'S SUBJECTS
// =============================================

export async function getTeacherSubjects() {
  const supabase = await createSupabaseServerClient();

  const staffId = await getCurrentStaffId(supabase);
  if (!staffId) {
    return { error: "Unauthorized" };
  }

  const { data: assignments, error } = await supabase
    .from("za_demo_teacher_subject_class")
    .select(`
      subject_id,
      subject:subject_id (
        id,
        title,
        subject_code,
        credit_hours,
        is_elective
      )
    `)
    .eq("teacher_id", staffId)
    .eq("status", "active")
    .is("deleted_at", null);

  if (error) {
    return { error: error.message };
  }

  const uniqueSubjects = new Map<number, any>();
  
  (assignments || []).forEach((item: any) => {
    const subjectData = Array.isArray(item.subject) ? item.subject[0] : item.subject;
    if (subjectData && !uniqueSubjects.has(subjectData.id)) {
      uniqueSubjects.set(subjectData.id, subjectData);
    }
  });

  const subjects = Array.from(uniqueSubjects.values());

  return { subjects };
}

// =============================================
// GET CURRENT ACTIVE ACADEMIC YEAR AND TERM
// =============================================

export async function getCurrentAcademicInfo() {
  const supabase = await createSupabaseServerClient();

  const { data: activeYear, error: yearError } = await supabase
    .from("za_demo_academic_year")
    .select("id, year, name, start_date, end_date, is_active")
    .eq("is_active", true)
    .eq("status", "active")
    .maybeSingle();

  if (yearError) {
    return { error: yearError.message };
  }

  let activeTerm = null;
  if (activeYear) {
    const { data: term } = await supabase
      .from("za_demo_term")
      .select("id, term_number, name, start_date, end_date, is_active")
      .eq("academic_year_id", activeYear.id)
      .eq("is_active", true)
      .eq("status", "active")
      .maybeSingle();
    
    activeTerm = term;
  }

  return {
    academic_year: activeYear,
    term: activeTerm,
  };
}