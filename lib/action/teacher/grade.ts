"use server";
// lib/actions/teacher/grade.ts

import { createSupabaseServerClient } from "@/lib/server";
import { revalidatePath } from "next/cache";

// =============================================
// TYPE DEFINITIONS
// =============================================

type ScoreType = "assessment" | "exam";

// Constants
const DEFAULT_ASSESSMENT_WEIGHT = 70;
const DEFAULT_EXAM_WEIGHT = 30;

// =============================================
// HELPER FUNCTIONS
// =============================================

async function getAuthenticatedTeacherId(): Promise<{ teacherId: number | null; error: string | null }> {
  const supabase = await createSupabaseServerClient();

  const { data: authUser, error: authError } = await supabase.auth.getUser();
  if (authError || !authUser.user) {
    return { teacherId: null, error: "Unauthorized" };
  }

  const { data: staff, error: staffError } = await supabase
    .from("za_demo_staff")
    .select("id")
    .eq("user_id", authUser.user.id)
    .single();

  if (staffError || !staff) {
    return { teacherId: null, error: "Staff record not found" };
  }

  return { teacherId: staff.id, error: null };
}

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

// Check if teacher is authorized for the class and subject
export async function checkTeacherAuthorization(
  classId: number, 
  subjectId: number, 
  academicYearId?: number,
  termId?: number
) {
  const supabase = await createSupabaseServerClient();

  const { teacherId, error: teacherError } = await getAuthenticatedTeacherId();
  if (teacherError) {
    return { error: teacherError, isAuthorized: false };
  }

  let query = supabase
    .from("za_demo_teacher_subject_class")
    .select("*")
    .eq("teacher_id", teacherId)
    .eq("class_id", classId)
    .eq("subject_id", subjectId)
    .eq("status", "active")
    .is("deleted_at", null);

    console.log("Authorization query built", { classId, subjectId, teacherId, academicYearId, termId });
    console.log("Query conditions", query);

  if (academicYearId) {
    query = query.eq("academic_year_id", academicYearId);
  }
  if (termId) {
    query = query.eq("term_id", termId);
  }

  const { data: assignment, error: assignmentError } = await query.maybeSingle();

  if (assignmentError || !assignment) {
    return { error: "You are not authorized for this class and subject", isAuthorized: false };
  }

  return { isAuthorized: true, teacherId };
}

// =============================================
// GET TEACHER CLASSES
// =============================================

