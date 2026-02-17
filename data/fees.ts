export const feeStructuresMockData = [

  {
    id: "FS-1001",
    name: "First Term School Fees",
    department: { id: "DEP-01", name: "Science" },
    class: { id: "CLS-SCI-01", name: "Science 1" },
    academicYear: "2025/2026",
    term: "First Term",
    breakdown: [
      { label: "Tuition", amount: 100000 },
      { label: "Development Levy", amount: 30000 },
      { label: "ICT Fee", amount: 20000 }
    ],
    totalAmount: 150000,
    dueDate: "2026-02-01",
    createdAt: "2026-01-01"
  }

];



export const studentFeeRecordsMockData = [

  {
    id: "SFR-1001",
    student: {
      id: "STU-1001",
      fullName: "John Doe",
      admissionNumber: "ADM-2024-001"
    },
    feeStructure: {
      id: "FS-1001",
      name: "First Term School Fees"
    },
    academicYear: "2025/2026",
    term: "First Term",
    totalAmount: 150000,
    totalPaid: 100000,
    balance: 50000,
    status: "Partial",
    createdAt: "2026-01-05"
  },

  {
    id: "SFR-1002",
    student: {
      id: "STU-1002",
      fullName: "Sarah Johnson",
      admissionNumber: "ADM-2024-002"
    },
    feeStructure: {
      id: "FS-1001",
      name: "First Term School Fees"
    },
    academicYear: "2025/2026",
    term: "First Term",
    totalAmount: 150000,
    totalPaid: 150000,
    balance: 0,
    status: "Paid",
    createdAt: "2026-01-05"
  }

];



export const feePaymentsMockData = [

  {
    id: "PAY-10001",
    studentFeeRecord: { id: "SFR-1001" },
    student: { id: "STU-1001", fullName: "John Doe" },
    amountPaid: 50000,
    paymentMethod: "Transfer",
    paymentReference: "TRX-98234723",
    paidAt: "2026-01-10",
    receivedBy: { id: "STF-1003", fullName: "Daniel Okafor" },
    createdAt: "2026-01-10"
  },

  {
    id: "PAY-10002",
    studentFeeRecord: { id: "SFR-1001" },
    student: { id: "STU-1001", fullName: "John Doe" },
    amountPaid: 50000,
    paymentMethod: "Cash",
    paymentReference: "RCPT-00123",
    paidAt: "2026-01-20",
    receivedBy: { id: "STF-1003", fullName: "Daniel Okafor" },
    createdAt: "2026-01-20"
  }

];
