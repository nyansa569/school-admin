// app/parent/page.tsx
"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";

export default function ParentDashboard() {
  const [parentName, setParentName] = useState("Parent");

  useEffect(() => {
    const session = sessionStorage.getItem("parentSession");
    if (session) {
      const data = JSON.parse(session);
      setParentName(data.email?.split("@")[0] || "Parent");
    }
  }, []);

  return (
    <div className={styles.dashboard}>
      <div className={styles.welcomeCard}>
        <h2>Welcome, {parentName}!</h2>
        <p>Stay updated with your child's academic progress, fee status, and school activities.</p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📚</div>
          <div className={styles.statInfo}>
            <h3>Academic Progress</h3>
            <p>View results and reports</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>💰</div>
          <div className={styles.statInfo}>
            <h3>Fee Status</h3>
            <p>Check payment history</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📅</div>
          <div className={styles.statInfo}>
            <h3>Attendance</h3>
            <p>View attendance records</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📢</div>
          <div className={styles.statInfo}>
            <h3>Announcements</h3>
            <p>School updates</p>
          </div>
        </div>
      </div>
    </div>
  );
}