// app/parent/children/component/ChildCard.tsx
"use client";

import Image from "next/image";
import styles from "./ChildCard.module.css";
import { Child } from "@/app/(parent)/types";

interface ChildCardProps {
  child: Child;
  onView: (child: Child) => void;
}
export default function ChildCard({ child, onView }: ChildCardProps) {
  const getInitials = () => {
    return `${child.first_name[0]}${child.last_name[0]}`;
  };

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

  return (
    <div className={styles.card}>
      <div className={styles.avatarSection}>
        <div className={styles.avatar}>
          {getInitials()}
        </div>
        <span className={`${styles.statusBadge} ${getStatusColor(child.status)}`}>
          {getStatusText(child.status)}
        </span>
      </div>

      <div className={styles.infoSection}>
        <h3 className={styles.name}>
          {child.first_name} {child.last_name}
        </h3>
        <p className={styles.studentId}>ID: {child.student_number}</p>
        <p className={styles.admissionNo}>Admission: {child.admission_number}</p>
        
        <div className={styles.details}>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Class:</span>
            <span className={styles.detailValue}>
              {child.class?.name || "Not assigned"}
            </span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Gender:</span>
            <span className={styles.detailValue}>
              {child.gender === "male" ? "Male" : "Female"}
            </span>
          </div>
        </div>

        <button className={styles.viewBtn} onClick={() => onView(child)}>
          View Details
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>
    </div>
  );
}