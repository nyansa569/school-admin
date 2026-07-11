// app/(teacher)/teacher/(sub-teacher)/[module]/class/[classid]/subject/[subjectid]/components/AttendanceView.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  getAttendanceOverview,
  getAttendanceByDate,
  markStudentAttendance,
  markAllStudentsAttendance,
  markSelectedStudentsAttendance,
  getAcademicYears,
  getTerms,
  getCurrentActiveTerm,
  checkTeacherAuthorization,
} from "@/lib/action/teacher/attendance";
import styles from "./AttendanceView.module.css";

type AttendanceViewProps = {
  classId: number;
  subjectId: number;
};

type Student = {
  id: number;
  first_name: string;
  last_name: string;
  other_names: string | null;
  full_name: string;
  admission_number: string;
  student_number: string;
  attendance: {
    totalDays: number;
    presentDays: number;
    absentDays: number;
    lateDays: number;
    excusedDays: number;
    attendanceRate: string;
  };
};

type Summary = {
  totalStudents: number;
  totalAttendanceRecords: number;
  overallAttendanceRate: string;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
};

type AttendanceRecord = {
  student_id: number;
  first_name: string;
  last_name: string;
  other_names: string | null;
  full_name: string;
  admission_number: string;
  status: string | null;
  attendance_id: number | null;
  check_in_time: string | null;
  check_out_time: string | null;
  remarks: string | null;
};

type AcademicYear = {
  id: number;
  year: number;
  name: string;
  is_active: boolean;
};

type Term = {
  id: number;
  term_number: number;
  name: string;
  is_active: boolean;
};

