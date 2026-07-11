// app/(dashboard)/reports/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import styles from "./reports.module.css";
import Header from "@/components/Header/Header";
import Table from "@/components/Table/Table";
import TerminalReportModal from "@/components/TerminalReportModal";
import { 
  getClasses, 
  getAcademicYears, 
  getTerms,
  getStudentsByClass,
  getStudentTerminalReportData,
} from "@/lib/action/admin/grading";
import { generateStudentTerminalReport } from "@/lib/actions/pdf";

interface Student {
  id: number;
  first_name: string;
  last_name: string;
  other_names?: string;
  admission_number: string;
  student_number: string;
  status: string;
  full_name?: string;
}

interface SubjectGrade {
  subjectId: number;
  subject: string;
  subjectCode: string;
  isMandatory: boolean;
  weeklyHours?: number;
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
    studentNumber: string;
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
    name: string;
  };
  term: {
    id: number;
    term_number: number;
    name: string;
  } | null;
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

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState<string>("");
  const [selectedTermId, setSelectedTermId] = useState<string>("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportPdfUrl, setReportPdfUrl] = useState<string | null>(null);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [previewReportData, setPreviewReportData] = useState<ReportData | null>(null);
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

  useEffect(() => {
    loadInitialData();
  }, []);

  // Load terms when academic year changes
  useEffect(() => {
    if (selectedAcademicYearId) {
      loadTerms(parseInt(selectedAcademicYearId));
    } else {
      setTerms([]);
      setSelectedTermId("");
    }
  }, [selectedAcademicYearId]);

  useEffect(() => {
    if (selectedClass && selectedAcademicYearId) {
      loadStudents();
    } else {
      setStudents([]);
    }
  }, [selectedClass, selectedAcademicYearId]);

  const loadInitialData = async () => {
    setLoading(true);
    const classesResult = await getClasses();
    if (classesResult.classes) setClasses(classesResult.classes);

    const yearsResult = await getAcademicYears();
    if (yearsResult.years) {
      setAcademicYears(yearsResult.years);
      // Auto-select active academic year
      const activeYear = yearsResult.years.find((y: AcademicYear) => y.is_active);
      if (activeYear) {
        setSelectedAcademicYearId(activeYear.id.toString());
      }
    }
    setLoading(false);
  };

  const loadTerms = async (academicYearId: number) => {
    const result = await getTerms(academicYearId);
    if (result.terms && result.terms.length > 0) {
      setTerms(result.terms);
      // Auto-select active term
      const activeTerm = result.terms.find((t: Term) => t.is_active);
      if (activeTerm) {
        setSelectedTermId(activeTerm.id.toString());
      } else if (result.terms.length > 0) {
        setSelectedTermId(result.terms[0].id.toString());
      }
    } else {
      setTerms([]);
      setSelectedTermId("");
    }
  };

  const loadStudents = async () => {
    setLoading(true);
    const result = await getStudentsByClass(parseInt(selectedClass));
    if (result.students) {
      const formattedStudents = result.students.map((student: any) => ({
        ...student,
        full_name: `${student.first_name} ${student.last_name}${student.other_names ? ` ${student.other_names}` : ''}`,
      }));
      setStudents(formattedStudents);
    }
    setLoading(false);
  };

  // Get the reopening date to use in reports
  const getReopeningDateForReport = () => {
    if (reopeningDate) {
      return formatDateForDisplay(reopeningDate);
    }
    return "To be announced";
  };

  const handlePreviewReport = async (student: Student) => {
    if (!selectedAcademicYearId) {
      alert("Please select an academic year");
      return;
    }

    const selectedYear = academicYears.find(y => y.id === parseInt(selectedAcademicYearId));
    if (!selectedYear) {
      alert("Invalid academic year selected");
      return;
    }

    setSelectedStudent(student);
    setLoadingPreview(true);
    setShowPreview(true);

    try {
      const result = await getStudentTerminalReportData(
        student.id,
        parseInt(selectedClass),
        parseInt(selectedAcademicYearId),
        selectedTermId ? parseInt(selectedTermId) : undefined
      );

      if (!result.error) {
        setPreviewReportData(result as ReportData);
      } else {
        alert(result.error || "Failed to load report preview");
        setShowPreview(false);
      }
    } catch (error) {
      console.error("Error loading report preview:", error);
      alert("Failed to load report preview");
      setShowPreview(false);
    } finally {
      setLoadingPreview(false);
    }
  };

const handleGeneratePDF = async (student: Student) => {
  if (!selectedAcademicYearId) {
    alert("Please select an academic year");
    return;
  }

  const selectedYear = academicYears.find(y => y.id === parseInt(selectedAcademicYearId));
  if (!selectedYear) {
    alert("Invalid academic year selected");
    return;
  }

  // ✅ FIX: Use selectedTermId directly, don't convert to term_number
  const termId = selectedTermId ? parseInt(selectedTermId) : undefined;

  setSelectedStudent(student);
  setGeneratingReport(true);
  setShowReportModal(true);

  try {
    const result = await generateStudentTerminalReport({
      studentId: student.id,
      classId: parseInt(selectedClass),
      academicYearId: parseInt(selectedAcademicYearId),
      term: termId,  // ✅ Pass the actual term_id (11), not the term_number (1)
      customData: {
        reopeningDate: getReopeningDateForReport(),
      },
    });

    if (result.success && result.pdf) {
      setReportPdfUrl(result.pdf);
    } else {
      alert(result.error || "Failed to generate report");
      setShowReportModal(false);
    }
  } catch (error) {
    console.error("Error generating report:", error);
    alert("Failed to generate report");
    setShowReportModal(false);
  } finally {
    setGeneratingReport(false);
  }
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
      accessor: "student_number",
      sortable: true,
    },
    {
      header: "Student Name",
      render: (row: Student) => row.full_name || `${row.first_name} ${row.last_name}`,
      sortable: true,
    },
    {
      header: "Status",
      accessor: "status",
      render: (row: Student) => (
        <span className={`${styles.statusBadge} ${row.status === "active" ? styles.statusActive : styles.statusInactive}`}>
          {row.status === "active" ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      header: "Actions",
      render: (row: Student) => (
        <div className={styles.actionButtons}>
          <button
            className={styles.previewButton}
            onClick={() => handlePreviewReport(row)}
            disabled={generatingReport || loadingPreview || !selectedTermId}
            title={!selectedTermId ? "Please select a term first" : ""}
          >
            Preview
          </button>
          <button
            className={styles.viewReportButton}
            onClick={() => handleGeneratePDF(row)}
            disabled={generatingReport || !selectedTermId}
            title={!selectedTermId ? "Please select a term first" : ""}
          >
            Generate PDF
          </button>
        </div>
      ),
    },
  ];

  // Get class name for display
  const getClassName = () => {
    const classObj = classes.find(c => c.id === parseInt(selectedClass));
    return classObj ? `${classObj.name}${classObj.section ? ` - ${classObj.section}` : ''} (${classObj.level})` : "";
  };

  // Get academic year display
  const getAcademicYearDisplay = () => {
    const yearObj = academicYears.find(y => y.id === parseInt(selectedAcademicYearId));
    return yearObj ? `${yearObj.year} - ${yearObj.name}` : "";
  };

  // Get selected term label for display
  const getSelectedTermLabel = () => {
    const termObj = terms.find(t => t.id === parseInt(selectedTermId));
    return termObj ? termObj.name : "";
  };

  return (
    <div className={styles.pageContainer}>
      <Header
        title="Terminal Reports"
        subtitle="Generate and print student terminal reports based on curriculum"
      />

      <div className={styles.contentWrapper}>
        {/* Reopening Date Section */}
        <div className={styles.reopeningDateSection}>
          <div className={styles.reopeningDateHeader}>
            <div className={styles.reopeningDateTitle}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Edit
                  </button>
                  <button
                    className={styles.clearDateButton}
                    onClick={clearReopeningDate}
                    title="Clear reopening date"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
            <div className={styles.datePickerOverlay} onClick={() => setShowDatePicker(false)}>
              <div className={styles.datePickerModal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.datePickerHeader}>
                  <h3>Set Reopening Date</h3>
                  <button className={styles.closeButton} onClick={() => setShowDatePicker(false)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                    {cls.name} {cls.section ? `- ${cls.section}` : ""} ({cls.level})
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label>Academic Year *</label>
              <select
                value={selectedAcademicYearId}
                onChange={(e) => setSelectedAcademicYearId(e.target.value)}
                className={styles.select}
              >
                <option value="">Select Academic Year</option>
                {academicYears.map((year) => (
                  <option key={year.id} value={year.id}>
                    {year.year} - {year.name}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label>Term *</label>
              <select
                value={selectedTermId}
                onChange={(e) => setSelectedTermId(e.target.value)}
                className={styles.select}
                disabled={!selectedAcademicYearId}
              >
                <option value="">Select Term</option>
                {terms.map((term) => (
                  <option key={term.id} value={term.id}>
                    {term.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        {selectedClass && selectedAcademicYearId && selectedTermId && (
          <div className={styles.infoBanner}>
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M12,2C6.48,2,2,6.48,2,12s4.48,10,10,10s10-4.48,10-10S17.52,2,12,2z M12,20c-4.41,0-8-3.59-8-8s3.59-8,8-8s8,3.59,8,8 S16.41,20,12,20z M11,7h2v6h-2V7z M11,15h2v2h-2V15z"/>
            </svg>
            <div>
              <strong>Note:</strong> Reports are generated based on the curriculum. 
              Subjects without grades will show "-" to indicate missing data.
              {reopeningDate && (
                <span className={styles.reopeningNote}> Reopening date: {formatDateForDisplay(reopeningDate)}</span>
              )}
            </div>
          </div>
        )}

        {/* Students Table */}
        {selectedClass && selectedAcademicYearId && selectedTermId ? (
          <div className={styles.tableSection}>
            <Table
              columns={studentColumns}
              data={students}
              variant="default"
              size="md"
              pagination={true}
              pageSize={10}
              showRowNumbers={true}
              emptyMessage="No students found in this class"
              loading={loading}
            />
          </div>
        ) : (
          <div className={styles.emptyState}>
            Please select a class, academic year, and term to view students
          </div>
        )}
      </div>

      {/* Report Preview Modal */}
      {showPreview && previewReportData && (
        <div className={styles.modalOverlay} onClick={handleClosePreview}>
          <div className={`${styles.modal} ${styles.previewModal}`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Report Preview: {previewReportData.student.name}</h2>
              <button className={styles.closeButton} onClick={handleClosePreview}>
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
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
                      <div><strong>Name:</strong> {previewReportData.student.name}</div>
                      <div><strong>Admission No:</strong> {previewReportData.student.admissionNumber || "N/A"}</div>
                      <div><strong>Class:</strong> {previewReportData.class.name}{previewReportData.class.section ? ` - ${previewReportData.class.section}` : ''}</div>
                      <div><strong>Academic Year:</strong> {previewReportData.academicYear.year}</div>
                      <div><strong>Term:</strong> {previewReportData.term?.name || "Full Year"}</div>
                      <div><strong>Reopening Date:</strong> {getReopeningDateForReport()}</div>
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
                            <th>Assessment ({previewReportData.subjects[0]?.assessmentWeight || 70}%)</th>
                            <th>Exam ({previewReportData.subjects[0]?.examWeight || 30}%)</th>
                            <th>Total Score</th>
                            <th>Grade</th>
                            <th>Remarks</th>
                          </tr>
                        </thead>
                        <tbody>
                          {previewReportData.subjects.map((subject, idx) => (
                            <tr key={idx} className={!subject.hasScores ? styles.noGrade : ""}>
                              <td>
                                {subject.subject}
                                {subject.isMandatory && <span className={styles.mandatoryBadge}>Mandatory</span>}
                              </td>
                              <td className={styles.scoreCell}>
                                {subject.hasScores ? `${subject.classScore}%` : "-"}
                                {subject.assessmentCount > 0 && (
                                  <span className={styles.scoreCount}>({subject.assessmentCount} items)</span>
                                )}
                              </td>
                              <td className={styles.scoreCell}>
                                {subject.hasScores ? `${subject.examScore}%` : "-"}
                                {subject.examCount > 0 && (
                                  <span className={styles.scoreCount}>({subject.examCount} items)</span>
                                )}
                              </td>
                              <td className={styles.totalScore}>
                                {subject.totalScore ? `${subject.totalScore}%` : "-"}
                              </td>
                              <td className={styles.gradeCell}>
                                {subject.hasScores ? (
                                  <span className={`${styles.gradeBadge} ${styles[`grade${subject.letterGrade}`]}`}>
                                    {subject.letterGrade}
                                  </span>
                                ) : "-"}
                              </td>
                              <td className={styles.remarksCell}>{subject.remarks}</td>
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
                        <div className={styles.summaryLabel}>Overall Average</div>
                        <div className={styles.summaryValue}>
                          {previewReportData.overallAverage ? `${previewReportData.overallAverage}%` : "N/A"}
                        </div>
                      </div>
                      <div className={styles.summaryCard}>
                        <div className={styles.summaryLabel}>Overall Grade</div>
                        <div className={`${styles.summaryValue} ${styles[`grade${previewReportData.overallLetter}`]}`}>
                          {previewReportData.overallLetter}
                        </div>
                      </div>
                      <div className={styles.summaryCard}>
                        <div className={styles.summaryLabel}>Subjects with Grades</div>
                        <div className={styles.summaryValue}>
                          {previewReportData.summary.subjectsWithGrades} / {previewReportData.summary.totalSubjects}
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
                        <path fill="currentColor" d="M13,14H11V10H13M13,18H11V16H13M1,21H23L12,2L1,21Z" />
                      </svg>
                      <div>
                        <strong>Note:</strong> {previewReportData.summary.subjectsWithoutGrades} subject(s) have no grades entered. 
                        These will appear as "-" in the final report.
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelButton} onClick={handleClosePreview}>
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
        studentName={selectedStudent ? (selectedStudent.full_name || `${selectedStudent.first_name} ${selectedStudent.last_name}`) : ""}
        className={getClassName()}
        term={getSelectedTermLabel()}
        academicYear={getAcademicYearDisplay()}
        pdfUrl={reportPdfUrl}
        isLoading={generatingReport}
      />
    </div>
  );
}