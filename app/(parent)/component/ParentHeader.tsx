// app/(parent)/component/ParentHeader.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./ParentHeader.module.css";

interface ParentHeaderProps {
  onMenuClick: () => void;
  isMobile: boolean;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const MenuIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" />
    <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" />
  </svg>
);

const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const ExpandSidebarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 18L15 12L9 6" />
  </svg>
);

export default function ParentHeader({ 
  onMenuClick, 
  isMobile,
  isCollapsed,
  onToggleCollapse
}: ParentHeaderProps) {
  const pathname = usePathname();
  
  const getPageTitle = () => {
    if (pathname === "/parent") return "Dashboard";
    if (pathname === "/parent/children") return "My Children";
    if (pathname === "/parent/fees") return "Fee Status";
    if (pathname === "/parent/results") return "Results";
    if (pathname === "/parent/attendance") return "Attendance";
    if (pathname === "/parent/profile") return "Profile";
    return "Parent Portal";
  };

  return (
    <header className={styles.header}>
      <div className={styles.leftSection}>
        <button className={styles.menuBtn} onClick={onMenuClick}>
          <MenuIcon />
        </button>
        {!isMobile && (
          <button className={styles.expandBtn} onClick={onToggleCollapse}>
            <ExpandSidebarIcon />
          </button>
        )}
      </div>
      
      <div className={styles.titleSection}>
        <h1 className={styles.title}>{getPageTitle()}</h1>
        <p className={styles.subtitle}>Welcome back</p>
      </div>
      
      <div className={styles.actions}>
        <button className={styles.iconBtn}>
          <BellIcon />
          <span className={styles.notificationBadge}>3</span>
        </button>
        <Link href="/parent/profile" className={styles.iconBtn}>
          <UserIcon />
        </Link>
      </div>
    </header>
  );
}