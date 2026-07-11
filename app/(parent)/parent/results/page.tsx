// app/parent/results/page.tsx
"use client";

import { useState } from "react";
import styles from "./page.module.css";
import { dummyStudentResults, dummyChildren, gradeScale } from "../../data";
import { StudentResults, Child } from "../../types";
import ChildSelector from "../fees/components/ChildSelector";
import PerformanceSummary from "./components/PerformanceSummary";
import SubjectResultsTable from "./components/SubjectResultsTable";
import TermSelector from "./components/TermSelector";

// Map results data by child ID
const resultsByChild: Record<number, StudentResults> = {
  1: {
    student_id: 1,
    student_name: "Michael Appiah",
    student_class: "Kindergarten 2",
    student_class_id: 5,
    student_admission_number: "ADM-2024-0001",
    terms: [
      {
        term_id: 1,
        term_name: "Term 1",
        term_number: 1,
        academic_year: "2024-2025",
        academic_year_id: 1,
        subjects: [
          {
            id: 1,
            subject_id: 1,
            subject_name: "Literacy",
            subject_code: "LIT",
            class_score: 85,
            exam_score: 82,
            total_score: 83.5,
            grade: "A",
            grade_point: 1,
            remarks: "Excellent",
            is_mandatory: true,
          },
          {
            id: 2,
            subject_id: 2,
            subject_name: "Numeracy",
            subject_code: "NUM",
            class_score: 80,
            exam_score: 78,
            total_score: 79,
            grade: "B",
            grade_point: 2,
            remarks: "Good",
            is_mandatory: true,
          },
          {
            id: 3,
            subject_id: 3,
            subject_name: "Creative Arts",
            subject_code: "CART",
            class_score: 90,
            exam_score: 88,
            total_score: 89,
            grade: "A",
            grade_point: 1,
            remarks: "Excellent",
            is_mandatory: true,
          },
          {
            id: 4,
            subject_id: 4,
            subject_name: "Environmental Studies",
            subject_code: "ENV",
            class_score: 75,
            exam_score: 72,
            total_score: 73.5,
            grade: "B",
            grade_point: 2,
            remarks: "Good",
            is_mandatory: true,
          },
        ],
      },
      {
        term_id: 2,
        term_name: "Term 2",
        term_number: 2,
        academic_year: "2024-2025",
        academic_year_id: 1,
        subjects: [
          {
            id: 5,
            subject_id: 1,
            subject_name: "Literacy",
            subject_code: "LIT",
            class_score: 88,
            exam_score: 85,
            total_score: 86.5,
            grade: "A",
            grade_point: 1,
            remarks: "Excellent",
            is_mandatory: true,
          },
          {
            id: 6,
            subject_id: 2,
            subject_name: "Numeracy",
            subject_code: "NUM",
            class_score: 82,
            exam_score: 80,
            total_score: 81,
            grade: "A",
            grade_point: 1,
            remarks: "Excellent",
            is_mandatory: true,
          },
          {
            id: 7,
            subject_id: 3,
            subject_name: "Creative Arts",
            subject_code: "CART",
            class_score: 92,
            exam_score: 90,
            total_score: 91,
            grade: "A",
            grade_point: 1,
            remarks: "Excellent",
            is_mandatory: true,
          },
          {
            id: 8,
            subject_id: 4,
            subject_name: "Environmental Studies",
            subject_code: "ENV",
            class_score: 78,
            exam_score: 75,
            total_score: 76.5,
            grade: "B",
            grade_point: 2,
            remarks: "Good",
            is_mandatory: true,
          },
        ],
      },
    ],
    overall_performance: [
      {
        term_id: 1,
        term_name: "Term 1",
        average_score: 81.25,
        aggregate_grade: "A",
        aggregate_grade_point: 1.25,
        total_subjects: 4,
        subjects_passed: 4,
        subjects_failed: 0,
        position: "1st",
        class_teacher_remarks: "Outstanding performance! Keep up the great work.",
      },
      {
        term_id: 2,
        term_name: "Term 2",
        average_score: 83.75,
        aggregate_grade: "A",
        aggregate_grade_point: 1.25,
        total_subjects: 4,
        subjects_passed: 4,
        subjects_failed: 0,
        position: "1st",
        class_teacher_remarks: "Consistently excellent. Very proud of your progress.",
      },
    ],
  },
  2: {
    student_id: 2,
    student_name: "Adwoa Mensah",
    student_class: "Primary 5",
    student_class_id: 12,
    student_admission_number: "ADM-2024-0002",
    terms: [
      {
        term_id: 1,
        term_name: "Term 1",
        term_number: 1,
        academic_year: "2024-2025",
        academic_year_id: 1,
        subjects: [
          {
            id: 1,
            subject_id: 1,
            subject_name: "Mathematics",
            subject_code: "MATH",
            class_score: 72,
            exam_score: 68,
            total_score: 70,
            grade: "B",
            grade_point: 2,
            remarks: "Good",
            is_mandatory: true,
          },
          {
            id: 2,
            subject_id: 2,
            subject_name: "English Language",
            subject_code: "ENG",
            class_score: 78,
            exam_score: 75,
            total_score: 76.5,
            grade: "B",
            grade_point: 2,
            remarks: "Good",
            is_mandatory: true,
          },
          {
            id: 3,
            subject_id: 3,
            subject_name: "Science",
            subject_code: "SCI",
            class_score: 70,
            exam_score: 65,
            total_score: 67.5,
            grade: "C",
            grade_point: 3,
            remarks: "Credit",
            is_mandatory: true,
          },
          {
            id: 4,
            subject_id: 4,
            subject_name: "Social Studies",
            subject_code: "SST",
            class_score: 75,
            exam_score: 70,
            total_score: 72.5,
            grade: "B",
            grade_point: 2,
            remarks: "Good",
            is_mandatory: true,
          },
          {
            id: 5,
            subject_id: 5,
            subject_name: "Integrated Science",
            subject_code: "INTSCI",
            class_score: 68,
            exam_score: 65,
            total_score: 66.5,
            grade: "C",
            grade_point: 3,
            remarks: "Credit",
            is_mandatory: true,
          },
          {
            id: 6,
            subject_id: 6,
            subject_name: "French",
            subject_code: "FREN",
            class_score: 60,
            exam_score: 55,
            total_score: 57.5,
            grade: "D",
            grade_point: 4,
            remarks: "Pass",
            is_mandatory: false,
          },
        ],
      },
      {
        term_id: 2,
        term_name: "Term 2",
        term_number: 2,
        academic_year: "2024-2025",
        academic_year_id: 1,
        subjects: [
          {
            id: 7,
            subject_id: 1,
            subject_name: "Mathematics",
            subject_code: "MATH",
            class_score: 65,
            exam_score: 60,
            total_score: 62.5,
            grade: "C",
            grade_point: 3,
            remarks: "Credit",
            is_mandatory: true,
          },
          {
            id: 8,
            subject_id: 2,
            subject_name: "English Language",
            subject_code: "ENG",
            class_score: 80,
            exam_score: 78,
            total_score: 79,
            grade: "B",
            grade_point: 2,
            remarks: "Good",
            is_mandatory: true,
          },
          {
            id: 9,
            subject_id: 3,
            subject_name: "Science",
            subject_code: "SCI",
            class_score: 72,
            exam_score: 68,
            total_score: 70,
            grade: "B",
            grade_point: 2,
            remarks: "Good",
            is_mandatory: true,
          },
          {
            id: 10,
            subject_id: 4,
            subject_name: "Social Studies",
            subject_code: "SST",
            class_score: 68,
            exam_score: 65,
            total_score: 66.5,
            grade: "C",
            grade_point: 3,
            remarks: "Credit",
            is_mandatory: true,
          },
          {
            id: 11,
            subject_id: 5,
            subject_name: "Integrated Science",
            subject_code: "INTSCI",
            class_score: 70,
            exam_score: 68,
            total_score: 69,
            grade: "C",
            grade_point: 3,
            remarks: "Credit",
            is_mandatory: true,
          },
          {
            id: 12,
            subject_id: 6,
            subject_name: "French",
            subject_code: "FREN",
            class_score: 58,
            exam_score: 55,
            total_score: 56.5,
            grade: "D",
            grade_point: 4,
            remarks: "Pass",
            is_mandatory: false,
          },
        ],
      },
    ],
    overall_performance: [
      {
        term_id: 1,
        term_name: "Term 1",
        average_score: 68.4,
        aggregate_grade: "C",
        aggregate_grade_point: 2.67,
        total_subjects: 6,
        subjects_passed: 6,
        subjects_failed: 0,
        position: "8th",
        class_teacher_remarks: "Good effort. Keep working hard!",
      },
      {
        term_id: 2,
        term_name: "Term 2",
        average_score: 67.25,
        aggregate_grade: "C",
        aggregate_grade_point: 2.83,
        total_subjects: 6,
        subjects_passed: 6,
        subjects_failed: 0,
        position: "10th",
        class_teacher_remarks: "Improvement shown in English. Focus more on Mathematics.",
      },
    ],
  },
  3: dummyStudentResults, // Use existing JHS 2 data
};

