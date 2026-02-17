export const staffMockData = {
  id: "STF-1001",
  staffId: "EMP-2024-001",

  firstName: "James",
  lastName: "Anderson",
  fullName: "James Anderson",
  gender: "Male",
  dateOfBirth: "1985-04-12",

  role: "Teacher", 
  department: "Academics",

  employment: {
    type: "Full-Time", // Full-Time | Part-Time | Contract
    status: "Active",  // Active | On Leave | Suspended | Resigned
    hireDate: "2020-09-01",
    salary: 250000
  },

  contact: {
    email: "james.anderson@school.com",
    phone: "08011112222",
    address: "Lekki, Lagos"
  },

  assignedClasses: [
    { id: "CLS-01", name: "SS2", section: "A" },
    { id: "CLS-02", name: "SS1", section: "B" }
  ],

  assignedCourses: [
    { id: "CRS-01", name: "Mathematics", code: "MATH101" },
    { id: "CRS-05", name: "Further Mathematics", code: "FMTH201" }
  ],

  mainClass: { id: "CLS-01", name: "SS2", section: "A" },
  mainCourse: { id: "CRS-01", name: "Mathematics", code: "MATH101" },

  workload: {
    weeklyHours: 18,
    classesCount: 2,
    coursesCount: 2
  },

  performance: {
    rating: 4.5,
    reviews: 24
  },

  createdAt: "2020-09-01"
}



export const staffsMockData = [

  // 1️⃣ Teacher
  {
    id: "STF-1001",
    staffId: "EMP-2024-001",
    firstName: "James",
    lastName: "Anderson",
    fullName: "James Anderson",
    gender: "Male",
    dateOfBirth: "1985-04-12",
    role: "Teacher",
    department: "Academics",
    employment: {
      type: "Full-Time",
      status: "Active",
      hireDate: "2020-09-01",
      salary: 250000
    },
    contact: {
      email: "james.anderson@school.com",
      phone: "08011112222",
      address: "Lekki, Lagos"
    },
    assignedClasses: [
      { id: "CLS-01", name: "SS2", section: "A" },
      { id: "CLS-02", name: "SS1", section: "B" }
    ],
    assignedCourses: [
      { id: "CRS-01", name: "Mathematics", code: "MATH101" },
      { id: "CRS-05", name: "Further Mathematics", code: "FMTH201" }
    ],
    mainClass: { id: "CLS-01", name: "SS2", section: "A" },
    mainCourse: { id: "CRS-01", name: "Mathematics", code: "MATH101" },
    workload: { weeklyHours: 18, classesCount: 2, coursesCount: 2 },
    performance: { rating: 4.5, reviews: 24 },
    createdAt: "2020-09-01"
  },

  // 2️⃣ Admin
  {
    id: "STF-1002",
    staffId: "EMP-2024-002",
    firstName: "Grace",
    lastName: "Williams",
    fullName: "Grace Williams",
    gender: "Female",
    dateOfBirth: "1980-07-21",
    role: "Admin",
    department: "Administration",
    employment: {
      type: "Full-Time",
      status: "Active",
      hireDate: "2018-03-15",
      salary: 300000
    },
    contact: {
      email: "grace.williams@school.com",
      phone: "08022223333",
      address: "Victoria Island, Lagos"
    },
    assignedClasses: [],
    assignedCourses: [],
    mainClass: null,
    mainCourse: null,
    workload: { weeklyHours: 40, classesCount: 0, coursesCount: 0 },
    performance: { rating: 4.8, reviews: 40 },
    createdAt: "2018-03-15"
  },

  // 3️⃣ Finance Officer
  {
    id: "STF-1003",
    staffId: "EMP-2024-003",
    firstName: "Daniel",
    lastName: "Okafor",
    fullName: "Daniel Okafor",
    gender: "Male",
    dateOfBirth: "1987-11-10",
    role: "Finance",
    department: "Finance",
    employment: {
      type: "Full-Time",
      status: "Active",
      hireDate: "2019-06-01",
      salary: 280000
    },
    contact: {
      email: "daniel.okafor@school.com",
      phone: "08033334444",
      address: "Ikeja, Lagos"
    },
    assignedClasses: [],
    assignedCourses: [],
    mainClass: null,
    mainCourse: null,
    workload: { weeklyHours: 40, classesCount: 0, coursesCount: 0 },
    performance: { rating: 4.2, reviews: 18 },
    createdAt: "2019-06-01"
  },

  // 4️⃣ Asset Manager
  {
    id: "STF-1004",
    staffId: "EMP-2024-004",
    firstName: "Linda",
    lastName: "Bassey",
    fullName: "Linda Bassey",
    gender: "Female",
    dateOfBirth: "1989-02-14",
    role: "Asset Manager",
    department: "Operations",
    employment: {
      type: "Full-Time",
      status: "Active",
      hireDate: "2021-01-10",
      salary: 220000
    },
    contact: {
      email: "linda.bassey@school.com",
      phone: "08044445555",
      address: "Surulere, Lagos"
    },
    assignedClasses: [],
    assignedCourses: [],
    mainClass: null,
    mainCourse: null,
    workload: { weeklyHours: 40, classesCount: 0, coursesCount: 0 },
    performance: { rating: 4.0, reviews: 12 },
    createdAt: "2021-01-10"
  },

  // 5️⃣ Non Teaching Staff
  {
    id: "STF-1005",
    staffId: "EMP-2024-005",
    firstName: "Samuel",
    lastName: "Adebayo",
    fullName: "Samuel Adebayo",
    gender: "Male",
    dateOfBirth: "1990-09-09",
    role: "Non Teaching Staff",
    department: "Maintenance",
    employment: {
      type: "Contract",
      status: "Active",
      hireDate: "2022-05-20",
      salary: 120000
    },
    contact: {
      email: "samuel.adebayo@school.com",
      phone: "08055556666",
      address: "Yaba, Lagos"
    },
    assignedClasses: [],
    assignedCourses: [],
    mainClass: null,
    mainCourse: null,
    workload: { weeklyHours: 45, classesCount: 0, coursesCount: 0 },
    performance: { rating: 3.9, reviews: 5 },
    createdAt: "2022-05-20"
  }

];