export async function getTeacherClasses() {
  const supabase = await createSupabaseServerClient();

  const { teacherId, error: teacherError } = await getAuthenticatedTeacherId();
  if (teacherError) {
    return { error: teacherError };
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
        subject_code,
        credit_hours
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
        is_active
      )
    `)
    .eq("teacher_id", teacherId)
    .eq("status", "active")
    .is("deleted_at", null);

  if (error) {
    return { error: error.message };
  }

  // Group by class
  const classMap = new Map();
  assignments?.forEach((assignment: any) => {
    const classData = Array.isArray(assignment.class) ? assignment.class[0] : assignment.class;
    const subjectData = Array.isArray(assignment.subject) ? assignment.subject[0] : assignment.subject;
    const academicYearData = Array.isArray(assignment.academic_year) ? assignment.academic_year[0] : assignment.academic_year;
    const termData = Array.isArray(assignment.term) ? assignment.term[0] : assignment.term;
    
    const classId = assignment.class_id;
    if (!classMap.has(classId)) {
      classMap.set(classId, {
        class: classData,
        subjects: [],
        academicYears: new Set(),
        terms: new Set(),
      });
    }
    const classInfo = classMap.get(classId);
    if (subjectData) {
      classInfo.subjects.push(subjectData);
    }
    if (academicYearData) {
      classInfo.academicYears.add(academicYearData);
    }
    if (termData) {
      classInfo.terms.add(termData);
    }
  });

  const classes = Array.from(classMap.values()).map((item: any) => ({
    ...item.class,
    subjects: item.subjects,
    academicYears: Array.from(item.academicYears),
    terms: Array.from(item.terms),
  }));

  return { classes };
}

// =============================================
// GET STUDENTS BY CLASS
// =============================================

export async function getStudentsByClass(classId: number) {
  const supabase = await createSupabaseServerClient();

  // Verify teacher has access
  const teacherId = await getCurrentStaffId(supabase);
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

  // Fixed: use current_class_id instead of current_class
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

  const formattedStudents = (students || []).map((student: any) => ({
    ...student,
    full_name: `${student.first_name} ${student.last_name}${student.other_names ? ` ${student.other_names}` : ''}`,
  }));

  return { students: formattedStudents };
}

// =============================================
// GET ACADEMIC YEARS AND TERMS
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

// =============================================
// GET STUDENT SCORES
// =============================================

export async function getStudentScores(
  classId: number,
  subjectId: number,
  assessmentType?: ScoreType,
  termId?: number,
  academicYearId?: number
) {
  const supabase = await createSupabaseServerClient();

  const auth = await checkTeacherAuthorization(classId, subjectId, academicYearId, termId);
  if (!auth.isAuthorized) {
    return { error: auth.error };
  }

  const teacherId = auth.teacherId;

  let query = supabase
    .from("za_demo_student_score")
    .select(`
      id,
      student_id,
      score,
      max_score,
      weight,
      assessment_type,
      title,
      description,
      recorded_at,
      term_id,
      academic_year_id,
      recorded_by,
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
    console.log("Base query built", { classId, subjectId, teacherId });
    console.log("Query conditions", query);

  if (assessmentType) {
    query = query.eq("assessment_type", assessmentType);
  }
  if (termId) {
    query = query.eq("term_id", termId);
  }
  if (academicYearId) {
    query = query.eq("academic_year_id", academicYearId);
  }

  const { data: scores, error } = await query.order("recorded_at", { ascending: false });
  console.log("Query executed", { error, scores });

  if (error) {
    return { error: error.message };
  }

  return { scores: scores || [] };
}

// =============================================
// GET ASSESSMENT TITLES
// =============================================

export async function getAssessmentTitles(
  classId: number,
  subjectId: number,
  assessmentType: ScoreType,
  termId?: number,
  academicYearId?: number
) {
  const supabase = await createSupabaseServerClient();

  const auth = await checkTeacherAuthorization(classId, subjectId, academicYearId, termId);
  if (!auth.isAuthorized) {
    return { error: auth.error };
  }

  const teacherId = auth.teacherId;

  let query = supabase
    .from("za_demo_student_score")
    .select("title, description, max_score, id, recorded_at")
    .eq("class_id", classId)
    .eq("subject_id", subjectId)
    .eq("teacher_id", teacherId)
    .eq("assessment_type", assessmentType)
    .not("title", "is", null)
    .is("deleted_at", null);

  if (termId) {
    query = query.eq("term_id", termId);
  }
  if (academicYearId) {
    query = query.eq("academic_year_id", academicYearId);
  }

  const { data: titles, error } = await query.order("recorded_at", { ascending: false });

  if (error) {
    return { error: error.message };
  }

  // Get unique titles (most recent first)
  const uniqueTitles: any[] = [];
  const titleMap = new Map();
  
  titles?.forEach((item) => {
    if (!titleMap.has(item.title)) {
      titleMap.set(item.title, true);
      uniqueTitles.push({
        title: item.title,
        description: item.description,
        max_score: item.max_score,
        id: item.id,
      });
    }
  });

  return { titles: uniqueTitles };
}

// =============================================
// VALIDATE SCORE
// =============================================

function validateScore(score: number, maxScore: number): { isValid: boolean; error?: string } {
  if (score < 0) {
    return { isValid: false, error: "Score cannot be negative" };
  }
  if (score > maxScore) {
    return { isValid: false, error: `Score (${score}) cannot exceed max score (${maxScore})` };
  }
  if (maxScore <= 0) {
    return { isValid: false, error: "Max score must be greater than 0" };
  }
  return { isValid: true };
}

// =============================================
// CREATE BULK SCORES
// =============================================

