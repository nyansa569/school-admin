// lib/actions/teacher/dashboard.ts
"use server";

import { createSupabaseServerClient } from "@/lib/server";

// =============================================
// TYPE DEFINITIONS
// =============================================

type ClassType = {
  id: number;
  name: string;
  level: string;
  section?: string;
  sequence: number;
  max_students?: number;
};

type SubjectType = {
  id: number;
  title: string;
  subject_code: string;
  credit_hours?: number;
};

type RecentActivity = {
  type: string;
  title: string;
  date: string;
  icon: string;
};

// =============================================
// HELPER FUNCTIONS
// =============================================

async function getCurrentTeacherId(supabase: any): Promise<number | null> {
  const { data: authUser, error: authError } = await supabase.auth.getUser();
  if (authError || !authUser?.user) return null;

  const { data: staff, error: staffError } = await supabase
    .from("za_demo_staff")  // Changed from "user" to "za_demo_staff"
    .select("id")
    .eq("user_id", authUser.user.id)
    .is("deleted_at", null)
    .maybeSingle();

  if (staffError || !staff) return null;

  return staff.id;
}

async function checkTeacherClassAccess(supabase: any, teacherId: number, classId: number): Promise<boolean> {
  const { data: assignment } = await supabase
    .from("za_demo_teacher_subject_class")
    .select("id")
    .eq("teacher_id", teacherId)
    .eq("class_id", classId)
    .eq("status", "active")
    .is("deleted_at", null)
    .maybeSingle();

  return !!assignment;
}

// =============================================
// GET TEACHER DASHBOARD STATS
// =============================================

