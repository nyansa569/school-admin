"use client";

import { useEffect, useState } from "react";
import styles from "./layout.module.css";

export default function DashboardClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const handleSidebarToggle = () => {
      const collapsed = localStorage.getItem("sidebarCollapsed") === "true";
      setIsCollapsed(collapsed);
    };

    // Initial load
    handleSidebarToggle();

    // Listen for sidebar toggle events
    window.addEventListener("sidebarToggle", handleSidebarToggle);
    
    return () => {
      window.removeEventListener("sidebarToggle", handleSidebarToggle);
    };
  }, []);

  return (
    <main className={`${styles.main} ${isCollapsed ? styles.collapsed : ""}`}>
      <div>{children}</div>
    </main>
  );
}