"use client";
import { useState } from "react";
import styles from "./Navigation.module.css";
import Link from "next/link";

interface NavigationProps {
  className?: string;
}

const navItems = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Programs", href: "#programs" },
  { label: "Faculty", href: "#faculty" },
  { label: "Contact", href: "#contact" },
];

export function Navigation({ className }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className={`${styles.nav} ${className || ""}`}>
      <div className={styles.navContainer}>
        <div className={styles.navContent}>
          <div className={styles.logoSection}>
            <div className={styles.logo}>
              <h1 className={styles.logoText}>Springfield Academy</h1>
            </div>
          </div>

          <div className={styles.desktopMenu}>
            <div className={styles.desktopMenuItems}>
              {navItems.map((item) => (
                <a key={item.href} href={item.href} className={styles.navLink}>
                  {item.label}
                </a>
              ))}
            </div>
          </div>
          <div className={styles.desktopMenu}>
            <div className={styles.desktopMenuItems}>
              <Link
                key="/dashboard"
                href="/dashboard"
                className={styles.navLink}
              >Login as Admin</Link>
            </div>
          </div>

          <div className={styles.mobileMenuButton}>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={styles.menuButton}
            >
              <span className={styles.srOnly}>Open main menu</span>
              <svg
                className={styles.menuIcon}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className={styles.mobileMenu}>
          <div className={styles.mobileMenuItems}>
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={styles.mobileNavLink}
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
