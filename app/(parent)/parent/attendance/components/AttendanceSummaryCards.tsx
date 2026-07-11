// app/parent/attendance/components/AttendanceSummaryCards.tsx
"use client";

import { AttendanceSummary } from "@/app/(parent)/types";
import styles from "./AttendanceSummaryCards.module.css";

interface AttendanceSummaryCardsProps {
  summary: AttendanceSummary;
}

export default function AttendanceSummaryCards({ summary }: AttendanceSummaryCardsProps) {
  return (
    <div className={styles.summaryGrid}>
      <div className={`${styles.summaryCard} ${styles.attendanceRate}`}>
        <div className={styles.cardIcon}>📊</div>
        <div className={styles.cardInfo}>
          <span className={styles.cardLabel}>Attendance Rate</span>
          <span className={styles.cardValue}>{summary.attendance_rate.toFixed(1)}%</span>
        </div>
      </div>

      <div className={`${styles.summaryCard} ${styles.present}`}>
        <div className={styles.cardIcon}>✅</div>
        <div className={styles.cardInfo}>
          <span className={styles.cardLabel}>Present</span>
          <span className={styles.cardValue}>{summary.present_days}</span>
          <span className={styles.cardSubValue}>days</span>
        </div>
      </div>

      <div className={`${styles.summaryCard} ${styles.absent}`}>
        <div className={styles.cardIcon}>❌</div>
        <div className={styles.cardInfo}>
          <span className={styles.cardLabel}>Absent</span>
          <span className={styles.cardValue}>{summary.absent_days}</span>
          <span className={styles.cardSubValue}>days</span>
        </div>
      </div>

      <div className={`${styles.summaryCard} ${styles.late}`}>
        <div className={styles.cardIcon}>⏰</div>
        <div className={styles.cardInfo}>
          <span className={styles.cardLabel}>Late</span>
          <span className={styles.cardValue}>{summary.late_days}</span>
          <span className={styles.cardSubValue}>days</span>
        </div>
      </div>

      <div className={`${styles.summaryCard} ${styles.excused}`}>
        <div className={styles.cardIcon}>📝</div>
        <div className={styles.cardInfo}>
          <span className={styles.cardLabel}>Excused</span>
          <span className={styles.cardValue}>{summary.excused_days}</span>
          <span className={styles.cardSubValue}>days</span>
        </div>
      </div>

      <div className={`${styles.summaryCard} ${styles.total}`}>
        <div className={styles.cardIcon}>📅</div>
        <div className={styles.cardInfo}>
          <span className={styles.cardLabel}>Total Days</span>
          <span className={styles.cardValue}>{summary.total_days}</span>
          <span className={styles.cardSubValue}>school days</span>
        </div>
      </div>
    </div>
  );
}