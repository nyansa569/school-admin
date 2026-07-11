// components/LogoutButton/LogoutButton.tsx
"use client";

import { useRouter } from "next/navigation";
import { logout } from "@/lib/action/auth";
import { useState } from "react";
import styles from "./LogoutButton.module.css";

interface LogoutButtonProps {
  className?: string;
  variant?: "primary" | "secondary" | "danger" | "text";
  showIcon?: boolean;
  children?: React.ReactNode;
}

export default function LogoutButton({ 
  className = "", 
  variant = "danger",
  showIcon = true,
  children 
}: LogoutButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      const result = await logout();
      if (result.error) {
        console.error("Logout error:", result.error);
      } else {
        // Clear any client-side storage
        localStorage.clear();
        sessionStorage.clear();
        
        // Redirect to login page
        router.push("/auth/login");
        router.refresh();
      }
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className={`${styles.logoutButton} ${styles[variant]} ${className}`}
    >
      {showIcon && (
        <svg className={styles.icon} viewBox="0 0 24 24" width="18" height="18">
          <path
            fill="currentColor"
            d="M17,7L15.59,8.41L18.17,11H8V13H18.17L15.59,15.58L17,17L22,12M4,5H12V3H4C2.9,3,2,3.9,2,5V19C2,20.1,2.9,21,4,21H12V19H4V5Z"
          />
        </svg>
      )}
      {loading ? "Logging out..." : (children || "Logout")}
    </button>
  );
}