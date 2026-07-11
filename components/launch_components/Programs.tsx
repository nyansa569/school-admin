// components/launch_components/Programs.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./Programs.module.css";

interface ProgramCardProps {
  title: string;
  description: string;
  features: string[];
  icon: string;
  ageRange: string;
  color: string;
  duration: string;
}

function ProgramCard({ title, description, features, icon, ageRange, color, duration }: ProgramCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={styles.card}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`${styles.cardHeader} ${styles[color]}`}>
        <div className={styles.cardIcon}>{icon}</div>
        <div className={styles.ageBadge}>{ageRange}</div>
      </div>
      <div className={styles.cardContent}>
        <h3 className={styles.cardTitle}>{title}</h3>
        <p className={styles.cardDescription}>{description}</p>
        <div className={styles.durationBadge}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span>{duration}</span>
        </div>
        <ul className={styles.featureList}>
          {features.map((feature, index) => (
            <li key={index} className={styles.featureItem}>
              <svg className={styles.featureIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {feature}
            </li>
          ))}
        </ul>
        <button className={styles.learnMoreBtn}>
          Learn More
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </button>
      </div>
    </div>
  );
}

interface ProgramsProps {
  className?: string;
}

const programs = [
  {
    title: "Daycare",
    description: "A safe, nurturing environment for our youngest learners. Focus on sensory development, social skills, and early cognitive growth through play-based learning.",
    features: [
      "Sensory Play Activities",
      "Social Skill Development",
      "Nap & Rest Time",
      "Healthy Meals & Snacks",
      "Outdoor Play Time",
      "Parent Communication App"
    ],
    icon: "🍼",
    ageRange: "6 months - 2 years",
    color: "colorDaycare",
    duration: "Full Day / Half Day"
  },
  {
    title: "Preschool (Nursery)",
    description: "Building foundational skills through structured play, early literacy, numeracy, and creative expression in a warm, engaging environment.",
    features: [
      "Early Literacy & Phonics",
      "Basic Numeracy",
      "Arts & Crafts",
      "Music & Movement",
      "Social & Emotional Learning",
      "Show & Tell Activities"
    ],
    icon: "🎨",
    ageRange: "2 - 4 years",
    color: "colorPreschool",
    duration: "Full Day / Half Day"
  },
  {
    title: "Kindergarten (KG 1 & 2)",
    description: "Preparing children for primary school with a balanced curriculum focusing on reading, writing, mathematics, and character development.",
    features: [
      "Reading & Writing Readiness",
      "Basic Mathematics",
      "Science Exploration",
      "Physical Education",
      "Computer Literacy",
      "Moral Education"
    ],
    icon: "📚",
    ageRange: "4 - 6 years",
    color: "colorKindergarten",
    duration: "Full Day"
  },
  {
    title: "Primary School (Grades 1-6)",
    description: "Comprehensive elementary education following the Ghana Education Service curriculum with emphasis on critical thinking and problem-solving.",
    features: [
      "English & Mathematics",
      "Science & Social Studies",
      "French & Ghanaian Language",
      "ICT & Computing",
      "Creative Arts & Sports",
      "Weekly Assessments"
    ],
    icon: "📖",
    ageRange: "6 - 12 years",
    color: "colorPrimary",
    duration: "Full Day"
  },
  {
    title: "Junior High School (JHS 1-3)",
    description: "Rigorous academic preparation for BECE examinations with focus on leadership, character development, and career guidance.",
    features: [
      "BECE Preparation",
      "Core Subjects (Math, English, Science)",
      "Elective Subjects Selection",
      "Career Guidance & Counseling",
      "Mock Examinations",
      "Extra-Curricular Activities"
    ],
    icon: "🎓",
    ageRange: "12 - 15 years",
    color: "colorJHS",
    duration: "Full Day"
  },
  {
    title: "Holiday & Weekend Programs",
    description: "Fun-filled learning during school breaks. Includes remedial classes, skill-building workshops, and recreational activities.",
    features: [
      "Remedial Classes",
      "Coding & Robotics",
      "Arts & Crafts Camp",
      "Sports Clinics",
      "Excursions & Field Trips",
      "Public Speaking Workshop"
    ],
    icon: "⭐",
    ageRange: "4 - 15 years",
    color: "colorHoliday",
    duration: "Flexible"
  }
];

