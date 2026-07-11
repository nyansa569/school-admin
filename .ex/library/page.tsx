"use client";

import React, { useState, useMemo } from "react";
import styles from "./page.module.css";
import {
  booksMockData,
  borrowRequestsMockData,
  borrowRecordsMockData,
} from "@/data/library"; // Adjust path
import Header from "@/components/Header/Header";
import Stats from "@/components/Stats/Stats";
import StatFilter from "@/components/StatFilter/StatFilter";
import Table from "@/components/Table/Table";

// Types
interface Book {
  id: string;
  isbn: string;
  title: string;
  author: string;
  category: string;
  totalCopies: number;
  availableCopies: number;
  shelfLocation: string;
  publishedYear: number;
  publisher: string;
  createdAt: string;
}

interface BorrowRequest {
  requestId: string;
  bookId: string;
  // borrowerType: "Student" | "Staff";
  borrowerType:string;
  borrowerId: string;
  requestDate: string;
  // status: "Pending" | "Approved" | "Rejected";
  status: string;
  createdAt: string;
}

interface BorrowRecord {
  borrowId: string;
  bookId: string;
  // borrowerType: "Student" | "Staff";
  borrowerType: string;
  borrowerId: string;
  issueDate: string;
  dueDate: string;
  returnDate: string | null;
  // status: "Borrowed" | "Returned" | "Overdue";
  status: string;
  finePerDay: number;
  accumulatedFine: number;
  approvedBy: string;
  createdAt: string;
}

type TabType = "books" | "requests" | "records";

