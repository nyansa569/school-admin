// lib/actions/admin/assessment.ts
"use server";

import { createSupabaseServerClient } from "@/lib/server";
import { revalidatePath } from "next/cache";

// =============================================
// TYPE DEFINITIONS
// =============================================

type AssessmentType = "performance" | "attitude" | "behavior" | "participation";

// =============================================
// LOOKUP FUNCTIONS
// =============================================

export async function getClasses() {
  const supabase = await createSupabaseServerClient();

  const { data: classes, error } = await supabase
    .from("za_demo_class")
    .select("id, name, level, section, sequence")
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
    .order("year", { ascending: false });

  if (error) return { error: error.message };
  return { years: years || [] };
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

  if (error) return { error: error.message };
  return { terms: terms || [] };
}

export async function getStudentsByClass(classId: number) {
  const supabase = await createSupabaseServerClient();

  // Fixed: use current_class_id instead of current_class
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
      status
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

// =============================================
// GET STUDENT ASSESSMENTS
// =============================================

export async function getStudentAssessments(
  classId?: number,
  subjectId?: number,
  teacherId?: number,
  academicYearId?: number,
  termId?: number,
  assessmentType?: AssessmentType
) {
  const supabase = await createSupabaseServerClient();

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
      teacher:teacher_id (
        id,
        first_name,
        last_name,
        email
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
      ),
      created_by_staff:created_by (
        id,
        first_name,
        last_name
      )
    `)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (classId) query = query.eq("class_id", classId);
  if (subjectId) query = query.eq("subject_id", subjectId);
  if (teacherId) query = query.eq("teacher_id", teacherId);
  if (academicYearId) query = query.eq("academic_year_id", academicYearId);
  if (termId) query = query.eq("term_id", termId);
  if (assessmentType) query = query.eq("assessment_type", assessmentType);

  const { data: assessments, error } = await query;

  if (error) return { error: error.message };
  return { assessments: assessments || [] };
}

// =============================================
// ASSESSMENT SUMMARY BY CLASS
// =============================================

export async function getAssessmentSummaryByClass(
  classId: number,
  academicYearId?: number,
  termId?: number
) {
  const supabase = await createSupabaseServerClient();

  // Get class details
  const { data: classData, error: classError } = await supabase
    .from("za_demo_class")
    .select("id, name, level, section, sequence")
    .eq("id", classId)
    .eq("status", "active")
    .is("deleted_at", null)
    .single();

  if (classError) return { error: classError.message };

  // Get students in class
  const { students, error: studentsError } = await getStudentsByClass(classId);
  if (studentsError) return { error: studentsError };

  if (!students || students.length === 0) {
    return {
      class: classData,
      students: [],
      summary: {
        totalStudents: 0,
        studentsWithAssessments: 0,
        studentsWithoutAssessments: 0,
        totalAssessments: 0,
        classAverage: "N/A",
        typeCounts: { performance: 0, attitude: 0, behavior: 0, participation: 0 },
      },
    };
  }

  // Get assessments for this class
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
      subject:subject_id (
        id,
        title,
        subject_code
      ),
      teacher:teacher_id (
        id,
        first_name,
        last_name
      )
    `)
    .eq("class_id", classId)
    .is("deleted_at", null);

  if (academicYearId) query = query.eq("academic_year_id", academicYearId);
  if (termId) query = query.eq("term_id", termId);

  const { data: assessments, error: assessmentsError } = await query;

  if (assessmentsError) return { error: assessmentsError.message };

  // Build student assessment map
  const studentAssessmentsMap = new Map();
  
  students.forEach((student: any) => {
    studentAssessmentsMap.set(student.id, {
      student: {
        id: student.id,
        name: student.full_name,
        first_name: student.first_name,
        last_name: student.last_name,
        admission_number: student.admission_number,
        student_number: student.student_number,
      },
      assessments: {
        performance: null,
        attitude: null,
        behavior: null,
        participation: null,
      },
      numericScores: [],
      totalAssessments: 0,
    });
  });

  // Populate assessments
  assessments?.forEach((assessment: any) => {
    const studentData = studentAssessmentsMap.get(assessment.student_id);
    if (studentData) {
      const type = assessment.assessment_type as AssessmentType;
      studentData.assessments[type] = {
        score: assessment.numeric_score,
        grade: assessment.letter_grade,
        remarks: assessment.remarks,
        recommendations: assessment.recommendations,
        subject: assessment.subject,
        teacher: assessment.teacher,
      };
      if (assessment.numeric_score !== null) {
        studentData.numericScores.push(assessment.numeric_score);
      }
      studentData.totalAssessments++;
    }
  });

  // Calculate averages
  const studentResults = Array.from(studentAssessmentsMap.values()).map((data) => {
    const averageScore = data.numericScores.length > 0
      ? (data.numericScores.reduce((a: number, b: number) => a + b, 0) / data.numericScores.length).toFixed(1)
      : null;
    
    return {
      ...data,
      averageScore,
    };
  });

  const validAverages = studentResults
    .filter(s => s.averageScore !== null)
    .map(s => parseFloat(s.averageScore!));
  
  const classAverage = validAverages.length > 0
    ? (validAverages.reduce((a, b) => a + b, 0) / validAverages.length).toFixed(1)
    : "N/A";
  
  const studentsWithAssessments = studentResults.filter(s => s.totalAssessments > 0).length;
  const studentsWithoutAssessments = students.length - studentsWithAssessments;

  const typeCounts = {
    performance: assessments?.filter((a: any) => a.assessment_type === "performance").length || 0,
    attitude: assessments?.filter((a: any) => a.assessment_type === "attitude").length || 0,
    behavior: assessments?.filter((a: any) => a.assessment_type === "behavior").length || 0,
    participation: assessments?.filter((a: any) => a.assessment_type === "participation").length || 0,
  };

  return {
    class: classData,
    students: studentResults,
    summary: {
      totalStudents: students.length,
      studentsWithAssessments,
      studentsWithoutAssessments,
      totalAssessments: assessments?.length || 0,
      classAverage,
      typeCounts,
    },
  };
}

