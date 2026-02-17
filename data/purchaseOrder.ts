export const purchaseOrdersMockData = [

  {
    id: "PO-1001",
    referenceNumber: "PO-2026-0001",
    title: "Laboratory Equipment Purchase",
    description: "Microscopes and lab consumables",
    department: { id: "DEP-01", name: "Science" },
    requestedBy: { id: "STF-1010", fullName: "Helen Smith" },
    items: [
      { name: "Microscope", quantity: 5, unitPrice: 15000 },
      { name: "Lab Chemicals", quantity: 10, unitPrice: 5000 }
    ],
    totalAmount: 125000,
    status: "Pending Admin Approval",
    academicYear: "2025/2026",
    term: "First Term",
    createdAt: "2026-01-12"
  },

  {
    id: "PO-1002",
    referenceNumber: "PO-2026-0002",
    title: "Office Stationeries",
    description: "A4 Papers and Ink",
    department: { id: "DEP-02", name: "Business" },
    requestedBy: { id: "STF-1012", fullName: "Linda Bassey" },
    items: [
      { name: "A4 Paper", quantity: 20, unitPrice: 3000 },
      { name: "Printer Ink", quantity: 5, unitPrice: 8000 }
    ],
    totalAmount: 100000,
    status: "Approved",
    academicYear: "2025/2026",
    term: "First Term",
    createdAt: "2026-01-15"
  }

];


export const purchaseOrderApprovalsMockData = [

  {
    id: "POA-1001",
    purchaseOrderId: "PO-1001",
    level: "Department",
    approvedBy: { id: "STF-1001", fullName: "James Anderson" },
    decision: "Approved",
    comment: "Necessary for lab work",
    decidedAt: "2026-01-13"
  }

];



export const expensesMockData = [

  {
    id: "EXP-1001",
    purchaseOrder: {
      id: "PO-1002",
      referenceNumber: "PO-2026-0002"
    },
    department: { id: "DEP-02", name: "Business" },
    vendor: {
      name: "City Office Supplies",
      phone: "08088889999"
    },
    totalAmount: 100000,
    amountPaid: 100000,
    paymentMethod: "Transfer",
    paymentReference: "TRX-99887766",
    recordedBy: { id: "STF-1003", fullName: "Daniel Okafor" },
    expenseDate: "2026-01-20",
    academicYear: "2025/2026",
    term: "First Term",
    createdAt: "2026-01-20"
  }

];



export const purchaseOrderColumns = [
  { header: "Reference", accessor: "referenceNumber" },
  { header: "Title", accessor: "title" },
  { header: "Department", accessor: "department.name" },
  { header: "Requested By", accessor: "requestedBy.fullName" },
  { header: "Amount", accessor: "totalAmount", type: "currency" },
  { header: "Status", accessor: "status" }
];


export const expenseColumns = [
  { header: "Reference", accessor: "purchaseOrder.referenceNumber" },
  { header: "Department", accessor: "department.name" },
  { header: "Vendor", accessor: "vendor.name" },
  { header: "Amount", accessor: "totalAmount", type: "currency" },
  { header: "Payment Method", accessor: "paymentMethod" },
  { header: "Date", accessor: "expenseDate" }
];