export async function createBulkScores(
  classId: number,
  subjectId: number,
  assessmentType: ScoreType,
  title: string,
  academicYearId: number,
  maxScore: number,
  scores: { studentId: number; score: number }[],
  termId?: number,
  description?: string,
  weight?: number
) {
  const supabase = await createSupabaseServerClient();

  // Validate required fields
  if (!title || !title.trim()) {
    return { error: "Title is required" };
  }
  if (!maxScore || maxScore <= 0) {
    return { error: "Max score must be greater than 0" };
  }
  if (!academicYearId) {
    return { error: "Academic year is required" };
  }
  if (!scores || scores.length === 0) {
    return { error: "At least one student score is required" };
  }

  const auth = await checkTeacherAuthorization(classId, subjectId, academicYearId, termId);
  if (!auth.isAuthorized) {
    return { error: auth.error };
  }

  const teacherId = auth.teacherId;
  const recordedBy = teacherId;

  // Validate all scores
  for (const score of scores) {
    const validation = validateScore(score.score, maxScore);
    if (!validation.isValid) {
      return { error: `Invalid score for student ID ${score.studentId}: ${validation.error}` };
    }
  }

  console.log("All scores validated successfully", scores);

  // Check for existing scores with same title to avoid duplicates
  let existingQuery = supabase
    .from("za_demo_student_score")
    .select("id")
    .eq("class_id", classId)
    .eq("subject_id", subjectId)
    .eq("teacher_id", teacherId)
    .eq("assessment_type", assessmentType)
    .eq("title", title)
    .eq("academic_year_id", academicYearId)
    .is("deleted_at", null);

    console.log("Existing score query built", { classId, subjectId, teacherId, assessmentType, title, academicYearId });

  if (termId) {
    existingQuery = existingQuery.eq("term_id", termId);
  }

  const { data: existing } = await existingQuery.limit(1);

  if (existing && existing.length > 0) {
    return { error: `A ${assessmentType} with title "${title}" already exists for this class and subject` };
  }

  // Prepare all score records
  const scoreRecords = scores.map((score) => ({
    class_id: classId,
    subject_id: subjectId,
    student_id: score.studentId,
    teacher_id: teacherId,
    score: score.score,
    max_score: maxScore,
    weight: weight || 100,
    assessment_type: assessmentType,
    title: title.trim(),
    description: description?.trim() || null,
    term_id: termId || null,
    academic_year_id: academicYearId,
    recorded_by: recordedBy,
  }));
  console.log("Prepared score records for insertion", scoreRecords);

  const { error, data } = await supabase
    .from("za_demo_student_score")
    .insert(scoreRecords)
    .select();
    console.log("Insert query executed", { error, data });

  if (error) {
    return { error: error.message };
  }

  //revalidatePath(`/teacher/class/${classId}/subject/${subjectId}/grade`);
  return { success: true, count: scoreRecords.length, scores: data };
}

// =============================================
// UPDATE BULK SCORES
// =============================================

