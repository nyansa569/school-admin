// app/(parent)/data.ts
import { Child } from "./types";
import { FeeItem, PaymentHistory, FeeSummary, PaymentHistory as PaymentHistoryType } from "./types";
import { StudentResults, GradeScale } from "./types";
import { ParentProfile, ChildSummary, NotificationPreference } from "./types";
import { AttendanceRecord, AttendanceSummary, MonthlyAttendance, SubjectAttendance } from "./types";


export const dummyChildren: Child[] = [
  {
    id: 1,
    student_number: "2024/00001",
    first_name: "Michael",
    last_name: "Appiah",
    other_names: "Kwame",
    gender: "male",
    date_of_birth: "2018-03-15",
    admission_number: "ADM-2024-0001",
    current_class_id: 5,
    status: "active",
    class: {
      id: 5,
      name: "Kindergarten 2",
      level: "preschool"
    },
    guardian: {
      first_name: "John",
      last_name: "Appiah",
      relationship: "Father",
      phone: "+233 24 123 4567",
      email: "john.appiah@example.com"
    }
  },
  {
    id: 2,
    student_number: "2024/00002",
    first_name: "Adwoa",
    last_name: "Mensah",
    other_names: "Esi",
    gender: "female",
    date_of_birth: "2013-08-22",
    admission_number: "ADM-2024-0002",
    current_class_id: 12,
    status: "active", 
    class: {
      id: 12,
      name: "Primary 5",
      level: "primary"
    },
    guardian: {
      first_name: "John",
      last_name: "Appiah",
      relationship: "Father",
      phone: "+233 24 123 4567",
      email: "john.appiah@example.com"
    }
  },
  {
    id: 3,
    student_number: "2024/00003",
    first_name: "Abena",
    last_name: "Owusu",
    other_names: "Serwaa",
    gender: "female",
    date_of_birth: "2010-11-30",
    admission_number: "ADM-2024-0003",
    current_class_id: 18,
    status: "active",
    class: {
      id: 18,
      name: "JHS 2",
      level: "junior"
    },
    guardian: {
      first_name: "John",
      last_name: "Appiah",
      relationship: "Father",
      phone: "+233 24 123 4567",
      email: "john.appiah@example.com"
    }
  }
];





export const dummyFeeItems: FeeItem[] = [
  {
    id: 1,
    fee_type: "Tuition Fee",
    fee_type_code: "TUITION",
    term: "Term 1",
    academic_year: "2024-2025",
    original_amount: 1500,
    discounted_amount: null,
    paid_amount: 1500,
    balance: 0,
    due_date: "2024-03-15",
    status: "paid",
    is_arrears: false,
    arrears_reason: null,
  },
  {
    id: 2,
    fee_type: "Tuition Fee",
    fee_type_code: "TUITION",
    term: "Term 2",
    academic_year: "2024-2025",
    original_amount: 1500,
    discounted_amount: 1350,
    paid_amount: 1000,
    balance: 350,
    due_date: "2024-07-15",
    status: "partial",
    is_arrears: false,
    arrears_reason: null,
  },
  {
    id: 3,
    fee_type: "Tuition Fee",
    fee_type_code: "TUITION",
    term: "Term 3",
    academic_year: "2024-2025",
    original_amount: 1500,
    discounted_amount: null,
    paid_amount: 0,
    balance: 1500,
    due_date: "2024-11-15",
    status: "pending",
    is_arrears: false,
    arrears_reason: null,
  },
  {
    id: 4,
    fee_type: "Transport Fee",
    fee_type_code: "TRANSPORT",
    term: "Term 1",
    academic_year: "2024-2025",
    original_amount: 500,
    discounted_amount: null,
    paid_amount: 500,
    balance: 0,
    due_date: "2024-03-15",
    status: "paid",
    is_arrears: false,
    arrears_reason: null,
  },
  {
    id: 5,
    fee_type: "Transport Fee",
    fee_type_code: "TRANSPORT",
    term: "Term 2",
    academic_year: "2024-2025",
    original_amount: 500,
    discounted_amount: null,
    paid_amount: 0,
    balance: 500,
    due_date: "2024-07-15",
    status: "overdue",
    is_arrears: true,
    arrears_reason: "Payment delayed - parent notified",
  },
  {
    id: 6,
    fee_type: "Library Fee",
    fee_type_code: "LIBRARY",
    term: "Term 1",
    academic_year: "2024-2025",
    original_amount: 200,
    discounted_amount: null,
    paid_amount: 200,
    balance: 0,
    due_date: "2024-03-15",
    status: "paid",
    is_arrears: false,
    arrears_reason: null,
  },
  {
    id: 7,
    fee_type: "Library Fee",
    fee_type_code: "LIBRARY",
    term: "Term 2",
    academic_year: "2024-2025",
    original_amount: 200,
    discounted_amount: 180,
    paid_amount: 180,
    balance: 0,
    due_date: "2024-07-15",
    status: "paid",
    is_arrears: false,
    arrears_reason: null,
  },
  {
    id: 8,
    fee_type: "Sports Fee",
    fee_type_code: "SPORTS",
    term: "Term 1",
    academic_year: "2024-2025",
    original_amount: 300,
    discounted_amount: null,
    paid_amount: 300,
    balance: 0,
    due_date: "2024-03-15",
    status: "paid",
    is_arrears: false,
    arrears_reason: null,
  },
  {
    id: 9,
    fee_type: "Sports Fee",
    fee_type_code: "SPORTS",
    term: "Term 2",
    academic_year: "2024-2025",
    original_amount: 300,
    discounted_amount: 300,
    paid_amount: 300,
    balance: 0,
    due_date: "2024-07-15",
    status: "paid",
    is_arrears: false,
    arrears_reason: null,
  },
];



