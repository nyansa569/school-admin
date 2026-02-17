export const booksMockData = [

  {
    id: "BK-001",
    isbn: "978-978-123456-1",
    title: "New General Mathematics for SS2",
    author: "M.F. Macrae",
    category: "Mathematics",
    totalCopies: 20,
    availableCopies: 15,
    shelfLocation: "Shelf A1",
    publishedYear: 2018,
    publisher: "Pearson Education",
    createdAt: "2023-01-10"
  },

  {
    id: "BK-002",
    isbn: "978-978-654321-2",
    title: "Senior Secondary Physics",
    author: "P.N. Okeke",
    category: "Physics",
    totalCopies: 15,
    availableCopies: 10,
    shelfLocation: "Shelf B2",
    publishedYear: 2019,
    publisher: "Lantern Books",
    createdAt: "2023-02-05"
  },

  {
    id: "BK-003",
    isbn: "978-978-111222-3",
    title: "African Literature Anthology",
    author: "Chinua Achebe",
    category: "Literature",
    totalCopies: 10,
    availableCopies: 8,
    shelfLocation: "Shelf C3",
    publishedYear: 2015,
    publisher: "Heinemann",
    createdAt: "2023-03-15"
  }

];



export const borrowRequestsMockData = [

  // Student Request
  {
    requestId: "REQ-001",
    bookId: "BK-001",

    borrowerType: "Student", // Student | Staff
    borrowerId: "STU-2024-001",

    requestDate: "2024-02-01",
    status: "Pending", // Pending | Approved | Rejected
    createdAt: "2024-02-01"
  },

  // Staff Request
  {
    requestId: "REQ-002",
    bookId: "BK-003",

    borrowerType: "Staff",
    borrowerId: "EMP-2024-001",

    requestDate: "2024-02-02",
    status: "Approved",
    createdAt: "2024-02-02"
  }

];


export const borrowRecordsMockData = [

  // Student Borrow Record
  {
    borrowId: "BR-001",
    bookId: "BK-001",

    borrowerType: "Student",
    borrowerId: "STU-2024-001",

    issueDate: "2024-02-03",
    dueDate: "2024-02-17",
    returnDate: null,

    status: "Borrowed", // Borrowed | Returned | Overdue

    finePerDay: 500,
    accumulatedFine: 0,

    approvedBy: "EMP-2024-002", // Librarian/Admin
    createdAt: "2024-02-03"
  },

  // Staff Borrow Record
  {
    borrowId: "BR-002",
    bookId: "BK-003",

    borrowerType: "Staff",
    borrowerId: "EMP-2024-001",

    issueDate: "2024-01-10",
    dueDate: "2024-01-24",
    returnDate: "2024-01-20",

    status: "Returned",

    finePerDay: 500,
    accumulatedFine: 0,

    approvedBy: "EMP-2024-002",
    createdAt: "2024-01-10"
  }

];
