export const courseAttendance ={
  id: "CA-1001",

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
    fullName: "James Anderson",
    staffId: "EMP-2024-001"
  },

  date: "2026-01-10",
  startTime: "09:00",
  endTime: "10:00",

  academicYear: "2025/2026",
  term: "First Term",

  totalStudents: 32,
  attendanceMarked: true,

  createdAt: "2026-01-10"
}



export const coursesAttendancesMockData = [

  {
    id: "CA-1001",
    course: { id: "CRS-01", name: "Mathematics", code: "MATH101" },
    class: { id: "CLS-SCI-01", name: "Science 1" },
    teacher: { id: "STF-1001", fullName: "James Anderson", staffId: "EMP-2024-001" },
    date: "2026-01-10",
    startTime: "09:00",
    endTime: "10:00",
    academicYear: "2025/2026",
    term: "First Term",
    totalStudents: 32,
    attendanceMarked: true,
    createdAt: "2026-01-10"
  },

  {
    id: "CA-1002",
    course: { id: "CRS-02", name: "Physics", code: "PHY101" },
    class: { id: "CLS-SCI-01", name: "Science 1" },
    teacher: { id: "STF-1010", fullName: "Helen Smith", staffId: "EMP-2024-010" },
    date: "2026-01-10",
    startTime: "11:00",
    endTime: "12:00",
    academicYear: "2025/2026",
    term: "First Term",
    totalStudents: 32,
    attendanceMarked: true,
    createdAt: "2026-01-10"
  }

];