// =============================================
// ASSESSMENT SUMMARY BY SUBJECT
// =============================================

export async function getAssessmentSummaryBySubject(
  subjectId: number,
  academicYearId?: number,
  termId?: number
) {
  const supabase = await createSupabaseServerClient();

  const { data: subjectData, error: subjectError } = await supabase
    .from("za_demo_subject")
    .select("id, title, subject_code, credit_hours")
    .eq("id", subjectId)
    .eq("status", "active")
    .is("deleted_at", null)
    .single();

  if (subjectError) return { error: subjectError.message };

  let query = supabase
    .from("za_demo_student_assessment")
    .select(`
      id,
      student_id,
      class_id,
      assessment_type,
      numeric_score,
      letter_grade,
      student:student_id (
        id,
        first_name,
        last_name,
        other_names,
        admission_number
      ),
      class:class_id (
        id,
        name,
        level,
        section
      ),
      teacher:teacher_id (
        id,
        first_name,
        last_name
      )
    `)
    .eq("subject_id", subjectId)
    .is("deleted_at", null);

  if (academicYearId) query = query.eq("academic_year_id", academicYearId);
  if (termId) query = query.eq("term_id", termId);

  const { data: assessments, error: assessmentsError } = await query;

  if (assessmentsError) return { error: assessmentsError.message };

  // Group by class
  const classMap = new Map();
  assessments?.forEach((assessment: any) => {
    const classId = assessment.class_id;
    if (!classMap.has(classId)) {
      classMap.set(classId, {
        class: assessment.class,
        assessments: [],
        students: new Set(),
        numericScores: [],
      });
    }
    const classData = classMap.get(classId);
    classData.assessments.push(assessment);
    classData.students.add(assessment.student_id);
    if (assessment.numeric_score !== null) {
      classData.numericScores.push(assessment.numeric_score);
    }
  });

  const classSummaries = Array.from(classMap.values()).map((item: any) => {
    const averageScore = item.numericScores.length > 0
      ? (item.numericScores.reduce((a: number, b: number) => a + b, 0) / item.numericScores.length).toFixed(1)
      : "N/A";
    
    const typeCounts = {
      performance: item.assessments.filter((a: any) => a.assessment_type === "performance").length,
      attitude: item.assessments.filter((a: any) => a.assessment_type === "attitude").length,
      behavior: item.assessments.filter((a: any) => a.assessment_type === "behavior").length,
      participation: item.assessments.filter((a: any) => a.assessment_type === "participation").length,
    };

    return {
      class: item.class,
      totalStudents: item.students.size,
      totalAssessments: item.assessments.length,
      averageScore,
      typeCounts,
    };
  });

  const allNumericScores = assessments
    ?.filter((a: any) => a.numeric_score !== null)
    .map((a: any) => a.numeric_score) || [];
  
  const overallAverage = allNumericScores.length > 0
    ? (allNumericScores.reduce((a, b) => a + b, 0) / allNumericScores.length).toFixed(1)
    : "N/A";

  const overallTypeCounts = {
    performance: assessments?.filter((a: any) => a.assessment_type === "performance").length || 0,
    attitude: assessments?.filter((a: any) => a.assessment_type === "attitude").length || 0,
    behavior: assessments?.filter((a: any) => a.assessment_type === "behavior").length || 0,
    participation: assessments?.filter((a: any) => a.assessment_type === "participation").length || 0,
  };

  return {
    subject: subjectData,
    classes: classSummaries,
    summary: {
      totalClasses: classMap.size,
      totalAssessments: assessments?.length || 0,
      overallAverage,
      typeCounts: overallTypeCounts,
    },
  };
}

