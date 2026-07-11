"use client";

import React, { useState, useMemo } from "react";
import styles from "./page.module.css";
import { studentsAttendancesMockData } from "@/data/studentAttendance"; // Adjust path
import Header from "@/components/Header/Header";
import Stats from "@/components/Stats/Stats";
import StatFilter from "@/components/StatFilter/StatFilter";
import Table from "@/components/Table/Table";

// Types
interface CourseAttendance {
  id: string;
  date: string;
  courseName: string;
}
interface StudentInfo {
  id: string;
  fullName: string;
  admissionNumber: string;
}
interface AttendanceRecord {
  id: string;
  courseAttendance: CourseAttendance;
  student: StudentInfo;
  // status: "Present" | "Absent" | "Late" | "Excused";
  status: string;
  remark: string | null;
  markedAt: string;
}

const AttendanceAdminPage = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>(
    studentsAttendancesMockData,
  );
  const [filteredRecords, setFilteredRecords] =
    useState<AttendanceRecord[]>(records);
  const [showModal, setShowModal] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<AttendanceRecord | null>(
    null,
  );
  const [modalMode, setModalMode] = useState<"view" | "edit">("view");

  // Stats Calculation
  const stats = useMemo(() => {
    const total = records.length;
    const present = records.filter((r) => r.status === "Present").length;
    const absent = records.filter((r) => r.status === "Absent").length;
    const late = records.filter((r) => r.status === "Late").length;
    const rate = total > 0 ? ((present / total) * 100).toFixed(1) : 0;

    return [
      {
        id: 1,
        label: "Total Records",
        value: total,
        color: "blue",
        type: "classes",
      },
      {
        id: 2,
        label: "Present",
        value: present,
        trend: { value: late, label: "late" },
        color: "green",
        type: "attendance",
      },
      { id: 3, label: "Absent", value: absent, color: "red", type: "events" },
      {
        id: 4,
        label: "Attendance Rate",
        value: `${rate}%`,
        subtitle: "average",
        color: "purple",
        type: "revenue",
      },
    ];
  }, [records]);

  // Table Columns
  const columns = [
    {
      header: "Student",
      accessor: "student.fullName",
      sortable: true,
      render: (row: AttendanceRecord) => (
        <div className={styles.studentCell}>
          <div className={styles.avatar}>
            {row.student.fullName
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>
          <div>
            <div className={styles.name}>{row.student.fullName}</div>
            <div className={styles.sub}>{row.student.admissionNumber}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Course",
      accessor: "courseAttendance.courseName",
      sortable: true,
      render: (row: AttendanceRecord) => (
        <span className={styles.courseTag}>
          {row.courseAttendance.courseName}
        </span>
      ),
    },
    {
      header: "Date",
      accessor: "courseAttendance.date",
      sortable: true,
      render: (row: AttendanceRecord) =>
        new Date(row.courseAttendance.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
    },
    {
      header: "Status",
      accessor: "status",
      sortable: true,
      render: (row: AttendanceRecord) => {
        const statusMap: Record<string, string> = {
          Present: styles.statusPresent,
          Absent: styles.statusAbsent,
          Late: styles.statusLate,
          Excused: styles.statusExcused,
        };
        return (
          <span className={`${styles.statusBadge} ${statusMap[row.status]}`}>
            {row.status}
          </span>
        );
      },
    },
    {
      header: "Remark",
      accessor: "remark",
      render: (row: AttendanceRecord) => (
        <span className={styles.remarkText}>{row.remark || "-"}</span>
      ),
    },
    {
      header: "Marked At",
      accessor: "markedAt",
      render: (row: AttendanceRecord) =>
        new Date(row.markedAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
    },
  ];

  // Filters
  const filterOptions = [
    {
      label: "Status",
      value: "status",
      key: "status",
      type: "select" as const,
      options: [
        { label: "Present", value: "Present" },
        { label: "Absent", value: "Absent" },
        { label: "Late", value: "Late" },
        { label: "Excused", value: "Excused" },
      ],
    },
    {
      label: "Course",
      value: "courseAttendance.courseName",
      key: "courseAttendance.courseName",
      type: "select" as const,
      options: [
        ...new Set(records.map((r) => r.courseAttendance.courseName)),
      ].map((c) => ({ label: c, value: c })),
    },
  ];

  const sortOptions = [
    {
      label: "Date (Newest)",
      value: "date-desc",
      key: "courseAttendance.date",
      order: "desc" as const,
    },
    {
      label: "Student Name (A-Z)",
      value: "name-asc",
      key: "student.fullName",
      order: "asc" as const,
    },
    {
      label: "Status",
      value: "status-asc",
      key: "status",
      order: "asc" as const,
    },
  ];

  // Handlers
  const handleView = (record: AttendanceRecord) => {
    setModalMode("view");
    setCurrentRecord(record);
    setShowModal(true);
  };

  const handleEdit = (record: AttendanceRecord) => {
    setModalMode("edit");
    setCurrentRecord({ ...record });
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRecord) return;

    const updated = records.map((r) =>
      r.id === currentRecord.id ? currentRecord : r,
    );
    setRecords(updated);
    setFilteredRecords(updated);
    setShowModal(false);
  };

  const actions = [
    { label: "View", variant: "primary", onClick: handleView },
    { label: "Edit", variant: "secondary", onClick: handleEdit },
  ];

  const renderExpandedRow = (row: AttendanceRecord) => (
    <div className={styles.expandedContent}>
      <div className={styles.expandedGrid}>
        <div className={styles.expandedSection}>
          <h4>Session Details</h4>
          <div className={styles.detailRow}>
            <span>Course:</span>{" "}
            <strong>{row.courseAttendance.courseName}</strong>
          </div>
          <div className={styles.detailRow}>
            <span>Session Date:</span>{" "}
            <strong>{row.courseAttendance.date}</strong>
          </div>
          <div className={styles.detailRow}>
            <span>Session ID:</span> <strong>{row.courseAttendance.id}</strong>
          </div>
        </div>
        <div className={styles.expandedSection}>
          <h4>Timestamps</h4>
          <div className={styles.detailRow}>
            <span>Marked At:</span>{" "}
            <strong>{new Date(row.markedAt).toLocaleString()}</strong>
          </div>
          <div className={styles.detailRow}>
            <span>Record ID:</span> <strong>{row.id}</strong>
          </div>
          <div className={styles.detailRow}>
            <span>Remark:</span> <strong>{row.remark || "None"}</strong>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.pageContainer}>
      <Header
        title="Attendance Records"
        subtitle="View and manage student attendance across courses"
        customActions={
          <button className={styles.addButton}>
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path
                fill="currentColor"
                d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"
              />
            </svg>
            Take Attendance
          </button>
        }
      />

      <div className={styles.contentWrapper}>
        <Stats stats={stats} variant="cards" columns={4} showTrend showIcon />

        <div className={styles.filterSection}>
          <StatFilter
            data={records}
            onFilterChange={setFilteredRecords}
            searchKeys={[
              "student.fullName",
              "student.admissionNumber",
              "courseAttendance.courseName",
            ]}
            sortOptions={sortOptions}
            filterOptions={filterOptions}
            searchPlaceholder="Search by student or course..."
          />
        </div>

        <div className={styles.tableSection}>
          <Table
            columns={columns}
            data={filteredRecords}
            // actions={actions}
            expandable
            renderExpandedRow={renderExpandedRow}
            pagination
            pageSize={10}
            showRowNumbers
          />
        </div>
      </div>

      {/* Modal */}
      {showModal && currentRecord && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowModal(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Attendance Details</h2>
              <button
                className={styles.closeButton}
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSave} className={styles.modalBody}>
              <div className={styles.studentInfo}>
                <div className={styles.avatarLarge}>
                  {currentRecord.student.fullName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <h3>{currentRecord.student.fullName}</h3>
                  <span>{currentRecord.student.admissionNumber}</span>
                </div>
              </div>

              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Course</label>
                  <input
                    type="text"
                    value={currentRecord.courseAttendance.courseName}
                    disabled
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Date</label>
                  <input
                    type="text"
                    value={currentRecord.courseAttendance.date}
                    disabled
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Status</label>
                  {modalMode === "edit" ? (
                    <select
                      value={currentRecord.status}
                      onChange={(e) =>
                        setCurrentRecord({
                          ...currentRecord,
                          status: e.target.value as any,
                        })
                      }
                    >
                      <option>Present</option>
                      <option>Absent</option>
                      <option>Late</option>
                      <option>Excused</option>
                    </select>
                  ) : (
                    <input type="text" value={currentRecord.status} disabled />
                  )}
                </div>
                <div className={styles.formGroup}>
                  <label>Time Marked</label>
                  <input
                    type="text"
                    value={new Date(
                      currentRecord.markedAt,
                    ).toLocaleTimeString()}
                    disabled
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Remark</label>
                <textarea
                  value={currentRecord.remark || ""}
                  onChange={(e) =>
                    setCurrentRecord({
                      ...currentRecord,
                      remark: e.target.value,
                    })
                  }
                  disabled={modalMode === "view"}
                  rows={3}
                />
              </div>

              {modalMode === "edit" && (
                <div className={styles.modalFooter}>
                  <button
                    type="button"
                    className={styles.cancelButton}
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className={styles.submitButton}>
                    Save Changes
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceAdminPage;
