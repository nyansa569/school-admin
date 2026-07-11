// lib/actions/admin/grading.ts
"use server";

import { createSupabaseServerClient } from "@/lib/server";
import { revalidatePath } from "next/cache";

// ============================================
// CONSTANTS
// ============================================
const DEFAULT_ASSESSMENT_WEIGHT = 70;
const DEFAULT_EXAM_WEIGHT = 30;

// ============================================
// HELPER FUNCTIONS
// ============================================

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

export async function getGradeFromScore(
  score: number
): Promise<{
  letter: string;
  gradePoint: number;
  remarks: string;
}> {
  if (score >= 80) {
    return { letter: "A", gradePoint: 1, remarks: "Excellent" };
  } else if (score >= 70) {
    return { letter: "B", gradePoint: 2, remarks: "Very Good" };
  } else if (score >= 60) {
    return { letter: "C", gradePoint: 3, remarks: "Good" };
  } else if (score >= 50) {
    return { letter: "D", gradePoint: 4, remarks: "Satisfactory" };
  } else if (score >= 40) {
    return { letter: "E", gradePoint: 5, remarks: "Pass" };
  } else {
    return { letter: "F", gradePoint: 6, remarks: "Fail" };
  }
}

// ============================================
// LOOKUP FUNCTIONS
// ============================================

export async function getClasses() {
  const supabase = await createSupabaseServerClient();

  const { data: classes, error } = await supabase
    .from("za_demo_class")
    .select("id, name, level, section, sequence, status")
    .eq("status", "active")
    .is("deleted_at", null)
    .order("sequence", { ascending: true });

  if (error) return { error: error.message };
  return { classes: classes || [] };
}

export async function getSubjects() {
  const supabase = await createSupabaseServerClient();

  const { data: subjects, error } = await supabase
    .from("za_demo_subject")
    .select("id, title, subject_code, credit_hours, is_elective")
    .eq("status", "active")
    .is("deleted_at", null)
    .order("title", { ascending: true });

  if (error) return { error: error.message };
  return { subjects: subjects || [] };
}

export async function getTeachers() {
  const supabase = await createSupabaseServerClient();

  const { data: teachers, error } = await supabase
    .from("za_demo_staff")
    .select("id, first_name, last_name, email, phone")
    .eq("role", "teacher")
    .eq("status", "active")
    .is("deleted_at", null);

  if (error) return { error: error.message };
  
  const formattedTeachers = (teachers || []).map((teacher: any) => ({
    ...teacher,
    full_name: `${teacher.first_name} ${teacher.last_name}`,
  }));
  
  return { teachers: formattedTeachers };
}

export async function getAcademicYears() {
  const supabase = await createSupabaseServerClient();

  const { data: years, error } = await supabase
    .from("za_demo_academic_year")
    .select("id, year, name, is_active, start_date, end_date, status")
    .eq("status", "active")
    .is("deleted_at", null)
    .order("year", { ascending: false });

  if (error) return { error: error.message };
  return { years: years || [] };
}

export async function getTerms(academicYearId?: number) {
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("za_demo_term")
    .select("id, term_number, name, start_date, end_date, is_active, academic_year_id")
    .eq("status", "active")
    .is("deleted_at", null);

  if (academicYearId) {
    query = query.eq("academic_year_id", academicYearId);
  }

  const { data: terms, error } = await query.order("term_number", { ascending: true });

  if (error) return { error: error.message };
  return { terms: terms || [] };
}

// ============================================
// CLASS SUBJECT ASSIGNMENTS
// ============================================

