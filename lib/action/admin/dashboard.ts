// lib/action/admin/dashboard.ts
"use server";

import { createSupabaseServerClient } from "@/lib/server";

export type DashboardStats = {
  totalStudents: number;
  totalStaff: number;
  totalTeachers: number;
  totalClasses: number;
  totalSubjects: number;
  totalDepartments: number;
  activeAdmissions: number;
  pendingFees: number;
  totalFeesCollected: number;
  totalFeesExpected: number;
  attendanceRate: number;
  genderBreakdown: {
    male: number;
    female: number;
  };
  classDistribution: Array<{
    class_id: number;
    class_name: string;
    student_count: number;
  }>;
};

export type RecentActivity = {
  id: string;
  type: "student" | "staff" | "admission" | "payment" | "attendance";
  title: string;
  description: string;
  date: string;
  icon: string;
};

export type UpcomingEvent = {
  id: string;
  title: string;
  date: string;
  type: "exam" | "event" | "deadline" | "holiday";
  description?: string;
};

// Get main dashboard statistics
export async function getDashboardStats(): Promise<{ error?: string; stats?: DashboardStats }> {
  const supabase = await createSupabaseServerClient();

  try {
    // Get total students (active, not deleted)
    const { count: totalStudents, error: studentsError } = await supabase
      .from("za_demo_student")
      .select("id", { count: "exact", head: true })
      .is("deleted_at", null)
      .eq("status", "active");

    if (studentsError) throw new Error(studentsError.message);

    // Get gender breakdown
    const { data: genderData, error: genderError } = await supabase
      .from("za_demo_student")
      .select("gender", { count: "exact" })
      .is("deleted_at", null)
      .eq("status", "active");

    if (genderError) throw new Error(genderError.message);

    const maleCount = genderData?.filter(s => s.gender === "male").length || 0;
    const femaleCount = genderData?.filter(s => s.gender === "female").length || 0;

    // Get total staff
    const { count: totalStaff, error: staffError } = await supabase
      .from("za_demo_staff")
      .select("id", { count: "exact", head: true })
      .eq("status", "active");

    if (staffError) throw new Error(staffError.message);

    // Get total teachers
    const { count: totalTeachers, error: teachersError } = await supabase
      .from("za_demo_staff")
      .select("id", { count: "exact", head: true })
      .eq("status", "active")
      .eq("role", "teacher");

    if (teachersError) throw new Error(teachersError.message);

    // Get total classes
    const { count: totalClasses, error: classesError } = await supabase
      .from("za_demo_class")
      .select("id", { count: "exact", head: true })
      .eq("status", "active");

    if (classesError) throw new Error(classesError.message);

    // Get total subjects
    const { count: totalSubjects, error: subjectsError } = await supabase
      .from("za_demo_subject")
      .select("id", { count: "exact", head: true })
      .eq("status", "active");

    if (subjectsError) throw new Error(subjectsError.message);

    // Get total departments
    const { count: totalDepartments, error: deptError } = await supabase
      .from("za_demo_department")
      .select("id", { count: "exact", head: true })
      .eq("status", "active");

    if (deptError) throw new Error(deptError.message);

    // Get active admissions (pending, reviewing, approved - not enrolled or declined)
    const { count: activeAdmissions, error: admissionsError } = await supabase
      .from("za_demo_admission")
      .select("id", { count: "exact", head: true })
      .in("status", ["pending", "reviewing", "approved"]);

    if (admissionsError) throw new Error(admissionsError.message);

    // Get fee statistics
    const { data: feeData, error: feesError } = await supabase
      .from("za_demo_student_fees")
      .select("paid_amount, original_amount, discounted_amount, balance, status");

    if (feesError) throw new Error(feesError.message);

    const totalFeesExpected = feeData?.reduce((sum, f) => sum + (f.discounted_amount || f.original_amount), 0) || 0;
    const totalFeesCollected = feeData?.reduce((sum, f) => sum + (f.paid_amount || 0), 0) || 0;
    const pendingFees = feeData?.filter(f => f.status === "pending" || f.balance > 0).length || 0;

    // Get class distribution
    const { data: classDistribution, error: classDistError } = await supabase
      .from("za_demo_student")
      .select(`
        current_class,
        class:za_demo_class!za_demo_student_current_class_fkey (
          id,
          name
        )
      `)
      .is("deleted_at", null)
      .eq("status", "active")
      .not("current_class", "is", null);

    if (classDistError) throw new Error(classDistError.message);

    const classMap = new Map<number, { class_id: number; class_name: string; student_count: number }>();
    classDistribution?.forEach((student: any) => {
      // Handle case where class might be an array
      const classData = Array.isArray(student.class) ? student.class[0] : student.class;
      if (student.current_class && classData) {
        const classId = student.current_class;
        if (!classMap.has(classId)) {
          classMap.set(classId, {
            class_id: classId,
            class_name: classData.name,
            student_count: 0,
          });
        }
        classMap.get(classId)!.student_count++;
      }
    });

    // Get attendance rate for current month
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString().split('T')[0];
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString().split('T')[0];

    const { data: attendanceData, error: attendanceError } = await supabase
      .from("za_demo_student_attendance")
      .select("status")
      .gte("date", startOfMonth)
      .lte("date", endOfMonth);

    let attendanceRate = 0;
    if (!attendanceError && attendanceData && attendanceData.length > 0) {
      const presentCount = attendanceData.filter(a => a.status === "present").length;
      attendanceRate = Math.round((presentCount / attendanceData.length) * 100);
    }

    return {
      stats: {
        totalStudents: totalStudents || 0,
        totalStaff: totalStaff || 0,
        totalTeachers: totalTeachers || 0,
        totalClasses: totalClasses || 0,
        totalSubjects: totalSubjects || 0,
        totalDepartments: totalDepartments || 0,
        activeAdmissions: activeAdmissions || 0,
        pendingFees: pendingFees || 0,
        totalFeesCollected,
        totalFeesExpected,
        attendanceRate,
        genderBreakdown: {
          male: maleCount,
          female: femaleCount,
        },
        classDistribution: Array.from(classMap.values()).sort((a, b) => a.class_name.localeCompare(b.class_name)),
      },
    };
  } catch (err: any) {
    console.error("Error fetching dashboard stats:", err);
    return { error: err.message };
  }
}

