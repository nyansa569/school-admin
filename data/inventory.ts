export const inventoryMockData = {
  id: "INV-1001",
  itemCode: "ITM-ELC-001",

  name: "HP LaserJet Printer",
  category: "Electronics", // Electronics | Furniture | Lab Equipment | Books | Stationery | Cleaning
  type: "Asset", // Asset | Consumable

  quantity: 5,
  unitPrice: 180000,
  totalValue: 900000, // quantity * unitPrice

  reorderLevel: 1,

  condition: "Good", // New | Good | Fair | Damaged
  status: "In Use", // In Use | In Storage | Under Maintenance | Disposed

  location: {
    building: "Admin Block",
    room: "Office 3"
  },

  supplier: {
    name: "Tech Supplies Ltd",
    contactEmail: "sales@techsupplies.com",
    phone: "08077778888"
  },

  purchaseDate: "2023-06-15",
  lastMaintenanceDate: "2024-01-10",

  createdAt: "2023-06-15"
};


export const inventoriesMockData = [

  // 1️⃣ Electronics - Printer
  {
    id: "INV-1001",
    itemCode: "ITM-ELC-001",
    name: "HP LaserJet Printer",
    category: "Electronics",
    type: "Asset",
    quantity: 5,
    unitPrice: 180000,
    totalValue: 900000,
    reorderLevel: 1,
    condition: "Good",
    status: "In Use",
    location: { building: "Admin Block", room: "Office 3" },
    supplier: {
      name: "Tech Supplies Ltd",
      contactEmail: "sales@techsupplies.com",
      phone: "08077778888"
    },
    purchaseDate: "2023-06-15",
    lastMaintenanceDate: "2024-01-10",
    createdAt: "2023-06-15"
  },

  // 2️⃣ Furniture - Student Chairs
  {
    id: "INV-1002",
    itemCode: "ITM-FUR-002",
    name: "Student Chair",
    category: "Furniture",
    type: "Asset",
    quantity: 200,
    unitPrice: 15000,
    totalValue: 3000000,
    reorderLevel: 20,
    condition: "Good",
    status: "In Use",
    location: { building: "Main Block", room: "Multiple Classrooms" },
    supplier: {
      name: "School Furnishings Co.",
      contactEmail: "info@schoolfurnishings.com",
      phone: "08088889999"
    },
    purchaseDate: "2022-08-01",
    lastMaintenanceDate: null,
    createdAt: "2022-08-01"
  },

  // 3️⃣ Lab Equipment - Microscope
  {
    id: "INV-1003",
    itemCode: "ITM-LAB-003",
    name: "Digital Microscope",
    category: "Lab Equipment",
    type: "Asset",
    quantity: 10,
    unitPrice: 250000,
    totalValue: 2500000,
    reorderLevel: 2,
    condition: "New",
    status: "In Use",
    location: { building: "Science Block", room: "Biology Lab" },
    supplier: {
      name: "LabTech Nigeria",
      contactEmail: "support@labtechng.com",
      phone: "08099990000"
    },
    purchaseDate: "2024-01-05",
    lastMaintenanceDate: null,
    createdAt: "2024-01-05"
  },

  // 4️⃣ Consumable - Exercise Books
  {
    id: "INV-1004",
    itemCode: "ITM-BKS-004",
    name: "Exercise Book (200 Pages)",
    category: "Books",
    type: "Consumable",
    quantity: 500,
    unitPrice: 800,
    totalValue: 400000,
    reorderLevel: 100,
    condition: null,
    status: "In Storage",
    location: { building: "Store", room: "Main Storage" },
    supplier: {
      name: "EduPrint Publishers",
      contactEmail: "orders@eduprint.com",
      phone: "08012345678"
    },
    purchaseDate: "2024-01-20",
    lastMaintenanceDate: null,
    createdAt: "2024-01-20"
  },

  // 5️⃣ Cleaning Supplies - Detergent
  {
    id: "INV-1005",
    itemCode: "ITM-CLN-005",
    name: "Liquid Detergent (5L)",
    category: "Cleaning",
    type: "Consumable",
    quantity: 100,
    unitPrice: 3500,
    totalValue: 350000,
    reorderLevel: 20,
    condition: null,
    status: "In Storage",
    location: { building: "Store", room: "Cleaning Supply Room" },
    supplier: {
      name: "CleanPro Supplies",
      contactEmail: "sales@cleanpro.com",
      phone: "08055557777"
    },
    purchaseDate: "2024-02-01",
    lastMaintenanceDate: null,
    createdAt: "2024-02-01"
  }

];
