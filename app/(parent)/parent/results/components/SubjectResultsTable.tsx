// app/parent/results/components/SubjectResultsTable.tsx
"use client";

import { useState } from "react";
import styles from "./SubjectResultsTable.module.css";
import { GradeScale, SubjectResult } from "@/app/(parent)/types";

interface SubjectResultsTableProps {
  subjects: SubjectResult[];
  termName: string;
  academicYear: string;
  gradeScale: GradeScale[];
}

export default function SubjectResultsTable({
  subjects,
  termName,
  academicYear,
  gradeScale,
}: SubjectResultsTableProps) {
  const [expandedSubject, setExpandedSubject] = useState<number | null>(null);

  const getGradeColor = (grade: string) => {
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
      case "F":
        return styles.gradeF;
      default:
        return styles.gradeDefault;
    }
  };

  const getGradeInfo = (score: number) => {
    const gradeInfo = gradeScale.find(
      (g) => score >= g.min_score && score <= g.max_score
    );
    return gradeInfo || gradeScale[gradeScale.length - 1];
  };

  const toggleExpand = (subjectId: number) => {
    setExpandedSubject(expandedSubject === subjectId ? null : subjectId);
  };

  // Calculate overall statistics
  const totalScore = subjects.reduce((sum, s) => sum + s.total_score, 0);
  const averageScore = (totalScore / subjects.length).toFixed(1);
  const bestSubject = [...subjects].sort((a, b) => b.total_score - a.total_score)[0];
  const worstSubject = [...subjects].sort((a, b) => a.total_score - b.total_score)[0];
  const gradeDistribution = subjects.reduce((acc, s) => {
    acc[s.grade] = (acc[s.grade] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className={styles.tableContainer}>
      {/* Table Header */}
      <div className={styles.tableHeader}>
        <div className={styles.headerLeft}>
          <h3>{termName} Results</h3>
          <p>{academicYear}</p>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.summaryStat}>
            <span className={styles.statLabel}>Average</span>
            <span className={styles.statValue}>{averageScore}%</span>
          </div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className={styles.quickStats}>
        <div className={styles.quickStat}>
          <span className={styles.quickStatLabel}>Best Subject</span>
          <span className={styles.quickStatValue}>
            {bestSubject?.subject_name} ({bestSubject?.total_score.toFixed(1)}%)
          </span>
        </div>
        <div className={styles.quickStat}>
          <span className={styles.quickStatLabel}>Needs Improvement</span>
          <span className={styles.quickStatValue}>
            {worstSubject?.subject_name} ({worstSubject?.total_score.toFixed(1)}%)
          </span>
        </div>
        <div className={styles.quickStat}>
          <span className={styles.quickStatLabel}>Grade Distribution</span>
          <div className={styles.gradeDots}>
            {Object.entries(gradeDistribution).map(([grade, count]) => (
              <span key={grade} className={`${styles.gradeDot} ${getGradeColor(grade)}`} title={`${grade}: ${count}`}>
                {grade}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Subjects List */}
      <div className={styles.subjectsList}>
        {subjects.map((subject) => {
          const gradeInfo = getGradeInfo(subject.total_score);
          const isExpanded = expandedSubject === subject.id;

          return (
            <div key={subject.id} className={styles.subjectCard}>
              <div
                className={styles.subjectHeader}
                onClick={() => toggleExpand(subject.id)}
              >
                <div className={styles.subjectInfo}>
                  <div className={styles.subjectNameRow}>
                    <div className={styles.subjectName}>
                      {subject.subject_name}
                    </div>
                    {!subject.is_mandatory && (
                      <span className={styles.electiveBadge}>Elective</span>
                    )}
                  </div>
                  <div className={styles.subjectCode}>{subject.subject_code}</div>
                </div>

                <div className={styles.scoreInfo}>
                  <div className={styles.totalScoreContainer}>
                    <span className={styles.totalScoreLabel}>Total</span>
                    <span className={styles.totalScore}>
                      {subject.total_score.toFixed(1)}%
                    </span>
                  </div>
                  <div className={`${styles.grade} ${getGradeColor(subject.grade)}`}>
                    {subject.grade}
                  </div>
                  <button className={styles.expandBtn}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d={isExpanded ? "M18 15l-6-6-6 6" : "M6 9l6 6 6-6"} />
                    </svg>
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className={styles.subjectDetails}>
                  <div className={styles.scoresSection}>
                    <div className={styles.sectionTitle}>
                      <span className={styles.sectionIcon}>📝</span>
                      Score Breakdown
                    </div>
                    <div className={styles.scoresGrid}>
                      <div className={styles.scoreCard}>
                        <div className={styles.scoreCardIcon}>📋</div>
                        <div className={styles.scoreCardInfo}>
                          <span className={styles.scoreCardLabel}>Class Score (50%)</span>
                          <div className={styles.scoreBarContainer}>
                            <div 
                              className={styles.scoreBar} 
                              style={{ width: `${subject.class_score}%` }}
                            />
                          </div>
                          <span className={styles.scoreCardValue}>
                            {subject.class_score} / 100
                          </span>
                        </div>
                      </div>
                      <div className={styles.scoreCard}>
                        <div className={styles.scoreCardIcon}>✍️</div>
                        <div className={styles.scoreCardInfo}>
                          <span className={styles.scoreCardLabel}>Exam Score (50%)</span>
                          <div className={styles.scoreBarContainer}>
                            <div 
                              className={styles.scoreBar} 
                              style={{ width: `${subject.exam_score}%` }}
                            />
                          </div>
                          <span className={styles.scoreCardValue}>
                            {subject.exam_score} / 100
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={styles.gradeSection}>
                    <div className={styles.sectionTitle}>
                      <span className={styles.sectionIcon}>⭐</span>
                      Grade Information
                    </div>
                    <div className={styles.gradeGrid}>
                      <div className={styles.gradeCard}>
                        <span className={styles.gradeCardLabel}>Letter Grade</span>
                        <span className={`${styles.gradeCardValue} ${getGradeColor(subject.grade)}`}>
                          {subject.grade}
                        </span>
                      </div>
                      <div className={styles.gradeCard}>
                        <span className={styles.gradeCardLabel}>Grade Point</span>
                        <span className={styles.gradeCardValue}>
                          {subject.grade_point}
                        </span>
                      </div>
                      <div className={styles.gradeCard}>
                        <span className={styles.gradeCardLabel}>Remarks</span>
                        <span className={styles.gradeCardValue}>
                          {subject.remarks}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Performance Analysis Section */}
      <div className={styles.analysisSection}>
        <div className={styles.analysisHeader}>
          <span className={styles.analysisIcon}>📈</span>
          <h4>Performance Analysis</h4>
        </div>
        <div className={styles.analysisGrid}>
          <div className={styles.analysisItem}>
            <span className={styles.analysisLabel}>Subjects Above Average</span>
            <span className={styles.analysisValue}>
              {subjects.filter(s => s.total_score > parseFloat(averageScore)).length} / {subjects.length}
            </span>
          </div>
          <div className={styles.analysisItem}>
            <span className={styles.analysisLabel}>Grade A Achieved</span>
            <span className={styles.analysisValue}>
              {subjects.filter(s => s.grade === "A").length}
            </span>
          </div>
          <div className={styles.analysisItem}>
            <span className={styles.analysisLabel}>Improvement Areas</span>
            <span className={styles.analysisValue}>
              {subjects.filter(s => s.total_score < 50).map(s => s.subject_name).join(", ") || "None"}
            </span>
          </div>
        </div>
      </div>

      {/* Grade Scale Legend */}
      <div className={styles.legendSection}>
        <div className={styles.legendHeader}>
          <span className={styles.legendIcon}>📊</span>
          <h4>Grade Scale</h4>
        </div>
        <div className={styles.legendGrid}>
          {gradeScale.map((grade) => (
            <div key={grade.grade} className={styles.legendItem}>
              <span className={`${styles.legendGrade} ${getGradeColor(grade.grade)}`}>
                {grade.grade}
              </span>
              <div className={styles.legendInfo}>
                <span className={styles.legendRange}>
                  {grade.min_score} - {grade.max_score}%
                </span>
                <span className={styles.legendRemarks}>{grade.remarks}</span>
                <span className={styles.legendPoints}>GP: {grade.grade_point}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}