export async function getTeacherDashboardStats() {
  const supabase = await createSupabaseServerClient();

  const { data: authUser, error: authError } = await supabase.auth.getUser();
  if (authError || !authUser.user) {
    return { error: "Unauthorized" };
  }

  // Get teacher profile
  const { data: staff, error: staffError } = await supabase
    .from("za_demo_staff")
    .select(`
      id,
      first_name,
      last_name,
      email,
      phone,
      qualification,
      specialization,
      department_id,
      employment_status,
      hire_date,
      user:user_id (
      profile_picture
    )
    `)
    .eq("user_id", authUser.user.id)
    .is("deleted_at", null)
     .maybeSingle();

  if (staffError || !staff) {
  console.error("Staff not found for user_id:", authUser.user.id, staffError);
  return { error: "Teacher not found" };
}

  // Get department name
  let departmentName = null;
  if (staff.department_id) {
    const { data: department } = await supabase
      .from("za_demo_department")
      .select("name, dep_code")
      .eq("id", staff.department_id)
      .eq("status", "active")
      .is("deleted_at", null)
      .single();
    if (department) {
      departmentName = department.name;
    }
  }

  // Get teacher's assignments (classes and subjects)
  const { data: assignments, error: assignmentsError } = await supabase
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
        sequence,
        max_students
      ),
      subject:subject_id (
        id,
        title,
        subject_code,
        credit_hours
      )
    `)
    .eq("teacher_id", staff.id)
    .eq("status", "active")
    .is("deleted_at", null);

  if (assignmentsError) {
    return { error: assignmentsError.message };
  }

  // Extract unique classes and subjects
  const uniqueClasses = new Map<number, ClassType>();
  const uniqueSubjects = new Map<number, SubjectType>();

  assignments?.forEach((assignment: any) => {
    const classData = Array.isArray(assignment.class) ? assignment.class[0] : assignment.class;
    const subjectData = Array.isArray(assignment.subject) ? assignment.subject[0] : assignment.subject;
    
    if (classData && !uniqueClasses.has(assignment.class_id)) {
      uniqueClasses.set(assignment.class_id, classData);
    }
    if (subjectData && !uniqueSubjects.has(assignment.subject_id)) {
      uniqueSubjects.set(assignment.subject_id, subjectData);
    }
  });

  const classes = Array.from(uniqueClasses.values());
  const subjects = Array.from(uniqueSubjects.values());

  // Calculate total students across all classes
  let totalStudents = 0;
  const classIds = classes.map((c) => c.id);

  if (classIds.length > 0) {
    // Fixed: use current_class_id instead of current_class
    const { count, error: countError } = await supabase
      .from("za_demo_student")
      .select("id", { count: "exact", head: true })
      .in("current_class_id", classIds)
      .eq("status", "active")
      .is("deleted_at", null);

    if (!countError) {
      totalStudents = count || 0;
    }
  }

  // Get current active academic year and term
  const { data: activeAcademicYear } = await supabase
    .from("za_demo_academic_year")
    .select("id, year, name, is_active")
    .eq("is_active", true)
    .eq("status", "active")
    .single();

  let activeTerm = null;
  if (activeAcademicYear) {
    const { data: term } = await supabase
      .from("za_demo_term")
      .select("id, term_number, name")
      .eq("academic_year_id", activeAcademicYear.id)
      .eq("is_active", true)
      .eq("status", "active")
      .maybeSingle();
    activeTerm = term;
  }

  // Get attendance summary
  let attendanceSummary = {
    totalRecords: 0,
    presentCount: 0,
    absentCount: 0,
    lateCount: 0,
    excusedCount: 0,
    attendanceRate: 0,
  };

  if (classIds.length > 0 && activeAcademicYear) {
    let attendanceQuery = supabase
      .from("za_demo_student_attendance")
      .select("status")
      .in("class_id", classIds)
      .eq("academic_year_id", activeAcademicYear.id)
      .is("deleted_at", null);

    if (activeTerm) {
      attendanceQuery = attendanceQuery.eq("term_id", activeTerm.id);
    }

    const { data: attendance, error: attendanceError } = await attendanceQuery;

    if (!attendanceError && attendance) {
      attendanceSummary.totalRecords = attendance.length;
      attendanceSummary.presentCount = attendance.filter(
        (a) => a.status === "present",
      ).length;
      attendanceSummary.absentCount = attendance.filter(
        (a) => a.status === "absent",
      ).length;
      attendanceSummary.lateCount = attendance.filter(
        (a) => a.status === "late",
      ).length;
      attendanceSummary.excusedCount = attendance.filter(
        (a) => a.status === "excused",
      ).length;
      attendanceSummary.attendanceRate =
        attendance.length > 0
          ? parseInt(
              (
                (attendanceSummary.presentCount / attendance.length) *
                100
              ).toFixed(1),
            )
          : 0;
    }
  }

  // Get recent activities (scores and assessments)
  const recentActivities: RecentActivity[] = [];

  // Get recent scores
  const { data: recentScores } = await supabase
    .from("za_demo_student_score")
    .select("assessment_type, title, created_at, class_id, subject_id")
    .eq("teacher_id", staff.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(5);

  if (recentScores) {
    recentScores.forEach((score: any) => {
      recentActivities.push({
        type: score.assessment_type === "assessment" ? "Assessment" : "Exam",
        title: score.title,
        date: score.created_at,
        icon: score.assessment_type === "assessment" ? "📝" : "📋",
      });
    });
  }

  // Get recent assessments (from student_assessment table)
  const { data: recentAssessments } = await supabase
    .from("za_demo_student_assessment")
    .select("assessment_type, remarks, created_at")
    .eq("teacher_id", staff.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(3);

  if (recentAssessments) {
    recentAssessments.forEach((assessment: any) => {
      recentActivities.push({
        type: "Assessment",
        title: `${assessment.assessment_type} assessment recorded`,
        date: assessment.created_at,
        icon: "⭐",
      });
    });
  }

  // Sort and limit recent activities
  recentActivities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const topRecentActivities = recentActivities.slice(0, 5);

  return {
    profile: {
      id: staff.id,
      name: `${staff.first_name} ${staff.last_name}`,
      email: staff.email,
      phone: staff.phone,
      qualification: staff.qualification,
      specialization: staff.specialization,
      avatar: `${staff.first_name?.[0]}${staff.last_name?.[0]}`,
      department: departmentName || "Not Assigned",
    },
    stats: {
      totalClasses: classes.length,
      totalSubjects: subjects.length,
      totalStudents,
      attendanceRate: attendanceSummary.attendanceRate,
      totalAttendanceRecords: attendanceSummary.totalRecords,
      presentCount: attendanceSummary.presentCount,
      absentCount: attendanceSummary.absentCount,
      lateCount: attendanceSummary.lateCount,
      excusedCount: attendanceSummary.excusedCount,
    },
    classes,
    subjects,
    currentAcademicYear: activeAcademicYear,
    currentTerm: activeTerm,
    recentActivities: topRecentActivities,
  };
}

// =============================================
// GET CLASS SUMMARY
// =============================================

export async function getClassSummary(classId: number) {
  const supabase = await createSupabaseServerClient();

  const { data: authUser } = await supabase.auth.getUser();
  if (!authUser?.user) {
    return { error: "Unauthorized" };
  }

  const teacherId = await getCurrentTeacherId(supabase);
  if (!teacherId) {
    return { error: "Teacher not found" };
  }

  // Verify teacher has access to this class
  const hasAccess = await checkTeacherClassAccess(supabase, teacherId, classId);
  if (!hasAccess) {
    return { error: "Not authorized for this class" };
  }

  // Get class details
  const { data: classData, error: classError } = await supabase
    .from("za_demo_class")
    .select("id, name, level, section, sequence, max_students, assigned_teacher")
    .eq("id", classId)
    .eq("status", "active")
    .is("deleted_at", null)
    .single();

  if (classError || !classData) {
    return { error: "Class not found" };
  }

  // Get student count - fixed: use current_class_id
  const { count: studentCount, error: countError } = await supabase
    .from("za_demo_student")
    .select("id", { count: "exact", head: true })
    .eq("current_class_id", classId)
    .eq("status", "active")
    .is("deleted_at", null);

  // Get subjects taught by this teacher for this class
  const { data: subjectsData, error: subjectsError } = await supabase
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

  const uniqueSubjects: SubjectType[] = [];
  const subjectMap = new Map<number, SubjectType>();
  
  subjectsData?.forEach((item: any) => {
    const subjectData = Array.isArray(item.subject) ? item.subject[0] : item.subject;
    if (subjectData && !subjectMap.has(subjectData.id)) {
      subjectMap.set(subjectData.id, subjectData);
      uniqueSubjects.push(subjectData);
    }
  });

  // Get current active academic year and term
  const { data: activeAcademicYear } = await supabase
    .from("za_demo_academic_year")
    .select("id, year, name")
    .eq("is_active", true)
    .eq("status", "active")
    .single();

  let activeTerm = null;
  if (activeAcademicYear) {
    const { data: term } = await supabase
      .from("za_demo_term")
      .select("id, term_number, name")
      .eq("academic_year_id", activeAcademicYear.id)
      .eq("is_active", true)
      .eq("status", "active")
      .maybeSingle();
    activeTerm = term;
  }

  return {
    class: classData,
    totalStudents: studentCount || 0,
    maxCapacity: classData.max_students || 0,
    capacityPercentage: classData.max_students 
      ? Math.round(((studentCount || 0) / classData.max_students) * 100)
      : 0,
    subjects: uniqueSubjects,
    currentAcademicYear: activeAcademicYear,
    currentTerm: activeTerm,
  };
}

// =============================================
// GET RECENT SCORES
// =============================================

export async function getRecentScores(classId: number, subjectId: number) {
  const supabase = await createSupabaseServerClient();

  const { data: authUser } = await supabase.auth.getUser();
  if (!authUser?.user) {
    return { error: "Unauthorized" };
  }

  const teacherId = await getCurrentTeacherId(supabase);
  if (!teacherId) {
    return { error: "Teacher not found" };
  }

  // Verify teacher has access to this class and subject
  const { data: assignment } = await supabase
    .from("za_demo_teacher_subject_class")
    .select("id")
    .eq("teacher_id", teacherId)
    .eq("class_id", classId)
    .eq("subject_id", subjectId)
    .eq("status", "active")
    .is("deleted_at", null)
    .maybeSingle();

  if (!assignment) {
    return { error: "Not authorized for this class and subject" };
  }

  // Get recent scores - fixed: use max_score instead of total
  const { data: scores, error } = await supabase
    .from("za_demo_student_score")
    .select(`
      id,
      title,
      assessment_type,
      score,
      max_score,
      weight,
      created_at,
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
    .eq("teacher_id", teacherId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    return { error: error.message };
  }

  // Format scores with calculated percentage
  const formattedScores = (scores || []).map((score: any) => ({
    ...score,
    percentage: score.max_score > 0 
      ? Math.round((score.score / score.max_score) * 100)
      : 0,
    student_name: score.student 
      ? `${score.student.first_name} ${score.student.last_name}${score.student.other_names ? ` ${score.student.other_names}` : ''}`
      : "Unknown",
  }));

  return { scores: formattedScores };
}

