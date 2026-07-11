// lib/actions/admin/promotion.ts
"use server";

import { createSupabaseServerClient } from "@/lib/server";
import { revalidatePath } from "next/cache";

// =============================================
// TYPE DEFINITIONS
// =============================================

export type PromotionResult = {
  studentId: number;
  studentName: string;
  fromClass: string;
  toClass: string | null;
  fromTerm: number;
  toTerm: number;
  fromAcademicYear: number;
  toAcademicYear: number;
  status: "promoted" | "retained" | "graduated" | "deferred" | "already_promoted" | "error";
  errorMessage?: string;
};

export type BatchPromotionResult = {
  success: boolean;
  totalProcessed: number;
  promotedCount: number;
  retainedCount: number;
  graduatedCount: number;
  deferredCount: number;
  alreadyPromotedCount: number;
  failedCount: number;
  results: PromotionResult[];
  errors: string[];
};

export type PromotedStudent = {
  studentId: number;
  fromClassId: number;
  toClassId: number;
};

export type RetainedStudent = {
  studentId: number;
  classId: number;
};

export type GraduatedStudent = {
  studentId: number;
};

export type DeferredStudent = {
  studentId: number;
};

export type BatchPromotionPayload = {
  fromAcademicYearId: number;
  toAcademicYearId: number;
  fromTermId: number;
  toTermId: number;
  promotedStudents: PromotedStudent[];
  retainedStudents: RetainedStudent[];
  graduatedStudents: GraduatedStudent[];
  deferredStudents: DeferredStudent[];
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
    .is("deleted_at", null)
    .maybeSingle();

  return staff?.id || null;
}

async function getTermById(termId: number) {
  const supabase = await createSupabaseServerClient();
  const { data: term, error } = await supabase
    .from("za_demo_term")
    .select("*")
    .eq("id", termId)
    .eq("status", "active")
    .single();

  if (error) return null;
  return term;
}

async function getAcademicYearById(academicYearId: number) {
  const supabase = await createSupabaseServerClient();
  const { data: year, error } = await supabase
    .from("za_demo_academic_year")
    .select("*")
    .eq("id", academicYearId)
    .eq("status", "active")
    .single();

  if (error) return null;
  return year;
}

async function getClassById(classId: number) {
  const supabase = await createSupabaseServerClient();
  const { data: classData, error } = await supabase
    .from("za_demo_class")
    .select("*")
    .eq("id", classId)
    .eq("status", "active")
    .single();

  if (error) return null;
  return classData;
}

async function getStudentById(studentId: number) {
  const supabase = await createSupabaseServerClient();
  const { data: student, error } = await supabase
    .from("za_demo_student")
    .select("*")
    .eq("id", studentId)
    .eq("status", "active")
    .single();

  if (error) return null;
  return student;
}

async function getStudentCurrentClassAssignment(studentId: number) {
  const supabase = await createSupabaseServerClient();
  const { data: assignment, error } = await supabase
    .from("za_demo_student_class")
    .select("*")
    .eq("student_id", studentId)
    .eq("is_current", true)
    .eq("status", "active")
    .maybeSingle();

  if (error) return null;
  return assignment;
}

async function getStudentClassHistory(studentId: number, academicYearId: number, termId: number) {
  const supabase = await createSupabaseServerClient();
  const { data: history, error } = await supabase
    .from("za_demo_student_class")
    .select("*")
    .eq("student_id", studentId)
    .eq("academic_year_id", academicYearId)
    .eq("term_id", termId)
    .eq("status", "active")
    .maybeSingle();

  if (error) return null;
  return history;
}

async function getAllClasses() {
  const supabase = await createSupabaseServerClient();
  const { data: classes, error } = await supabase
    .from("za_demo_class")
    .select("*")
    .eq("status", "active")
    .order("sequence", { ascending: true });

  if (error) return [];
  return classes;
}

async function getActiveAcademicYear() {
  const supabase = await createSupabaseServerClient();
  const { data: year, error } = await supabase
    .from("za_demo_academic_year")
    .select("*")
    .eq("is_active", true)
    .eq("status", "active")
    .is("deleted_at", null)
    .single();

  if (error) return null;
  return year;
}

async function getActiveTerm(academicYearId: number) {
  const supabase = await createSupabaseServerClient();
  const { data: term, error } = await supabase
    .from("za_demo_term")
    .select("*")
    .eq("academic_year_id", academicYearId)
    .eq("is_active", true)
    .eq("status", "active")
    .single();

  if (error) return null;
  return term;
}

async function getTermsForAcademicYear(academicYearId: number) {
  const supabase = await createSupabaseServerClient();
  const { data: terms, error } = await supabase
    .from("za_demo_term")
    .select("*")
    .eq("academic_year_id", academicYearId)
    .eq("status", "active")
    .order("term_number", { ascending: true });

  if (error) return null;
  return terms;
}

async function createPromotionHistory(
  studentId: number,
  fromClassId: number | null,
  toClassId: number | null,
  fromAcademicYearId: number,
  fromTermId: number,
  toAcademicYearId: number,
  toTermId: number,
  promotionType: string,
  staffId: number | null,
  averageScore?: number | null,
  finalGrade?: string | null,
  decisionReason?: string | null
) {
  const supabase = await createSupabaseServerClient();
  
  const { error } = await supabase
    .from("za_demo_promotion_history")
    .insert({
      student_id: studentId,
      from_class_id: fromClassId,
      to_class_id: toClassId,
      from_academic_year_id: fromAcademicYearId,
      from_term_id: fromTermId,
      to_academic_year_id: toAcademicYearId,
      to_term_id: toTermId,
      promotion_type: promotionType,
      average_score: averageScore || null,
      final_grade: finalGrade || null,
      decision_reason: decisionReason || null,
      approved_by: staffId,
      promoted_at: new Date().toISOString(),
    });

  if (error) {
    console.error("Error creating promotion history:", error);
    throw new Error(`Failed to create promotion history: ${error.message}`);
  }
}

async function createRetentionRecord(
  studentId: number,
  classId: number,
  academicYearId: number,
  termId: number,
  staffId: number | null,
  reason?: string
) {
  const supabase = await createSupabaseServerClient();
  
  const { data: currentRetention, error: fetchError } = await supabase
    .from("za_demo_student_retention")
    .select("retention_count")
    .eq("student_id", studentId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (fetchError) {
    console.error("Error fetching retention count:", fetchError);
  }

  const newCount = (currentRetention?.retention_count || 0) + 1;

  const { error } = await supabase
    .from("za_demo_student_retention")
    .insert({
      student_id: studentId,
      class_id: classId,
      academic_year_id: academicYearId,
      term_id: termId,
      retention_count: newCount,
      max_retention_allowed: 2,
      reason: reason || "Admin initiated retention",
      created_at: new Date().toISOString(),
    });

  if (error) {
    console.error("Error creating retention record:", error);
    throw new Error(`Failed to create retention record: ${error.message}`);
  }

  return newCount;
}

async function assignStudentToClass(
  studentId: number,
  classId: number,
  termId: number,
  academicYearId: number
) {
  const supabase = await createSupabaseServerClient();
  
  const { error: insertError } = await supabase
    .from("za_demo_student_class")
    .insert({
      student_id: studentId,
      class_id: classId,
      term_id: termId,
      academic_year_id: academicYearId,
      is_current: true,
      status: "active",
    });

  if (insertError) {
    console.error("Error creating class assignment:", insertError);
    throw new Error(`Failed to assign student to class: ${insertError.message}`);
  }

  const { error: updateError } = await supabase
    .from("za_demo_student")
    .update({ current_class_id: classId })
    .eq("id", studentId);

  if (updateError) {
    console.error("Error updating student class:", updateError);
    throw new Error(`Failed to update student class: ${updateError.message}`);
  }
}

// =============================================
// SINGLE STUDENT PROMOTION (UNCHANGED)
// =============================================

export async function promoteSingleStudent(studentId: number) {
  const supabase = await createSupabaseServerClient();
  
  try {
    const student = await getStudentById(studentId);
    if (!student) {
      return { success: false, error: "Student not found" };
    }

    if (student.current_class_id === null) {
      return { success: false, error: "Student is already promoted (no current class assigned)" };
    }

    const currentAssignment = await getStudentCurrentClassAssignment(studentId);
    if (!currentAssignment) {
      return { success: false, error: "Student has no active class assignment" };
    }

    const currentClass = await getClassById(currentAssignment.class_id);
    if (!currentClass) {
      return { success: false, error: "Current class not found" };
    }

    const staffId = await getCurrentStaffId(supabase);

    let fromAcademicYearId = currentAssignment.academic_year_id;
    let fromTermId = currentAssignment.term_id;
    
    if (!fromAcademicYearId) {
      const activeYear = await getActiveAcademicYear();
      if (!activeYear) {
        return { success: false, error: "No active academic year found" };
      }
      fromAcademicYearId = activeYear.id;
      
      const activeTerm = await getActiveTerm(activeYear.id);
      if (activeTerm) {
        fromTermId = activeTerm.id;
      }
    }

    if (!fromTermId) {
      return { success: false, error: "No active term found for the academic year" };
    }

    const { error: updateError } = await supabase
      .from("za_demo_student")
      .update({ current_class_id: null })
      .eq("id", studentId);

    if (updateError) {
      throw new Error(`Failed to promote student: ${updateError.message}`);
    }

    await createPromotionHistory(
      studentId,
      currentClass.id,
      null,
      fromAcademicYearId,
      fromTermId,
      fromAcademicYearId,
      fromTermId,
      "promoted",
      staffId,
      null,
      null,
      "Single student promotion by admin"
    );

    revalidatePath("/admin/students");
    revalidatePath("/admin/promotion");

    return {
      success: true,
      message: "Student promoted successfully. They now need to be assigned to a new class.",
      student: {
        id: student.id,
        name: `${student.first_name} ${student.last_name}`,
      },
      fromClass: currentClass.name,
    };
  } catch (err: any) {
    console.error("Error promoting student:", err);
    return { success: false, error: err.message };
  }
}

// =============================================
// ASSIGN PROMOTED STUDENT TO CLASS (UNCHANGED)
// =============================================

export async function assignPromotedStudentToClass(
  studentId: number,
  classId: number,
  termId?: number,
  academicYearId?: number
) {
  const supabase = await createSupabaseServerClient();
  
  try {
    const student = await getStudentById(studentId);
    if (!student) {
      return { success: false, error: "Student not found" };
    }

    const targetClass = await getClassById(classId);
    if (!targetClass) {
      return { success: false, error: "Target class not found" };
    }

    let finalAcademicYearId = academicYearId;
    if (!finalAcademicYearId) {
      const activeYear = await getActiveAcademicYear();
      if (!activeYear) {
        return { success: false, error: "No active academic year found" };
      }
      finalAcademicYearId = activeYear.id;
    }

    let finalTermId = termId;
    if (!finalTermId) {
      const activeTerm = await getActiveTerm(finalAcademicYearId!);
      if (activeTerm) {
        finalTermId = activeTerm.id;
      } else {
        const terms = await getTermsForAcademicYear(finalAcademicYearId!);
        if (terms && terms.length > 0) {
          finalTermId = terms[0].id;
        } else {
          return { success: false, error: "No terms found for the academic year" };
        }
      }
    }

    if (student.current_class_id !== null) {
      return { success: false, error: "Student is not in a promoted state (has a current class assigned)" };
    }

    const staffId = await getCurrentStaffId(supabase);

    await assignStudentToClass(studentId, classId, finalTermId!, finalAcademicYearId!);

    const { error: updateError } = await supabase
      .from("za_demo_promotion_history")
      .update({ 
        to_class_id: classId,
        to_academic_year_id: finalAcademicYearId,
        to_term_id: finalTermId
      })
      .eq("student_id", studentId)
      .eq("to_class_id", null)
      .order("promoted_at", { ascending: false })
      .limit(1);

    if (updateError) {
      console.error("Error updating promotion history:", updateError);
    }

    revalidatePath("/admin/students");
    revalidatePath("/admin/promotion");

    return {
      success: true,
      message: "Student assigned to new class successfully",
      student: {
        id: student.id,
        name: `${student.first_name} ${student.last_name}`,
      },
      assignedClass: targetClass.name,
    };
  } catch (err: any) {
    console.error("Error assigning student to class:", err);
    return { success: false, error: err.message };
  }
}

// =============================================
// BATCH PROMOTION - SAME YEAR (UNCHANGED)
// =============================================

export async function batchPromoteSameYear(
  fromAcademicYearId: number,
  toAcademicYearId: number,
  fromTermId: number,
  toTermId: number
): Promise<BatchPromotionResult> {
  const supabase = await createSupabaseServerClient();
  const results: PromotionResult[] = [];
  const errors: string[] = [];

  try {
    const fromTerm = await getTermById(fromTermId);
    const toTerm = await getTermById(toTermId);

    if (!fromTerm) {
      errors.push("From term not found");
      return { success: false, totalProcessed: 0, promotedCount: 0, retainedCount: 0, graduatedCount: 0, deferredCount: 0, alreadyPromotedCount: 0, failedCount: 0, results: [], errors };
    }
    if (!toTerm) {
      errors.push("To term not found");
      return { success: false, totalProcessed: 0, promotedCount: 0, retainedCount: 0, graduatedCount: 0, deferredCount: 0, alreadyPromotedCount: 0, failedCount: 0, results: [], errors };
    }

    // Deactivate current term
    const { error: deactivateTermError } = await supabase
      .from("za_demo_term")
      .update({ is_active: false })
      .eq("id", fromTermId);

    if (deactivateTermError) {
      errors.push(`Failed to deactivate from term: ${deactivateTermError.message}`);
      return { success: false, totalProcessed: 0, promotedCount: 0, retainedCount: 0, graduatedCount: 0, deferredCount: 0, alreadyPromotedCount: 0, failedCount: 0, results: [], errors };
    }

    // Activate next term
    const { error: activateTermError } = await supabase
      .from("za_demo_term")
      .update({ is_active: true })
      .eq("id", toTermId);

    if (activateTermError) {
      errors.push(`Failed to activate to term: ${activateTermError.message}`);
      return { success: false, totalProcessed: 0, promotedCount: 0, retainedCount: 0, graduatedCount: 0, deferredCount: 0, alreadyPromotedCount: 0, failedCount: 0, results: [], errors };
    }

    results.push({
      studentId: 0,
      studentName: "Batch Promotion - Same Year",
      fromClass: "N/A",
      toClass: "N/A",
      fromTerm: fromTerm.term_number,
      toTerm: toTerm.term_number,
      fromAcademicYear: fromAcademicYearId,
      toAcademicYear: toAcademicYearId,
      status: "promoted",
    });

    revalidatePath("/admin/students");
    revalidatePath("/admin/promotion");

    return {
      success: true,
      totalProcessed: 0,
      promotedCount: 0,
      retainedCount: 0,
      graduatedCount: 0,
      deferredCount: 0,
      alreadyPromotedCount: 0,
      failedCount: 0,
      results,
      errors,
    };
  } catch (err: any) {
    console.error("Batch promotion error:", err);
    errors.push(`Batch promotion failed: ${err.message}`);
    return {
      success: false,
      totalProcessed: 0,
      promotedCount: 0,
      retainedCount: 0,
      graduatedCount: 0,
      deferredCount: 0,
      alreadyPromotedCount: 0,
      failedCount: 0,
      results,
      errors,
    };
  }
}

// =============================================
// BATCH PROMOTION - NEW ACADEMIC YEAR
// =============================================

export async function batchPromoteNewYear(
  payload: BatchPromotionPayload
): Promise<BatchPromotionResult> {
  const supabase = await createSupabaseServerClient();
  const results: PromotionResult[] = [];
  const errors: string[] = [];

  try {
    const {
      fromAcademicYearId,
      toAcademicYearId,
      fromTermId,
      toTermId,
      promotedStudents,
      retainedStudents,
      graduatedStudents,
      deferredStudents,
    } = payload;

    // Validate inputs
    const fromTerm = await getTermById(fromTermId);
    const toTerm = await getTermById(toTermId);
    const fromAcademicYear = await getAcademicYearById(fromAcademicYearId);
    const toAcademicYear = await getAcademicYearById(toAcademicYearId);

    if (!fromTerm) {
      errors.push("From term not found");
      return { success: false, totalProcessed: 0, promotedCount: 0, retainedCount: 0, graduatedCount: 0, deferredCount: 0, alreadyPromotedCount: 0, failedCount: 0, results: [], errors };
    }
    if (!toTerm) {
      errors.push("To term not found");
      return { success: false, totalProcessed: 0, promotedCount: 0, retainedCount: 0, graduatedCount: 0, deferredCount: 0, alreadyPromotedCount: 0, failedCount: 0, results: [], errors };
    }
    if (!fromAcademicYear) {
      errors.push("From academic year not found");
      return { success: false, totalProcessed: 0, promotedCount: 0, retainedCount: 0, graduatedCount: 0, deferredCount: 0, alreadyPromotedCount: 0, failedCount: 0, results: [], errors };
    }
    if (!toAcademicYear) {
      errors.push("To academic year not found");
      return { success: false, totalProcessed: 0, promotedCount: 0, retainedCount: 0, graduatedCount: 0, deferredCount: 0, alreadyPromotedCount: 0, failedCount: 0, results: [], errors };
    }

    // Validate promotion rules
    if (fromTerm.term_number !== 3 || toTerm.term_number !== 1) {
      errors.push("Year transition must be from Term 3 to Term 1");
      return { success: false, totalProcessed: 0, promotedCount: 0, retainedCount: 0, graduatedCount: 0, deferredCount: 0, alreadyPromotedCount: 0, failedCount: 0, results: [], errors };
    }

    if (toAcademicYear.year <= fromAcademicYear.year) {
      errors.push("Next academic year must be after current academic year");
      return { success: false, totalProcessed: 0, promotedCount: 0, retainedCount: 0, graduatedCount: 0, deferredCount: 0, alreadyPromotedCount: 0, failedCount: 0, results: [], errors };
    }

    // Get staff ID
    const staffId = await getCurrentStaffId(supabase);

    let totalProcessed = 0;
    let promotedCount = 0;
    let retainedCount = 0;
    let graduatedCount = 0;
    let deferredCount = 0;
    let alreadyPromotedCount = 0;
    let failedCount = 0;

    // =============================================
    // STEP 1: UPDATE TERMS
    // =============================================
    
    const { error: deactivateTermError } = await supabase
      .from("za_demo_term")
      .update({ is_active: false })
      .eq("id", fromTermId);

    if (deactivateTermError) {
      errors.push(`Failed to deactivate from term: ${deactivateTermError.message}`);
      return { success: false, totalProcessed: 0, promotedCount: 0, retainedCount: 0, graduatedCount: 0, deferredCount: 0, alreadyPromotedCount: 0, failedCount: 0, results: [], errors };
    }

    const { error: activateTermError } = await supabase
      .from("za_demo_term")
      .update({ is_active: true })
      .eq("id", toTermId);

    if (activateTermError) {
      errors.push(`Failed to activate to term: ${activateTermError.message}`);
      return { success: false, totalProcessed: 0, promotedCount: 0, retainedCount: 0, graduatedCount: 0, deferredCount: 0, alreadyPromotedCount: 0, failedCount: 0, results: [], errors };
    }

    // =============================================
    // STEP 2: UPDATE ACADEMIC YEARS
    // =============================================
    
    const { error: deactivateYearError } = await supabase
      .from("za_demo_academic_year")
      .update({ is_active: false })
      .eq("id", fromAcademicYearId);

    if (deactivateYearError) {
      errors.push(`Failed to deactivate from academic year: ${deactivateYearError.message}`);
      return { success: false, totalProcessed: 0, promotedCount: 0, retainedCount: 0, graduatedCount: 0, deferredCount: 0, alreadyPromotedCount: 0, failedCount: 0, results: [], errors };
    }

    const { error: activateYearError } = await supabase
      .from("za_demo_academic_year")
      .update({ is_active: true })
      .eq("id", toAcademicYearId);

    if (activateYearError) {
      errors.push(`Failed to activate to academic year: ${activateYearError.message}`);
      return { success: false, totalProcessed: 0, promotedCount: 0, retainedCount: 0, graduatedCount: 0, deferredCount: 0, alreadyPromotedCount: 0, failedCount: 0, results: [], errors };
    }

    // =============================================
    // STEP 3: PROCESS PROMOTED STUDENTS
    // =============================================
    
    for (const item of promotedStudents) {
      try {
        const student = await getStudentById(item.studentId);
        if (!student) {
          errors.push(`Student ${item.studentId} not found`);
          failedCount++;
          continue;
        }

        const fromClass = await getClassById(item.fromClassId);
        const toClass = await getClassById(item.toClassId);

        if (!fromClass) {
          errors.push(`From class ${item.fromClassId} not found for student ${item.studentId}`);
          failedCount++;
          continue;
        }

        if (!toClass) {
          errors.push(`To class ${item.toClassId} not found for student ${item.studentId}`);
          failedCount++;
          continue;
        }

        // Check if already in target term
        const existingHistory = await getStudentClassHistory(student.id, toAcademicYearId, toTermId);
        if (existingHistory) {
          alreadyPromotedCount++;
          results.push({
            studentId: student.id,
            studentName: student.full_name || `${student.first_name} ${student.last_name}`,
            fromClass: fromClass.name,
            toClass: toClass.name,
            fromTerm: fromTerm.term_number,
            toTerm: toTerm.term_number,
            fromAcademicYear: fromAcademicYearId,
            toAcademicYear: toAcademicYearId,
            status: "already_promoted",
          });
          continue;
        }

        // Update student's current class
        const { error: updateError } = await supabase
          .from("za_demo_student")
          .update({ current_class_id: item.toClassId })
          .eq("id", item.studentId);

        if (updateError) {
          throw new Error(`Failed to update student class: ${updateError.message}`);
        }

        // Deactivate old student_class
        const currentAssignment = await getStudentCurrentClassAssignment(student.id);
        if (currentAssignment) {
          const { error: deactivateError } = await supabase
            .from("za_demo_student_class")
            .update({ is_current: false })
            .eq("id", currentAssignment.id);

          if (deactivateError) {
            console.error("Error deactivating class assignment:", deactivateError);
          }
        }

        // Create new student_class
        await assignStudentToClass(student.id, item.toClassId, toTermId, toAcademicYearId);

        // Create promotion history
        await createPromotionHistory(
          student.id,
          item.fromClassId,
          item.toClassId,
          fromAcademicYearId,
          fromTermId,
          toAcademicYearId,
          toTermId,
          "promoted",
          staffId,
          null,
          null,
          "Batch promotion - new academic year"
        );

        promotedCount++;
        totalProcessed++;

        results.push({
          studentId: student.id,
          studentName: student.full_name || `${student.first_name} ${student.last_name}`,
          fromClass: fromClass.name,
          toClass: toClass.name,
          fromTerm: fromTerm.term_number,
          toTerm: toTerm.term_number,
          fromAcademicYear: fromAcademicYearId,
          toAcademicYear: toAcademicYearId,
          status: "promoted",
        });

      } catch (err: any) {
        failedCount++;
        errors.push(`Error promoting student ${item.studentId}: ${err.message}`);
        results.push({
          studentId: item.studentId,
          studentName: `Student ${item.studentId}`,
          fromClass: "Unknown",
          toClass: "Unknown",
          fromTerm: fromTerm.term_number,
          toTerm: toTerm.term_number,
          fromAcademicYear: fromAcademicYearId,
          toAcademicYear: toAcademicYearId,
          status: "error",
          errorMessage: err.message,
        });
      }
    }

    // =============================================
    // STEP 4: PROCESS RETAINED STUDENTS
    // =============================================
    
    for (const item of retainedStudents) {
      try {
        const student = await getStudentById(item.studentId);
        if (!student) {
          errors.push(`Student ${item.studentId} not found`);
          failedCount++;
          continue;
        }

        const classData = await getClassById(item.classId);
        if (!classData) {
          errors.push(`Class ${item.classId} not found for student ${item.studentId}`);
          failedCount++;
          continue;
        }

        // Check if already in target term
        const existingHistory = await getStudentClassHistory(student.id, toAcademicYearId, toTermId);
        if (existingHistory) {
          alreadyPromotedCount++;
          results.push({
            studentId: student.id,
            studentName: student.full_name || `${student.first_name} ${student.last_name}`,
            fromClass: classData.name,
            toClass: classData.name,
            fromTerm: fromTerm.term_number,
            toTerm: toTerm.term_number,
            fromAcademicYear: fromAcademicYearId,
            toAcademicYear: toAcademicYearId,
            status: "already_promoted",
          });
          continue;
        }

        // // Create retention record
        // await createRetentionRecord(
        //   student.id,
        //   item.classId,
        //   toAcademicYearId,
        //   toTermId,
        //   staffId,
        //   "Admin initiated retention during batch promotion"
        // );

        // Deactivate old student_class
        const currentAssignment = await getStudentCurrentClassAssignment(student.id);
        if (currentAssignment) {
          const { error: deactivateError } = await supabase
            .from("za_demo_student_class")
            .update({ is_current: false })
            .eq("id", currentAssignment.id);

          if (deactivateError) {
            console.error("Error deactivating class assignment:", deactivateError);
          }
        }

        // Create new student_class (same class)
        await assignStudentToClass(student.id, item.classId, toTermId, toAcademicYearId);

        // Create promotion history
        await createPromotionHistory(
          student.id,
          item.classId,
          item.classId,
          fromAcademicYearId,
          fromTermId,
          toAcademicYearId,
          toTermId,
          "retained",
          staffId,
          null,
          null,
          "Student retained - repeating class"
        );

        retainedCount++;
        totalProcessed++;

        results.push({
          studentId: student.id,
          studentName: student.full_name || `${student.first_name} ${student.last_name}`,
          fromClass: classData.name,
          toClass: classData.name,
          fromTerm: fromTerm.term_number,
          toTerm: toTerm.term_number,
          fromAcademicYear: fromAcademicYearId,
          toAcademicYear: toAcademicYearId,
          status: "retained",
        });

      } catch (err: any) {
        failedCount++;
        errors.push(`Error retaining student ${item.studentId}: ${err.message}`);
        results.push({
          studentId: item.studentId,
          studentName: `Student ${item.studentId}`,
          fromClass: "Unknown",
          toClass: "Unknown",
          fromTerm: fromTerm.term_number,
          toTerm: toTerm.term_number,
          fromAcademicYear: fromAcademicYearId,
          toAcademicYear: toAcademicYearId,
          status: "error",
          errorMessage: err.message,
        });
      }
    }

    // =============================================
    // STEP 5: PROCESS GRADUATED STUDENTS
    // =============================================
    
    for (const item of graduatedStudents) {
      try {
        const student = await getStudentById(item.studentId);
        if (!student) {
          errors.push(`Student ${item.studentId} not found`);
          failedCount++;
          continue;
        }

        // Get current class for history
        const currentClass = await getClassById(student.current_class_id!);

        // Update student status
        const { error: updateError } = await supabase
          .from("za_demo_student")
          .update({ 
            status: "graduated",
            current_class_id: null
          })
          .eq("id", item.studentId);

        if (updateError) {
          throw new Error(`Failed to graduate student: ${updateError.message}`);
        }

        // Deactivate student_class
        const currentAssignment = await getStudentCurrentClassAssignment(student.id);
        if (currentAssignment) {
          const { error: deactivateError } = await supabase
            .from("za_demo_student_class")
            .update({ is_current: false })
            .eq("id", currentAssignment.id);

          if (deactivateError) {
            console.error("Error deactivating class assignment:", deactivateError);
          }
        }

        // Create promotion history
        await createPromotionHistory(
          student.id,
          currentClass?.id || null,
          null,
          fromAcademicYearId,
          fromTermId,
          toAcademicYearId,
          toTermId,
          "graduated",
          staffId,
          null,
          null,
          "Student graduated - leaving school"
        );

        graduatedCount++;
        totalProcessed++;

        results.push({
          studentId: student.id,
          studentName: student.full_name || `${student.first_name} ${student.last_name}`,
          fromClass: currentClass?.name || "Unknown",
          toClass: null,
          fromTerm: fromTerm.term_number,
          toTerm: toTerm.term_number,
          fromAcademicYear: fromAcademicYearId,
          toAcademicYear: toAcademicYearId,
          status: "graduated",
        });

      } catch (err: any) {
        failedCount++;
        errors.push(`Error graduating student ${item.studentId}: ${err.message}`);
        results.push({
          studentId: item.studentId,
          studentName: `Student ${item.studentId}`,
          fromClass: "Unknown",
          toClass: null,
          fromTerm: fromTerm.term_number,
          toTerm: toTerm.term_number,
          fromAcademicYear: fromAcademicYearId,
          toAcademicYear: toAcademicYearId,
          status: "error",
          errorMessage: err.message,
        });
      }
    }

    // =============================================
    // STEP 6: PROCESS DEFERRED STUDENTS
    // =============================================
    
    for (const item of deferredStudents) {
      try {
        const student = await getStudentById(item.studentId);
        if (!student) {
          errors.push(`Student ${item.studentId} not found`);
          failedCount++;
          continue;
        }

        // Get current class for history
        const currentClass = await getClassById(student.current_class_id!);

        // Set current_class_id to null (deferred)
        const { error: updateError } = await supabase
          .from("za_demo_student")
          .update({ current_class_id: null })
          .eq("id", item.studentId);

        if (updateError) {
          throw new Error(`Failed to defer student: ${updateError.message}`);
        }

        // Deactivate student_class
        const currentAssignment = await getStudentCurrentClassAssignment(student.id);
        if (currentAssignment) {
          const { error: deactivateError } = await supabase
            .from("za_demo_student_class")
            .update({ is_current: false })
            .eq("id", currentAssignment.id);

          if (deactivateError) {
            console.error("Error deactivating class assignment:", deactivateError);
          }
        }

        // Create promotion history
        await createPromotionHistory(
          student.id,
          currentClass?.id || null,
          null,
          fromAcademicYearId,
          fromTermId,
          toAcademicYearId,
          toTermId,
          "deferred",
          staffId,
          null,
          null,
          "Student deferred - no class assigned"
        );

        deferredCount++;
        totalProcessed++;

        results.push({
          studentId: student.id,
          studentName: student.full_name || `${student.first_name} ${student.last_name}`,
          fromClass: currentClass?.name || "Unknown",
          toClass: null,
          fromTerm: fromTerm.term_number,
          toTerm: toTerm.term_number,
          fromAcademicYear: fromAcademicYearId,
          toAcademicYear: toAcademicYearId,
          status: "deferred",
        });

      } catch (err: any) {
        failedCount++;
        errors.push(`Error deferring student ${item.studentId}: ${err.message}`);
        results.push({
          studentId: item.studentId,
          studentName: `Student ${item.studentId}`,
          fromClass: "Unknown",
          toClass: null,
          fromTerm: fromTerm.term_number,
          toTerm: toTerm.term_number,
          fromAcademicYear: fromAcademicYearId,
          toAcademicYear: toAcademicYearId,
          status: "error",
          errorMessage: err.message,
        });
      }
    }

    revalidatePath("/admin/students");
    revalidatePath("/admin/promotion");

    return {
      success: true,
      totalProcessed,
      promotedCount,
      retainedCount,
      graduatedCount,
      deferredCount,
      alreadyPromotedCount,
      failedCount,
      results,
      errors,
    };
  } catch (err: any) {
    console.error("Batch promotion error:", err);
    errors.push(`Batch promotion failed: ${err.message}`);
    return {
      success: false,
      totalProcessed: 0,
      promotedCount: 0,
      retainedCount: 0,
      graduatedCount: 0,
      deferredCount: 0,
      alreadyPromotedCount: 0,
      failedCount: 0,
      results,
      errors,
    };
  }
}

// =============================================
// VALIDATION FUNCTIONS
// =============================================

export async function validateBatchPromotionInputs(
  fromAcademicYearId: number,
  toAcademicYearId: number,
  fromTermId: number,
  toTermId: number
): Promise<{ valid: boolean; reason?: string }> {
  try {
    const fromTerm = await getTermById(fromTermId);
    const toTerm = await getTermById(toTermId);
    const fromYear = await getAcademicYearById(fromAcademicYearId);
    const toYear = await getAcademicYearById(toAcademicYearId);

    if (!fromTerm) return { valid: false, reason: "From term not found" };
    if (!toTerm) return { valid: false, reason: "To term not found" };
    if (!fromYear) return { valid: false, reason: "From academic year not found" };
    if (!toYear) return { valid: false, reason: "To academic year not found" };

    if (!fromTerm.is_active) {
      return { valid: false, reason: "From term is not active" };
    }

    if (fromAcademicYearId !== toAcademicYearId) {
      if (toYear.year <= fromYear.year) {
        return { valid: false, reason: "Next academic year must be after current academic year" };
      }
      if (fromTerm.term_number !== 3 || toTerm.term_number !== 1) {
        return { valid: false, reason: "Year transition must be from Term 3 to Term 1" };
      }
    }

    if (fromAcademicYearId === toAcademicYearId) {
      if (toTerm.term_number !== fromTerm.term_number + 1) {
        return { valid: false, reason: "Same year promotion must be adjacent terms (1→2 or 2→3)" };
      }
    }

    return { valid: true };
  } catch (err: any) {
    return { valid: false, reason: `Validation error: ${err.message}` };
  }
}

// =============================================
// GET PROMOTION HISTORY (Legacy - keep for backward compatibility)
// =============================================

export async function getPromotionHistory(
  studentId?: number,
  academicYearId?: number,
  termId?: number,
  limit: number = 100
) {
  const supabase = await createSupabaseServerClient();
  
  try {
    let query = supabase
      .from("za_demo_promotion_history")
      .select(`
        *,
        student:student_id (
          id,
          first_name,
          last_name,
          other_names,
          student_number,
          admission_number
        ),
        from_class:from_class_id (
          id,
          name,
          level,
          sequence
        ),
        to_class:to_class_id (
          id,
          name,
          level,
          sequence
        ),
        from_academic_year:from_academic_year_id (
          id,
          year,
          name
        ),
        to_academic_year:to_academic_year_id (
          id,
          year,
          name
        ),
        from_term:from_term_id (
          id,
          term_number,
          name
        ),
        to_term:to_term_id (
          id,
          term_number,
          name
        ),
        approved_by_staff:approved_by (
          id,
          first_name,
          last_name
        )
      `)
      .order("promoted_at", { ascending: false })
      .limit(limit);

    if (studentId) {
      query = query.eq("student_id", studentId);
    }
    if (academicYearId) {
      query = query.eq("from_academic_year_id", academicYearId);
    }
    if (termId) {
      query = query.eq("from_term_id", termId);
    }

    const { data: history, error } = await query;

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      history: history || [],
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}


// =============================================
// GET AVAILABLE NEXT ACADEMIC YEARS
// =============================================

export async function getAvailableNextAcademicYears(currentAcademicYearId: number) {
  const supabase = await createSupabaseServerClient();
  
  try {
    const currentYear = await getAcademicYearById(currentAcademicYearId);
    if (!currentYear) {
      return { success: false, error: "Current academic year not found" };
    }

    const { data: years, error } = await supabase
      .from("za_demo_academic_year")
      .select(`
        id,
        year,
        name,
        start_date,
        end_date,
        is_active,
        status
      `)
      .eq("status", "active")
      .eq("is_active", false)
      .is("deleted_at", null)
      .gte("year", currentYear.year)
      .order("year", { ascending: true });

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      years: years || [],
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}


// =============================================
// GET PROMOTION & RETENTION HISTORY (Combined)
// =============================================

export type HistoryRecord = {
  id: number;
  studentId: number;
  studentName: string;
  studentNumber?: string;
  admissionNumber?: string;
  fromClass: string;
  toClass: string | null;
  fromAcademicYear: number;
  fromTerm: string;
  toAcademicYear: number;
  toTerm: string;
  type: "promoted" | "retained" | "graduated" | "deferred";
  date: string;
  reason?: string | null;
  approvedBy?: string | null;
};

export type HistoryFilter = {
  startDate?: string;
  endDate?: string;
  type?: string[];
  studentId?: number;
  classId?: number;
  academicYearId?: number;
  termId?: number;
  limit?: number;
  offset?: number;
};

export type HistoryResponse = {
  success: boolean;
  data: HistoryRecord[];
  total: number;
  error?: string;
};

export async function getCombinedHistory(filters: HistoryFilter = {}): Promise<HistoryResponse> {
  const supabase = await createSupabaseServerClient();
  
  try {
    const {
      startDate,
      endDate,
      type,
      studentId,
      classId,
      academicYearId,
      termId,
      limit = 100,
      offset = 0,
    } = filters;

    // =============================================
    // 1. FETCH PROMOTION HISTORY
    // =============================================
    
    let promotionQuery = supabase
      .from("za_demo_promotion_history")
      .select(`
        id,
        student_id,
        from_class_id,
        to_class_id,
        from_academic_year_id,
        from_term_id,
        to_academic_year_id,
        to_term_id,
        promotion_type,
        decision_reason,
        approved_by,
        promoted_at,
        student:student_id (
          id,
          first_name,
          last_name,
          other_names,
          student_number,
          admission_number
        ),
        from_class:from_class_id (
          id,
          name
        ),
        to_class:to_class_id (
          id,
          name
        ),
        from_academic_year:from_academic_year_id (
          id,
          year,
          name
        ),
        to_academic_year:to_academic_year_id (
          id,
          year,
          name
        ),
        from_term:from_term_id (
          id,
          term_number,
          name
        ),
        to_term:to_term_id (
          id,
          term_number,
          name
        ),
        approved_by_staff:approved_by (
          id,
          first_name,
          last_name
        )
      `)

    // Apply filters
    if (studentId) {
      promotionQuery = promotionQuery.eq("student_id", studentId);
    }
    if (academicYearId) {
      promotionQuery = promotionQuery.eq("from_academic_year_id", academicYearId);
    }
    if (termId) {
      promotionQuery = promotionQuery.eq("from_term_id", termId);
    }
    if (startDate) {
      promotionQuery = promotionQuery.gte("promoted_at", startDate);
    }
    if (endDate) {
      promotionQuery = promotionQuery.lte("promoted_at", endDate);
    }
    if (type && type.length > 0) {
      const validTypes = type.filter(t => 
        ["promoted", "retained", "graduated", "deferred"].includes(t)
      );
      if (validTypes.length > 0) {
        promotionQuery = promotionQuery.in("promotion_type", validTypes);
      }
    }

    const { data: promotionData, error: promotionError } = await promotionQuery
      .order("promoted_at", { ascending: false });

    if (promotionError) {
      return { success: false, data: [], total: 0, error: promotionError.message };
    }

    // =============================================
    // 2. FETCH RETENTION HISTORY
    // =============================================
    
    let retentionQuery = supabase
      .from("za_demo_student_retention")
      .select(`
        id,
        student_id,
        class_id,
        academic_year_id,
        term_id,
        retention_count,
        reason,
        created_at,
        student:student_id (
          id,
          first_name,
          last_name,
          other_names,
          student_number,
          admission_number
        ),
        class:class_id (
          id,
          name
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

    // Apply filters
    if (studentId) {
      retentionQuery = retentionQuery.eq("student_id", studentId);
    }
    if (academicYearId) {
      retentionQuery = retentionQuery.eq("academic_year_id", academicYearId);
    }
    if (termId) {
      retentionQuery = retentionQuery.eq("term_id", termId);
    }
    if (startDate) {
      retentionQuery = retentionQuery.gte("created_at", startDate);
    }
    if (endDate) {
      retentionQuery = retentionQuery.lte("created_at", endDate);
    }

    const { data: retentionData, error: retentionError } = await retentionQuery
      .order("created_at", { ascending: false });

    if (retentionError) {
      return { success: false, data: [], total: 0, error: retentionError.message };
    }

    // =============================================
    // 3. COMBINE AND FORMAT RESULTS
    // =============================================
    
    const combinedData: HistoryRecord[] = [];

    // Format promotion records
    if (promotionData) {
      promotionData.forEach((record: any) => {
        const student = Array.isArray(record.student) ? record.student[0] : record.student;
        const fromClass = Array.isArray(record.from_class) ? record.from_class[0] : record.from_class;
        const toClass = Array.isArray(record.to_class) ? record.to_class[0] : record.to_class;
        const fromTerm = Array.isArray(record.from_term) ? record.from_term[0] : record.from_term;
        const toTerm = Array.isArray(record.to_term) ? record.to_term[0] : record.to_term;
        const approvedBy = Array.isArray(record.approved_by_staff) ? record.approved_by_staff[0] : record.approved_by_staff;

        combinedData.push({
          id: record.id,
          studentId: record.student_id,
          studentName: student ? `${student.first_name} ${student.last_name}${student.other_names ? ` ${student.other_names}` : ''}` : "Unknown Student",
          studentNumber: student?.student_number,
          admissionNumber: student?.admission_number,
          fromClass: fromClass?.name || "Unknown",
          toClass: toClass?.name || null,
          fromAcademicYear: record.from_academic_year_id,
          fromTerm: fromTerm?.name || `Term ${fromTerm?.term_number}`,
          toAcademicYear: record.to_academic_year_id,
          toTerm: toTerm?.name || `Term ${toTerm?.term_number}`,
          type: record.promotion_type as "promoted" | "retained" | "graduated" | "deferred",
          date: record.promoted_at,
          reason: record.decision_reason,
          approvedBy: approvedBy ? `${approvedBy.first_name} ${approvedBy.last_name}` : null,
        });
      });
    }

    // Format retention records
    if (retentionData) {
      retentionData.forEach((record: any) => {
        const student = Array.isArray(record.student) ? record.student[0] : record.student;
        const classData = Array.isArray(record.class) ? record.class[0] : record.class;
        const term = Array.isArray(record.term) ? record.term[0] : record.term;
        const academicYear = Array.isArray(record.academic_year) ? record.academic_year[0] : record.academic_year;

        combinedData.push({
          id: record.id,
          studentId: record.student_id,
          studentName: student ? `${student.first_name} ${student.last_name}${student.other_names ? ` ${student.other_names}` : ''}` : "Unknown Student",
          studentNumber: student?.student_number,
          admissionNumber: student?.admission_number,
          fromClass: classData?.name || "Unknown",
          toClass: classData?.name || "Unknown",
          fromAcademicYear: academicYear?.id || 0,
          fromTerm: term?.name || `Term ${term?.term_number}`,
          toAcademicYear: academicYear?.id || 0,
          toTerm: term?.name || `Term ${term?.term_number}`,
          type: "retained" as const,
          date: record.created_at,
          reason: record.reason || `Retention count: ${record.retention_count}`,
          approvedBy: null,
        });
      });
    }

    // =============================================
    // 4. SORT BY DATE (NEWEST FIRST) AND APPLY PAGINATION
    // =============================================
    
    combinedData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const total = combinedData.length;
    const paginatedData = combinedData.slice(offset, offset + limit);

    return {
      success: true,
      data: paginatedData,
      total,
    };
  } catch (err: any) {
    console.error("Error fetching combined history:", err);
    return { success: false, data: [], total: 0, error: err.message };
  }
}

// =============================================
// GET PROMOTION STATISTICS (Enhanced with date range)
// =============================================

export async function getPromotionStats(
  academicYearId?: number, 
  termId?: number,
  startDate?: string,
  endDate?: string
) {
  const supabase = await createSupabaseServerClient();
  
  try {
    let query = supabase
      .from("za_demo_promotion_history")
      .select("promotion_type", { count: "exact" });

    if (academicYearId) {
      query = query.eq("from_academic_year_id", academicYearId);
    }
    if (termId) {
      query = query.eq("from_term_id", termId);
    }
    if (startDate) {
      query = query.gte("promoted_at", startDate);
    }
    if (endDate) {
      query = query.lte("promoted_at", endDate);
    }

    const { data: history, error } = await query;

    if (error) {
      return { success: false, error: error.message };
    }

    // Also get retention stats
    let retentionQuery = supabase
      .from("za_demo_student_retention")
      .select("id", { count: "exact" });

    if (academicYearId) {
      retentionQuery = retentionQuery.eq("academic_year_id", academicYearId);
    }
    if (termId) {
      retentionQuery = retentionQuery.eq("term_id", termId);
    }
    if (startDate) {
      retentionQuery = retentionQuery.gte("created_at", startDate);
    }
    if (endDate) {
      retentionQuery = retentionQuery.lte("created_at", endDate);
    }

    const { count: retentionCount, error: retentionError } = await retentionQuery;

    if (retentionError) {
      console.error("Error fetching retention stats:", retentionError);
    }

    const stats = {
      total: history?.length || 0,
      promoted: history?.filter((h: any) => h.promotion_type === "promoted").length || 0,
      retained: history?.filter((h: any) => h.promotion_type === "retained").length || 0,
      graduated: history?.filter((h: any) => h.promotion_type === "graduated").length || 0,
      deferred: history?.filter((h: any) => h.promotion_type === "deferred").length || 0,
      retentionCount: retentionCount || 0,
    };

    return {
      success: true,
      stats,
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}