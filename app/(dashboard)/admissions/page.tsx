// app/(dashboard)/admissions/page.tsx
"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import styles from "./admissions.module.css";
import Table from "@/components/Table/Table";
import StatFilter from "@/components/StatFilter/StatFilter";
import Stats from "@/components/Stats/Stats";
import Header from "@/components/Header/Header";
import {
  getAdmissions,
  createAdmission,
  updateAdmission,
  deleteAdmission,
  reviewAdmission,
  approveAdmission,
  declineAdmission,
  getAdmissionStats,
  getClasses,
  getDepartments,
  getAcademicYears,
} from "@/lib/action/admin/admission";
import { getAdminProfile, AdminProfile } from "@/lib/action/admin/profile";
import { Action } from "@/components/Table/Table";
import { exportToCSV } from "@/utils/export/csv";
import { exportToPDF } from "@/utils/export/pdf";

type AdmissionStatus = "pending" | "reviewing" | "approved" | "declined" | "enrolled";

const AdmissionsAdminPage = () => {
  const [admissions, setAdmissions] = useState<any[]>([]);
  const [filteredAdmissions, setFilteredAdmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Dropdown data
  const [stats, setStats] = useState<any>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create");
  const [currentAdmission, setCurrentAdmission] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [admissionToDelete, setAdmissionToDelete] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"applicant" | "guardian" | "academic" | "payment">("applicant");

  // Form state
  const [formData, setFormData] = useState({
    // Applicant
    applicant_first_name: "",
    applicant_last_name: "",
    applicant_other_names: "",
    applicant_gender: "Male",
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
    guardian_relationship: "Mother",
    guardian_email: "",
    guardian_phone: "",
    guardian_occupation: "",
    // Previous School
    prev_school_name: "",
    prev_school_class: "",
    prev_school_score: "",
    prev_school_year: "",
    // Academic
    applying_class: "",
    applying_department: "",
    academic_year: "",
    preferred_session: "morning",
    admission_type: "regular",
    remarks: "",
    // Payment
    payment_amount: "",
    payment_reference: "",
    payment_channel: "cash",
  });

  // Load admin profile
  useEffect(() => {
    const loadAdminProfile = async () => {
      const { profile } = await getAdminProfile();
      if (profile) setAdminProfile(profile);
    };
    loadAdminProfile();
  }, []);

  // Load all data
  useEffect(() => {
    loadData();
    loadFilters();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [admissionsResult, statsResult] = await Promise.all([
      getAdmissions(),
      getAdmissionStats(),
    ]);
    
    if (admissionsResult.admissions) {
      setAdmissions(admissionsResult.admissions);
      setFilteredAdmissions(admissionsResult.admissions);
    }
    
    if (statsResult.stats) {
      setStats(statsResult.stats);
    }
    setLoading(false);
  };

  const loadFilters = async () => {
    setLoadingDropdowns(true);
    const [classesResult, departmentsResult, yearsResult] = await Promise.all([
      getClasses(),
      getDepartments(),
      getAcademicYears(),
    ]);
    
    if (classesResult.classes) setClasses(classesResult.classes);
    if (departmentsResult.departments) setDepartments(departmentsResult.departments);
    if (yearsResult.years) setAcademicYears(yearsResult.years);
    setLoadingDropdowns(false);
  };

  // ============================================
  // EXPORT FUNCTIONALITY
  // ============================================

  const getExportColumns = () => [
    {
      header: "Application Number",
      accessor: (row: any) => row.application_number || "—",
    },
    {
      header: "Applicant Name",
      accessor: (row: any) => row.applicant ? `${row.applicant.first_name} ${row.applicant.last_name}` : "—",
    },
    {
      header: "Other Names",
      accessor: (row: any) => row.applicant?.other_names || "—",
    },
    {
      header: "Gender",
      accessor: (row: any) => row.applicant?.gender || "—",
    },
    {
      header: "Date of Birth",
      accessor: (row: any) => row.applicant?.date_of_birth ? new Date(row.applicant.date_of_birth).toLocaleDateString() : "—",
    },
    {
      header: "Email",
      accessor: (row: any) => row.contact?.email || "—",
    },
    {
      header: "Phone",
      accessor: (row: any) => row.contact?.phone || "—",
    },
    {
      header: "Address",
      accessor: (row: any) => row.contact?.address || "—",
    },
    {
      header: "Guardian Name",
      accessor: (row: any) => row.guardian ? `${row.guardian.first_name} ${row.guardian.last_name}` : "—",
    },
    {
      header: "Guardian Relationship",
      accessor: (row: any) => row.guardian?.relationship || "—",
    },
    {
      header: "Guardian Phone",
      accessor: (row: any) => row.guardian?.phone || "—",
    },
    {
      header: "Guardian Email",
      accessor: (row: any) => row.guardian?.email || "—",
    },
    {
      header: "Guardian Occupation",
      accessor: (row: any) => row.guardian?.occupation || "—",
    },
    {
      header: "Previous School",
      accessor: (row: any) => row.prev_school?.name || "—",
    },
    {
      header: "Previous Class",
      accessor: (row: any) => row.prev_school?.class_ended || "—",
    },
    {
      header: "Previous Score (%)",
      accessor: (row: any) => row.prev_school?.average_score?.toString() || "—",
    },
    {
      header: "Previous Year",
      accessor: (row: any) => row.prev_school?.year_attended?.toString() || "—",
    },
    {
      header: "Applying Class",
      accessor: (row: any) => row.applying_for_details?.class?.name || "—",
    },
    {
      header: "Department",
      accessor: (row: any) => row.applying_for_details?.department?.name || "—",
    },
    {
      header: "Academic Year",
      accessor: (row: any) => row.applying_for_details?.academic_year ? `${row.applying_for_details.academic_year.year} - ${row.applying_for_details.academic_year.name}` : "—",
    },
    {
      header: "Preferred Session",
      accessor: (row: any) => row.applying_for_details?.preferred_session || "morning",
    },
    {
      header: "Admission Type",
      accessor: (row: any) => row.admission_type || "regular",
    },
    {
      header: "Status",
      accessor: (row: any) => row.status || "pending",
    },
    {
      header: "Payment Amount (₵)",
      accessor: (row: any) => row.payment?.amount?.toString() || "—",
    },
    {
      header: "Payment Channel",
      accessor: (row: any) => row.payment?.channel || "—",
    },
    {
      header: "Payment Status",
      accessor: (row: any) => row.payment?.status || "pending",
    },
    {
      header: "Payment Reference",
      accessor: (row: any) => row.payment?.payment_reference || "—",
    },
    {
      header: "Submitted Date",
      accessor: (row: any) => new Date(row.created_at).toLocaleDateString(),
    },
    {
      header: "Reviewed Date",
      accessor: (row: any) => row.timeline?.reviewed_at ? new Date(row.timeline.reviewed_at).toLocaleDateString() : "—",
    },
    {
      header: "Reviewed By",
      accessor: (row: any) => row.timeline?.reviewed_by || "—",
    },
    {
      header: "Approved Date",
      accessor: (row: any) => row.timeline?.approved_at ? new Date(row.timeline.approved_at).toLocaleDateString() : "—",
    },
    {
      header: "Approved By",
      accessor: (row: any) => row.timeline?.approved_by || "—",
    },
    {
      header: "Remarks",
      accessor: (row: any) => row.remarks || "—",
    },
  ];

  const handleExport = useCallback(async (format: "pdf" | "csv") => {
    const dataToExport = filteredAdmissions.length > 0 ? filteredAdmissions : admissions;

    if (dataToExport.length === 0) {
      alert("No data to export");
      return;
    }

    const columns = getExportColumns();
    const filename = `admissions-${new Date().toISOString().split("T")[0]}`;

    if (format === "csv") {
      exportToCSV(dataToExport, columns, { filename });
    } else {
      await exportToPDF(dataToExport, columns, {
        filename,
        title: "Admissions Management Report",
        subtitle: `Total Applications: ${dataToExport.length} | Generated on ${new Date().toLocaleDateString()}`,
        orientation: "landscape",
      });
    }
  }, [filteredAdmissions, admissions]);

  // ============================================
  // END EXPORT FUNCTIONALITY
  // ============================================

  // Stats for dashboard
  const dashboardStats = useMemo(() => {
    if (!stats) return [];
    return [
      { id: 1, label: "Total Applications", value: stats.total, color: "blue", type: "students" },
      { id: 2, label: "Pending", value: stats.pending, color: "orange", type: "classes" },
      { id: 3, label: "Approved", value: stats.approved, color: "green", type: "students" },
      { id: 4, label: "Enrolled", value: stats.enrolled, color: "purple", type: "revenue" },
    ];
  }, [stats]);

  // Table columns
  const columns = [
    {
      header: "App. Number",
      accessor: "application_number",
      sortable: true,
      width: "140px",
      render: (row: any) => (
        <span className={styles.appNumber}>{row.application_number}</span>
      ),
    },
    {
      header: "Applicant",
      accessor: "applicant",
      sortable: true,
      render: (row: any) => (
        <div className={styles.applicantCell}>
          <div className={styles.applicantAvatar}>
            {row.applicant?.first_name?.[0]}{row.applicant?.last_name?.[0]}
          </div>
          <div>
            <div className={styles.applicantName}>
              {row.applicant?.first_name} {row.applicant?.last_name}
            </div>
            <div className={styles.applicantInfo}>
              {row.applicant?.gender || ""} {row.applicant?.other_names ? `• ${row.applicant.other_names}` : ""}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Contact",
      accessor: "contact",
      width: "180px",
      render: (row: any) => (
        <div className={styles.contactCell}>
          <div className={styles.contactEmail}>{row.contact?.email || "—"}</div>
          <div className={styles.contactPhone}>{row.contact?.phone || "—"}</div>
        </div>
      ),
    },
    {
      header: "Applying For",
      accessor: "applying_for_details",
      sortable: true,
      width: "160px",
      render: (row: any) => (
        <div className={styles.applyingCell}>
          <span className={styles.className}>{row.applying_for_details?.class?.name || "—"}</span>
          <span className={styles.deptName}>{row.applying_for_details?.department?.name || "—"}</span>
        </div>
      ),
    },
    {
      header: "Type",
      accessor: "admission_type",
      sortable: true,
      width: "100px",
      render: (row: any) => {
        const typeColors: Record<string, string> = {
          regular: styles.typeOnline,
          scholarship: styles.typeWalkin,
          transfer: styles.typeTransfer,
          online: styles.typeOnline,
        };
        return (
          <span className={`${styles.typeBadge} ${typeColors[row.admission_type] || styles.typeOnline}`}>
            {row.admission_type}
          </span>
        );
      },
    },
    {
      header: "Status",
      accessor: "status",
      sortable: true,
      width: "130px",
      render: (row: any) => {
        const statusColors: Record<string, string> = {
          pending: styles.statusSubmitted,
          reviewing: styles.statusReview,
          approved: styles.statusApproved,
          declined: styles.statusRejected,
          enrolled: styles.statusApproved,
        };
        return (
          <span className={`${styles.statusBadge} ${statusColors[row.status]}`}>
            {row.status}
          </span>
        );
      },
    },
    {
      header: "Submitted",
      accessor: "created_at",
      sortable: true,
      width: "110px",
      render: (row: any) => (
        <span className={styles.dateText}>{new Date(row.created_at).toLocaleDateString()}</span>
      ),
    },
  ];

  // Filter options
  const filterOptions = [
    {
      label: "Status",
      value: "status",
      key: "status",
      type: "select" as const,
      options: [
        { label: "Pending", value: "pending" },
        { label: "Reviewing", value: "reviewing" },
        { label: "Approved", value: "approved" },
        { label: "Declined", value: "declined" },
        { label: "Enrolled", value: "enrolled" },
      ],
    },
    {
      label: "Admission Type",
      value: "admission_type",
      key: "admission_type",
      type: "select" as const,
      options: [
        { label: "Regular", value: "regular" },
        { label: "Scholarship", value: "scholarship" },
        { label: "Transfer", value: "transfer" },
        { label: "Online", value: "online" },
      ],
    },
  ];

  const sortOptions = [
    { label: "Name (A-Z)", value: "name-asc", key: "applicant.first_name", order: "asc" as const },
    { label: "Name (Z-A)", value: "name-desc", key: "applicant.first_name", order: "desc" as const },
    { label: "Date (Newest)", value: "date-desc", key: "created_at", order: "desc" as const },
    { label: "Date (Oldest)", value: "date-asc", key: "created_at", order: "asc" as const },
    { label: "Application No.", value: "app-no-asc", key: "application_number", order: "asc" as const },
  ];

  // CRUD Operations
  const handleCreate = () => {
    setModalMode("create");
    setActiveTab("applicant");
    setFormData({
      applicant_first_name: "",
      applicant_last_name: "",
      applicant_other_names: "",
      applicant_gender: "Male",
      applicant_dob: "",
      contact_email: "",
      contact_phone: "",
      contact_address: "",
      contact_city: "",
      contact_town: "",
      guardian_first_name: "",
      guardian_last_name: "",
      guardian_relationship: "Mother",
      guardian_email: "",
      guardian_phone: "",
      guardian_occupation: "",
      prev_school_name: "",
      prev_school_class: "",
      prev_school_score: "",
      prev_school_year: "",
      applying_class: "",
      applying_department: "",
      academic_year: "",
      preferred_session: "morning",
      admission_type: "regular",
      remarks: "",
      payment_amount: "",
      payment_reference: "",
      payment_channel: "cash",
    });
    setShowModal(true);
  };

  const handleEdit = async (admission: any) => {
    setModalMode("edit");
    setCurrentAdmission(admission);
    setFormData({
      applicant_first_name: admission.applicant?.first_name || "",
      applicant_last_name: admission.applicant?.last_name || "",
      applicant_other_names: admission.applicant?.other_names || "",
      applicant_gender: admission.applicant?.gender || "Male",
      applicant_dob: admission.applicant?.date_of_birth || "",
      contact_email: admission.contact?.email || "",
      contact_phone: admission.contact?.phone || "",
      contact_address: admission.contact?.address || "",
      contact_city: admission.contact?.city || "",
      contact_town: admission.contact?.town || "",
      guardian_first_name: admission.guardian?.first_name || "",
      guardian_last_name: admission.guardian?.last_name || "",
      guardian_relationship: admission.guardian?.relationship || "Mother",
      guardian_email: admission.guardian?.email || "",
      guardian_phone: admission.guardian?.phone || "",
      guardian_occupation: admission.guardian?.occupation || "",
      prev_school_name: admission.prev_school?.name || "",
      prev_school_class: admission.prev_school?.class_ended || "",
      prev_school_score: admission.prev_school?.average_score?.toString() || "",
      prev_school_year: admission.prev_school?.year_attended?.toString() || "",
      applying_class: admission.applying_for_details?.class_id?.toString() || "",
      applying_department: admission.applying_for_details?.department_id?.toString() || "",
      academic_year: admission.applying_for_details?.academic_year_id?.toString() || "",
      preferred_session: admission.applying_for_details?.preferred_session || "morning",
      admission_type: admission.admission_type || "regular",
      remarks: admission.remarks || "",
      payment_amount: admission.payment?.amount?.toString() || "",
      payment_reference: admission.payment?.payment_reference || "",
      payment_channel: admission.payment?.channel || "cash",
    });
    setShowModal(true);
  };

  const handleView = async (admission: any) => {
    setModalMode("view");
    setCurrentAdmission(admission);
    setShowModal(true);
  };

  const handleDelete = (admissionId: number) => {
    setAdmissionToDelete(admissionId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (admissionToDelete) {
      const result = await deleteAdmission(admissionToDelete);
      if (result.success) {
        await loadData();
      } else {
        alert(result.error);
      }
      setShowDeleteConfirm(false);
      setAdmissionToDelete(null);
    }
  };

  const handleReview = async (admissionId: number) => {
    const result = await reviewAdmission(admissionId);
    if (result.success) {
      await loadData();
      alert("Application marked as reviewing");
    } else {
      alert(result.error);
    }
  };

  const handleApprove = async (admissionId: number) => {
    const result = await approveAdmission(admissionId);
    if (result.success) {
      await loadData();
      alert(`Admission approved! Student created with admission number: ${result.admissionNumber}`);
    } else {
      alert(result.error);
    }
  };

  const handleDecline = async (admissionId: number) => {
    const reason = prompt("Please provide a reason for declining this application (optional):");
    const result = await declineAdmission(admissionId, reason || undefined);
    if (result.success) {
      await loadData();
      alert("Application declined");
    } else {
      alert(result.error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const submitFormData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value) submitFormData.append(key, value);
    });

    let result;
    if (modalMode === "create") {
      result = await createAdmission(submitFormData);
    } else if (modalMode === "edit" && currentAdmission) {
      result = await updateAdmission(currentAdmission.id, submitFormData);
    }

    if (result?.success) {
      await loadData();
      setShowModal(false);
      setCurrentAdmission(null);
      alert(modalMode === "create" ? "Application submitted successfully!" : "Application updated successfully!");
    } else if (result?.error) {
      alert(result.error);
    }
    setIsSubmitting(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Table actions
  const actions: Action<any>[] = [
    {
      label: "View",
      variant: "primary",
      onClick: (row) => handleView(row),
      icon: (
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path fill="currentColor" d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z" />
        </svg>
      ),
    },
    {
      label: "Edit",
      variant: "secondary",
      onClick: (row) => handleEdit(row),
      hidden: (row) => row.status !== "pending",
      icon: (
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path fill="currentColor" d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />
        </svg>
      ),
    },
    {
      label: "Review",
      variant: "success",
      onClick: (row) => handleReview(row.id),
      hidden: (row) => row.status !== "pending",
      icon: (
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path fill="currentColor" d="M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5c.92,0 1.82-.12 2.68-.34l-1.5-1.5c-.38.06-.78.09-1.18.09-3.86,0-7.09-2.33-8.59-5.75 1.5-3.42 4.73-5.75 8.59-5.75 2.76,0 5.27,1.22 6.97,3.25l-2.47 2.47L21 11.5V4.5l-2.47 2.47C16.87 4.96 14.61 4.5 12 4.5Z" />
        </svg>
      ),
    },
    {
      label: "Approve",
      variant: "success",
      onClick: (row) => handleApprove(row.id),
      hidden: (row) => row.status !== "reviewing",
      icon: (
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path fill="currentColor" d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z" />
        </svg>
      ),
    },
    {
      label: "Decline",
      variant: "danger",
      onClick: (row) => handleDecline(row.id),
      hidden: (row) => row.status !== "reviewing" && row.status !== "pending",
      icon: (
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
        </svg>
      ),
    },
    {
      label: "Delete",
      variant: "danger",
      onClick: (row) => handleDelete(row.id),
      hidden: (row) => row.status !== "pending",
      icon: (
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path fill="currentColor" d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
        </svg>
      ),
    },
  ];

  // Render expanded row
  const renderExpandedRow = (row: any) => {
    return (
      <div className={styles.expandedContent}>
        <div className={styles.expandedSection}>
          <h4>Guardian Information</h4>
          <div className={styles.guardianInfo}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Name:</span>
              <span className={styles.infoValue}>
                {row.guardian?.first_name} {row.guardian?.last_name}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Relationship:</span>
              <span className={styles.infoValue}>{row.guardian?.relationship}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Occupation:</span>
              <span className={styles.infoValue}>{row.guardian?.occupation || "—"}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Phone:</span>
              <span className={styles.infoValue}>{row.guardian?.phone || "—"}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Email:</span>
              <span className={styles.infoValue}>{row.guardian?.email || "—"}</span>
            </div>
          </div>
        </div>

        <div className={styles.expandedSection}>
          <h4>Previous School</h4>
          <div className={styles.schoolInfo}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>School Name:</span>
              <span className={styles.infoValue}>{row.prev_school?.name || "—"}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Last Class:</span>
              <span className={styles.infoValue}>{row.prev_school?.class_ended || "—"}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Average Score:</span>
              <span className={styles.infoValue}>{row.prev_school?.average_score ? `${row.prev_school.average_score}%` : "—"}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Year Attended:</span>
              <span className={styles.infoValue}>{row.prev_school?.year_attended || "—"}</span>
            </div>
          </div>
        </div>

        <div className={styles.expandedSection}>
          <h4>Academic Details</h4>
          <div className={styles.schoolInfo}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Preferred Session:</span>
              <span className={styles.infoValue}>{row.applying_for_details?.preferred_session || "morning"}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Academic Year:</span>
              <span className={styles.infoValue}>
                {row.applying_for_details?.academic_year ? 
                  `${row.applying_for_details.academic_year.year} - ${row.applying_for_details.academic_year.name}` : "—"}
              </span>
            </div>
            {row.remarks && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Remarks:</span>
                <span className={styles.infoValue}>{row.remarks}</span>
              </div>
            )}
          </div>
        </div>

        <div className={styles.expandedSection}>
          <h4>Payment Information</h4>
          <div className={styles.schoolInfo}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Amount:</span>
              <span className={styles.infoValue}>₵{row.payment?.amount?.toLocaleString() || "—"}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Status:</span>
              <span className={styles.infoValue}>{row.payment?.status || "pending"}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Channel:</span>
              <span className={styles.infoValue}>{row.payment?.channel || "—"}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Reference:</span>
              <span className={styles.infoValue}>{row.payment?.payment_reference || "—"}</span>
            </div>
          </div>
        </div>

        <div className={styles.expandedSection}>
          <h4>Timeline</h4>
          <div className={styles.timeline}>
            <div className={styles.timelineItem}>
              <div className={styles.timelineDot}></div>
              <div>
                <div className={styles.timelineLabel}>Submitted</div>
                <div className={styles.timelineDate}>{new Date(row.created_at).toLocaleString()}</div>
              </div>
            </div>
            {row.timeline?.reviewed_at && (
              <div className={styles.timelineItem}>
                <div className={styles.timelineDot}></div>
                <div>
                  <div className={styles.timelineLabel}>Reviewed</div>
                  <div className={styles.timelineDate}>{new Date(row.timeline.reviewed_at).toLocaleString()}</div>
                  <div className={styles.timelineBy}>By: {row.timeline.reviewed_by}</div>
                </div>
              </div>
            )}
            {row.timeline?.approved_at && (
              <div className={styles.timelineItem}>
                <div className={styles.timelineDot}></div>
                <div>
                  <div className={styles.timelineLabel}>Approved</div>
                  <div className={styles.timelineDate}>{new Date(row.timeline.approved_at).toLocaleString()}</div>
                  <div className={styles.timelineBy}>By: {row.timeline.approved_by}</div>
                </div>
              </div>
            )}
            {row.timeline?.rejected_at && (
              <div className={styles.timelineItem}>
                <div className={styles.timelineDotRed}></div>
                <div>
                  <div className={styles.timelineLabel}>Declined</div>
                  <div className={styles.timelineDate}>{new Date(row.timeline.rejected_at).toLocaleString()}</div>
                  <div className={styles.timelineBy}>By: {row.timeline.rejected_by}</div>
                  {row.timeline.rejected_reason && (
                    <div className={styles.timelineReason}>Reason: {row.timeline.rejected_reason}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Loading state
  if (loading && admissions.length === 0) {
    return (
      <div className={styles.pageContainer}>
        <Header title="Admissions Management" subtitle="Manage student applications, reviews, and approvals" />
        <div className={styles.contentWrapper}>
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Loading admissions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <Header
        title="Admissions Management"
        subtitle="Manage student applications, reviews, and approvals"
        onExport={handleExport}
        exportOptions={[{ value: "admissions", label: "Admissions" }]}
        customActions={
          <button className={styles.addButton} onClick={handleCreate}>
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
            </svg>
            New Application
          </button>
        }
      />

      <div className={styles.contentWrapper}>
        <Stats
          stats={dashboardStats}
          variant="cards"
          columns={4}
          showTrend={true}
          showIcon={true}
          size="md"
        />

        <div className={styles.filterSection}>
          <StatFilter
            data={admissions}
            onFilterChange={setFilteredAdmissions}
            searchKeys={["application_number", "applicant.first_name", "applicant.last_name", "contact.email", "contact.phone"]}
            sortOptions={sortOptions}
            filterOptions={filterOptions}
            variant="default"
            showSearch={true}
            showSort={true}
            showFilter={true}
            searchPlaceholder="Search by name, application number, email..."
            enableReset={true}
          />
        </div>

        <div className={styles.tableSection}>
          <Table
            columns={columns}
            data={filteredAdmissions}
            variant="default"
            size="md"
            stickyHeader={true}
            sortable={true}
            pagination={true}
            pageSize={10}
            actions={actions}
            expandable={true}
            renderExpandedRow={renderExpandedRow}
            showRowNumbers={true}
            emptyMessage="No applications found"
            loading={loading}
          />
        </div>
      </div>

      {/* View Modal */}
      {showModal && modalMode === "view" && currentAdmission && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.viewModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Application Details</h2>
              <button className={styles.closeButton} onClick={() => setShowModal(false)}>
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                </svg>
              </button>
            </div>
            <div className={styles.viewModalBody}>
              {/* Application Header */}
              <div className={styles.appHeader}>
                <div className={styles.appHeaderInfo}>
                  <h3>Application #{currentAdmission.application_number}</h3>
                  <p>Submitted on {new Date(currentAdmission.created_at).toLocaleString()}</p>
                </div>
                <div className={styles.appHeaderStatus}>
                  <span className={`${styles.statusBadge} ${currentAdmission.status === "pending" ? styles.statusSubmitted : currentAdmission.status === "reviewing" ? styles.statusReview : currentAdmission.status === "approved" ? styles.statusApproved : styles.statusRejected}`}>
                    {currentAdmission.status}
                  </span>
                </div>
              </div>

              {/* Applicant Info */}
              <div className={styles.infoCard}>
                <h4>Applicant Information</h4>
                <div className={styles.infoGrid}>
                  <div className={styles.infoRow}><span>Full Name:</span><strong>{currentAdmission.applicant?.first_name} {currentAdmission.applicant?.last_name}</strong></div>
                  <div className={styles.infoRow}><span>Other Names:</span><strong>{currentAdmission.applicant?.other_names || "—"}</strong></div>
                  <div className={styles.infoRow}><span>Gender:</span><strong>{currentAdmission.applicant?.gender}</strong></div>
                  <div className={styles.infoRow}><span>Date of Birth:</span><strong>{currentAdmission.applicant?.date_of_birth ? new Date(currentAdmission.applicant.date_of_birth).toLocaleDateString() : "—"}</strong></div>
                </div>
              </div>

              {/* Contact Info */}
              <div className={styles.infoCard}>
                <h4>Contact Information</h4>
                <div className={styles.infoGrid}>
                  <div className={styles.infoRow}><span>Email:</span><strong>{currentAdmission.contact?.email || "—"}</strong></div>
                  <div className={styles.infoRow}><span>Phone:</span><strong>{currentAdmission.contact?.phone || "—"}</strong></div>
                  <div className={styles.infoRow}><span>Address:</span><strong>{currentAdmission.contact?.address || "—"}</strong></div>
                  <div className={styles.infoRow}><span>City/Town:</span><strong>{currentAdmission.contact?.city || currentAdmission.contact?.town || "—"}</strong></div>
                </div>
              </div>

              {/* Guardian Info */}
              <div className={styles.infoCard}>
                <h4>Guardian Information</h4>
                <div className={styles.infoGrid}>
                  <div className={styles.infoRow}><span>Name:</span><strong>{currentAdmission.guardian?.first_name} {currentAdmission.guardian?.last_name}</strong></div>
                  <div className={styles.infoRow}><span>Relationship:</span><strong>{currentAdmission.guardian?.relationship}</strong></div>
                  <div className={styles.infoRow}><span>Occupation:</span><strong>{currentAdmission.guardian?.occupation || "—"}</strong></div>
                  <div className={styles.infoRow}><span>Phone:</span><strong>{currentAdmission.guardian?.phone || "—"}</strong></div>
                  <div className={styles.infoRow}><span>Email:</span><strong>{currentAdmission.guardian?.email || "—"}</strong></div>
                </div>
              </div>

              {/* Academic Info */}
              <div className={styles.infoCard}>
                <h4>Academic Information</h4>
                <div className={styles.infoGrid}>
                  <div className={styles.infoRow}><span>Applying For:</span><strong>{currentAdmission.applying_for_details?.class?.name || "—"}</strong></div>
                  <div className={styles.infoRow}><span>Department:</span><strong>{currentAdmission.applying_for_details?.department?.name || "—"}</strong></div>
                  <div className={styles.infoRow}><span>Academic Year:</span><strong>{currentAdmission.applying_for_details?.academic_year ? `${currentAdmission.applying_for_details.academic_year.year} - ${currentAdmission.applying_for_details.academic_year.name}` : "—"}</strong></div>
                  <div className={styles.infoRow}><span>Preferred Session:</span><strong>{currentAdmission.applying_for_details?.preferred_session || "morning"}</strong></div>
                  <div className={styles.infoRow}><span>Admission Type:</span><strong>{currentAdmission.admission_type}</strong></div>
                </div>
              </div>

              {/* Previous School */}
              {currentAdmission.prev_school && (
                <div className={styles.infoCard}>
                  <h4>Previous School</h4>
                  <div className={styles.infoGrid}>
                    <div className={styles.infoRow}><span>School Name:</span><strong>{currentAdmission.prev_school.name}</strong></div>
                    <div className={styles.infoRow}><span>Class Ended:</span><strong>{currentAdmission.prev_school.class_ended || "—"}</strong></div>
                    <div className={styles.infoRow}><span>Average Score:</span><strong>{currentAdmission.prev_school.average_score ? `${currentAdmission.prev_school.average_score}%` : "—"}</strong></div>
                    <div className={styles.infoRow}><span>Year Attended:</span><strong>{currentAdmission.prev_school.year_attended || "—"}</strong></div>
                  </div>
                </div>
              )}

              {/* Payment Info */}
              {currentAdmission.payment && currentAdmission.payment.amount > 0 && (
                <div className={styles.infoCard}>
                  <h4>Payment Information</h4>
                  <div className={styles.infoGrid}>
                    <div className={styles.infoRow}><span>Amount:</span><strong>₵{currentAdmission.payment.amount.toLocaleString()}</strong></div>
                    <div className={styles.infoRow}><span>Channel:</span><strong>{currentAdmission.payment.channel}</strong></div>
                    <div className={styles.infoRow}><span>Status:</span><strong>{currentAdmission.payment.status}</strong></div>
                    <div className={styles.infoRow}><span>Reference:</span><strong>{currentAdmission.payment.payment_reference || "—"}</strong></div>
                  </div>
                </div>
              )}

              {/* Remarks */}
              {currentAdmission.remarks && (
                <div className={styles.infoCard}>
                  <h4>Remarks</h4>
                  <p>{currentAdmission.remarks}</p>
                </div>
              )}
            </div>

            <div className={styles.modalFooter}>
              {currentAdmission.status === "pending" && (
                <>
                  <button type="button" className={styles.reviewButton} onClick={() => { handleReview(currentAdmission.id); setShowModal(false); }}>
                    Review Application
                  </button>
                  <button type="button" className={styles.declineButton} onClick={() => { handleDecline(currentAdmission.id); setShowModal(false); }}>
                    Decline
                  </button>
                </>
              )}
              {currentAdmission.status === "reviewing" && (
                <>
                  <button type="button" className={styles.approveButton} onClick={() => { handleApprove(currentAdmission.id); setShowModal(false); }}>
                    Approve Application
                  </button>
                  <button type="button" className={styles.declineButton} onClick={() => { handleDecline(currentAdmission.id); setShowModal(false); }}>
                    Decline
                  </button>
                </>
              )}
              <button type="button" className={styles.editButton} onClick={() => handleEdit(currentAdmission)}>
                Edit Application
              </button>
              <button type="button" className={styles.cancelButton} onClick={() => setShowModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && modalMode !== "view" && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={`${styles.modal} ${styles.largeModal}`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{modalMode === "create" ? "New Application" : "Edit Application"}</h2>
              <button className={styles.closeButton} onClick={() => setShowModal(false)}>
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                </svg>
              </button>
            </div>

            {/* Tabs */}
            <div className={styles.modalTabs}>
              <button className={`${styles.tab} ${activeTab === "applicant" ? styles.activeTab : ""}`} onClick={() => setActiveTab("applicant")}>
                Applicant Info
              </button>
              <button className={`${styles.tab} ${activeTab === "guardian" ? styles.activeTab : ""}`} onClick={() => setActiveTab("guardian")}>
                Guardian & School
              </button>
              <button className={`${styles.tab} ${activeTab === "academic" ? styles.activeTab : ""}`} onClick={() => setActiveTab("academic")}>
                Academic Details
              </button>
              <button className={`${styles.tab} ${activeTab === "payment" ? styles.activeTab : ""}`} onClick={() => setActiveTab("payment")}>
                Payment
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.modalBody}>
              {/* Applicant Tab */}
              {activeTab === "applicant" && (
                <div className={styles.tabContent}>
                  <div className={styles.formSection}>
                    <h3 className={styles.sectionTitle}>Personal Information</h3>

                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label>First Name *</label>
                        <input type="text" name="applicant_first_name" value={formData.applicant_first_name} onChange={handleInputChange} required placeholder="John" />
                      </div>
                      <div className={styles.formGroup}>
                        <label>Last Name *</label>
                        <input type="text" name="applicant_last_name" value={formData.applicant_last_name} onChange={handleInputChange} required placeholder="Doe" />
                      </div>
                    </div>

                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label>Other Names</label>
                        <input type="text" name="applicant_other_names" value={formData.applicant_other_names} onChange={handleInputChange} placeholder="Middle names" />
                      </div>
                      <div className={styles.formGroup}>
                        <label>Gender *</label>
                        <select name="applicant_gender" value={formData.applicant_gender} onChange={handleInputChange} required>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label>Date of Birth</label>
                        <input type="date" name="applicant_dob" value={formData.applicant_dob} onChange={handleInputChange} />
                      </div>
                    </div>

                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label>Email</label>
                        <input type="email" name="contact_email" value={formData.contact_email} onChange={handleInputChange} placeholder="student@email.com" />
                      </div>
                      <div className={styles.formGroup}>
                        <label>Phone</label>
                        <input type="tel" name="contact_phone" value={formData.contact_phone} onChange={handleInputChange} placeholder="+233 XX XXX XXXX" />
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label>Address</label>
                      <textarea name="contact_address" value={formData.contact_address} onChange={handleInputChange} rows={2} placeholder="Street address" />
                    </div>

                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label>City</label>
                        <input type="text" name="contact_city" value={formData.contact_city} onChange={handleInputChange} placeholder="City" />
                      </div>
                      <div className={styles.formGroup}>
                        <label>Town</label>
                        <input type="text" name="contact_town" value={formData.contact_town} onChange={handleInputChange} placeholder="Town" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Guardian & School Tab */}
              {activeTab === "guardian" && (
                <div className={styles.tabContent}>
                  <div className={styles.formSection}>
                    <h3 className={styles.sectionTitle}>Guardian Information</h3>

                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label>First Name *</label>
                        <input type="text" name="guardian_first_name" value={formData.guardian_first_name} onChange={handleInputChange} required placeholder="Guardian first name" />
                      </div>
                      <div className={styles.formGroup}>
                        <label>Last Name *</label>
                        <input type="text" name="guardian_last_name" value={formData.guardian_last_name} onChange={handleInputChange} required placeholder="Guardian last name" />
                      </div>
                    </div>

                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label>Relationship *</label>
                        <select name="guardian_relationship" value={formData.guardian_relationship} onChange={handleInputChange} required>
                          <option value="Mother">Mother</option>
                          <option value="Father">Father</option>
                          <option value="Guardian">Guardian</option>
                          <option value="Grandparent">Grandparent</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div className={styles.formGroup}>
                        <label>Phone *</label>
                        <input type="tel" name="guardian_phone" value={formData.guardian_phone} onChange={handleInputChange} required placeholder="+233 XX XXX XXXX" />
                      </div>
                    </div>

                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label>Email</label>
                        <input type="email" name="guardian_email" value={formData.guardian_email} onChange={handleInputChange} placeholder="guardian@email.com" />
                      </div>
                      <div className={styles.formGroup}>
                        <label>Occupation</label>
                        <input type="text" name="guardian_occupation" value={formData.guardian_occupation} onChange={handleInputChange} placeholder="e.g., Teacher, Engineer" />
                      </div>
                    </div>
                  </div>

                  <div className={styles.formSection}>
                    <h3 className={styles.sectionTitle}>Previous School</h3>

                    <div className={styles.formGroup}>
                      <label>School Name</label>
                      <input type="text" name="prev_school_name" value={formData.prev_school_name} onChange={handleInputChange} placeholder="Previous school name" />
                    </div>

                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label>Last Class</label>
                        <input type="text" name="prev_school_class" value={formData.prev_school_class} onChange={handleInputChange} placeholder="e.g., JHS 3" />
                      </div>
                      <div className={styles.formGroup}>
                        <label>Average Score (%)</label>
                        <input type="number" name="prev_school_score" value={formData.prev_school_score} onChange={handleInputChange} min="0" max="100" placeholder="75" />
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label>Year Attended</label>
                      <input type="number" name="prev_school_year" value={formData.prev_school_year} onChange={handleInputChange} placeholder="e.g., 2023" />
                    </div>
                  </div>
                </div>
              )}

              {/* Academic Details Tab */}
              {activeTab === "academic" && (
                <div className={styles.tabContent}>
                  <div className={styles.formSection}>
                    <h3 className={styles.sectionTitle}>Applying For</h3>

                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label>Class *</label>
                        <select name="applying_class" value={formData.applying_class} onChange={handleInputChange} required disabled={loadingDropdowns}>
                          <option value="">Select Class</option>
                          {classes.map((cls) => (
                            <option key={cls.id} value={cls.id}>{cls.name} ({cls.level})</option>
                          ))}
                        </select>
                      </div>
                      <div className={styles.formGroup}>
                        <label>Department</label>
                        <select name="applying_department" value={formData.applying_department} onChange={handleInputChange} disabled={loadingDropdowns}>
                          <option value="">Select Department</option>
                          {departments.map((dept) => (
                            <option key={dept.id} value={dept.id}>{dept.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label>Academic Year *</label>
                        <select name="academic_year" value={formData.academic_year} onChange={handleInputChange} required disabled={loadingDropdowns}>
                          <option value="">Select Academic Year</option>
                          {academicYears.map((year) => (
                            <option key={year.id} value={year.id}>{year.year} - {year.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className={styles.formGroup}>
                        <label>Preferred Session</label>
                        <select name="preferred_session" value={formData.preferred_session} onChange={handleInputChange}>
                          <option value="morning">Morning</option>
                          <option value="afternoon">Afternoon</option>
                        </select>
                      </div>
                    </div>

                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label>Admission Type *</label>
                        <select name="admission_type" value={formData.admission_type} onChange={handleInputChange} required>
                          <option value="regular">Regular</option>
                          <option value="online">Online</option>
                          <option value="scholarship">Scholarship</option>
                          <option value="transfer">Transfer</option>
                        </select>
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label>Remarks / Special Requirements</label>
                      <textarea name="remarks" value={formData.remarks} onChange={handleInputChange} rows={3} placeholder="Any additional information or special requirements..." />
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Tab */}
              {activeTab === "payment" && (
                <div className={styles.tabContent}>
                  <div className={styles.formSection}>
                    <h3 className={styles.sectionTitle}>Payment Information</h3>

                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label>Amount (₵)</label>
                        <input type="number" name="payment_amount" value={formData.payment_amount} onChange={handleInputChange} min="0" step="0.01" placeholder="0.00" />
                      </div>
                      <div className={styles.formGroup}>
                        <label>Payment Channel</label>
                        <select name="payment_channel" value={formData.payment_channel} onChange={handleInputChange}>
                          <option value="cash">Cash</option>
                          <option value="bank_transfer">Bank Transfer</option>
                          <option value="mobile_money">Mobile Money</option>
                          <option value="card">Card</option>
                        </select>
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label>Payment Reference</label>
                      <input type="text" name="payment_reference" value={formData.payment_reference} onChange={handleInputChange} placeholder="Optional reference number" />
                    </div>

                    <p className={styles.fieldNote}>Payment will be recorded as pending. Our finance team will confirm receipt.</p>
                  </div>
                </div>
              )}

              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelButton} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : (modalMode === "create" ? "Submit Application" : "Update Application")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className={styles.modalOverlay} onClick={() => setShowDeleteConfirm(false)}>
          <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.confirmIcon}>
              <svg viewBox="0 0 24 24" width="48" height="48">
                <path fill="currentColor" d="M13,14H11V10H13M13,18H11V16H13M1,21H23L12,2L1,21Z" />
              </svg>
            </div>
            <h3>Delete Application</h3>
            <p>Are you sure you want to delete this application? This action cannot be undone.</p>
            <div className={styles.confirmActions}>
              <button className={styles.cancelButton} onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
              <button className={styles.deleteButton} onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdmissionsAdminPage;