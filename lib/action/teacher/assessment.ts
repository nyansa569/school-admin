// lib/actions/teacher/assessment.ts
"use server";

import { createSupabaseServerClient } from "@/lib/server";
import { revalidatePath } from "next/cache";

// =============================================
// TYPE DEFINITIONS
// =============================================

type AssessmentType = "performance" | "attitude" | "behavior" | "participation";

type StudentAssessment = {
  id?: number;
  student_id: number;
  class_id: number;
  subject_id: number;
  teacher_id: number;
  term_id: number | null;
  academic_year_id: number | null;
  assessment_type: string;
  numeric_score: number | null;
  letter_grade: string | null;
  remarks: string | null;
  recommendations: string | null;
  created_by: number;
};

type AssessmentSummary = {
  student: any;
  performance: AssessmentData | null;
  attitude: AssessmentData | null;
  behavior: AssessmentData | null;
  participation: AssessmentData | null;
};

type AssessmentData = {
  score: number | null;
  grade: string | null;
  remarks: string | null;
  recommendations: string | null;
};

// =============================================
// HELPER FUNCTIONS
// =============================================

async function getCurrentTeacherId(supabase: any): Promise<number | null> {
  const { data: authUser } = await supabase.auth.getUser();
  if (!authUser?.user) return null;

  const { data: staff } = await supabase
    .from("za_demo_staff")
    .select("id")
    .eq("user_id", authUser.user.id)
    .eq("role", "teacher")
    .single();

  return staff?.id || null;
}

export async function checkTeacherAuthorization(classId: number, subjectId: number) {
  const supabase = await createSupabaseServerClient();

  const teacherId = await getCurrentTeacherId(supabase);
  if (!teacherId) {
    return { error: "Unauthorized - Teacher not found", isAuthorized: false };
  }

  // Check if teacher is assigned to this class and subject
  const { data: assignment, error: assignmentError } = await supabase
    .from("za_demo_teacher_subject_class")
    .select("id")
    .eq("teacher_id", teacherId)
    .eq("class_id", classId)
    .eq("subject_id", subjectId)
    .eq("status", "active")
    .is("deleted_at", null)
    .maybeSingle();

  if (assignmentError || !assignment) {
    return { 
      error: "You are not authorized for this class and subject", 
      isAuthorized: false 
    };
  }

  return { isAuthorized: true, teacherId };
}

// =============================================
// GET STUDENTS BY CLASS
// =============================================

