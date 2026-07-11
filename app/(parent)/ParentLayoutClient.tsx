// app/(parent)/ParentLayoutClient.tsx
"use client";

import { useState, useEffect } from "react";
import styles from "./layout.module.css";
import ParentHeader from "./component/ParentHeader";
import ParentSidebar from "./component/ParentSidebar";

export default function ParentLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check screen size for mobile
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // On desktop, sidebar starts expanded
      // On mobile, sidebar starts collapsed/hidden
      if (!mobile) {
        setIsCollapsed(false);
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };
    
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Load collapsed state from localStorage for desktop
  useEffect(() => {
    if (!isMobile) {
      const savedState = localStorage.getItem("parentSidebarCollapsed");
      if (savedState !== null) {
        setIsCollapsed(savedState === "true");
      }
    }
  }, [isMobile]);

  const handleMenuClick = () => {
    if (isMobile) {
      setIsSidebarOpen(true);
    }
  };

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
  };

  const handleToggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("parentSidebarCollapsed", String(newState));
  };

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <div 
        className={`${styles.sidebarWrapper} 
          ${isMobile ? styles.mobileWrapper : styles.desktopWrapper}
          ${isCollapsed && !isMobile ? styles.collapsed : ""}
          ${isSidebarOpen && isMobile ? styles.mobileOpen : ""}`}
      >
        <ParentSidebar 
          onClose={handleSidebarClose} 
          isMobile={isMobile}
          isCollapsed={isCollapsed && !isMobile}
          onToggleCollapse={handleToggleCollapse}
        />
      </div>
      
      {/* Overlay for mobile */}
      {isSidebarOpen && isMobile && (
        <div className={styles.overlay} onClick={handleSidebarClose} />
      )}
      
      {/* Main Content */}
      <div 
        className={`${styles.mainContent} 
          ${isCollapsed && !isMobile ? styles.mainContentCollapsed : ""}`}
      >
        <ParentHeader 
          onMenuClick={handleMenuClick} 
          isMobile={isMobile}
          isCollapsed={isCollapsed && !isMobile}
          onToggleCollapse={handleToggleCollapse}
        />
        <main className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
}