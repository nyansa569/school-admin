// lib/actions/admin/student.ts
"use server";

import { createSupabaseServerClient } from "@/lib/server";
import { revalidatePath } from "next/cache";
import { uploadFile } from "@/lib/storage/uploadFile";

export type Student = {
  id: number;
  student_number: string;
  first_name: string;
  last_name: string;
  other_names: string | null;
  gender: string;
  date_of_birth: string;
  admission_number: string | null;
  guardian_id: number | null;
  contact_id: number | null;
  image: string | null;
  current_class_id: number | null;
  enrollment_date: string;
  previous_school_id: number | null;
  medical_conditions: string | null;
  allergies: string | null;
  blood_group: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  guardian?: {
    id: number;
    first_name: string;
    last_name: string;
    relationship: string;
    email: string | null;
    phone: string | null;
    occupation: string | null;
  };
  contact?: {
    id: number;
    email: string | null;
    phone: string | null;
    address: string | null;
    city: string | null;
    town: string | null;
    postal_code: string | null;
    country: string;
  };
  class?: {
    id: number;
    name: string;
    level: string;
  };
  previous_school?: {
    id: number;
    name: string;
    class_ended: string | null;
    average_score: number | null;
    year_attended: number | null;
  };
};

// Generate unique student number
async function generateStudentNumber(): Promise<string> {
  const supabase = await createSupabaseServerClient();
  const year = new Date().getFullYear();
  const { count } = await supabase
    .from("za_demo_student")
    .select("id", { count: "exact", head: true });
  
  const sequence = ((count || 0) + 1).toString().padStart(5, "0");
  return `${year}/${sequence}`;
}

// Generate admission number
async function generateAdmissionNumber(): Promise<string> {
  const supabase = await createSupabaseServerClient();
  const year = new Date().getFullYear();
  const { count } = await supabase
    .from("za_demo_student")
    .select("id", { count: "exact", head: true });
  
  const sequence = ((count || 0) + 1).toString().padStart(4, "0");
  return `ADM-${year}-${sequence}`;
}

