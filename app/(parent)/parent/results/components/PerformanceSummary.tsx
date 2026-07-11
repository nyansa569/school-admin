// app/parent/results/components/PerformanceSummary.tsx
"use client";

import { OverallResult } from "@/app/(parent)/types";
import styles from "./PerformanceSummary.module.css";

interface PerformanceSummaryProps {
  overall: OverallResult;
}

export default function PerformanceSummary({ overall }: PerformanceSummaryProps) {
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

  const getPositionColor = (position: string) => {
    const num = parseInt(position);
    if (num === 1) return styles.positionFirst;
    if (num === 2) return styles.positionSecond;
    if (num === 3) return styles.positionThird;
    return styles.positionOther;
  };

  return (
    <div className={styles.summaryContainer}>
      <div className={styles.summaryCard}>
        <div className={styles.summaryItem}>
          <div className={styles.summaryIcon}>📊</div>
          <div className={styles.summaryInfo}>
            <span className={styles.summaryLabel}>Average Score</span>
            <span className={styles.summaryValue}>
              {overall.average_score.toFixed(1)}%
            </span>
          </div>
        </div>
        
        <div className={styles.summaryDivider}></div>
        
        <div className={styles.summaryItem}>
          <div className={styles.summaryIcon}>🏆</div>
          <div className={styles.summaryInfo}>
            <span className={styles.summaryLabel}>Aggregate Grade</span>
            <span className={`${styles.summaryValue} ${getGradeColor(overall.aggregate_grade)}`}>
              {overall.aggregate_grade}
            </span>
          </div>
        </div>
        
        <div className={styles.summaryDivider}></div>
        
        <div className={styles.summaryItem}>
          <div className={styles.summaryIcon}>🎯</div>
          <div className={styles.summaryInfo}>
            <span className={styles.summaryLabel}>Position</span>
            <span className={`${styles.summaryValue} ${getPositionColor(overall.position)}`}>
              {overall.position}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.statsCard}>
        <div className={styles.statsHeader}>
          <div className={styles.statsIcon}>📚</div>
          <div className={styles.statsTitle}>Subject Performance</div>
        </div>
        
        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Total Subjects</span>
            <span className={styles.statNumber}>{overall.total_subjects}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Passed</span>
            <span className={`${styles.statNumber} ${styles.passedNumber}`}>
              {overall.subjects_passed}
            </span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Failed</span>
            <span className={`${styles.statNumber} ${styles.failedNumber}`}>
              {overall.subjects_failed}
            </span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Pass Rate</span>
            <span className={styles.statNumber}>
              {((overall.subjects_passed / overall.total_subjects) * 100).toFixed(0)}%
            </span>
          </div>
        </div>

        <div className={styles.remarksSection}>
          <div className={styles.remarksIcon}>💬</div>
          <div className={styles.remarksContent}>
            <span className={styles.remarksLabel}>Class Teacher's Remarks</span>
            <p className={styles.remarksText}>{overall.class_teacher_remarks}</p>
          </div>
        </div>
      </div>
    </div>
  );
}