// app/parent/profile/components/ChildrenList.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./ChildrenList.module.css";
import { ChildSummary } from "@/app/(parent)/types";

interface ChildrenListProps {
  children: ChildSummary[];
}

export default function ChildrenList({ children }: ChildrenListProps) {
  const [expandedChild, setExpandedChild] = useState<number | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return styles.statusActive;
      case "inactive":
        return styles.statusInactive;
      case "graduated":
        return styles.statusGraduated;
      default:
        return styles.statusActive;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Active";
      case "inactive":
        return "Inactive";
      case "graduated":
        return "Graduated";
      default:
        return status;
    }
  };

  const toggleExpand = (childId: number) => {
    setExpandedChild(expandedChild === childId ? null : childId);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>My Children</h3>
        <p>{children.length} children registered</p>
      </div>

      <div className={styles.childrenList}>
        {children.map((child) => (
          <div key={child.id} className={styles.childCard}>
            <div className={styles.childHeader} onClick={() => toggleExpand(child.id)}>
              <div className={styles.childAvatar}>
                {child.first_name[0]}{child.last_name[0]}
              </div>
              <div className={styles.childInfo}>
                <div className={styles.childName}>
                  {child.first_name} {child.last_name}
                </div>
                <div className={styles.childClass}>{child.class.name}</div>
              </div>
              <div className={styles.childStatus}>
                <span className={`${styles.statusBadge} ${getStatusColor(child.status)}`}>
                  {getStatusText(child.status)}
                </span>
              </div>
              <button className={styles.expandBtn}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d={expandedChild === child.id ? "M18 15l-6-6-6 6" : "M6 9l6 6 6-6"} />
                </svg>
              </button>
            </div>

            {expandedChild === child.id && (
              <div className={styles.childDetails}>
                <div className={styles.detailsGrid}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Student Number</span>
                    <span className={styles.detailValue}>{child.student_number}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Admission Number</span>
                    <span className={styles.detailValue}>{child.admission_number}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Class Level</span>
                    <span className={styles.detailValue}>
                      {child.class.level === "preschool" ? "Preschool" :
                       child.class.level === "primary" ? "Primary" : "Junior High"}
                    </span>
                  </div>
                </div>

                <div className={styles.quickActions}>
                  <Link href={`/parent/fees?student=${child.id}`} className={styles.actionLink}>
                    <span>💰</span> Fee Status
                  </Link>
                  <Link href={`/parent/results?student=${child.id}`} className={styles.actionLink}>
                    <span>📊</span> Results
                  </Link>
                  <Link href={`/parent/attendance?student=${child.id}`} className={styles.actionLink}>
                    <span>📅</span> Attendance
                  </Link>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}