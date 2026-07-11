// app/(dashboard)/admin/staff/page.tsx
"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import styles from "./staff.module.css";
import Stats from "@/components/Stats/Stats";
import StatFilter from "@/components/StatFilter/StatFilter";
import Table from "@/components/Table/Table";
import Header from "@/components/Header/Header";
import {
  getStaff,
  deleteStaff,
  createStaff,
  updateStaff,
  Staff,
  getStaffRoles,
  getEmploymentTypes,
  getDepartments,
} from "@/lib/action/admin/staff";
import { Action } from "@/components/Table/Table";
import { exportToCSV } from "@/utils/export/csv";
import { exportToPDF } from "@/utils/export/pdf";

const StaffAdminPage = () => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create");
  const [currentStaff, setCurrentStaff] = useState<Staff | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"basic" | "employment">("basic");
  const [roles, setRoles] = useState<string[]>([]);
  const [employmentTypes, setEmploymentTypes] = useState<string[]>([]);
  const [departments, setDepartments] = useState<{ id: number; name: string; dep_code: string }[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    other_names: "",
    email: "",
    password: "",
    phone: "",
    gender: "",
    date_of_birth: "",
    qualification: "",
    specialization: "",
    role: "teacher",
    employment_type: "full-time",
    employment_status: "active",
    hire_date: "",
    salary: "",
    department_id: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    status: "active",
    create_user_account: "true",
  });

  // Load staff
  const loadStaff = async () => {
    setLoading(true);
    const result = await getStaff();
    if (!result.error && result.staff) {
      setStaff(result.staff);
      setFilteredStaff(result.staff);
    }
    setLoading(false);
  };

  // Load options
  const loadOptions = async () => {
    const rolesResult = await getStaffRoles();
    if (rolesResult.roles) setRoles(rolesResult.roles);

    const typesResult = await getEmploymentTypes();
    if (typesResult.types) setEmploymentTypes(typesResult.types);

    const deptsResult = await getDepartments();
    if (deptsResult.departments) setDepartments(deptsResult.departments);
  };

  useEffect(() => {
    loadStaff();
    loadOptions();
  }, []);

  // Calculate stats
  const stats = useMemo(() => {
    const activeStaff = staff.filter((s) => s.employment_status === "active").length;
    const teachers = staff.filter((s) => s.role === "teacher").length;
    const onLeave = staff.filter((s) => s.employment_status === "on_leave").length;

    const salaries = staff.filter((s) => s.salary).map((s) => s.salary || 0);
    const avgSalary = salaries.length > 0
      ? Math.round(salaries.reduce((a, b) => a + b, 0) / salaries.length)
      : 0;

    return [
      {
        id: 1,
        label: "Total Staff",
        value: staff.length,
        trend: { value: 0, label: "total" },
        color: "blue",
        type: "teachers",
      },
      {
        id: 2,
        label: "Active Staff",
        value: activeStaff,
        trend: { value: 0, label: "currently active" },
        color: "green",
        type: "students",
      },
      {
        id: 3,
        label: "Teachers",
        value: teachers,
        trend: { value: 0, label: "teaching staff" },
        color: "purple",
        type: "classes",
      },
      {
        id: 4,
        label: "Avg. Salary",
        value: `₵${avgSalary.toLocaleString()}`,
        trend: { value: 0, label: "monthly average" },
        color: "orange",
        type: "attendance",
      },
    ];
  }, [staff]);

  // ============================================
  // EXPORT FUNCTIONALITY
  // ============================================

  const getExportColumns = () => [
    {
      header: "Staff Number",
      accessor: (row: Staff) => row.staff_number || "—",
    },
    {
      header: "Full Name",
      accessor: (row: Staff) => `${row.first_name} ${row.last_name}${row.other_names ? ` ${row.other_names}` : ""}`,
    },
    {
      header: "Email",
      accessor: (row: Staff) => row.email || "—",
    },
    {
      header: "Phone",
      accessor: (row: Staff) => row.phone || "—",
    },
    {
      header: "Gender",
      accessor: (row: Staff) => row.gender || "—",
    },
    {
      header: "Role",
      accessor: (row: Staff) => row.role || "—",
    },
    {
      header: "Department",
      accessor: (row: Staff) => row.department?.name || "—",
    },
    {
      header: "Qualification",
      accessor: (row: Staff) => row.qualification || "—",
    },
    {
      header: "Specialization",
      accessor: (row: Staff) => row.specialization || "—",
    },
    {
      header: "Employment Type",
      accessor: (row: Staff) => row.employment_type || "—",
    },
    {
      header: "Employment Status",
      accessor: (row: Staff) => row.employment_status || "—",
    },
    {
      header: "Hire Date",
      accessor: (row: Staff) => row.hire_date ? new Date(row.hire_date).toLocaleDateString() : "—",
    },
    {
      header: "Salary (₵)",
      accessor: (row: Staff) => row.salary ? row.salary.toLocaleString() : "—",
    },
    {
      header: "Emergency Contact",
      accessor: (row: Staff) => row.emergency_contact_name || "—",
    },
    {
      header: "Emergency Phone",
      accessor: (row: Staff) => row.emergency_contact_phone || "—",
    },
  ];

  const handleExport = useCallback(
    async (format: "pdf" | "csv") => {
      const dataToExport = filteredStaff.length > 0 ? filteredStaff : staff;

      if (dataToExport.length === 0) {
        alert("No data to export");
        return;
      }

      const columns = getExportColumns();
      const filename = `staff-${new Date().toISOString().split("T")[0]}`;

      if (format === "csv") {
        exportToCSV(dataToExport, columns, { filename });
      } else {
        await exportToPDF(dataToExport, columns, {
          filename,
          title: "Staff Management Report",
          subtitle: `Total Staff: ${dataToExport.length} | Generated on ${new Date().toLocaleDateString()}`,
          orientation: "landscape",
        });
      }
    },
    [filteredStaff, staff]
  );

  // ============================================
  // END EXPORT FUNCTIONALITY
  // ============================================

  // Table columns configuration
  const columns = [
    {
      header: "Staff",
      accessor: "first_name",
      sortable: true,
      render: (row: Staff) => (
        <div className={styles.staffCell}>
          <div className={styles.staffAvatar}>
            {row.user?.profile_picture ? (
              <img
                src={row.user.profile_picture}
                alt={row.first_name}
                className={styles.avatarImage}
              />
            ) : (
              `${row.first_name?.[0]}${row.last_name?.[0]}`
            )}
          </div>
          <div>
            <div className={styles.staffName}>
              {row.first_name} {row.last_name}
            </div>
            <div className={styles.staffEmail}>{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Staff ID",
      accessor: "staff_number",
      sortable: true,
      width: "120px",
      render: (row: Staff) => row.staff_number || "—",
    },
    {
      header: "Role",
      accessor: "role",
      sortable: true,
      width: "130px",
      render: (row: Staff) => (
        <span className={`${styles.roleBadge} ${styles[`role${row.role}`] || styles.roleDefault}`}>
          {row.role}
        </span>
      ),
    },
    {
      header: "Phone",
      accessor: "phone",
      sortable: true,
      width: "130px",
      render: (row: Staff) => row.phone || "—",
    },
    {
      header: "Employment",
      accessor: "employment_type",
      sortable: true,
      width: "120px",
      render: (row: Staff) => (
        <span className={styles.employmentType}>{row.employment_type}</span>
      ),
    },
    {
      header: "Hire Date",
      accessor: "hire_date",
      sortable: true,
      width: "110px",
      render: (row: Staff) =>
        row.hire_date ? new Date(row.hire_date).toLocaleDateString() : "—",
    },
    {
      header: "Status",
      accessor: "employment_status",
      sortable: true,
      width: "100px",
      render: (row: Staff) => {
        const statusColors: Record<string, string> = {
          active: styles.statusActive,
          on_leave: styles.statusOnLeave,
          suspended: styles.statusSuspended,
          terminated: styles.statusResigned,
          retired: styles.statusResigned,
        };
        return (
          <span className={`${styles.statusBadge} ${statusColors[row.employment_status || "active"]}`}>
            {row.employment_status || "active"}
          </span>
        );
      },
    },
  ];

  // Filter options
  const filterOptions = [
    {
      label: "Status",
      value: "employment_status",
      key: "employment_status",
      type: "select" as const,
      options: [
        { label: "Active", value: "active" },
        { label: "On Leave", value: "on_leave" },
        { label: "Suspended", value: "suspended" },
        { label: "Terminated", value: "terminated" },
        { label: "Retired", value: "retired" },
      ],
    },
    {
      label: "Role",
      value: "role",
      key: "role",
      type: "select" as const,
      options: roles.map((r) => ({
        label: r.charAt(0).toUpperCase() + r.slice(1),
        value: r,
      })),
    },
    {
      label: "Employment Type",
      value: "employment_type",
      key: "employment_type",
      type: "select" as const,
      options: employmentTypes.map((t) => ({
        label: t.charAt(0).toUpperCase() + t.slice(1),
        value: t,
      })),
    },
  ];

  const sortOptions = [
    { label: "Name (A-Z)", value: "name-asc", key: "first_name", order: "asc" as const },
    { label: "Name (Z-A)", value: "name-desc", key: "first_name", order: "desc" as const },
    { label: "Hire Date (Newest)", value: "hire-desc", key: "hire_date", order: "desc" as const },
    { label: "Hire Date (Oldest)", value: "hire-asc", key: "hire_date", order: "asc" as const },
    { label: "Salary (Highest)", value: "salary-desc", key: "salary", order: "desc" as const },
    { label: "Salary (Lowest)", value: "salary-asc", key: "salary", order: "asc" as const },
  ];

  // CRUD Operations
  const handleCreate = () => {
    setModalMode("create");
    setActiveTab("basic");
    setFormData({
      first_name: "",
      last_name: "",
      other_names: "",
      email: "",
      password: "",
      phone: "",
      gender: "",
      date_of_birth: "",
      qualification: "",
      specialization: "",
      role: "teacher",
      employment_type: "full-time",
      employment_status: "active",
      hire_date: new Date().toISOString().split("T")[0],
      salary: "",
      department_id: "",
      emergency_contact_name: "",
      emergency_contact_phone: "",
      status: "active",
      create_user_account: "true",
    });
    setImageFile(null);
    setShowModal(true);
  };

  const handleEdit = (staffMember: Staff) => {
    setModalMode("edit");
    setActiveTab("basic");
    setCurrentStaff(staffMember);
    setFormData({
      first_name: staffMember.first_name,
      last_name: staffMember.last_name,
      other_names: staffMember.other_names || "",
      email: staffMember.email || "",
      password: "",
      phone: staffMember.phone || "",
      gender: staffMember.gender || "",
      date_of_birth: staffMember.date_of_birth || "",
      qualification: staffMember.qualification || "",
      specialization: staffMember.specialization || "",
      role: staffMember.role,
      employment_type: staffMember.employment_type,
      employment_status: staffMember.employment_status,
      hire_date: staffMember.hire_date || new Date().toISOString().split("T")[0],
      salary: staffMember.salary?.toString() || "",
      department_id: staffMember.department_id?.toString() || "",
      emergency_contact_name: staffMember.emergency_contact_name || "",
      emergency_contact_phone: staffMember.emergency_contact_phone || "",
      status: staffMember.status,
      create_user_account: staffMember.user_id ? "false" : "true",
    });
    setImageFile(null);
    setShowModal(true);
  };

  const handleView = (staffMember: Staff) => {
    setModalMode("view");
    setCurrentStaff(staffMember);
    setShowModal(true);
  };

  const handleDelete = (staffId: number) => {
    setStaffToDelete(staffId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (staffToDelete) {
      const result = await deleteStaff(staffToDelete);
      if (result.success) {
        await loadStaff();
      } else {
        alert(result.error);
      }
      setShowDeleteConfirm(false);
      setStaffToDelete(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const submitFormData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value) submitFormData.append(key, value);
    });
    if (imageFile) submitFormData.append("profile_picture", imageFile);

    let result;
    if (modalMode === "create") {
      result = await createStaff(submitFormData);
    } else if (modalMode === "edit" && currentStaff) {
      result = await updateStaff(currentStaff.id, submitFormData);
    }

    if (result?.success) {
      await loadStaff();
      setShowModal(false);
      setCurrentStaff(null);
    } else if (result?.error) {
      alert(result.error);
    }
    setIsSubmitting(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? "true" : "false") : value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const maxSizeMB = 1;
      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      
      if (file.size > maxSizeBytes) {
        alert(`File size exceeds ${maxSizeMB}MB limit. Please upload a smaller file.`);
        e.target.value = "";
        return;
      }
      setImageFile(file);
    }
  };

  // Table actions
  const actions: Action<Staff>[] = [
    {
      label: "View",
      variant: "primary",
      onClick: (row: Staff) => handleView(row),
      icon: (
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path fill="currentColor" d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z" />
        </svg>
      ),
    },
    {
      label: "Edit",
      variant: "secondary",
      onClick: (row: Staff) => handleEdit(row),
      icon: (
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path fill="currentColor" d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />
        </svg>
      ),
    },
    {
      label: "Delete",
      variant: "danger",
      onClick: (row: Staff) => handleDelete(row.id),
      icon: (
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path fill="currentColor" d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
        </svg>
      ),
    },
  ];

  // Loading UI
  if (loading && staff.length === 0) {
    return (
      <div className={styles.pageContainer}>
        <Header title="Staff Management" subtitle="Manage teaching and non-teaching staff" />
        <div className={styles.contentWrapper}>
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Loading staff data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <Header
        title="Staff Management"
        subtitle="Manage teaching and non-teaching staff, assignments, and performance"
        onExport={handleExport}
        exportOptions={[{ value: "staff", label: "Staff Members" }]}
        customActions={
          <button className={styles.addButton} onClick={handleCreate}>
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
            </svg>
            Add New Staff
          </button>
        }
      />

      <div className={styles.contentWrapper}>
        <Stats
          stats={stats}
          variant="cards"
          columns={4}
          showTrend={true}
          showIcon={true}
          size="md"
        />

        <div className={styles.filterSection}>
          <StatFilter
            data={staff}
            onFilterChange={setFilteredStaff}
            searchKeys={["first_name", "last_name", "email", "phone", "role", "staff_number"]}
            sortOptions={sortOptions}
            filterOptions={filterOptions}
            variant="default"
            showSearch={true}
            showSort={true}
            showFilter={true}
            searchPlaceholder="Search staff by name, email, role, or ID..."
            enableReset={true}
          />
        </div>

        <div className={styles.tableSection}>
          <Table
            columns={columns}
            data={filteredStaff}
            variant="default"
            size="md"
            stickyHeader={true}
            sortable={true}
            pagination={true}
            pageSize={10}
            actions={actions}
            showRowNumbers={true}
            emptyMessage="No staff members found"
            loading={loading}
          />
        </div>
      </div>

      {/* View Modal - Clean display mode */}
      {showModal && modalMode === "view" && currentStaff && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.viewModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Staff Member Details</h2>
              <button className={styles.closeButton} onClick={() => setShowModal(false)}>
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                </svg>
              </button>
            </div>
            <div className={styles.viewModalBody}>
              {/* Profile Header */}
              <div className={styles.profileHeader}>
                <div className={styles.profileAvatarLarge}>
                  {currentStaff.user?.profile_picture ? (
                    <img src={currentStaff.user.profile_picture} alt={currentStaff.first_name} />
                  ) : (
                    <span>{currentStaff.first_name?.[0]}{currentStaff.last_name?.[0]}</span>
                  )}
                </div>
                <div className={styles.profileInfo}>
                  <h3>{currentStaff.first_name} {currentStaff.last_name}</h3>
                  <p className={styles.profileRole}>{currentStaff.role}</p>
                  <p className={styles.profileStaffId}>Staff ID: {currentStaff.staff_number}</p>
                </div>
                <div className={styles.profileStatus}>
                  <span className={`${styles.statusBadge} ${currentStaff.employment_status === "active" ? styles.statusActive : styles.statusOnLeave}`}>
                    {currentStaff.employment_status}
                  </span>
                </div>
              </div>

              {/* Two Column Info */}
              <div className={styles.infoGrid}>
                <div className={styles.infoCard}>
                  <h4>Personal Information</h4>
                  <div className={styles.infoRow}><span>Full Name:</span><strong>{currentStaff.first_name} {currentStaff.last_name}</strong></div>
                  {currentStaff.other_names && <div className={styles.infoRow}><span>Other Names:</span><strong>{currentStaff.other_names}</strong></div>}
                  {currentStaff.gender && <div className={styles.infoRow}><span>Gender:</span><strong>{currentStaff.gender}</strong></div>}
                  {currentStaff.date_of_birth && <div className={styles.infoRow}><span>Date of Birth:</span><strong>{new Date(currentStaff.date_of_birth).toLocaleDateString()}</strong></div>}
                  <div className={styles.infoRow}><span>Email:</span><strong>{currentStaff.email || "—"}</strong></div>
                  <div className={styles.infoRow}><span>Phone:</span><strong>{currentStaff.phone || "—"}</strong></div>
                </div>

                <div className={styles.infoCard}>
                  <h4>Professional Information</h4>
                  <div className={styles.infoRow}><span>Role:</span><strong>{currentStaff.role}</strong></div>
                  {currentStaff.qualification && <div className={styles.infoRow}><span>Qualification:</span><strong>{currentStaff.qualification}</strong></div>}
                  {currentStaff.specialization && <div className={styles.infoRow}><span>Specialization:</span><strong>{currentStaff.specialization}</strong></div>}
                  {currentStaff.department && <div className={styles.infoRow}><span>Department:</span><strong>{currentStaff.department.name}</strong></div>}
                </div>

                <div className={styles.infoCard}>
                  <h4>Employment Details</h4>
                  <div className={styles.infoRow}><span>Employment Type:</span><strong>{currentStaff.employment_type}</strong></div>
                  <div className={styles.infoRow}><span>Hire Date:</span><strong>{currentStaff.hire_date ? new Date(currentStaff.hire_date).toLocaleDateString() : "—"}</strong></div>
                  {currentStaff.termination_date && <div className={styles.infoRow}><span>Termination Date:</span><strong>{new Date(currentStaff.termination_date).toLocaleDateString()}</strong></div>}
                  <div className={styles.infoRow}><span>Salary:</span><strong>{currentStaff.salary ? `₵${currentStaff.salary.toLocaleString()}` : "—"}</strong></div>
                </div>

                <div className={styles.infoCard}>
                  <h4>Emergency Contact</h4>
                  {currentStaff.emergency_contact_name ? (
                    <>
                      <div className={styles.infoRow}><span>Name:</span><strong>{currentStaff.emergency_contact_name}</strong></div>
                      <div className={styles.infoRow}><span>Phone:</span><strong>{currentStaff.emergency_contact_phone || "—"}</strong></div>
                    </>
                  ) : (
                    <div className={styles.infoRow}><span>No emergency contact provided</span></div>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              {currentStaff.contact && (currentStaff.contact.address || currentStaff.contact.city || currentStaff.contact.town) && (
                <div className={styles.infoCardFull}>
                  <h4>Address Information</h4>
                  <div className={styles.infoRow}><span>Address:</span><strong>{currentStaff.contact.address || "—"}</strong></div>
                  <div className={styles.infoRow}><span>City/Town:</span><strong>{currentStaff.contact.city || currentStaff.contact.town || "—"}</strong></div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && modalMode !== "view" && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{modalMode === "create" ? "Add New Staff Member" : "Edit Staff Member"}</h2>
              <button className={styles.closeButton} onClick={() => setShowModal(false)}>
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                </svg>
              </button>
            </div>

            <div className={styles.modalTabs}>
              <button className={`${styles.tab} ${activeTab === "basic" ? styles.activeTab : ""}`} onClick={() => setActiveTab("basic")}>
                Basic Info
              </button>
              <button className={`${styles.tab} ${activeTab === "employment" ? styles.activeTab : ""}`} onClick={() => setActiveTab("employment")}>
                Employment
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.modalBody}>
              {activeTab === "basic" && (
                <div className={styles.tabContent}>
                  <div className={styles.formSection}>
                    <h3 className={styles.sectionTitle}>Personal Information</h3>
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label>First Name *</label>
                        <input type="text" name="first_name" value={formData.first_name} onChange={handleInputChange} required placeholder="John" />
                      </div>
                      <div className={styles.formGroup}>
                        <label>Last Name *</label>
                        <input type="text" name="last_name" value={formData.last_name} onChange={handleInputChange} required placeholder="Doe" />
                      </div>
                    </div>
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label>Other Names</label>
                        <input type="text" name="other_names" value={formData.other_names} onChange={handleInputChange} placeholder="Middle names" />
                      </div>
                      <div className={styles.formGroup}>
                        <label>Gender</label>
                        <select name="gender" value={formData.gender} onChange={handleInputChange}>
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label>Date of Birth</label>
                        <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleInputChange} />
                      </div>
                      <div className={styles.formGroup}>
                        <label>Profile Picture</label>
                        <input type="file" accept="image/*" onChange={handleImageChange} />
                      </div>
                    </div>
                  </div>

                  <div className={styles.formSection}>
                    <h3 className={styles.sectionTitle}>Contact Information</h3>
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label>Email</label>
                        <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="staff@school.com" />
                      </div>
                      <div className={styles.formGroup}>
                        <label>Phone Number</label>
                        <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+233 XX XXX XXXX" />
                      </div>
                    </div>
                  </div>

                  <div className={styles.formSection}>
                    <h3 className={styles.sectionTitle}>Professional Information</h3>
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label>Role *</label>
                        <select name="role" value={formData.role} onChange={handleInputChange} required>
                          {roles.map((role) => (
                            <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>
                          ))}
                        </select>
                      </div>
                      <div className={styles.formGroup}>
                        <label>Department</label>
                        <select name="department_id" value={formData.department_id} onChange={handleInputChange}>
                          <option value="">Select Department</option>
                          {departments.map((dept) => (
                            <option key={dept.id} value={dept.id}>{dept.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label>Qualification</label>
                        <input type="text" name="qualification" value={formData.qualification} onChange={handleInputChange} placeholder="e.g., B.Ed, MSc" />
                      </div>
                      <div className={styles.formGroup}>
                        <label>Specialization</label>
                        <input type="text" name="specialization" value={formData.specialization} onChange={handleInputChange} placeholder="e.g., Mathematics, Science" />
                      </div>
                    </div>
                  </div>

                  <div className={styles.formSection}>
                    <h3 className={styles.sectionTitle}>Account Settings</h3>
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label>Create User Account</label>
                        <select name="create_user_account" value={formData.create_user_account} onChange={handleInputChange}>
                          <option value="true">Yes, create login account</option>
                          <option value="false">No, staff record only</option>
                        </select>
                      </div>
                    </div>
                    {formData.create_user_account === "true" && modalMode === "create" && (
                      <div className={styles.formGroup}>
                        <label>Password *</label>
                        <input type="password" name="password" value={formData.password} onChange={handleInputChange} required={modalMode === "create"} placeholder="Minimum 6 characters" />
                      </div>
                    )}
                  </div>

                  <div className={styles.formSection}>
                    <h3 className={styles.sectionTitle}>Emergency Contact</h3>
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label>Emergency Contact Name</label>
                        <input type="text" name="emergency_contact_name" value={formData.emergency_contact_name} onChange={handleInputChange} placeholder="Next of kin" />
                      </div>
                      <div className={styles.formGroup}>
                        <label>Emergency Contact Phone</label>
                        <input type="tel" name="emergency_contact_phone" value={formData.emergency_contact_phone} onChange={handleInputChange} placeholder="+233 XX XXX XXXX" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "employment" && (
                <div className={styles.tabContent}>
                  <div className={styles.formSection}>
                    <h3 className={styles.sectionTitle}>Employment Details</h3>
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label>Employment Type *</label>
                        <select name="employment_type" value={formData.employment_type} onChange={handleInputChange} required>
                          {employmentTypes.map((type) => (
                            <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                          ))}
                        </select>
                      </div>
                      <div className={styles.formGroup}>
                        <label>Employment Status *</label>
                        <select name="employment_status" value={formData.employment_status} onChange={handleInputChange} required>
                          <option value="active">Active</option>
                          <option value="on_leave">On Leave</option>
                          <option value="suspended">Suspended</option>
                          <option value="terminated">Terminated</option>
                          <option value="retired">Retired</option>
                        </select>
                      </div>
                    </div>
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label>Hire Date *</label>
                        <input type="date" name="hire_date" value={formData.hire_date} onChange={handleInputChange} required />
                      </div>
                      <div className={styles.formGroup}>
                        <label>Salary (₵)</label>
                        <input type="number" name="salary" value={formData.salary} onChange={handleInputChange} min="0" placeholder="0" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelButton} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : (modalMode === "create" ? "Create Staff Member" : "Update Staff Member")}
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
            <h3>Delete Staff Member</h3>
            <p>Are you sure you want to delete this staff member? This action can be reversed.</p>
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

export default StaffAdminPage;