export const dummyFeeSummary: FeeSummary = {
  total_expected: 5500,
  total_paid: 4280,
  total_balance: 1220,
  total_arrears: 500,
  items_count: 9,
  paid_count: 6,
  pending_count: 1,
  partial_count: 1,
  overdue_count: 1,
};



export const feeItemsChild1: FeeItem[] = [
  {
    id: 1,
    fee_type: "Tuition Fee",
    fee_type_code: "TUITION",
    term: "Term 1",
    academic_year: "2024-2025",
    original_amount: 1000,
    discounted_amount: null,
    paid_amount: 1000,
    balance: 0,
    due_date: "2024-03-15",
    status: "paid",
    is_arrears: false,
    arrears_reason: null,
  },
  {
    id: 2,
    fee_type: "Tuition Fee",
    fee_type_code: "TUITION",
    term: "Term 2",
    academic_year: "2024-2025",
    original_amount: 1000,
    discounted_amount: null,
    paid_amount: 500,
    balance: 500,
    due_date: "2024-07-15",
    status: "partial",
    is_arrears: false,
    arrears_reason: null,
  },
  {
    id: 3,
    fee_type: "Tuition Fee",
    fee_type_code: "TUITION",
    term: "Term 3",
    academic_year: "2024-2025",
    original_amount: 1000,
    discounted_amount: null,
    paid_amount: 0,
    balance: 1000,
    due_date: "2024-11-15",
    status: "pending",
    is_arrears: false,
    arrears_reason: null,
  },
  {
    id: 4,
    fee_type: "Activity Fee",
    fee_type_code: "ACTIVITY",
    term: "Term 1",
    academic_year: "2024-2025",
    original_amount: 200,
    discounted_amount: null,
    paid_amount: 200,
    balance: 0,
    due_date: "2024-03-15",
    status: "paid",
    is_arrears: false,
    arrears_reason: null,
  },
];

