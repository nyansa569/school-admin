// app/parent/profile/components/NotificationSettings.tsx
"use client";

import { useState } from "react";
import styles from "./NotificationSettings.module.css";
import { NotificationPreference } from "@/app/(parent)/types";

interface NotificationSettingsProps {
  preferences: NotificationPreference;
  onSave: (preferences: NotificationPreference) => void;
}

export default function NotificationSettings({ preferences, onSave }: NotificationSettingsProps) {
  const [settings, setSettings] = useState<NotificationPreference>(preferences);
  const [hasChanges, setHasChanges] = useState(false);

  const handleToggle = (key: keyof NotificationPreference) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    setHasChanges(true);
  };

  const handleSave = () => {
    onSave(settings);
    setHasChanges(false);
  };

  const handleReset = () => {
    setSettings(preferences);
    setHasChanges(false);
  };

  const notificationOptions = [
    { key: "email_notifications", label: "Email Notifications", description: "Receive updates via email", icon: "📧" },
    { key: "sms_notifications", label: "SMS Notifications", description: "Receive updates via text message", icon: "📱" },
    { key: "fee_reminders", label: "Fee Reminders", description: "Get notified about fee deadlines", icon: "💰" },
    { key: "result_alerts", label: "Result Alerts", description: "Get notified when results are published", icon: "📊" },
    { key: "attendance_alerts", label: "Attendance Alerts", description: "Get notified about attendance", icon: "📅" },
    { key: "announcement_alerts", label: "Announcement Alerts", description: "Receive school announcements", icon: "📢" },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>Notification Preferences</h3>
        <p>Choose how you want to receive updates</p>
      </div>

      <div className={styles.settingsList}>
        {notificationOptions.map((option) => (
          <div key={option.key} className={styles.settingItem}>
            <div className={styles.settingInfo}>
              <span className={styles.settingIcon}>{option.icon}</span>
              <div>
                <div className={styles.settingLabel}>{option.label}</div>
                <div className={styles.settingDescription}>{option.description}</div>
              </div>
            </div>
            <label className={styles.toggleSwitch}>
              <input
                type="checkbox"
                checked={settings[option.key as keyof NotificationPreference]}
                onChange={() => handleToggle(option.key as keyof NotificationPreference)}
              />
              <span className={styles.toggleSlider}></span>
            </label>
          </div>
        ))}
      </div>

      {hasChanges && (
        <div className={styles.actions}>
          <button className={styles.resetBtn} onClick={handleReset}>
            Reset
          </button>
          <button className={styles.saveBtn} onClick={handleSave}>
            Save Preferences
          </button>
        </div>
      )}
    </div>
  );
}