// Get recent activities
// Get recent activities
export async function getRecentActivities(limit: number = 10): Promise<{ error?: string; activities?: RecentActivity[] }> {
  const supabase = await createSupabaseServerClient();
  const activities: RecentActivity[] = [];

  try {
    // Get recent student additions
    const { data: recentStudents, error: studentsError } = await supabase
      .from("za_demo_student")
      .select("id, first_name, last_name, created_at")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(3);

    if (!studentsError && recentStudents) {
      recentStudents.forEach((student) => {
        activities.push({
          id: `student-${student.id}`,
          type: "student",
          title: "New Student Enrolled",
          description: `${student.first_name} ${student.last_name} was added to the system`,
          date: student.created_at,
          icon: "👨‍🎓",
        });
      });
    }

    // Get recent staff additions
    const { data: recentStaff, error: staffError } = await supabase
      .from("za_demo_staff")
      .select("id, first_name, last_name, created_at, role")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(3);

    if (!staffError && recentStaff) {
      recentStaff.forEach((staff) => {
        activities.push({
          id: `staff-${staff.id}`,
          type: "staff",
          title: "New Staff Member",
          description: `${staff.first_name} ${staff.last_name} joined as ${staff.role}`,
          date: staff.created_at,
          icon: "👩‍🏫",
        });
      });
    }

    // Get recent admissions with explicit foreign key
    const { data: recentAdmissions, error: admissionsError } = await supabase
      .from("za_demo_admission")
      .select(`
        id,
        created_at,
        status,
        applicant_id,
        applicant:za_demo_applicant!za_demo_admission_applicant_id_fkey (
          first_name,
          last_name
        )
      `)
      .order("created_at", { ascending: false })
      .limit(3);

    if (!admissionsError && recentAdmissions) {
      recentAdmissions.forEach((admission: any) => {
        const applicantData = Array.isArray(admission.applicant) ? admission.applicant[0] : admission.applicant;
        const applicantName = applicantData 
          ? `${applicantData.first_name} ${applicantData.last_name}`
          : "New applicant";
        activities.push({
          id: `admission-${admission.id}`,
          type: "admission",
          title: "New Admission Application",
          description: `${applicantName} applied for admission (${admission.status})`,
          date: admission.created_at,
          icon: "📝",
        });
      });
    }

    // Get recent fee payments with explicit foreign key
    const { data: recentPayments, error: paymentsError } = await supabase
      .from("za_demo_fee_payments")
      .select(`
        id,
        created_at,
        amount,
        student_id,
        student:za_demo_student!za_demo_fee_payments_student_id_fkey (
          first_name,
          last_name,
          admission_number
        )
      `)
      .order("created_at", { ascending: false })
      .limit(3);

    if (!paymentsError && recentPayments) {
      recentPayments.forEach((payment: any) => {
        const studentData = Array.isArray(payment.student) ? payment.student[0] : payment.student;
        const studentName = studentData 
          ? `${studentData.first_name} ${studentData.last_name}`
          : "Student";
        activities.push({
          id: `payment-${payment.id}`,
          type: "payment",
          title: "Fee Payment Received",
          description: `${studentName} paid GHS ${payment.amount?.toLocaleString()}`,
          date: payment.created_at,
          icon: "💰",
        });
      });
    }

    // Sort all activities by date (newest first) and limit
    activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const limitedActivities = activities.slice(0, limit);

    return { activities: limitedActivities };
  } catch (err: any) {
    console.error("Error fetching recent activities:", err);
    return { error: err.message, activities: [] };
  }
}