// Create Student
export async function createStudent(formData: FormData): Promise<{ error?: string; success?: boolean; studentId?: number }> {
  const supabase = await createSupabaseServerClient();

  try {
    // Create Contact (optional)
    let contactId = null;
    const contactEmail = formData.get("contact_email")?.toString();
    const contactPhone = formData.get("contact_phone")?.toString();
    const contactAddress = formData.get("contact_address")?.toString();
    const contactCity = formData.get("contact_city")?.toString();
    const contactTown = formData.get("contact_town")?.toString();

    if (contactEmail || contactPhone || contactAddress) {
      const { data: contact, error: contactError } = await supabase
        .from("za_demo_contact")
        .insert({
          email: contactEmail || null,
          phone: contactPhone || null,
          address: contactAddress || null,
          city: contactCity || null,
          town: contactTown || null,
          country: "Ghana",
          status: "active",
        })
        .select()
        .single();

      if (contactError) throw new Error(`Contact creation failed: ${contactError.message}`);
      contactId = contact.id;
    }

    // Create Guardian (optional)
    let guardianId = null;
    const guardianFirstName = formData.get("guardian_first_name")?.toString();
    const guardianLastName = formData.get("guardian_last_name")?.toString();
    const guardianRelationship = formData.get("guardian_relationship")?.toString();
    const guardianEmail = formData.get("guardian_email")?.toString();
    const guardianPhone = formData.get("guardian_phone")?.toString();
    const guardianOccupation = formData.get("guardian_occupation")?.toString();

    if (guardianFirstName && guardianLastName) {
      const { data: guardian, error: guardianError } = await supabase
        .from("za_demo_guardian")
        .insert({
          first_name: guardianFirstName,
          last_name: guardianLastName,
          relationship: guardianRelationship || null,
          email: guardianEmail || null,
          phone: guardianPhone || null,
          occupation: guardianOccupation || null,
          status: "active",
        })
        .select()
        .single();

      if (guardianError) throw new Error(`Guardian creation failed: ${guardianError.message}`);
      guardianId = guardian.id;
    }

    // Create Previous School (optional)
    let previousSchoolId = null;
    const prevSchoolName = formData.get("prev_school_name")?.toString();
    if (prevSchoolName) {
      const { data: prevSchool, error: prevSchoolError } = await supabase
        .from("za_demo_previous_school")
        .insert({
          name: prevSchoolName,
          class_ended: formData.get("prev_school_class")?.toString() || null,
          average_score: formData.get("prev_school_score") ? parseFloat(formData.get("prev_school_score")!.toString()) : null,
          year_attended: formData.get("prev_school_year") ? parseInt(formData.get("prev_school_year")!.toString()) : null,
          status: "active",
        })
        .select()
        .single();

      if (!prevSchoolError && prevSchool) previousSchoolId = prevSchool.id;
    }

    // Upload image
    let imageUrl = null;
    const imageFile = formData.get("image") as File;
    if (imageFile && imageFile.size > 0) {
      const uploadResult = await uploadFile(imageFile, {
        bucket: "student-images",
        folder: "students",
        upsert: false,
      });
      imageUrl = uploadResult.publicUrl;
    }

    // Generate student numbers
    const studentNumber = await generateStudentNumber();
    const admissionNumber = formData.get("admission_number")?.toString() || await generateAdmissionNumber();

    // Create Student
    const studentData = {
      student_number: studentNumber,
      first_name: formData.get("first_name")?.toString(),
      last_name: formData.get("last_name")?.toString(),
      other_names: formData.get("other_names")?.toString() || null,
      gender: formData.get("gender")?.toString() || "male",
      date_of_birth: formData.get("date_of_birth")?.toString(),
      admission_number: admissionNumber,
      guardian_id: guardianId,
      contact_id: contactId,
      image: imageUrl,
      current_class_id: formData.get("current_class_id") ? parseInt(formData.get("current_class_id")!.toString()) : null,
      enrollment_date: formData.get("enrollment_date")?.toString() || new Date().toISOString().split("T")[0],
      previous_school_id: previousSchoolId,
      medical_conditions: formData.get("medical_conditions")?.toString() || null,
      allergies: formData.get("allergies")?.toString() || null,
      blood_group: formData.get("blood_group")?.toString() || null,
      status: formData.get("status")?.toString() || "active",
    };

    if (!studentData.first_name || !studentData.last_name) {
      throw new Error("First name and last name are required");
    }
    if (!studentData.date_of_birth) {
      throw new Error("Date of birth is required");
    }

    const { data: student, error: studentError } = await supabase
      .from("za_demo_student")
      .insert(studentData)
      .select()
      .single();

    if (studentError) throw new Error(`Student creation failed: ${studentError.message}`);

    // Create Student Class History record
    const classId = formData.get("current_class_id") ? parseInt(formData.get("current_class_id")!.toString()) : null;
    const academicYearId = formData.get("academic_year_id") ? parseInt(formData.get("academic_year_id")!.toString()) : null;
    const termId = formData.get("term_id") ? parseInt(formData.get("term_id")!.toString()) : null;

    if (classId) {
      const { error: classError } = await supabase
        .from("za_demo_student_class")
        .insert({
          student_id: student.id,
          class_id: classId,
          term_id: termId,
          academic_year_id: academicYearId,
          is_current: true,
          status: "active",
        });

      if (classError) {
        console.error("Failed to create student_class record:", classError);
      }
    }

    revalidatePath("/admin/students");
    return { success: true, studentId: student.id };
  } catch (err: any) {
    console.error("Create student error:", err);
    return { error: err.message };
  }
}

// Get all students
export async function getStudents(): Promise<{ error?: string; students?: Student[] }> {
  const supabase = await createSupabaseServerClient();

  const { data: students, error } = await supabase
    .from("za_demo_student")
    .select(`
      *,
      guardian:guardian_id (
        id,
        first_name,
        last_name,
        relationship,
        email,
        phone,
        occupation
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
      class:current_class_id (
        id,
        name,
        level
      ),
      previous_school:previous_school_id (
        id,
        name,
        class_ended,
        average_score,
        year_attended
      )
    `)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Get students error:", error);
    return { error: error.message };
  }
  return { students: students || [] };
}

