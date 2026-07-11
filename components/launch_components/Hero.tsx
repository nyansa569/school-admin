// components/launch_components/Hero.tsx
"use client";

import { useState, useEffect } from "react";
import styles from "./Hero.module.css";

interface HeroProps {
  className?: string;
}

export function Hero({ className }: HeroProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const stats = [
    { number: "500+", label: "Students", delay: 0 },
    { number: "50+", label: "Teachers", delay: 0.1 },
    { number: "25+", label: "Programs", delay: 0.2 },
    { number: "95%", label: "Success Rate", delay: 0.3 },
  ];

  return (
    <section id="home" className={`${styles.hero} ${className || ""}`}>
      {/* Animated Background */}
      <div className={styles.heroBackground}>
        <div className={styles.gradientOrb1}></div>
        <div className={styles.gradientOrb2}></div>
        <div className={styles.gradientOrb3}></div>
      </div>

      <div className={styles.heroContainer}>
        <div className={styles.heroContent}>
          <div className={`${styles.heroTextContainer} ${isVisible ? styles.visible : ""}`}>
            {/* Badge */}
            <div className={styles.badge}>
              <span className={styles.badgeIcon}>🏆</span>
              <span className={styles.badgeText}>Top Rated School in Ghana</span>
            </div>

            {/* Title */}
            <h1 className={styles.heroTitle}>
              Nurturing Young Minds,
              <span className={styles.gradientText}> Building Bright Futures</span>
            </h1>

            {/* Description */}
            <p className={styles.heroSubtitle}>
              At Kiddiewise School Complex, we provide a nurturing environment where children develop academically, 
              socially, and emotionally. Our holistic approach prepares students for excellence in education and life.
            </p>

            {/* CTA Buttons */}
            <div className={styles.buttonContainer}>
              <a href="#programs" className={styles.primaryButton}>
                <span>Explore Programs</span>
                <svg className={styles.buttonIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
              <a href="#contact" className={styles.secondaryButton}>
                <svg className={styles.buttonIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Contact Us
              </a>
            </div>

            {/* Trust Badges */}
            <div className={styles.trustBadges}>
              <div className={styles.trustItem}>
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <span>Licensed by MoE</span>
              </div>
              <div className={styles.trustItem}>
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M12 6v6l4 2m-4-2V6m0 0V4m0 2h2m-2 0h-2" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <span>15+ Years Experience</span>
              </div>
              <div className={styles.trustItem}>
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <span>Experienced Faculty</span>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className={`${styles.statsContainer} ${isVisible ? styles.visible : ""}`}>
            {stats.map((stat, index) => (
              <div 
                key={stat.label} 
                className={styles.statItem}
                style={{ animationDelay: `${stat.delay}s` }}
              >
                <div className={styles.statNumber}>
                  <span className={styles.counter}>{stat.number}</span>
                </div>
                <div className={styles.statLabel}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <a href="#about" className={styles.scrollIndicator}>
        <span className={styles.scrollText}>Scroll to explore</span>
        <svg className={styles.scrollIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </a>
    </section>
  );
}