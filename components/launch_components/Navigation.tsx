// components/Navigation/Navigation.tsx
"use client";
import { useState, useEffect } from "react";
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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
    setIsOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ""} ${className || ""}`}>
      <div className={styles.navContainer}>
        <div className={styles.navContent}>
          {/* Logo Section */}
          <div className={styles.logoSection}>
            <Link href="/" className={styles.logo}>
              <div className={styles.logoIcon}>
                <img src="/logo.png" alt="Kiddiewise School Complex" className={styles.logoImage} />
              </div>
              <div className={styles.logoText}>
                <span className={styles.logoName}>KIDDIEWISE</span>
                <span className={styles.logoTagline}>School Complex</span>
              </div>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className={styles.desktopMenu}>
            <div className={styles.desktopMenuItems}>
              {navItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => scrollToSection(item.href)}
                  className={styles.navLink}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className={styles.ctaButtons}>
            <Link href="/auth/login" className={styles.loginBtn}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
              Staff Portal
            </Link>
            <Link href="#enroll" className={styles.enrollBtn}>
              Enroll Now
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className={styles.mobileMenuButton}>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={styles.menuButton}
              aria-label="Toggle menu"
            >
              <span className={styles.menuIcon}>
                {isOpen ? (
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className={styles.mobileMenu}>
          <div className={styles.mobileMenuItems}>
            {navItems.map((item) => (
              <button
                key={item.href}
                onClick={() => scrollToSection(item.href)}
                className={styles.mobileNavLink}
              >
                {item.label}
              </button>
            ))}
            <div className={styles.mobileCtaButtons}>
              <Link href="/auth/login" className={styles.mobileLoginBtn} onClick={() => setIsOpen(false)}>
                Staff Portal
              </Link>
              <Link href="#enroll" className={styles.mobileEnrollBtn} onClick={() => setIsOpen(false)}>
                Enroll Now
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}