// app/(dashboard)/grading/page.tsx
"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  getClasses,
  getAcademicYears,
  getTerms,
  getGradingSummary,
  getClassSubjectList,
  getOverallGradingStats,
} from "@/lib/action/admin/grading";
import Header from "@/components/Header/Header";
import Stats from "@/components/Stats/Stats";
import Table from "@/components/Table/Table";
import styles from "./page.module.css";
import { exportToCSV } from "@/utils/export/csv";
import { exportToPDF } from "@/utils/export/pdf";

type ClassType = {
  id: number;
  name: string;
  level: string;
  section: string | null;
  sequence: number;
};

type SubjectType = {
  id: number;
  title: string;
  subject_code: string;
  credit_hours?: number;
  is_mandatory: boolean;
  weekly_hours?: number;
};

type Term = {
  id: number;
  term_number: number;
  name: string;
  is_active: boolean;
};

type AcademicYear = {
  id: number;
  year: number;
  name: string;
  is_active: boolean;
};

type StudentGrade = {
  student: {
    id: number;
    name: string;
    first_name: string;
    last_name: string;
    admission_number: string;
    student_number: string;
  };
  assessments: {
    total: number;
    maxTotal: number;
    percentage: string;
    count: number;
  };
  exams: {
    total: number;
    maxTotal: number;
    percentage: string;
    count: number;
  };
  finalScore: string | null;
  letterGrade: string;
  gradePoint: number | null;
  remarks: string;
  hasScores: boolean;
  isPassing: boolean;
};

type GradingSummary = {
  class: ClassType;
  subject: SubjectType;
  teacher: any;
  isMandatory: boolean;
  weeklyHours?: number;
  settings: {
    assessmentWeight: number;
    examWeight: number;
    passMark: number;
  };
  students: StudentGrade[];
  summary: {
    totalStudents: number;
    studentsWithScores: number;
    studentsWithoutScores: number;
    classAverage: string;
    passCount: number;
    failCount: number;
    passRate: string;
    gradeDistribution: {
      A: number;
      B: number;
      C: number;
      D: number;
      E: number;
      F: number;
      NoGrade: number;
    };
  };
};

