// app/parent/attendance/components/MonthlyAttendanceChart.tsx
"use client";

import { MonthlyAttendance, AttendanceSummary } from "@/app/(parent)/types";
import styles from "./MonthlyAttendanceChart.module.css";

interface MonthlyAttendanceChartProps {
  monthlyData: MonthlyAttendance[];
  summary: AttendanceSummary;
}

export default function MonthlyAttendanceChart({ monthlyData, summary }: MonthlyAttendanceChartProps) {
  const maxAttendance = Math.max(...monthlyData.map(m => m.rate), 100);
  
  return (
    <div className={styles.container}>
      <div className={styles.chartHeader}>
        <h3>Monthly Attendance Trend</h3>
        <div className={styles.legend}>
          <div className={styles.legendItem}>
            <div className={`${styles.legendColor} ${styles.presentColor}`}></div>
            <span>Present</span>
          </div>
          <div className={styles.legendItem}>
            <div className={`${styles.legendColor} ${styles.lateColor}`}></div>
            <span>Late</span>
          </div>
          <div className={styles.legendItem}>
            <div className={`${styles.legendColor} ${styles.absentColor}`}></div>
            <span>Absent</span>
          </div>
          <div className={styles.legendItem}>
            <div className={`${styles.legendColor} ${styles.excusedColor}`}></div>
            <span>Excused</span>
          </div>
        </div>
      </div>

      <div className={styles.chartContainer}>
        {monthlyData.map((month) => (
          <div key={month.month_number} className={styles.monthColumn}>
            <div className={styles.monthName}>{month.month.substring(0, 3)}</div>
            <div className={styles.barsContainer}>
              <div className={styles.barGroup}>
                <div 
                  className={`${styles.bar} ${styles.presentBar}`}
                  style={{ height: `${(month.present / month.total) * 100}%`, minHeight: '4px' }}
                  title={`Present: ${month.present} days`}
                />
                <div 
                  className={`${styles.bar} ${styles.lateBar}`}
                  style={{ height: `${(month.late / month.total) * 100}%`, minHeight: '4px' }}
                  title={`Late: ${month.late} days`}
                />
                <div 
                  className={`${styles.bar} ${styles.absentBar}`}
                  style={{ height: `${(month.absent / month.total) * 100}%`, minHeight: '4px' }}
                  title={`Absent: ${month.absent} days`}
                />
                <div 
                  className={`${styles.bar} ${styles.excusedBar}`}
                  style={{ height: `${(month.excused / month.total) * 100}%`, minHeight: '4px' }}
                  title={`Excused: ${month.excused} days`}
                />
              </div>
            </div>
            <div className={styles.monthRate}>{month.rate.toFixed(0)}%</div>
          </div>
        ))}
      </div>

      <div className={styles.attendanceSummary}>
        <div className={styles.summaryText}>
          <span className={styles.summaryIcon}>📈</span>
          <span>
            {summary.attendance_rate >= 90 
              ? "Excellent attendance! Keep it up!" 
              : summary.attendance_rate >= 75 
              ? "Good attendance. Aim for 90% or higher."
              : summary.attendance_rate >= 60
              ? "Fair attendance. Regular attendance is important for academic success."
              : "Attendance needs improvement. Please ensure regular school attendance."}
          </span>
        </div>
        
        {summary.consecutive_absences > 0 && (
          <div className={styles.warningText}>
            <span className={styles.warningIcon}>⚠️</span>
            <span>
              {summary.consecutive_absences} consecutive absence{summary.consecutive_absences > 1 ? 's' : ''} recorded.
              {summary.consecutive_absences >= 3 && " Please contact the school."}
            </span>
          </div>
        )}
        
        {summary.late_count > 5 && (
          <div className={styles.lateWarning}>
            <span className={styles.lateIcon}>⏰</span>
            <span>
              Frequent lateness detected ({summary.late_count} days). Punctuality is important for learning.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}