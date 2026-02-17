import styles from './Hero.module.css';

interface HeroProps {
  className?: string;
}

export function Hero({ className }: HeroProps) {
  return (
    <section id="home" className={`${styles.hero} ${className || ''}`}>
      <div className={styles.heroBackground} />
      <div className={styles.heroContainer}>
        <div className={styles.heroContent}>
          <div className={styles.heroTextContainer}>
            <h1 className={styles.heroTitle}>
              Excellence in
              <span className={styles.gradientText}>Education</span>
            </h1>
            <p className={styles.heroSubtitle}>
              Empowering the next generation of leaders, thinkers, and innovators through world-class education and holistic development.
            </p>
          </div>
          
          <div className={styles.buttonContainer}>
            <a
              href="#programs"
              className={styles.primaryButton}
            >
              Explore Programs
              <svg className={styles.buttonIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
            <a
              href="#contact"
              className={styles.secondaryButton}
            >
              Contact Us
            </a>
          </div>

          <div className={styles.statsContainer}>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>500+</div>
              <div className={styles.statLabel}>Students</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>50+</div>
              <div className={styles.statLabel}>Teachers</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>25+</div>
              <div className={styles.statLabel}>Programs</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>95%</div>
              <div className={styles.statLabel}>Success Rate</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}