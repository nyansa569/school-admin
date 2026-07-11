// app/parent/profile/page.tsx
"use client";

import { useState } from "react";
import styles from "./page.module.css";
import ProfileHeader from "./components/ProfileHeader";
import PersonalInfoForm from "./components/PersonalInfoForm";
import ChildrenList from "./components/ChildrenList";
import NotificationSettings from "./components/NotificationSettings";
import ChangePassword from "./components/ChangePassword"; 
import { dummyParentProfile, dummyChildrenSummary, dummyNotificationPreferences } from "../../data";
import { ParentProfile, ChildSummary, NotificationPreference, ChangePasswordData } from "../../types";

type TabType = "personal" | "children" | "notifications" | "security";

export default function ProfilePage() {
  const [profile, setProfile] = useState<ParentProfile>(dummyParentProfile);
  const [children] = useState<ChildSummary[]>(dummyChildrenSummary);
  const [notifications, setNotifications] = useState<NotificationPreference>(dummyNotificationPreferences);
  const [activeTab, setActiveTab] = useState<TabType>("personal");
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleProfileUpdate = (updatedProfile: Partial<ParentProfile>) => {
    setProfile({ ...profile, ...updatedProfile });
    setIsEditing(false);
    setSaveSuccess("Profile updated successfully!");
    setTimeout(() => setSaveSuccess(null), 3000);
  };

  const handleNotificationUpdate = (updatedNotifications: NotificationPreference) => {
    setNotifications(updatedNotifications);
    setSaveSuccess("Notification preferences saved!");
    setTimeout(() => setSaveSuccess(null), 3000);
  };

  const handlePasswordChange = (data: ChangePasswordData) => {
    // In a real app, this would call an API
    console.log("Password changed:", data);
    setSaveSuccess("Password changed successfully!");
    setTimeout(() => setSaveSuccess(null), 3000);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>My Profile</h2>
        <p>Manage your account information and preferences</p>
      </div>

      {/* Success/Error Messages */}
      {saveSuccess && (
        <div className={styles.successMessage}>
          <span className={styles.successIcon}>✅</span>
          {saveSuccess}
        </div>
      )}
      {saveError && (
        <div className={styles.errorMessage}>
          <span className={styles.errorIcon}>❌</span>
          {saveError}
        </div>
      )}

      {/* Profile Header */}
      <ProfileHeader profile={profile} />

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === "personal" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("personal")}
        >
          <span className={styles.tabIcon}>👤</span>
          Personal Info
        </button>
        <button
          className={`${styles.tab} ${activeTab === "children" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("children")}
        >
          <span className={styles.tabIcon}>👨‍👩‍👧</span>
          My Children
          <span className={styles.tabBadge}>{children.length}</span>
        </button>
        <button
          className={`${styles.tab} ${activeTab === "notifications" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("notifications")}
        >
          <span className={styles.tabIcon}>🔔</span>
          Notifications
        </button>
        <button
          className={`${styles.tab} ${activeTab === "security" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("security")}
        >
          <span className={styles.tabIcon}>🔒</span>
          Security
        </button>
      </div>

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {activeTab === "personal" && (
          <PersonalInfoForm
            profile={profile}
            isEditing={isEditing}
            onEdit={() => setIsEditing(true)}
            onCancel={() => setIsEditing(false)}
            onSave={handleProfileUpdate}
          />
        )}
        {activeTab === "children" && (
          <ChildrenList children={children} />
        )}
        {activeTab === "notifications" && (
          <NotificationSettings
            preferences={notifications}
            onSave={handleNotificationUpdate}
          />
        )}
        {activeTab === "security" && (
          <ChangePassword onChangePassword={handlePasswordChange} />
        )}
      </div>
    </div>
  );
}