export function Programs({ className }: ProgramsProps) {
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

  return (
    <section id="programs" ref={sectionRef} className={`${styles.programs} ${className || ""}`}>
      <div className={styles.container}>
        {/* Header */}
        <div className={`${styles.header} ${isVisible ? styles.visible : ""}`}>
          <span className={styles.sectionTag}>Our Programs</span>
          <h2 className={styles.title}>
            A Complete Learning Journey
            <span className={styles.titleHighlight}> From Daycare to JHS</span>
          </h2>
          <p className={styles.subtitle}>
            Kiddiewise School Complex provides a seamless educational pathway that nurtures your child's potential at every stage of development
          </p>
          <div className={styles.titleUnderline}></div>
        </div>

        {/* Program Cards Grid */}
        <div className={styles.cardGrid}>
          {programs.map((program, index) => (
            <div 
              key={program.title} 
              className={`${styles.cardWrapper} ${isVisible ? styles.visible : ""}`}
              style={{ animationDelay: `${0.1 * index}s` }}
            >
              <ProgramCard {...program} />
            </div>
          ))}
        </div>

        {/* Educational Pathway */}
        <div className={`${styles.pathway} ${isVisible ? styles.visible : ""}`}>
          <h3 className={styles.pathwayTitle}>Our Educational Pathway</h3>
          <div className={styles.pathwaySteps}>
            <div className={styles.pathwayStep}>
              <div className={styles.pathwayNumber}>1</div>
              <div className={styles.pathwayLabel}>Daycare</div>
              <div className={styles.pathwayAge}>6 months - 2 years</div>
            </div>
            <div className={styles.pathwayArrow}>→</div>
            <div className={styles.pathwayStep}>
              <div className={styles.pathwayNumber}>2</div>
              <div className={styles.pathwayLabel}>Preschool</div>
              <div className={styles.pathwayAge}>2 - 4 years</div>
            </div>
            <div className={styles.pathwayArrow}>→</div>
            <div className={styles.pathwayStep}>
              <div className={styles.pathwayNumber}>3</div>
              <div className={styles.pathwayLabel}>Kindergarten</div>
              <div className={styles.pathwayAge}>4 - 6 years</div>
            </div>
            <div className={styles.pathwayArrow}>→</div>
            <div className={styles.pathwayStep}>
              <div className={styles.pathwayNumber}>4</div>
              <div className={styles.pathwayLabel}>Primary</div>
              <div className={styles.pathwayAge}>6 - 12 years</div>
            </div>
            <div className={styles.pathwayArrow}>→</div>
            <div className={styles.pathwayStep}>
              <div className={styles.pathwayNumber}>5</div>
              <div className={styles.pathwayLabel}>JHS</div>
              <div className={styles.pathwayAge}>12 - 15 years</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className={`${styles.footer} ${isVisible ? styles.visible : ""}`}>
          <div className={styles.ctaCard}>
            <div className={styles.ctaContent}>
              <h3 className={styles.ctaTitle}>Ready to Enroll Your Child?</h3>
              <p className={styles.ctaText}>
                Schedule a campus tour or request more information about our programs
              </p>
            </div>
            <div className={styles.ctaButtons}>
              <a href="#contact" className={styles.ctaButton}>
                Contact Admissions
                <svg className={styles.ctaIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
              <a href="#enroll" className={styles.ctaSecondaryButton}>
                Enroll Now
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 3v12m0 0-3-3m3 3 3-3M5 17h14" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}