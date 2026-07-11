// app/(dashboard)/reports/page.tsx
"use client";

import { useState, useEffect } from "react";
import styles from "./reports.module.css";
import Header from "@/components/Header/Header";
import Table from "@/components/Table/Table";
import TerminalReportModal from "@/components/TerminalReportModal";
import AnalysisModal from "@/components/ABTL/AnalysisModal";
import { formatScoresFromGrades, generateABTLReport } from "@/lib/abtl/abtlEngine";

// MOCK DATA - UI Presentation Only
const MOCK_CLASSES = [
  { id: 1, name: "JHS 1", level: "JHS", section: "A" },
  { id: 2, name: "JHS 1", level: "JHS", section: "B" },
  { id: 3, name: "JHS 2", level: "JHS", section: "A" },
  { id: 4, name: "JHS 2", level: "JHS", section: "B" },
  { id: 5, name: "JHS 3", level: "JHS", section: "A" },
  { id: 6, name: "JHS 3", level: "JHS", section: "B" },
];

// Fixed: year as number to match ReportData interface
const MOCK_ACADEMIC_YEARS = [
  { id: 1, year: 2024, term: "Term 1" },
  { id: 2, year: 2024, term: "Term 2" },
  { id: 3, year: 2024, term: "Term 3" },
];

const MOCK_STUDENTS: Student[] = [
  {
    id: 1,
    first_name: "Kwame",
    last_name: "Asare",
    admission_number: "JHS/001/24",
    student_id: "STU001",
    status: "active",
  },
  {
    id: 2,
    first_name: "Adwoa",
    last_name: "Mensah",
    admission_number: "JHS/002/24",
    student_id: "STU002",
    status: "active",
  },
  {
    id: 3,
    first_name: "John",
    last_name: "Darko",
    admission_number: "JHS/003/24",
    student_id: "STU003",
    status: "active",
  },
  {
    id: 4,
    first_name: "Efua",
    last_name: "Osei",
    admission_number: "JHS/004/24",
    student_id: "STU004",
    status: "active",
  },
  {
    id: 5,
    first_name: "Michael",
    last_name: "Appiah",
    admission_number: "JHS/005/24",
    student_id: "STU005",
    status: "inactive",
  },
  {
    id: 6,
    first_name: "Grace",
    last_name: "Tetteh",
    admission_number: "JHS/006/24",
    student_id: "STU006",
    status: "active",
  },
  {
    id: 7,
    first_name: "Daniel",
    last_name: "Quarshie",
    admission_number: "JHS/007/24",
    student_id: "STU007",
    status: "active",
  },
  {
    id: 8,
    first_name: "Princess",
    last_name: "Amankwah",
    admission_number: "JHS/008/24",
    student_id: "STU008",
    status: "active",
  },
];

interface Student {
  id: number;
  first_name: string;
  last_name: string;
  admission_number: string;
  student_id: string;
  status: string;
}

interface SubjectGrade {
  subjectId: number;
  subject: string;
  subjectCode: string;
  isMandatory: boolean;
  classScore: string;
  examScore: string;
  totalScore: string | null;
  letterGrade: string;
  remarks: string;
  hasScores: boolean;
  assessmentWeight: number;
  examWeight: number;
  assessmentCount: number;
  examCount: number;
}

interface ReportData {
  student: {
    id: number;
    name: string;
    firstName: string;
    lastName: string;
    admissionNumber: string;
    studentId: string;
  };
  class: {
    id: number;
    name: string;
    level: string;
    section: string | null;
  };
  academicYear: {
    id: number;
    year: number;
    term: string;
  };
  term: number;
  subjects: SubjectGrade[];
  teacherAssessments: any[];
  overallAverage: string | null;
  overallLetter: string;
  overallRemarks: string;
  summary: {
    totalSubjects: number;
    subjectsWithGrades: number;
    subjectsWithoutGrades: number;
  };
}

