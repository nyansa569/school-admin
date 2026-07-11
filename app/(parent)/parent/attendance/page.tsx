// app/parent/attendance/page.tsx
"use client";

import { useState } from "react";
import styles from "./page.module.css";
import { dummyChildren, getAttendanceSummary, getMonthlyAttendance, getSubjectAttendance } from "../../data";
import { Child } from "../../types";
import ChildSelector from "../fees/components/ChildSelector";
import AttendanceSummaryCards from "./components/AttendanceSummaryCards";
import MonthlyAttendanceChart from "./components/MonthlyAttendanceChart";
import RecentAttendance from "./components/RecentAttendance";
import SubjectAttendanceTable from "./components/SubjectAttendanceTable";
import TermSelector from "./components/TermSelector";

type TabType = "overview" | "subjects" | "details";

export default function AttendancePage() {
  const [children] = useState<Child[]>(dummyChildren);
  const [selectedChildId, setSelectedChildId] = useState<number>(children[0]?.id || 1);
  const [selectedTermId, setSelectedTermId] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  const selectedChild = children.find(c => c.id === selectedChildId);
  
  const summary = getAttendanceSummary(selectedChildId, selectedTermId);
  const monthlyData = getMonthlyAttendance(selectedChildId, selectedTermId);
  const subjectData = getSubjectAttendance(selectedChildId);

  const handleChildChange = (childId: number) => {
    setSelectedChildId(childId);
    setSelectedTermId(1);
  };

  const handleTermChange = (termId: number) => {
    setSelectedTermId(termId);
  };

  const getAttendanceStatus = (rate: number) => {
    if (rate >= 90) return "excellent";
    if (rate >= 75) return "good";
    if (rate >= 60) return "fair";
    return "poor";
  };

  const status = getAttendanceStatus(summary.attendance_rate);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Attendance Records</h2>
        <p>Track your children's school attendance</p>
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
          <div className={`${styles.attendanceStatus} ${styles[status]}`}>
            {summary.attendance_rate >= 90 ? "Excellent" : 
             summary.attendance_rate >= 75 ? "Good" : 
             summary.attendance_rate >= 60 ? "Fair" : "Needs Improvement"}
          </div>
        </div>
      )}

      {/* Term Selector */}
      <TermSelector
        selectedTermId={selectedTermId}
        onTermChange={handleTermChange}
      />

      {/* Summary Cards */}
      <AttendanceSummaryCards summary={summary} />

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === "overview" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          Monthly Overview
        </button>
        <button
          className={`${styles.tab} ${activeTab === "subjects" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("subjects")}
        >
          Subject Attendance
        </button>
        <button
          className={`${styles.tab} ${activeTab === "details" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("details")}
        >
          Recent Records
        </button>
      </div>

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {activeTab === "overview" && (
          <MonthlyAttendanceChart monthlyData={monthlyData} summary={summary} />
        )}
        {activeTab === "subjects" && (
          <SubjectAttendanceTable subjectData={subjectData} />
        )}
        {activeTab === "details" && (
          <RecentAttendance childId={selectedChildId} termId={selectedTermId} />
        )}
      </div>
    </div>
  );
}