export async function getClassSubjects(classId: number, academicYearId?: number, termId?: number) {
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("za_demo_teacher_subject_class")
    .select(`
      id,
      class_id,
      subject_id,
      academic_year_id,
      term_id,
      is_class_teacher,
      status,
      subject:subject_id (
        id,
        title,
        subject_code,
        credit_hours
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
    .eq("status", "active")
    .is("deleted_at", null);

  if (academicYearId) {
    query = query.eq("academic_year_id", academicYearId);
  }
  if (termId) {
    query = query.eq("term_id", termId);
  }

  const { data: assignments, error } = await query;

  if (error) return { error: error.message };
  
  const transformed = (assignments || []).map(assignment => ({
    ...assignment,
    subject: Array.isArray(assignment.subject) ? assignment.subject[0] : assignment.subject,
    academic_year: Array.isArray(assignment.academic_year) ? assignment.academic_year[0] : assignment.academic_year,
    term: Array.isArray(assignment.term) ? assignment.term[0] : assignment.term,
  }));
  
  return { classSubjects: transformed };
}


export async function getClassSubjectList(classId: number, academicYearId?: number, termId?: number) {
  const supabase = await createSupabaseServerClient();

  let query = supabase
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
    .eq("class_id", classId)
    .eq("status", "active")
    .is("deleted_at", null);

  if (academicYearId) {
    query = query.eq("academic_year_id", academicYearId);
  }
  if (termId) {
    query = query.eq("term_id", termId);
  }

  const { data: assignments, error } = await query;

  if (error) return { error: error.message };
  
  // Extract unique subjects
  const subjectsMap = new Map();
  (assignments || []).forEach((assignment: any) => {
    const subject = Array.isArray(assignment.subject) ? assignment.subject[0] : assignment.subject;
    if (subject && !subjectsMap.has(assignment.subject_id)) {
      subjectsMap.set(assignment.subject_id, {
        id: assignment.subject_id,
        title: subject.title,
        subject_code: subject.subject_code,
        credit_hours: subject.credit_hours,
        is_mandatory: true, // Since it's assigned to the teacher, it's effectively mandatory for this class
      });
    }
  });
  
  const subjects = Array.from(subjectsMap.values());
  
  return { subjects };
}

// ============================================
// STUDENTS - FIXED: Added getStudentsByCurrentClass
// ============================================

export async function getStudentsByClass(classId: number) {
  const supabase = await createSupabaseServerClient();

  const { data: students, error } = await supabase
    .from("za_demo_student")
    .select(`
      id,
      first_name,
      last_name,
      other_names,
      admission_number,
      student_number,
      image,
      status,
      current_class_id
    `)
    .eq("current_class_id", classId)
    .eq("status", "active")
    .is("deleted_at", null)
    .order("last_name", { ascending: true });

  if (error) return { error: error.message };
  
  const formattedStudents = (students || []).map((student: any) => ({
    ...student,
    full_name: `${student.first_name} ${student.last_name}${student.other_names ? ` ${student.other_names}` : ''}`,
  }));
  
  return { students: formattedStudents };
}

// ============================================
// GRADE SETTINGS
// ============================================

export async function getGradeSettings(
  classId: number, 
  subjectId: number, 
  academicYearId?: number, 
  termId?: number
) {
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("za_demo_grade_settings")
    .select("assessment_weight, exam_weight, pass_mark")
    .eq("class_id", classId)
    .eq("subject_id", subjectId);

  if (academicYearId) {
    query = query.eq("academic_year_id", academicYearId);
  }
  if (termId) {
    query = query.eq("term_id", termId);
  }

  const { data, error } = await query.maybeSingle();

  if (error && error.code !== "PGRST116") {
    return { error: error.message };
  }

  return {
    assessmentWeight: data?.assessment_weight || DEFAULT_ASSESSMENT_WEIGHT,
    examWeight: data?.exam_weight || DEFAULT_EXAM_WEIGHT,
    passMark: data?.pass_mark || 50,
  };
}

export async function updateGradeSettings(
  classId: number,
  subjectId: number,
  assessmentWeight: number,
  examWeight: number,
  academicYearId?: number,
  termId?: number,
  passMark?: number
) {
  const supabase = await createSupabaseServerClient();

  if (assessmentWeight + examWeight !== 100) {
    return { error: "Assessment and exam weights must add up to 100" };
  }

  // Check if settings already exist
  let query = supabase
    .from("za_demo_grade_settings")
    .select("id")
    .eq("class_id", classId)
    .eq("subject_id", subjectId);

  if (academicYearId) {
    query = query.eq("academic_year_id", academicYearId);
  }
  if (termId) {
    query = query.eq("term_id", termId);
  }

  const { data: existing } = await query.maybeSingle();

  let error;
  if (existing) {
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
    const { error: insertError } = await supabase
      .from("za_demo_grade_settings")
      .insert({
        class_id: classId,
        subject_id: subjectId,
        assessment_weight: assessmentWeight,
        exam_weight: examWeight,
        pass_mark: passMark || 50,
        academic_year_id: academicYearId || null,
        term_id: termId || null,
      });
    error = insertError;
  }

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/admin/grading/${classId}/${subjectId}`);
  return { success: true };
}

