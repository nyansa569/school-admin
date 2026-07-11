// lib/actions/teacher/attendance.ts
"use server";

import { createSupabaseServerClient } from "@/lib/server";
import { revalidatePath } from "next/cache";

// =============================================
// TYPE DEFINITIONS
// =============================================

type AttendanceStatus = "present" | "absent" | "late" | "excused";

type AttendanceRecord = {
  id?: number;
  student_id: number;
  class_id: number;
  subject_id: number | null;
  teacher_id: number;
  attendance_date: string;
  status: AttendanceStatus;
  term_id: number | null;
  academic_year_id: number | null;
  check_in_time: string | null;
  check_out_time: string | null;
  remarks: string | null;
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
    .single();

  return staff?.id || null;
}

export async function checkTeacherAuthorization(classId: number, subjectId?: number) {
  const supabase = await createSupabaseServerClient();

  const teacherId = await getCurrentTeacherId(supabase);
  if (!teacherId) {
    return { error: "Unauthorized - Teacher not found", isAuthorized: false };
  }

  let query = supabase
    .from("za_demo_teacher_subject_class")
    .select("id")
    .eq("teacher_id", teacherId)
    .eq("class_id", classId)
    .eq("status", "active")
    .is("deleted_at", null);

  if (subjectId) {
    query = query.eq("subject_id", subjectId);
  }

  const { data: assignment, error: assignmentError } = await query.maybeSingle();

  if (assignmentError || !assignment) {
    return { 
      error: "You are not authorized for this class", 
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

export async function getCurrentActiveTerm() {
  const supabase = await createSupabaseServerClient();

  const { data: activeYear } = await supabase
    .from("za_demo_academic_year")
    .select("id")
    .eq("is_active", true)
    .eq("status", "active")
    .single();

  if (!activeYear) {
    return { term: null, academicYear: null };
  }

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
// GET ATTENDANCE OVERVIEW
// =============================================

export async function getAttendanceOverview(
  classId: number, 
  subjectId?: number, 
  termId?: number, 
  academicYearId?: number
) {
  const supabase = await createSupabaseServerClient();

  const auth = await checkTeacherAuthorization(classId, subjectId);
  if (!auth.isAuthorized) {
    return { error: auth.error };
  }

  const teacherId = auth.teacherId;

  const { students, error: studentsError } = await getStudentsByClass(classId);
  if (studentsError) {
    return { error: studentsError };
  }

  if (!students || students.length === 0) {
    return { students: [], summary: { totalStudents: 0, totalAttendanceRecords: 0, overallAttendanceRate: "0", presentCount: 0, absentCount: 0, lateCount: 0, excusedCount: 0 } };
  }

  let query = supabase
    .from("za_demo_student_attendance")
    .select("student_id, status, attendance_date")
    .eq("class_id", classId)
    .eq("teacher_id", teacherId)
    .is("deleted_at", null);

  if (subjectId) {
    query = query.eq("subject_id", subjectId);
  }
  if (termId) {
    query = query.eq("term_id", termId);
  }
  if (academicYearId) {
    query = query.eq("academic_year_id", academicYearId);
  }

  const { data: attendanceRecords, error: attendanceError } = await query;

  if (attendanceError) {
    return { error: attendanceError.message };
  }

  const studentAttendance = students.map((student: any) => {
    const studentRecords = attendanceRecords?.filter((r) => r.student_id === student.id) || [];
    const totalDays = studentRecords.length;
    const presentDays = studentRecords.filter((r) => r.status === "present").length;
    const absentDays = studentRecords.filter((r) => r.status === "absent").length;
    const lateDays = studentRecords.filter((r) => r.status === "late").length;
    const excusedDays = studentRecords.filter((r) => r.status === "excused").length;
    
    const attendanceRate = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : "0";

    return {
      ...student,
      attendance: {
        totalDays,
        presentDays,
        absentDays,
        lateDays,
        excusedDays,
        attendanceRate,
      },
    };
  });

  const allRecords = attendanceRecords || [];
  const classTotalDays = allRecords.length;
  const classPresentDays = allRecords.filter((r) => r.status === "present").length;
  const classAttendanceRate = classTotalDays > 0 ? ((classPresentDays / classTotalDays) * 100).toFixed(1) : "0";

  return {
    students: studentAttendance,
    summary: {
      totalStudents: students.length,
      totalAttendanceRecords: classTotalDays,
      overallAttendanceRate: classAttendanceRate,
      presentCount: classPresentDays,
      absentCount: allRecords.filter((r) => r.status === "absent").length,
      lateCount: allRecords.filter((r) => r.status === "late").length,
      excusedCount: allRecords.filter((r) => r.status === "excused").length,
    },
  };
}

// =============================================
// GET ATTENDANCE BY DATE
// =============================================

export async function getAttendanceByDate(
  classId: number, 
  subjectId: number | undefined,
  date: string, 
  termId?: number, 
  academicYearId?: number
) {
  const supabase = await createSupabaseServerClient();

  const auth = await checkTeacherAuthorization(classId, subjectId);
  if (!auth.isAuthorized) {
    return { error: auth.error };
  }

  const teacherId = auth.teacherId;

  let query = supabase
    .from("za_demo_student_attendance")
    .select(`
      id,
      student_id,
      status,
      attendance_date,
      check_in_time,
      check_out_time,
      remarks,
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
    .eq("teacher_id", teacherId)
    .eq("attendance_date", date)
    .is("deleted_at", null);

  if (subjectId) {
    query = query.eq("subject_id", subjectId);
  }
  if (termId) {
    query = query.eq("term_id", termId);
  }
  if (academicYearId) {
    query = query.eq("academic_year_id", academicYearId);
  }

  const { data: attendance, error } = await query;

  if (error) {
    return { error: error.message };
  }

  const { students } = await getStudentsByClass(classId);
  
  if (!students || students.length === 0) {
    return { attendance: [] };
  }

  const attendanceMap = new Map();
  attendance?.forEach((a: any) => {
    attendanceMap.set(a.student_id, a);
  });

  const completeAttendance = students.map((student: any) => {
    const record = attendanceMap.get(student.id);
    return {
      student_id: student.id,
      first_name: student.first_name,
      last_name: student.last_name,
      other_names: student.other_names,
      full_name: student.full_name,
      admission_number: student.admission_number || student.student_number,
      status: record?.status || null,
      attendance_id: record?.id || null,
      check_in_time: record?.check_in_time || null,
      check_out_time: record?.check_out_time || null,
      remarks: record?.remarks || null,
    };
  });

  return { attendance: completeAttendance };
}

// =============================================
// MARK INDIVIDUAL STUDENT ATTENDANCE
// =============================================

export async function markStudentAttendance(
  classId: number,
  subjectId: number | undefined,
  studentId: number,
  date: string,
  status: AttendanceStatus,
  termId?: number,
  academicYearId?: number,
  checkInTime?: string,
  checkOutTime?: string,
  remarks?: string
) {
  const supabase = await createSupabaseServerClient();

  const auth = await checkTeacherAuthorization(classId, subjectId);
  if (!auth.isAuthorized) {
    return { error: auth.error };
  }

  const teacherId = auth.teacherId;

  // Check if attendance record already exists
  let query = supabase
    .from("za_demo_student_attendance")
    .select("id")
    .eq("class_id", classId)
    .eq("teacher_id", teacherId)
    .eq("student_id", studentId)
    .eq("attendance_date", date)
    .is("deleted_at", null);

  if (subjectId) {
    query = query.eq("subject_id", subjectId);
  }
  if (termId) {
    query = query.eq("term_id", termId);
  }
  if (academicYearId) {
    query = query.eq("academic_year_id", academicYearId);
  }

  const { data: existing, error: findError } = await query.maybeSingle();

  if (findError) {
    return { error: findError.message };
  }

  const attendanceData: Partial<AttendanceRecord> = {
    class_id: classId,
    teacher_id: teacherId,
    student_id: studentId,
    attendance_date: date,
    status,
    term_id: termId || null,
    academic_year_id: academicYearId || null,
    check_in_time: checkInTime || null,
    check_out_time: checkOutTime || null,
    remarks: remarks || null,
  };

  if (subjectId) {
    attendanceData.subject_id = subjectId;
  }

  let result;
  if (existing) {
    result = await supabase
      .from("za_demo_student_attendance")
      .update({
        status,
        check_in_time: checkInTime || null,
        check_out_time: checkOutTime || null,
        remarks: remarks || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
  } else {
    result = await supabase
      .from("za_demo_student_attendance")
      .insert(attendanceData);
  }

  if (result.error) {
    return { error: result.error.message };
  }

  //revalidatePath(`/teacher/class/${classId}/attendance`);
  if (subjectId) {
    //revalidatePath(`/teacher/class/${classId}/subject/${subjectId}/attendance`);
  }
  return { success: true };
}

// =============================================
// MARK ALL STUDENTS ATTENDANCE (BULK)
// =============================================

export async function markAllStudentsAttendance(
  classId: number,
  subjectId: number | undefined,
  date: string,
  status: AttendanceStatus,
  termId?: number,
  academicYearId?: number,
  remarks?: string
) {
  const supabase = await createSupabaseServerClient();

  const auth = await checkTeacherAuthorization(classId, subjectId);
  if (!auth.isAuthorized) {
    return { error: auth.error };
  }

  const teacherId = auth.teacherId;

  const { students, error: studentsError } = await getStudentsByClass(classId);
  if (studentsError) {
    return { error: studentsError };
  }

  if (!students || students.length === 0) {
    return { error: "No students found in this class" };
  }

  // Get existing records for this date
  let existingQuery = supabase
    .from("za_demo_student_attendance")
    .select("student_id, id")
    .eq("class_id", classId)
    .eq("teacher_id", teacherId)
    .eq("attendance_date", date)
    .is("deleted_at", null);

  if (subjectId) {
    existingQuery = existingQuery.eq("subject_id", subjectId);
  }
  if (termId) {
    existingQuery = existingQuery.eq("term_id", termId);
  }
  if (academicYearId) {
    existingQuery = existingQuery.eq("academic_year_id", academicYearId);
  }

  const { data: existingRecords } = await existingQuery;

  const existingMap = new Map();
  existingRecords?.forEach((record) => {
    existingMap.set(record.student_id, record);
  });

  const updates = [];
  const inserts = [];

  for (const student of students) {
    const existing = existingMap.get(student.id);
    const recordData = {
      class_id: classId,
      teacher_id: teacherId,
      student_id: student.id,
      attendance_date: date,
      status,
      term_id: termId || null,
      academic_year_id: academicYearId || null,
      remarks: remarks || null,
    };

    if (subjectId) {
      Object.assign(recordData, { subject_id: subjectId });
    }

    if (existing) {
      updates.push(
        supabase
          .from("za_demo_student_attendance")
          .update({ status, remarks, updated_at: new Date().toISOString() })
          .eq("id", existing.id)
      );
    } else {
      inserts.push(recordData);
    }
  }

  if (updates.length > 0) {
    await Promise.all(updates);
  }

  if (inserts.length > 0) {
    const { error: insertError } = await supabase
      .from("za_demo_student_attendance")
      .insert(inserts);

    if (insertError) {
      return { error: insertError.message };
    }
  }

  //revalidatePath(`/teacher/class/${classId}/attendance`);
  if (subjectId) {
    //revalidatePath(`/teacher/class/${classId}/subject/${subjectId}/attendance`);
  }
  return { success: true, markedCount: students.length };
}

// =============================================
// MARK SELECTED STUDENTS ATTENDANCE
// =============================================

export async function markSelectedStudentsAttendance(
  classId: number,
  subjectId: number | undefined,
  date: string,
  studentIds: number[],
  status: AttendanceStatus,
  termId?: number,
  academicYearId?: number,
  remarks?: string
) {
  const supabase = await createSupabaseServerClient();

  const auth = await checkTeacherAuthorization(classId, subjectId);
  if (!auth.isAuthorized) {
    return { error: auth.error };
  }

  const teacherId = auth.teacherId;

  if (!studentIds || studentIds.length === 0) {
    return { error: "No students selected" };
  }

  // Get existing records for these students on this date
  let existingQuery = supabase
    .from("za_demo_student_attendance")
    .select("student_id, id")
    .eq("class_id", classId)
    .eq("teacher_id", teacherId)
    .eq("attendance_date", date)
    .in("student_id", studentIds)
    .is("deleted_at", null);

  if (subjectId) {
    existingQuery = existingQuery.eq("subject_id", subjectId);
  }
  if (termId) {
    existingQuery = existingQuery.eq("term_id", termId);
  }
  if (academicYearId) {
    existingQuery = existingQuery.eq("academic_year_id", academicYearId);
  }

  const { data: existingRecords } = await existingQuery;

  const existingMap = new Map();
  existingRecords?.forEach((record) => {
    existingMap.set(record.student_id, record);
  });

  const updates = [];
  const inserts = [];

  for (const studentId of studentIds) {
    const existing = existingMap.get(studentId);
    const recordData = {
      class_id: classId,
      teacher_id: teacherId,
      student_id: studentId,
      attendance_date: date,
      status,
      term_id: termId || null,
      academic_year_id: academicYearId || null,
      remarks: remarks || null,
    };

    if (subjectId) {
      Object.assign(recordData, { subject_id: subjectId });
    }

    if (existing) {
      updates.push(
        supabase
          .from("za_demo_student_attendance")
          .update({ status, remarks, updated_at: new Date().toISOString() })
          .eq("id", existing.id)
      );
    } else {
      inserts.push(recordData);
    }
  }

  if (updates.length > 0) {
    await Promise.all(updates);
  }

  if (inserts.length > 0) {
    const { error: insertError } = await supabase
      .from("za_demo_student_attendance")
      .insert(inserts);

    if (insertError) {
      return { error: insertError.message };
    }
  }

  //revalidatePath(`/teacher/class/${classId}/attendance`);
  if (subjectId) {
    //revalidatePath(`/teacher/class/${classId}/subject/${subjectId}/attendance`);
  }
  return { success: true, markedCount: studentIds.length };
}

// =============================================
// GET STUDENT ATTENDANCE HISTORY
// =============================================

export async function getStudentAttendanceHistory(
  classId: number,
  subjectId: number | undefined,
  studentId: number,
  termId?: number,
  academicYearId?: number
) {
  const supabase = await createSupabaseServerClient();

  const auth = await checkTeacherAuthorization(classId, subjectId);
  if (!auth.isAuthorized) {
    return { error: auth.error };
  }

  const teacherId = auth.teacherId;

  // Get student details
  const { data: student, error: studentError } = await supabase
    .from("za_demo_student")
    .select("id, first_name, last_name, other_names, admission_number, student_number")
    .eq("id", studentId)
    .single();

  if (studentError || !student) {
    return { error: "Student not found" };
  }

  // Get attendance history
  let query = supabase
    .from("za_demo_student_attendance")
    .select("id, attendance_date, status, check_in_time, check_out_time, remarks, created_at, term_id, academic_year_id")
    .eq("class_id", classId)
    .eq("teacher_id", teacherId)
    .eq("student_id", studentId)
    .is("deleted_at", null)
    .order("attendance_date", { ascending: false });

  if (subjectId) {
    query = query.eq("subject_id", subjectId);
  }
  if (termId) {
    query = query.eq("term_id", termId);
  }
  if (academicYearId) {
    query = query.eq("academic_year_id", academicYearId);
  }

  const { data: history, error: historyError } = await query;

  if (historyError) {
    return { error: historyError.message };
  }

  const totalDays = history?.length || 0;
  const presentDays = history?.filter((h) => h.status === "present").length || 0;
  const absentDays = history?.filter((h) => h.status === "absent").length || 0;
  const lateDays = history?.filter((h) => h.status === "late").length || 0;
  const excusedDays = history?.filter((h) => h.status === "excused").length || 0;
  const attendanceRate = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : "0";

  return {
    student: {
      ...student,
      full_name: `${student.first_name} ${student.last_name}${student.other_names ? ` ${student.other_names}` : ''}`,
    },
    history: history || [],
    summary: {
      totalDays,
      presentDays,
      absentDays,
      lateDays,
      excusedDays,
      attendanceRate,
    },
  };
}

// =============================================
// DELETE ATTENDANCE RECORD (Soft Delete)
// =============================================

export async function deleteAttendanceRecord(recordId: number, classId: number, subjectId?: number) {
  const supabase = await createSupabaseServerClient();

  const auth = await checkTeacherAuthorization(classId, subjectId);
  if (!auth.isAuthorized) {
    return { error: auth.error };
  }

  const { error } = await supabase
    .from("za_demo_student_attendance")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", recordId)
    .eq("teacher_id", auth.teacherId);

  if (error) {
    return { error: error.message };
  }

  //revalidatePath(`/teacher/class/${classId}/attendance`);
  if (subjectId) {
    //revalidatePath(`/teacher/class/${classId}/subject/${subjectId}/attendance`);
  }
  return { success: true };
}