// Get student by ID
export async function getStudentById(id: number): Promise<{ error?: string; student?: Student }> {
  const supabase = await createSupabaseServerClient();

  const { data: student, error } = await supabase
    .from("za_demo_student")
    .select(`
      *,
      guardian:guardian_id (
        id,
        first_name,
        last_name,
        relationship,
        email,
        phone,
        occupation
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
      class:current_class_id (
        id,
        name,
        level
      ),
      previous_school:previous_school_id (
        id,
        name,
        class_ended,
        average_score,
        year_attended
      )
    `)
    .eq("id", id)
    .is("deleted_at", null)
    .single();

  if (error) {
    console.error("Get student by ID error:", error);
    return { error: error.message };
  }
  return { student };
}

// Update student
export async function updateStudent(id: number, formData: FormData): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createSupabaseServerClient();

  try {
    const { student: existing } = await getStudentById(id);
    if (!existing) throw new Error("Student not found");

    let contactId = existing.contact_id;
    let guardianId = existing.guardian_id;

    // Update or create Contact
    const contactEmail = formData.get("contact_email")?.toString();
    const contactPhone = formData.get("contact_phone")?.toString();
    const contactAddress = formData.get("contact_address")?.toString();
    const contactCity = formData.get("contact_city")?.toString();
    const contactTown = formData.get("contact_town")?.toString();

    if (contactId) {
      await supabase
        .from("za_demo_contact")
        .update({
          email: contactEmail || null,
          phone: contactPhone || null,
          address: contactAddress || null,
          city: contactCity || null,
          town: contactTown || null,
        })
        .eq("id", contactId);
    } else if (contactEmail || contactPhone || contactAddress) {
      const { data: contact } = await supabase
        .from("za_demo_contact")
        .insert({
          email: contactEmail || null,
          phone: contactPhone || null,
          address: contactAddress || null,
          city: contactCity || null,
          town: contactTown || null,
          country: "Ghana",
          status: "active",
        })
        .select()
        .single();
      if (contact) contactId = contact.id;
    }

    // Update or create Guardian
    const guardianFirstName = formData.get("guardian_first_name")?.toString();
    const guardianLastName = formData.get("guardian_last_name")?.toString();
    const guardianRelationship = formData.get("guardian_relationship")?.toString();
    const guardianEmail = formData.get("guardian_email")?.toString();
    const guardianPhone = formData.get("guardian_phone")?.toString();
    const guardianOccupation = formData.get("guardian_occupation")?.toString();

    if (guardianId) {
      await supabase
        .from("za_demo_guardian")
        .update({
          first_name: guardianFirstName,
          last_name: guardianLastName,
          relationship: guardianRelationship || null,
          email: guardianEmail || null,
          phone: guardianPhone || null,
          occupation: guardianOccupation || null,
        })
        .eq("id", guardianId);
    } else if (guardianFirstName && guardianLastName) {
      const { data: guardian } = await supabase
        .from("za_demo_guardian")
        .insert({
          first_name: guardianFirstName,
          last_name: guardianLastName,
          relationship: guardianRelationship || null,
          email: guardianEmail || null,
          phone: guardianPhone || null,
          occupation: guardianOccupation || null,
          status: "active",
        })
        .select()
        .single();
      if (guardian) guardianId = guardian.id;
    }

    // Update or create Previous School
    let previousSchoolId = existing.previous_school_id;
    const prevSchoolName = formData.get("prev_school_name")?.toString();
    if (prevSchoolName) {
      const prevSchoolData = {
        name: prevSchoolName,
        class_ended: formData.get("prev_school_class")?.toString() || null,
        average_score: formData.get("prev_school_score") ? parseFloat(formData.get("prev_school_score")!.toString()) : null,
        year_attended: formData.get("prev_school_year") ? parseInt(formData.get("prev_school_year")!.toString()) : null,
      };

      if (previousSchoolId) {
        await supabase
          .from("za_demo_previous_school")
          .update(prevSchoolData)
          .eq("id", previousSchoolId);
      } else {
        const { data: prevSchool } = await supabase
          .from("za_demo_previous_school")
          .insert({ ...prevSchoolData, status: "active" })
          .select()
          .single();
        if (prevSchool) previousSchoolId = prevSchool.id;
      }
    }

    // Upload new image if provided
    let imageUrl = existing.image;
    const imageFile = formData.get("image") as File;
    if (imageFile && imageFile.size > 0) {
      const uploadResult = await uploadFile(imageFile, {
        bucket: "student-images",
        folder: "students",
        upsert: true,
        filename: `student_${id}`,
      });
      imageUrl = uploadResult.publicUrl;
    }

    const newClassId = formData.get("current_class_id") ? parseInt(formData.get("current_class_id")!.toString()) : null;
    const academicYearId = formData.get("academic_year_id") ? parseInt(formData.get("academic_year_id")!.toString()) : null;
    const termId = formData.get("term_id") ? parseInt(formData.get("term_id")!.toString()) : null;

    // Update student record
    const { error: studentError } = await supabase
      .from("za_demo_student")
      .update({
        first_name: formData.get("first_name")?.toString(),
        last_name: formData.get("last_name")?.toString(),
        other_names: formData.get("other_names")?.toString() || null,
        gender: formData.get("gender")?.toString(),
        date_of_birth: formData.get("date_of_birth")?.toString(),
        admission_number: formData.get("admission_number")?.toString() || existing.admission_number,
        guardian_id: guardianId,
        contact_id: contactId,
        image: imageUrl,
        current_class_id: newClassId,
        previous_school_id: previousSchoolId,
        medical_conditions: formData.get("medical_conditions")?.toString() || null,
        allergies: formData.get("allergies")?.toString() || null,
        blood_group: formData.get("blood_group")?.toString() || null,
        status: formData.get("status")?.toString(),
      })
      .eq("id", id);

    if (studentError) throw new Error(studentError.message);

    // Add class history record if class changed
    if (newClassId && newClassId !== existing.current_class_id) {
      // Mark old class history as not current
      await supabase
        .from("za_demo_student_class")
        .update({ is_current: false })
        .eq("student_id", id)
        .eq("is_current", true);

      // Add new class history
      const { error: classError } = await supabase
        .from("za_demo_student_class")
        .insert({
          student_id: id,
          class_id: newClassId,
          term_id: termId,
          academic_year_id: academicYearId,
          is_current: true,
          status: "active",
        });

      if (classError) {
        console.error("Failed to create student_class record:", classError);
      }
    }

    revalidatePath("/admin/students");
    return { success: true };
  } catch (err: any) {
    console.error("Update student error:", err);
    return { error: err.message };
  }
}

