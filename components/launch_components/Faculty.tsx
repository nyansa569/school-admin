// components/launch_components/Faculty.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./Faculty.module.css";

interface FacultyMember {
  name: string;
  position: string;
  education: string;
  specialties: string[];
  image: string;
  experience: string;
}

interface FacultyCardProps {
  member: FacultyMember;
  index: number;
}

function FacultyCard({ member, index }: FacultyCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

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

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={cardRef}
      className={`${styles.card} ${isVisible ? styles.visible : ""}`}
      style={{ animationDelay: `${0.1 * index}s` }}
    >
      <div className={styles.imageContainer}>
        <img
          src={member.image}
          alt={member.name}
          className={styles.image}
        />
        <div className={styles.imageOverlay}>
          <div className={styles.socialLinks}>
            <a href="#" className={styles.socialLink}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 4.01c-1 .49-1.98.69-3 .69-1.45-1.67-3.99-1.78-5.58-.25-1.03 1-1.42 2.49-1 3.89-3.35-.16-6.43-1.31-8.65-3.44-.94-1.1-1.54-2.53-1.67-4.04-.13-1.51.22-3.02.97-4.33-.59.19-1.14.5-1.64.9-.9.73-1.54 1.74-1.83 2.87-.29 1.13-.23 2.31.17 3.41-.4-.09-.79-.22-1.17-.38-.66-.28-1.28-.66-1.84-1.13v.03c0 1.48.77 2.86 2.03 3.63-.51-.06-1.01-.18-1.48-.37.02.77.31 1.52.82 2.1.51.58 1.2.97 1.95 1.11-.46.12-.94.17-1.42.15.38 1.23 1.27 2.26 2.44 2.82-1.1.61-2.35.92-3.62.9 2.17 1.4 4.71 2.15 7.32 2.15 8.89 0 13.76-7.37 13.76-13.76v-.52c.96-.7 1.79-1.57 2.44-2.55z" />
              </svg>
            </a>
            <a href="#" className={styles.socialLink}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect x="2" y="9" width="4" height="12" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </a>
            <a href="#" className={styles.socialLink}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </a>
          </div>
        </div>
      </div>
      <div className={styles.cardContent}>
        <h3 className={styles.memberName}>{member.name}</h3>
        <p className={styles.memberPosition}>{member.position}</p>
        <div className={styles.memberBadge}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 6v6l4 2" />
            <circle cx="12" cy="12" r="10" />
          </svg>
          <span>{member.experience}</span>
        </div>
        <p className={styles.memberEducation}>{member.education}</p>
        <div className={styles.specialtiesContainer}>
          {member.specialties.map((specialty, idx) => (
            <span key={idx} className={styles.specialtyTag}>
              {specialty}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

interface FacultyProps {
  className?: string;
}

const facultyMembers: FacultyMember[] = [
  {
    name: "Mrs. Akua Mensah",
    position: "Headmistress",
    education: "M.Ed. Educational Leadership, University of Ghana",
    specialties: ["School Administration", "Curriculum Development", "Educational Policy"],
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    experience: "18+ years experience"
  },
  {
    name: "Mr. Kofi Asante",
    position: "Head of Science Department",
    education: "M.Sc. Science Education, KNUST",
    specialties: ["Integrated Science", "Biology", "Practical Demonstrations"],
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    experience: "15+ years experience"
  },
  {
    name: "Mrs. Adwoa Serwaa",
    position: "Early Childhood Coordinator",
    education: "M.Ed. Early Childhood Education, University of Cape Coast",
    specialties: ["Play-Based Learning", "Child Psychology", "Literacy Development"],
    image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    experience: "12+ years experience"
  },
  {
    name: "Mr. Ebenezer Osei",
    position: "Mathematics Specialist",
    education: "B.Ed. Mathematics Education, University of Education Winneba",
    specialties: ["Core Mathematics", "Problem Solving", "BECE Preparation"],
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    experience: "10+ years experience"
  },
  {
    name: "Ms. Efua Dadson",
    position: "Language Arts Teacher",
    education: "M.A. English Literature, University of Ghana",
    specialties: ["English Language", "Literature", "Creative Writing"],
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    experience: "8+ years experience"
  },
  {
    name: "Mr. Kwame Gyasi",
    position: "ICT & Robotics Instructor",
    education: "B.Sc. Computer Science, KNUST",
    specialties: ["Coding", "Robotics", "Digital Literacy"],
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    experience: "7+ years experience"
  },
  {
    name: "Mrs. Ama Bonsu",
    position: "Social Studies Coordinator",
    education: "M.Ed. Social Studies, University of Cape Coast",
    specialties: ["Ghanaian History", "Citizenship Education", "Geography"],
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    experience: "14+ years experience"
  },
  {
    name: "Mr. Yaw Ampofo",
    position: "Performing Arts Teacher",
    education: "B.A. Theatre Arts, University of Ghana",
    specialties: ["Drama", "Music", "Cultural Dance"],
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    experience: "9+ years experience"
  },
  {
    name: "Mrs. Abena Ofori",
    position: "Guidance & Counseling",
    education: "M.A. Counselling Psychology, University of Ghana",
    specialties: ["Student Wellbeing", "Career Guidance", "Parent Counseling"],
    image: "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    experience: "11+ years experience"
  }
];

export function Faculty({ className }: FacultyProps) {
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
    <section id="faculty" ref={sectionRef} className={`${styles.faculty} ${className || ""}`}>
      {/* Ghana Flag Decoration */}
      <div className={styles.ghanaFlag}>
        <div className={styles.flagRed}></div>
        <div className={styles.flagYellow}></div>
        <div className={styles.flagGreen}></div>
        <div className={styles.flagStar}>⭐</div>
      </div>

      <div className={styles.container}>
        {/* Header */}
        <div className={`${styles.header} ${isVisible ? styles.visible : ""}`}>
          <span className={styles.sectionTag}>Our Dedicated Team</span>
          <h2 className={styles.title}>
            Meet Our Exceptional
            <span className={styles.titleHighlight}> Faculty & Staff</span>
          </h2>
          <p className={styles.subtitle}>
            Passionate Ghanaian educators committed to nurturing excellence at Kiddiewise School Complex
          </p>
          <div className={styles.titleUnderline}></div>
        </div>

        {/* Stats Bar */}
        <div className={`${styles.statsBar} ${isVisible ? styles.visible : ""}`}>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>25+</div>
            <div className={styles.statLabel}>Qualified Teachers</div>
          </div>
          <div className={styles.statDivider}></div>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>1:15</div>
            <div className={styles.statLabel}>Teacher-Student Ratio</div>
          </div>
          <div className={styles.statDivider}></div>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>100%</div>
            <div className={styles.statLabel}>Licensed Educators</div>
          </div>
          <div className={styles.statDivider}></div>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>10+</div>
            <div className={styles.statLabel}>Years Avg. Experience</div>
          </div>
        </div>

        {/* Faculty Grid */}
        <div className={styles.cardGrid}>
          {facultyMembers.map((member, index) => (
            <FacultyCard key={index} member={member} index={index} />
          ))}
        </div>

        {/* CTA Section */}
        <div className={`${styles.ctaSection} ${isVisible ? styles.visible : ""}`}>
          <div className={styles.ctaCard}>
            <div className={styles.ctaIcon}>🇬🇭</div>
            <h3 className={styles.ctaTitle}>Join Our Growing Team</h3>
            <p className={styles.ctaDescription}>
              We're always looking for passionate Ghanaian educators who share our vision of excellence in education at Kiddiewise School Complex.
            </p>
            <div className={styles.ctaButtons}>
              <a href="#contact" className={styles.ctaButton}>
                Contact HR
                <svg className={styles.ctaIconSvg} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
              <a href="#contact" className={styles.ctaSecondaryButton}>
                View Open Positions
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}