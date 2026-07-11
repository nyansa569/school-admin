// app/(teacher)/teacher/(sub-teacher)/[module]/class/[classid]/subject/[subjectid]/components/GradeView.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  getStudentScores,
  getAssessmentTitles,
  createBulkScores,
  updateBulkScores,
  getCalculatedGrades,
  getGradeWeights,
  updateGradeWeights,
  checkTeacherAuthorization,
  deleteAssessment,
  getAcademicYears,
  getTerms,
} from "@/lib/action/teacher/grade";
import styles from "./GradeView.module.css";

type GradeViewProps = {
  classId: number;
  subjectId: number;
};

type Student = {
  id: number;
  first_name: string;
  last_name: string;
  other_names: string | null;
  admission_number: string;
  student_number: string;
  full_name: string;
};

type Score = {
  id: number;
  student_id: number;
  score: number;
  max_score: number;
  weight: number;
  title: string;
  description: string;
  recorded_at: string;
};

type ScoreTitle = {
  title: string;
  description: string;
  max_score: number;
  id: number;
};

type GradeResult = {
  student: Student;
  assessments: Score[];
  exams: Score[];
  assessmentTotal: number;
  examTotal: number;
  assessmentMaxTotal: number;
  examMaxTotal: number;
  assessmentPercentage: string;
  examPercentage: string;
  finalScore: string | null;
  letterGrade: string;
  gradePoint: number | null;
  remarks: string;
  isPassing: boolean;
  hasScores: boolean;
};

