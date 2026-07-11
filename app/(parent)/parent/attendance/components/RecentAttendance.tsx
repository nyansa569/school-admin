// app/parent/attendance/components/RecentAttendance.tsx
"use client";

import { useState } from "react";
import styles from "./RecentAttendance.module.css";
import { attendanceData } from "@/app/(parent)/data";


interface RecentAttendanceProps {
  childId: number;
  termId: number;
}

export default function RecentAttendance({ childId, termId }: RecentAttendanceProps) {
  const [filter, setFilter] = useState<string>("all");
  
  const records = termId === 1 
    ? attendanceData[childId]?.term1 || []
    : attendanceData[childId]?.term2 || [];
  
  // Get last 30 days or all records
  const recentRecords = [...records].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  ).slice(0, 30);
  
  const filteredRecords = filter === "all" 
    ? recentRecords 
    : recentRecords.filter(r => r.status === filter);
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present": return "✅";
      case "absent": return "❌";
      case "late": return "⏰";
      case "excused": return "📝";
      default: return "❓";
    }
  };
  
  const getStatusClass = (status: string) => {
    switch (status) {
      case "present": return styles.statusPresent;
      case "absent": return styles.statusAbsent;
      case "late": return styles.statusLate;
      case "excused": return styles.statusExcused;
      default: return "";
    }
  };
  
  const getStatusText = (status: string) => {
    switch (status) {
      case "present": return "Present";
      case "absent": return "Absent";
      case "late": return "Late";
      case "excused": return "Excused";
      default: return status;
    }
  };
  
  const filterCounts = {
    all: recentRecords.length,
    present: recentRecords.filter(r => r.status === "present").length,
    absent: recentRecords.filter(r => r.status === "absent").length,
    late: recentRecords.filter(r => r.status === "late").length,
    excused: recentRecords.filter(r => r.status === "excused").length,
  };
  
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>Recent Attendance Records</h3>
        <p>Last 30 school days</p>
      </div>
      
      {/* Filter Tabs */}
      <div className={styles.filterTabs}>
        <button
          className={`${styles.filterTab} ${filter === "all" ? styles.activeFilter : ""}`}
          onClick={() => setFilter("all")}
        >
          All ({filterCounts.all})
        </button>
        <button
          className={`${styles.filterTab} ${filter === "present" ? styles.activeFilter : ""}`}
          onClick={() => setFilter("present")}
        >
          ✅ Present ({filterCounts.present})
        </button>
        <button
          className={`${styles.filterTab} ${filter === "absent" ? styles.activeFilter : ""}`}
          onClick={() => setFilter("absent")}
        >
          ❌ Absent ({filterCounts.absent})
        </button>
        <button
          className={`${styles.filterTab} ${filter === "late" ? styles.activeFilter : ""}`}
          onClick={() => setFilter("late")}
        >
          ⏰ Late ({filterCounts.late})
        </button>
        <button
          className={`${styles.filterTab} ${filter === "excused" ? styles.activeFilter : ""}`}
          onClick={() => setFilter("excused")}
        >
          📝 Excused ({filterCounts.excused})
        </button>
      </div>
      
      {/* Records List */}
      <div className={styles.recordsList}>
        {filteredRecords.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📅</div>
            <p>No attendance records found for this filter.</p>
          </div>
        ) : (
          filteredRecords.map((record) => (
            <div key={record.id} className={styles.recordCard}>
              <div className={styles.recordDate}>
                <span className={styles.dateDay}>
                  {new Date(record.date).toLocaleDateString('en-GB', { day: 'numeric' })}
                </span>
                <span className={styles.dateMonth}>
                  {new Date(record.date).toLocaleDateString('en-GB', { month: 'short' })}
                </span>
              </div>
              
              <div className={`${styles.recordStatus} ${getStatusClass(record.status)}`}>
                <span className={styles.statusIcon}>{getStatusIcon(record.status)}</span>
                <span className={styles.statusText}>{getStatusText(record.status)}</span>
              </div>
              
              <div className={styles.recordDetails}>
                {record.check_in_time && (
                  <div className={styles.detailItem}>
                    <span className={styles.detailIcon}>🕐</span>
                    <span>In: {record.check_in_time}</span>
                  </div>
                )}
                {record.check_out_time && (
                  <div className={styles.detailItem}>
                    <span className={styles.detailIcon}>🕒</span>
                    <span>Out: {record.check_out_time}</span>
                  </div>
                )}
                {record.remarks && (
                  <div className={styles.detailItem}>
                    <span className={styles.detailIcon}>💬</span>
                    <span>{record.remarks}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Summary Note */}
      <div className={styles.note}>
        <span className={styles.noteIcon}>ℹ️</span>
        <span>
          Attendance records are updated daily. For any discrepancies, please contact the school office.
        </span>
      </div>
    </div>
  );
}