// Fee data for Child 2 - Primary 5
export const feeItemsChild2: FeeItem[] = [
  {
    id: 1,
    fee_type: "Tuition Fee",
    fee_type_code: "TUITION",
    term: "Term 1",
    academic_year: "2024-2025",
    original_amount: 1500,
    discounted_amount: null,
    paid_amount: 1500,
    balance: 0,
    due_date: "2024-03-15",
    status: "paid",
    is_arrears: false,
    arrears_reason: null,
  },
  {
    id: 2,
    fee_type: "Tuition Fee",
    fee_type_code: "TUITION",
    term: "Term 2",
    academic_year: "2024-2025",
    original_amount: 1500,
    discounted_amount: 1350,
    paid_amount: 800,
    balance: 550,
    due_date: "2024-07-15",
    status: "partial",
    is_arrears: false,
    arrears_reason: null,
  },
  {
    id: 3,
    fee_type: "Tuition Fee",
    fee_type_code: "TUITION",
    term: "Term 3",
    academic_year: "2024-2025",
    original_amount: 1500,
    discounted_amount: null,
    paid_amount: 0,
    balance: 1500,
    due_date: "2024-11-15",
    status: "pending",
    is_arrears: false,
    arrears_reason: null,
  },
  {
    id: 4,
    fee_type: "Transport Fee",
    fee_type_code: "TRANSPORT",
    term: "Term 1",
    academic_year: "2024-2025",
    original_amount: 500,
    discounted_amount: null,
    paid_amount: 500,
    balance: 0,
    due_date: "2024-03-15",
    status: "paid",
    is_arrears: false,
    arrears_reason: null,
  },
  {
    id: 5,
    fee_type: "Transport Fee",
    fee_type_code: "TRANSPORT",
    term: "Term 2",
    academic_year: "2024-2025",
    original_amount: 500,
    discounted_amount: null,
    paid_amount: 0,
    balance: 500,
    due_date: "2024-07-15",
    status: "overdue",
    is_arrears: true,
    arrears_reason: "Payment delayed - parent notified",
  },
  {
    id: 6,
    fee_type: "Library Fee",
    fee_type_code: "LIBRARY",
    term: "Term 1",
    academic_year: "2024-2025",
    original_amount: 200,
    discounted_amount: null,
    paid_amount: 200,
    balance: 0,
    due_date: "2024-03-15",
    status: "paid",
    is_arrears: false,
    arrears_reason: null,
  },
];

// Fee data for Child 3 - JHS 2
export const feeItemsChild3: FeeItem[] = [
  {
    id: 1,
    fee_type: "Tuition Fee",
    fee_type_code: "TUITION",
    term: "Term 1",
    academic_year: "2024-2025",
    original_amount: 2000,
    discounted_amount: null,
    paid_amount: 2000,
    balance: 0,
    due_date: "2024-03-15",
    status: "paid",
    is_arrears: false,
    arrears_reason: null,
  },
  {
    id: 2,
    fee_type: "Tuition Fee",
    fee_type_code: "TUITION",
    term: "Term 2",
    academic_year: "2024-2025",
    original_amount: 2000,
    discounted_amount: 1800,
    paid_amount: 1000,
    balance: 800,
    due_date: "2024-07-15",
    status: "partial",
    is_arrears: false,
    arrears_reason: null,
  },
  {
    id: 3,
    fee_type: "Tuition Fee",
    fee_type_code: "TUITION",
    term: "Term 3",
    academic_year: "2024-2025",
    original_amount: 2000,
    discounted_amount: null,
    paid_amount: 0,
    balance: 2000,
    due_date: "2024-11-15",
    status: "pending",
    is_arrears: false,
    arrears_reason: null,
  },
  {
    id: 4,
    fee_type: "Science Lab Fee",
    fee_type_code: "LAB",
    term: "Term 1",
    academic_year: "2024-2025",
    original_amount: 300,
    discounted_amount: null,
    paid_amount: 300,
    balance: 0,
    due_date: "2024-03-15",
    status: "paid",
    is_arrears: false,
    arrears_reason: null,
  },
  {
    id: 5,
    fee_type: "Science Lab Fee",
    fee_type_code: "LAB",
    term: "Term 2",
    academic_year: "2024-2025",
    original_amount: 300,
    discounted_amount: null,
    paid_amount: 0,
    balance: 300,
    due_date: "2024-07-15",
    status: "overdue",
    is_arrears: true,
    arrears_reason: "Payment delayed",
  },
  {
    id: 6,
    fee_type: "Examination Fee",
    fee_type_code: "EXAM",
    term: "Term 1",
    academic_year: "2024-2025",
    original_amount: 250,
    discounted_amount: null,
    paid_amount: 250,
    balance: 0,
    due_date: "2024-03-15",
    status: "paid",
    is_arrears: false,
    arrears_reason: null,
  },
  {
    id: 7,
    fee_type: "Examination Fee",
    fee_type_code: "EXAM",
    term: "Term 2",
    academic_year: "2024-2025",
    original_amount: 250,
    discounted_amount: 250,
    paid_amount: 250,
    balance: 0,
    due_date: "2024-07-15",
    status: "paid",
    is_arrears: false,
    arrears_reason: null,
  },
];