// =============================================
// ASSESSMENT SUMMARY BY TEACHER
// =============================================

export async function getAssessmentSummaryByTeacher(
  teacherId: number,
  academicYearId?: number,
  termId?: number
) {
  const supabase = await createSupabaseServerClient();

  const { data: teacherData, error: teacherError } = await supabase
    .from("za_demo_staff")
    .select("id, first_name, last_name, email, phone")
    .eq("id", teacherId)
    .eq("status", "active")
    .is("deleted_at", null)
    .single();

  if (teacherError) return { error: teacherError.message };

  let query = supabase
    .from("za_demo_student_assessment")
    .select(`
      id,
      student_id,
      class_id,
      subject_id,
      assessment_type,
      numeric_score,
      letter_grade,
      student:student_id (
        id,
        first_name,
        last_name,
        other_names,
        admission_number
      ),
      class:class_id (
        id,
        name,
        level
      ),
      subject:subject_id (
        id,
        title,
        subject_code
      )
    `)
    .eq("teacher_id", teacherId)
    .is("deleted_at", null);

  if (academicYearId) query = query.eq("academic_year_id", academicYearId);
  if (termId) query = query.eq("term_id", termId);

  const { data: assessments, error: assessmentsError } = await query;

  if (assessmentsError) return { error: assessmentsError.message };

  // Group by class and subject
  const classSubjectMap = new Map();
  assessments?.forEach((assessment: any) => {
    const key = `${assessment.class_id}_${assessment.subject_id}`;
    if (!classSubjectMap.has(key)) {
      classSubjectMap.set(key, {
        class: assessment.class,
        subject: assessment.subject,
        assessments: [],
        students: new Set(),
        numericScores: [],
      });
    }
    const item = classSubjectMap.get(key);
    item.assessments.push(assessment);
    item.students.add(assessment.student_id);
    if (assessment.numeric_score !== null) {
      item.numericScores.push(assessment.numeric_score);
    }
  });

  const details = Array.from(classSubjectMap.values()).map((item: any) => {
    const averageScore = item.numericScores.length > 0
      ? (item.numericScores.reduce((a: number, b: number) => a + b, 0) / item.numericScores.length).toFixed(1)
      : "N/A";

    const typeCounts = {
      performance: item.assessments.filter((a: any) => a.assessment_type === "performance").length,
      attitude: item.assessments.filter((a: any) => a.assessment_type === "attitude").length,
      behavior: item.assessments.filter((a: any) => a.assessment_type === "behavior").length,
      participation: item.assessments.filter((a: any) => a.assessment_type === "participation").length,
    };

    return {
      class: item.class,
      subject: item.subject,
      totalStudents: item.students.size,
      totalAssessments: item.assessments.length,
      averageScore,
      typeCounts,
    };
  });

  const allNumericScores = assessments
    ?.filter((a: any) => a.numeric_score !== null)
    .map((a: any) => a.numeric_score) || [];
  
  const overallAverage = allNumericScores.length > 0
    ? (allNumericScores.reduce((a, b) => a + b, 0) / allNumericScores.length).toFixed(1)
    : "N/A";

  const overallTypeCounts = {
    performance: assessments?.filter((a: any) => a.assessment_type === "performance").length || 0,
    attitude: assessments?.filter((a: any) => a.assessment_type === "attitude").length || 0,
    behavior: assessments?.filter((a: any) => a.assessment_type === "behavior").length || 0,
    participation: assessments?.filter((a: any) => a.assessment_type === "participation").length || 0,
  };

  return {
    teacher: teacherData,
    details,
    summary: {
      totalAssessments: assessments?.length || 0,
      totalStudents: new Set(assessments?.map((a: any) => a.student_id)).size,
      overallAverage,
      typeCounts: overallTypeCounts,
    },
  };
}

