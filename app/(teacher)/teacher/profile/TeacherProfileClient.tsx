// app/(teacher)/teacher/profile/TeacherProfileClient.tsx
"use client";

import { useState } from "react";
import { updateTeacherPassword, updateTeacherContact } from "@/lib/action/teacher/profile";
import styles from "./profile.module.css";

type TeacherProfileClientProps = {
  profile: any;
};

export default function TeacherProfileClient({ profile }: TeacherProfileClientProps) {
  const [activeTab, setActiveTab] = useState<"info" | "password">("info");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Contact form state
  const [contactForm, setContactForm] = useState({
    phone: profile.phone || "",
    address: profile.contact?.address || "",
    city: profile.contact?.city || "",
    town: profile.contact?.town || "",
  });

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const result = await updateTeacherPassword(
      passwordForm.currentPassword,
      passwordForm.newPassword,
      passwordForm.confirmPassword
    );

    if (result.error) {
      setMessage({ type: "error", text: result.error });
    } else {
      setMessage({ type: "success", text: "Password updated successfully!" });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    }

    setLoading(false);
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("phone", contactForm.phone);
    formData.append("address", contactForm.address);
    formData.append("city", contactForm.city);
    formData.append("town", contactForm.town);

    const result = await updateTeacherContact(formData);

    if (result.error) {
      setMessage({ type: "error", text: result.error });
    } else {
      setMessage({ type: "success", text: "Contact information updated successfully!" });
    }

    setLoading(false);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setContactForm({ ...contactForm, [e.target.name]: e.target.value });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>My Profile</h1>
        <p>Manage your personal information and password</p>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === "info" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("info")}
        >
          Personal Information
        </button>
        <button
          className={`${styles.tab} ${activeTab === "password" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("password")}
        >
          Change Password
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`${styles.message} ${styles[message.type]}`}>
          {message.text}
        </div>
      )}

      {/* Personal Information Tab */}
      {activeTab === "info" && (
        <div className={styles.content}>
          {/* Profile Picture */}
          <div className={styles.profilePictureSection}>
            {profile.profile_picture ? (
              <img src={profile.profile_picture} alt="Profile" className={styles.profilePicture} />
            ) : (
              <div className={styles.profilePicturePlaceholder}>
                {profile.first_name?.[0]}{profile.last_name?.[0]}
              </div>
            )}
            <div className={styles.profileInfo}>
              <h2>{profile.first_name} {profile.last_name}</h2>
              <p className={styles.role}>{profile.role}</p>
              <p className={styles.email}>{profile.email}</p>
            </div>
          </div>

          {/* Basic Information */}
          <div className={styles.infoSection}>
            <h3>Basic Information</h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <label>First Name</label>
                <p>{profile.first_name}</p>
              </div>
              <div className={styles.infoItem}>
                <label>Last Name</label>
                <p>{profile.last_name}</p>
              </div>
              <div className={styles.infoItem}>
                <label>Qualification</label>
                <p>{profile.qualification || "Not specified"}</p>
              </div>
              <div className={styles.infoItem}>
                <label>Specialization</label>
                <p>{profile.specialization || "Not specified"}</p>
              </div>
              <div className={styles.infoItem}>
                <label>Employment Status</label>
                <p className={styles.statusBadge}>{profile.employment_status}</p>
              </div>
              <div className={styles.infoItem}>
                <label>Hire Date</label>
                <p>{profile.hire_date ? new Date(profile.hire_date).toLocaleDateString() : "Not specified"}</p>
              </div>
            </div>
          </div>

          {/* Department */}
          {profile.department && (
            <div className={styles.infoSection}>
              <h3>Department</h3>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <label>Department Name</label>
                  <p>{profile.department.name}</p>
                </div>
                <div className={styles.infoItem}>
                  <label>Department ID</label>
                  <p>{profile.department.dep_id || "Not specified"}</p>
                </div>
              </div>
            </div>
          )}

          {/* Contact Information - Editable */}
          <div className={styles.infoSection}>
            <h3>Contact Information</h3>
            <form onSubmit={handleContactSubmit} className={styles.contactForm}>
              <div className={styles.formGroup}>
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={contactForm.phone}
                  onChange={handleContactChange}
                  placeholder="Enter phone number"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Address</label>
                <textarea
                  name="address"
                  value={contactForm.address}
                  onChange={handleContactChange}
                  placeholder="Enter address"
                  rows={2}
                />
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>City</label>
                  <input
                    type="text"
                    name="city"
                    value={contactForm.city}
                    onChange={handleContactChange}
                    placeholder="City"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Town</label>
                  <input
                    type="text"
                    name="town"
                    value={contactForm.town}
                    onChange={handleContactChange}
                    placeholder="Town"
                  />
                </div>
              </div>
              <button type="submit" className={styles.saveButton} disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>

          {/* Assigned Classes */}
          {profile.assigned_classes && profile.assigned_classes.length > 0 && (
            <div className={styles.infoSection}>
              <h3>Assigned Classes</h3>
              <div className={styles.badgeList}>
                {profile.assigned_classes.map((cls: any) => (
                  <span key={cls.id} className={styles.badge}>
                    {cls.name} ({cls.level})
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Assigned Subjects */}
          {profile.assigned_subjects && profile.assigned_subjects.length > 0 && (
            <div className={styles.infoSection}>
              <h3>Assigned Subjects</h3>
              <div className={styles.badgeList}>
                {profile.assigned_subjects.map((subject: any) => (
                  <span key={subject.id} className={styles.badge}>
                    {subject.title} ({subject.subject_code})
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Change Password Tab */}
      {activeTab === "password" && (
        <div className={styles.content}>
          <div className={styles.infoSection}>
            <h3>Change Password</h3>
            <form onSubmit={handlePasswordSubmit} className={styles.passwordForm}>
              <div className={styles.formGroup}>
                <label>Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  required
                  placeholder="Enter current password"
                />
              </div>
              <div className={styles.formGroup}>
                <label>New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  required
                  placeholder="Enter new password (min 6 characters)"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                  placeholder="Confirm new password"
                />
              </div>
              <button type="submit" className={styles.saveButton} disabled={loading}>
                {loading ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}