// Mock report data for preview
const MOCK_REPORT_DATA: ReportData = {
  student: {
    id: 1,
    name: "Kwame Asare",
    firstName: "Kwame",
    lastName: "Asare",
    admissionNumber: "JHS/001/24",
    studentId: "STU001",
  },
  class: {
    id: 1,
    name: "JHS 1",
    level: "JHS",
    section: "A",
  },
  academicYear: {
    id: 1,
    year: 2024,
    term: "Term 1",
  },
  term: 1,
  subjects: [
    {
      subjectId: 101,
      subject: "Mathematics",
      subjectCode: "MTH101",
      isMandatory: true,
      classScore: "85",
      examScore: "78",
      totalScore: "82.9",
      letterGrade: "B",
      remarks: "Good performance",
      hasScores: true,
      assessmentWeight: 70,
      examWeight: 30,
      assessmentCount: 5,
      examCount: 1,
    },
    {
      subjectId: 102,
      subject: "Integrated Science",
      subjectCode: "SCI101",
      isMandatory: true,
      classScore: "88",
      examScore: "82",
      totalScore: "86.2",
      letterGrade: "B",
      remarks: "Very good",
      hasScores: true,
      assessmentWeight: 70,
      examWeight: 30,
      assessmentCount: 5,
      examCount: 1,
    },
    {
      subjectId: 103,
      subject: "English Language",
      subjectCode: "ENG101",
      isMandatory: true,
      classScore: "78",
      examScore: "75",
      totalScore: "77.1",
      letterGrade: "C",
      remarks: "Satisfactory",
      hasScores: true,
      assessmentWeight: 70,
      examWeight: 30,
      assessmentCount: 5,
      examCount: 1,
    },
    {
      subjectId: 109,
      subject: "Ghanaian Language",
      subjectCode: "GHL101",
      isMandatory: false,
      classScore: "0",
      examScore: "0",
      totalScore: null,
      letterGrade: "-",
      remarks: "No grades entered",
      hasScores: false,
      assessmentWeight: 70,
      examWeight: 30,
      assessmentCount: 0,
      examCount: 0,
    },
  ],
  teacherAssessments: [],
  overallAverage: "82.1",
  overallLetter: "B",
  overallRemarks: "Good - Meets expectations",
  summary: {
    totalSubjects: 4,
    subjectsWithGrades: 3,
    subjectsWithoutGrades: 1,
  },
};

