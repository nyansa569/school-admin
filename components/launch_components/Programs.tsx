import styles from './Programs.module.css';

interface ProgramCardProps {
  title: string;
  description: string;
  features: string[];
  icon: string;
  color: string;
}

function ProgramCard({ title, description, features, icon, color }: ProgramCardProps) {
  return (
    <div className={styles.card}>
      <div className={`${styles.cardHeader} ${color}`}>
        <div className={styles.cardIcon}>{icon}</div>
      </div>
      <div className={styles.cardContent}>
        <h3 className={styles.cardTitle}>{title}</h3>
        <p className={styles.cardDescription}>{description}</p>
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
      </div>
    </div>
  );
}

interface ProgramsProps {
  className?: string;
}

const programs = [
  {
    title: "Science & Technology",
    description: "Cutting-edge STEM curriculum with hands-on laboratory experience",
    features: ["Robotics Lab", "Science Fair", "Coding Classes", "Research Projects"],
    icon: "🔬",
    color: "bg-gradient-to-br from-blue-500 to-blue-600"
  },
  {
    title: "Arts & Creativity",
    description: "Comprehensive arts program fostering creative expression",
    features: ["Visual Arts", "Music & Band", "Theater", "Digital Media"],
    icon: "🎨",
    color: "bg-gradient-to-br from-purple-500 to-purple-600"
  },
  {
    title: "Sports & Athletics",
    description: "Competitive sports programs promoting teamwork and fitness",
    features: ["Team Sports", "Individual Training", "Fitness Center", "Tournaments"],
    icon: "⚽",
    color: "bg-gradient-to-br from-green-500 to-green-600"
  },
  {
    title: "Academic Excellence",
    description: "Rigorous academic programs for high-achieving students",
    features: ["Advanced Placement", "Honors Programs", "Tutoring", "Study Groups"],
    icon: "📚",
    color: "bg-gradient-to-br from-indigo-500 to-indigo-600"
  },
  {
    title: "Language & Culture",
    description: "Multilingual education and cultural exchange programs",
    features: ["Language Labs", "Exchange Programs", "Cultural Events", "Debate Club"],
    icon: "🌍",
    color: "bg-gradient-to-br from-orange-500 to-orange-600"
  },
  {
    title: "Leadership Development",
    description: "Programs designed to cultivate future leaders",
    features: ["Student Council", "Peer Mentoring", "Leadership Workshops", "Community Service"],
    icon: "🌟",
    color: "bg-gradient-to-br from-yellow-500 to-yellow-600"
  }
];

export function Programs({ className }: ProgramsProps) {
  return (
    <section id="programs" className={`${styles.programs} ${className || ''}`}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Our Programs</h2>
          <p className={styles.subtitle}>
            Comprehensive educational programs designed to nurture every aspect of your child's development
          </p>
          <div className={styles.headerUnderline}></div>
        </div>

        <div className={styles.cardGrid}>
          {programs.map((program, index) => (
            <ProgramCard key={index} {...program} />
          ))}
        </div>

        <div className={styles.footer}>
          <a
            href="#contact"
            className={styles.ctaButton}
          >
            Learn More About Our Programs
            <svg className={styles.ctaIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}