const LibraryAdminPage = () => {
  // State
  const [books, setBooks] = useState<Book[]>(booksMockData);
  const [requests, setRequests] = useState<BorrowRequest[]>(
    borrowRequestsMockData,
  );
  const [records, setRecords] = useState<BorrowRecord[]>(borrowRecordsMockData);

  const [activeTab, setActiveTab] = useState<TabType>("books");
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create",
  );
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    type: TabType;
  } | null>(null);

  const [formData, setFormData] = useState<Partial<Book>>({});

  // --- Stats Calculation ---
  const stats = useMemo(() => {
    const totalBooks = books.reduce((sum, b) => sum + b.totalCopies, 0);
    const availableBooks = books.reduce((sum, b) => sum + b.availableCopies, 0);
    const pendingRequests = requests.filter(
      (r) => r.status === "Pending",
    ).length;
    const overdueBooks = records.filter((r) => r.status === "Overdue").length;

    return [
      {
        id: 1,
        label: "Total Books",
        value: totalBooks,
        subtitle: "Volumes",
        color: "blue",
        type: "classes",
      },
      {
        id: 2,
        label: "Available",
        value: availableBooks,
        trend: { value: totalBooks - availableBooks, label: "borrowed" },
        color: "green",
        type: "attendance",
      },
      {
        id: 3,
        label: "Pending Requests",
        value: pendingRequests,
        color: "orange",
        type: "events",
      },
      {
        id: 4,
        label: "Overdue Books",
        value: overdueBooks,
        color: "red",
        type: "revenue",
      },
    ];
  }, [books, requests, records]);

  // --- Helpers ---
  const getBookTitle = (bookId: string) =>
    books.find((b) => b.id === bookId)?.title || "Unknown Book";

  // --- Table Configurations ---

  // 1. Books Columns
  const booksColumns = [
    {
      header: "Book Info",
      accessor: "title",
      sortable: true,
      render: (row: Book) => (
        <div className={styles.bookCell}>
          <div className={styles.bookIcon}>📚</div>
          <div>
            <div className={styles.bookTitle}>{row.title}</div>
            <div className={styles.bookAuthor}>by {row.author}</div>
          </div>
        </div>
      ),
    },
    { header: "ISBN", accessor: "isbn", width: "130px" },
    { header: "Category", accessor: "category", sortable: true },
    {
      header: "Stock",
      accessor: "availableCopies",
      sortable: true,
      render: (row: Book) => {
        const isLow = row.availableCopies === 0;
        return (
          <div className={styles.stockInfo}>
            <span className={isLow ? styles.outOfStock : ""}>
              {row.availableCopies}
            </span>
            <span className={styles.totalStock}>/ {row.totalCopies}</span>
          </div>
        );
      },
    },
    { header: "Shelf", accessor: "shelfLocation", width: "100px" },
  ];

  // 2. Requests Columns
  const requestsColumns = [
    { header: "Request ID", accessor: "requestId", width: "110px" },
    {
      header: "Book Title",
      accessor: "bookId",
      render: (row: BorrowRequest) => (
        <span className={styles.bookTitleText}>{getBookTitle(row.bookId)}</span>
      ),
    },
    {
      header: "Borrower",
      accessor: "borrowerId",
      render: (row: BorrowRequest) => (
        <div className={styles.borrowerCell}>
          <span className={styles.borrowerBadge}>{row.borrowerType}</span>
          <span>{row.borrowerId}</span>
        </div>
      ),
    },
    { header: "Request Date", accessor: "requestDate" },
    {
      header: "Status",
      accessor: "status",
      render: (row: BorrowRequest) => {
        const statusMap: Record<string, string> = {
          Pending: styles.statusPending,
          Approved: styles.statusApproved,
          Rejected: styles.statusRejected,
        };
        return (
          <span className={`${styles.statusBadge} ${statusMap[row.status]}`}>
            {row.status}
          </span>
        );
      },
    },
  ];

  // 3. Records Columns
  const recordsColumns = [
    { header: "Record ID", accessor: "borrowId", width: "110px" },
    {
      header: "Book Title",
      accessor: "bookId",
      render: (row: BorrowRecord) => (
        <span className={styles.bookTitleText}>{getBookTitle(row.bookId)}</span>
      ),
    },
    { header: "Borrower ID", accessor: "borrowerId" },
    { header: "Issue Date", accessor: "issueDate" },
    { header: "Due Date", accessor: "dueDate" },
    {
      header: "Status",
      accessor: "status",
      render: (row: BorrowRecord) => {
        const statusMap: Record<string, string> = {
          Borrowed: styles.statusBorrowed,
          Returned: styles.statusReturned,
          Overdue: styles.statusOverdue,
        };
        return (
          <span className={`${styles.statusBadge} ${statusMap[row.status]}`}>
            {row.status}
          </span>
        );
      },
    },
    {
      header: "Fine",
      accessor: "accumulatedFine",
      render: (row: BorrowRecord) => (
        <span className={row.accumulatedFine > 0 ? styles.fineAmt : ""}>
          ₦{row.accumulatedFine.toLocaleString()}
        </span>
      ),
    },
  ];

  // --- Actions ---

  const handleAddBook = () => {
    setModalMode("create");
    setFormData({
      title: "",
      author: "",
      isbn: "",
      category: "",
      totalCopies: 1,
      availableCopies: 1,
      shelfLocation: "",
      publisher: "",
      publishedYear: new Date().getFullYear(),
    });
    setShowModal(true);
  };

  const handleEditBook = (book: Book) => {
    setModalMode("edit");
    setCurrentItem(book);
    setFormData({ ...book });
    setShowModal(true);
  };

  const handleDeleteBook = (id: string) => {
    setDeleteTarget({ id, type: "books" });
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === "books") {
      setBooks(books.filter((b) => b.id !== deleteTarget.id));
    }
    setShowDeleteConfirm(false);
    setDeleteTarget(null);
  };

  const handleSubmitBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (modalMode === "create") {
      const newBook: Book = {
        id: `BK-${Date.now().toString().slice(-3)}`,
        ...formData,
        createdAt: new Date().toISOString().split("T")[0],
      } as Book;
      setBooks([newBook, ...books]);
    } else if (modalMode === "edit" && currentItem) {
      setBooks(
        books.map((b) => (b.id === currentItem.id ? { ...b, ...formData } : b)),
      );
    }
    setShowModal(false);
  };

  // Library Specific Actions
  const handleApproveRequest = (req: BorrowRequest) => {
    // 1. Check stock
    const book = books.find((b) => b.id === req.bookId);
    if (!book || book.availableCopies <= 0) {
      alert("No available copies for this book.");
      return;
    }

    // 2. Update Request Status
    setRequests(
      requests.map((r) =>
        r.requestId === req.requestId ? { ...r, status: "Approved" } : r,
      ),
    );

    // 3. Create Borrow Record
    const newRecord: BorrowRecord = {
      borrowId: `BR-${Date.now().toString().slice(-5)}`,
      bookId: req.bookId,
      borrowerType: req.borrowerType,
      borrowerId: req.borrowerId,
      issueDate: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0], // 14 days later
      returnDate: null,
      status: "Borrowed",
      finePerDay: 500,
      accumulatedFine: 0,
      approvedBy: "ADMIN-01",
      createdAt: new Date().toISOString().split("T")[0],
    };
    setRecords([newRecord, ...records]);

    // 4. Decrease Book Stock
    setBooks(
      books.map((b) =>
        b.id === req.bookId
          ? { ...b, availableCopies: b.availableCopies - 1 }
          : b,
      ),
    );
  };

  const handleRejectRequest = (req: BorrowRequest) => {
    setRequests(
      requests.map((r) =>
        r.requestId === req.requestId ? { ...r, status: "Rejected" } : r,
      ),
    );
  };

  const handleReturnBook = (record: BorrowRecord) => {
    const today = new Date();
    const due = new Date(record.dueDate);
    let fine = 0;

    if (today > due) {
      const diffDays = Math.ceil(
        (today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24),
      );
      fine = diffDays * record.finePerDay;
    }

    // 1. Update Record
    setRecords(
      records.map((r) =>
        r.borrowId === record.borrowId
          ? {
              ...r,
              status: "Returned",
              returnDate: today.toISOString().split("T")[0],
              accumulatedFine: fine,
            }
          : r,
      ),
    );

    // 2. Increase Book Stock
    setBooks(
      books.map((b) =>
        b.id === record.bookId
          ? { ...b, availableCopies: b.availableCopies + 1 }
          : b,
      ),
    );
  };

  const getActions = () => {
    if (activeTab === "books") {
      return [
        { label: "Edit", variant: "secondary", onClick: handleEditBook },
        {
          label: "Delete",
          variant: "danger",
          onClick: (row: Book) => handleDeleteBook(row.id),
        },
      ];
    }
    if (activeTab === "requests") {
      return [
        {
          label: "Approve",
          variant: "success",
          onClick: (row: BorrowRequest) =>
            row.status === "Pending" && handleApproveRequest(row),
          hidden: (row: BorrowRequest) => row.status !== "Pending",
        },
        {
          label: "Reject",
          variant: "danger",
          onClick: (row: BorrowRequest) =>
            row.status === "Pending" && handleRejectRequest(row),
          hidden: (row: BorrowRequest) => row.status !== "Pending",
        },
      ];
    }
    if (activeTab === "records") {
      return [
        {
          label: "Return",
          variant: "primary",
          onClick: (row: BorrowRecord) =>
            row.status !== "Returned" && handleReturnBook(row),
          hidden: (row: BorrowRecord) => row.status === "Returned",
        },
      ];
    }
    return [];
  };

  return (
    <div className={styles.pageContainer}>
      <Header
        title="Library Management"
        subtitle="Manage books, borrow requests, and track records"
        customActions={
          <button className={styles.addButton} onClick={handleAddBook}>
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path
                fill="currentColor"
                d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"
              />
            </svg>
            Add New Book
          </button>
        }
      />

      <div className={styles.contentWrapper}>
        <Stats stats={stats} variant="cards" columns={4} showTrend showIcon />

        {/* Tabs */}
        <div className={styles.tabsContainer}>
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === "books" ? styles.active : ""}`}
              onClick={() => setActiveTab("books")}
            >
              Books Inventory
            </button>
            <button
              className={`${styles.tab} ${activeTab === "requests" ? styles.active : ""}`}
              onClick={() => setActiveTab("requests")}
            >
              Borrow Requests
            </button>
            <button
              className={`${styles.tab} ${activeTab === "records" ? styles.active : ""}`}
              onClick={() => setActiveTab("records")}
            >
              Borrow Records
            </button>
          </div>
        </div>

        <div className={styles.filterSection}>
          <StatFilter
            data={
              activeTab === "books"
                ? books
                : activeTab === "requests"
                  ? requests
                  : records
            }
            onFilterChange={(d: any) => {}}
            searchKeys={["title", "author", "isbn", "borrowerId"]}
            searchPlaceholder={
              activeTab === "books" ? "Search books..." : "Search requests..."
            }
          />
        </div>

        <div className={styles.tableSection}>
          {activeTab === "books" && (
            <Table
              columns={booksColumns}
              data={books}
              // actions={getActions()}
              pagination
              pageSize={10}
              showRowNumbers
            />
          )}
          {activeTab === "requests" && (
            <Table
              columns={requestsColumns}
              data={requests}
              // actions={getActions()}
              pagination
              pageSize={10}
            />
          )}
          {activeTab === "records" && (
            <Table
              columns={recordsColumns}
              data={records}
              // actions={getActions()}
              pagination
              pageSize={10}
            />
          )}
        </div>
      </div>

      {/* Book Modal */}
      {showModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowModal(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{modalMode === "create" ? "Add New Book" : "Edit Book"}</h2>
              <button
                className={styles.closeButton}
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmitBook} className={styles.modalBody}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Title *</label>
                  <input
                    name="title"
                    value={formData.title || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Author *</label>
                  <input
                    name="author"
                    value={formData.author || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, author: e.target.value })
                    }
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>ISBN</label>
                  <input
                    name="isbn"
                    value={formData.isbn || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, isbn: e.target.value })
                    }
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Category</label>
                  <input
                    name="category"
                    value={formData.category || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Total Copies *</label>
                  <input
                    type="number"
                    name="totalCopies"
                    min="0"
                    value={formData.totalCopies || 0}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        totalCopies: Number(e.target.value),
                      })
                    }
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Available Copies *</label>
                  <input
                    type="number"
                    name="availableCopies"
                    min="0"
                    value={formData.availableCopies || 0}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        availableCopies: Number(e.target.value),
                      })
                    }
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Shelf Location</label>
                  <input
                    name="shelfLocation"
                    value={formData.shelfLocation || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        shelfLocation: e.target.value,
                      })
                    }
                    placeholder="e.g. Shelf A1"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Publisher</label>
                  <input
                    name="publisher"
                    value={formData.publisher || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, publisher: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.submitButton}>
                  Save Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {showDeleteConfirm && (
        <div className={styles.modalOverlay}>
          <div className={styles.confirmModal}>
            <h3>Delete Book?</h3>
            <p>This will permanently remove this book from the inventory.</p>
            <div className={styles.confirmActions}>
              <button
                className={styles.cancelButton}
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button className={styles.deleteButton} onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LibraryAdminPage;