export default function ReportsPage() {
  const [classes] = useState(MOCK_CLASSES);
  const [academicYears] = useState(MOCK_ACADEMIC_YEARS);
  const [students] = useState<Student[]>(MOCK_STUDENTS);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportPdfUrl, setReportPdfUrl] = useState<string | null>(null);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [previewReportData, setPreviewReportData] = useState<ReportData | null>(
    null,
  );
  const [showPreview, setShowPreview] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);

  // Reopening Date State
  const [reopeningDate, setReopeningDate] = useState<string>("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Load saved reopening date from localStorage on mount
  useEffect(() => {
    const savedDate = localStorage.getItem("reopeningDate");
    if (savedDate) {
      setReopeningDate(savedDate);
    }
  }, []);

  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
const [abtlReport, setAbtlReport] = useState<any>(null);

// Add this function
const handleAnalyzeStudent = (student: Student) => {
  // Mock subject grades for the student - in real implementation, these would come from your data
  const studentGrades = {
    mathematics: "A",
    english: "B",
    science: "B",
    socialStudies: "C",
    rme: "A",
    computing: "B",
    creativeArts: "C",
    french: "D",
  };
  
  const scores = formatScoresFromGrades(studentGrades);
  const report = generateABTLReport(
    `${student.first_name} ${student.last_name}`,
    `Class ${selectedClass}`,
    scores
  );
  
  setAbtlReport(report);
  setShowAnalysisModal(true);
};

  // Save reopening date to localStorage whenever it changes
  const saveReopeningDate = (date: string) => {
    setReopeningDate(date);
    if (date) {
      localStorage.setItem("reopeningDate", date);
    } else {
      localStorage.removeItem("reopeningDate");
    }
    setShowDatePicker(false);
  };

  const clearReopeningDate = () => {
    setReopeningDate("");
    localStorage.removeItem("reopeningDate");
    setShowDatePicker(false);
  };

  // Format date for display
  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Filter students by selected class
  const filteredStudents = selectedClass ? students : [];

  const getTermNumber = (termString: string): number => {
    const termMap: { [key: string]: number } = {
      "Term 1": 1,
      "Term 2": 2,
      "Term 3": 3,
      "First Term": 1,
      "Second Term": 2,
      "Third Term": 3,
    };
    return termMap[termString] || 1;
  };

  const getReopeningDateForReport = () => {
    if (reopeningDate) {
      return formatDateForDisplay(reopeningDate);
    }
    return "To be announced";
  };

  const handlePreviewReport = async (student: Student) => {
    if (!selectedAcademicYear) {
      alert("Please select an academic year");
      return;
    }

    const selectedYear = academicYears.find(
      (y) => y.id === parseInt(selectedAcademicYear),
    );
    if (!selectedYear) {
      alert("Invalid academic year selected");
      return;
    }

    setSelectedStudent(student);
    setLoadingPreview(true);
    setShowPreview(true);

    // Simulate API call with mock data
    setTimeout(() => {
      // Get the selected class object
      const selectedClassObj = MOCK_CLASSES.find(
        (c) => c.id === parseInt(selectedClass),
      );

      // Customize mock data for the selected student
      const customizedReport: ReportData = {
        ...MOCK_REPORT_DATA,
        student: {
          id: student.id,
          name: `${student.first_name} ${student.last_name}`,
          firstName: student.first_name,
          lastName: student.last_name,
          admissionNumber: student.admission_number,
          studentId: student.student_id,
        },
        class: {
          id: parseInt(selectedClass),
          name: selectedClassObj?.name || "JHS 1",
          level: selectedClassObj?.level || "JHS",
          section: selectedClassObj?.section || null,
        },
        academicYear: {
          id: selectedYear.id,
          year: selectedYear.year,
          term: selectedYear.term,
        },
        term: getTermNumber(selectedYear.term),
      };
      setPreviewReportData(customizedReport);
      setLoadingPreview(false);
    }, 500);
  };

  const handleGeneratePDF = async (student: Student) => {
    if (!selectedAcademicYear) {
      alert("Please select an academic year");
      return;
    }

    setSelectedStudent(student);
    setGeneratingReport(true);
    setShowReportModal(true);

    // Simulate PDF generation
    setTimeout(() => {
      // Mock PDF URL - in real app this would be a blob URL
      setReportPdfUrl("#");
      setGeneratingReport(false);
    }, 1500);
  };

  const handleCloseModal = () => {
    setShowReportModal(false);
    setSelectedStudent(null);
    setReportPdfUrl(null);
  };

  const handleClosePreview = () => {
    setShowPreview(false);
    setPreviewReportData(null);
    setSelectedStudent(null);
  };

  const studentColumns = [
    {
      header: "Admission No.",
      accessor: "admission_number",
      sortable: true,
    },
    {
      header: "Student ID",
      accessor: "student_id",
      sortable: true,
    },
    {
      header: "Student Name",
      render: (row: Student) => `${row.first_name} ${row.last_name}`,
      sortable: true,
    },
    {
      header: "Status",
      accessor: "status",
      render: (row: Student) => (
        <span
          className={`${styles.statusBadge} ${row.status === "active" ? styles.statusActive : styles.statusInactive}`}
        >
          {row.status === "active" ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      header: "Actions",
      render: (row: Student) => (
        <div className={styles.actionButtons}>
          <button
          className={styles.analyzeButton}
          onClick={() => handleAnalyzeStudent(row)}
        >
          🎯 Analyze
        </button>
          <button
            className={styles.previewButton}
            onClick={() => handlePreviewReport(row)}
            disabled={generatingReport || loadingPreview}
          >
            Preview
          </button>
          <button
            className={styles.viewReportButton}
            onClick={() => handleGeneratePDF(row)}
            disabled={generatingReport}
          >
            Generate PDF
          </button>
        </div>
      ),
    },
  ];
  <AnalysisModal
    isOpen={showAnalysisModal}
    onClose={() => setShowAnalysisModal(false)}
    report={abtlReport}
    studentName={abtlReport?.studentName || ""}
  />;
  const getClassName = () => {
    const classObj = classes.find((c) => c.id === parseInt(selectedClass));
    return classObj ? `${classObj.name} (${classObj.level})` : "";
  };

  const getAcademicYearDisplay = () => {
    const yearObj = academicYears.find(
      (y) => y.id === parseInt(selectedAcademicYear),
    );
    return yearObj ? `${yearObj.year} - ${yearObj.term}` : "";
  };

  const getSelectedTermLabel = () => {
    const yearObj = academicYears.find(
      (y) => y.id === parseInt(selectedAcademicYear),
    );
    return yearObj ? yearObj.term : "";
  };

  return (
    <div className={styles.pageContainer}>
      <Header
        title="Terminal Reports"
        subtitle="Generate and print student terminal reports based on curriculum (class_subject)"
      />

      <div className={styles.contentWrapper}>
        {/* Reopening Date Section */}
        <div className={styles.reopeningDateSection}>
          <div className={styles.reopeningDateHeader}>
            <div className={styles.reopeningDateTitle}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Reopening Date</span>
            </div>
            <div className={styles.reopeningDateDisplay}>
              {reopeningDate ? (
                <>
                  <span className={styles.dateValue}>
                    📅 {formatDateForDisplay(reopeningDate)}
                  </span>
                  <button
                    className={styles.editDateButton}
                    onClick={() => setShowDatePicker(true)}
                    title="Edit reopening date"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Edit
                  </button>
                  <button
                    className={styles.clearDateButton}
                    onClick={clearReopeningDate}
                    title="Clear reopening date"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </>
              ) : (
                <>
                  <span className={styles.datePlaceholder}>
                    No reopening date set (will show "To be announced")
                  </span>
                  <button
                    className={styles.setDateButton}
                    onClick={() => setShowDatePicker(true)}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 4v16m8-8H4" />
                    </svg>
                    Set Reopening Date
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Date Picker Modal */}
          {showDatePicker && (
            <div
              className={styles.datePickerOverlay}
              onClick={() => setShowDatePicker(false)}
            >
              <div
                className={styles.datePickerModal}
                onClick={(e) => e.stopPropagation()}
              >
                <div className={styles.datePickerHeader}>
                  <h3>Set Reopening Date</h3>
                  <button
                    className={styles.closeButton}
                    onClick={() => setShowDatePicker(false)}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className={styles.datePickerBody}>
                  <p>Select the date when school reopens after the break.</p>
                  <input
                    type="date"
                    className={styles.dateInput}
                    value={reopeningDate}
                    onChange={(e) => setReopeningDate(e.target.value)}
                  />
                </div>
                <div className={styles.datePickerFooter}>
                  <button
                    className={styles.cancelButton}
                    onClick={() => setShowDatePicker(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className={styles.saveButton}
                    onClick={() => saveReopeningDate(reopeningDate)}
                  >
                    Save Date
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className={styles.filterSection}>
          <div className={styles.filterRow}>
            <div className={styles.filterGroup}>
              <label>Class *</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className={styles.select}
              >
                <option value="">Select Class</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} ({cls.level}) - Section {cls.section}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label>Academic Year *</label>
              <select
                value={selectedAcademicYear}
                onChange={(e) => setSelectedAcademicYear(e.target.value)}
                className={styles.select}
              >
                <option value="">Select Academic Year</option>
                {academicYears.map((year) => (
                  <option key={year.id} value={year.id}>
                    {year.year} - {year.term}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        {selectedClass && selectedAcademicYear && (
          <div className={styles.infoBanner}>
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path
                fill="currentColor"
                d="M12,2C6.48,2,2,6.48,2,12s4.48,10,10,10s10-4.48,10-10S17.52,2,12,2z M12,20c-4.41,0-8-3.59-8-8s3.59-8,8-8s8,3.59,8,8 S16.41,20,12,20z M11,7h2v6h-2V7z M11,15h2v2h-2V15z"
              />
            </svg>
            <div>
              <strong>Note:</strong> Reports are generated based on the
              curriculum defined in Class Subjects. Subjects without grades will
              show "-" to indicate missing data.
              {reopeningDate && (
                <span className={styles.reopeningNote}>
                  {" "}
                  Reopening date: {formatDateForDisplay(reopeningDate)}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Students Table */}
        {selectedClass && selectedAcademicYear ? (
          <div className={styles.tableSection}>
            <Table
              columns={studentColumns}
              data={filteredStudents}
              variant="default"
              size="md"
              pagination={true}
              pageSize={10}
              showRowNumbers={true}
              emptyMessage="No students found in this class"
              loading={false}
            />
          </div>
        ) : (
          <div className={styles.emptyState}>
            Please select a class and academic year to view students
          </div>
        )}
      </div>

      {/* Report Preview Modal */}
      {showPreview && previewReportData && (
        <div className={styles.modalOverlay} onClick={handleClosePreview}>
          <div
            className={`${styles.modal} ${styles.previewModal}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2>Report Preview: {previewReportData.student.name}</h2>
              <button
                className={styles.closeButton}
                onClick={handleClosePreview}
              >
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path
                    fill="currentColor"
                    d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"
                  />
                </svg>
              </button>
            </div>
            <div className={styles.modalBody}>
              {loadingPreview ? (
                <div className={styles.loadingState}>Loading preview...</div>
              ) : (
                <>
                  {/* Student Info */}
                  <div className={styles.previewSection}>
                    <h3>Student Information</h3>
                    <div className={styles.infoGrid}>
                      <div>
                        <strong>Name:</strong> {previewReportData.student.name}
                      </div>
                      <div>
                        <strong>Admission No:</strong>{" "}
                        {previewReportData.student.admissionNumber || "N/A"}
                      </div>
                      <div>
                        <strong>Class:</strong> {previewReportData.class.name}{" "}
                        {previewReportData.class.section
                          ? `- ${previewReportData.class.section}`
                          : ""}
                      </div>
                      <div>
                        <strong>Academic Year:</strong>{" "}
                        {previewReportData.academicYear.year}
                      </div>
                      <div>
                        <strong>Term:</strong>{" "}
                        {previewReportData.academicYear.term}
                      </div>
                      <div>
                        <strong>Reopening Date:</strong>{" "}
                        {getReopeningDateForReport()}
                      </div>
                    </div>
                  </div>

                  {/* Subjects Table */}
                  <div className={styles.previewSection}>
                    <h3>Subject Performance</h3>
                    <div className={styles.subjectsTable}>
                      <table className={styles.previewTable}>
                        <thead>
                          <tr>
                            <th>Subject</th>
                            <th>Class Score (%)</th>
                            <th>Exam Score (%)</th>
                            <th>Total Score (%)</th>
                            <th>Grade</th>
                            <th>Remarks</th>
                          </tr>
                        </thead>
                        <tbody>
                          {previewReportData.subjects.map((subject, idx) => (
                            <tr
                              key={idx}
                              className={
                                !subject.hasScores ? styles.noGrade : ""
                              }
                            >
                              <td>
                                {subject.subject}
                                {subject.isMandatory && (
                                  <span className={styles.mandatoryBadge}>
                                    Mandatory
                                  </span>
                                )}
                              </td>
                              <td>{subject.classScore}%</td>
                              <td>{subject.examScore}%</td>
                              <td className={styles.totalScore}>
                                {subject.totalScore
                                  ? `${subject.totalScore}%`
                                  : "-"}
                              </td>
                              <td className={styles.gradeCell}>
                                <span
                                  className={`${styles.gradeBadge} ${styles[`grade${subject.letterGrade}`]}`}
                                >
                                  {subject.letterGrade}
                                </span>
                              </td>
                              <td>{subject.remarks}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Summary Stats */}
                  <div className={styles.previewSection}>
                    <h3>Performance Summary</h3>
                    <div className={styles.summaryGrid}>
                      <div className={styles.summaryCard}>
                        <div className={styles.summaryLabel}>
                          Overall Average
                        </div>
                        <div className={styles.summaryValue}>
                          {previewReportData.overallAverage
                            ? `${previewReportData.overallAverage}%`
                            : "N/A"}
                        </div>
                      </div>
                      <div className={styles.summaryCard}>
                        <div className={styles.summaryLabel}>Overall Grade</div>
                        <div
                          className={`${styles.summaryValue} ${styles[`grade${previewReportData.overallLetter}`]}`}
                        >
                          {previewReportData.overallLetter}
                        </div>
                      </div>
                      <div className={styles.summaryCard}>
                        <div className={styles.summaryLabel}>
                          Subjects with Grades
                        </div>
                        <div className={styles.summaryValue}>
                          {previewReportData.summary.subjectsWithGrades} /{" "}
                          {previewReportData.summary.totalSubjects}
                        </div>
                      </div>
                      <div className={styles.summaryCard}>
                        <div className={styles.summaryLabel}>Status</div>
                        <div className={styles.summaryValue}>
                          {previewReportData.overallRemarks}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Missing Grades Warning */}
                  {previewReportData.summary.subjectsWithoutGrades > 0 && (
                    <div className={styles.warningBox}>
                      <svg viewBox="0 0 24 24" width="20" height="20">
                        <path
                          fill="currentColor"
                          d="M13,14H11V10H13M13,18H11V16H13M1,21H23L12,2L1,21Z"
                        />
                      </svg>
                      <div>
                        <strong>Note:</strong>{" "}
                        {previewReportData.summary.subjectsWithoutGrades}{" "}
                        subject(s) have no grades entered. These will appear as
                        "-" in the final report.
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className={styles.modalFooter}>
              <button
                className={styles.cancelButton}
                onClick={handleClosePreview}
              >
                Close Preview
              </button>
              <button
                className={styles.generateButton}
                onClick={() => {
                  handleClosePreview();
                  if (selectedStudent) {
                    handleGeneratePDF(selectedStudent);
                  }
                }}
              >
                Generate Full PDF Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Terminal Report Modal for PDF */}
      <TerminalReportModal
        isOpen={showReportModal}
        onClose={handleCloseModal}
        studentName={
          selectedStudent
            ? `${selectedStudent.first_name} ${selectedStudent.last_name}`
            : ""
        }
        className={getClassName()}
        term={getSelectedTermLabel()}
        academicYear={getAcademicYearDisplay()}
        pdfUrl={reportPdfUrl}
        isLoading={generatingReport}
      />
    </div>
  );
}
