export const timetableMockData ={
  id: "TT-1001",

  class: {
    id: "CLS-SCI-01",
    name: "Science 1"
  },

  department: {
    id: "DEP-01",
    name: "Science"
  },

  course: {
    id: "CRS-01",
    name: "Mathematics",
    code: "MATH101"
  },

  teacher: {
    id: "STF-1001",
    fullName: "James Anderson"
  },

  day: "Monday", // Monday–Friday

  timeSlot: {
    id: "TS-01",
    label: "Period 1",
    startTime: "08:00",
    endTime: "09:00"
  },

  academicYear: "2025/2026",
  term: "First Term",

  room: "Room A1",

  createdAt: "2026-01-01"
}


export const timestableMockData = [

  // Monday
  {
    id: "TT-1001",
    class: { id: "CLS-SCI-01", name: "Science 1" },
    department: { id: "DEP-01", name: "Science" },
    course: { id: "CRS-01", name: "Mathematics", code: "MATH101" },
    teacher: { id: "STF-1001", fullName: "James Anderson" },
    day: "Monday",
    timeSlot: { id: "TS-01", label: "Period 1", startTime: "08:00", endTime: "09:00" },
    academicYear: "2025/2026",
    term: "First Term",
    room: "Room A1",
    createdAt: "2026-01-01"
  },

  {
    id: "TT-1002",
    class: { id: "CLS-SCI-01", name: "Science 1" },
    department: { id: "DEP-01", name: "Science" },
    course: { id: "CRS-02", name: "Physics", code: "PHY101" },
    teacher: { id: "STF-1010", fullName: "Helen Smith" },
    day: "Monday",
    timeSlot: { id: "TS-02", label: "Period 2", startTime: "09:00", endTime: "10:00" },
    academicYear: "2025/2026",
    term: "First Term",
    room: "Lab 1",
    createdAt: "2026-01-01"
  },

  // Tuesday
  {
    id: "TT-1003",
    class: { id: "CLS-SCI-01", name: "Science 1" },
    department: { id: "DEP-01", name: "Science" },
    course: { id: "CRS-03", name: "Chemistry", code: "CHEM101" },
    teacher: { id: "STF-1011", fullName: "Anthony Cole" },
    day: "Tuesday",
    timeSlot: { id: "TS-01", label: "Period 1", startTime: "08:00", endTime: "09:00" },
    academicYear: "2025/2026",
    term: "First Term",
    room: "Lab 2",
    createdAt: "2026-01-01"
  }

];



export const timeSlotMockData ={
  id: "TS-01",
  label: "Period 1",
  startTime: "08:00",
  endTime: "09:00",
  order: 1
}


export const timeSlotsMockData = [
  { id: "TS-01", label: "Period 1", startTime: "08:00", endTime: "09:00", order: 1 },
  { id: "TS-02", label: "Period 2", startTime: "09:00", endTime: "10:00", order: 2 },
  { id: "TS-03", label: "Period 3", startTime: "10:00", endTime: "11:00", order: 3 },
  { id: "TS-04", label: "Period 4", startTime: "11:00", endTime: "12:00", order: 4 },
  { id: "TS-05", label: "Period 5", startTime: "12:00", endTime: "13:00", order: 5 }
];