export default function AttendanceView({ classId, subjectId }: AttendanceViewProps) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [selectedTermId, setSelectedTermId] = useState<number | undefined>(undefined);
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState<number | undefined>(undefined);
  const [selectedStudents, setSelectedStudents] = useState<Set<number>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<string>("present");
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [viewMode, setViewMode] = useState<"overview" | "daily">("overview");
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedStudentDetails, setSelectedStudentDetails] = useState<AttendanceRecord | null>(null);
  const [remarks, setRemarks] = useState("");
  const [checkInTime, setCheckInTime] = useState("");
  const [checkOutTime, setCheckOutTime] = useState("");

  useEffect(() => {
    checkAuthorization();
    loadAcademicYears();
  }, []);

  useEffect(() => {
    if (selectedAcademicYearId) {
      loadTerms(selectedAcademicYearId);
    } else {
      setTerms([]);
    }
  }, [selectedAcademicYearId]);

  useEffect(() => {
    if (authorized) {
      loadCurrentActiveInfo();
    }
  }, [authorized]);

  useEffect(() => {
    if (authorized) {
      if (viewMode === "overview") {
        loadAttendanceOverview();
      } else {
        loadAttendanceByDate();
      }
    }
  }, [authorized, viewMode, selectedDate, selectedTermId, selectedAcademicYearId]);

  const checkAuthorization = async () => {
    setLoading(true);
    const result = await checkTeacherAuthorization(classId, subjectId);
    if (result.isAuthorized) {
      setAuthorized(true);
    } else {
      setAuthorized(false);
    }
    setLoading(false);
  };

  const loadAcademicYears = async () => {
    const result = await getAcademicYears();
    if (result.academicYears) {
      setAcademicYears(result.academicYears);
      // Auto-select active academic year
      const activeYear = result.academicYears.find((y: AcademicYear) => y.is_active);
      if (activeYear) {
        setSelectedAcademicYearId(activeYear.id);
      } else if (result.academicYears.length > 0) {
        setSelectedAcademicYearId(result.academicYears[0].id);
      }
    }
  };

  const loadTerms = async (academicYearId: number) => {
    const result = await getTerms(academicYearId);
    if (result.terms) {
      setTerms(result.terms);
    }
  };

  const loadCurrentActiveInfo = async () => {
    const { term, academicYear } = await getCurrentActiveTerm();
    if (academicYear && !selectedAcademicYearId) {
      setSelectedAcademicYearId(academicYear.id);
    }
    if (term && !selectedTermId) {
      setSelectedTermId(term.id);
    }
  };

  const loadAttendanceOverview = async () => {
    setLoading(true);
    const result = await getAttendanceOverview(classId, subjectId, selectedTermId, selectedAcademicYearId);
    if (result.error) {
      console.error(result.error);
    } else {
      setStudents(result.students || []);
      setSummary(result.summary || null);
    }
    setLoading(false);
  };

  const loadAttendanceByDate = async () => {
    setLoading(true);
    const result = await getAttendanceByDate(classId, subjectId, selectedDate, selectedTermId, selectedAcademicYearId);
    if (result.error) {
      console.error(result.error);
    } else {
      setAttendanceRecords(result.attendance || []);
    }
    setLoading(false);
  };

  const handleMarkAttendance = async (studentId: number, status: string) => {
    const result = await markStudentAttendance(
      classId,
      subjectId,
      studentId,
      selectedDate,
      status as any,
      selectedTermId,
      selectedAcademicYearId,
      checkInTime || undefined,
      checkOutTime || undefined,
      remarks || undefined
    );

    if (result.success) {
      await loadAttendanceByDate();
      setShowDetailsModal(false);
      setRemarks("");
      setCheckInTime("");
      setCheckOutTime("");
      setSelectedStudentDetails(null);
    } else {
      alert(result.error);
    }
  };

  const handleMarkAll = async () => {
    const result = await markAllStudentsAttendance(
      classId,
      subjectId,
      selectedDate,
      bulkStatus as any,
      selectedTermId,
      selectedAcademicYearId
    );

    if (result.success) {
      await loadAttendanceByDate();
      setShowBulkModal(false);
      setSelectedStudents(new Set());
    } else {
      alert(result.error);
    }
  };

  const handleMarkSelected = async () => {
    if (selectedStudents.size === 0) {
      alert("Please select at least one student");
      return;
    }

    const result = await markSelectedStudentsAttendance(
      classId,
      subjectId,
      selectedDate,
      Array.from(selectedStudents),
      bulkStatus as any,
      selectedTermId,
      selectedAcademicYearId
    );

    if (result.success) {
      await loadAttendanceByDate();
      setShowBulkModal(false);
      setSelectedStudents(new Set());
    } else {
      alert(result.error);
    }
  };

  const toggleStudentSelection = (studentId: number) => {
    const newSelection = new Set(selectedStudents);
    if (newSelection.has(studentId)) {
      newSelection.delete(studentId);
    } else {
      newSelection.add(studentId);
    }
    setSelectedStudents(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedStudents.size === attendanceRecords.length) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(attendanceRecords.map((r) => r.student_id)));
    }
  };

  const openDetailsModal = (record: AttendanceRecord) => {
    setSelectedStudentDetails(record);
    setRemarks(record.remarks || "");
    setCheckInTime(record.check_in_time || "");
    setCheckOutTime(record.check_out_time || "");
    setShowDetailsModal(true);
  };

  const getStatusBadgeClass = (status: string | null) => {
    switch (status) {
      case "present":
        return styles.statusPresent;
      case "absent":
        return styles.statusAbsent;
      case "late":
        return styles.statusLate;
      case "excused":
        return styles.statusExcused;
      default:
        return styles.statusNotMarked;
    }
  };

  const getStatusText = (status: string | null) => {
    switch (status) {
      case "present":
        return "Present";
      case "absent":
        return "Absent";
      case "late":
        return "Late";
      case "excused":
        return "Excused";
      default:
        return "Not Marked";
    }
  };

  const getTermDisplay = () => {
    const term = terms.find(t => t.id === selectedTermId);
    const year = academicYears.find(y => y.id === selectedAcademicYearId);
    if (term && year) {
      return `${term.name} - ${year.year}`;
    }
    if (term) return term.name;
    if (year) return `${year.year}`;
    return "Current";
  };

  if (!authorized && !loading) {
    return (
      <div className={styles.unauthorized}>
        <div className={styles.unauthorizedIcon}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z" />
          </svg>
        </div>
        <h2>Unauthorized Access</h2>
        <p>You are not authorized to manage attendance for this class and subject.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading attendance data...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Attendance Management</h1>
          <p className={styles.subtitle}>
            Class ID: {classId} | Subject ID: {subjectId} | {getTermDisplay()}
          </p>
        </div>
        <div className={styles.viewToggle}>
          <button
            className={`${styles.viewButton} ${viewMode === "overview" ? styles.activeView : ""}`}
            onClick={() => setViewMode("overview")}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 13h8V3H3v10Zm0 8h8v-6H3v6Zm10 0h8V11h-8v10Zm0-18v6h8V3h-8Z" />
            </svg>
            Overview
          </button>
          <button
            className={`${styles.viewButton} ${viewMode === "daily" ? styles.activeView : ""}`}
            onClick={() => setViewMode("daily")}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
            </svg>
            Daily Attendance
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label>Academic Year</label>
          <select
            value={selectedAcademicYearId || ""}
            onChange={(e) => setSelectedAcademicYearId(e.target.value ? parseInt(e.target.value) : undefined)}
          >
            <option value="">All Years</option>
            {academicYears.map((year) => (
              <option key={year.id} value={year.id}>
                {year.year} - {year.name}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.filterGroup}>
          <label>Term</label>
          <select
            value={selectedTermId || ""}
            onChange={(e) => setSelectedTermId(e.target.value ? parseInt(e.target.value) : undefined)}
            disabled={!selectedAcademicYearId}
          >
            <option value="">All Terms</option>
            {terms.map((term) => (
              <option key={term.id} value={term.id}>
                {term.name}
              </option>
            ))}
          </select>
        </div>
        {viewMode === "daily" && (
          <div className={styles.filterGroup}>
            <label>Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Overview View */}
      {viewMode === "overview" && summary && (
        <>
          {/* Summary Cards */}
          <div className={styles.summaryCards}>
            <div className={styles.card}>
              <div className={styles.cardIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 4.354a4 4 0 1 1 0 5.292M15 21H3v-1a6 6 0 0 1 12 0v1Zm0 0h6v-1a6 6 0 0 0-9-5.197M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" />
                </svg>
              </div>
              <div className={styles.cardContent}>
                <span className={styles.cardValue}>{summary.totalStudents}</span>
                <span className={styles.cardLabel}>Total Students</span>
              </div>
            </div>
            <div className={styles.card}>
              <div className={styles.cardIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2Z" />
                </svg>
              </div>
              <div className={styles.cardContent}>
                <span className={styles.cardValue}>{summary.totalAttendanceRecords}</span>
                <span className={styles.cardLabel}>Total Records</span>
              </div>
            </div>
            <div className={styles.card}>
              <div className={styles.cardIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 19v-6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v6m-6 0h6m-6 0H7a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h2" />
                  <path d="M12 3v3m0 0-2-2m2 2 2-2" />
                </svg>
              </div>
              <div className={styles.cardContent}>
                <span className={styles.cardValue}>{summary.overallAttendanceRate}%</span>
                <span className={styles.cardLabel}>Attendance Rate</span>
              </div>
            </div>
            <div className={styles.card}>
              <div className={styles.cardIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </div>
              <div className={styles.cardContent}>
                <span className={styles.cardValue}>{summary.presentCount}</span>
                <span className={styles.cardLabel}>Present Days</span>
              </div>
            </div>
          </div>

          {/* Students Table */}
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Admission No.</th>
                  <th>Present</th>
                  <th>Absent</th>
                  <th>Late</th>
                  <th>Excused</th>
                  <th>Total Days</th>
                  <th>Rate</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id}>
                    <td className={styles.studentCell}>
                      <div className={styles.studentAvatar}>
                        {student.first_name?.[0] || ""}{student.last_name?.[0] || ""}
                      </div>
                      <span>{student.full_name || `${student.first_name} ${student.last_name}`}</span>
                    </td>
                    <td>{student.admission_number || student.student_number || "—"}</td>
                    <td className={styles.presentText}>{student.attendance.presentDays}</td>
                    <td className={styles.absentText}>{student.attendance.absentDays}</td>
                    <td className={styles.lateText}>{student.attendance.lateDays}</td>
                    <td className={styles.excusedText}>{student.attendance.excusedDays}</td>
                    <td>{student.attendance.totalDays}</td>
                    <td>
                      <span className={`${styles.rateBadge} ${parseFloat(student.attendance.attendanceRate) >= 80 ? styles.rateGood : parseFloat(student.attendance.attendanceRate) >= 60 ? styles.rateAverage : styles.ratePoor}`}>
                        {student.attendance.attendanceRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Daily Attendance View */}
      {viewMode === "daily" && (
        <>
          {/* Bulk Actions */}
          <div className={styles.bulkActions}>
            <div className={styles.bulkControls}>
              {selectedStudents.size > 0 && (
                <span className={styles.selectedCount}>{selectedStudents.size} student(s) selected</span>
              )}
              <button
                className={styles.bulkButton}
                onClick={() => setShowBulkModal(true)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 4v16m8-8H4" />
                </svg>
                Bulk Action
              </button>
              <button
                className={styles.selectAllButton}
                onClick={toggleSelectAll}
              >
                {selectedStudents.size === attendanceRecords.length && attendanceRecords.length > 0 ? "Deselect All" : "Select All"}
              </button>
            </div>
          </div>

          {/* Attendance Table */}
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.checkboxCol}>
                    <input
                      type="checkbox"
                      checked={selectedStudents.size === attendanceRecords.length && attendanceRecords.length > 0}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th>Student</th>
                  <th>Admission No.</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {attendanceRecords.map((record) => (
                  <tr key={record.student_id}>
                    <td className={styles.checkboxCol}>
                      <input
                        type="checkbox"
                        checked={selectedStudents.has(record.student_id)}
                        onChange={() => toggleStudentSelection(record.student_id)}
                      />
                    </td>
                    <td className={styles.studentCell}>
                      <div className={styles.studentAvatar}>
                        {record.first_name?.[0] || ""}{record.last_name?.[0] || ""}
                      </div>
                      <span>{record.full_name || `${record.first_name} ${record.last_name}`}</span>
                    </td>
                    <td>{record.admission_number || "—"}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${getStatusBadgeClass(record.status)}`}>
                        {getStatusText(record.status)}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actionButtons}>
                        <button
                          className={`${styles.statusButton} ${record.status === "present" ? styles.activePresent : ""}`}
                          onClick={() => handleMarkAttendance(record.student_id, "present")}
                          title="Present"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                        <button
                          className={`${styles.statusButton} ${record.status === "absent" ? styles.activeAbsent : ""}`}
                          onClick={() => handleMarkAttendance(record.student_id, "absent")}
                          title="Absent"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                        <button
                          className={`${styles.statusButton} ${record.status === "late" ? styles.activeLate : ""}`}
                          onClick={() => handleMarkAttendance(record.student_id, "late")}
                          title="Late"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 6v6l4 2" />
                          </svg>
                        </button>
                        <button
                          className={`${styles.statusButton} ${record.status === "excused" ? styles.activeExcused : ""}`}
                          onClick={() => handleMarkAttendance(record.student_id, "excused")}
                          title="Excused"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                          </svg>
                        </button>
                        <button
                          className={styles.detailsButton}
                          onClick={() => openDetailsModal(record)}
                          title="Add Details"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="3" />
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Bulk Action Modal */}
      {showBulkModal && (
        <div className={styles.modalOverlay} onClick={() => setShowBulkModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Bulk Attendance Action</h3>
              <button className={styles.closeButton} onClick={() => setShowBulkModal(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.modalText}>
                {selectedStudents.size > 0
                  ? `Apply action to ${selectedStudents.size} selected student(s)`
                  : "Apply action to ALL students in this class"}
              </p>
              <div className={styles.statusOptions}>
                <label className={styles.statusOption}>
                  <input
                    type="radio"
                    name="bulkStatus"
                    value="present"
                    checked={bulkStatus === "present"}
                    onChange={(e) => setBulkStatus(e.target.value)}
                  />
                  <span className={styles.statusPresentRadio}>Present</span>
                </label>
                <label className={styles.statusOption}>
                  <input
                    type="radio"
                    name="bulkStatus"
                    value="absent"
                    checked={bulkStatus === "absent"}
                    onChange={(e) => setBulkStatus(e.target.value)}
                  />
                  <span className={styles.statusAbsentRadio}>Absent</span>
                </label>
                <label className={styles.statusOption}>
                  <input
                    type="radio"
                    name="bulkStatus"
                    value="late"
                    checked={bulkStatus === "late"}
                    onChange={(e) => setBulkStatus(e.target.value)}
                  />
                  <span className={styles.statusLateRadio}>Late</span>
                </label>
                <label className={styles.statusOption}>
                  <input
                    type="radio"
                    name="bulkStatus"
                    value="excused"
                    checked={bulkStatus === "excused"}
                    onChange={(e) => setBulkStatus(e.target.value)}
                  />
                  <span className={styles.statusExcusedRadio}>Excused</span>
                </label>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelButton} onClick={() => setShowBulkModal(false)}>
                Cancel
              </button>
              <button
                className={styles.confirmButton}
                onClick={selectedStudents.size > 0 ? handleMarkSelected : handleMarkAll}
              >
                Apply to {selectedStudents.size > 0 ? `${selectedStudents.size} Student(s)` : "All Students"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Details Modal */}
      {showDetailsModal && selectedStudentDetails && (
        <div className={styles.modalOverlay} onClick={() => setShowDetailsModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Attendance Details</h3>
              <button className={styles.closeButton} onClick={() => setShowDetailsModal(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.detailsInfo}>
                <p><strong>Student:</strong> {selectedStudentDetails.full_name || `${selectedStudentDetails.first_name} ${selectedStudentDetails.last_name}`}</p>
                <p><strong>Date:</strong> {selectedDate}</p>
                <p><strong>Current Status:</strong> <span className={`${styles.statusBadge} ${getStatusBadgeClass(selectedStudentDetails.status)}`}>{getStatusText(selectedStudentDetails.status)}</span></p>
              </div>
              <div className={styles.formGroup}>
                <label>Check In Time</label>
                <input
                  type="time"
                  value={checkInTime}
                  onChange={(e) => setCheckInTime(e.target.value)}
                  className={styles.timeInput}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Check Out Time</label>
                <input
                  type="time"
                  value={checkOutTime}
                  onChange={(e) => setCheckOutTime(e.target.value)}
                  className={styles.timeInput}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Remarks</label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className={styles.remarksInput}
                  placeholder="Add any remarks (e.g., medical appointment, family emergency, etc.)"
                  rows={3}
                />
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelButton} onClick={() => setShowDetailsModal(false)}>
                Close
              </button>
              <button
                className={styles.submitButton}
                onClick={() => handleMarkAttendance(selectedStudentDetails.student_id, selectedStudentDetails.status || "present")}
              >
                Update Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}