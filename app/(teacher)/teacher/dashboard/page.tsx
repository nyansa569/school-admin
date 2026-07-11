// app/(teacher)/teacher/dashboard/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getTeacherDashboardStats } from "@/lib/action/teacher/dashboard";
import styles from "./page.module.css";




type DashboardStats = {
  profile: {
    id: number;
    name: string;
    email: string;
    avatar: string;
    department: string;
  };
  stats: {
    totalClasses: number;
    totalSubjects: number;
    totalStudents: number;
    attendanceRate: number;
    totalAttendanceRecords: number;
    presentCount: number;
    absentCount: number;
    lateCount: number;
  };
  classes: Array<{
    id: number;
    name: string;
    level: string;
    max_students: number;
  }>;
  subjects: Array<{
    id: number;
    title: string;
    subject_code: string;
  }>;
  currentAcademicYear: {
    id: number;
    year: number;
    term: string;
  } | null;
  recentActivities: Array<{
    type: string;
    title: string;
    date: string;
    icon: string;
  }>;
};

export default function TeacherDashboardPage() {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    const result = await getTeacherDashboardStats();
    if (result.error) {
      setError(result.error);
    } else {
      setData(result as DashboardStats);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <div className={styles.errorIcon}>⚠️</div>
        <h2>Error Loading Dashboard</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const modules = [
    { name: "Attendance", path: "/teacher/attendance", icon: "📖", color: "#3b82f6" },
    { name: "Grade", path: "/teacher/grade", icon: "📝", color: "#10b981" },
    { name: "Exam", path: "/teacher/exam", icon: "📋", color: "#f59e0b" },
    { name: "Assessment", path: "/teacher/assessment", icon: "📌", color: "#8b5cf6" },
  ];

  return (
    <div className={styles.container}>
      {/* Welcome Section */}
      <div className={styles.welcomeSection}>
        <div className={styles.welcomeContent}>
          <h1 className={styles.welcomeTitle}>
            Welcome back, {data.profile.name.split(" ")[0]}! 👋
          </h1>
          <p className={styles.welcomeSubtitle}>
            Here's what's happening with your classes today.
          </p>
        </div>
        <div className={styles.profileBadge}>
          <div className={styles.avatar}>
            {data.profile.avatar}
          </div>
          <div className={styles.profileInfo}>
            <span className={styles.profileName}>{data.profile.name}</span>
            <span className={styles.profileDept}>{data.profile.department}</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: "#dbeafe" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
              <path d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{data.stats.totalClasses}</span>
            <span className={styles.statLabel}>Total Classes</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: "#d4f4dd" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z" />
            </svg>
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{data.stats.totalSubjects}</span>
            <span className={styles.statLabel}>Total Subjects</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: "#feebc8" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
              <path d="M12 4.354a4 4 0 1 1 0 5.292M15 21H3v-1a6 6 0 0 1 12 0v1Zm0 0h6v-1a6 6 0 0 0-9-5.197M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0z" />
            </svg>
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{data.stats.totalStudents}</span>
            <span className={styles.statLabel}>Total Students</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: "#e0e7ff" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{data.stats.attendanceRate}%</span>
            <span className={styles.statLabel}>Attendance Rate</span>
          </div>
        </div>
      </div>

      {/* Quick action - Modules */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Quick action</h2>
          <p className={styles.sectionSubtitle}>Manage your classroom activities</p>
        </div>
        <div className={styles.modulesGrid}>
          {modules.map((module) => (
            <Link key={module.name} href={module.path} className={styles.moduleCard}>
              <div className={styles.moduleIcon} style={{ background: `${module.color}15` }}>
                <span style={{ fontSize: "1.75rem" }}>{module.icon}</span>
              </div>
              <div className={styles.moduleContent}>
                <h3 className={styles.moduleName}>{module.name}</h3>
                <p className={styles.moduleDesc}>
                  {module.name === "Attendance" && "Mark student attendance"}
                  {module.name === "Grade" && "Manage student grades"}
                  {module.name === "Exam" && "Create and grade exams"}
                  {module.name === "Assessment" && "Student performance review"}
                </p>
              </div>
              <div className={styles.moduleArrow}>→</div>
            </Link>
          ))}
        </div>
      </div>

      {/* My Classes & Subjects */}
      <div className={styles.twoColumnGrid}>
        {/* My Classes */}
        <div className={styles.infoCard}>
          <div className={styles.infoCardHeader}>
            <h3 className={styles.infoCardTitle}>My Classes</h3>
            <span className={styles.infoCardCount}>{data.classes.length}</span>
          </div>
          <div className={styles.infoCardList}>
            {data.classes.length === 0 ? (
              <p className={styles.emptyMessage}>No classes assigned yet</p>
            ) : (
              data.classes.map((cls) => (
                <div key={cls.id} className={styles.listItem}>
                  <div className={styles.listItemIcon}>🏫</div>
                  <div className={styles.listItemContent}>
                    <span className={styles.listItemTitle}>{cls.name}</span>
                    <span className={styles.listItemSub}>
                      {cls.level} • {cls.max_students || 0} capacity
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* My Subjects */}
        <div className={styles.infoCard}>
          <div className={styles.infoCardHeader}>
            <h3 className={styles.infoCardTitle}>My Subjects</h3>
            <span className={styles.infoCardCount}>{data.subjects.length}</span>
          </div>
          <div className={styles.infoCardList}>
            {data.subjects.length === 0 ? (
              <p className={styles.emptyMessage}>No subjects assigned yet</p>
            ) : (
              data.subjects.map((subject) => (
                <div key={subject.id} className={styles.listItem}>
                  <div className={styles.listItemIcon}>📘</div>
                  <div className={styles.listItemContent}>
                    <span className={styles.listItemTitle}>{subject.title}</span>
                    <span className={styles.listItemSub}>{subject.subject_code}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Academic Year & Recent Activities */}
      <div className={styles.twoColumnGrid}>
        {/* Current Academic Year */}
        <div className={styles.infoCard}>
          <div className={styles.infoCardHeader}>
            <h3 className={styles.infoCardTitle}>Academic Year</h3>
          </div>
          <div className={styles.academicYearContent}>
            <div className={styles.academicYearIcon}>📅</div>
            <div className={styles.academicYearInfo}>
              <span className={styles.academicYearValue}>
                {data.currentAcademicYear?.year || "Not set"}
              </span>
              <span className={styles.academicYearTerm}>
                {data.currentAcademicYear?.term || "No active term"}
              </span>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className={styles.infoCard}>
          <div className={styles.infoCardHeader}>
            <h3 className={styles.infoCardTitle}>Recent Activities</h3>
          </div>
          <div className={styles.infoCardList}>
            {data.recentActivities.length === 0 ? (
              <p className={styles.emptyMessage}>No recent activities</p>
            ) : (
              data.recentActivities.map((activity, index) => (
                <div key={index} className={styles.activityItem}>
                  <div className={styles.activityIcon}>{activity.icon}</div>
                  <div className={styles.activityContent}>
                    <div className={styles.activityTitle}>{activity.title}</div>
                    <div className={styles.activityMeta}>
                      <span className={styles.activityType}>{activity.type}</span>
                      <span className={styles.activityDate}>
                        {new Date(activity.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}