// Get upcoming events (exams, deadlines, etc.)
export async function getUpcomingEvents(limit: number = 5): Promise<{ error?: string; events?: UpcomingEvent[] }> {
  const supabase = await createSupabaseServerClient();
  const events: UpcomingEvent[] = [];

  try {
    const currentDate = new Date().toISOString().split('T')[0];
    
    const { data: upcomingExams, error: examsError } = await supabase
      .from("za_demo_student_score")
      .select("id, title, type, created_at")
      .eq("type", "exam")
      .order("created_at", { ascending: true })
      .limit(3);

    if (!examsError && upcomingExams) {
      upcomingExams.forEach((exam, index) => {
        const examDate = new Date();
        examDate.setDate(examDate.getDate() + (index + 1) * 2);
        events.push({
          id: `exam-${exam.id}`,
          title: exam.title || "Upcoming Examination",
          date: examDate.toISOString().split('T')[0],
          type: "exam",
          description: "Students are expected to prepare accordingly",
        });
      });
    }

    const { data: upcomingAssessments, error: assessmentError } = await supabase
      .from("za_demo_student_assessment")
      .select("id, type, created_at")
      .order("created_at", { ascending: true })
      .limit(2);

    if (!assessmentError && upcomingAssessments) {
      upcomingAssessments.forEach((assessment, index) => {
        const assessmentDate = new Date();
        assessmentDate.setDate(assessmentDate.getDate() + (index + 1) * 5);
        events.push({
          id: `assessment-${assessment.id}`,
          title: `${assessment.type?.charAt(0).toUpperCase() + assessment.type?.slice(1) || "Student"} Assessment`,
          date: assessmentDate.toISOString().split('T')[0],
          type: "event",
        });
      });
    }

    events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const limitedEvents = events.slice(0, limit);

    return { events: limitedEvents };
  } catch (err: any) {
    console.error("Error fetching upcoming events:", err);
    return { error: err.message, events: [] };
  }
}

// Get month-by-month fee collection for chart
export async function getFeeCollectionTrend(year?: number): Promise<{ error?: string; data?: Array<{ month: string; amount: number }> }> {
  const supabase = await createSupabaseServerClient();
  const targetYear = year || new Date().getFullYear();

  try {
    const { data: payments, error } = await supabase
      .from("za_demo_fee_payments")
      .select("amount, payment_date")
      .gte("payment_date", `${targetYear}-01-01`)
      .lte("payment_date", `${targetYear}-12-31`);

    if (error) throw new Error(error.message);

    const monthlyData = new Array(12).fill(0);
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    payments?.forEach((payment) => {
      const month = new Date(payment.payment_date).getMonth();
      monthlyData[month] += payment.amount || 0;
    });

    const chartData = monthNames.map((month, index) => ({
      month,
      amount: monthlyData[index],
    }));

    return { data: chartData };
  } catch (err: any) {
    console.error("Error fetching fee collection trend:", err);
    return { error: err.message };
  }
}

// Get enrollment trend by month
export async function getEnrollmentTrend(year?: number): Promise<{ error?: string; data?: Array<{ month: string; count: number }> }> {
  const supabase = await createSupabaseServerClient();
  const targetYear = year || new Date().getFullYear();

  try {
    const { data: students, error } = await supabase
      .from("za_demo_student")
      .select("created_at")
      .gte("created_at", `${targetYear}-01-01`)
      .lte("created_at", `${targetYear}-12-31`)
      .is("deleted_at", null);

    if (error) throw new Error(error.message);

    const monthlyData = new Array(12).fill(0);
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    students?.forEach((student) => {
      const month = new Date(student.created_at).getMonth();
      monthlyData[month]++;
    });

    const chartData = monthNames.map((month, index) => ({
      month,
      count: monthlyData[index],
    }));

    return { data: chartData };
  } catch (err: any) {
    console.error("Error fetching enrollment trend:", err);
    return { error: err.message };
  }
}

