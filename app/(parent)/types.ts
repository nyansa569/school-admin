// app/(parent)/types.ts
export interface Child {
  id: number;
  student_number: string;
  first_name: string;
  last_name: string;
  other_names: string | null;
  gender: string;
  date_of_birth: string;
  admission_number: string;
  current_class_id: number | null;
  status: string;
  class?: {
    id: number;
    name: string;
    level: string;
  };
  guardian?: {
    first_name: string;
    last_name: string;
    relationship: string;
    phone: string;
    email: string;
  };
}



// app/parent/fees/types.ts
export interface FeeItem {
  id: number;
  fee_type: string;
  fee_type_code: string;
  term: string;
  academic_year: string;
  original_amount: number;
  discounted_amount: number | null;
  paid_amount: number;
  balance: number;
  due_date: string;
  status: "pending" | "partial" | "paid" | "overdue" | "waived";
  is_arrears: boolean;
  arrears_reason: string | null;
}

export interface FeeSummary {
  total_expected: number;
  total_paid: number;
  total_balance: number;
  total_arrears: number;
  items_count: number;
  paid_count: number;
  pending_count: number;
  partial_count: number;
  overdue_count: number;
}

export interface PaymentHistory {
  id: number;
  amount: number;
  payment_date: string;
  payment_method: string;
  receipt_number: string;
  payment_reference: string | null;
  notes: string | null;
  fee_type: string;
  term: string;
  academic_year: string;
}




// app/parent/results/types.ts

export interface SubjectResult {
  id: number;
  subject_id: number;
  subject_name: string;
  subject_code: string;
  class_score: number;
  exam_score: number;
  total_score: number;
  grade: string;
  grade_point: number;
  remarks: string;
  is_mandatory: boolean;
}

export interface TermResult {
  term_id: number;
  term_name: string;
  term_number: number;
  academic_year: string;
  academic_year_id: number;
  subjects: SubjectResult[];
}

export interface OverallResult {
  term_id: number;
  term_name: string;
  average_score: number;
  aggregate_grade: string;
  aggregate_grade_point: number;
  total_subjects: number;
  subjects_passed: number;
  subjects_failed: number;
  position: string;
  class_teacher_remarks: string;
}

export interface StudentResults {
  student_id: number;
  student_name: string;
  student_class: string;
  student_class_id: number;
  student_admission_number: string;
  terms: TermResult[];
  overall_performance: OverallResult[];
}

export interface GradeScale {
  min_score: number;
  max_score: number;
  grade: string;
  grade_point: number;
  remarks: string;
}



// app/parent/attendance/types.ts

export interface AttendanceRecord {
  id: number;
  date: string;
  status: "present" | "absent" | "late" | "excused";
  check_in_time: string | null;
  check_out_time: string | null;
  subject: string | null;
  term: string;
  academic_year: string;
  remarks: string | null;
}

export interface AttendanceSummary {
  total_days: number;
  present_days: number;
  absent_days: number;
  late_days: number;
  excused_days: number;
  attendance_rate: number;
  consecutive_absences: number;
  late_count: number;
}

export interface MonthlyAttendance {
  month: string;
  month_number: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  total: number;
  rate: number;
}

export interface SubjectAttendance {
  subject: string;
  total_classes: number;
  present: number;
  absent: number;
  late: number;
  rate: number;
}



// app/parent/profile/types.ts

export interface ParentProfile {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string | null;
  city: string | null;
  town: string | null;
  occupation: string | null;
  profile_picture: string | null;
  created_at: string;
}

export interface ChildSummary {
  id: number;
  student_number: string;
  first_name: string;
  last_name: string;
  admission_number: string;
  class: {
    id: number;
    name: string;
    level: string;
  };
  status: string;
}

export interface NotificationPreference {
  email_notifications: boolean;
  sms_notifications: boolean;
  fee_reminders: boolean;
  result_alerts: boolean;
  attendance_alerts: boolean;
  announcement_alerts: boolean;
}

export interface ChangePasswordData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}