// Combined payment history
export const dummyPaymentHistory: PaymentHistory[] = [
  {
    id: 1,
    amount: 2000,
    payment_date: "2024-01-10",
    payment_method: "Mobile Money",
    receipt_number: "RCP-1704873600000-1",
    payment_reference: "MTN-123456789",
    notes: null,
    fee_type: "Tuition Fee",
    term: "Term 1",
    academic_year: "2024-2025",
  },
  {
    id: 2,
    amount: 500,
    payment_date: "2024-01-10",
    payment_method: "Cash",
    receipt_number: "RCP-1704873600000-1",
    payment_reference: null,
    notes: null,
    fee_type: "Transport Fee",
    term: "Term 1",
    academic_year: "2024-2025",
  },
  {
    id: 3,
    amount: 300,
    payment_date: "2024-01-10",
    payment_method: "Bank Transfer",
    receipt_number: "RCP-1704873600000-1",
    payment_reference: "TRF-123456789",
    notes: null,
    fee_type: "Science Lab Fee",
    term: "Term 1",
    academic_year: "2024-2025",
  },
  {
    id: 4,
    amount: 1000,
    payment_date: "2024-05-20",
    payment_method: "Mobile Money",
    receipt_number: "RCP-1716192000000-1",
    payment_reference: "MTN-987654321",
    notes: "Partial payment",
    fee_type: "Tuition Fee",
    term: "Term 2",
    academic_year: "2024-2025",
  },
];

// Summary for each child
export const feeSummaryChild1: FeeSummary = {
  total_expected: 3000,
  total_paid: 1700,
  total_balance: 1300,
  total_arrears: 0,
  items_count: 4,
  paid_count: 2,
  pending_count: 1,
  partial_count: 1,
  overdue_count: 0,
};

export const feeSummaryChild2: FeeSummary = {
  total_expected: 5700,
  total_paid: 3000,
  total_balance: 2700,
  total_arrears: 500,
  items_count: 6,
  paid_count: 3,
  pending_count: 1,
  partial_count: 1,
  overdue_count: 1,
};

export const feeSummaryChild3: FeeSummary = {
  total_expected: 7100,
  total_paid: 3800,
  total_balance: 3300,
  total_arrears: 300,
  items_count: 7,
  paid_count: 4,
  pending_count: 1,
  partial_count: 1,
  overdue_count: 1,
};

export const feeDataByChild: Record<number, { feeItems: FeeItem[]; paymentHistory: PaymentHistoryType[]; summary: FeeSummary }> = {
  1: { feeItems: feeItemsChild1, paymentHistory: dummyPaymentHistory, summary: feeSummaryChild1 },
  2: { feeItems: feeItemsChild2, paymentHistory: dummyPaymentHistory, summary: feeSummaryChild2 },
  3: { feeItems: feeItemsChild3, paymentHistory: dummyPaymentHistory, summary: feeSummaryChild3 },
};






// app/parent/results/data.ts

export const gradeScale: GradeScale[] = [
  { min_score: 80, max_score: 100, grade: "A", grade_point: 1, remarks: "Excellent" },
  { min_score: 70, max_score: 79, grade: "B", grade_point: 2, remarks: "Good" },
  { min_score: 60, max_score: 69, grade: "C", grade_point: 3, remarks: "Credit" },
  { min_score: 50, max_score: 59, grade: "D", grade_point: 4, remarks: "Pass" },
  { min_score: 40, max_score: 49, grade: "E", grade_point: 5, remarks: "Weak Pass" },
  { min_score: 0, max_score: 39, grade: "F", grade_point: 6, remarks: "Fail" },
];