// =============================================
// OVERALL ASSESSMENT STATISTICS
// =============================================

export async function getOverallAssessmentStats(academicYearId?: number, termId?: number) {
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("za_demo_student_assessment")
    .select(`
      id,
      assessment_type,
      numeric_score,
      student_id,
      class_id,
      subject_id,
      teacher_id
    `)
    .is("deleted_at", null);

  if (academicYearId) query = query.eq("academic_year_id", academicYearId);
  if (termId) query = query.eq("term_id", termId);

  const { data: assessments, error } = await query;

  if (error) return { error: error.message };

  const uniqueClasses = new Set(assessments?.map((a: any) => a.class_id));
  const uniqueSubjects = new Set(assessments?.map((a: any) => a.subject_id));
  const uniqueTeachers = new Set(assessments?.map((a: any) => a.teacher_id));
  const uniqueStudents = new Set(assessments?.map((a: any) => a.student_id));

  const typeScores = {
    performance: { total: 0, count: 0 },
    attitude: { total: 0, count: 0 },
    behavior: { total: 0, count: 0 },
    participation: { total: 0, count: 0 },
  };

  assessments?.forEach((assessment: any) => {
    if (assessment.numeric_score !== null && typeScores[assessment.assessment_type as keyof typeof typeScores]) {
      typeScores[assessment.assessment_type as keyof typeof typeScores].total += assessment.numeric_score;
      typeScores[assessment.assessment_type as keyof typeof typeScores].count++;
    }
  });

  const typeAverages = {
    performance: typeScores.performance.count > 0 ? (typeScores.performance.total / typeScores.performance.count).toFixed(1) : "N/A",
    attitude: typeScores.attitude.count > 0 ? (typeScores.attitude.total / typeScores.attitude.count).toFixed(1) : "N/A",
    behavior: typeScores.behavior.count > 0 ? (typeScores.behavior.total / typeScores.behavior.count).toFixed(1) : "N/A",
    participation: typeScores.participation.count > 0 ? (typeScores.participation.total / typeScores.participation.count).toFixed(1) : "N/A",
  };

  const allScores = assessments
    ?.filter((a: any) => a.numeric_score !== null)
    .map((a: any) => a.numeric_score) || [];
  
  const overallAverage = allScores.length > 0
    ? (allScores.reduce((a, b) => a + b, 0) / allScores.length).toFixed(1)
    : "N/A";

  const typeCounts = {
    performance: assessments?.filter((a: any) => a.assessment_type === "performance").length || 0,
    attitude: assessments?.filter((a: any) => a.assessment_type === "attitude").length || 0,
    behavior: assessments?.filter((a: any) => a.assessment_type === "behavior").length || 0,
    participation: assessments?.filter((a: any) => a.assessment_type === "participation").length || 0,
  };

  return {
    stats: {
      totalAssessments: assessments?.length || 0,
      totalClasses: uniqueClasses.size,
      totalSubjects: uniqueSubjects.size,
      totalTeachers: uniqueTeachers.size,
      totalStudents: uniqueStudents.size,
      overallAverage,
      typeAverages,
      typeCounts,
    },
  };
}

// =============================================
// ASSESSMENT TYPES (UI Helper)
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