// ============================================
// TEACHER FOR CLASS/SUBJECT
// ============================================

export async function getTeacherForClassSubject(classId: number, subjectId: number, academicYearId?: number, termId?: number) {
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("za_demo_teacher_subject_class")
    .select(`
      teacher_id,
      teacher:teacher_id (
        id,
        first_name,
        last_name,
        email
      )
    `)
    .eq("class_id", classId)
    .eq("subject_id", subjectId)
    .eq("status", "active")
    .is("deleted_at", null);

  if (academicYearId) {
    query = query.eq("academic_year_id", academicYearId);
  }
  if (termId) {
    query = query.eq("term_id", termId);
  }

  const { data, error } = await query.maybeSingle();

  if (error) return { error: error.message };
  
  const teacher = data?.teacher ? (Array.isArray(data.teacher) ? data.teacher[0] : data.teacher) : null;
  return { teacher };
}

// ============================================
// STUDENT SCORES
// ============================================

export async function getStudentScoresInSubject(
  studentId: number,
  classId: number,
  subjectId: number,
  academicYearId?: number,
  termId?: number
) {
  const supabase = await createSupabaseServerClient();

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
      recorded_at,
      recorded_by
    `)
    .eq("student_id", studentId)
    .eq("class_id", classId)
    .eq("subject_id", subjectId)
    .is("deleted_at", null);

  if (academicYearId) {
    query = query.eq("academic_year_id", academicYearId);
  }
  if (termId) {
    query = query.eq("term_id", termId);
  }

  const { data: scores, error } = await query.order("recorded_at", { ascending: true });

  if (error) return { error: error.message };
  return { scores: scores || [] };
}

// ============================================
// CORE GRADING CALCULATION
// ============================================

export async function calculateStudentSubjectGrade(
  studentId: number,
  classId: number,
  subjectId: number,
  academicYearId?: number,
  termId?: number
) {
  // Get grade settings
  const { assessmentWeight, examWeight, passMark, error: settingsError } = await getGradeSettings(
    classId, subjectId, academicYearId, termId
  );
  
  if (settingsError) return { error: settingsError };
  
  // Get student's scores
  const { scores, error: scoresError } = await getStudentScoresInSubject(
    studentId, classId, subjectId, academicYearId, termId
  );
  
  if (scoresError) return { error: scoresError };
  
  const assessments = scores?.filter(s => s.assessment_type === "assessment") || [];
  const exams = scores?.filter(s => s.assessment_type === "exam") || [];
  
  // Calculate totals
  let assessmentTotal = 0;
  let assessmentMaxTotal = 0;
  let examTotal = 0;
  let examMaxTotal = 0;
  
  assessments.forEach((a: any) => {
    assessmentTotal += a.score;
    assessmentMaxTotal += a.max_score;
  });
  
  exams.forEach((e: any) => {
    examTotal += e.score;
    examMaxTotal += e.max_score;
  });
  
  // Calculate percentages
  const assessmentPercentage = assessmentMaxTotal > 0 
    ? (assessmentTotal / assessmentMaxTotal) * 100 
    : 0;
  const examPercentage = examMaxTotal > 0 
    ? (examTotal / examMaxTotal) * 100 
    : 0;
  
  // Calculate weighted final score
  const weightedAssessment = (assessmentPercentage * assessmentWeight) / 100;
  const weightedExam = (examPercentage * examWeight) / 100;
  const finalScore = weightedAssessment + weightedExam;
  
  // Get grade info
  const { letter, gradePoint, remarks } = await getGradeFromScore(finalScore);
  
  const hasAnyScores = assessments.length > 0 || exams.length > 0;
  const isPassing = hasAnyScores ? finalScore >= passMark : false;
  
  return {
    hasScores: hasAnyScores,
    isPassing,
    assessmentTotal,
    assessmentMaxTotal,
    assessmentPercentage: assessmentPercentage.toFixed(2),
    assessmentCount: assessments.length,
    examTotal,
    examMaxTotal,
    examPercentage: examPercentage.toFixed(2),
    examCount: exams.length,
    finalScore: hasAnyScores ? finalScore.toFixed(2) : null,
    letterGrade: hasAnyScores ? letter : "-",
    gradePoint: hasAnyScores ? gradePoint : null,
    remarks: hasAnyScores ? remarks : "No grade entered",
    assessmentWeight,
    examWeight,
    passMark,
    assessmentsList: assessments,
    examsList: exams,
  };
}

// ============================================
// GRADING SUMMARY
// ============================================

export async function getGradingSummary(
  classId: number,
  subjectId: number,
  academicYearId?: number,
  termId?: number
) {
  const supabase = await createSupabaseServerClient();

  // Verify this subject is actually assigned to this class via class_subject
  let classSubjectQuery = supabase
    .from("za_demo_class_subject")
    .select("id, is_mandatory, weekly_hours")
    .eq("class_id", classId)
    .eq("subject_id", subjectId)
    .eq("status", "active")
    .is("deleted_at", null);
  
  if (academicYearId) {
    classSubjectQuery = classSubjectQuery.eq("academic_year_id", academicYearId);
  }
  if (termId) {
    classSubjectQuery = classSubjectQuery.eq("term_id", termId);
  }
  
  const { data: classSubject, error: classSubjectError } = await classSubjectQuery.maybeSingle();
  
  if (classSubjectError || !classSubject) {
    return { error: "This subject is not assigned to this class" };
  }

  // Get class details
  const { data: classData, error: classError } = await supabase
    .from("za_demo_class")
    .select("id, name, level, section, sequence")
    .eq("id", classId)
    .eq("status", "active")
    .is("deleted_at", null)
    .single();

  if (classError) return { error: classError.message };

  // Get subject details
  const { data: subjectData, error: subjectError } = await supabase
    .from("za_demo_subject")
    .select("id, title, subject_code, credit_hours")
    .eq("id", subjectId)
    .eq("status", "active")
    .is("deleted_at", null)
    .single();

  if (subjectError) return { error: subjectError.message };

  // Get teacher for this class/subject
  const { teacher } = await getTeacherForClassSubject(classId, subjectId, academicYearId, termId);

  // Get all students in class
  const { students, error: studentsError } = await getStudentsByClass(classId);
  if (studentsError) return { error: studentsError };

  if (!students || students.length === 0) {
    return {
      class: classData,
      subject: subjectData,
      teacher,
      isMandatory: classSubject.is_mandatory,
      settings: { assessmentWeight: DEFAULT_ASSESSMENT_WEIGHT, examWeight: DEFAULT_EXAM_WEIGHT, passMark: 50 },
      students: [],
      summary: {
        totalStudents: 0,
        studentsWithScores: 0,
        studentsWithoutScores: 0,
        classAverage: "0",
        passCount: 0,
        failCount: 0,
        passRate: "0",
        gradeDistribution: { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, NoGrade: 0 },
      },
    };
  }

  // Calculate results for each student
  const studentResults = await Promise.all(
    students.map(async (student: any) => {
      const grade = await calculateStudentSubjectGrade(
        student.id,
        classId,
        subjectId,
        academicYearId,
        termId
      );
      
      if (grade.error) {
        return {
          student: {
            id: student.id,
            name: student.full_name,
            first_name: student.first_name,
            last_name: student.last_name,
            admission_number: student.admission_number,
            student_number: student.student_number,
          },
          assessments: { total: 0, maxTotal: 0, percentage: "0", count: 0 },
          exams: { total: 0, maxTotal: 0, percentage: "0", count: 0 },
          finalScore: null,
          letterGrade: "-",
          gradePoint: null,
          remarks: "Error calculating grade",
          hasScores: false,
          isPassing: false,
        };
      }
      
      return {
        student: {
          id: student.id,
          name: student.full_name,
          first_name: student.first_name,
          last_name: student.last_name,
          admission_number: student.admission_number,
          student_number: student.student_number,
        },
        assessments: {
          total: grade.assessmentTotal,
          maxTotal: grade.assessmentMaxTotal,
          percentage: grade.assessmentPercentage,
          count: grade.assessmentCount,
        },
        exams: {
          total: grade.examTotal,
          maxTotal: grade.examMaxTotal,
          percentage: grade.examPercentage,
          count: grade.examCount,
        },
        finalScore: grade.finalScore,
        letterGrade: grade.letterGrade,
        gradePoint: grade.gradePoint,
        remarks: grade.remarks,
        hasScores: grade.hasScores,
        isPassing: grade.isPassing,
      };
    })
  );

  // Calculate class statistics
  const validScores = studentResults.filter(s => s.hasScores && s.finalScore !== null);
  const classAverage = validScores.length > 0
    ? (validScores.reduce((sum, s) => sum + parseFloat(s.finalScore!), 0) / validScores.length).toFixed(2)
    : "0";
  
  const passCount = studentResults.filter(s => s.letterGrade !== "F" && s.letterGrade !== "-" && s.isPassing).length;
  const failCount = studentResults.filter(s => s.letterGrade === "F").length;
  const noGradeCount = studentResults.filter(s => s.letterGrade === "-").length;
  const passRate = studentResults.length > 0 
    ? ((passCount / studentResults.length) * 100).toFixed(1)
    : "0";
  
  // Grade distribution
  const gradeDistribution = {
    A: studentResults.filter(s => s.letterGrade === "A").length,
    B: studentResults.filter(s => s.letterGrade === "B").length,
    C: studentResults.filter(s => s.letterGrade === "C").length,
    D: studentResults.filter(s => s.letterGrade === "D").length,
    E: studentResults.filter(s => s.letterGrade === "E").length,
    F: studentResults.filter(s => s.letterGrade === "F").length,
    NoGrade: studentResults.filter(s => s.letterGrade === "-").length,
  };

  // Get grade settings for display
  const { assessmentWeight, examWeight, passMark } = await getGradeSettings(classId, subjectId, academicYearId, termId);

  return {
    class: classData,
    subject: subjectData,
    teacher: teacher,
    isMandatory: classSubject.is_mandatory,
    weeklyHours: classSubject.weekly_hours,
    settings: {
      assessmentWeight,
      examWeight,
      passMark,
    },
    students: studentResults,
    summary: {
      totalStudents: students.length,
      studentsWithScores: validScores.length,
      studentsWithoutScores: noGradeCount,
      classAverage,
      passCount,
      failCount,
      passRate,
      gradeDistribution,
    },
  };
}

// ============================================
// CLASS GRADING SUMMARY
// ============================================

export async function getClassGradingSummary(
  classId: number,
  academicYearId?: number,
  termId?: number
) {
  const { subjects: classSubjects, error: subjectsError } = await getClassSubjectList(classId, academicYearId, termId);
  
  if (subjectsError) return { error: subjectsError };
  if (!classSubjects || classSubjects.length === 0) {
    return { error: "No subjects assigned to this class", subjectSummaries: [] };
  }

  const subjectSummaries = await Promise.all(
    classSubjects.map(async (subject) => {
      const result = await getGradingSummary(classId, subject.id, academicYearId, termId);
      if (result.error) {
        return {
          subject: subject,
          summary: null,
          error: result.error,
          teacher: null,
          isMandatory: subject.is_mandatory,
        };
      }
      return {
        subject: subject,
        summary: {
          classAverage: result.summary?.classAverage,
          passRate: result.summary?.passRate,
          totalStudents: result.summary?.totalStudents,
          studentsWithScores: result.summary?.studentsWithScores,
          studentsWithoutScores: result.summary?.studentsWithoutScores,
          gradeDistribution: result.summary?.gradeDistribution,
        },
        teacher: result.teacher,
        isMandatory: result.isMandatory,
        settings: result.settings,
      };
    })
  );

  return { subjectSummaries, totalSubjects: classSubjects.length };
}

// ============================================
// OVERALL GRADING STATS
// ============================================

export async function getOverallGradingStats(academicYearId?: number, termId?: number) {
  const supabase = await createSupabaseServerClient();

  const { data: classes, error: classesError } = await supabase
    .from("za_demo_class")
    .select("id, name")
    .eq("status", "active")
    .is("deleted_at", null);

  if (classesError) return { error: classesError.message };

  if (!classes || classes.length === 0) {
    return { error: "No classes found" };
  }

  let totalClassAverages = 0;
  let classCount = 0;
  let overallGradeDistribution = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, NoGrade: 0 };
  let totalStudentsCount = 0;

  for (const cls of classes) {
    const { subjects: classSubjects } = await getClassSubjectList(cls.id, academicYearId, termId);
    
    if (classSubjects && classSubjects.length > 0) {
      for (const subject of classSubjects) {
        const result = await getGradingSummary(cls.id, subject.id, academicYearId, termId);
        if (result.summary && !result.error) {
          totalClassAverages += parseFloat(result.summary.classAverage);
          classCount++;
          
          if (result.summary.gradeDistribution) {
            overallGradeDistribution.A += result.summary.gradeDistribution.A;
            overallGradeDistribution.B += result.summary.gradeDistribution.B;
            overallGradeDistribution.C += result.summary.gradeDistribution.C;
            overallGradeDistribution.D += result.summary.gradeDistribution.D;
            overallGradeDistribution.E += result.summary.gradeDistribution.E;
            overallGradeDistribution.F += result.summary.gradeDistribution.F;
            overallGradeDistribution.NoGrade += result.summary.gradeDistribution.NoGrade;
          }
          
          totalStudentsCount += result.summary.totalStudents;
        }
      }
    }
  }

  const overallAverage = classCount > 0 ? (totalClassAverages / classCount).toFixed(2) : "0";
  const totalGrades = Object.values(overallGradeDistribution).reduce((a, b) => a + b, 0);
  
  const gradePercentages = {
    A: totalGrades > 0 ? ((overallGradeDistribution.A / totalGrades) * 100).toFixed(1) : "0",
    B: totalGrades > 0 ? ((overallGradeDistribution.B / totalGrades) * 100).toFixed(1) : "0",
    C: totalGrades > 0 ? ((overallGradeDistribution.C / totalGrades) * 100).toFixed(1) : "0",
    D: totalGrades > 0 ? ((overallGradeDistribution.D / totalGrades) * 100).toFixed(1) : "0",
    E: totalGrades > 0 ? ((overallGradeDistribution.E / totalGrades) * 100).toFixed(1) : "0",
    F: totalGrades > 0 ? ((overallGradeDistribution.F / totalGrades) * 100).toFixed(1) : "0",
    NoGrade: totalGrades > 0 ? ((overallGradeDistribution.NoGrade / totalGrades) * 100).toFixed(1) : "0",
  };

  return {
    stats: {
      totalClasses: classes.length,
      overallAverage,
      totalEnrollments: totalStudentsCount,
      overallGradeDistribution,
      gradePercentages,
    },
  };
}

// ============================================
// STUDENT TERMINAL REPORT
// ============================================

export async function getStudentTerminalReportData(
  studentId: number,
  classId: number,
  academicYearId: number,
  termId?: number
) {
  const supabase = await createSupabaseServerClient();

  // Get student details
  const { data: student, error: studentError } = await supabase
    .from("za_demo_student")
    .select("id, first_name, last_name, other_names, admission_number, student_number")
    .eq("id", studentId)
    .single();

  if (studentError || !student) {
    return { error: "Student not found" };
  }

  // Get class details
  const { data: classData, error: classError } = await supabase
    .from("za_demo_class")
    .select("id, name, level, section")
    .eq("id", classId)
    .single();

  if (classError || !classData) {
    return { error: "Class not found" };
  }

  // Get academic year details
  const { data: academicYear, error: yearError } = await supabase
    .from("za_demo_academic_year")
    .select("id, year, name")
    .eq("id", academicYearId)
    .single();

  if (yearError || !academicYear) {
    return { error: "Academic year not found" };
  }

  // Get term details if provided
  let term = null;
  if (termId) {
    const { data: termData } = await supabase
      .from("za_demo_term")
      .select("id, term_number, name")
      .eq("id", termId)
      .single();
    term = termData;
  }

  // Get all subjects for this class from class_subject
  const { subjects: classSubjects, error: subjectsError } = await getClassSubjectList(classId, academicYearId, termId);
  
  if (subjectsError || !classSubjects || classSubjects.length === 0) {
    return { error: "No subjects assigned to this class" };
  }

  // Calculate grades for each subject
  const subjectResults = [];
  let totalFinalScore = 0;
  let validSubjectsCount = 0;

  for (const subject of classSubjects) {
    const grade = await calculateStudentSubjectGrade(
      studentId,
      classId,
      subject.id,
      academicYearId,
      termId
    );

    if (grade.error) {
      subjectResults.push({
        subjectId: subject.id,
        subject: subject.title || "Unknown",
        subjectCode: subject.subject_code,
        isMandatory: subject.is_mandatory,
        weeklyHours: subject.weekly_hours,
        classScore: "0",
        examScore: "0",
        totalScore: null,
        letterGrade: "-",
        remarks: "Error",
        hasScores: false,
        assessmentWeight: DEFAULT_ASSESSMENT_WEIGHT,
        examWeight: DEFAULT_EXAM_WEIGHT,
        assessmentCount: 0,
        examCount: 0,
      });
      continue;
    }

    subjectResults.push({
      subjectId: subject.id,
      subject: subject.title,
      subjectCode: subject.subject_code,
      isMandatory: subject.is_mandatory,
      weeklyHours: subject.weekly_hours,
      classScore: grade.assessmentPercentage,
      examScore: grade.examPercentage,
      totalScore: grade.finalScore,
      letterGrade: grade.letterGrade,
      remarks: grade.remarks,
      hasScores: grade.hasScores,
      assessmentWeight: grade.assessmentWeight,
      examWeight: grade.examWeight,
      assessmentCount: grade.assessmentCount,
      examCount: grade.examCount,
    });

    if (grade.hasScores && grade.finalScore !== null) {
      totalFinalScore += parseFloat(grade.finalScore);
      validSubjectsCount++;
    }
  }

  // Calculate overall average
  const overallAverage = validSubjectsCount > 0 
    ? (totalFinalScore / validSubjectsCount).toFixed(2) 
    : null;
  
  let overallLetter = "-";
  let overallRemarks = "No grades available";
  
  if (overallAverage !== null) {
    const gradeInfo = await getGradeFromScore(parseFloat(overallAverage));
    overallLetter = gradeInfo.letter;
    overallRemarks = gradeInfo.remarks;
  }

  // Get teacher assessments
  const teacherAssessments = await Promise.all(
    classSubjects.map(async (subject) => {
      const { data: assessments } = await supabase
        .from("za_demo_student_assessment")
        .select("assessment_type, numeric_score, letter_grade, remarks, recommendations")
        .eq("student_id", studentId)
        .eq("class_id", classId)
        .eq("subject_id", subject.id)
        .eq("academic_year_id", academicYearId)
        .is("deleted_at", null);

      const result: any = {
        subject: subject.title,
        performance: null,
        attitude: null,
        behavior: null,
        participation: null,
      };

      assessments?.forEach((item: any) => {
        result[item.assessment_type] = {
          score: item.numeric_score,
          grade: item.letter_grade,
          remarks: item.remarks,
          recommendations: item.recommendations,
        };
      });

      return result;
    })
  );

  return {
    student: {
      id: student.id,
      name: `${student.first_name} ${student.last_name}${student.other_names ? ` ${student.other_names}` : ''}`,
      firstName: student.first_name,
      lastName: student.last_name,
      admissionNumber: student.admission_number,
      studentNumber: student.student_number,
    },
    class: classData,
    academicYear: academicYear,
    term: term,
    subjects: subjectResults,
    teacherAssessments,
    overallAverage,
    overallLetter,
    overallRemarks,
    summary: {
      totalSubjects: classSubjects.length,
      subjectsWithGrades: validSubjectsCount,
      subjectsWithoutGrades: classSubjects.length - validSubjectsCount,
    },
  };
}

// ============================================
// SCORE MANAGEMENT (CRUD)
// ============================================

export async function saveStudentScore(data: {
  student_id: number;
  class_id: number;
  subject_id: number;
  teacher_id: number;
  score: number;
  max_score: number;
  assessment_type: string;
  title?: string;
  description?: string;
  academic_year_id?: number;
  term_id?: number;
  weight?: number;
  recorded_by?: number;
}): Promise<{ error?: string; success?: boolean; scoreId?: number }> {
  const supabase = await createSupabaseServerClient();

  try {
    // Verify this subject is assigned to this class
    const { subjects: classSubjects } = await getClassSubjectList(data.class_id, data.academic_year_id, data.term_id);
    const isSubjectAssigned = classSubjects?.some(s => s.id === data.subject_id);
    
    if (!isSubjectAssigned) {
      return { error: "This subject is not assigned to this class" };
    }

    const recordedBy = data.recorded_by || await getCurrentStaffId(supabase);

    const { data: score, error } = await supabase
      .from("za_demo_student_score")
      .insert({
        student_id: data.student_id,
        class_id: data.class_id,
        subject_id: data.subject_id,
        teacher_id: data.teacher_id,
        score: data.score,
        max_score: data.max_score,
        assessment_type: data.assessment_type,
        title: data.title,
        description: data.description,
        academic_year_id: data.academic_year_id,
        term_id: data.term_id,
        weight: data.weight || 100,
        recorded_by: recordedBy,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    revalidatePath(`/admin/grading/${data.class_id}/${data.subject_id}`);
    return { success: true, scoreId: score.id };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function updateStudentScore(
  scoreId: number,
  data: {
    score: number;
    max_score: number;
    title?: string;
    description?: string;
    weight?: number;
  }
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createSupabaseServerClient();

  try {
    const { error } = await supabase
      .from("za_demo_student_score")
      .update({
        score: data.score,
        max_score: data.max_score,
        title: data.title,
        description: data.description,
        weight: data.weight,
        updated_at: new Date().toISOString(),
      })
      .eq("id", scoreId);

    if (error) throw new Error(error.message);

    revalidatePath("/admin/grading");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function deleteStudentScore(scoreId: number): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createSupabaseServerClient();

  try {
    // Soft delete
    const { error } = await supabase
      .from("za_demo_student_score")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", scoreId);

    if (error) throw new Error(error.message);

    revalidatePath("/admin/grading");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function getScoresByClassAndSubject(
  classId: number,
  subjectId: number,
  academicYearId?: number,
  termId?: number
) {
  const supabase = await createSupabaseServerClient();

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
      student:student_id (
        id,
        first_name,
        last_name,
        other_names,
        admission_number,
        student_number
      )
    `)
    .eq("class_id", classId)
    .eq("subject_id", subjectId)
    .is("deleted_at", null);

  if (academicYearId) {
    query = query.eq("academic_year_id", academicYearId);
  }
  if (termId) {
    query = query.eq("term_id", termId);
  }

  const { data: scores, error } = await query.order("recorded_at", { ascending: false });

  if (error) return { error: error.message };
  
  const formattedScores = (scores || []).map((score: any) => ({
    ...score,
    student_name: score.student 
      ? `${score.student.first_name} ${score.student.last_name}${score.student.other_names ? ` ${score.student.other_names}` : ''}`
      : "Unknown",
    percentage: score.max_score > 0 ? Math.round((score.score / score.max_score) * 100) : 0,
  }));
  
  return { scores: formattedScores };
}