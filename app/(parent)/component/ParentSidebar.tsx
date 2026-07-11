// app/(parent)/component/ParentSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./ParentSidebar.module.css";

// Icons
const DashboardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

const ChildIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 6C13.6569 6 15 7.34315 15 9C15 10.6569 13.6569 12 12 12C10.3431 12 9 10.6569 9 9C9 7.34315 10.3431 6 12 6Z" />
    <path d="M20 21C20 17.134 16.4183 14 12 14C7.58172 14 4 17.134 4 21" />
  </svg>
);

const FeesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const ResultsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 12h6M9 16h4M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5z" />
    <path d="M9 8h6" />
  </svg>
);

const AttendanceIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const ProfileIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const LogoutIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const CollapseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M15 18L9 12L15 6" />
  </svg>
);

const ExpandIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 18L15 12L9 6" />
  </svg>
);

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const menuItems = [
  { name: "Dashboard", path: "/parent", icon: <DashboardIcon /> },
  { name: "My Children", path: "/parent/children", icon: <ChildIcon /> },
  { name: "Fee Status", path: "/parent/fees", icon: <FeesIcon /> },
  { name: "Results", path: "/parent/results", icon: <ResultsIcon /> },
  { name: "Attendance", path: "/parent/attendance", icon: <AttendanceIcon /> },
  { name: "Profile", path: "/parent/profile", icon: <ProfileIcon /> },
];

interface ParentSidebarProps {
  onClose: () => void;
  isMobile: boolean;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export default function ParentSidebar({ 
  onClose, 
  isMobile, 
  isCollapsed, 
  onToggleCollapse 
}: ParentSidebarProps) {
  const pathname = usePathname();

  const handleLinkClick = () => {
    if (isMobile) {
      onClose();
    }
  };

  return (
    <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ""}`}>
      {/* Brand */}
      <div className={styles.brand}>
        <div className={styles.logoIcon}>KW</div>
        {!isCollapsed && (
          <div className={styles.brandText}>
            <div className={styles.brandTitle}>Parent Portal</div>
            <div className={styles.brandSubtitle}>Kiddiewise School</div>
          </div>
        )}
        {isMobile && (
          <button className={styles.closeBtn} onClick={onClose}>
            <CloseIcon />
          </button>
        )}
      </div>

      {/* Collapse Toggle Button - Desktop only */}
      {!isMobile && (
        <button className={styles.collapseBtn} onClick={onToggleCollapse}>
          {isCollapsed ? <ExpandIcon /> : <CollapseIcon />}
        </button>
      )}

      {/* Navigation */}
      {!isCollapsed && <div className={styles.sectionLabel}>Menu</div>}
      <nav className={styles.nav}>
        {menuItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`${styles.navLink} ${pathname === item.path ? styles.active : ""}`}
            onClick={handleLinkClick}
            title={isCollapsed ? item.name : ""}
          >
            <span className={styles.navIcon}>{item.icon}</span>
            {!isCollapsed && <span className={styles.navName}>{item.name}</span>}
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className={styles.logoutSection}>
        <Link 
          href="/auth/logout" 
          className={styles.logoutLink}
          title={isCollapsed ? "Sign Out" : ""}
        >
          <LogoutIcon />
          {!isCollapsed && <span>Sign Out</span>}
        </Link>
      </div>
    </aside>
  );
}