// Delete student (soft delete)
export async function deleteStudent(id: number): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("za_demo_student")
    .update({ 
      deleted_at: new Date().toISOString(),
      status: "deleted"
    })
    .eq("id", id);

  if (error) return { error: error.message };
  
  revalidatePath("/admin/students");
  return { success: true };
}

// Get classes for dropdown
export async function getClasses(): Promise<{ error?: string; classes?: { id: number; name: string; level: string }[] }> {
  const supabase = await createSupabaseServerClient();

  const { data: classes, error } = await supabase
    .from("za_demo_class")
    .select("id, name, level")
    .eq("status", "active")
    .is("deleted_at", null)
    .order("sequence", { ascending: true });

  if (error) return { error: error.message };
  return { classes: classes || [] };
}

// Get academic years for dropdown
export async function getAcademicYears(): Promise<{ error?: string; years?: { id: number; year: number; name: string; is_active: boolean }[] }> {
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

// Get terms for dropdown
export async function getTerms(academicYearId: number): Promise<{ error?: string; terms?: { id: number; term_number: number; name: string }[] }> {
  const supabase = await createSupabaseServerClient();

  const { data: terms, error } = await supabase
    .from("za_demo_term")
    .select("id, term_number, name")
    .eq("academic_year_id", academicYearId)
    .eq("status", "active")
    .is("deleted_at", null)
    .order("term_number", { ascending: true });

  if (error) return { error: error.message };
  return { terms: terms || [] };
}

// Assign guardian to student
export async function assignGuardian(studentId: number, guardianId: number): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("za_demo_student")
    .update({ guardian_id: guardianId })
    .eq("id", studentId);

  if (error) return { error: error.message };
  
  revalidatePath("/admin/students");
  return { success: true };
}

