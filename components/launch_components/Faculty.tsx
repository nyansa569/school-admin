import styles from './Faculty.module.css';

interface FacultyMember {
  name: string;
  position: string;
  education: string;
  specialties: string[];
  image: string;
}

interface FacultyCardProps {
  member: FacultyMember;
}

function FacultyCard({ member }: FacultyCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        <img
          src={member.image}
          alt={member.name}
          className={styles.image}
        />
        <div className={styles.imageOverlay}></div>
      </div>
      <div className={styles.cardContent}>
        <h3 className={styles.memberName}>{member.name}</h3>
        <p className={styles.memberPosition}>{member.position}</p>
        <p className={styles.memberEducation}>{member.education}</p>
        <div className={styles.specialtiesContainer}>
          {member.specialties.map((specialty, index) => (
            <span
              key={index}
              className={styles.specialtyTag}
            >
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
    name: "Dr. Sarah Johnson",
    position: "Principal",
    education: "Ph.D. in Educational Leadership, Harvard University",
    specialties: ["Administration", "Curriculum Development", "Leadership"],
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "Prof. Michael Chen",
    position: "Head of Science Department",
    education: "M.Sc. Physics, MIT",
    specialties: ["Physics", "Chemistry", "Robotics"],
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "Dr. Emily Rodriguez",
    position: "Head of Arts Department",
    education: "Ph.D. in Fine Arts, Yale University",
    specialties: ["Visual Arts", "Theater", "Music"],
    image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "Coach David Thompson",
    position: "Athletic Director",
    education: "M.A. Physical Education, Stanford University",
    specialties: ["Sports Management", "Physical Fitness", "Team Building"],
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "Ms. Lisa Wang",
    position: "Technology Coordinator",
    education: "M.Ed. Educational Technology, UC Berkeley",
    specialties: ["Computer Science", "Digital Learning", "Innovation"],
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "Mr. James Park",
    position: "Counselor",
    education: "M.A. Psychology, University of Chicago",
    specialties: ["Student Counseling", "Mental Health", "Career Guidance"],
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
  }
];

export function Faculty({ className }: FacultyProps) {
  return (
    <section id="faculty" className={`${styles.faculty} ${className || ''}`}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Our Faculty</h2>
          <p className={styles.subtitle}>
            Dedicated educators who inspire, mentor, and guide our students to achieve their full potential
          </p>
          <div className={styles.headerUnderline}></div>
        </div>

        <div className={styles.cardGrid}>
          {facultyMembers.map((member, index) => (
            <FacultyCard key={index} member={member} />
          ))}
        </div>

        <div className={styles.ctaSection}>
          <h3 className={styles.ctaTitle}>Join Our Team</h3>
          <p className={styles.ctaDescription}>We're always looking for passionate educators who share our commitment to excellence.</p>
          <a
            href="#contact"
            className={styles.ctaButton}
          >
            View Career Opportunities
            <svg className={styles.ctaIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}