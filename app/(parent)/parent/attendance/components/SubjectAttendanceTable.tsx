// app/parent/attendance/components/SubjectAttendanceTable.tsx
"use client";

import { SubjectAttendance } from "@/app/(parent)/types";
import styles from "./SubjectAttendanceTable.module.css";

interface SubjectAttendanceTableProps {
  subjectData: SubjectAttendance[];
}

export default function SubjectAttendanceTable({ subjectData }: SubjectAttendanceTableProps) {
  const getRateColor = (rate: number) => {
    if (rate >= 90) return styles.rateExcellent;
    if (rate >= 75) return styles.rateGood;
    if (rate >= 60) return styles.rateFair;
    return styles.ratePoor;
  };

  const getProgressColor = (rate: number) => {
    if (rate >= 90) return "#10b981";
    if (rate >= 75) return "#3b82f6";
    if (rate >= 60) return "#f59e0b";
    return "#ef4444";
  };

  const overallRate = subjectData.length > 0
    ? subjectData.reduce((sum, s) => sum + s.rate, 0) / subjectData.length
    : 0;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>Subject-wise Attendance</h3>
        <div className={styles.overallRate}>
          <span className={styles.overallLabel}>Overall Subject Attendance</span>
          <span className={`${styles.overallValue} ${getRateColor(overallRate)}`}>
            {overallRate.toFixed(1)}%
          </span>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Subject</th>
              <th>Classes</th>
              <th>Present</th>
              <th>Absent</th>
              <th>Late</th>
              <th>Attendance Rate</th>
              <th>Progress</th>
            </tr>
          </thead>
          <tbody>
            {subjectData.map((subject, index) => (
              <tr key={index}>
                <td className={styles.subjectName}>{subject.subject}</td>
                <td className={styles.numberCell}>{subject.total_classes}</td>
                <td className={styles.presentCell}>{subject.present}</td>
                <td className={styles.absentCell}>{subject.absent}</td>
                <td className={styles.lateCell}>{subject.late}</td>
                <td className={styles.rateCell}>
                  <span className={`${styles.rateValue} ${getRateColor(subject.rate)}`}>
                    {subject.rate.toFixed(1)}%
                  </span>
                </td>
                <td className={styles.progressCell}>
                  <div className={styles.progressBarContainer}>
                    <div 
                      className={styles.progressBar}
                      style={{ 
                        width: `${subject.rate}%`,
                        backgroundColor: getProgressColor(subject.rate)
                      }}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <div className={`${styles.legendDot} ${styles.legendExcellent}`}></div>
          <span>90-100% (Excellent)</span>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.legendDot} ${styles.legendGood}`}></div>
          <span>75-89% (Good)</span>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.legendDot} ${styles.legendFair}`}></div>
          <span>60-74% (Fair)</span>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.legendDot} ${styles.legendPoor}`}></div>
          <span>Below 60% (Poor)</span>
        </div>
      </div>
    </div>
  );
}