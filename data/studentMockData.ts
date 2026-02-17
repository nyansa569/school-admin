export const studentMockData = {
  id: "STU-1001",
  admissionNumber: "ADM-2024-001",
  firstName: "John",
  lastName: "Doe",
  fullName: "John Doe",
  gender: "Male",
  dateOfBirth: "2008-05-12",
  age: 16,
  
  class: {
    id: "CLS-01",
    name: "SS2",
    section: "A"
  },

  guardian: {
    name: "Michael Doe",
    relationship: "Father",
    phone: "08012345678",
    email: "michael.doe@email.com"
  },

  contact: {
    email: "john.doe@studentmail.com",
    phone: "08098765432",
    address: "12 Palm Street, Lagos"
  },

  attendance: {
    totalDays: 120,
    present: 110,
    absent: 10,
    percentage: 91.6
  },

  performance: {
    averageScore: 78,
    grade: "B"
  },

  fees: {
    total: 150000,
    paid: 100000,
    balance: 50000,
    status: "Partial" // Paid | Partial | Unpaid
  },

  status: "Active", // Active | Graduated | Suspended | Transferred
  admissionDate: "2024-09-10",
  createdAt: "2024-09-10",
}


export const studentsMockData = [
  {
    id: "STU-1001",
    admissionNumber: "ADM-2024-001",
    firstName: "John",
    lastName: "Doe",
    fullName: "John Doe",
    gender: "Male",
    dateOfBirth: "2008-05-12",
    age: 16,
    class: { id: "CLS-01", name: "SS2", section: "A" },
    guardian: {
      name: "Michael Doe",
      relationship: "Father",
      phone: "08012345678",
      email: "michael.doe@email.com"
    },
    contact: {
      email: "john.doe@studentmail.com",
      phone: "08098765432",
      address: "12 Palm Street, Lagos"
    },
    attendance: {
      totalDays: 120,
      present: 110,
      absent: 10,
      percentage: 91.6
    },
    performance: {
      averageScore: 78,
      grade: "B"
    },
    fees: {
      total: 150000,
      paid: 100000,
      balance: 50000,
      status: "Partial"
    },
    status: "Active",
    admissionDate: "2024-09-10",
    createdAt: "2024-09-10"
  },

  {
    id: "STU-1002",
    admissionNumber: "ADM-2024-002",
    firstName: "Sarah",
    lastName: "Johnson",
    fullName: "Sarah Johnson",
    gender: "Female",
    dateOfBirth: "2009-03-18",
    age: 15,
    class: { id: "CLS-02", name: "SS1", section: "B" },
    guardian: {
      name: "Grace Johnson",
      relationship: "Mother",
      phone: "08023456789",
      email: "grace.johnson@email.com"
    },
    contact: {
      email: "sarah.johnson@studentmail.com",
      phone: "08087654321",
      address: "45 Banana Island, Lagos"
    },
    attendance: {
      totalDays: 120,
      present: 118,
      absent: 2,
      percentage: 98.3
    },
    performance: {
      averageScore: 92,
      grade: "A"
    },
    fees: {
      total: 150000,
      paid: 150000,
      balance: 0,
      status: "Paid"
    },
    status: "Active",
    admissionDate: "2024-09-10",
    createdAt: "2024-09-10"
  },

  {
    id: "STU-1003",
    admissionNumber: "ADM-2024-003",
    firstName: "David",
    lastName: "Olawale",
    fullName: "David Olawale",
    gender: "Male",
    dateOfBirth: "2007-11-02",
    age: 17,
    class: { id: "CLS-03", name: "SS3", section: "A" },
    guardian: {
      name: "Samuel Olawale",
      relationship: "Father",
      phone: "08034567890",
      email: "samuel.olawale@email.com"
    },
    contact: {
      email: "david.olawale@studentmail.com",
      phone: "08076543210",
      address: "Lekki Phase 1, Lagos"
    },
    attendance: {
      totalDays: 120,
      present: 100,
      absent: 20,
      percentage: 83.3
    },
    performance: {
      averageScore: 65,
      grade: "C"
    },
    fees: {
      total: 150000,
      paid: 50000,
      balance: 100000,
      status: "Partial"
    },
    status: "Active",
    admissionDate: "2023-09-12",
    createdAt: "2023-09-12"
  }
];




export const studentsaAttendanceData ={
  id: "SA-10001",

  courseAttendance: {
    id: "CA-1001",
    date: "2026-01-10",
    courseName: "Mathematics"
  },

  student: {
    id: "STU-1001",
    fullName: "John Doe",
    admissionNumber: "ADM-2024-001"
  },

  status: "Present", // Present | Absent | Late | Excused
  remark: null,

  markedAt: "2026-01-10T09:10:00"
}


export const studentsAttendancesMockData = [

  {
    id: "SA-10001",
    courseAttendance: {
      id: "CA-1001",
      date: "2026-01-10",
      courseName: "Mathematics"
    },
    student: {
      id: "STU-1001",
      fullName: "John Doe",
      admissionNumber: "ADM-2024-001"
    },
    status: "Present",
    remark: null,
    markedAt: "2026-01-10T09:05:00"
  },
  {
    id: "SA-10002",
    courseAttendance: {
      id: "CA-1001",
      date: "2026-01-10",
      courseName: "Mathematics"
    },
    student: {
      id: "STU-1002",
      fullName: "Sarah Johnson",
      admissionNumber: "ADM-2024-002"
    },
    status: "Late",
    remark: "Arrived 15 minutes late",
    markedAt: "2026-01-10T09:20:00"
  },

  {
    id: "SA-10003",
    courseAttendance: {
      id: "CA-1001",
      date: "2026-01-10",
      courseName: "Mathematics"
    },
    student: {
      id: "STU-1003",
      fullName: "David Olawale",
      admissionNumber: "ADM-2024-003"
    },
    status: "Absent",
    remark: "No show",
    markedAt: "2026-01-10T10:00:00"
  }

];





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
