// components/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import styles from "./Sidebar.module.css";
import LogoutButton from "./Logout/Logout";
import { getAdminProfile, getAdminInitials } from "@/lib/action/admin/profile";

/* SVG Icons - Simplified and consistent */
const PromotionIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L12 7M12 2L9 5M12 2L15 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5 12L7 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M17 12L19 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M12 17L12 22M12 22L9 19M12 22L15 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);
const DashboardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const StudentsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 6C13.6569 6 15 7.34315 15 9C15 10.6569 13.6569 12 12 12C10.3431 12 9 10.6569 9 9C9 7.34315 10.3431 6 12 6Z" stroke="currentColor" strokeWidth="1.5" />
    <path d="M20 21C20 17.134 16.4183 14 12 14C7.58172 14 4 17.134 4 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M18 7C18 9.20914 16.2091 11 14 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M6 7C6 9.20914 7.79086 11 10 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const StaffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 21V19C17 16.8 15.2 15 13 15H5C2.8 15 1 16.8 1 19V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" />
    <path d="M23 21V19C22.9 16.7 21.1 15 18.9 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M16 3.13C18.1 3.53 19.7 5.4 19.7 7.5C19.7 9.6 18.1 11.5 16 11.9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const BookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 19.5C4 18.837 4.26339 18.2011 4.73223 17.7322C5.20107 17.2634 5.83696 17 6.5 17H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M6.5 2H20V22H6.5C5.83696 22 5.20107 21.7366 4.73223 21.2678C4.26339 20.7989 4 20.163 4 19.5V4.5C4 3.83696 4.26339 3.20107 4.73223 2.73223C5.20107 2.26339 5.83696 2 6.5 2Z" stroke="currentColor" strokeWidth="1.5" />
    <path d="M8 6H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M8 10H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const ReportsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 12H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M9 16H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M5 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3Z" stroke="currentColor" strokeWidth="1.5" />
    <path d="M7 7H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
    <path d="M19.4 15.05C19.2521 15.3125 19.1771 15.6079 19.1815 15.9066C19.1859 16.2053 19.2696 16.4985 19.425 16.756L19.515 16.901C19.6752 17.1662 19.7601 17.4725 19.7597 17.7849C19.7593 18.0973 19.6737 18.4034 19.5129 18.6682C19.3521 18.933 19.1229 19.1461 18.8493 19.2834C18.5758 19.4207 18.2686 19.4766 17.965 19.445H17.715C17.4102 19.4484 17.1096 19.5262 16.8435 19.6713C16.5773 19.8163 16.3542 20.0237 16.195 20.274L16.105 20.419C15.9391 20.6788 15.7069 20.887 15.4324 21.0219C15.1579 21.1569 14.8522 21.2138 14.55 21.187C14.2467 21.182 13.9482 21.1064 13.68 20.966L13.565 20.9C13.308 20.7592 13.0174 20.6883 12.725 20.694C12.4283 20.6921 12.1346 20.7631 11.873 20.901L11.66 21.011C11.3925 21.1534 11.094 21.2304 10.79 21.236C10.486 21.2416 10.185 21.1757 9.9125 21.0447C9.64 20.9137 9.40358 20.7212 9.2225 20.483C9.04141 20.2447 8.92106 19.9672 8.872 19.673L8.845 19.501C8.8054 19.1857 8.67798 18.8886 8.47815 18.6437C8.27832 18.3987 8.01425 18.2158 7.715 18.116L7.555 18.061C7.25953 17.9656 6.98829 17.8095 6.75986 17.6033C6.53143 17.397 6.35138 17.1452 6.232 16.865C6.1133 16.5854 6.05818 16.2839 6.07065 15.9815C6.08312 15.6792 6.16286 15.3833 6.304 15.115L6.366 15.001C6.52603 14.741 6.61021 14.4419 6.60868 14.137C6.60716 13.8321 6.51998 13.5338 6.357 13.275L6.24 13.088C6.07427 12.8179 5.98356 12.5073 5.97776 12.189C5.97196 11.8706 6.05125 11.557 6.207 11.281L6.297 11.136C6.45626 10.8785 6.55186 10.5862 6.576 10.282C6.60014 9.9778 6.55209 9.67165 6.436 9.387L6.373 9.237C6.2404 8.95123 6.17125 8.63973 6.17077 8.32422C6.17029 8.00872 6.2385 7.69703 6.37019 7.4109C6.50189 7.12478 6.69349 6.87111 6.93115 6.66874C7.1688 6.46637 7.44634 6.32039 7.745 6.241L7.89 6.2C8.18583 6.10731 8.45619 5.95259 8.68153 5.74678C8.90687 5.54098 9.08087 5.28969 9.19096 5.0108C9.30106 4.73191 9.34441 4.43241 9.31775 4.13494C9.29109 3.83747 9.19513 3.54932 9.037 3.293L8.977 3.179C8.82539 2.91583 8.73961 2.62017 8.72638 2.31723C8.71315 2.01428 8.77275 1.7127 8.90027 1.43756C9.02779 1.16242 9.21947 0.921333 9.45806 0.734612C9.69666 0.547891 9.97506 0.42073 10.271 0.363L10.441 0.327C10.756 0.256585 11.0799 0.256585 11.395 0.327H11.625C11.9272 0.321665 12.2276 0.391966 12.4978 0.531364C12.768 0.670762 12.9985 0.874684 13.168 1.123L13.258 1.268C13.4237 1.52783 13.6559 1.73597 13.9304 1.8709C14.2049 2.00584 14.5106 2.06276 14.813 2.036C15.1142 2.02468 15.4119 2.09078 15.677 2.228L15.792 2.294C16.0557 2.44188 16.3508 2.51887 16.65 2.51887C16.9492 2.51887 17.2443 2.44188 17.508 2.294L17.736 2.179C18.0029 2.04195 18.2995 1.96799 18.6 1.963C18.9005 1.95801 19.1993 2.02215 19.47 2.15005C19.7407 2.27795 19.9751 2.46585 20.1541 2.69767C20.3331 2.92949 20.4516 3.19816 20.5 3.483L20.527 3.653C20.5769 3.94689 20.704 4.2207 20.894 4.448C21.084 4.6753 21.3301 4.84752 21.607 4.947L21.767 5.002C22.0628 5.09711 22.3341 5.25288 22.5625 5.45834C22.7909 5.66379 22.9711 5.91432 23.091 6.193C23.2106 6.47304 23.2658 6.77525 23.2526 7.07814C23.2394 7.38103 23.1579 7.67739 23.014 7.944L22.952 8.058C22.792 8.318 22.7078 8.6171 22.7093 8.922C22.7108 9.2269 22.798 9.5252 22.961 9.784L23.078 9.971C23.2351 10.2364 23.3199 10.5398 23.3237 10.8496C23.3275 11.1595 23.2502 11.4651 23.0996 11.7345C22.9491 12.0039 22.7314 12.227 22.468 12.3801C22.2046 12.5332 21.9055 12.6106 21.603 12.605H21.413C21.1061 12.6143 20.8013 12.538 20.533 12.384C20.2647 12.23 20.0437 12.0049 19.893 11.734L19.803 11.589C19.6369 11.3172 19.3962 11.1012 19.1099 10.967C18.8236 10.8328 18.5052 10.7863 18.1948 10.833C17.8844 10.8797 17.5963 11.0176 17.3666 11.2287C17.1369 11.4398 16.9759 11.7147 16.903 12.017L16.867 12.187C16.7972 12.4987 16.8001 12.8215 16.8757 13.1319C16.9513 13.4423 17.0977 13.7317 17.304 13.979L17.379 14.075" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const HelpIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
    <path d="M9.09 9C9.3251 8.33167 9.78915 7.76811 10.4 7.40913C11.0108 7.05016 11.7289 6.91894 12.4272 7.03871C13.1255 7.15849 13.7588 7.52152 14.2151 8.06353C14.6713 8.60553 14.9211 9.29152 14.92 10C14.92 12 11.92 13 11.92 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="12" cy="17" r="0.5" fill="currentColor" stroke="currentColor" strokeWidth="1" />
  </svg>
);

const CollapseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ExpandIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const menuItems = [
  { name: "Dashboard", path: "/dashboard", icon: <DashboardIcon /> },
  { name: "Students", path: "/students", badge: "248", icon: <StudentsIcon /> },
  { name: "Staff", path: "/staff", badge: "32", icon: <StaffIcon /> },
  { name: "Subjects", path: "/subjects", icon: <BookIcon /> },
  { name: "Classes", path: "/classes", icon: <BookIcon /> },
  { name: "Admissions", path: "/admissions", icon: <BookIcon /> },
  { name: "Assessments", path: "/assessments", icon: <BookIcon /> },
  { name: "Fees", path: "/fees", icon: <BookIcon /> },
  { name: "Grading", path: "/grading", icon: <BookIcon /> },
  { name: "Terminal Reports", path: "/reports", icon: <ReportsIcon /> },
  { name: "Promotion", path: "/promotion", icon: <PromotionIcon /> },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [adminName, setAdminName] = useState("Admin User");
  const [adminRole, setAdminRole] = useState("Administrator");
  const [adminInitials, setAdminInitials] = useState("AD");
  const [loading, setLoading] = useState(true);

  // Load collapsed state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem("sidebarCollapsed");
    if (savedState !== null) {
      setIsCollapsed(savedState === "true");
    }
  }, []);

  // Load admin profile
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

  // Save collapsed state to localStorage
  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("sidebarCollapsed", String(newState));
    window.dispatchEvent(new Event("sidebarToggle"));
  };

  return (
    <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ""}`}>
      {/* Brand */}
      <div className={styles.brand}>
        <div className={styles.logoIcon}>DM</div>
        {!isCollapsed && (
          <div>
            <div className={styles.brandTitle}>DEMO</div>
            <div className={styles.brandSubtitle}>School</div>
          </div>
        )}
      </div>



      {/* Main Navigation */}
      {!isCollapsed && <div className={styles.sectionLabel}>Main Menu</div>}
      <nav className={styles.nav}>
        {menuItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`${styles.navLink} ${
              pathname === item.path ? styles.active : ""
            } ${isCollapsed ? styles.collapsedLink : ""}`}
            title={isCollapsed ? item.name : ""}
          >
            <span className={styles.navIcon}>{item.icon}</span>
            {!isCollapsed && (
              <>
                <span className={styles.navName}>{item.name}</span>
                {item.badge && <span className={styles.badge}>{item.badge}</span>}
              </>
            )}
          </Link>
        ))}
      </nav>

      {/* Logout Button */}
      <LogoutButton 
        variant="text" 
        showIcon={true} 
        className={`${styles.logoutBtn} ${isCollapsed ? styles.collapsedLink : ""}`}
      />

      {/* Footer User Card */}
      {!isCollapsed && (
        <div className={styles.footer}>
          <div className={styles.divider} />
          <div className={styles.userCard}>
            <div className={styles.avatarWrapper}>
              <div className={styles.userAvatar}>{adminInitials}</div>
              <span className={styles.statusDot} />
            </div>
            <div className={styles.userInfo}>
              <div className={styles.userName}>{adminName}</div>
              <div className={styles.userRole}>{adminRole}</div>
            </div>
            <svg
              className={styles.userMenuIcon}
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      )}
    </aside>
  );
}