export const dummyStudentResults: StudentResults = {
  student_id: 3,
  student_name: "Abena Owusu",
  student_class: "JHS 2",
  student_class_id: 18,
  student_admission_number: "ADM-2024-0003",
  terms: [
    {
      term_id: 1,
      term_name: "Term 1",
      term_number: 1,
      academic_year: "2024-2025",
      academic_year_id: 1,
      subjects: [
        {
          id: 1,
          subject_id: 1,
          subject_name: "Mathematics",
          subject_code: "MATH",
          class_score: 78,
          exam_score: 72,
          total_score: 75,
          grade: "B",
          grade_point: 2,
          remarks: "Good",
          is_mandatory: true,
        },
        {
          id: 2,
          subject_id: 2,
          subject_name: "English Language",
          subject_code: "ENG",
          class_score: 75,
          exam_score: 70,
          total_score: 72.5,
          grade: "B",
          grade_point: 2,
          remarks: "Good",
          is_mandatory: true,
        },
        {
          id: 3,
          subject_id: 3,
          subject_name: "Science",
          subject_code: "SCI",
          class_score: 82,
          exam_score: 78,
          total_score: 80,
          grade: "A",
          grade_point: 1,
          remarks: "Excellent",
          is_mandatory: true,
        },
        {
          id: 4,
          subject_id: 4,
          subject_name: "Social Studies",
          subject_code: "SST",
          class_score: 70,
          exam_score: 68,
          total_score: 69,
          grade: "C",
          grade_point: 3,
          remarks: "Credit",
          is_mandatory: true,
        },
        {
          id: 5,
          subject_id: 5,
          subject_name: "Integrated Science",
          subject_code: "INTSCI",
          class_score: 85,
          exam_score: 80,
          total_score: 82.5,
          grade: "A",
          grade_point: 1,
          remarks: "Excellent",
          is_mandatory: true,
        },
        {
          id: 6,
          subject_id: 6,
          subject_name: "French",
          subject_code: "FREN",
          class_score: 65,
          exam_score: 60,
          total_score: 62.5,
          grade: "C",
          grade_point: 3,
          remarks: "Credit",
          is_mandatory: false,
        },
      ],
    },
    {
      term_id: 2,
      term_name: "Term 2",
      term_number: 2,
      academic_year: "2024-2025",
      academic_year_id: 1,
      subjects: [
        {
          id: 7,
          subject_id: 1,
          subject_name: "Mathematics",
          subject_code: "MATH",
          class_score: 65,
          exam_score: 60,
          total_score: 62.5,
          grade: "C",
          grade_point: 3,
          remarks: "Credit",
          is_mandatory: true,
        },
        {
          id: 8,
          subject_id: 2,
          subject_name: "English Language",
          subject_code: "ENG",
          class_score: 80,
          exam_score: 75,
          total_score: 77.5,
          grade: "B",
          grade_point: 2,
          remarks: "Good",
          is_mandatory: true,
        },
        {
          id: 9,
          subject_id: 3,
          subject_name: "Science",
          subject_code: "SCI",
          class_score: 70,
          exam_score: 65,
          total_score: 67.5,
          grade: "C",
          grade_point: 3,
          remarks: "Credit",
          is_mandatory: true,
        },
        {
          id: 10,
          subject_id: 4,
          subject_name: "Social Studies",
          subject_code: "SST",
          class_score: 68,
          exam_score: 72,
          total_score: 70,
          grade: "B",
          grade_point: 2,
          remarks: "Good",
          is_mandatory: true,
        },
        {
          id: 11,
          subject_id: 5,
          subject_name: "Integrated Science",
          subject_code: "INTSCI",
          class_score: 75,
          exam_score: 70,
          total_score: 72.5,
          grade: "B",
          grade_point: 2,
          remarks: "Good",
          is_mandatory: true,
        },
        {
          id: 12,
          subject_id: 6,
          subject_name: "French",
          subject_code: "FREN",
          class_score: 55,
          exam_score: 50,
          total_score: 52.5,
          grade: "D",
          grade_point: 4,
          remarks: "Pass",
          is_mandatory: false,
        },
      ],
    },
  ],
  overall_performance: [
    {
      term_id: 1,
      term_name: "Term 1",
      average_score: 73.5,
      aggregate_grade: "B",
      aggregate_grade_point: 2.17,
      total_subjects: 6,
      subjects_passed: 6,
      subjects_failed: 0,
      position: "3rd",
      class_teacher_remarks: "Excellent performance. Keep up the good work!",
    },
    {
      term_id: 2,
      term_name: "Term 2",
      average_score: 67.5,
      aggregate_grade: "C",
      aggregate_grade_point: 2.67,
      total_subjects: 6,
      subjects_passed: 6,
      subjects_failed: 0,
      position: "5th",
      class_teacher_remarks: "Good effort. Focus more on Mathematics.",
    },
  ],
};



// app/parent/attendance/data.ts

// Generate dates for Term 1 (Jan - Apr 2024)
const generateTerm1Dates = () => {
  const dates = [];
  const startDate = new Date(2024, 0, 15); // Jan 15, 2024
  const endDate = new Date(2024, 3, 5); // Apr 5, 2024
  
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    if (d.getDay() !== 0 && d.getDay() !== 6) { // Exclude weekends
      dates.push(new Date(d));
    }
  }
  return dates;
};

