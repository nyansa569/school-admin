// app/parent/profile/components/ProfileHeader.tsx
"use client";

import { useState } from "react";
import styles from "./ProfileHeader.module.css";
import { ParentProfile } from "@/app/(parent)/types";
interface ProfileHeaderProps {
  profile: ParentProfile;
}

export default function ProfileHeader({ profile }: ProfileHeaderProps) {
  const [isUploading, setIsUploading] = useState(false);

  const getInitials = () => {
    return `${profile.first_name[0]}${profile.last_name[0]}`;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      // Simulate upload
      setTimeout(() => {
        setIsUploading(false);
      }, 1000);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className={styles.headerCard}>
      <div className={styles.avatarSection}>
        <div className={styles.avatarWrapper}>
          {profile.profile_picture ? (
            <img src={profile.profile_picture} alt="Profile" className={styles.avatarImage} />
          ) : (
            <div className={styles.avatarPlaceholder}>
              {getInitials()}
            </div>
          )}
          <label className={styles.uploadBtn}>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: "none" }}
            />
            <span className={styles.uploadIcon}>📷</span>
          </label>
          {isUploading && (
            <div className={styles.uploadingOverlay}>
              <div className={styles.spinner}></div>
            </div>
          )}
        </div>
        <div className={styles.nameSection}>
          <h2>{profile.first_name} {profile.last_name}</h2>
          <p className={styles.memberSince}>Member since {formatDate(profile.created_at)}</p>
        </div>
      </div>

      <div className={styles.contactInfo}>
        <div className={styles.contactItem}>
          <span className={styles.contactIcon}>📧</span>
          <div>
            <span className={styles.contactLabel}>Email</span>
            <span className={styles.contactValue}>{profile.email}</span>
          </div>
        </div>
        <div className={styles.contactItem}>
          <span className={styles.contactIcon}>📞</span>
          <div>
            <span className={styles.contactLabel}>Phone</span>
            <span className={styles.contactValue}>{profile.phone}</span>
          </div>
        </div>
        <div className={styles.contactItem}>
          <span className={styles.contactIcon}>📍</span>
          <div>
            <span className={styles.contactLabel}>Address</span>
            <span className={styles.contactValue}>
              {profile.address}, {profile.city}, {profile.town}
            </span>
          </div>
        </div>
        <div className={styles.contactItem}>
          <span className={styles.contactIcon}>💼</span>
          <div>
            <span className={styles.contactLabel}>Occupation</span>
            <span className={styles.contactValue}>{profile.occupation || "Not specified"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}