// =============================================
// GET UPCOMING ASSESSMENTS
// =============================================

export async function getUpcomingAssessments(classId: number, subjectId: number) {
  const supabase = await createSupabaseServerClient();

  const teacherId = await getCurrentTeacherId(supabase);
  if (!teacherId) {
    return { error: "Unauthorized" };
  }

  // For now, return a placeholder - you can add a table for scheduled assessments
  // This could be expanded later with a proper assessment scheduling table
  
  return { assessments: [] };
}

// =============================================
// GET CLASS ATTENDANCE SUMMARY
// =============================================

export async function getClassAttendanceSummary(classId: number, termId?: number, academicYearId?: number) {
  const supabase = await createSupabaseServerClient();

  const teacherId = await getCurrentTeacherId(supabase);
  if (!teacherId) {
    return { error: "Unauthorized" };
  }

  const hasAccess = await checkTeacherClassAccess(supabase, teacherId, classId);
  if (!hasAccess) {
    return { error: "Not authorized for this class" };
  }

  // Get current active academic year if not provided
  let targetAcademicYearId = academicYearId;
  let targetTermId = termId;

  if (!targetAcademicYearId) {
    const { data: activeYear } = await supabase
      .from("za_demo_academic_year")
      .select("id")
      .eq("is_active", true)
      .eq("status", "active")
      .single();
    if (activeYear) {
      targetAcademicYearId = activeYear.id;
    }
  }

  if (!targetTermId && targetAcademicYearId) {
    const { data: activeTerm } = await supabase
      .from("za_demo_term")
      .select("id")
      .eq("academic_year_id", targetAcademicYearId)
      .eq("is_active", true)
      .eq("status", "active")
      .maybeSingle();
    if (activeTerm) {
      targetTermId = activeTerm.id;
    }
  }

  // Get attendance records for this class
  let query = supabase
    .from("za_demo_student_attendance")
    .select("student_id, status, attendance_date")
    .eq("class_id", classId)
    .eq("teacher_id", teacherId)
    .is("deleted_at", null);

  if (targetAcademicYearId) {
    query = query.eq("academic_year_id", targetAcademicYearId);
  }
  if (targetTermId) {
    query = query.eq("term_id", targetTermId);
  }

  const { data: attendance, error } = await query;

  if (error) {
    return { error: error.message };
  }

  const totalRecords = attendance?.length || 0;
  const presentCount = attendance?.filter(a => a.status === "present").length || 0;
  const absentCount = attendance?.filter(a => a.status === "absent").length || 0;
  const lateCount = attendance?.filter(a => a.status === "late").length || 0;
  const excusedCount = attendance?.filter(a => a.status === "excused").length || 0;
  const attendanceRate = totalRecords > 0 ? Math.round((presentCount / totalRecords) * 100) : 0;

  return {
    summary: {
      totalRecords,
      presentCount,
      absentCount,
      lateCount,
      excusedCount,
      attendanceRate,
    },
    academicYearId: targetAcademicYearId,
    termId: targetTermId,
  };
}