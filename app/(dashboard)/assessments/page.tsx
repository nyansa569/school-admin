// app/(dashboard)/assessments/page.tsx
"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  getClasses,
  getSubjects,
  getTeachers,
  getAcademicYears,
  getTerms,
  getStudentAssessments,
  getAssessmentSummaryByClass,
  getAssessmentSummaryBySubject,
  getAssessmentSummaryByTeacher,
  getOverallAssessmentStats,
  getAssessmentTypes,
} from "@/lib/action/admin/assessment";
import Header from "@/components/Header/Header";
import Stats from "@/components/Stats/Stats";
import Table from "@/components/Table/Table";
import styles from "./page.module.css";
import { exportToCSV } from "@/utils/export/csv";
import { exportToPDF } from "@/utils/export/pdf";

type ViewType = "overview" | "byClass" | "bySubject" | "byTeacher";

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

export default function AssessmentsPage() {
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState<ViewType>("overview");
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [assessmentTypes, setAssessmentTypes] = useState<any[]>([]);
  
  // Filters
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedTeacher, setSelectedTeacher] = useState<string>("");
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>("");
  const [selectedTermId, setSelectedTermId] = useState<string>("");
  const [selectedAssessmentType, setSelectedAssessmentType] = useState<string>("");
  
  // Data states
  const [overallStats, setOverallStats] = useState<any>(null);
  const [classSummary, setClassSummary] = useState<any>(null);
  const [subjectSummary, setSubjectSummary] = useState<any>(null);
  const [teacherSummary, setTeacherSummary] = useState<any>(null);
  const [assessments, setAssessments] = useState<any[]>([]);

  useEffect(() => {
    loadFilters();
    loadAssessmentTypes();
  }, []);

  useEffect(() => {
    if (selectedAcademicYear) {
      loadTerms(parseInt(selectedAcademicYear));
    } else {
      setTerms([]);
    }
  }, [selectedAcademicYear]);

  useEffect(() => {
    if (viewType === "overview") {
      loadOverallStats();
    } else if (viewType === "byClass" && selectedClass) {
      loadClassSummary();
    } else if (viewType === "bySubject" && selectedSubject) {
      loadSubjectSummary();
    } else if (viewType === "byTeacher" && selectedTeacher) {
      loadTeacherSummary();
    }
  }, [viewType, selectedClass, selectedSubject, selectedTeacher, selectedAcademicYear, selectedTermId, selectedAssessmentType]);

  const loadFilters = async () => {
    const classesResult = await getClasses();
    if (classesResult.classes) setClasses(classesResult.classes);

    const subjectsResult = await getSubjects();
    if (subjectsResult.subjects) setSubjects(subjectsResult.subjects);

    const teachersResult = await getTeachers();
    if (teachersResult.teachers) setTeachers(teachersResult.teachers);

    const yearsResult = await getAcademicYears();
    if (yearsResult.years) setAcademicYears(yearsResult.years);
  };

  const loadTerms = async (academicYearId: number) => {
    const result = await getTerms(academicYearId);
    if (result.terms) setTerms(result.terms);
  };

  const loadAssessmentTypes = async () => {
    const result = await getAssessmentTypes();
    if (result.types) setAssessmentTypes(result.types);
  };

  const loadOverallStats = async () => {
    setLoading(true);
    const result = await getOverallAssessmentStats(
      selectedAcademicYear ? parseInt(selectedAcademicYear) : undefined,
      selectedTermId ? parseInt(selectedTermId) : undefined
    );
    if (result.stats) setOverallStats(result.stats);
    
    const assessmentTypeValue = selectedAssessmentType as "performance" | "attitude" | "behavior" | "participation" | undefined;
    
    const assessmentsResult = await getStudentAssessments(
      undefined,
      undefined,
      undefined,
      selectedAcademicYear ? parseInt(selectedAcademicYear) : undefined,
      selectedTermId ? parseInt(selectedTermId) : undefined,
      assessmentTypeValue
    );
    if (assessmentsResult.assessments) {
      setAssessments(assessmentsResult.assessments);
    }
    setLoading(false);
  };

  const loadClassSummary = async () => {
    setLoading(true);
    const result = await getAssessmentSummaryByClass(
      parseInt(selectedClass),
      selectedAcademicYear ? parseInt(selectedAcademicYear) : undefined,
      selectedTermId ? parseInt(selectedTermId) : undefined
    );
    if (result.class) setClassSummary(result);
    setLoading(false);
  };

  const loadSubjectSummary = async () => {
    setLoading(true);
    const result = await getAssessmentSummaryBySubject(
      parseInt(selectedSubject),
      selectedAcademicYear ? parseInt(selectedAcademicYear) : undefined,
      selectedTermId ? parseInt(selectedTermId) : undefined
    );
    if (result.subject) setSubjectSummary(result);
    setLoading(false);
  };

  const loadTeacherSummary = async () => {
    setLoading(true);
    const result = await getAssessmentSummaryByTeacher(
      parseInt(selectedTeacher),
      selectedAcademicYear ? parseInt(selectedAcademicYear) : undefined,
      selectedTermId ? parseInt(selectedTermId) : undefined
    );
    if (result.teacher) setTeacherSummary(result);
    setLoading(false);
  };

  // ============================================
  // EXPORT FUNCTIONALITY
  // ============================================

  // Export columns for Overview (Assessments)
  const getAssessmentExportColumns = () => [
    { header: "Student Name", accessor: (row: any) => row.student ? `${row.student.first_name} ${row.student.last_name}` : "—" },
    { header: "Student ID", accessor: (row: any) => row.student?.admission_number || row.student?.student_number || "—" },
    { header: "Class", accessor: (row: any) => row.class?.name || "—" },
    { header: "Subject", accessor: (row: any) => row.subject?.title || "—" },
    { header: "Assessment Type", accessor: (row: any) => row.assessment_type || "—" },
    { header: "Score (%)", accessor: (row: any) => row.numeric_score?.toString() || "—" },
    { header: "Grade", accessor: (row: any) => row.letter_grade || "—" },
    { header: "Teacher", accessor: (row: any) => row.teacher ? `${row.teacher.first_name} ${row.teacher.last_name}` : "—" },
    { header: "Remarks", accessor: (row: any) => row.remarks || "—" },
    { header: "Recommendations", accessor: (row: any) => row.recommendations || "—" },
    { header: "Date", accessor: (row: any) => new Date(row.created_at).toLocaleDateString() },
  ];

  // Export columns for By Class view
  const getClassExportColumns = () => [
    { header: "Class", accessor: (row: any) => classSummary?.class?.name || "—" },
    { header: "Student Name", accessor: (row: any) => row.student.name || `${row.student.first_name} ${row.student.last_name}` },
    { header: "Student ID", accessor: (row: any) => row.student.admission_number || row.student.student_number || "—" },
    { header: "Performance Score (%)", accessor: (row: any) => row.assessments?.performance?.score?.toString() || "—" },
    { header: "Performance Grade", accessor: (row: any) => row.assessments?.performance?.grade || "—" },
    { header: "Performance Remarks", accessor: (row: any) => row.assessments?.performance?.remarks || "—" },
    { header: "Attitude Score (%)", accessor: (row: any) => row.assessments?.attitude?.score?.toString() || "—" },
    { header: "Attitude Grade", accessor: (row: any) => row.assessments?.attitude?.grade || "—" },
    { header: "Attitude Remarks", accessor: (row: any) => row.assessments?.attitude?.remarks || "—" },
    { header: "Behavior Score (%)", accessor: (row: any) => row.assessments?.behavior?.score?.toString() || "—" },
    { header: "Behavior Grade", accessor: (row: any) => row.assessments?.behavior?.grade || "—" },
    { header: "Behavior Remarks", accessor: (row: any) => row.assessments?.behavior?.remarks || "—" },
    { header: "Participation Score (%)", accessor: (row: any) => row.assessments?.participation?.score?.toString() || "—" },
    { header: "Participation Grade", accessor: (row: any) => row.assessments?.participation?.grade || "—" },
    { header: "Participation Remarks", accessor: (row: any) => row.assessments?.participation?.remarks || "—" },
    { header: "Average Score (%)", accessor: (row: any) => row.averageScore || "—" },
  ];

  // Export columns for By Subject view
  const getSubjectExportColumns = () => [
    { header: "Subject", accessor: () => subjectSummary?.subject?.title || "—" },
    { header: "Subject Code", accessor: () => subjectSummary?.subject?.subject_code || "—" },
    { header: "Class", accessor: (row: any) => row.class?.name || "—" },
    { header: "Total Students", accessor: (row: any) => row.totalStudents || 0 },
    { header: "Total Assessments", accessor: (row: any) => row.totalAssessments || 0 },
    { header: "Average Score (%)", accessor: (row: any) => row.averageScore || "—" },
    { header: "Performance Count", accessor: (row: any) => row.typeCounts?.performance || 0 },
    { header: "Attitude Count", accessor: (row: any) => row.typeCounts?.attitude || 0 },
    { header: "Behavior Count", accessor: (row: any) => row.typeCounts?.behavior || 0 },
    { header: "Participation Count", accessor: (row: any) => row.typeCounts?.participation || 0 },
  ];

  // Export columns for By Teacher view
  const getTeacherExportColumns = () => [
    { header: "Teacher", accessor: () => teacherSummary?.teacher ? `${teacherSummary.teacher.first_name} ${teacherSummary.teacher.last_name}` : "—" },
    { header: "Class", accessor: (row: any) => row.class?.name || "—" },
    { header: "Subject", accessor: (row: any) => row.subject?.title || "—" },
    { header: "Total Students", accessor: (row: any) => row.totalStudents || 0 },
    { header: "Total Assessments", accessor: (row: any) => row.totalAssessments || 0 },
    { header: "Average Score (%)", accessor: (row: any) => row.averageScore || "—" },
  ];

  const handleExport = useCallback(async (format: "pdf" | "csv") => {
    let dataToExport: any[] = [];
    let columns: any[] = [];
    let title = "";
    let filename = "";
    let subtitle = "";

    switch (viewType) {
      case "overview":
        dataToExport = assessments;
        columns = getAssessmentExportColumns();
        title = "Assessments Report";
        filename = `assessments-${new Date().toISOString().split("T")[0]}`;
        subtitle = `Total Assessments: ${dataToExport.length} | Generated on ${new Date().toLocaleDateString()}`;
        break;
      case "byClass":
        if (!classSummary?.students) {
          alert("No class summary data to export");
          return;
        }
        dataToExport = classSummary.students;
        columns = getClassExportColumns();
        title = `Class Assessment Report - ${classSummary.class?.name || "Selected Class"}`;
        filename = `class-assessments-${classSummary.class?.name || "class"}-${new Date().toISOString().split("T")[0]}`;
        subtitle = `Class: ${classSummary.class?.name} | Total Students: ${dataToExport.length} | Generated on ${new Date().toLocaleDateString()}`;
        break;
      case "bySubject":
        if (!subjectSummary?.classes) {
          alert("No subject summary data to export");
          return;
        }
        dataToExport = subjectSummary.classes;
        columns = getSubjectExportColumns();
        title = `Subject Assessment Report - ${subjectSummary.subject?.title || "Selected Subject"}`;
        filename = `subject-assessments-${subjectSummary.subject?.title || "subject"}-${new Date().toISOString().split("T")[0]}`;
        subtitle = `Subject: ${subjectSummary.subject?.title} (${subjectSummary.subject?.subject_code}) | Total Classes: ${dataToExport.length} | Generated on ${new Date().toLocaleDateString()}`;
        break;
      case "byTeacher":
        if (!teacherSummary?.details) {
          alert("No teacher summary data to export");
          return;
        }
        dataToExport = teacherSummary.details;
        columns = getTeacherExportColumns();
        title = `Teacher Assessment Report - ${teacherSummary.teacher ? `${teacherSummary.teacher.first_name} ${teacherSummary.teacher.last_name}` : "Selected Teacher"}`;
        filename = `teacher-assessments-${new Date().toISOString().split("T")[0]}`;
        subtitle = `Teacher: ${teacherSummary.teacher?.first_name} ${teacherSummary.teacher?.last_name} | Total Records: ${dataToExport.length} | Generated on ${new Date().toLocaleDateString()}`;
        break;
      default:
        return;
    }

    if (dataToExport.length === 0) {
      alert("No data to export for the current view");
      return;
    }

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
  }, [viewType, assessments, classSummary, subjectSummary, teacherSummary]);

  const exportOptions = [
    { value: "assessments", label: "Current View" },
  ];

  // ============================================
  // END EXPORT FUNCTIONALITY
  // ============================================

  const getTypeColor = (type: string) => {
    const typeObj = assessmentTypes.find(t => t.value === type);
    return typeObj?.color || "#64748b";
  };

  const getScoreBadgeClass = (score: number | null | string) => {
    const numericScore = typeof score === "string" ? parseFloat(score) : score;
    if (!numericScore && numericScore !== 0) return styles.scoreNone;
    if (numericScore >= 80) return styles.scoreExcellent;
    if (numericScore >= 70) return styles.scoreGood;
    if (numericScore >= 60) return styles.scoreAverage;
    if (numericScore >= 50) return styles.scoreBelowAverage;
    return styles.scorePoor;
  };

  const getLetterGradeClass = (grade: string | null) => {
    if (!grade) return styles.gradeNone;
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

  // Stats for overview
  const overviewStats = useMemo(() => {
    if (!overallStats) return [];
    return [
      { id: 1, label: "Total Assessments", value: overallStats.totalAssessments, color: "blue", type: "assessments" },
      { id: 2, label: "Students Assessed", value: overallStats.totalStudents, color: "green", type: "students" },
      { id: 3, label: "Teachers", value: overallStats.totalTeachers, color: "purple", type: "teachers" },
      { id: 4, label: "Overall Average", value: `${overallStats.overallAverage}%`, color: "orange", type: "average" },
    ];
  }, [overallStats]);

  // Table columns for assessments
  const assessmentColumns = [
    {
      header: "Student",
      accessor: "student",
      sortable: true,
      render: (row: any) => (
        <div className={styles.studentCell}>
          <div className={styles.studentAvatar}>
            {row.student?.first_name?.[0]}{row.student?.last_name?.[0]}
          </div>
          <div>
            <div className={styles.studentName}>
              {row.student?.first_name} {row.student?.last_name}
            </div>
            <div className={styles.studentId}>{row.student?.admission_number || row.student?.student_number || "—"}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Class",
      accessor: "class",
      sortable: true,
      render: (row: any) => row.class?.name || "—",
    },
    {
      header: "Subject",
      accessor: "subject",
      sortable: true,
      render: (row: any) => row.subject?.title || "—",
    },
    {
      header: "Assessment Type",
      accessor: "assessment_type",
      sortable: true,
      width: "140px",
      render: (row: any) => {
        const type = assessmentTypes.find(t => t.value === row.assessment_type);
        return (
          <span
            className={styles.typeBadge}
            style={{ background: `${getTypeColor(row.assessment_type)}20`, color: getTypeColor(row.assessment_type) }}
          >
            {type?.label || row.assessment_type}
          </span>
        );
      },
    },
    {
      header: "Score",
      accessor: "numeric_score",
      sortable: true,
      width: "80px",
      render: (row: any) => (
        row.numeric_score ? (
          <span className={`${styles.scoreBadge} ${getScoreBadgeClass(row.numeric_score)}`}>
            {row.numeric_score}%
          </span>
        ) : (
          <span className={styles.noScore}>—</span>
        )
      ),
    },
    {
      header: "Grade",
      accessor: "letter_grade",
      sortable: true,
      width: "70px",
      render: (row: any) => (
        row.letter_grade ? (
          <span className={`${styles.gradeBadge} ${getLetterGradeClass(row.letter_grade)}`}>
            {row.letter_grade}
          </span>
        ) : (
          <span className={styles.noScore}>—</span>
        )
      ),
    },
    {
      header: "Teacher",
      accessor: "teacher",
      sortable: true,
      render: (row: any) => row.teacher ? `${row.teacher.first_name} ${row.teacher.last_name}` : "—",
    },
    {
      header: "Date",
      accessor: "created_at",
      sortable: true,
      width: "120px",
      render: (row: any) => new Date(row.created_at).toLocaleDateString(),
    },
  ];

  // Class summary table columns
  const classStudentColumns = [
    {
      header: "Student",
      accessor: "student",
      sortable: true,
      render: (row: any) => (
        <div className={styles.studentCell}>
          <div className={styles.studentAvatar}>
            {row.student.first_name?.[0]}{row.student.last_name?.[0]}
          </div>
          <div>
            <div className={styles.studentName}>{row.student.name || `${row.student.first_name} ${row.student.last_name}`}</div>
            <div className={styles.studentId}>{row.student.admission_number || row.student.student_number || "—"}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Performance",
      accessor: "assessments.performance",
      width: "100px",
      render: (row: any) => (
        row.assessments.performance?.score ? (
          <div>
            <span className={`${styles.scoreBadge} ${getScoreBadgeClass(row.assessments.performance.score)}`}>
              {row.assessments.performance.score}%
            </span>
            {row.assessments.performance.grade && (
              <span className={`${styles.gradeSmall} ${getLetterGradeClass(row.assessments.performance.grade)}`}>
                {row.assessments.performance.grade}
              </span>
            )}
          </div>
        ) : <span className={styles.noScore}>—</span>
      ),
    },
    {
      header: "Attitude",
      accessor: "assessments.attitude",
      width: "100px",
      render: (row: any) => (
        row.assessments.attitude?.score ? (
          <div>
            <span className={`${styles.scoreBadge} ${getScoreBadgeClass(row.assessments.attitude.score)}`}>
              {row.assessments.attitude.score}%
            </span>
            {row.assessments.attitude.grade && (
              <span className={`${styles.gradeSmall} ${getLetterGradeClass(row.assessments.attitude.grade)}`}>
                {row.assessments.attitude.grade}
              </span>
            )}
          </div>
        ) : <span className={styles.noScore}>—</span>
      ),
    },
    {
      header: "Behavior",
      accessor: "assessments.behavior",
      width: "100px",
      render: (row: any) => (
        row.assessments.behavior?.score ? (
          <div>
            <span className={`${styles.scoreBadge} ${getScoreBadgeClass(row.assessments.behavior.score)}`}>
              {row.assessments.behavior.score}%
            </span>
            {row.assessments.behavior.grade && (
              <span className={`${styles.gradeSmall} ${getLetterGradeClass(row.assessments.behavior.grade)}`}>
                {row.assessments.behavior.grade}
              </span>
            )}
          </div>
        ) : <span className={styles.noScore}>—</span>
      ),
    },
    {
      header: "Participation",
      accessor: "assessments.participation",
      width: "100px",
      render: (row: any) => (
        row.assessments.participation?.score ? (
          <div>
            <span className={`${styles.scoreBadge} ${getScoreBadgeClass(row.assessments.participation.score)}`}>
              {row.assessments.participation.score}%
            </span>
            {row.assessments.participation.grade && (
              <span className={`${styles.gradeSmall} ${getLetterGradeClass(row.assessments.participation.grade)}`}>
                {row.assessments.participation.grade}
              </span>
            )}
          </div>
        ) : <span className={styles.noScore}>—</span>
      ),
    },
    {
      header: "Average",
      accessor: "averageScore",
      width: "100px",
      render: (row: any) => (
        row.averageScore ? (
          <span className={`${styles.scoreBadge} ${getScoreBadgeClass(row.averageScore)}`}>
            {row.averageScore}%
          </span>
        ) : <span className={styles.noScore}>—</span>
      ),
    },
  ];

  return (
    <div className={styles.pageContainer}>
      <Header
        title="Assessment Management"
        subtitle="View student assessments, performance, attitude, behavior, and participation"
        onExport={handleExport}
        exportOptions={exportOptions}
      />

      <div className={styles.contentWrapper}>
        {/* View Tabs */}
        <div className={styles.tabsContainer}>
          <button
            className={`${styles.tab} ${viewType === "overview" ? styles.activeTab : ""}`}
            onClick={() => setViewType("overview")}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 13h8V3H3v10Zm0 8h8v-6H3v6Zm10 0h8V11h-8v10Zm0-18v6h8V3h-8Z" />
            </svg>
            Overview
          </button>
          <button
            className={`${styles.tab} ${viewType === "byClass" ? styles.activeTab : ""}`}
            onClick={() => setViewType("byClass")}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
            </svg>
            By Class
          </button>
          <button
            className={`${styles.tab} ${viewType === "bySubject" ? styles.activeTab : ""}`}
            onClick={() => setViewType("bySubject")}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z" />
            </svg>
            By Subject
          </button>
          <button
            className={`${styles.tab} ${viewType === "byTeacher" ? styles.activeTab : ""}`}
            onClick={() => setViewType("byTeacher")}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
            </svg>
            By Teacher
          </button>
        </div>

        {/* Filters */}
        <div className={styles.filterSection}>
          <div className={styles.filterRow}>
            {viewType === "byClass" && (
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
            )}

            {viewType === "bySubject" && (
              <div className={styles.filterGroup}>
                <label>Subject *</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                >
                  <option value="">Select Subject</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.title} ({subject.subject_code})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {viewType === "byTeacher" && (
              <div className={styles.filterGroup}>
                <label>Teacher *</label>
                <select
                  value={selectedTeacher}
                  onChange={(e) => setSelectedTeacher(e.target.value)}
                >
                  <option value="">Select Teacher</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.first_name} {teacher.last_name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className={styles.filterGroup}>
              <label>Academic Year</label>
              <select
                value={selectedAcademicYear}
                onChange={(e) => setSelectedAcademicYear(e.target.value)}
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

            {(viewType === "overview") && (
              <div className={styles.filterGroup}>
                <label>Assessment Type</label>
                <select
                  value={selectedAssessmentType}
                  onChange={(e) => setSelectedAssessmentType(e.target.value)}
                >
                  <option value="">All Types</option>
                  {assessmentTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Active filters display */}
          {(selectedAcademicYear || selectedTermId) && (
            <div className={styles.activeFilters}>
              <span className={styles.activeFiltersLabel}>Active Filters:</span>
              {selectedAcademicYear && (
                <span className={styles.filterTag}>
                  {academicYears.find(y => y.id === parseInt(selectedAcademicYear))?.year} Year
                </span>
              )}
              {selectedTermId && (
                <span className={styles.filterTag}>
                  {terms.find(t => t.id === parseInt(selectedTermId))?.name}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Overview View */}
        {viewType === "overview" && overallStats && (
          <>
            <Stats stats={overviewStats} variant="cards" columns={4} showIcon={true} size="md" />

            {/* Type Averages */}
            <div className={styles.typeAveragesSection}>
              <h3 className={styles.sectionTitle}>Average Scores by Type</h3>
              <div className={styles.typeAveragesGrid}>
                {assessmentTypes.map((type) => (
                  <div key={type.value} className={styles.typeCard}>
                    <div className={styles.typeHeader} style={{ color: type.color }}>
                      <span className={styles.typeIcon}>
                        {type.value === "performance" && "📊"}
                        {type.value === "attitude" && "😊"}
                        {type.value === "behavior" && "⭐"}
                        {type.value === "participation" && "🙋"}
                      </span>
                      <span className={styles.typeLabel}>{type.label}</span>
                    </div>
                    <div className={styles.typeScore}>
                      {overallStats.typeAverages?.[type.value] || "N/A"}%
                    </div>
                    <div className={styles.typeCount}>
                      {overallStats.typeCounts?.[type.value] || 0} assessments
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Assessments Table */}
            <div className={styles.tableSection}>
              <h3 className={styles.sectionTitle}>Recent Assessments</h3>
              <Table
                columns={assessmentColumns}
                data={assessments}
                variant="default"
                size="md"
                stickyHeader={true}
                sortable={true}
                pagination={true}
                pageSize={10}
                showRowNumbers={true}
                emptyMessage="No assessments found"
                loading={loading}
              />
            </div>
          </>
        )}

        {/* By Class View */}
        {viewType === "byClass" && classSummary && (
          <>
            <div className={styles.summarySection}>
              <div className={styles.summaryCard}>
                <div className={styles.summaryIcon}>🏫</div>
                <div className={styles.summaryContent}>
                  <span className={styles.summaryLabel}>Class</span>
                  <span className={styles.summaryValue}>
                    {classSummary.class?.name} {classSummary.class?.section ? `- ${classSummary.class.section}` : ""}
                  </span>
                  <span className={styles.summarySub}>{classSummary.class?.level}</span>
                </div>
              </div>

              <div className={styles.summaryCard}>
                <div className={styles.summaryIcon}>📝</div>
                <div className={styles.summaryContent}>
                  <span className={styles.summaryLabel}>Total Assessments</span>
                  <span className={styles.summaryValue}>{classSummary.summary?.totalAssessments || 0}</span>
                  <span className={styles.summarySub}>Across all subjects</span>
                </div>
              </div>

              <div className={styles.summaryCard}>
                <div className={styles.summaryIcon}>👨‍🎓</div>
                <div className={styles.summaryContent}>
                  <span className={styles.summaryLabel}>Students</span>
                  <span className={styles.summaryValue}>{classSummary.summary?.totalStudents || 0}</span>
                  <span className={styles.summarySub}>
                    {classSummary.summary?.studentsWithAssessments || 0} assessed
                  </span>
                </div>
              </div>

              <div className={styles.summaryCard}>
                <div className={styles.summaryIcon}>📊</div>
                <div className={styles.summaryContent}>
                  <span className={styles.summaryLabel}>Class Average</span>
                  <span className={styles.summaryValue}>{classSummary.summary?.classAverage || "N/A"}%</span>
                </div>
              </div>
            </div>

            <div className={styles.tableSection}>
              <h3 className={styles.sectionTitle}>Student Assessment Summary</h3>
              <Table
                columns={classStudentColumns}
                data={classSummary.students || []}
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
          </>
        )}

        {/* By Subject View */}
        {viewType === "bySubject" && subjectSummary && (
          <>
            <div className={styles.summarySection}>
              <div className={styles.summaryCard}>
                <div className={styles.summaryIcon}>📘</div>
                <div className={styles.summaryContent}>
                  <span className={styles.summaryLabel}>Subject</span>
                  <span className={styles.summaryValue}>{subjectSummary.subject?.title || "—"}</span>
                  <span className={styles.summarySub}>{subjectSummary.subject?.subject_code}</span>
                </div>
              </div>

              <div className={styles.summaryCard}>
                <div className={styles.summaryIcon}>🏫</div>
                <div className={styles.summaryContent}>
                  <span className={styles.summaryLabel}>Classes</span>
                  <span className={styles.summaryValue}>{subjectSummary.summary?.totalClasses || 0}</span>
                </div>
              </div>

              <div className={styles.summaryCard}>
                <div className={styles.summaryIcon}>📝</div>
                <div className={styles.summaryContent}>
                  <span className={styles.summaryLabel}>Assessments</span>
                  <span className={styles.summaryValue}>{subjectSummary.summary?.totalAssessments || 0}</span>
                </div>
              </div>

              <div className={styles.summaryCard}>
                <div className={styles.summaryIcon}>📊</div>
                <div className={styles.summaryContent}>
                  <span className={styles.summaryLabel}>Overall Average</span>
                  <span className={styles.summaryValue}>{subjectSummary.summary?.overallAverage || "N/A"}%</span>
                </div>
              </div>
            </div>

            <div className={styles.tableSection}>
              <h3 className={styles.sectionTitle}>Class Performance</h3>
              <table className={styles.simpleTable}>
                <thead>
                  <tr>
                    <th>Class</th>
                    <th>Students</th>
                    <th>Assessments</th>
                    <th>Average Score</th>
                    <th>Performance</th>
                    <th>Attitude</th>
                    <th>Behavior</th>
                    <th>Participation</th>
                  </tr>
                </thead>
                <tbody>
                  {subjectSummary.classes?.map((cls: any, index: number) => (
                    <tr key={index}>
                      <td className={styles.className}>{cls.class?.name || "—"}</td>
                      <td>{cls.totalStudents || 0}</td>
                      <td>{cls.totalAssessments || 0}</td>
                      <td>
                        <span className={`${styles.scoreBadge} ${getScoreBadgeClass(cls.averageScore)}`}>
                          {cls.averageScore}%
                        </span>
                      </td>
                      <td>{cls.typeCounts?.performance || 0}</td>
                      <td>{cls.typeCounts?.attitude || 0}</td>
                      <td>{cls.typeCounts?.behavior || 0}</td>
                      <td>{cls.typeCounts?.participation || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* By Teacher View */}
        {viewType === "byTeacher" && teacherSummary && (
          <>
            <div className={styles.summarySection}>
              <div className={styles.summaryCard}>
                <div className={styles.summaryIcon}>👨‍🏫</div>
                <div className={styles.summaryContent}>
                  <span className={styles.summaryLabel}>Teacher</span>
                  <span className={styles.summaryValue}>
                    {teacherSummary.teacher?.first_name} {teacherSummary.teacher?.last_name}
                  </span>
                  <span className={styles.summarySub}>{teacherSummary.teacher?.email}</span>
                </div>
              </div>

              <div className={styles.summaryCard}>
                <div className={styles.summaryIcon}>📝</div>
                <div className={styles.summaryContent}>
                  <span className={styles.summaryLabel}>Assessments</span>
                  <span className={styles.summaryValue}>{teacherSummary.summary?.totalAssessments || 0}</span>
                </div>
              </div>

              <div className={styles.summaryCard}>
                <div className={styles.summaryIcon}>👨‍🎓</div>
                <div className={styles.summaryContent}>
                  <span className={styles.summaryLabel}>Students</span>
                  <span className={styles.summaryValue}>{teacherSummary.summary?.totalStudents || 0}</span>
                </div>
              </div>

              <div className={styles.summaryCard}>
                <div className={styles.summaryIcon}>📊</div>
                <div className={styles.summaryContent}>
                  <span className={styles.summaryLabel}>Average Score</span>
                  <span className={styles.summaryValue}>{teacherSummary.summary?.overallAverage || "N/A"}%</span>
                </div>
              </div>
            </div>

            <div className={styles.tableSection}>
              <h3 className={styles.sectionTitle}>Class & Subject Performance</h3>
              <table className={styles.simpleTable}>
                <thead>
                  <tr>
                    <th>Class</th>
                    <th>Subject</th>
                    <th>Students</th>
                    <th>Assessments</th>
                    <th>Average Score</th>
                  </tr>
                </thead>
                <tbody>
                  {teacherSummary.details?.map((detail: any, index: number) => (
                    <tr key={index}>
                      <td className={styles.className}>{detail.class?.name || "—"}</td>
                      <td>{detail.subject?.title || "—"}</td>
                      <td>{detail.totalStudents || 0}</td>
                      <td>{detail.totalAssessments || 0}</td>
                      <td>
                        <span className={`${styles.scoreBadge} ${getScoreBadgeClass(detail.averageScore)}`}>
                          {detail.averageScore}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Empty States */}
        {viewType === "byClass" && !selectedClass && !loading && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🏫</div>
            <h3>Select a Class</h3>
            <p>Please select a class from the filter above to view assessment summary.</p>
          </div>
        )}

        {viewType === "bySubject" && !selectedSubject && !loading && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📘</div>
            <h3>Select a Subject</h3>
            <p>Please select a subject from the filter above to view assessment summary.</p>
          </div>
        )}

        {viewType === "byTeacher" && !selectedTeacher && !loading && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>👨‍🏫</div>
            <h3>Select a Teacher</h3>
            <p>Please select a teacher from the filter above to view assessment summary.</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Loading assessment data...</p>
          </div>
        )}
      </div>
    </div>
  );
}