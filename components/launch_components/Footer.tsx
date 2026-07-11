// components/launch_components/Footer.tsx
import styles from './Footer.module.css';
import Link from 'next/link';

interface FooterProps {
  className?: string;
}

const quickLinks = [
  { label: "About Us", href: "#about" },
  { label: "Programs", href: "#programs" },
  { label: "Faculty", href: "#faculty" },
  { label: "Contact", href: "#contact" },
];

const services = [
  { label: "Admissions", href: "#enroll" },
  { label: "Transportation", href: "#" },
  { label: "Cafeteria", href: "#" },
  { label: "Sports & Arts", href: "#" },
];

const contactInfo = [
  { label: "Phone", value: "+233 54 179 0780", icon: "📞" },
  { label: "Email", value: "kiddiewise2012@gmail.com", icon: "✉️" },
  { label: "Address", value: "Oyarifa Road (Off Container Junction), Accra, Ghana", icon: "📍" },
];

export function Footer({ className }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`${styles.footer} ${className || ''}`}>
      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.brandSection}>
            <div className={styles.logoWrapper}>
              <img src="/logo.png" alt="Kiddiewise School Complex" className={styles.logoImage} />
              <h3 className={styles.brandTitle}>Kiddiewise School Complex</h3>
            </div>
            <p className={styles.brandDescription}>
              Empowering young minds with quality education and holistic development in a nurturing environment.
            </p>
            <div className={styles.socialLinks}>
              <a href="#" className={styles.socialLink} aria-label="Facebook">
                <span className={styles.socialIcon}>📘</span>
              </a>
              <a href="#" className={styles.socialLink} aria-label="Instagram">
                <span className={styles.socialIcon}>📷</span>
              </a>
              <a href="#" className={styles.socialLink} aria-label="Twitter">
                <span className={styles.socialIcon}>🐦</span>
              </a>
              <a href="#" className={styles.socialLink} aria-label="LinkedIn">
                <span className={styles.socialIcon}>💼</span>
              </a>
            </div>
          </div>

          <div>
            <h4 className={styles.columnTitle}>Quick Links</h4>
            <ul className={styles.linkList}>
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className={styles.link}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className={styles.columnTitle}>Services</h4>
            <ul className={styles.linkList}>
              {services.map((service, index) => (
                <li key={index}>
                  <a
                    href={service.href}
                    className={styles.link}
                  >
                    {service.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className={styles.columnTitle}>Contact Info</h4>
            <ul className={styles.contactList}>
              {contactInfo.map((info, index) => (
                <li key={index} className={styles.contactItem}>
                  <span className={styles.contactIcon}>{info.icon}</span>
                  <div>
                    <div className={styles.contactLabel}>{info.label}</div>
                    <div className={styles.contactValue}>{info.value}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className={styles.divider}></div>
        
        <div className={styles.bottomBar}>
          <p className={styles.copyright}>
            © {currentYear} Kiddiewise School Complex. All rights reserved.
          </p>
          <div className={styles.legalLinks}>
            <a href="#" className={styles.legalLink}>
              Privacy Policy
            </a>
            <a href="#" className={styles.legalLink}>
              Terms of Service
            </a>
            <a href="#" className={styles.legalLink}>
              Accessibility
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}