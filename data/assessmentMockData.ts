export const assessmentMockData ={
  id: "ASM-1001",

  title: "Test 1",
  type: "Test", // Assignment | Test | Quiz | Midterm | Exam | Practical

  course: {
    id: "CRS-01",
    name: "Mathematics",
    code: "MATH101"
  },

  class: {
    id: "CLS-SCI-01",
    name: "Science 1"
  },

  teacher: {
    id: "STF-1001",
    fullName: "James Anderson"
  },

  academicYear: "2025/2026",
  term: "First Term",

  maxScore: 20,
  weight: 10, // contributes 10% to final grade

  dateGiven: "2026-02-10",
  dueDate: "2026-02-10",

  published: true,
  createdAt: "2026-02-08"
}



export const assessmentsMockData = [

  {
    id: "ASM-1001",
    title: "Test 1",
    type: "Test",
    course: { id: "CRS-01", name: "Mathematics", code: "MATH101" },
    class: { id: "CLS-SCI-01", name: "Science 1" },
    teacher: { id: "STF-1001", fullName: "James Anderson" },
    academicYear: "2025/2026",
    term: "First Term",
    maxScore: 20,
    weight: 10,
    dateGiven: "2026-02-10",
    dueDate: "2026-02-10",
    published: true,
    createdAt: "2026-02-08"
  },

  {
    id: "ASM-1002",
    title: "Assignment 1",
    type: "Assignment",
    course: { id: "CRS-01", name: "Mathematics", code: "MATH101" },
    class: { id: "CLS-SCI-01", name: "Science 1" },
    teacher: { id: "STF-1001", fullName: "James Anderson" },
    academicYear: "2025/2026",
    term: "First Term",
    maxScore: 10,
    weight: 5,
    dateGiven: "2026-02-15",
    dueDate: "2026-02-18",
    published: true,
    createdAt: "2026-02-14"
  }

];
