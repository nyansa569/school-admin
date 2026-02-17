export const studentAssessmentsMockData = [

  {
    id: "SA-ASM-10001",
    assessment: {
      id: "ASM-1001",
      title: "Test 1",
      courseName: "Mathematics"
    },
    student: {
      id: "STU-1001",
      fullName: "John Doe",
      admissionNumber: "ADM-2024-001"
    },
    score: 18,
    percentage: 90,
    gradedBy: {
      id: "STF-1001",
      fullName: "James Anderson"
    },
    remark: "Very good",
    gradedAt: "2026-02-10",
    status: "Graded"
  },

  {
    id: "SA-ASM-10002",
    assessment: {
      id: "ASM-1001",
      title: "Test 1",
      courseName: "Mathematics"
    },
    student: {
      id: "STU-1002",
      fullName: "Sarah Johnson",
      admissionNumber: "ADM-2024-002"
    },
    score: 14,
    percentage: 70,
    gradedBy: {
      id: "STF-1001",
      fullName: "James Anderson"
    },
    remark: "Good",
    gradedAt: "2026-02-10",
    status: "Graded"
  }

];



export const studentsAssessmentMockData ={
  id: "SA-ASM-10001",

  assessment: {
    id: "ASM-1001",
    title: "Test 1",
    courseName: "Mathematics"
  },

  student: {
    id: "STU-1001",
    fullName: "John Doe",
    admissionNumber: "ADM-2024-001"
  },

  score: 18,
  percentage: 90,

  gradedBy: {
    id: "STF-1001",
    fullName: "James Anderson"
  },

  remark: "Very good",
  gradedAt: "2026-02-10",

  status: "Graded" // Pending | Graded
}