export default function ResultsPage() {
  const [children] = useState<Child[]>(dummyChildren);
  const [selectedChildId, setSelectedChildId] = useState<number>(children[0]?.id || 1);
  const [selectedTermId, setSelectedTermId] = useState<number>(1);

  const studentResults = resultsByChild[selectedChildId];
  const selectedChild = children.find(c => c.id === selectedChildId);

  const selectedTerm = studentResults?.terms.find(
    (term) => term.term_id === selectedTermId
  );
  
  const selectedOverall = studentResults?.overall_performance.find(
    (overall) => overall.term_id === selectedTermId
  );

  const handleChildChange = (childId: number) => {
    setSelectedChildId(childId);
    setSelectedTermId(1); // Reset to first term when changing child
  };

  const handleTermChange = (termId: number) => {
    setSelectedTermId(termId);
  };

  if (!studentResults) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Academic Results</h2>
        <p>View your children's academic performance</p>
      </div>

      {/* Child Selector */}
      <ChildSelector
        children={children}
        selectedChildId={selectedChildId}
        onChildChange={handleChildChange}
      />

      {/* Selected Child Info */}
      {selectedChild && (
        <div className={styles.selectedChildInfo}>
          <div className={styles.childAvatar}>
            {selectedChild.first_name[0]}{selectedChild.last_name[0]}
          </div>
          <div className={styles.childDetails}>
            <h3>{selectedChild.first_name} {selectedChild.last_name}</h3>
            <p>{selectedChild.class?.name} | {selectedChild.admission_number}</p>
          </div>
        </div>
      )}

      {/* Term Selector */}
      <TermSelector
        terms={studentResults.terms}
        selectedTermId={selectedTermId}
        onTermChange={handleTermChange}
      />

      {/* Performance Summary */}
      {selectedOverall && (
        <PerformanceSummary overall={selectedOverall} />
      )}

      {/* Subject Results Table */}
      {selectedTerm && (
        <SubjectResultsTable
          subjects={selectedTerm.subjects}
          termName={selectedTerm.term_name}
          academicYear={selectedTerm.academic_year}
          gradeScale={gradeScale}
        />
      )}
    </div>
  );
}