// components/launch_components/About.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./About.module.css";

interface AboutProps {
  className?: string;
}

export function About({ className }: AboutProps) {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Accredited",
      description: "Recognized by Ministry of Education",
      color: "#0f5c3f",
    },
    {
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      title: "Expert Faculty",
      description: "Dedicated professional educators",
      color: "#d4a529",
    },
    {
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
      title: "Modern Facilities",
      description: "State-of-the-art learning environment",
      color: "#0f5c3f",
    },
    {
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      title: "Loving Community",
      description: "Supportive family environment",
      color: "#d4a529",
    },
  ];

  const milestones = [
    { year: "2012", event: "School Founded" },
    { year: "2015", event: "First Graduating Class" },
    { year: "2020", event: "New Campus Opening" },
    { year: "2024", event: "Digital Learning Initiative" },
  ];

  return (
    <section id="about" ref={sectionRef} className={`${styles.about} ${className || ""}`}>
      <div className={styles.container}>
        {/* Header */}
        <div className={`${styles.header} ${isVisible ? styles.visible : ""}`}>
          <span className={styles.sectionTag}>About Us</span>
          <h2 className={styles.title}>
            Discover the Kiddiewise Difference
          </h2>
          <div className={styles.titleUnderline}></div>
          <p className={styles.subtitle}>
            Over a decade of shaping young minds and building bright futures at Kiddiewise School Complex
          </p>
        </div>

        <div className={styles.content}>
          {/* Left Content */}
          <div className={`${styles.textContent} ${isVisible ? styles.visible : ""}`}>
            <div className={styles.quoteIcon}>
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M10 11h-4v-4h4v4zm8 0h-4v-4h4v4zm-8 8h-4v-4h4v4zm8 0h-4v-4h4v4z" fill="currentColor"/>
              </svg>
            </div>
            <h3 className={styles.subtitleHeading}>
              Excellence in Early Childhood & Elementary Education
            </h3>
            <p className={styles.paragraph}>
              At Kiddiewise School Complex, we believe every child is unique and deserves a nurturing environment 
              that fosters their natural curiosity and love for learning. Our holistic approach combines 
              academic excellence with character development, preparing students not just for exams, but for life.
            </p>
            <p className={styles.paragraph}>
              Our dedicated team of educators uses innovative teaching methods to engage young minds, 
              while our modern facilities provide the perfect setting for exploration and growth. 
              We partner with parents to ensure each child reaches their full potential.
            </p>

            {/* Features Grid */}
            <div className={styles.featuresGrid}>
              {features.map((feature, index) => (
                <div 
                  key={feature.title} 
                  className={`${styles.featureItem} ${isVisible ? styles.visible : ""}`}
                  style={{ animationDelay: `${0.1 * index}s` }}
                >
                  <div className={styles.featureIcon} style={{ background: `${feature.color}15`, color: feature.color }}>
                    {feature.icon}
                  </div>
                  <div>
                    <div className={styles.featureTitle}>{feature.title}</div>
                    <div className={styles.featureDescription}>{feature.description}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Milestones */}
            <div className={styles.milestones}>
              <h4 className={styles.milestonesTitle}>Our Journey</h4>
              <div className={styles.milestonesGrid}>
                {milestones.map((milestone, index) => (
                  <div key={milestone.year} className={styles.milestoneItem}>
                    <div className={styles.milestoneYear}>{milestone.year}</div>
                    <div className={styles.milestoneEvent}>{milestone.event}</div>
                    {index < milestones.length - 1 && <div className={styles.milestoneLine}></div>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className={`${styles.imageContainer} ${isVisible ? styles.visible : ""}`}>
            <div className={styles.imageWrapper}>
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Students learning together at Kiddiewise School Complex"
                className={styles.image}
              />
              <div className={styles.imageOverlay}></div>
            </div>
            
            {/* Stats Badge */}
            <div className={styles.statsBadge}>
              <div className={styles.statsNumber}>12+</div>
              <div className={styles.statsLabel}>Years of Excellence</div>
            </div>

            {/* Experience Badge */}
            <div className={styles.experienceBadge}>
              <div className={styles.experienceNumber}>2000+</div>
              <div className={styles.experienceLabel}>Graduates</div>
            </div>

            {/* Quote Badge */}
            <div className={styles.quoteBadge}>
              <div className={styles.quoteText}>
                "The best investment you can make is in your child's education"
              </div>
              <div className={styles.quoteAuthor}>- Kiddiewise School Complex</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}