export async function getStudentsByClass(classId: number) {
  const supabase = await createSupabaseServerClient();

  // Verify teacher has access to this class
  const teacherId = await getCurrentTeacherId(supabase);
  if (!teacherId) {
    return { error: "Unauthorized" };
  }

  const { data: hasAccess } = await supabase
    .from("za_demo_teacher_subject_class")
    .select("id")
    .eq("teacher_id", teacherId)
    .eq("class_id", classId)
    .eq("status", "active")
    .maybeSingle();

  if (!hasAccess) {
    return { error: "You do not have access to this class" };
  }

  // Get students - fixed column name from "current_class" to "current_class_id"
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
      status
    `)
    .eq("current_class_id", classId)
    .eq("status", "active")
    .is("deleted_at", null)
    .order("last_name", { ascending: true });

  if (error) {
    return { error: error.message };
  }

  // Format students with full name
  const formattedStudents = (students || []).map((student: any) => ({
    ...student,
    full_name: `${student.first_name} ${student.last_name}${student.other_names ? ` ${student.other_names}` : ''}`,
  }));

  return { students: formattedStudents };
}

// =============================================
// GET TERMS AND ACADEMIC YEARS
// =============================================

export async function getAcademicYears() {
  const supabase = await createSupabaseServerClient();

  const { data: academicYears, error } = await supabase
    .from("za_demo_academic_year")
    .select("id, year, name, is_active, start_date, end_date, status")
    .eq("status", "active")
    .order("year", { ascending: false });

  if (error) {
    return { error: error.message };
  }

  return { academicYears: academicYears || [] };
}

export async function getTerms(academicYearId?: number) {
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("za_demo_term")
    .select("id, term_number, name, start_date, end_date, is_active, academic_year_id")
    .eq("status", "active");

  if (academicYearId) {
    query = query.eq("academic_year_id", academicYearId);
  }

  const { data: terms, error } = await query.order("term_number", { ascending: true });

  if (error) {
    return { error: error.message };
  }

  return { terms: terms || [] };
}

export async function getCurrentActiveTerm() {
  const supabase = await createSupabaseServerClient();

  // Get active academic year first
  const { data: activeYear } = await supabase
    .from("za_demo_academic_year")
    .select("id")
    .eq("is_active", true)
    .eq("status", "active")
    .single();

  if (!activeYear) {
    return { term: null, academicYear: null };
  }

  // Get active term for that academic year
  const { data: activeTerm } = await supabase
    .from("za_demo_term")
    .select("id, term_number, name, academic_year_id")
    .eq("academic_year_id", activeYear.id)
    .eq("is_active", true)
    .eq("status", "active")
    .single();

  return { 
    term: activeTerm || null, 
    academicYear: activeYear 
  };
}

// =============================================
// GET ASSESSMENTS
// =============================================

export async function getAssessments(
  classId: number,
  subjectId: number,
  termId?: number,
  academicYearId?: number,
  assessmentType?: AssessmentType
) {
  const supabase = await createSupabaseServerClient();

  const auth = await checkTeacherAuthorization(classId, subjectId);
  if (!auth.isAuthorized) {
    return { error: auth.error };
  }

  const teacherId = auth.teacherId;

  let query = supabase
    .from("za_demo_student_assessment")
    .select(`
      *,
      student:student_id (
        id,
        first_name,
        last_name,
        other_names,
        admission_number,
        student_number
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
    .eq("class_id", classId)
    .eq("subject_id", subjectId)
    .eq("teacher_id", teacherId)
    .is("deleted_at", null);

  if (termId) {
    query = query.eq("term_id", termId);
  }
  if (academicYearId) {
    query = query.eq("academic_year_id", academicYearId);
  }
  if (assessmentType) {
    query = query.eq("assessment_type", assessmentType);
  }

  const { data: assessments, error } = await query.order("created_at", { ascending: false });

  if (error) {
    return { error: error.message };
  }

  return { assessments: assessments || [] };
}

// =============================================
// SAVE INDIVIDUAL STUDENT ASSESSMENT
// =============================================

export async function saveStudentAssessment(
  classId: number,
  subjectId: number,
  studentId: number,
  data: {
    assessment_type: AssessmentType;
    numeric_score?: number;
    letter_grade?: string;
    remarks?: string;
    recommendations?: string;
    term_id?: number;
    academic_year_id?: number;
  }
) {
  const supabase = await createSupabaseServerClient();

  const auth = await checkTeacherAuthorization(classId, subjectId);
  if (!auth.isAuthorized) {
    return { error: auth.error };
  }

  const teacherId = auth.teacherId;

  // Check if assessment already exists
  let query = supabase
    .from("za_demo_student_assessment")
    .select("id")
    .eq("class_id", classId)
    .eq("subject_id", subjectId)
    .eq("student_id", studentId)
    .eq("teacher_id", teacherId)
    .eq("assessment_type", data.assessment_type);

  if (data.term_id) {
    query = query.eq("term_id", data.term_id);
  }
  if (data.academic_year_id) {
    query = query.eq("academic_year_id", data.academic_year_id);
  }

  const { data: existing, error: findError } = await query.maybeSingle();

  if (findError) {
    return { error: findError.message };
  }

  const assessmentData: Partial<StudentAssessment> = {
    class_id: classId,
    subject_id: subjectId,
    student_id: studentId,
    teacher_id: teacherId,
    assessment_type: data.assessment_type,
    numeric_score: data.numeric_score || null,
    letter_grade: data.letter_grade || null,
    remarks: data.remarks || null,
    recommendations: data.recommendations || null,
    term_id: data.term_id || null,
    academic_year_id: data.academic_year_id || null,
    created_by: teacherId,
  };

  let result;
  if (existing) {
    result = await supabase
      .from("za_demo_student_assessment")
      .update({
        ...assessmentData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
  } else {
    result = await supabase
      .from("za_demo_student_assessment")
      .insert(assessmentData);
  }

  if (result.error) {
    return { error: result.error.message };
  }

  //revalidatePath(`/teacher/class/${classId}/subject/${subjectId}/assessment`);
  return { success: true };
}

// =============================================
// BULK SAVE ASSESSMENTS
// =============================================

export async function bulkSaveAssessments(
  classId: number,
  subjectId: number,
  assessments: {
    studentId: number;
    assessment_type: AssessmentType;
    numeric_score?: number;
    letter_grade?: string;
    remarks?: string;
    recommendations?: string;
  }[],
  termId?: number,
  academicYearId?: number
) {
  const supabase = await createSupabaseServerClient();

  const auth = await checkTeacherAuthorization(classId, subjectId);
  if (!auth.isAuthorized) {
    return { error: auth.error };
  }

  const teacherId = auth.teacherId;

  if (!assessments || assessments.length === 0) {
    return { error: "No assessment data provided" };
  }

  const assessmentTypes = [...new Set(assessments.map(a => a.assessment_type))];
  const studentIds = assessments.map(a => a.studentId);

  // Get existing assessments
  let query = supabase
    .from("za_demo_student_assessment")
    .select("id, student_id, assessment_type")
    .eq("class_id", classId)
    .eq("subject_id", subjectId)
    .eq("teacher_id", teacherId)
    .in("student_id", studentIds)
    .in("assessment_type", assessmentTypes);

  if (termId) {
    query = query.eq("term_id", termId);
  }
  if (academicYearId) {
    query = query.eq("academic_year_id", academicYearId);
  }

  const { data: existing, error: findError } = await query;

  if (findError) {
    return { error: findError.message };
  }

  const existingMap = new Map();
  existing?.forEach((item) => {
    existingMap.set(`${item.student_id}_${item.assessment_type}`, item.id);
  });

  const updates = [];
  const inserts = [];

  for (const assessment of assessments) {
    const key = `${assessment.studentId}_${assessment.assessment_type}`;
    const record = {
      class_id: classId,
      subject_id: subjectId,
      student_id: assessment.studentId,
      teacher_id: teacherId,
      assessment_type: assessment.assessment_type,
      numeric_score: assessment.numeric_score || null,
      letter_grade: assessment.letter_grade || null,
      remarks: assessment.remarks || null,
      recommendations: assessment.recommendations || null,
      term_id: termId || null,
      academic_year_id: academicYearId || null,
      created_by: teacherId,
      updated_at: new Date().toISOString(),
    };

    if (existingMap.has(key)) {
      updates.push({ id: existingMap.get(key), ...record });
    } else {
      inserts.push(record);
    }
  }

  // Perform updates
  for (const update of updates) {
    const { id, ...updateData } = update;
    await supabase
      .from("za_demo_student_assessment")
      .update(updateData)
      .eq("id", id);
  }

  // Perform inserts
  if (inserts.length > 0) {
    const { error: insertError } = await supabase
      .from("za_demo_student_assessment")
      .insert(inserts);

    if (insertError) {
      return { error: insertError.message };
    }
  }

  //revalidatePath(`/teacher/class/${classId}/subject/${subjectId}/assessment`);
  return { 
    success: true, 
    updatedCount: updates.length, 
    insertedCount: inserts.length 
  };
}

// =============================================
// GET ASSESSMENT SUMMARY
// =============================================

export async function getAssessmentSummary(
  classId: number,
  subjectId: number,
  termId?: number,
  academicYearId?: number
) {
  const supabase = await createSupabaseServerClient();

  const auth = await checkTeacherAuthorization(classId, subjectId);
  if (!auth.isAuthorized) {
    return { error: auth.error };
  }

  const teacherId = auth.teacherId;

  // Get all students in the class
  const { students, error: studentsError } = await getStudentsByClass(classId);
  if (studentsError) {
    return { error: studentsError };
  }

  if (!students || students.length === 0) {
    return { students: [], summary: { totalStudents: 0, totalAssessments: 0 } };
  }

  // Get assessments for these students
  let query = supabase
    .from("za_demo_student_assessment")
    .select(`
      id,
      student_id,
      assessment_type,
      numeric_score,
      letter_grade,
      remarks,
      recommendations,
      created_at
    `)
    .eq("class_id", classId)
    .eq("subject_id", subjectId)
    .eq("teacher_id", teacherId)
    .is("deleted_at", null);

  if (termId) {
    query = query.eq("term_id", termId);
  }
  if (academicYearId) {
    query = query.eq("academic_year_id", academicYearId);
  }

  const { data: assessments, error: assessmentsError } = await query;

  if (assessmentsError) {
    return { error: assessmentsError.message };
  }

  // Build assessment map by student
  const studentAssessments = new Map<number, AssessmentSummary>();
  
  students.forEach((student: any) => {
    studentAssessments.set(student.id, {
      student,
      performance: null,
      attitude: null,
      behavior: null,
      participation: null,
    });
  });

  // Populate assessments
  assessments?.forEach((assessment: any) => {
    const studentData = studentAssessments.get(assessment.student_id);
    if (studentData) {
      const assessmentData: AssessmentData = {
        score: assessment.numeric_score,
        grade: assessment.letter_grade,
        remarks: assessment.remarks,
        recommendations: assessment.recommendations,
      };
      studentData[assessment.assessment_type as keyof AssessmentSummary] = assessmentData;
    }
  });

  const results = Array.from(studentAssessments.values());

  // Calculate averages
  const performanceScores = results
    .map(r => r.performance?.score)
    .filter((s): s is number => s !== null && s !== undefined);
  
  const attitudeScores = results
    .map(r => r.attitude?.score)
    .filter((s): s is number => s !== null && s !== undefined);
  
  const behaviorScores = results
    .map(r => r.behavior?.score)
    .filter((s): s is number => s !== null && s !== undefined);
  
  const participationScores = results
    .map(r => r.participation?.score)
    .filter((s): s is number => s !== null && s !== undefined);

  const calculateAverage = (scores: number[]): string => {
    return scores.length > 0 
      ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
      : "N/A";
  };

  return {
    students: results,
    summary: {
      totalStudents: students.length,
      totalAssessments: assessments?.length || 0,
      averagePerformance: calculateAverage(performanceScores),
      averageAttitude: calculateAverage(attitudeScores),
      averageBehavior: calculateAverage(behaviorScores),
      averageParticipation: calculateAverage(participationScores),
    },
  };
}

// =============================================
// DELETE ASSESSMENT
// =============================================

export async function deleteAssessment(
  assessmentId: number,
  classId: number,
  subjectId: number
) {
  const supabase = await createSupabaseServerClient();

  const auth = await checkTeacherAuthorization(classId, subjectId);
  if (!auth.isAuthorized) {
    return { error: auth.error };
  }

  const { error } = await supabase
    .from("za_demo_student_assessment")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", assessmentId)
    .eq("teacher_id", auth.teacherId);

  if (error) {
    return { error: error.message };
  }

  //revalidatePath(`/teacher/class/${classId}/subject/${subjectId}/assessment`);
  return { success: true };
}

// =============================================
// GET ASSESSMENT TYPES (UI Helper)
// =============================================

export async function getAssessmentTypes() {
  return {
    types: [
      { value: "performance", label: "Academic Performance", color: "#3b82f6", description: "Student's academic progress and understanding" },
      { value: "attitude", label: "Attitude", color: "#10b981", description: "Student's attitude towards learning and school" },
      { value: "behavior", label: "Behavior", color: "#f59e0b", description: "Student's conduct in class" },
      { value: "participation", label: "Participation", color: "#8b5cf6", description: "Student's engagement in class activities" },
    ],
  };
}

// =============================================
// GET TEACHER'S SUBJECTS FOR A CLASS
// =============================================

export async function getTeacherSubjectsForClass(classId: number) {
  const supabase = await createSupabaseServerClient();

  const teacherId = await getCurrentTeacherId(supabase);
  if (!teacherId) {
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
        credit_hours
      )
    `)
    .eq("teacher_id", teacherId)
    .eq("class_id", classId)
    .eq("status", "active")
    .is("deleted_at", null);

  if (error) {
    return { error: error.message };
  }

  const subjects = (assignments || [])
    .map((item: any) => Array.isArray(item.subject) ? item.subject[0] : item.subject)
    .filter(Boolean);

  return { subjects };
}