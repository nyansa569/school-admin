export const admissionMockData ={
  id: "ADM-APP-1001",
  applicationNumber: "APP-2025-0001",

  applicant: {
    firstName: "Samuel",
    lastName: "Johnson",
    fullName: "Samuel Johnson",
    gender: "Male",
    dateOfBirth: "2010-03-12",
    age: 14
  },

  contact: {
    email: "samuel.johnson@email.com",
    phone: "08012345678",
    address: "Lekki, Lagos"
  },

  guardian: {
    name: "Grace Johnson",
    relationship: "Mother",
    phone: "08087654321",
    email: "grace.johnson@email.com"
  },

  previousSchool: {
    name: "Bright Future Academy",
    lastClass: "JSS3",
    averageScore: 75
  },

  applyingFor: {
    department: {
      id: "DEP-01",
      name: "Science"
    },
    class: {
      id: "CLS-SCI-01",
      name: "Science 1"
    },
    academicYear: "2025/2026"
  },

  admissionType: "Online", // Online | Walk-in | Transfer
  status: "Submitted", 
  reviewNotes: null,

  documents: {
    birthCertificate: true,
    previousResult: true,
    passportPhoto: true
  },

  payment: {
    applicationFee: 20000,
    paid: true,
    paymentReference: "PAY-123456"
  },

  timeline: {
    submittedAt: "2026-01-10",
    reviewedAt: null,
    approvedAt: null
  },

  createdAt: "2026-01-10"
}





export const admissionsMockData = [

  {
    id: "ADM-APP-1001",
    applicationNumber: "APP-2026-0001",
    applicant: {
      firstName: "Samuel",
      lastName: "Johnson",
      fullName: "Samuel Johnson",
      gender: "Male",
      dateOfBirth: "2010-03-12",
      age: 14
    },
    contact: {
      email: "samuel.johnson@email.com",
      phone: "08012345678",
      address: "Lekki, Lagos"
    },
    guardian: {
      name: "Grace Johnson",
      relationship: "Mother",
      phone: "08087654321",
      email: "grace.johnson@email.com"
    },
    previousSchool: {
      name: "Bright Future Academy",
      lastClass: "JSS3",
      averageScore: 75
    },
    applyingFor: {
      department: { id: "DEP-01", name: "Science" },
      class: { id: "CLS-SCI-01", name: "Science 1" },
      academicYear: "2025/2026"
    },
    admissionType: "Online",
    status: "Submitted",
    reviewNotes: null,
    documents: {
      birthCertificate: true,
      previousResult: true,
      passportPhoto: true
    },
    payment: {
      applicationFee: 20000,
      paid: true,
      paymentReference: "PAY-123456"
    },
    timeline: {
      submittedAt: "2026-01-10",
      reviewedAt: null,
      approvedAt: null
    },
    createdAt: "2026-01-10"
  },

  {
    id: "ADM-APP-1002",
    applicationNumber: "APP-2026-0002",
    applicant: {
      firstName: "Mary",
      lastName: "Okafor",
      fullName: "Mary Okafor",
      gender: "Female",
      dateOfBirth: "2009-08-21",
      age: 15
    },
    contact: {
      email: "mary.okafor@email.com",
      phone: "08098765432",
      address: "Ikeja, Lagos"
    },
    guardian: {
      name: "Daniel Okafor",
      relationship: "Father",
      phone: "08033334444",
      email: "daniel.okafor@email.com"
    },
    previousSchool: {
      name: "City College",
      lastClass: "SS1",
      averageScore: 82
    },
    applyingFor: {
      department: { id: "DEP-02", name: "Business" },
      class: { id: "CLS-BUS-02", name: "Business 2" },
      academicYear: "2025/2026"
    },
    admissionType: "Walk-in",
    status: "Under Review",
    reviewNotes: "Awaiting interview scheduling",
    documents: {
      birthCertificate: true,
      previousResult: true,
      passportPhoto: false
    },
    payment: {
      applicationFee: 20000,
      paid: false,
      paymentReference: null
    },
    timeline: {
      submittedAt: "2026-01-08",
      reviewedAt: "2026-01-09",
      approvedAt: null
    },
    createdAt: "2026-01-08"
  },

  {
    id: "ADM-APP-1003",
    applicationNumber: "APP-2026-0003",
    applicant: {
      firstName: "David",
      lastName: "Bello",
      fullName: "David Bello",
      gender: "Male",
      dateOfBirth: "2010-01-15",
      age: 14
    },
    contact: {
      email: "david.bello@email.com",
      phone: "08055556666",
      address: "Yaba, Lagos"
    },
    guardian: {
      name: "Hannah Bello",
      relationship: "Mother",
      phone: "08077778888",
      email: "hannah.bello@email.com"
    },
    previousSchool: {
      name: "Royal Scholars School",
      lastClass: "JSS3",
      averageScore: 68
    },
    applyingFor: {
      department: { id: "DEP-01", name: "Science" },
      class: { id: "CLS-SCI-02", name: "Science 2" },
      academicYear: "2025/2026"
    },
    admissionType: "Online",
    status: "Approved",
    reviewNotes: "Passed entrance exam",
    documents: {
      birthCertificate: true,
      previousResult: true,
      passportPhoto: true
    },
    payment: {
      applicationFee: 20000,
      paid: true,
      paymentReference: "PAY-789123"
    },
    timeline: {
      submittedAt: "2026-01-02",
      reviewedAt: "2026-01-04",
      approvedAt: "2026-01-06"
    },
    createdAt: "2026-01-02"
  }

];
