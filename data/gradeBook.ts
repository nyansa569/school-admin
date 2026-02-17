export const gradeBook ={
  id: "GB-1001",

  student: {
    id: "STU-1001",
    fullName: "John Doe",
    admissionNumber: "ADM-2024-001"
  },

  course: {
    id: "CRS-01",
    name: "Mathematics",
    code: "MATH101"
  },

  class: {
    id: "CLS-SCI-01",
    name: "Science 1"
  },

  academicYear: "2025/2026",
  term: "First Term",

  scores: {
    continuousAssessment: 30,  // out of 40
    exam: 55,                  // out of 60
    total: 85                  // auto = CA + Exam
  },

  grading: {
    letter: "A",
    gradePoint: 4.0
  },

  remark: "Excellent performance",

  teacher: {
    id: "STF-1001",
    fullName: "James Anderson"
  },

  published: true,
  createdAt: "2026-03-30"
}



export const gradeBooksMockData = [

  {
    id: "GB-1001",
    student: {
      id: "STU-1001",
      fullName: "John Doe",
      admissionNumber: "ADM-2024-001"
    },
    course: {
      id: "CRS-01",
      name: "Mathematics",
      code: "MATH101"
    },
    class: {
      id: "CLS-SCI-01",
      name: "Science 1"
    },
    academicYear: "2025/2026",
    term: "First Term",
    scores: {
      continuousAssessment: 30,
      exam: 55,
      total: 85
    },
    grading: {
      letter: "A",
      gradePoint: 4.0
    },
    remark: "Excellent performance",
    teacher: {
      id: "STF-1001",
      fullName: "James Anderson"
    },
    published: true,
    createdAt: "2026-03-30"
  },

  {
    id: "GB-1002",
    student: {
      id: "STU-1001",
      fullName: "John Doe",
      admissionNumber: "ADM-2024-001"
    },
    course: {
      id: "CRS-02",
      name: "Physics",
      code: "PHY101"
    },
    class: {
      id: "CLS-SCI-01",
      name: "Science 1"
    },
    academicYear: "2025/2026",
    term: "First Term",
    scores: {
      continuousAssessment: 25,
      exam: 45,
      total: 70
    },
    grading: {
      letter: "A",
      gradePoint: 4.0
    },
    remark: "Very good understanding",
    teacher: {
      id: "STF-1010",
      fullName: "Helen Smith"
    },
    published: true,
    createdAt: "2026-03-30"
  },

  {
    id: "GB-1003",
    student: {
      id: "STU-1002",
      fullName: "Sarah Johnson",
      admissionNumber: "ADM-2024-002"
    },
    course: {
      id: "CRS-01",
      name: "Mathematics",
      code: "MATH101"
    },
    class: {
      id: "CLS-SCI-01",
      name: "Science 1"
    },
    academicYear: "2025/2026",
    term: "First Term",
    scores: {
      continuousAssessment: 20,
      exam: 40,
      total: 60
    },
    grading: {
      letter: "B",
      gradePoint: 3.0
    },
    remark: "Good effort",
    teacher: {
      id: "STF-1001",
      fullName: "James Anderson"
    },
    published: false,
    createdAt: "2026-03-30"
  }

];
