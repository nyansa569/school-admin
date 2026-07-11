"use client";

import { useEffect, useState } from "react";
import styles from "./layout.module.css";

export default function TeacherClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const handleSidebarToggle = () => {
      const collapsed = localStorage.getItem("teacherSidebarCollapsed") === "true";
      setIsCollapsed(collapsed);
    };

    handleSidebarToggle();
    window.addEventListener("teacherSidebarToggle", handleSidebarToggle);
    
    return () => {
      window.removeEventListener("teacherSidebarToggle", handleSidebarToggle);
    };
  }, []);

  return (
    <main className={`${styles.main} ${isCollapsed ? styles.collapsed : ""}`}>
      {children}
    </main>
  );
}