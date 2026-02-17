export const payrollMockData = {
  payrollId: "PAY-2024-01-001",
  staffId: "EMP-2024-001",

  month: "January",
  year: 2024,

  basicSalary: 250000,

  allowances: {
    housing: 50000,
    transport: 30000,
    meal: 20000,
    bonus: 15000,
    total: 115000
  },

  deductions: {
    pension: 20000,
    loan: 10000,
    absencePenalty: 0,
    total: 30000
  },

  tax: 25000,

  grossSalary: 365000, // basic + allowances
  netSalary: 310000,   // gross - deductions - tax

  status: "Paid", // Paid | Pending | Failed
  paymentDate: "2024-01-31",

  createdAt: "2024-01-31"
};


export const payrollsMockData = [

  // 1️⃣ Teacher - James Anderson
  {
    payrollId: "PAY-2024-01-001",
    staffId: "EMP-2024-001",
    month: "January",
    year: 2024,
    basicSalary: 250000,
    allowances: { housing: 50000, transport: 30000, meal: 20000, bonus: 15000, total: 115000 },
    deductions: { pension: 20000, loan: 10000, absencePenalty: 0, total: 30000 },
    tax: 25000,
    grossSalary: 365000,
    netSalary: 310000,
    status: "Paid",
    paymentDate: "2024-01-31",
    createdAt: "2024-01-31"
  },

  // 2️⃣ Admin - Grace Williams
  {
    payrollId: "PAY-2024-01-002",
    staffId: "EMP-2024-002",
    month: "January",
    year: 2024,
    basicSalary: 300000,
    allowances: { housing: 60000, transport: 35000, meal: 25000, bonus: 20000, total: 140000 },
    deductions: { pension: 25000, loan: 0, absencePenalty: 0, total: 25000 },
    tax: 30000,
    grossSalary: 440000,
    netSalary: 385000,
    status: "Paid",
    paymentDate: "2024-01-31",
    createdAt: "2024-01-31"
  },

  // 3️⃣ Finance Officer - Daniel Okafor
  {
    payrollId: "PAY-2024-01-003",
    staffId: "EMP-2024-003",
    month: "January",
    year: 2024,
    basicSalary: 280000,
    allowances: { housing: 55000, transport: 30000, meal: 20000, bonus: 10000, total: 115000 },
    deductions: { pension: 22000, loan: 15000, absencePenalty: 0, total: 37000 },
    tax: 27000,
    grossSalary: 395000,
    netSalary: 331000,
    status: "Paid",
    paymentDate: "2024-01-31",
    createdAt: "2024-01-31"
  },

  // 4️⃣ Asset Manager - Linda Bassey
  {
    payrollId: "PAY-2024-01-004",
    staffId: "EMP-2024-004",
    month: "January",
    year: 2024,
    basicSalary: 220000,
    allowances: { housing: 40000, transport: 25000, meal: 15000, bonus: 10000, total: 90000 },
    deductions: { pension: 18000, loan: 0, absencePenalty: 5000, total: 23000 },
    tax: 20000,
    grossSalary: 310000,
    netSalary: 267000,
    status: "Paid",
    paymentDate: "2024-01-31",
    createdAt: "2024-01-31"
  },

  // 5️⃣ Non Teaching Staff - Samuel Adebayo
  {
    payrollId: "PAY-2024-01-005",
    staffId: "EMP-2024-005",
    month: "January",
    year: 2024,
    basicSalary: 120000,
    allowances: { housing: 20000, transport: 15000, meal: 10000, bonus: 5000, total: 50000 },
    deductions: { pension: 10000, loan: 0, absencePenalty: 0, total: 10000 },
    tax: 10000,
    grossSalary: 170000,
    netSalary: 150000,
    status: "Pending",
    paymentDate: null,
    createdAt: "2024-01-31"
  }

];

