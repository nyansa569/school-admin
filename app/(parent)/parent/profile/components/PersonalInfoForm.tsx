// app/parent/profile/components/PersonalInfoForm.tsx
"use client";

import { useState } from "react";
import styles from "./PersonalInfoForm.module.css";
import { ParentProfile } from "@/app/(parent)/types";

interface PersonalInfoFormProps {
  profile: ParentProfile;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: (updatedProfile: Partial<ParentProfile>) => void;
}

export default function PersonalInfoForm({
  profile,
  isEditing,
  onEdit,
  onCancel,
  onSave,
}: PersonalInfoFormProps) {
  const [formData, setFormData] = useState({
    first_name: profile.first_name,
    last_name: profile.last_name,
    email: profile.email,
    phone: profile.phone,
    address: profile.address || "",
    city: profile.city || "",
    town: profile.town || "",
    occupation: profile.occupation || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isEditing) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h3>Personal Information</h3>
          <button className={styles.editBtn} onClick={onEdit}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />
            </svg>
            Edit
          </button>
        </div>

        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>First Name</span>
            <span className={styles.infoValue}>{profile.first_name}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Last Name</span>
            <span className={styles.infoValue}>{profile.last_name}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Email</span>
            <span className={styles.infoValue}>{profile.email}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Phone</span>
            <span className={styles.infoValue}>{profile.phone}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Address</span>
            <span className={styles.infoValue}>{profile.address || "Not specified"}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>City</span>
            <span className={styles.infoValue}>{profile.city || "Not specified"}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Town</span>
            <span className={styles.infoValue}>{profile.town || "Not specified"}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Occupation</span>
            <span className={styles.infoValue}>{profile.occupation || "Not specified"}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form className={styles.container} onSubmit={handleSubmit}>
      <div className={styles.header}>
        <h3>Edit Personal Information</h3>
        <div className={styles.headerActions}>
          <button type="button" className={styles.cancelBtn} onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className={styles.saveBtn}>
            Save Changes
          </button>
        </div>
      </div>

      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label>First Name *</label>
          <input
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>Last Name *</label>
          <input
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>Email *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>Phone *</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>Address</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
          />
        </div>
        <div className={styles.formGroup}>
          <label>City</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
          />
        </div>
        <div className={styles.formGroup}>
          <label>Town</label>
          <input
            type="text"
            name="town"
            value={formData.town}
            onChange={handleChange}
          />
        </div>
        <div className={styles.formGroup}>
          <label>Occupation</label>
          <input
            type="text"
            name="occupation"
            value={formData.occupation}
            onChange={handleChange}
          />
        </div>
      </div>
    </form>
  );
}