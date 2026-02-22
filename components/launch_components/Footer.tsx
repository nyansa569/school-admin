import styles from './Footer.module.css';

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
  { label: "Admissions", href: "#" },
  { label: "Financial Aid", href: "#" },
  { label: "Transportation", href: "#" },
  { label: "Cafeteria", href: "#" },
];

const contactInfo = [
  { label: "Phone", value: "(555) 123-4567", icon: "📞" },
  { label: "Email", value: "info@springfieldacademy.edu", icon: "✉️" },
  { label: "Address", value: "123 Education Lane, Springfield, ST 12345", icon: "📍" },
];

export function Footer({ className }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`${styles.footer} ${className || ''}`}>
      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.brandSection}>
            <h3 className={styles.brandTitle}>Springfield Academy</h3>
            <p className={styles.brandDescription}>
              Empowering students with quality education and holistic development for over 50 years.
            </p>
            <div className={styles.socialLinks}>
              {["📘", "📷", "📺", "💼"].map((social, index) => (
                <a
                  key={index}
                  href="#"
                  className={styles.socialLink}
                >
                  <span className={styles.socialIcon}>{social}</span>
                </a>
              ))}
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
            © {currentYear} Springfield Academy. All rights reserved. Developed by Nyansa
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