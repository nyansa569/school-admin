import React, { ReactNode } from 'react';
import styles from './Header.module.css';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showExport?: boolean;
  showSearch?: boolean;
  showNotifications?: boolean;
  showProfile?: boolean;
  customActions?: ReactNode;
}

const Header: React.FC<HeaderProps> = ({ 
  title, 
  subtitle, 
  showExport = true,
  showSearch = true,
  showNotifications = true,
  showProfile = true,
  customActions 
}) => {
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
        {showExport && (
          <div className={styles.exportGroup}>
            <button className={`${styles.exportBtn} ${styles.pdfBtn}`}>
              <svg className={styles.btnIcon} viewBox="0 0 24 24" width="18" height="18">
                <path fill="currentColor" d="M20,20H4V4H20M20,2H4C2.9,2,2,2.9,2,4V20C2,21.1,2.9,22,4,22H20C21.1,22,22,21.1,22,20V4C22,2.9,21.1,2,20,2M8,7H16V9H8V7M16,15H8V13H16V15M16,11H8V9H16V11Z" />
              </svg>
              PDF
            </button>
            <button className={`${styles.exportBtn} ${styles.csvBtn}`}>
              <svg className={styles.btnIcon} viewBox="0 0 24 24" width="18" height="18">
                <path fill="currentColor" d="M14,2H6C4.9,2,4,2.9,4,4V20C4,21.1,4.9,22,6,22H18C19.1,22,20,21.1,20,20V8L14,2M18,20H6V4H13V9H18V20M10,19L12,15H9L11,11H8L10,7H7L5,13H8L6,19H10Z" />
              </svg>
              CSV
            </button>
          </div>
        )}
        
        {/* Extra Features */}
        <div className={styles.extraFeatures}>
          {showSearch && (
            <button className={styles.iconBtn} title="Search">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" />
              </svg>
            </button>
          )}
          
          {showNotifications && (
            <button className={styles.iconBtn} title="Notifications">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M21,19V20H3V19L5,17V11C5,7.9 7.03,5.17 10,4.29C10,4.19 10,4.1 10,4C10,2.9 10.9,2 12,2C13.1,2 14,2.9 14,4C14,4.1 14,4.19 14,4.29C16.97,5.17 19,7.9 19,11V17L21,19M14,21C14,22.1 13.1,23 12,23C10.9,23 10,22.1 10,21" />
              </svg>
              <span className={styles.notificationBadge}>3</span>
            </button>
          )}
          
          {showProfile && (
            <button className={styles.profileBtn}>
              <div className={styles.profileAvatar}>
                <span>AD</span>
              </div>
              <div className={styles.profileInfo}>
                <span className={styles.profileName}>Admin User</span>
                <span className={styles.profileRole}>Administrator</span>
              </div>
              <svg className={styles.dropdownIcon} viewBox="0 0 24 24" width="16" height="16">
                <path fill="currentColor" d="M7,10L12,15L17,10H7Z" />
              </svg>
            </button>
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