// Get class-wise performance summary
// Get class-wise performance summary
export async function getClassPerformanceSummary(academicYearId?: number): Promise<{ error?: string; data?: any[] }> {
  const supabase = await createSupabaseServerClient();

  try {
    const { data: classes, error: classesError } = await supabase
      .from("za_demo_class")
      .select("id, name, level")
      .eq("status", "active")
      .order("sequence", { ascending: true });

    if (classesError) throw new Error(classesError.message);

    const classPerformance = await Promise.all(
      (classes || []).map(async (classItem) => {
        const { count: studentCount } = await supabase
          .from("za_demo_student")
          .select("id", { count: "exact", head: true })
          .eq("current_class", classItem.id)
          .eq("status", "active")
          .is("deleted_at", null);

        let query = supabase
          .from("za_demo_student_score")
          .select("mark, total")
          .eq("class_id", classItem.id);

        if (academicYearId) {
          query = query.eq("academic_yeat_id", academicYearId);
        }

        const { data: scores } = await query;

        let averageScore = 0;
        if (scores && scores.length > 0) {
          let totalPercentage = 0;
          scores.forEach(score => {
            if (score.total > 0) {
              totalPercentage += (score.mark / score.total) * 100;
            }
          });
          averageScore = Math.round(totalPercentage / scores.length);
        }

        return {
          class_id: classItem.id,
          class_name: classItem.name,
          level: classItem.level,
          student_count: studentCount || 0,
          average_score: averageScore,
        };
      })
    );

    return { data: classPerformance };
  } catch (err: any) {
    console.error("Error fetching class performance:", err);
    return { error: err.message };
  }
}

// Get teacher workload summary
// Get teacher workload summary
export async function getTeacherWorkloadSummary(): Promise<{ error?: string; data?: any[] }> {
  const supabase = await createSupabaseServerClient();

  try {
    const { data: teachers, error: teachersError } = await supabase
      .from("za_demo_staff")
      .select("id, first_name, last_name, email")
      .eq("status", "active")
      .eq("role", "teacher");

    if (teachersError) throw new Error(teachersError.message);

    const workload = await Promise.all(
      (teachers || []).map(async (teacher) => {
        // First, get assignments without joining class and subject
        const { data: assignments, error: assignError } = await supabase
          .from("za_demo_teacher_subject_class")
          .select("id, class_id, subject_id, academic_year_id")
          .eq("teacher_id", teacher.id);

        if (assignError) throw new Error(assignError.message);

        if (!assignments || assignments.length === 0) {
          return {
            id: teacher.id,
            name: `${teacher.first_name} ${teacher.last_name}`,
            email: teacher.email,
            total_classes: 0,
            total_subjects: 0,
            total_students: 0,
            assignments: [],
          };
        }

        // Get unique class IDs
        const classIds = [...new Set(assignments.map(a => a.class_id).filter(Boolean))];
        const subjectIds = [...new Set(assignments.map(a => a.subject_id).filter(Boolean))];

        // Get class names separately
        let classNames: Record<number, string> = {};
        if (classIds.length > 0) {
          const { data: classes } = await supabase
            .from("za_demo_class")
            .select("id, name")
            .in("id", classIds);
          if (classes) {
            classNames = classes.reduce((acc, c) => ({ ...acc, [c.id]: c.name }), {});
          }
        }

        // Get subject titles separately
        let subjectTitles: Record<number, string> = {};
        if (subjectIds.length > 0) {
          const { data: subjects } = await supabase
            .from("za_demo_subject")
            .select("id, title")
            .in("id", subjectIds);
          if (subjects) {
            subjectTitles = subjects.reduce((acc, s) => ({ ...acc, [s.id]: s.title }), {});
          }
        }

        // Get total students across all assigned classes
        let totalStudents = 0;
        if (classIds.length > 0) {
          const { count } = await supabase
            .from("za_demo_student")
            .select("id", { count: "exact", head: true })
            .in("current_class", classIds)
            .eq("status", "active")
            .is("deleted_at", null);
          totalStudents = count || 0;
        }

        // Build assignments with names
        const enrichedAssignments = assignments.map(a => ({
          ...a,
          class_name: classNames[a.class_id] || "Unknown",
          subject_title: subjectTitles[a.subject_id] || "Unknown",
        }));

        return {
          id: teacher.id,
          name: `${teacher.first_name} ${teacher.last_name}`,
          email: teacher.email,
          total_classes: classIds.length,
          total_subjects: subjectIds.length,
          total_students: totalStudents,
          assignments: enrichedAssignments,
        };
      })
    );

    return { data: workload };
  } catch (err: any) {
    console.error("Error fetching teacher workload:", err);
    return { error: err.message };
  }
}