// Generate dates for Term 2 (May - Aug 2024)
const generateTerm2Dates = () => {
  const dates = [];
  const startDate = new Date(2024, 4, 10); // May 10, 2024
  const endDate = new Date(2024, 7, 2); // Aug 2, 2024
  
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    if (d.getDay() !== 0 && d.getDay() !== 6) {
      dates.push(new Date(d));
    }
  }
  return dates;
};

// Generate random attendance status
const getRandomStatus = (date: Date, studentId: number): "present" | "absent" | "late" | "excused" => {
  // Use date and studentId to create deterministic but varied results
  const seed = date.getTime() + studentId;
  const random = Math.sin(seed) * 10000;
  const value = random - Math.floor(random);
  
  if (value < 0.85) return "present";
  if (value < 0.92) return "late";
  if (value < 0.96) return "excused";
  return "absent";
};

// Generate attendance records for a student
const generateAttendanceRecords = (studentId: number, termId: number, termName: string, academicYear: string): AttendanceRecord[] => {
  const dates = termId === 1 ? generateTerm1Dates() : generateTerm2Dates();
  
  return dates.map((date, index) => {
    const status = getRandomStatus(date, studentId);
    const checkInTime = status === "present" || status === "late" 
      ? `${7 + Math.floor(Math.random() * 2)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')} AM`
      : null;
    const checkOutTime = checkInTime ? `${14 + Math.floor(Math.random() * 2)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')} PM` : null;
    
    return {
      id: index + 1,
      date: date.toISOString().split('T')[0],
      status,
      check_in_time: checkInTime,
      check_out_time: checkOutTime,
      subject: null,
      term: termName,
      academic_year: academicYear,
      remarks: status === "absent" ? "Unexcused absence" : status === "late" ? "Arrived after 8:00 AM" : null,
    };
  });
};

// Subject attendance data
const subjectAttendanceData: Record<number, SubjectAttendance[]> = {
  1: [ // Kindergarten 2
    { subject: "Literacy", total_classes: 45, present: 42, absent: 1, late: 2, rate: 93.3 },
    { subject: "Numeracy", total_classes: 45, present: 43, absent: 0, late: 2, rate: 95.6 },
    { subject: "Creative Arts", total_classes: 30, present: 29, absent: 0, late: 1, rate: 96.7 },
    { subject: "Environmental Studies", total_classes: 30, present: 28, absent: 1, late: 1, rate: 93.3 },
  ],
  2: [ // Primary 5
    { subject: "Mathematics", total_classes: 60, present: 52, absent: 3, late: 5, rate: 86.7 },
    { subject: "English Language", total_classes: 60, present: 55, absent: 2, late: 3, rate: 91.7 },
    { subject: "Science", total_classes: 50, present: 46, absent: 2, late: 2, rate: 92.0 },
    { subject: "Social Studies", total_classes: 40, present: 37, absent: 1, late: 2, rate: 92.5 },
    { subject: "Integrated Science", total_classes: 50, present: 45, absent: 3, late: 2, rate: 90.0 },
    { subject: "French", total_classes: 35, present: 30, absent: 2, late: 3, rate: 85.7 },
  ],
  3: [ // JHS 2
    { subject: "Mathematics", total_classes: 65, present: 58, absent: 3, late: 4, rate: 89.2 },
    { subject: "English Language", total_classes: 65, present: 60, absent: 2, late: 3, rate: 92.3 },
    { subject: "Science", total_classes: 55, present: 50, absent: 2, late: 3, rate: 90.9 },
    { subject: "Social Studies", total_classes: 45, present: 41, absent: 2, late: 2, rate: 91.1 },
    { subject: "Integrated Science", total_classes: 55, present: 49, absent: 3, late: 3, rate: 89.1 },
    { subject: "French", total_classes: 40, present: 34, absent: 3, late: 3, rate: 85.0 },
  ],
};