export async function updateBulkScores(
  classId: number,
  subjectId: number,
  assessmentType: ScoreType,
  title: string,
  academicYearId: number,
  maxScore: number,
  scores: { studentId: number; score: number; scoreId?: number }[],
  termId?: number,
  description?: string,
  weight?: number
) {
  const supabase = await createSupabaseServerClient();

  const auth = await checkTeacherAuthorization(classId, subjectId, academicYearId, termId);
  if (!auth.isAuthorized) {
    return { error: auth.error };
  }

  const teacherId = auth.teacherId;
  const recordedBy = teacherId;

  // Validate all scores
  for (const score of scores) {
    const validation = validateScore(score.score, maxScore);
    if (!validation.isValid) {
      return { error: `Invalid score for student ID ${score.studentId}: ${validation.error}` };
    }
  }

  // Get existing scores for this assessment
  let existingQuery = supabase
    .from("za_demo_student_score")
    .select("id, student_id, score")
    .eq("class_id", classId)
    .eq("subject_id", subjectId)
    .eq("teacher_id", teacherId)
    .eq("assessment_type", assessmentType)
    .eq("title", title)
    .eq("academic_year_id", academicYearId)
    .is("deleted_at", null);

  if (termId) {
    existingQuery = existingQuery.eq("term_id", termId);
  }

  const { data: existingScores, error: fetchError } = await existingQuery;

  if (fetchError) {
    return { error: fetchError.message };
  }

  // Update each score
  let updatedCount = 0;
  let insertedCount = 0;

  for (const score of scores) {
    const existingScore = existingScores?.find(es => es.student_id === score.studentId);
    
    if (existingScore) {
      // Update existing
      const { error: updateError } = await supabase
        .from("za_demo_student_score")
        .update({
          score: score.score,
          max_score: maxScore,
          weight: weight || 100,
          description: description?.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingScore.id)
        .eq("teacher_id", teacherId);
      
      if (!updateError) updatedCount++;
    } else {
      // Create new if doesn't exist
      const { error: insertError } = await supabase
        .from("za_demo_student_score")
        .insert({
          class_id: classId,
          subject_id: subjectId,
          student_id: score.studentId,
          teacher_id: teacherId,
          score: score.score,
          max_score: maxScore,
          weight: weight || 100,
          assessment_type: assessmentType,
          title: title,
          description: description?.trim() || null,
          term_id: termId || null,
          academic_year_id: academicYearId,
          recorded_by: recordedBy,
        });
      
      if (!insertError) insertedCount++;
    }
  }

  //revalidatePath(`/teacher/class/${classId}/subject/${subjectId}/grade`);
  return { success: true, updatedCount, insertedCount, total: scores.length };
}

// =============================================
// DELETE ASSESSMENT (Soft Delete)
// =============================================

export async function deleteAssessment(
  classId: number,
  subjectId: number,
  assessmentType: ScoreType,
  title: string,
  academicYearId: number,
  termId?: number
) {
  const supabase = await createSupabaseServerClient();

  const auth = await checkTeacherAuthorization(classId, subjectId, academicYearId, termId);
  if (!auth.isAuthorized) {
    return { error: auth.error };
  }

  let query = supabase
    .from("za_demo_student_score")
    .update({ deleted_at: new Date().toISOString() })
    .eq("class_id", classId)
    .eq("subject_id", subjectId)
    .eq("teacher_id", auth.teacherId)
    .eq("assessment_type", assessmentType)
    .eq("title", title)
    .eq("academic_year_id", academicYearId)
    .is("deleted_at", null);

  if (termId) {
    query = query.eq("term_id", termId);
  }

  const { error } = await query;

  if (error) {
    return { error: error.message };
  }

  //revalidatePath(`/teacher/class/${classId}/subject/${subjectId}/grade`);
  return { success: true };
}

// =============================================
// GET GRADE WEIGHTS
// =============================================

export async function getGradeWeights(
  classId: number,
  subjectId: number,
  termId?: number,
  academicYearId?: number
) {
  const supabase = await createSupabaseServerClient();

  const auth = await checkTeacherAuthorization(classId, subjectId, academicYearId, termId);
  if (!auth.isAuthorized) {
    return { 
      assessmentWeight: DEFAULT_ASSESSMENT_WEIGHT, 
      examWeight: DEFAULT_EXAM_WEIGHT,
      passMark: 50
    };
  }

  let query = supabase
    .from("za_demo_grade_settings")
    .select("assessment_weight, exam_weight, pass_mark")
    .eq("class_id", classId)
    .eq("subject_id", subjectId)
    .eq("teacher_id", auth.teacherId);

  if (termId) {
    query = query.eq("term_id", termId);
  }
  if (academicYearId) {
    query = query.eq("academic_year_id", academicYearId);
  }

  const { data, error } = await query.maybeSingle();

  if (error || !data) {
    return {
      assessmentWeight: DEFAULT_ASSESSMENT_WEIGHT,
      examWeight: DEFAULT_EXAM_WEIGHT,
      passMark: 50,
    };
  }

  return {
    assessmentWeight: data.assessment_weight,
    examWeight: data.exam_weight,
    passMark: data.pass_mark,
  };
}

// =============================================
// UPDATE GRADE WEIGHTS
// =============================================

export async function updateGradeWeights(
  classId: number,
  subjectId: number,
  academicYearId: number,
  assessmentWeight: number,
  examWeight: number,
  passMark?: number,
  termId?: number,
) {
  const supabase = await createSupabaseServerClient();

  const auth = await checkTeacherAuthorization(classId, subjectId, academicYearId, termId);
  if (!auth.isAuthorized) {
    return { error: auth.error };
  }

  if (assessmentWeight + examWeight !== 100) {
    return { error: "Assessment and exam weights must add up to 100" };
  }

  // Check if settings already exist
  let query = supabase
    .from("za_demo_grade_settings")
    .select("id")
    .eq("class_id", classId)
    .eq("subject_id", subjectId)
    .eq("teacher_id", auth.teacherId);

  if (termId) {
    query = query.eq("term_id", termId);
  }
  if (academicYearId) {
    query = query.eq("academic_year_id", academicYearId);
  }

  const { data: existing } = await query.maybeSingle();

  let error;
  if (existing) {
    // Update existing
    const { error: updateError } = await supabase
      .from("za_demo_grade_settings")
      .update({
        assessment_weight: assessmentWeight,
        exam_weight: examWeight,
        pass_mark: passMark || 50,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
    error = updateError;
  } else {
    // Insert new
    const { error: insertError } = await supabase
      .from("za_demo_grade_settings")
      .insert({
        class_id: classId,
        subject_id: subjectId,
        teacher_id: auth.teacherId,
        assessment_weight: assessmentWeight,
        exam_weight: examWeight,
        pass_mark: passMark || 50,
        term_id: termId || null,
        academic_year_id: academicYearId,
      });
    error = insertError;
  }

  if (error) {
    console.error("Failed to save weight settings:", error);
    return { error: error.message };
  }

  //revalidatePath(`/teacher/class/${classId}/subject/${subjectId}/grade`);
  return { success: true };
}

// =============================================
// GET CALCULATED GRADES
// =============================================

export async function getCalculatedGrades(
  classId: number,
  subjectId: number,
  academicYearId: number,
  termId?: number,
) {
  const supabase = await createSupabaseServerClient();

  const auth = await checkTeacherAuthorization(classId, subjectId, academicYearId, termId);
  if (!auth.isAuthorized) {
    return { error: auth.error };
  }

  // Get weight settings
  const { assessmentWeight, examWeight, passMark } = await getGradeWeights(classId, subjectId, termId, academicYearId);

  // Get all students
  const { students, error: studentsError } = await getStudentsByClass(classId);
  if (studentsError) {
    return { error: studentsError };
  }

  if (!students || students.length === 0) {
    return { students: [], settings: { assessmentWeight, examWeight, passMark }, summary: {} };
  }

  // Get all scores
  const { scores, error: scoresError } = await getStudentScores(classId, subjectId, undefined, termId, academicYearId);
  if (scoresError) {
    return { error: scoresError };
  }

  // Group scores by student and type
  const studentScoresMap = new Map();

  students.forEach((student: any) => {
    studentScoresMap.set(student.id, {
      student,
      assessments: [],
      exams: [],
      assessmentTotal: 0,
      assessmentMaxTotal: 0,
      examTotal: 0,
      examMaxTotal: 0,
    });
  });

  scores?.forEach((score: any) => {
    const studentData = studentScoresMap.get(score.student_id);
    if (studentData) {
      if (score.assessment_type === "assessment") {
        studentData.assessments.push(score);
        studentData.assessmentTotal += score.score;
        studentData.assessmentMaxTotal += score.max_score;
      } else if (score.assessment_type === "exam") {
        studentData.exams.push(score);
        studentData.examTotal += score.score;
        studentData.examMaxTotal += score.max_score;
      }
    }
  });

  // Calculate final percentages and grades
  const results = Array.from(studentScoresMap.values()).map((data) => {
    const assessmentPercentage = data.assessmentMaxTotal > 0 
      ? (data.assessmentTotal / data.assessmentMaxTotal) * 100 
      : 0;
    const examPercentage = data.examMaxTotal > 0 
      ? (data.examTotal / data.examMaxTotal) * 100 
      : 0;
    
    const weightedAssessment = (assessmentPercentage * assessmentWeight) / 100;
    const weightedExam = (examPercentage * examWeight) / 100;
    const finalScore = weightedAssessment + weightedExam;

    // Ghana Grading System
    let letterGrade = "";
    let gradePoint = 0;
    let remarks = "";
    let isPassing = finalScore >= passMark;

    if (finalScore >= 80) {
      letterGrade = "A";
      gradePoint = 1;
      remarks = "Excellent";
    } else if (finalScore >= 70) {
      letterGrade = "B";
      gradePoint = 2;
      remarks = "Good";
    } else if (finalScore >= 60) {
      letterGrade = "C";
      gradePoint = 3;
      remarks = "Credit";
    } else if (finalScore >= 50) {
      letterGrade = "D";
      gradePoint = 4;
      remarks = "Pass";
    } else if (finalScore >= 40) {
      letterGrade = "E";
      gradePoint = 5;
      remarks = "Weak Pass";
    } else {
      letterGrade = "F";
      gradePoint = 6;
      remarks = "Fail";
    }

    const hasAnyScores = data.assessments.length > 0 || data.exams.length > 0;

    return {
      student: data.student,
      assessments: data.assessments,
      exams: data.exams,
      assessmentTotal: data.assessmentTotal,
      assessmentMaxTotal: data.assessmentMaxTotal,
      assessmentPercentage: assessmentPercentage.toFixed(2),
      examTotal: data.examTotal,
      examMaxTotal: data.examMaxTotal,
      examPercentage: examPercentage.toFixed(2),
      finalScore: hasAnyScores ? finalScore.toFixed(2) : null,
      letterGrade: hasAnyScores ? letterGrade : "-",
      gradePoint: hasAnyScores ? gradePoint : null,
      remarks: hasAnyScores ? remarks : "No grades entered",
      isPassing: hasAnyScores ? isPassing : false,
      hasScores: hasAnyScores,
    };
  });

  // Calculate class statistics
  const validScores = results.filter(r => r.hasScores && r.finalScore !== null);
  const classAverage = validScores.length > 0
    ? (validScores.reduce((sum, r) => sum + parseFloat(r.finalScore!), 0) / validScores.length).toFixed(2)
    : "0";
  
  const passCount = results.filter(r => r.letterGrade !== "F" && r.letterGrade !== "-").length;
  const failCount = results.filter(r => r.letterGrade === "F").length;
  const noGradeCount = results.filter(r => r.letterGrade === "-").length;

  // Grade distribution
  const gradeDistribution = {
    A: results.filter(r => r.letterGrade === "A").length,
    B: results.filter(r => r.letterGrade === "B").length,
    C: results.filter(r => r.letterGrade === "C").length,
    D: results.filter(r => r.letterGrade === "D").length,
    E: results.filter(r => r.letterGrade === "E").length,
    F: results.filter(r => r.letterGrade === "F").length,
    NoGrade: noGradeCount,
  };

  return {
    students: results,
    settings: {
      assessmentWeight,
      examWeight,
      passMark,
    },
    summary: {
      totalStudents: results.length,
      studentsWithScores: validScores.length,
      studentsWithoutScores: noGradeCount,
      classAverage,
      passCount,
      failCount,
      passRate: results.length > 0 ? ((passCount / results.length) * 100).toFixed(1) : "0",
      gradeDistribution,
    },
  };
}

// =============================================
// GET SINGLE STUDENT GRADE DETAILS
// =============================================

export async function getStudentGradeDetails(
  classId: number,
  subjectId: number,
  studentId: number,
  academicYearId: number,
  termId?: number
) {
  const supabase = await createSupabaseServerClient();

  const auth = await checkTeacherAuthorization(classId, subjectId, academicYearId, termId);
  if (!auth.isAuthorized) {
    return { error: auth.error };
  }

  // Get student details
  const { data: student, error: studentError } = await supabase
    .from("za_demo_student")
    .select("id, first_name, last_name, other_names, admission_number, student_number, gender, date_of_birth")
    .eq("id", studentId)
    .single();

  if (studentError) {
    return { error: "Student not found" };
  }

  // Get all scores for this student
  let query = supabase
    .from("za_demo_student_score")
    .select(`
      id,
      score,
      max_score,
      weight,
      assessment_type,
      title,
      description,
      recorded_at
    `)
    .eq("class_id", classId)
    .eq("subject_id", subjectId)
    .eq("student_id", studentId)
    .eq("teacher_id", auth.teacherId)
    .is("deleted_at", null);

  if (termId) {
    query = query.eq("term_id", termId);
  }
  if (academicYearId) {
    query = query.eq("academic_year_id", academicYearId);
  }

  const { data: scores, error: scoresError } = await query.order("recorded_at", { ascending: true });

  if (scoresError) {
    return { error: scoresError.message };
  }

  const assessments = scores?.filter((s) => s.assessment_type === "assessment") || [];
  const exams = scores?.filter((s) => s.assessment_type === "exam") || [];

  const assessmentTotal = assessments.reduce((sum, s) => sum + s.score, 0);
  const assessmentMaxTotal = assessments.reduce((sum, s) => sum + s.max_score, 0);
  const examTotal = exams.reduce((sum, s) => sum + s.score, 0);
  const examMaxTotal = exams.reduce((sum, s) => sum + s.max_score, 0);

  // Get weight settings
  const { assessmentWeight, examWeight, passMark } = await getGradeWeights(classId, subjectId, termId, academicYearId);

  const assessmentPercentage = assessmentMaxTotal > 0 ? (assessmentTotal / assessmentMaxTotal) * 100 : 0;
  const examPercentage = examMaxTotal > 0 ? (examTotal / examMaxTotal) * 100 : 0;
  
  const weightedAssessment = (assessmentPercentage * assessmentWeight) / 100;
  const weightedExam = (examPercentage * examWeight) / 100;
  const finalScore = weightedAssessment + weightedExam;

  // Get grade
  let letterGrade = "-";
  let remarks = "No grades entered";
  let isPassing = false;
  
  if (assessments.length > 0 || exams.length > 0) {
    isPassing = finalScore >= passMark;
    if (finalScore >= 80) {
      letterGrade = "A";
      remarks = "Excellent";
    } else if (finalScore >= 70) {
      letterGrade = "B";
      remarks = "Good";
    } else if (finalScore >= 60) {
      letterGrade = "C";
      remarks = "Credit";
    } else if (finalScore >= 50) {
      letterGrade = "D";
      remarks = "Pass";
    } else if (finalScore >= 40) {
      letterGrade = "E";
      remarks = "Weak Pass";
    } else {
      letterGrade = "F";
      remarks = "Fail";
    }
  }

  return {
    student: {
      ...student,
      full_name: `${student.first_name} ${student.last_name}${student.other_names ? ` ${student.other_names}` : ''}`,
    },
    assessments,
    exams,
    summary: {
      assessmentTotal,
      assessmentMaxTotal,
      assessmentPercentage: assessmentPercentage.toFixed(2),
      examTotal,
      examMaxTotal,
      examPercentage: examPercentage.toFixed(2),
      finalScore: (assessments.length > 0 || exams.length > 0) ? finalScore.toFixed(2) : null,
      letterGrade,
      remarks,
      isPassing,
      assessmentWeight,
      examWeight,
      passMark,
    },
  };
}

// =============================================
// DELETE A SINGLE SCORE (Soft Delete)
// =============================================

export async function deleteScore(scoreId: number, classId: number, subjectId: number) {
  const supabase = await createSupabaseServerClient();

  const auth = await checkTeacherAuthorization(classId, subjectId);
  if (!auth.isAuthorized) {
    return { error: auth.error };
  }

  const { error } = await supabase
    .from("za_demo_student_score")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", scoreId)
    .eq("teacher_id", auth.teacherId);

  if (error) {
    return { error: error.message };
  }

  //revalidatePath(`/teacher/class/${classId}/subject/${subjectId}/grade`);
  return { success: true };
}