// Assign contact to student
export async function assignContact(studentId: number, contactId: number): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("za_demo_student")
    .update({ contact_id: contactId })
    .eq("id", studentId);

  if (error) return { error: error.message };
  
  revalidatePath("/admin/students");
  return { success: true };
}

// Assign student to class
export async function assignClass(
  studentId: number, 
  classId: number, 
  termId?: number, 
  academicYearId?: number
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createSupabaseServerClient();

  try {
    // Mark current class as not current
    await supabase
      .from("za_demo_student_class")
      .update({ is_current: false })
      .eq("student_id", studentId)
      .eq("is_current", true);

    // Add new class history
    const { error: historyError } = await supabase
      .from("za_demo_student_class")
      .insert({
        student_id: studentId,
        class_id: classId,
        term_id: termId || null,
        academic_year_id: academicYearId || null,
        is_current: true,
        status: "active",
      });

    if (historyError) throw new Error(historyError.message);

    // Update student's current class
    const { error: updateError } = await supabase
      .from("za_demo_student")
      .update({ current_class_id: classId })
      .eq("id", studentId);

    if (updateError) throw new Error(updateError.message);

    revalidatePath("/admin/students");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

// Update student class assignment
export async function updateStudentClassAssignment(
  assignmentId: number, 
  classId: number, 
  termId?: number, 
  academicYearId?: number
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createSupabaseServerClient();

  try {
    const { error } = await supabase
      .from("za_demo_student_class")
      .update({
        class_id: classId,
        term_id: termId || null,
        academic_year_id: academicYearId || null,
      })
      .eq("id", assignmentId);

    if (error) throw new Error(error.message);

    // Update student's current class if this is the current assignment
    const { data: assignment } = await supabase
      .from("za_demo_student_class")
      .select("student_id, is_current")
      .eq("id", assignmentId)
      .single();

    if (assignment?.is_current) {
      await supabase
        .from("za_demo_student")
        .update({ current_class_id: classId })
        .eq("id", assignment.student_id);
    }

    revalidatePath("/admin/students");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

// Get student class history
export async function getStudentClassHistory(studentId: number): Promise<{ error?: string; history?: any[] }> {
  const supabase = await createSupabaseServerClient();

  const { data: history, error } = await supabase
    .from("za_demo_student_class")
    .select(`
      *,
      class:class_id (
        id,
        name,
        level
      ),
      term:term_id (
        id,
        term_number,
        name
      ),
      academic_year:academic_year_id (
        id,
        year,
        name
      )
    `)
    .eq("student_id", studentId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) return { error: error.message };
  return { history: history || [] };
}

// Remove student from class (soft delete)
export async function removeStudentFromClass(assignmentId: number): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("za_demo_student_class")
    .update({ 
      status: "inactive", 
      is_current: false,
      deleted_at: new Date().toISOString()
    })
    .eq("id", assignmentId);

  if (error) return { error: error.message };
  
  // Check if this was the current class and update student if needed
  const { data: assignment } = await supabase
    .from("za_demo_student_class")
    .select("student_id")
    .eq("id", assignmentId)
    .single();

  if (assignment) {
    const { data: currentAssignment } = await supabase
      .from("za_demo_student_class")
      .select("class_id")
      .eq("student_id", assignment.student_id)
      .eq("is_current", true)
      .eq("status", "active")
      .maybeSingle();

    await supabase
      .from("za_demo_student")
      .update({ current_class_id: currentAssignment?.class_id || null })
      .eq("id", assignment.student_id);
  }

  revalidatePath("/admin/students");
  return { success: true };
}

// Bulk assign students to class
export async function bulkAssignStudentsToClass(
  studentIds: number[], 
  classId: number, 
  termId?: number, 
  academicYearId?: number
): Promise<{ error?: string; success?: boolean; assignedCount?: number }> {
  const supabase = await createSupabaseServerClient();

  try {
    const assignments = studentIds.map(studentId => ({
      student_id: studentId,
      class_id: classId,
      term_id: termId || null,
      academic_year_id: academicYearId || null,
      is_current: true,
      status: "active",
    }));

    const { error, count } = await supabase
      .from("za_demo_student_class")
      .insert(assignments);

    if (error) throw new Error(error.message);

    // Update students' current class
    const { error: updateError } = await supabase
      .from("za_demo_student")
      .update({ current_class_id: classId })
      .in("id", studentIds);

    if (updateError) throw new Error(updateError.message);

    revalidatePath("/admin/students");
    return { success: true, assignedCount: count || 0 };
  } catch (err: any) {
    return { error: err.message };
  }
}

// Get all guardians for dropdown
export async function getGuardians(): Promise<{ error?: string; guardians?: { id: number; first_name: string; last_name: string; relationship: string; phone: string | null }[] }> {
  const supabase = await createSupabaseServerClient();

  const { data: guardians, error } = await supabase
    .from("za_demo_guardian")
    .select("id, first_name, last_name, relationship, phone")
    .eq("status", "active")
    .is("deleted_at", null)
    .order("first_name", { ascending: true });

  if (error) return { error: error.message };
  return { guardians: guardians || [] };
}

// Get all contacts for dropdown
export async function getContacts(): Promise<{ error?: string; contacts?: { id: number; email: string | null; phone: string | null }[] }> {
  const supabase = await createSupabaseServerClient();

  const { data: contacts, error } = await supabase
    .from("za_demo_contact")
    .select("id, email, phone")
    .eq("status", "active")
    .is("deleted_at", null)
    .order("id", { ascending: true });

  if (error) return { error: error.message };
  return { contacts: contacts || [] };
}

// Get blood groups for dropdown
export async function getBloodGroups(): Promise<{ error?: string; bloodGroups?: string[] }> {
  return {
    bloodGroups: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
  };
}

// Get genders for dropdown
export async function getGenders(): Promise<{ error?: string; genders?: string[] }> {
  return {
    genders: ["male", "female", "other"],
  };
}

// Get student statuses for dropdown
export async function getStudentStatuses(): Promise<{ error?: string; statuses?: string[] }> {
  return {
    statuses: ["active", "inactive", "graduated", "transferred", "expelled", "withdrawn"],
  };
}

// Get student statistics
export async function getStudentStats(): Promise<{ error?: string; stats?: { total: number; byGender: Record<string, number>; byStatus: Record<string, number>; byClass: Record<string, number> } }> {
  const supabase = await createSupabaseServerClient();

  const { data: students, error } = await supabase
    .from("za_demo_student")
    .select("gender, status, current_class_id")
    .is("deleted_at", null);

  if (error) return { error: error.message };

  const total = students?.length || 0;
  const byGender: Record<string, number> = { male: 0, female: 0, other: 0 };
  const byStatus: Record<string, number> = {};
  const byClass: Record<string, number> = {};

  students?.forEach((s) => {
    if (s.gender) byGender[s.gender] = (byGender[s.gender] || 0) + 1;
    if (s.status) byStatus[s.status] = (byStatus[s.status] || 0) + 1;
    if (s.current_class_id) byClass[s.current_class_id] = (byClass[s.current_class_id] || 0) + 1;
  });

  return {
    stats: {
      total,
      byGender,
      byStatus,
      byClass,
    },
  };
}