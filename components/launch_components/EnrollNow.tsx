// components/launch_components/EnrollNow.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { submitEnrollment, getAvailableClasses, getAcademicYears, getCurrentAcademicYear, getAvailableDepartments } from "@/lib/action/launch/enrollment";
import styles from "./EnrollNow.module.css";

interface ClassOption {
  id: number;
  name: string;
  level: string;
  sequence: number;
}

interface DepartmentOption {
  id: number;
  name: string;
  dep_code: string;
}

interface AcademicYearOption {
  id: number;
  year: number;
  name: string;
  is_active: boolean;
}

type TabStep = 1 | 2 | 3 | 4 | 5;

interface EnrollNowProps {
  className?: string;
}

export function EnrollNow({ className }: EnrollNowProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentTab, setCurrentTab] = useState<TabStep>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  
  // Dropdown data
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYearOption[]>([]);
  const [defaultYearId, setDefaultYearId] = useState<number | null>(null);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  
  const sectionRef = useRef<HTMLElement>(null);
  
  const [formData, setFormData] = useState({
    // Applicant (Child)
    applicant_first_name: "",
    applicant_last_name: "",
    applicant_other_names: "",
    applicant_gender: "",
    applicant_dob: "",
    // Contact
    contact_email: "",
    contact_phone: "",
    contact_address: "",
    contact_city: "",
    contact_town: "",
    // Guardian
    guardian_first_name: "",
    guardian_last_name: "",
    guardian_relationship: "",
    guardian_email: "",
    guardian_phone: "",
    // Previous School (optional)
    prev_school_name: "",
    prev_school_class: "",
    prev_school_score: "",
    // Program Selection
    applying_class_id: "",
    applying_department_id: "",
    academic_year_id: "",
    // Payment (optional)
    payment_amount: "",
    payment_channel: "cash",
    // Additional
    admission_type: "online",
    remarks: "",
  });

  // Tab configuration
  const tabs = [
    { id: 1, name: "Child Info", icon: "👶" },
    { id: 2, name: "Guardian Info", icon: "👨‍👩‍👧" },
    { id: 3, name: "Contact Info", icon: "📞" },
    { id: 4, name: "Program & School", icon: "📚" },
    { id: 5, name: "Review & Submit", icon: "✅" },
  ];

  // Check if a tab is completed
  const isTabCompleted = (tabId: TabStep): boolean => {
    switch (tabId) {
      case 1: // Child Info
        return !!(formData.applicant_first_name && formData.applicant_last_name && formData.applicant_gender && formData.applicant_dob);
      case 2: // Guardian Info
        return !!(formData.guardian_first_name && formData.guardian_last_name && formData.guardian_relationship);
      case 3: // Contact Info
        return !!(formData.contact_phone);
      case 4: // Program & School
        return !!(formData.applying_class_id && formData.academic_year_id);
      case 5: // Review - always return true as it just shows summary
        return true;
      default:
        return false;
    }
  };

  // Get all completed tabs
  const getCompletedTabs = (): TabStep[] => {
    return tabs.filter(tab => isTabCompleted(tab.id as TabStep)).map(tab => tab.id as TabStep);
  };

  // Handle next tab
  const handleNext = () => {
    if (currentTab < 5) {
      const nextTab = (currentTab + 1) as TabStep;
      setCurrentTab(nextTab);
      window.scrollTo({ top: sectionRef.current?.offsetTop || 0, behavior: 'smooth' });
    }
  };

  // Handle previous tab
  const handlePrevious = () => {
    if (currentTab > 1) {
      const prevTab = (currentTab - 1) as TabStep;
      setCurrentTab(prevTab);
      window.scrollTo({ top: sectionRef.current?.offsetTop || 0, behavior: 'smooth' });
    }
  };

  // Handle tab click navigation
  const handleTabClick = (tabId: TabStep) => {
    // Can only navigate to completed tabs or current tab
    if (tabId === currentTab || (tabId < currentTab && isTabCompleted(tabId))) {
      setCurrentTab(tabId);
    }
  };

  // Load dropdown options on mount
  useEffect(() => {
    const loadOptions = async () => {
      setIsLoadingOptions(true);
      try {
        const [classesResult, departmentsResult, yearsResult, currentYearResult] = await Promise.all([
          getAvailableClasses(),
          getAvailableDepartments(),
          getAcademicYears(),
          getCurrentAcademicYear(),
        ]);
        
        if (classesResult.classes) setClasses(classesResult.classes);
        if (departmentsResult.departments) setDepartments(departmentsResult.departments);
        if (yearsResult.years) setAcademicYears(yearsResult.years);
        if (currentYearResult.year) setDefaultYearId(currentYearResult.year.id);
        
        // Set default academic year to current active year
        if (currentYearResult.year) {
          setFormData(prev => ({ ...prev, academic_year_id: currentYearResult.year.id.toString() }));
        } else if (yearsResult.years && yearsResult.years.length > 0) {
          setFormData(prev => ({ ...prev, academic_year_id: yearsResult.years[0].id.toString() }));
        }
      } catch (error) {
        console.error("Failed to load form options:", error);
      } finally {
        setIsLoadingOptions(false);
      }
    };
    
    loadOptions();
  }, []);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (errorMessage) setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    // Final validation before submit
    if (!formData.applicant_first_name || !formData.applicant_last_name || !formData.applicant_gender || !formData.applicant_dob) {
      setErrorMessage("Please fill in all required child information fields");
      setIsSubmitting(false);
      setCurrentTab(1);
      return;
    }
    
    if (!formData.guardian_first_name || !formData.guardian_last_name || !formData.guardian_relationship) {
      setErrorMessage("Please fill in all required guardian information fields");
      setIsSubmitting(false);
      setCurrentTab(2);
      return;
    }
    
    if (!formData.contact_phone) {
      setErrorMessage("Please provide a contact phone number");
      setIsSubmitting(false);
      setCurrentTab(3);
      return;
    }
    
    if (!formData.applying_class_id) {
      setErrorMessage("Please select a program/class");
      setIsSubmitting(false);
      setCurrentTab(4);
      return;
    }

    // Create FormData object for server action
    const submitFormData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        submitFormData.append(key, value.toString());
      }
    });

    const result = await submitEnrollment(submitFormData);

    if (result.success) {
      setApplicationId(result.applicationId || null);
      setIsSubmitting(false);
      setIsSubmitted(true);
    } else {
      setErrorMessage(result.error || "Failed to submit enrollment. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setApplicationId(null);
    setCurrentTab(1);
    setErrorMessage(null);
    setFormData({
      applicant_first_name: "",
      applicant_last_name: "",
      applicant_other_names: "",
      applicant_gender: "",
      applicant_dob: "",
      contact_email: "",
      contact_phone: "",
      contact_address: "",
      contact_city: "",
      contact_town: "",
      guardian_first_name: "",
      guardian_last_name: "",
      guardian_relationship: "",
      guardian_email: "",
      guardian_phone: "",
      prev_school_name: "",
      prev_school_class: "",
      prev_school_score: "",
      applying_class_id: "",
      applying_department_id: "",
      academic_year_id: defaultYearId?.toString() || "",
      payment_amount: "",
      payment_channel: "cash",
      admission_type: "online",
      remarks: "",
    });
  };

  const genderOptions = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Other" },
  ];

  const relationshipOptions = [
    { value: "Father", label: "Father" },
    { value: "Mother", label: "Mother" },
    { value: "Guardian", label: "Guardian" },
    { value: "Grandparent", label: "Grandparent" },
    { value: "Other", label: "Other" },
  ];

  const paymentChannels = [
    { value: "cash", label: "Cash" },
    { value: "card", label: "Card" },
    { value: "mobile_money", label: "Mobile Money" },
    { value: "bank_transfer", label: "Bank Transfer" },
  ];

  // Render Tab 1: Child Information
  const renderChildInfoTab = () => (
    <div className={styles.tabContent}>
      <div className={styles.formSection}>
        <h4 className={styles.sectionTitle}>Child Information</h4>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="applicant_first_name">First Name *</label>
            <input
              type="text"
              id="applicant_first_name"
              name="applicant_first_name"
              value={formData.applicant_first_name}
              onChange={handleChange}
              required
              placeholder="Enter child's first name"
              disabled={isSubmitting}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="applicant_last_name">Last Name *</label>
            <input
              type="text"
              id="applicant_last_name"
              name="applicant_last_name"
              value={formData.applicant_last_name}
              onChange={handleChange}
              required
              placeholder="Enter child's last name"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="applicant_other_names">Other Names</label>
            <input
              type="text"
              id="applicant_other_names"
              name="applicant_other_names"
              value={formData.applicant_other_names}
              onChange={handleChange}
              placeholder="Middle name(s) if any"
              disabled={isSubmitting}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="applicant_gender">Gender *</label>
            <select
              id="applicant_gender"
              name="applicant_gender"
              value={formData.applicant_gender}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            >
              <option value="">Select gender</option>
              {genderOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="applicant_dob">Date of Birth *</label>
            <input
              type="date"
              id="applicant_dob"
              name="applicant_dob"
              value={formData.applicant_dob}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />
          </div>
        </div>
      </div>
    </div>
  );

  // Render Tab 2: Guardian Information
  const renderGuardianInfoTab = () => (
    <div className={styles.tabContent}>
      <div className={styles.formSection}>
        <h4 className={styles.sectionTitle}>Parent/Guardian Information</h4>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="guardian_first_name">First Name *</label>
            <input
              type="text"
              id="guardian_first_name"
              name="guardian_first_name"
              value={formData.guardian_first_name}
              onChange={handleChange}
              required
              placeholder="Enter guardian's first name"
              disabled={isSubmitting}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="guardian_last_name">Last Name *</label>
            <input
              type="text"
              id="guardian_last_name"
              name="guardian_last_name"
              value={formData.guardian_last_name}
              onChange={handleChange}
              required
              placeholder="Enter guardian's last name"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="guardian_relationship">Relationship to Child *</label>
            <select
              id="guardian_relationship"
              name="guardian_relationship"
              value={formData.guardian_relationship}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            >
              <option value="">Select relationship</option>
              {relationshipOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="guardian_email">Email</label>
            <input
              type="email"
              id="guardian_email"
              name="guardian_email"
              value={formData.guardian_email}
              onChange={handleChange}
              placeholder="guardian@example.com"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="guardian_phone">Phone Number</label>
            <input
              type="tel"
              id="guardian_phone"
              name="guardian_phone"
              value={formData.guardian_phone}
              onChange={handleChange}
              placeholder="+233 54 XXX XXXX"
              disabled={isSubmitting}
            />
          </div>
        </div>
      </div>
    </div>
  );

  // Render Tab 3: Contact Information
  const renderContactInfoTab = () => (
    <div className={styles.tabContent}>
      <div className={styles.formSection}>
        <h4 className={styles.sectionTitle}>Contact Information</h4>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="contact_email">Email</label>
            <input
              type="email"
              id="contact_email"
              name="contact_email"
              value={formData.contact_email}
              onChange={handleChange}
              placeholder="contact@example.com"
              disabled={isSubmitting}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="contact_phone">Phone Number *</label>
            <input
              type="tel"
              id="contact_phone"
              name="contact_phone"
              value={formData.contact_phone}
              onChange={handleChange}
              required
              placeholder="+233 54 XXX XXXX"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="contact_address">Address</label>
            <input
              type="text"
              id="contact_address"
              name="contact_address"
              value={formData.contact_address}
              onChange={handleChange}
              placeholder="Street address"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="contact_city">City</label>
            <input
              type="text"
              id="contact_city"
              name="contact_city"
              value={formData.contact_city}
              onChange={handleChange}
              placeholder="Accra"
              disabled={isSubmitting}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="contact_town">Town</label>
            <input
              type="text"
              id="contact_town"
              name="contact_town"
              value={formData.contact_town}
              onChange={handleChange}
              placeholder="Oyarifa"
              disabled={isSubmitting}
            />
          </div>
        </div>
      </div>
    </div>
  );

  // Render Tab 4: Program & Previous School
  const renderProgramSchoolTab = () => (
    <div className={styles.tabContent}>
      {/* Program Selection */}
      <div className={styles.formSection}>
        <h4 className={styles.sectionTitle}>Program Selection</h4>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="applying_class_id">Select Class/Program *</label>
            <select
              id="applying_class_id"
              name="applying_class_id"
              value={formData.applying_class_id}
              onChange={handleChange}
              required
              disabled={isSubmitting || isLoadingOptions}
            >
              <option value="">Select a program</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} {cls.level === "junior" ? "(Junior)" : cls.level === "senior" ? "(Senior)" : ""}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="applying_department_id">Department (Optional)</label>
            <select
              id="applying_department_id"
              name="applying_department_id"
              value={formData.applying_department_id}
              onChange={handleChange}
              disabled={isSubmitting || isLoadingOptions}
            >
              <option value="">Select department</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="academic_year_id">Academic Year *</label>
            <select
              id="academic_year_id"
              name="academic_year_id"
              value={formData.academic_year_id}
              onChange={handleChange}
              required
              disabled={isSubmitting || isLoadingOptions}
            >
              <option value="">Select academic year</option>
              {academicYears.map(year => (
                <option key={year.id} value={year.id}>
                  {year.name} {year.is_active ? "(Current)" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Previous School */}
      <div className={styles.formSection}>
        <h4 className={styles.sectionTitle}>Previous School (Optional)</h4>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="prev_school_name">School Name</label>
            <input
              type="text"
              id="prev_school_name"
              name="prev_school_name"
              value={formData.prev_school_name}
              onChange={handleChange}
              placeholder="Previous school name"
              disabled={isSubmitting}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="prev_school_class">Class Ended</label>
            <input
              type="text"
              id="prev_school_class"
              name="prev_school_class"
              value={formData.prev_school_class}
              onChange={handleChange}
              placeholder="e.g., Class 5"
              disabled={isSubmitting}
            />
          </div>
        </div>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="prev_school_score">Average Score (%)</label>
            <input
              type="number"
              id="prev_school_score"
              name="prev_school_score"
              value={formData.prev_school_score}
              onChange={handleChange}
              placeholder="e.g., 85"
              min="0"
              max="100"
              step="1"
              disabled={isSubmitting}
            />
          </div>
        </div>
      </div>

      {/* Payment Section */}
      <div className={styles.formSection}>
        <h4 className={styles.sectionTitle}>Application Fee (Optional)</h4>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="payment_amount">Amount (GHS)</label>
            <input
              type="number"
              id="payment_amount"
              name="payment_amount"
              value={formData.payment_amount}
              onChange={handleChange}
              placeholder="e.g., 100"
              min="0"
              step="1"
              disabled={isSubmitting}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="payment_channel">Payment Method</label>
            <select
              id="payment_channel"
              name="payment_channel"
              value={formData.payment_channel}
              onChange={handleChange}
              disabled={isSubmitting}
            >
              {paymentChannels.map(ch => (
                <option key={ch.value} value={ch.value}>{ch.label}</option>
              ))}
            </select>
          </div>
        </div>
        <p className={styles.fieldNote}>Application fee payment can be completed after submission. Our team will contact you.</p>
      </div>
    </div>
  );

  // Render Tab 5: Review & Submit
  const renderReviewTab = () => (
    <div className={styles.tabContent}>
      <div className={styles.reviewSection}>
        <h4 className={styles.reviewTitle}>Review Your Application</h4>
        <p className={styles.reviewSubtitle}>Please review all information before submitting</p>

        {/* Child Information Review */}
        <div className={styles.reviewCard}>
          <h5 className={styles.reviewCardTitle}>Child Information</h5>
          <div className={styles.reviewGrid}>
            <div><strong>Full Name:</strong> {formData.applicant_first_name} {formData.applicant_last_name} {formData.applicant_other_names && `(${formData.applicant_other_names})`}</div>
            <div><strong>Gender:</strong> {genderOptions.find(g => g.value === formData.applicant_gender)?.label || formData.applicant_gender}</div>
            <div><strong>Date of Birth:</strong> {formData.applicant_dob || "Not provided"}</div>
          </div>
        </div>

        {/* Guardian Information Review */}
        <div className={styles.reviewCard}>
          <h5 className={styles.reviewCardTitle}>Guardian Information</h5>
          <div className={styles.reviewGrid}>
            <div><strong>Name:</strong> {formData.guardian_first_name} {formData.guardian_last_name}</div>
            <div><strong>Relationship:</strong> {formData.guardian_relationship}</div>
            <div><strong>Email:</strong> {formData.guardian_email || "Not provided"}</div>
            <div><strong>Phone:</strong> {formData.guardian_phone || "Not provided"}</div>
          </div>
        </div>

        {/* Contact Information Review */}
        <div className={styles.reviewCard}>
          <h5 className={styles.reviewCardTitle}>Contact Information</h5>
          <div className={styles.reviewGrid}>
            <div><strong>Email:</strong> {formData.contact_email || "Not provided"}</div>
            <div><strong>Phone:</strong> {formData.contact_phone}</div>
            <div><strong>Address:</strong> {formData.contact_address || "Not provided"}</div>
            <div><strong>City/Town:</strong> {formData.contact_city || formData.contact_town || "Not provided"}</div>
          </div>
        </div>

        {/* Program Selection Review */}
        <div className={styles.reviewCard}>
          <h5 className={styles.reviewCardTitle}>Program Selection</h5>
          <div className={styles.reviewGrid}>
            <div><strong>Class/Program:</strong> {classes.find(c => c.id.toString() === formData.applying_class_id)?.name || "Not selected"}</div>
            <div><strong>Department:</strong> {departments.find(d => d.id.toString() === formData.applying_department_id)?.name || "Not selected"}</div>
            <div><strong>Academic Year:</strong> {academicYears.find(y => y.id.toString() === formData.academic_year_id)?.name || "Not selected"}</div>
          </div>
        </div>

        {/* Previous School Review */}
        {(formData.prev_school_name || formData.prev_school_class || formData.prev_school_score) && (
          <div className={styles.reviewCard}>
            <h5 className={styles.reviewCardTitle}>Previous School</h5>
            <div className={styles.reviewGrid}>
              <div><strong>School Name:</strong> {formData.prev_school_name || "Not provided"}</div>
              <div><strong>Class Ended:</strong> {formData.prev_school_class || "Not provided"}</div>
              <div><strong>Average Score:</strong> {formData.prev_school_score ? `${formData.prev_school_score}%` : "Not provided"}</div>
            </div>
          </div>
        )}

        {/* Payment Review */}
        {formData.payment_amount && parseFloat(formData.payment_amount) > 0 && (
          <div className={styles.reviewCard}>
            <h5 className={styles.reviewCardTitle}>Application Fee</h5>
            <div className={styles.reviewGrid}>
              <div><strong>Amount:</strong> GHS {formData.payment_amount}</div>
              <div><strong>Payment Method:</strong> {paymentChannels.find(p => p.value === formData.payment_channel)?.label || formData.payment_channel}</div>
            </div>
          </div>
        )}

        {/* Remarks */}
        {formData.remarks && (
          <div className={styles.reviewCard}>
            <h5 className={styles.reviewCardTitle}>Additional Remarks</h5>
            <div className={styles.reviewGrid}>
              <div><strong>Remarks:</strong> {formData.remarks}</div>
            </div>
          </div>
        )}

        <div className={styles.reviewNotice}>
          <span className={styles.reviewNoticeIcon}>⚠️</span>
          <p>Please ensure all information is correct before submitting. You will not be able to edit after submission.</p>
        </div>
      </div>
    </div>
  );

  return (
    <section id="enroll" ref={sectionRef} className={`${styles.enroll} ${className || ""}`}>
      <div className={styles.container}>
        <div className={`${styles.header} ${isVisible ? styles.visible : ""}`}>
          <span className={styles.sectionTag}>Start Your Journey</span>
          <h2 className={styles.title}>
            Enroll Your Child
            <span className={styles.titleHighlight}> Today</span>
          </h2>
          <p className={styles.subtitle}>
            Give your child the gift of quality education. Join the Kiddiewise School Complex family.
          </p>
          <div className={styles.titleUnderline}></div>
        </div>

        <div className={`${styles.content} ${isVisible ? styles.visible : ""}`}>
          {/* Left Side - Benefits */}
          <div className={styles.benefits}>
            <div className={styles.benefitsCard}>
              <h3 className={styles.benefitsTitle}>Why Choose Kiddiewise?</h3>
              <ul className={styles.benefitsList}>
                <li className={styles.benefitItem}>
                  <div className={styles.benefitIcon}>✅</div>
                  <div>
                    <strong>Licensed & Accredited</strong>
                    <p>Recognized by the Ministry of Education, Ghana</p>
                  </div>
                </li>
                <li className={styles.benefitItem}>
                  <div className={styles.benefitIcon}>👨‍🏫</div>
                  <div>
                    <strong>Qualified Teachers</strong>
                    <p>Experienced and passionate educators</p>
                  </div>
                </li>
                <li className={styles.benefitItem}>
                  <div className={styles.benefitIcon}>🏫</div>
                  <div>
                    <strong>Modern Facilities</strong>
                    <p>Safe, secure, and conducive learning environment</p>
                  </div>
                </li>
                <li className={styles.benefitItem}>
                  <div className={styles.benefitIcon}>📚</div>
                  <div>
                    <strong>Ghanaian & International Curriculum</strong>
                    <p>Blend of local and global best practices</p>
                  </div>
                </li>
                <li className={styles.benefitItem}>
                  <div className={styles.benefitIcon}>🚌</div>
                  <div>
                    <strong>Transport Services</strong>
                    <p>Safe and reliable school bus service</p>
                  </div>
                </li>
                <li className={styles.benefitItem}>
                  <div className={styles.benefitIcon}>🍎</div>
                  <div>
                    <strong>Nutritious Meals</strong>
                    <p>Healthy, balanced meals provided daily</p>
                  </div>
                </li>
              </ul>

              <div className={styles.contactInfo}>
                <div className={styles.contactItem}>
                  <span className={styles.contactIcon}>📞</span>
                  <div>
                    <strong>Call Us</strong>
                    <p>+233 54 179 0780</p>
                  </div>
                </div>
                <div className={styles.contactItem}>
                  <span className={styles.contactIcon}>✉️</span>
                  <div>
                    <strong>Email</strong>
                    <p>kiddiewise2012@gmail.com</p>
                  </div>
                </div>
                <div className={styles.contactItem}>
                  <span className={styles.contactIcon}>📍</span>
                  <div>
                    <strong>Visit Us</strong>
                    <p>Oyarifa Road (Off Container Junction), Accra, Ghana</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Enrollment Form with Tabs */}
          <div className={styles.formContainer}>
            <div className={styles.formCard}>
              <div className={styles.formHeader}>
                <h3 className={styles.formTitle}>Enrollment Form</h3>
                <p className={styles.formSubtitle}>Fill in the details below to begin the admission process</p>
              </div>

              {isSubmitted ? (
                <div className={styles.successMessage}>
                  <div className={styles.successIcon}>🎉</div>
                  <h4>Enrollment Request Sent Successfully!</h4>
                  {applicationId && (
                    <p className={styles.applicationId}>
                      Your Application ID: <strong>{applicationId}</strong>
                    </p>
                  )}
                  <p>Thank you for choosing Kiddiewise School Complex. Our admissions team will contact you within 24 hours.</p>
                  <button className={styles.resetButton} onClick={handleReset}>
                    Submit Another Request
                  </button>
                </div>
              ) : (
                <>
                  {/* Tab Navigation */}
                  <div className={styles.tabs}>
                    {tabs.map((tab) => {
                      const isCompleted = isTabCompleted(tab.id as TabStep);
                      const isActive = currentTab === tab.id;
                      const isClickable = isCompleted || tab.id === currentTab;
                      
                      return (
                        <button
                          key={tab.id}
                          className={`${styles.tab} ${isActive ? styles.tabActive : ""} ${isCompleted ? styles.tabCompleted : ""}`}
                          onClick={() => handleTabClick(tab.id as TabStep)}
                          disabled={!isClickable}
                          type="button"
                        >
                          <span className={styles.tabIcon}>{tab.icon}</span>
                          <span className={styles.tabName}>{tab.name}</span>
                          {isCompleted && !isActive && (
                            <span className={styles.tabCheck}>✓</span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Tab Content */}
                  <form onSubmit={handleSubmit} className={styles.form}>
                    {errorMessage && (
                      <div className={styles.errorMessage}>
                        <span className={styles.errorIcon}>⚠️</span>
                        {errorMessage}
                      </div>
                    )}

                    {currentTab === 1 && renderChildInfoTab()}
                    {currentTab === 2 && renderGuardianInfoTab()}
                    {currentTab === 3 && renderContactInfoTab()}
                    {currentTab === 4 && renderProgramSchoolTab()}
                    {currentTab === 5 && renderReviewTab()}

                    {/* Navigation Buttons */}
                    <div className={styles.navigationButtons}>
                      {currentTab > 1 && (
                        <button
                          type="button"
                          className={styles.prevButton}
                          onClick={handlePrevious}
                          disabled={isSubmitting}
                        >
                          ← Previous
                        </button>
                      )}
                      
                      {currentTab < 5 ? (
                        <button
                          type="button"
                          className={styles.nextButton}
                          onClick={handleNext}
                          disabled={!isTabCompleted(currentTab) || isSubmitting}
                        >
                          Next →
                        </button>
                      ) : (
                        <button
                          type="submit"
                          className={styles.submitButton}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <span className={styles.spinner}></span>
                              Submitting...
                            </>
                          ) : (
                            <>
                              Submit Application
                              <svg className={styles.buttonIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    <p className={styles.formNote}>
                      By submitting this form, you agree to our privacy policy and consent to be contacted by our admissions team.
                    </p>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}