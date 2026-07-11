// app/parent/children/component/ChildDetailsModal.tsx
"use client";

import { useEffect } from "react";
import styles from "./ChildDetailsModal.module.css";
import { Child } from "@/app/(parent)/types";

interface ChildDetailsModalProps {
  child: Child;
  isOpen: boolean;
  onClose: () => void;
}

export default function ChildDetailsModal({ child, isOpen, onClose }: ChildDetailsModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const getFullName = () => {
    let name = `${child.first_name} ${child.last_name}`;
    if (child.other_names) {
      name += ` (${child.other_names})`;
    }
    return name;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Not provided";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active": return "Active";
      case "inactive": return "Inactive";
      case "graduated": return "Graduated";
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return styles.statusActive;
      case "inactive": return styles.statusInactive;
      case "graduated": return styles.statusGraduated;
      default: return styles.statusActive;
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Child Details</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className={styles.modalBody}>
          {/* Profile Section */}
          <div className={styles.profileSection}>
            <div className={styles.avatarLarge}>
              {child.first_name[0]}{child.last_name[0]}
            </div>
            <div className={styles.profileInfo}>
              <h3>{getFullName()}</h3>
              <p>Student ID: {child.student_number}</p>
              <p>Admission No: {child.admission_number}</p>
              <span className={`${styles.statusBadge} ${getStatusColor(child.status)}`}>
                {getStatusText(child.status)}
              </span>
            </div>
          </div>

          {/* Personal Information */}
          <div className={styles.infoCard}>
            <h4>Personal Information</h4>
            <div className={styles.infoGrid}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Full Name:</span>
                <span className={styles.infoValue}>{getFullName()}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Gender:</span>
                <span className={styles.infoValue}>
                  {child.gender === "male" ? "Male" : "Female"}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Date of Birth:</span>
                <span className={styles.infoValue}>{formatDate(child.date_of_birth)}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Current Class:</span>
                <span className={styles.infoValue}>
                  {child.class?.name || "Not assigned"}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Class Level:</span>
                <span className={styles.infoValue}>
                  {child.class?.level === "junior" ? "Junior High" : 
                   child.class?.level === "senior" ? "Senior High" : 
                   child.class?.level || "Not specified"}
                </span>
              </div>
            </div>
          </div>

          {/* Guardian Information */}
          {child.guardian && (
            <div className={styles.infoCard}>
              <h4>Guardian Information</h4>
              <div className={styles.infoGrid}>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Name:</span>
                  <span className={styles.infoValue}>
                    {child.guardian.first_name} {child.guardian.last_name}
                  </span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Relationship:</span>
                  <span className={styles.infoValue}>{child.guardian.relationship}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Phone:</span>
                  <span className={styles.infoValue}>{child.guardian.phone || "Not provided"}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Email:</span>
                  <span className={styles.infoValue}>{child.guardian.email || "Not provided"}</span>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className={styles.quickActions}>
            <h4>Quick Links</h4>
            <div className={styles.actionButtons}>
              <a href={`/parent/fees?student=${child.id}`} className={styles.actionBtn}>
                <span>💰</span>
                Fee Status
              </a>
              <a href={`/parent/results?student=${child.id}`} className={styles.actionBtn}>
                <span>📊</span>
                Results
              </a>
              <a href={`/parent/attendance?student=${child.id}`} className={styles.actionBtn}>
                <span>📅</span>
                Attendance
              </a>
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.closeModalBtn} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}