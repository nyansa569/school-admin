// app/(teacher)/teacher/(sub-teacher)/[module]/class/[classid]/subject/[subjectid]/components/AssessmentView.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  getAssessmentSummary,
  getAssessments,
  saveStudentAssessment,
  bulkSaveAssessments,
  getAssessmentTypes,
  checkTeacherAuthorization,
  getAcademicYears,
  getTerms,
  getCurrentActiveTerm,
} from "@/lib/action/teacher/assessment";
import styles from "./AssessmentView.module.css";
import { calculateGrade } from "@/utils/assessment";

type AssessmentViewProps = {
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

type AssessmentDataItem = {
  score: number | null;
  grade: string | null;
  remarks: string | null;
  recommendations: string | null;
};

type AssessmentData = {
  student: Student;
  performance: AssessmentDataItem | null;
  attitude: AssessmentDataItem | null;
  behavior: AssessmentDataItem | null;
  participation: AssessmentDataItem | null;
};

type AssessmentType = "performance" | "attitude" | "behavior" | "participation";

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

export default function AssessmentView({ classId, subjectId }: AssessmentViewProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [students, setStudents] = useState<AssessmentData[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [selectedTermId, setSelectedTermId] = useState<number | undefined>(undefined);
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState<number | undefined>(undefined);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [assessmentTypes, setAssessmentTypes] = useState<any[]>([]);
  const [selectedType, setSelectedType] = useState<AssessmentType>("performance");
  const [editingStudent, setEditingStudent] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    numeric_score: "",
    letter_grade: "",
    remarks: "",
    recommendations: "",
  });

  useEffect(() => {
    checkAccess();
    loadAssessmentTypes();
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
    if (authorized === true) {
      loadData();
      loadCurrentActiveInfo();
    }
  }, [authorized, selectedTermId, selectedAcademicYearId]);

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

  const loadAssessmentTypes = async () => {
    const result = await getAssessmentTypes();
    if (result.types) {
      setAssessmentTypes(result.types);
    }
  };

  const loadAcademicYears = async () => {
    const result = await getAcademicYears();
    if (result.academicYears) {
      setAcademicYears(result.academicYears);
      
      // Auto-select active academic year
      const activeYear = result.academicYears.find((y: AcademicYear) => y.is_active);
      if (activeYear) {
        setSelectedAcademicYearId(activeYear.id);
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
      }
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

  const loadData = async () => {
    setLoading(true);
    
    // Load assessment summary
    const result = await getAssessmentSummary(
      classId, 
      subjectId, 
      selectedTermId, 
      selectedAcademicYearId
    );
    
    if (result.students) {
      setStudents(result.students);
      setSummary(result.summary);
    } else if (result.error) {
      console.error("Error loading assessments:", result.error);
    }
    
    setLoading(false);
  };

  const handleSaveAssessment = async (studentId: number, type: AssessmentType) => {
    if (!editForm.numeric_score && !editForm.remarks) {
      alert("Please enter either a score or remarks");
      return;
    }

    setSaving(true);
    
    // Use calculateGrade pure function (not a server action)
    const numericScore = editForm.numeric_score ? parseInt(editForm.numeric_score) : undefined;
    const letterGrade = numericScore ? calculateGrade(numericScore) : editForm.letter_grade || undefined;
    
    const result = await saveStudentAssessment(
      classId,
      subjectId,
      studentId,
      {
        assessment_type: type,
        numeric_score: numericScore,
        letter_grade: letterGrade,
        remarks: editForm.remarks || undefined,
        recommendations: editForm.recommendations || undefined,
        term_id: selectedTermId,
        academic_year_id: selectedAcademicYearId,
      }
    );

    if (result.success) {
      await loadData();
      setEditingStudent(null);
      setEditForm({ 
        numeric_score: "", 
        letter_grade: "", 
        remarks: "", 
        recommendations: "" 
      });
    } else {
      alert(result.error);
    }
    
    setSaving(false);
  };

  const handleBulkSave = async () => {
    setSaving(true);
    
    // Use calculateGrade pure function for each student
    const assessments = students.map(student => {
      const assessment = student[selectedType];
      const numericScore = assessment?.score || undefined;
      const letterGrade = numericScore ? calculateGrade(numericScore) : undefined;
      
      return {
        studentId: student.student.id,
        assessment_type: selectedType,
        numeric_score: numericScore,
        letter_grade: letterGrade,
        remarks: assessment?.remarks || undefined,
        recommendations: assessment?.recommendations || undefined,
      };
    });

    const result = await bulkSaveAssessments(
      classId,
      subjectId,
      assessments,
      selectedTermId,
      selectedAcademicYearId
    );

    if (result.success) {
      await loadData();
      alert(`Saved: ${result.updatedCount} updated, ${result.insertedCount} new`);
    } else {
      alert(result.error);
    }
    
    setSaving(false);
  };

  const updateStudentAssessment = (studentId: number, type: AssessmentType, field: string, value: any) => {
    setStudents(prev =>
      prev.map(student =>
        student.student.id === studentId
          ? {
              ...student,
              [type]: {
                ...student[type],
                [field]: value,
              },
            }
          : student
      )
    );
  };

  const getTypeLabel = (type: string): string => {
    switch (type) {
      case "performance": return "Academic Performance";
      case "attitude": return "Attitude";
      case "behavior": return "Behavior";
      case "participation": return "Participation";
      default: return type;
    }
  };

  const getTypeColor = (type: string): string => {
    switch (type) {
      case "performance": return styles.performanceColor;
      case "attitude": return styles.attitudeColor;
      case "behavior": return styles.behaviorColor;
      case "participation": return styles.participationColor;
      default: return "";
    }
  };

  const getScoreBadgeClass = (score: number | null | undefined): string => {
    if (!score && score !== 0) return styles.scoreNone;
    if (score >= 80) return styles.scoreExcellent;
    if (score >= 70) return styles.scoreGood;
    if (score >= 60) return styles.scoreAverage;
    if (score >= 50) return styles.scoreBelowAverage;
    return styles.scorePoor;
  };

  const getGradeBadgeClass = (grade: string | null | undefined): string => {
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
    const term = terms.find(t => t.id === selectedTermId);
    const year = academicYears.find(y => y.id === selectedAcademicYearId);
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
        <p>Loading assessment data...</p>
      </div>
    );
  }

  if (authorized === false) {
    return (
      <div className={styles.unauthorized}>
        <div className={styles.unauthorizedIcon}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z" />
          </svg>
        </div>
        <h2>Unauthorized Access</h2>
        <p>You are not authorized to manage assessments for this class and subject.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Student Assessment</h1>
          <p className={styles.subtitle}>
            Class ID: {classId} | Subject ID: {subjectId} | {getTermDisplay()}
          </p>
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
        <div className={styles.filterGroup}>
          <label>Assessment Type</label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as AssessmentType)}
          >
            {assessmentTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.filterGroup}>
          <button
            className={styles.bulkSaveButton}
            onClick={handleBulkSave}
            disabled={saving || students.length === 0}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 13l4 4L19 7" />
            </svg>
            {saving ? "Saving..." : "Save All"}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className={styles.summaryCards}>
          <div className={styles.card}>
            <div className={`${styles.cardIcon} ${styles.performanceColor}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 19v-6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v6" />
                <path d="M12 3v3m0 0-2-2m2 2 2-2" />
              </svg>
            </div>
            <div className={styles.cardContent}>
              <span className={styles.cardValue}>
                {summary.averagePerformance !== "N/A" ? `${summary.averagePerformance}%` : "—"}
              </span>
              <span className={styles.cardLabel}>Avg Performance</span>
            </div>
          </div>
          <div className={styles.card}>
            <div className={`${styles.cardIcon} ${styles.attitudeColor}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14.828 14.828a4 4 0 0 1-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
            <div className={styles.cardContent}>
              <span className={styles.cardValue}>
                {summary.averageAttitude !== "N/A" ? `${summary.averageAttitude}%` : "—"}
              </span>
              <span className={styles.cardLabel}>Avg Attitude</span>
            </div>
          </div>
          <div className={styles.card}>
            <div className={`${styles.cardIcon} ${styles.behaviorColor}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
            </div>
            <div className={styles.cardContent}>
              <span className={styles.cardValue}>
                {summary.averageBehavior !== "N/A" ? `${summary.averageBehavior}%` : "—"}
              </span>
              <span className={styles.cardLabel}>Avg Behavior</span>
            </div>
          </div>
          <div className={styles.card}>
            <div className={`${styles.cardIcon} ${styles.participationColor}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 20h5v-2a3 3 0 0 0-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 0 1 5.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 0 1 9.288 0M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM7 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z" />
              </svg>
            </div>
            <div className={styles.cardContent}>
              <span className={styles.cardValue}>
                {summary.averageParticipation !== "N/A" ? `${summary.averageParticipation}%` : "—"}
              </span>
              <span className={styles.cardLabel}>Avg Participation</span>
            </div>
          </div>
        </div>
      )}

      {/* Assessment Table */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Student</th>
              <th>Admission No.</th>
              <th className={styles.scoreCol}>Score (0-100)</th>
              <th className={styles.gradeCol}>Grade</th>
              <th>Remarks</th>
              <th>Recommendations</th>
              <th className={styles.actionCol}>Action</th>
            </tr>
          </thead>
          <tbody>
            {students.map((item) => {
              const assessment = item[selectedType];
              const isEditing = editingStudent === item.student.id;
              
              return (
                <tr key={item.student.id}>
                  <td className={styles.studentCell}>
                    <div className={styles.studentAvatar}>
                      {item.student.first_name?.[0] || ""}{item.student.last_name?.[0] || ""}
                    </div>
                    <span>{item.student.full_name || `${item.student.first_name} ${item.student.last_name}`}</span>
                  </td>
                  <td>{item.student.admission_number || item.student.student_number || "—"}</td>
                  <td>
                    {isEditing ? (
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={editForm.numeric_score}
                        onChange={(e) => setEditForm({ ...editForm, numeric_score: e.target.value })}
                        className={styles.scoreInput}
                        placeholder="Score"
                      />
                    ) : assessment?.score !== null && assessment?.score !== undefined ? (
                      <span className={`${styles.scoreBadge} ${getScoreBadgeClass(assessment.score)}`}>
                        {assessment.score}%
                      </span>
                    ) : (
                      <span className={styles.notSet}>Not set</span>
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.letter_grade}
                        onChange={(e) => {}}
                        className={styles.gradeInput}
                        placeholder="Auto-calculated"
                        maxLength={2}
                        disabled
                      />
                    ) : assessment?.grade ? (
                      <span className={`${styles.gradeBadge} ${getGradeBadgeClass(assessment.grade)}`}>
                        {assessment.grade}
                      </span>
                    ) : (
                      <span className={styles.notSet}>—</span>
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <textarea
                        value={editForm.remarks}
                        onChange={(e) => setEditForm({ ...editForm, remarks: e.target.value })}
                        className={styles.remarksInput}
                        placeholder="Remarks (e.g., Good progress, Needs improvement)..."
                        rows={2}
                      />
                    ) : (
                      <span className={styles.remarksText}>
                        {assessment?.remarks || "—"}
                      </span>
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <textarea
                        value={editForm.recommendations}
                        onChange={(e) => setEditForm({ ...editForm, recommendations: e.target.value })}
                        className={styles.recommendationInput}
                        placeholder="Recommendations for improvement..."
                        rows={2}
                      />
                    ) : (
                      <span className={styles.recommendationText}>
                        {assessment?.recommendations || "—"}
                      </span>
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <div className={styles.actionButtons}>
                        <button
                          className={styles.saveButton}
                          onClick={() => handleSaveAssessment(item.student.id, selectedType)}
                          disabled={saving}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 13l4 4L19 7" />
                          </svg>
                          Save
                        </button>
                        <button
                          className={styles.cancelButton}
                          onClick={() => {
                            setEditingStudent(null);
                            setEditForm({ 
                              numeric_score: "", 
                              letter_grade: "", 
                              remarks: "", 
                              recommendations: "" 
                            });
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        className={styles.editButton}
                        onClick={() => {
                          setEditingStudent(item.student.id);
                          setEditForm({
                            numeric_score: assessment?.score?.toString() || "",
                            letter_grade: assessment?.grade || "",
                            remarks: assessment?.remarks || "",
                            recommendations: assessment?.recommendations || "",
                          });
                        }}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 1 1 3.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {students.length === 0 && (
          <div className={styles.emptyState}>
            <p>No students found in this class.</p>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className={styles.legend}>
        <h4>Score Guide</h4>
        <div className={styles.legendItems}>
          <div className={styles.legendItem}>
            <span className={`${styles.legendColor} ${styles.scoreExcellent}`}></span>
            <span>80-100% (A) - Excellent</span>
          </div>
          <div className={styles.legendItem}>
            <span className={`${styles.legendColor} ${styles.scoreGood}`}></span>
            <span>70-79% (B) - Very Good</span>
          </div>
          <div className={styles.legendItem}>
            <span className={`${styles.legendColor} ${styles.scoreAverage}`}></span>
            <span>60-69% (C) - Good</span>
          </div>
          <div className={styles.legendItem}>
            <span className={`${styles.legendColor} ${styles.scoreBelowAverage}`}></span>
            <span>50-59% (D) - Satisfactory</span>
          </div>
          <div className={styles.legendItem}>
            <span className={`${styles.legendColor} ${styles.scorePoor}`}></span>
            <span>0-49% (E/F) - Needs Improvement</span>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className={styles.infoBanner}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="12" x2="12" y2="16" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <span>
          Grades are automatically calculated based on scores. You can also manually override the grade.
        </span>
      </div>
    </div>
  );
}