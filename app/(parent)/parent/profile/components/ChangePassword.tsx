// app/parent/profile/components/ChangePassword.tsx
"use client";

import { useState } from "react";
import styles from "./ChangePassword.module.css";
import { ChangePasswordData } from "@/app/(parent)/types";

interface ChangePasswordProps {
  onChangePassword: (data: ChangePasswordData) => void;
}

export default function ChangePassword({ onChangePassword }: ChangePasswordProps) {
  const [formData, setFormData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [errors, setErrors] = useState<Partial<ChangePasswordData>>({});
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof ChangePasswordData]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ChangePasswordData> = {};

    if (!formData.current_password) {
      newErrors.current_password = "Current password is required";
    }
    if (!formData.new_password) {
      newErrors.new_password = "New password is required";
    } else if (formData.new_password.length < 6) {
      newErrors.new_password = "Password must be at least 6 characters";
    }
    if (!formData.confirm_password) {
      newErrors.confirm_password = "Please confirm your password";
    } else if (formData.new_password !== formData.confirm_password) {
      newErrors.confirm_password = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onChangePassword(formData);
      setFormData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
    }
  };

  const passwordStrength = () => {
    const password = formData.new_password;
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const getStrengthText = () => {
    const strength = passwordStrength();
    if (strength === 0) return "";
    if (strength <= 1) return "Weak";
    if (strength <= 2) return "Fair";
    if (strength <= 3) return "Good";
    return "Strong";
  };

  const getStrengthColor = () => {
    const strength = passwordStrength();
    if (strength <= 1) return styles.strengthWeak;
    if (strength <= 2) return styles.strengthFair;
    if (strength <= 3) return styles.strengthGood;
    return styles.strengthStrong;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>Change Password</h3>
        <p>Update your password to keep your account secure</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label>Current Password</label>
          <div className={styles.passwordInputWrapper}>
            <input
              type={showCurrentPassword ? "text" : "password"}
              name="current_password"
              value={formData.current_password}
              onChange={handleChange}
              placeholder="Enter current password"
            />
            <button
              type="button"
              className={styles.passwordToggle}
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            >
              {showCurrentPassword ? "🙈" : "👁️"}
            </button>
          </div>
          {errors.current_password && (
            <span className={styles.errorText}>{errors.current_password}</span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label>New Password</label>
          <div className={styles.passwordInputWrapper}>
            <input
              type={showNewPassword ? "text" : "password"}
              name="new_password"
              value={formData.new_password}
              onChange={handleChange}
              placeholder="Enter new password"
            />
            <button
              type="button"
              className={styles.passwordToggle}
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword ? "🙈" : "👁️"}
            </button>
          </div>
          {formData.new_password && (
            <div className={styles.passwordStrength}>
              <div className={styles.strengthBar}>
                <div className={`${styles.strengthFill} ${getStrengthColor()}`} style={{ width: `${(passwordStrength() / 4) * 100}%` }} />
              </div>
              <span className={getStrengthColor()}>{getStrengthText()}</span>
            </div>
          )}
          {errors.new_password && (
            <span className={styles.errorText}>{errors.new_password}</span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label>Confirm New Password</label>
          <div className={styles.passwordInputWrapper}>
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleChange}
              placeholder="Confirm new password"
            />
            <button
              type="button"
              className={styles.passwordToggle}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? "🙈" : "👁️"}
            </button>
          </div>
          {errors.confirm_password && (
            <span className={styles.errorText}>{errors.confirm_password}</span>
          )}
        </div>

        <div className={styles.passwordHint}>
          <span className={styles.hintIcon}>ℹ️</span>
          <span>Password must be at least 6 characters and include uppercase, number, or special character for strength.</span>
        </div>

        <button type="submit" className={styles.submitBtn}>
          Update Password
        </button>
      </form>
    </div>
  );
}