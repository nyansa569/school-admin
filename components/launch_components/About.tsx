import styles from './About.module.css';

interface AboutProps {
  className?: string;
}

export function About({ className }: AboutProps) {
  return (
    <section id="about" className={`${styles.about} ${className || ''}`}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>About Our School</h2>
          <div className={styles.titleUnderline}></div>
        </div>

        <div className={styles.content}>
          <div className={styles.textContent}>
            <h3 className={styles.subtitle}>
              Shaping Futures Through Excellence
            </h3>
            <p className={styles.paragraph}>
              Springfield Academy has been at the forefront of education for over 50 years. Our commitment to excellence, innovation, and individualized learning has made us a trusted choice for families seeking quality education.
            </p>
            <p className={styles.paragraph}>
              We believe in nurturing not just academic excellence, but also character development, creativity, and critical thinking skills that prepare our students for the challenges of tomorrow.
            </p>
            
            <div className={styles.featuresGrid}>
              <div className={styles.featureItem}>
                <div className={styles.featureIcon}>
                  <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className={styles.featureTitle}>Accredited</div>
                  <div className={styles.featureDescription}>Recognized institution</div>
                </div>
              </div>
              <div className={styles.featureItem}>
                <div className={styles.featureIcon}>
                  <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <div className={styles.featureTitle}>Expert Faculty</div>
                  <div className={styles.featureDescription}>Dedicated educators</div>
                </div>
              </div>
              <div className={styles.featureItem}>
                <div className={styles.featureIcon}>
                  <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <div>
                  <div className={styles.featureTitle}>Modern Facilities</div>
                  <div className={styles.featureDescription}>State-of-the-art campus</div>
                </div>
              </div>
              <div className={styles.featureItem}>
                <div className={styles.featureIcon}>
                  <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <div>
                  <div className={styles.featureTitle}>Community</div>
                  <div className={styles.featureDescription}>Supportive environment</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className={styles.imageContainer}>
            <div className={styles.imageWrapper}>
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Students learning together"
                className={styles.image}
              />
            </div>
            <div className={styles.statsBadge}>
              <div className={styles.statsNumber}>50+</div>
              <div className={styles.statsLabel}>Years of Excellence</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}