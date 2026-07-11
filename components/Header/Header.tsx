// components/Header/Header.tsx
"use client";

import React, { ReactNode, useState, useRef, useEffect } from "react";
import styles from "./Header.module.css";
import { getAdminProfile } from "@/lib/action/admin/profile";

interface HeaderProps {
  title: string;
  subtitle?: string;
  showExport?: boolean;
  showSearch?: boolean;
  showNotifications?: boolean;
  showProfile?: boolean;
  customActions?: ReactNode;
  // Export handlers passed from parent page
  onExport?: (format: "pdf" | "csv", target?: string) => void;
  exportOptions?: Array<{ value: string; label: string }>;
}

/* SVG Icons */
const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const NotificationIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const PDFIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 20H20M6 4H12M6 8H14M6 12H18M6 16H10M14 4L20 10M14 4V10H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14 4L20 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CSVIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 4H20V20H4V4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 8H16M8 12H16M8 16H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const Header: React.FC<HeaderProps> = ({ 
  title, 
  subtitle, 
  showExport = true,
  showSearch = false,
  showNotifications = false,
  showProfile = true,
  customActions,
  onExport,
  exportOptions = [],
}) => {
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const exportDropdownRef = useRef<HTMLDivElement>(null);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  
  // User profile state
  const [adminName, setAdminName] = useState("Admin User");
  const [adminRole, setAdminRole] = useState("Administrator");
  const [adminInitials, setAdminInitials] = useState("AD");
  const [loading, setLoading] = useState(true);

  // Load admin profile like the sidebar does
  useEffect(() => {
    const loadAdminProfile = async () => {
      try {
        const { profile } = await getAdminProfile();
        if (profile) {
          setAdminName(`${profile.first_name} ${profile.last_name}`);
          setAdminRole(profile.role === "admin" ? "Administrator" : profile.role);
          const firstInitial = profile.first_name?.charAt(0) || "";
          const lastInitial = profile.last_name?.charAt(0) || "";
          setAdminInitials(`${firstInitial}${lastInitial}`.toUpperCase());
        }
      } catch (error) {
        console.error("Failed to load admin profile:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadAdminProfile();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target as Node)) {
        setShowExportDropdown(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotificationDropdown(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleExportClick = (format: "pdf" | "csv", target?: string) => {
    if (onExport) {
      onExport(format, target);
    }
    setShowExportDropdown(false);
  };

  const hasExportOptions = exportOptions.length > 0;

  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>{title}</h1>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
      </div>
      
      <div className={styles.headerRight}>
        {/* Export Actions */}
        {showExport && onExport && (
          <div className={styles.exportGroup} ref={exportDropdownRef}>
            {hasExportOptions ? (
              <>
                <button 
                  className={`${styles.exportBtn} ${styles.pdfBtn}`}
                  onClick={() => handleExportClick("pdf", exportOptions[0]?.value)}
                >
                  <PDFIcon />
                  <span>PDF</span>
                </button>
                <button 
                  className={`${styles.exportBtn} ${styles.csvBtn}`}
                  onClick={() => handleExportClick("csv", exportOptions[0]?.value)}
                >
                  <CSVIcon />
                  <span>CSV</span>
                </button>
                <button 
                  className={styles.exportDropdownBtn}
                  onClick={() => setShowExportDropdown(!showExportDropdown)}
                >
                  <ChevronDownIcon />
                </button>
                
                {showExportDropdown && (
                  <div className={styles.exportDropdown}>
                    <div className={styles.dropdownHeader}>Export as...</div>
                    {exportOptions.map((option) => (
                      <div key={option.value} className={styles.dropdownSection}>
                        <div className={styles.dropdownSectionTitle}>{option.label}</div>
                        <button 
                          className={styles.dropdownItem}
                          onClick={() => handleExportClick("pdf", option.value)}
                        >
                          <PDFIcon /> PDF
                        </button>
                        <button 
                          className={styles.dropdownItem}
                          onClick={() => handleExportClick("csv", option.value)}
                        >
                          <CSVIcon /> CSV
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className={styles.simpleExportGroup}>
                <button 
                  className={`${styles.exportBtn} ${styles.pdfBtn}`}
                  onClick={() => handleExportClick("pdf")}
                >
                  <PDFIcon />
                  <span>PDF</span>
                </button>
                <button 
                  className={`${styles.exportBtn} ${styles.csvBtn}`}
                  onClick={() => handleExportClick("csv")}
                >
                  <CSVIcon />
                  <span>CSV</span>
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* Extra Features */}
        <div className={styles.extraFeatures}>
          {showSearch && (
            <button className={styles.iconBtn} title="Search">
              <SearchIcon />
            </button>
          )}
          
          {showNotifications && (
            <div className={styles.notificationWrapper} ref={notificationRef}>
              <button 
                className={styles.iconBtn} 
                title="Notifications"
                onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
              >
                <NotificationIcon />
                <span className={styles.notificationBadge}>3</span>
              </button>
              
              {showNotificationDropdown && (
                <div className={styles.notificationDropdown}>
                  <div className={styles.dropdownHeader}>
                    <span>Notifications</span>
                    <button className={styles.markAllRead}>Mark all read</button>
                  </div>
                  <div className={styles.notificationList}>
                    <div className={styles.notificationItem}>
                      <div className={styles.notificationDot}></div>
                      <div>
                        <div className={styles.notificationTitle}>New admission request</div>
                        <div className={styles.notificationTime}>2 min ago</div>
                      </div>
                    </div>
                    <div className={styles.notificationItem}>
                      <div className={styles.notificationDot}></div>
                      <div>
                        <div className={styles.notificationTitle}>Fee payment received</div>
                        <div className={styles.notificationTime}>1 hour ago</div>
                      </div>
                    </div>
                    <div className={styles.notificationItem}>
                      <div className={styles.notificationDotRead}></div>
                      <div>
                        <div className={styles.notificationTitle}>Staff meeting tomorrow</div>
                        <div className={styles.notificationTime}>5 hours ago</div>
                      </div>
                    </div>
                  </div>
                  <div className={styles.dropdownFooter}>
                    <button className={styles.viewAllBtn}>View all notifications</button>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {showProfile && (
            <div className={styles.profileWrapper} ref={profileRef}>
              <button 
                className={styles.profileBtn}
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              >
                <div className={styles.profileAvatar}>
                  <span>{adminInitials}</span>
                </div>
                <div className={styles.profileInfo}>
                  <span className={styles.profileName}>{adminName}</span>
                  <span className={styles.profileRole}>{adminRole}</span>
                </div>
                <ChevronDownIcon />
              </button>
              
              {showProfileDropdown && (
                <div className={styles.profileDropdown}>
                  <div className={styles.dropdownHeader}>
                    <div className={styles.profileDropdownAvatar}>
                      <span>{adminInitials}</span>
                    </div>
                    <div>
                      <div className={styles.profileDropdownName}>{adminName}</div>
                      <div className={styles.profileDropdownRole}>{adminRole}</div>
                    </div>
                  </div>
                  <div className={styles.dropdownDivider} />
                  <button className={styles.dropdownItem}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    My Profile
                  </button>
                  <button className={styles.dropdownItem}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="3" width="20" height="14" rx="2" />
                      <line x1="8" y1="21" x2="16" y2="21" />
                      <line x1="12" y1="17" x2="12" y2="21" />
                    </svg>
                    Settings
                  </button>
                  <div className={styles.dropdownDivider} />
                  <button className={`${styles.dropdownItem} ${styles.logoutItem}`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Custom Actions */}
        {customActions && (
          <div className={styles.customActions}>
            {customActions}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;