type SummaryStats = {
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

type GradeTab = "assessment" | "exam" | "summary";

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

const DEFAULT_SUMMARY: SummaryStats = {
  totalStudents: 0,
  studentsWithScores: 0,
  studentsWithoutScores: 0,
  classAverage: "0",
  passCount: 0,
  failCount: 0,
  passRate: "0",
  gradeDistribution: {
    A: 0,
    B: 0,
    C: 0,
    D: 0,
    E: 0,
    F: 0,
    NoGrade: 0,
  },
};

export default function GradeView({ classId, subjectId }: GradeViewProps) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<GradeTab>("summary");
  const [students, setStudents] = useState<Student[]>([]);
  const [assessmentTitles, setAssessmentTitles] = useState<ScoreTitle[]>([]);
  const [examTitles, setExamTitles] = useState<ScoreTitle[]>([]);
  const [grades, setGrades] = useState<GradeResult[]>([]);
  const [summary, setSummary] = useState<SummaryStats>(DEFAULT_SUMMARY);
  const [settings, setSettings] = useState<{
    assessmentWeight: number;
    examWeight: number;
    passMark: number;
  }>({
    assessmentWeight: 70,
    examWeight: 30,
    passMark: 50,
  });
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState<
    number | undefined
  >(undefined);
  const [selectedTermId, setSelectedTermId] = useState<number | undefined>(
    undefined,
  );
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Bulk grading states
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkType, setBulkType] = useState<"assessment" | "exam">("assessment");
  const [scoreTitle, setScoreTitle] = useState("");
  const [scoreDescription, setScoreDescription] = useState("");
  const [maxScore, setMaxScore] = useState(100);
  const [studentScores, setStudentScores] = useState<
    Map<number, { score: number; scoreId?: number }>
  >(new Map());
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingTitle, setEditingTitle] = useState<ScoreTitle | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<ScoreTitle | null>(
    null,
  );

  useEffect(() => {
    checkAccess();
  }, []);

  useEffect(() => {
    if (authorized === true) {
      loadAcademicYears();
    }
  }, [authorized]);

  useEffect(() => {
    if (selectedAcademicYearId) {
      loadTerms(selectedAcademicYearId);
    } else {
      setTerms([]);
    }
  }, [selectedAcademicYearId]);

  useEffect(() => {
    if (authorized === true && selectedAcademicYearId) {
      loadData();
    }
  }, [authorized, selectedAcademicYearId, selectedTermId]);

  const checkAccess = async () => {
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
    if (result.academicYears && result.academicYears.length > 0) {
      setAcademicYears(result.academicYears);
      // Auto-select active academic year or first one
      const activeYear = result.academicYears.find(
        (y: AcademicYear) => y.is_active,
      );
      if (activeYear) {
        setSelectedAcademicYearId(activeYear.id);
      } else if (!selectedAcademicYearId) {
        setSelectedAcademicYearId(result.academicYears[0].id);
      }
    }
  };

  const loadTerms = async (academicYearId: number) => {
    const result = await getTerms(academicYearId);
    if (result.terms) {
      setTerms(result.terms);
      // Auto-select active term
      const activeTerm = result.terms.find((t: Term) => t.is_active);
      if (activeTerm) {
        setSelectedTermId(activeTerm.id);
      } else if (result.terms.length > 0 && !selectedTermId) {
        setSelectedTermId(result.terms[0].id);
      }
    }
  };

  const loadData = async () => {
    if (!selectedAcademicYearId) return;

    setLoading(true);
    setError(null);

    try {
      // Load students using the grade action (which checks authorization)
      const studentsResult = await getStudentsByClassFromGrade(classId);
      if (studentsResult.students) {
        setStudents(studentsResult.students);
      }

      // Load assessment titles
      const assessmentTitlesResult = await getAssessmentTitles(
        classId,
        subjectId,
        "assessment",
        selectedTermId,
        selectedAcademicYearId,
      );
      if (assessmentTitlesResult.titles) {
        setAssessmentTitles(assessmentTitlesResult.titles);
      }

      // Load exam titles
      const examTitlesResult = await getAssessmentTitles(
        classId,
        subjectId,
        "exam",
        selectedTermId,
        selectedAcademicYearId,
      );
      if (examTitlesResult.titles) {
        setExamTitles(examTitlesResult.titles);
      }

      // Load weight settings
      const weightsResult = await getGradeWeights(
        classId,
        subjectId,
        selectedTermId,
        selectedAcademicYearId,
      );
      setSettings({
        assessmentWeight: weightsResult.assessmentWeight,
        examWeight: weightsResult.examWeight,
        passMark: weightsResult.passMark,
      });

      // Load calculated grades
      const gradesResult = await getCalculatedGrades(
        classId,
        subjectId,
        selectedAcademicYearId,
        selectedTermId,
      );

      if (gradesResult.students && gradesResult.students.length > 0) {
        setGrades(gradesResult.students);
        // Ensure summary has all required fields
        const summaryData = gradesResult.summary || DEFAULT_SUMMARY;
        setSummary({
          totalStudents: summaryData.totalStudents ?? 0,
          studentsWithScores: summaryData.studentsWithScores ?? 0,
          studentsWithoutScores: summaryData.studentsWithoutScores ?? 0,
          classAverage: summaryData.classAverage ?? "0",
          passCount: summaryData.passCount ?? 0,
          failCount: summaryData.failCount ?? 0,
          passRate: summaryData.passRate ?? "0",
          gradeDistribution: summaryData.gradeDistribution ?? {
            A: 0,
            B: 0,
            C: 0,
            D: 0,
            E: 0,
            F: 0,
            NoGrade: 0,
          },
        });
      } else if (
        studentsResult.students &&
        studentsResult.students.length > 0
      ) {
        // No grades data - create empty grade entries
        const emptyGrades = studentsResult.students.map((student: Student) => ({
          student,
          assessments: [],
          exams: [],
          assessmentTotal: 0,
          examTotal: 0,
          assessmentMaxTotal: 0,
          examMaxTotal: 0,
          assessmentPercentage: "0",
          examPercentage: "0",
          finalScore: null,
          letterGrade: "-",
          gradePoint: null,
          remarks: "No grades entered",
          isPassing: false,
          hasScores: false,
        }));
        setGrades(emptyGrades);
        setSummary({
          totalStudents: studentsResult.students.length,
          studentsWithScores: 0,
          studentsWithoutScores: studentsResult.students.length,
          classAverage: "0",
          passCount: 0,
          failCount: 0,
          passRate: "0",
          gradeDistribution: {
            A: 0,
            B: 0,
            C: 0,
            D: 0,
            E: 0,
            F: 0,
            NoGrade: studentsResult.students.length,
          },
        });
      }
    } catch (err: any) {
      console.error("Error loading data:", err);
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // Helper to get students - needed because we can't use the attendance import
  const getStudentsByClassFromGrade = async (classId: number) => {
    // This function is now available in the grade actions
    const { getStudentsByClass } = await import("@/lib/action/teacher/grade");
    return getStudentsByClass(classId);
  };

  const handleWeightUpdate = async () => {
    if (!selectedAcademicYearId) {
      alert("Please select an academic year first");
      return;
    }

    const result = await updateGradeWeights(
      classId,
      subjectId,
      selectedAcademicYearId,
      settings.assessmentWeight,
      settings.examWeight,
      settings.passMark,
      selectedTermId,
    );
    if (result.success) {
      setShowWeightModal(false);
      await loadData();
    } else {
      alert(result.error);
    }
  };

  const handleBulkGrade = async () => {
    if (!scoreTitle.trim()) {
      alert("Please enter a title");
      return;
    }
    if (!selectedAcademicYearId) {
      alert("Please select an academic year");
      return;
    }
    if (maxScore <= 0) {
      alert("Max score must be greater than 0");
      return;
    }

    const scores = Array.from(studentScores.entries()).map(
      ([studentId, data]) => ({
        studentId,
        score: data.score,
        scoreId: data.scoreId,
      }),
    );

    let result;
    if (isEditMode && editingTitle) {
      result = await updateBulkScores(
        classId,
        subjectId,
        bulkType,
        scoreTitle,
        selectedAcademicYearId,
        maxScore,
        scores,
        selectedTermId,
        scoreDescription,
      );
    } else {
      result = await createBulkScores(
        classId,
        subjectId,
        bulkType,
        scoreTitle,
        selectedAcademicYearId,
        maxScore,
        scores,
        selectedTermId,
        scoreDescription,
      );
    }

    if (result.success) {
      setShowBulkModal(false);
      setScoreTitle("");
      setScoreDescription("");
      setMaxScore(100);
      setStudentScores(new Map());
      setIsEditMode(false);
      setEditingTitle(null);
      await loadData();
    } else {
      alert(result.error);
    }
  };

  const handleEditAssessment = async (
    title: ScoreTitle,
    type: "assessment" | "exam",
  ) => {
    setBulkType(type);
    setScoreTitle(title.title);
    setScoreDescription(title.description || "");
    setMaxScore(title.max_score);
    setIsEditMode(true);
    setEditingTitle(title);

    const scoresResult = await getStudentScores(
      classId,
      subjectId,
      type,
      selectedTermId,
      selectedAcademicYearId,
    );
    if (scoresResult.scores) {
      const scoreMap = new Map();
      scoresResult.scores
        .filter((s) => s.title === title.title)
        .forEach((score) => {
          scoreMap.set(score.student_id, {
            score: score.score,
            scoreId: score.id,
          });
        });
      setStudentScores(scoreMap);
    }

    setShowBulkModal(true);
  };

  const handleDeleteAssessment = async (
    title: ScoreTitle,
    type: "assessment" | "exam",
  ) => {
    if (!selectedAcademicYearId) {
      alert("Please select an academic year");
      return;
    }

    const result = await deleteAssessment(
      classId,
      subjectId,
      type,
      title.title,
      selectedAcademicYearId,
      selectedTermId,
    );

    if (result.success) {
      setShowDeleteConfirm(null);
      await loadData();
    } else {
      alert(result.error);
    }
  };

  const updateStudentScore = (studentId: number, score: number) => {
    const newScores = new Map(studentScores);
    const existing = newScores.get(studentId) || { score: 0 };
    newScores.set(studentId, { ...existing, score: Math.min(score, maxScore) });
    setStudentScores(newScores);
  };

  const openBulkModal = (type: "assessment" | "exam") => {
    setBulkType(type);
    setScoreTitle("");
    setScoreDescription("");
    setMaxScore(type === "assessment" ? 20 : 100);
    setStudentScores(new Map());
    setIsEditMode(false);
    setEditingTitle(null);
    setShowBulkModal(true);
  };

  const getLetterGradeColor = (grade: string) => {
    switch (grade) {
      case "A":
        return styles.gradeA;
      case "B":
        return styles.gradeB;
      case "C":
        return styles.gradeC;
      case "D":
        return styles.gradeD;
      case "E":
        return styles.gradeE;
      default:
        return styles.gradeF;
    }
  };

  const getTermDisplay = () => {
    const term = terms.find((t) => t.id === selectedTermId);
    const year = academicYears.find((y) => y.id === selectedAcademicYearId);
    if (term && year) {
      return `${term.name} - ${year.year}`;
    }
    if (term) return term.name;
    if (year) return `${year.year}`;
    return "Current";
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading grade data...</p>
      </div>
    );
  }

  if (authorized === false) {
    return (
      <div className={styles.unauthorized}>
        <div className={styles.unauthorizedIcon}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z" />
          </svg>
        </div>
        <h2>Unauthorized Access</h2>
        <p>
          You are not authorized to manage grades for this class and subject.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Grade Management</h1>
          <p className={styles.subtitle}>
            Class ID: {classId} | Subject ID: {subjectId} | {getTermDisplay()}
          </p>
        </div>
        <button
          className={styles.weightButton}
          onClick={() => setShowWeightModal(true)}
          disabled={!selectedAcademicYearId}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 6v12m-3-3h6" />
          </svg>
          Weights: {settings.assessmentWeight}/{settings.examWeight}
        </button>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label>Academic Year *</label>
          <select
            value={selectedAcademicYearId || ""}
            onChange={(e) =>
              setSelectedAcademicYearId(
                e.target.value ? parseInt(e.target.value) : undefined,
              )
            }
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
            value={selectedTermId || ""}
            onChange={(e) =>
              setSelectedTermId(
                e.target.value ? parseInt(e.target.value) : undefined,
              )
            }
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

      {/* Error Banner */}
      {error && (
        <div className={styles.errorBanner}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Warning if no academic year selected */}
      {!selectedAcademicYearId && (
        <div className={styles.warningBanner}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Please select an academic year to view and manage grades.
        </div>
      )}

      {/* Tabs */}
      {selectedAcademicYearId && (
        <>
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === "summary" ? styles.activeTab : ""}`}
              onClick={() => setActiveTab("summary")}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M3 13h8V3H3v10Zm0 8h8v-6H3v6Zm10 0h8V11h-8v10Zm0-18v6h8V3h-8Z" />
              </svg>
              Summary & Grades
            </button>
            <button
              className={`${styles.tab} ${activeTab === "assessment" ? styles.activeTab : ""}`}
              onClick={() => setActiveTab("assessment")}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2Z" />
              </svg>
              Assessments ({settings.assessmentWeight}%)
            </button>
            <button
              className={`${styles.tab} ${activeTab === "exam" ? styles.activeTab : ""}`}
              onClick={() => setActiveTab("exam")}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" />
              </svg>
              Exams ({settings.examWeight}%)
            </button>
          </div>

          {/* Summary Tab */}
          {activeTab === "summary" && (
            <>
              <div className={styles.summaryCards}>
                <div className={styles.card}>
                  <div className={styles.cardIcon}>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 4.354a4 4 0 1 1 0 5.292M15 21H3v-1a6 6 0 0 1 12 0v1Zm0 0h6v-1a6 6 0 0 0-9-5.197M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" />
                    </svg>
                  </div>
                  <div className={styles.cardContent}>
                    <span className={styles.cardValue}>
                      {summary.totalStudents}
                    </span>
                    <span className={styles.cardLabel}>Total Students</span>
                  </div>
                </div>
                <div className={styles.card}>
                  <div className={styles.cardIcon}>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M9 19v-6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v6" />
                      <path d="M12 3v3m0 0-2-2m2 2 2-2" />
                    </svg>
                  </div>
                  <div className={styles.cardContent}>
                    <span className={styles.cardValue}>
                      {summary.classAverage}%
                    </span>
                    <span className={styles.cardLabel}>Class Average</span>
                  </div>
                </div>
                <div className={styles.card}>
                  <div className={styles.cardIcon}>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                  </div>
                  <div className={styles.cardContent}>
                    <span className={styles.cardValue}>
                      {summary.passRate}%
                    </span>
                    <span className={styles.cardLabel}>Pass Rate</span>
                  </div>
                </div>
                <div className={styles.card}>
                  <div className={styles.cardIcon}>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                  </div>
                  <div className={styles.cardContent}>
                    <span className={styles.cardValue}>
                      {summary.studentsWithScores}/{summary.totalStudents}
                    </span>
                    <span className={styles.cardLabel}>With Grades</span>
                  </div>
                </div>
              </div>

              {/* Grades Table */}
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Admission No.</th>
                      <th>Assessment ({settings.assessmentWeight}%)</th>
                      <th>Exam ({settings.examWeight}%)</th>
                      <th>Total Score</th>
                      <th>Grade</th>
                      <th>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grades.length > 0 ? (
                      grades.map((grade) => (
                        <tr
                          key={grade.student.id}
                          className={!grade.hasScores ? styles.noGradeRow : ""}
                        >
                          <td className={styles.studentCell}>
                            <div className={styles.studentAvatar}>
                              {grade.student.first_name?.[0] || ""}
                              {grade.student.last_name?.[0] || ""}
                            </div>
                            <span>
                              {grade.student.full_name ||
                                `${grade.student.first_name} ${grade.student.last_name}`}
                            </span>
                          </td>
                          <td>
                            {grade.student.admission_number ||
                              grade.student.student_number ||
                              "—"}
                          </td>
                          <td className={styles.scoreCell}>
                            {grade.hasScores ? (
                              <>
                                {grade.assessmentPercentage}%
                                <span className={styles.scoreDetail}>
                                  ({grade.assessmentTotal}/
                                  {grade.assessmentMaxTotal})
                                </span>
                              </>
                            ) : (
                              <span className={styles.noScore}>—</span>
                            )}
                          </td>
                          <td className={styles.scoreCell}>
                            {grade.hasScores ? (
                              <>
                                {grade.examPercentage}%
                                <span className={styles.scoreDetail}>
                                  ({grade.examTotal}/{grade.examMaxTotal})
                                </span>
                              </>
                            ) : (
                              <span className={styles.noScore}>—</span>
                            )}
                          </td>
                          <td className={styles.finalScore}>
                            {grade.finalScore ? `${grade.finalScore}%` : "—"}
                          </td>
                          <td>
                            {grade.letterGrade !== "-" ? (
                              <span
                                className={`${styles.letterGrade} ${getLetterGradeColor(grade.letterGrade)}`}
                              >
                                {grade.letterGrade}
                              </span>
                            ) : (
                              <span className={styles.noGradeBadge}>—</span>
                            )}
                          </td>
                          <td className={styles.remarks}>{grade.remarks}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className={styles.emptyTableRow}>
                          <div className={styles.emptyTableState}>
                            <span>📭</span>
                            <p>No students found in this class</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Grade Distribution */}
              {summary.totalStudents > 0 && (
                <div className={styles.distributionSection}>
                  <h4>Grade Distribution</h4>
                  <div className={styles.distributionBars}>
                    {Object.entries(summary.gradeDistribution).map(
                      ([grade, count]) => {
                        const total = summary.totalStudents || 1;
                        const percentage =
                          total > 0 ? ((count as number) / total) * 100 : 0;
                        const barClass =
                          grade === "A"
                            ? styles.barA
                            : grade === "B"
                              ? styles.barB
                              : grade === "C"
                                ? styles.barC
                                : grade === "D"
                                  ? styles.barD
                                  : grade === "E"
                                    ? styles.barE
                                    : grade === "F"
                                      ? styles.barF
                                      : styles.barNoGrade;

                        const gradeLabel =
                          grade === "NoGrade" ? "No Grade" : `Grade ${grade}`;

                        return (
                          <div key={grade} className={styles.distributionItem}>
                            <span className={styles.distributionLabel}>
                              {gradeLabel}
                            </span>
                            <div className={styles.distributionBarContainer}>
                              <div
                                className={`${styles.distributionBar} ${barClass}`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className={styles.distributionCount}>
                              {count as number}
                            </span>
                          </div>
                        );
                      },
                    )}
                  </div>
                </div>
              )}

              {/* Info Banner */}
              {summary.studentsWithScores === 0 &&
                summary.totalStudents > 0 && (
                  <div className={styles.infoBanner}>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>
                      No grades have been entered yet. Use the Assessments or
                      Exams tab to add scores.
                    </span>
                  </div>
                )}
            </>
          )}

          {/* Assessment Tab */}
          {activeTab === "assessment" && (
            <>
              <div className={styles.actionSection}>
                <button
                  className={styles.primaryButton}
                  onClick={() => openBulkModal("assessment")}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 4v16m8-8H4" />
                  </svg>
                  New Assessment
                </button>
              </div>

              {assessmentTitles.length > 0 ? (
                <div className={styles.scoresSection}>
                  <h3 className={styles.sectionTitle}>Recorded Assessments</h3>
                  <div className={styles.scoresList}>
                    {assessmentTitles.map((item) => (
                      <div key={item.id} className={styles.scoreCard}>
                        <div className={styles.scoreHeader}>
                          <span className={styles.scoreTitle}>
                            {item.title}
                          </span>
                          <span className={styles.scoreTotal}>
                            Max Score: {item.max_score}
                          </span>
                          <div className={styles.scoreActions}>
                            <button
                              className={styles.editButton}
                              onClick={() =>
                                handleEditAssessment(item, "assessment")
                              }
                            >
                              Edit
                            </button>
                          </div>
                        </div>
                        {item.description && (
                          <p className={styles.scoreDescription}>
                            {item.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>📝</div>
                  <p>No assessments recorded yet</p>
                  <button
                    className={styles.emptyButton}
                    onClick={() => openBulkModal("assessment")}
                  >
                    Create First Assessment
                  </button>
                </div>
              )}
            </>
          )}

          {/* Exam Tab */}
          {activeTab === "exam" && (
            <>
              <div className={styles.actionSection}>
                <button
                  className={styles.primaryButton}
                  onClick={() => openBulkModal("exam")}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 4v16m8-8H4" />
                  </svg>
                  New Exam
                </button>
              </div>

              {examTitles.length > 0 ? (
                <div className={styles.scoresSection}>
                  <h3 className={styles.sectionTitle}>Recorded Exams</h3>
                  <div className={styles.scoresList}>
                    {examTitles.map((item) => (
                      <div key={item.id} className={styles.scoreCard}>
                        <div className={styles.scoreHeader}>
                          <span className={styles.scoreTitle}>
                            {item.title}
                          </span>
                          <span className={styles.scoreTotal}>
                            Max Score: {item.max_score}
                          </span>
                          <div className={styles.scoreActions}>
                            <button
                              className={styles.editButton}
                              onClick={() => handleEditAssessment(item, "exam")}
                            >
                              Edit
                            </button>
                          </div>
                        </div>
                        {item.description && (
                          <p className={styles.scoreDescription}>
                            {item.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>📋</div>
                  <p>No exams recorded yet</p>
                  <button
                    className={styles.emptyButton}
                    onClick={() => openBulkModal("exam")}
                  >
                    Create First Exam
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Bulk Grading Modal */}
      {showBulkModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowBulkModal(false)}
        >
          <div
            className={`${styles.modal} ${styles.largeModal}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3>
                {isEditMode ? "Edit" : "New"}{" "}
                {bulkType === "assessment" ? "Assessment" : "Exam"}
              </h3>
              <button
                className={styles.closeButton}
                onClick={() => setShowBulkModal(false)}
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
            <div className={styles.modalBody}>
              <div className={styles.formSection}>
                <h4>Details</h4>
                <div className={styles.formGroup}>
                  <label>Title *</label>
                  <input
                    type="text"
                    placeholder={
                      bulkType === "assessment"
                        ? "e.g., Homework 1, Classwork 1"
                        : "e.g., End of Term Exam"
                    }
                    value={scoreTitle}
                    onChange={(e) => setScoreTitle(e.target.value)}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Description (Optional)</label>
                  <textarea
                    placeholder="Optional description"
                    value={scoreDescription}
                    onChange={(e) => setScoreDescription(e.target.value)}
                    rows={2}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Max Score *</label>
                  <input
                    type="number"
                    placeholder={bulkType === "assessment" ? "20" : "100"}
                    value={maxScore}
                    onChange={(e) => setMaxScore(parseInt(e.target.value) || 0)}
                    min={1}
                  />
                </div>
              </div>

              <div className={styles.formSection}>
                <h4>Student Scores</h4>
                <div className={styles.scoresTable}>
                  <table className={styles.scoreTable}>
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Admission No.</th>
                        <th>Score (/{maxScore})</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student) => (
                        <tr key={student.id}>
                          <td className={styles.studentCell}>
                            <div className={styles.studentAvatarSmall}>
                              {student.first_name?.[0] || ""}
                              {student.last_name?.[0] || ""}
                            </div>
                            {student.full_name ||
                              `${student.first_name} ${student.last_name}`}
                          </td>
                          <td>
                            {student.admission_number ||
                              student.student_number ||
                              "—"}
                          </td>
                          <td>
                            <input
                              type="number"
                              min="0"
                              max={maxScore}
                              value={studentScores.get(student.id)?.score ?? ""}
                              onChange={(e) =>
                                updateStudentScore(
                                  student.id,
                                  parseInt(e.target.value) || 0,
                                )
                              }
                              className={styles.scoreInput}
                              placeholder="Score"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button
                className={styles.cancelButton}
                onClick={() => setShowBulkModal(false)}
              >
                Cancel
              </button>
              <button className={styles.submitButton} onClick={handleBulkGrade}>
                {isEditMode ? "Update All Scores" : "Save All Scores"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowDeleteConfirm(null)}
        >
          <div
            className={styles.confirmModal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.confirmIcon}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3>Delete {showDeleteConfirm.title}?</h3>
            <p>
              This will permanently delete all scores for this {bulkType}. This
              action cannot be undone.
            </p>
            <div className={styles.confirmActions}>
              <button
                className={styles.cancelButton}
                onClick={() => setShowDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button
                className={styles.deleteButton}
                onClick={() =>
                  handleDeleteAssessment(showDeleteConfirm, bulkType)
                }
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Weight Settings Modal */}
      {showWeightModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowWeightModal(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Grade Weight Distribution</h3>
              <button
                className={styles.closeButton}
                onClick={() => setShowWeightModal(false)}
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
            <div className={styles.modalBody}>
              <p className={styles.modalText}>
                Set the weight distribution for Assessments and Exams. Total
                must be 100%.
              </p>
              <div className={styles.weightInputs}>
                <div className={styles.formGroup}>
                  <label>Assessment Weight (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={settings.assessmentWeight}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      setSettings({
                        ...settings,
                        assessmentWeight: val,
                        examWeight: 100 - val,
                      });
                    }}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Exam Weight (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={settings.examWeight}
                    disabled
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Pass Mark (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={settings.passMark}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        passMark: parseInt(e.target.value) || 50,
                      })
                    }
                  />
                </div>
              </div>
              <div className={styles.weightTotal}>
                Total: {settings.assessmentWeight + settings.examWeight}%
                {settings.assessmentWeight + settings.examWeight !== 100 && (
                  <span className={styles.weightError}> (Must equal 100%)</span>
                )}
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button
                className={styles.cancelButton}
                onClick={() => setShowWeightModal(false)}
              >
                Cancel
              </button>
              <button
                className={styles.submitButton}
                onClick={handleWeightUpdate}
                disabled={
                  settings.assessmentWeight + settings.examWeight !== 100 ||
                  !selectedAcademicYearId
                }
              >
                Save Weights
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