// Calculate summary from records
const calculateSummary = (records: AttendanceRecord[]): AttendanceSummary => {
  const present = records.filter(r => r.status === "present").length;
  const absent = records.filter(r => r.status === "absent").length;
  const late = records.filter(r => r.status === "late").length;
  const excused = records.filter(r => r.status === "excused").length;
  const total = records.length;
  
  let consecutiveAbsences = 0;
  let currentStreak = 0;
  for (const record of records) {
    if (record.status === "absent") {
      currentStreak++;
      consecutiveAbsences = Math.max(consecutiveAbsences, currentStreak);
    } else {
      currentStreak = 0;
    }
  }
  
  return {
    total_days: total,
    present_days: present,
    absent_days: absent,
    late_days: late,
    excused_days: excused,
    attendance_rate: total > 0 ? (present / total) * 100 : 0,
    consecutive_absences: consecutiveAbsences,
    late_count: late,
  };
};

// Calculate monthly attendance
const calculateMonthlyAttendance = (records: AttendanceRecord[]): MonthlyAttendance[] => {
  const monthlyMap = new Map<string, { present: number; absent: number; late: number; excused: number; total: number }>();
  
  records.forEach(record => {
    const date = new Date(record.date);
    const monthName = date.toLocaleString('default', { month: 'long' });
    const monthNumber = date.getMonth() + 1;
    const key = `${monthNumber}-${monthName}`;
    
    if (!monthlyMap.has(key)) {
      monthlyMap.set(key, { present: 0, absent: 0, late: 0, excused: 0, total: 0 });
    }
    
    const monthData = monthlyMap.get(key)!;
    monthData.total++;
    monthData[record.status]++;
  });
  
  return Array.from(monthlyMap.entries())
    .map(([key, data]) => {
      const [monthNumber, monthName] = key.split('-');
      return {
        month: monthName,
        month_number: parseInt(monthNumber),
        present: data.present,
        absent: data.absent,
        late: data.late,
        excused: data.excused,
        total: data.total,
        rate: data.total > 0 ? (data.present / data.total) * 100 : 0,
      };
    })
    .sort((a, b) => a.month_number - b.month_number);
};

// Generate attendance data for each child
export const attendanceData: Record<number, { term1: AttendanceRecord[]; term2: AttendanceRecord[] }> = {
  1: { // Kindergarten 2 - Michael Appiah
    term1: generateAttendanceRecords(1, 1, "Term 1", "2024-2025"),
    term2: generateAttendanceRecords(1, 2, "Term 2", "2024-2025"),
  },
  2: { // Primary 5 - Adwoa Mensah
    term1: generateAttendanceRecords(2, 1, "Term 1", "2024-2025"),
    term2: generateAttendanceRecords(2, 2, "Term 2", "2024-2025"),
  },
  3: { // JHS 2 - Abena Owusu
    term1: generateAttendanceRecords(3, 1, "Term 1", "2024-2025"),
    term2: generateAttendanceRecords(3, 2, "Term 2", "2024-2025"),
  },
};

// Get summary for a child and term
export const getAttendanceSummary = (childId: number, termId: number): AttendanceSummary => {
  const records = termId === 1 
    ? attendanceData[childId]?.term1 || []
    : attendanceData[childId]?.term2 || [];
  return calculateSummary(records);
};

// Get monthly attendance for a child and term
export const getMonthlyAttendance = (childId: number, termId: number): MonthlyAttendance[] => {
  const records = termId === 1 
    ? attendanceData[childId]?.term1 || []
    : attendanceData[childId]?.term2 || [];
  return calculateMonthlyAttendance(records);
};

// Get subject attendance for a child
export const getSubjectAttendance = (childId: number): SubjectAttendance[] => {
  return subjectAttendanceData[childId] || [];
};






// app/parent/profile/data.ts

export const dummyParentProfile: ParentProfile = {
  id: 1,
  first_name: "John",
  last_name: "Appiah",
  email: "john.appiah@example.com",
  phone: "+233 24 123 4567",
  address: "123 Spintex Road",
  city: "Accra",
  town: "Spintex",
  occupation: "Business Executive",
  profile_picture: null,
  created_at: "2023-01-15T10:00:00Z",
};

export const dummyChildrenSummary: ChildSummary[] = dummyChildren.map(child => ({
  id: child.id,
  student_number: child.student_number,
  first_name: child.first_name,
  last_name: child.last_name,
  admission_number: child.admission_number,
  class: child.class!,
  status: child.status,
}));

export const dummyNotificationPreferences: NotificationPreference = {
  email_notifications: true,
  sms_notifications: true,
  fee_reminders: true,
  result_alerts: true,
  attendance_alerts: true,
  announcement_alerts: true,
};