export default function GradingPage() {
  const [loading, setLoading] = useState(true);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [classes, setClasses] = useState<ClassType[]>([]);
  const [subjects, setSubjects] = useState<SubjectType[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>("");
  const [selectedTermId, setSelectedTermId] = useState<string>("");
  const [gradingData, setGradingData] = useState<GradingSummary | null>(null);
  const [overallStats, setOverallStats] = useState<any>(null);

  // Load classes and academic years on mount
  useEffect(() => {
    loadFilters();
  }, []);

  // Load terms when academic year changes
  useEffect(() => {
    if (selectedAcademicYear) {
      loadTerms(parseInt(selectedAcademicYear));
    } else {
      setTerms([]);
      setSelectedTermId("");
    }
  }, [selectedAcademicYear]);

  // Load subjects when class changes (using class_subject)
  useEffect(() => {
    if (selectedClass) {
      loadSubjectsForClass();
    } else {
      setSubjects([]);
      setSelectedSubject("");
    }
  }, [selectedClass, selectedAcademicYear]);

  // Load grading data when class, subject, academic year, or term changes
  useEffect(() => {
    if (selectedClass && selectedSubject && selectedAcademicYear) {
      loadGradingData();
    } else {
      setGradingData(null);
    }
  }, [selectedClass, selectedSubject, selectedAcademicYear, selectedTermId]);

  // Load overall stats when filters change
  useEffect(() => {
    if (selectedAcademicYear || selectedTermId) {
      loadOverallStats();
    }
  }, [selectedAcademicYear, selectedTermId]);

  const loadFilters = async () => {
    setLoading(true);
    const classesResult = await getClasses();
    if (classesResult.classes) setClasses(classesResult.classes);

    const yearsResult = await getAcademicYears();
    if (yearsResult.years) {
      setAcademicYears(yearsResult.years);
      // Auto-select active academic year
      const activeYear = yearsResult.years.find((y: AcademicYear) => y.is_active);
      if (activeYear) {
        setSelectedAcademicYear(activeYear.id.toString());
      }
    }
    setLoading(false);
  };

  const loadTerms = async (academicYearId: number) => {
    const result = await getTerms(academicYearId);
    if (result.terms) {
      setTerms(result.terms);
      // Auto-select active term
      const activeTerm = result.terms.find((t: Term) => t.is_active);
      if (activeTerm) {
        setSelectedTermId(activeTerm.id.toString());
      }
    }
  };

  const loadSubjectsForClass = async () => {
    setLoadingSubjects(true);
    setSelectedSubject("");

    const result = await getClassSubjectList(
      parseInt(selectedClass),
      selectedAcademicYear ? parseInt(selectedAcademicYear) : undefined,
      selectedTermId ? parseInt(selectedTermId) : undefined,
    );

    if (result.subjects) {
      setSubjects(result.subjects);
    } else {
      setSubjects([]);
    }
    setLoadingSubjects(false);
  };

  const loadGradingData = async () => {
    setLoading(true);
    const result = await getGradingSummary(
      parseInt(selectedClass),
      parseInt(selectedSubject),
      selectedAcademicYear ? parseInt(selectedAcademicYear) : undefined,
      selectedTermId ? parseInt(selectedTermId) : undefined,
    );

    if (!result.error && result.class) {
      setGradingData(result as unknown as GradingSummary);
    } else {
      setGradingData(null);
      if (result.error) {
        console.error("Error loading grading data:", result.error);
      }
    }
    setLoading(false);
  };

  const loadOverallStats = async () => {
    const result = await getOverallGradingStats(
      selectedAcademicYear ? parseInt(selectedAcademicYear) : undefined,
      selectedTermId ? parseInt(selectedTermId) : undefined,
    );
    if (result.stats) setOverallStats(result.stats);
  };

  // ============================================
  // EXPORT FUNCTIONALITY
  // ============================================

  // Export columns for Grading Data (when a class and subject are selected)
  const getGradingExportColumns = () => [
    { header: "Student Name", accessor: (row: StudentGrade) => row.student.name || "—" },
    { header: "Admission Number", accessor: (row: StudentGrade) => row.student.admission_number || row.student.student_number || "—" },
    { header: "Assessment Total", accessor: (row: StudentGrade) => row.assessments.total.toString() },
    { header: "Assessment Max Total", accessor: (row: StudentGrade) => row.assessments.maxTotal.toString() },
    { header: "Assessment Percentage (%)", accessor: (row: StudentGrade) => row.assessments.percentage },
    { header: "Assessment Count", accessor: (row: StudentGrade) => row.assessments.count.toString() },
    { header: "Exam Total", accessor: (row: StudentGrade) => row.exams.total.toString() },
    { header: "Exam Max Total", accessor: (row: StudentGrade) => row.exams.maxTotal.toString() },
    { header: "Exam Percentage (%)", accessor: (row: StudentGrade) => row.exams.percentage },
    { header: "Exam Count", accessor: (row: StudentGrade) => row.exams.count.toString() },
    { header: "Final Score (%)", accessor: (row: StudentGrade) => row.finalScore || "—" },
    { header: "Letter Grade", accessor: (row: StudentGrade) => row.letterGrade },
    { header: "Remarks", accessor: (row: StudentGrade) => row.remarks },
    { header: "Has Scores", accessor: (row: StudentGrade) => row.hasScores ? "Yes" : "No" },
    { header: "Is Passing", accessor: (row: StudentGrade) => row.isPassing ? "Yes" : "No" },
  ];

  // Export columns for Grade Distribution
  const getGradeDistributionExportColumns = () => [
    { header: "Grade", accessor: (row: [string, number]) => row[0] === "NoGrade" ? "No Grade" : `Grade ${row[0]}` },
    { header: "Number of Students", accessor: (row: [string, number]) => row[1].toString() },
    { header: "Percentage (%)", accessor: (row: [string, number]) => {
      const total = gradingData?.summary.totalStudents || 1;
      return ((row[1] / total) * 100).toFixed(1);
    }},
  ];

  const handleExport = useCallback(async (format: "pdf" | "csv") => {
    if (gradingData) {
      // Export grading data (students table)
      const dataToExport = gradingData.students;
      const columns = getGradingExportColumns();
      const filename = `grades-${gradingData.class.name}-${gradingData.subject.title}-${new Date().toISOString().split("T")[0]}`;
      const title = `Grading Report - ${gradingData.class.name} - ${gradingData.subject.title}`;
      const subtitle = `Assessment Weight: ${gradingData.settings.assessmentWeight}% | Exam Weight: ${gradingData.settings.examWeight}% | Pass Mark: ${gradingData.settings.passMark}% | Class Average: ${gradingData.summary.classAverage}% | Pass Rate: ${gradingData.summary.passRate}% | Generated on ${new Date().toLocaleDateString()}`;

      if (format === "csv") {
        exportToCSV(dataToExport, columns, { filename });
      } else {
        await exportToPDF(dataToExport, columns, {
          filename,
          title,
          subtitle,
          orientation: "landscape",
        });
      }
    } else if (overallStats) {
      // Export overall stats
      const statsData = [
        { metric: "Total Classes", value: overallStats.totalClasses },
        { metric: "Overall Average (%)", value: overallStats.overallAverage },
        { metric: "Total Enrollments", value: overallStats.totalEnrollments },
        { metric: "Grade A", value: overallStats.overallGradeDistribution?.A || 0 },
        { metric: "Grade B", value: overallStats.overallGradeDistribution?.B || 0 },
        { metric: "Grade C", value: overallStats.overallGradeDistribution?.C || 0 },
        { metric: "Grade D", value: overallStats.overallGradeDistribution?.D || 0 },
        { metric: "Grade E", value: overallStats.overallGradeDistribution?.E || 0 },
        { metric: "Grade F", value: overallStats.overallGradeDistribution?.F || 0 },
        { metric: "No Grade", value: overallStats.overallGradeDistribution?.NoGrade || 0 },
      ];
      
      const columns = [
        { header: "Metric", accessor: (row: any) => row.metric },
        { header: "Value", accessor: (row: any) => row.value },
      ];
      
      const filename = `grading-stats-${new Date().toISOString().split("T")[0]}`;
      const title = "Overall Grading Statistics";
      const subtitle = `Generated on ${new Date().toLocaleDateString()}`;

      if (format === "csv") {
        exportToCSV(statsData, columns, { filename });
      } else {
        await exportToPDF(statsData, columns, {
          filename,
          title,
          subtitle,
          orientation: "portrait",
        });
      }
    } else {
      alert("No data to export");
    }
  }, [gradingData, overallStats]);

  const exportOptions = [
    { value: "grading", label: "Grading Data" },
  ];

  // ============================================
  // END EXPORT FUNCTIONALITY
  // ============================================

  // Stats for the header
  const stats = useMemo(() => {
    if (gradingData) {
      return [
        {
          id: 1,
          label: "Total Students",
          value: gradingData.summary.totalStudents,
          color: "blue",
          type: "students",
        },
        {
          id: 2,
          label: "Class Average",
          value: `${gradingData.summary.classAverage}%`,
          color: "green",
          type: "attendance",
        },
        {
          id: 3,
          label: "Pass Rate",
          value: `${gradingData.summary.passRate}%`,
          color: "purple",
          type: "classes",
        },
        {
          id: 4,
          label: "No Grade",
          value: gradingData.summary.studentsWithoutScores,
          color: "orange",
          type: "revenue",
        },
      ];
    }

    // Fallback to overall stats if available
    if (overallStats) {
      return [
        {
          id: 1,
          label: "Total Classes",
          value: overallStats.totalClasses,
          color: "blue",
          type: "classes",
        },
        {
          id: 2,
          label: "Overall Average",
          value: `${overallStats.overallAverage}%`,
          color: "green",
          type: "attendance",
        },
        {
          id: 3,
          label: "Total Enrollments",
          value: overallStats.totalEnrollments,
          color: "purple",
          type: "students",
        },
        {
          id: 4,
          label: "Pass Rate",
          value: `${overallStats.gradePercentages?.A || "0"}%`,
          color: "orange",
          type: "revenue",
        },
      ];
    }

    return [
      { id: 1, label: "Total Students", value: 0, color: "blue", type: "students" },
      { id: 2, label: "Class Average", value: "0%", color: "green", type: "attendance" },
      { id: 3, label: "Pass Rate", value: "0%", color: "purple", type: "classes" },
      { id: 4, label: "No Grade", value: "0", color: "orange", type: "revenue" },
    ];
  }, [gradingData, overallStats]);

  const getSelectedClassName = () => {
    const cls = classes.find((c) => c.id === parseInt(selectedClass));
    return cls ? `${cls.name} ${cls.section ? `- ${cls.section}` : ""}` : "";
  };

  const getSelectedSubjectName = () => {
    const subj = subjects.find((s) => s.id === parseInt(selectedSubject));
    return subj ? `${subj.title} (${subj.subject_code})` : "";
  };

  const getTermDisplay = () => {
    const term = terms.find(t => t.id === parseInt(selectedTermId));
    const year = academicYears.find(y => y.id === parseInt(selectedAcademicYear));
    if (term && year) {
      return `${term.name} - ${year.year}`;
    }
    if (term) return term.name;
    if (year) return `${year.year}`;
    return "Current";
  };

  const getGradeBadgeClass = (grade: string) => {
    switch (grade) {
      case "A": return styles.gradeA;
      case "B": return styles.gradeB;
      case "C": return styles.gradeC;
      case "D": return styles.gradeD;
      case "E": return styles.gradeE;
      case "F": return styles.gradeF;
      default: return styles.gradeNone;
    }
  };

  // Table columns for student grades
  const columns = [
    {
      header: "Student",
      accessor: "student",
      sortable: true,
      render: (row: StudentGrade) => (
        <div className={styles.studentCell}>
          <div className={styles.studentAvatar}>
            {row.student.first_name?.[0] || ""}{row.student.last_name?.[0] || ""}
          </div>
          <div>
            <div className={styles.studentName}>{row.student.name}</div>
            <div className={styles.studentId}>
              {row.student.admission_number || row.student.student_number || "—"}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Assessment",
      accessor: "assessments",
      sortable: true,
      width: "120px",
      render: (row: StudentGrade) => {
        if (!row.hasScores) {
          return <span className={styles.noScore}>—</span>;
        }
        return (
          <div className={styles.scoreCell}>
            <span className={styles.scoreValue}>{row.assessments.percentage}%</span>
            <span className={styles.scoreDetail}>
              ({row.assessments.total}/{row.assessments.maxTotal})
            </span>
          </div>
        );
      },
    },
    {
      header: "Exam",
      accessor: "exams",
      sortable: true,
      width: "120px",
      render: (row: StudentGrade) => {
        if (!row.hasScores) {
          return <span className={styles.noScore}>—</span>;
        }
        return (
          <div className={styles.scoreCell}>
            <span className={styles.scoreValue}>{row.exams.percentage}%</span>
            <span className={styles.scoreDetail}>
              ({row.exams.total}/{row.exams.maxTotal})
            </span>
          </div>
        );
      },
    },
    {
      header: "Total Score",
      accessor: "finalScore",
      sortable: true,
      width: "100px",
      render: (row: StudentGrade) => {
        if (!row.hasScores || !row.finalScore) {
          return <span className={styles.noScore}>—</span>;
        }
        return <span className={styles.finalScore}>{row.finalScore}%</span>;
      },
    },
    {
      header: "Grade",
      accessor: "letterGrade",
      sortable: true,
      width: "80px",
      render: (row: StudentGrade) => {
        if (row.letterGrade === "-" || !row.hasScores) {
          return <span className={styles.noGradeBadge}>—</span>;
        }
        return (
          <span className={`${styles.gradeBadge} ${getGradeBadgeClass(row.letterGrade)}`}>
            {row.letterGrade}
          </span>
        );
      },
    },
    {
      header: "Remarks",
      accessor: "remarks",
      sortable: true,
      width: "140px",
      render: (row: StudentGrade) => (
        <span className={row.hasScores ? styles.remarks : styles.noScore}>
          {row.remarks}
        </span>
      ),
    },
  ];

  return (
    <div className={styles.pageContainer}>
      <Header
        title="Grading Management"
        subtitle="View student grades, assessment and exam scores based on class curriculum"
        onExport={handleExport}
        exportOptions={exportOptions}
      />

      <div className={styles.contentWrapper}>
        {/* Filters */}
        <div className={styles.filterSection}>
          <div className={styles.filterRow}>
            <div className={styles.filterGroup}>
              <label>Academic Year</label>
              <select
                value={selectedAcademicYear}
                onChange={(e) => setSelectedAcademicYear(e.target.value)}
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
              <label>Term</label>
              <select
                value={selectedTermId}
                onChange={(e) => setSelectedTermId(e.target.value)}
                disabled={!selectedAcademicYear}
              >
                <option value="">All Terms</option>
                {terms.map((term) => (
                  <option key={term.id} value={term.id}>
                    {term.name}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label>Class *</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
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
              <label>Subject *</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                disabled={!selectedClass || loadingSubjects}
              >
                <option value="">
                  {loadingSubjects ? "Loading subjects..." : "Select Subject"}
                </option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.title} ({subject.subject_code})
                    {subject.is_mandatory ? " *" : ""}
                    {subject.weekly_hours ? ` - ${subject.weekly_hours} hrs/wk` : ""}
                  </option>
                ))}
              </select>
              {selectedClass && subjects.length === 0 && !loadingSubjects && (
                <div className={styles.filterWarning}>
                  No subjects assigned to this class. Go to Classes page &gt; Class Subjects tab to assign subjects.
                </div>
              )}
            </div>
          </div>

          {/* Active Filters Display */}
          {(selectedAcademicYear || selectedTermId) && (
            <div className={styles.activeFilters}>
              <span className={styles.activeFiltersLabel}>Active Period:</span>
              <span className={styles.filterTag}>{getTermDisplay()}</span>
            </div>
          )}
        </div>

        {/* Class & Subject Info */}
        {gradingData && (
          <div className={styles.infoSection}>
            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>🏫</div>
              <div className={styles.infoContent}>
                <span className={styles.infoLabel}>Class</span>
                <span className={styles.infoValue}>
                  {gradingData.class.name} {gradingData.class.section ? `- ${gradingData.class.section}` : ""}
                </span>
                <span className={styles.infoSub}>{gradingData.class.level}</span>
              </div>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>📘</div>
              <div className={styles.infoContent}>
                <span className={styles.infoLabel}>Subject</span>
                <span className={styles.infoValue}>{gradingData.subject.title}</span>
                <span className={styles.infoSub}>
                  {gradingData.subject.subject_code}
                  {gradingData.isMandatory && <span className={styles.mandatoryBadge}>Mandatory</span>}
                  {gradingData.weeklyHours && <span className={styles.hoursBadge}>{gradingData.weeklyHours} hrs/week</span>}
                </span>
              </div>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>👨‍🏫</div>
              <div className={styles.infoContent}>
                <span className={styles.infoLabel}>Teacher</span>
                <span className={styles.infoValue}>
                  {gradingData.teacher ? `${gradingData.teacher.first_name} ${gradingData.teacher.last_name}` : "Not Assigned"}
                </span>
                <span className={styles.infoSub}>{gradingData.teacher?.email || "—"}</span>
              </div>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>⚖️</div>
              <div className={styles.infoContent}>
                <span className={styles.infoLabel}>Weight Distribution</span>
                <span className={styles.infoValue}>
                  Assessment: {gradingData.settings.assessmentWeight}% | Exam: {gradingData.settings.examWeight}%
                </span>
                <span className={styles.infoSub}>
                  Pass Mark: {gradingData.settings.passMark}% 
                  {gradingData.settings.assessmentWeight === 70 && gradingData.settings.examWeight === 30
                    ? " | Using default weights"
                    : " | Custom weights applied"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        {stats && (gradingData || overallStats) && (
          <Stats stats={stats} variant="cards" columns={4} showIcon={true} size="md" />
        )}

        {/* Students Table */}
        {gradingData && (
          <div className={styles.tableSection}>
            <div className={styles.tableHeader}>
              <h3 className={styles.tableTitle}>Student Grades</h3>
              <div className={styles.tableInfo}>
                Showing {gradingData.students.length} of {gradingData.summary.totalStudents} students
                {gradingData.summary.studentsWithoutScores > 0 && (
                  <span className={styles.warningBadge}>
                    {gradingData.summary.studentsWithoutScores} student(s) have no grades
                  </span>
                )}
              </div>
            </div>
            <Table
              columns={columns}
              data={gradingData.students}
              variant="default"
              size="md"
              stickyHeader={true}
              sortable={true}
              pagination={true}
              pageSize={10}
              showRowNumbers={true}
              emptyMessage="No students found"
              loading={loading}
            />
          </div>
        )}

        {/* Grade Distribution Chart */}
        {gradingData && gradingData.summary.gradeDistribution && (
          <div className={styles.distributionSection}>
            <h3 className={styles.sectionTitle}>Grade Distribution</h3>
            <div className={styles.distributionBars}>
              {Object.entries(gradingData.summary.gradeDistribution).map(([grade, count]) => {
                const total = gradingData.summary.totalStudents;
                const percentage = total > 0 ? ((count as number) / total) * 100 : 0;
                const barClass = 
                  grade === "A" ? styles.barA :
                  grade === "B" ? styles.barB :
                  grade === "C" ? styles.barC :
                  grade === "D" ? styles.barD :
                  grade === "E" ? styles.barE :
                  grade === "F" ? styles.barF : styles.barNoGrade;
                
                const gradeLabel = grade === "NoGrade" ? "No Grade" : `Grade ${grade}`;
                
                return (
                  <div key={grade} className={styles.distributionItem}>
                    <div className={styles.distributionLabel}>
                      <span className={`${styles.gradeDot} ${barClass}`}></span>
                      <span>{gradeLabel}</span>
                      <span className={styles.distributionCount}>{count as number} students</span>
                    </div>
                    <div className={styles.distributionBarContainer}>
                      <div
                        className={`${styles.distributionBar} ${barClass}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className={styles.distributionPercentage}>{percentage.toFixed(1)}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* No Selection State */}
        {!selectedClass && !loading && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📊</div>
            <h3>Select a Class and Subject</h3>
            <p>Please select a class and subject from the filters above to view grading information.</p>
            <p className={styles.emptyHint}>
              Subjects shown are only those assigned to the selected class via Class Subjects.
            </p>
          </div>
        )}

        {/* Class Selected but No Subjects */}
        {selectedClass && subjects.length === 0 && !loadingSubjects && !loading && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📚</div>
            <h3>No Subjects Assigned</h3>
            <p>This class has no subjects assigned to it yet.</p>
            <p className={styles.emptyHint}>
              Go to the Classes page &gt; Class Subjects tab to assign subjects to this class.
            </p>
          </div>
        )}

        {/* No Data State */}
        {selectedClass && selectedSubject && !gradingData && !loading && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📭</div>
            <h3>No Grading Data Available</h3>
            <p>No scores have been recorded for this class and subject yet.</p>
            <p className={styles.emptyHint}>
              Teachers need to enter assessment and exam scores first.
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading && selectedClass && selectedSubject && (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Loading grading data...</p>
          </div>
        )}
      </div>
    </div>
  );
}