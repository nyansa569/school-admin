// app/(dashboard)/department/page.tsx
"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getStaffForDropdown,
  getDepartmentStats,
  Department,
} from "@/lib/action/admin/department";
import Header from "@/components/Header/Header";
import Stats from "@/components/Stats/Stats";
import StatFilter from "@/components/StatFilter/StatFilter";
import Table from "@/components/Table/Table";
import { Action } from "@/components/Table/Table";
import styles from "./page.module.css";

export default function DepartmentPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [staff, setStaff] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create");
  const [currentDepartment, setCurrentDepartment] = useState<Department | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState<number | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    dep_id: "",
    code: "",
    head_teacher: "",
    status: "active",
  });

  // Load departments
  const loadDepartments = async () => {
    setLoading(true);
    const result = await getDepartments();
    if (!result.error && result.departments) {
      setDepartments(result.departments);
      setFilteredDepartments(result.departments);
    }
    
    const statsResult = await getDepartmentStats();
    if (statsResult.stats) {
      setStats(statsResult.stats);
    }
    setLoading(false);
  };

  // Load staff for dropdown
  const loadStaff = async () => {
    const result = await getStaffForDropdown();
    if (result.staff) {
      setStaff(result.staff);
    }
  };

  useEffect(() => {
    loadDepartments();
    loadStaff();
  }, []);

  // Stats for dashboard
  const dashboardStats = useMemo(() => {
    const activeDepartments = departments.filter(d => d.status === "active").length;
    const inactiveDepartments = departments.filter(d => d.status === "inactive").length;
    const departmentsWithHead = departments.filter(d => d.head_teacher).length;

    return [
      {
        id: 1,
        label: "Total Departments",
        value: departments.length,
        trend: { value: 0, label: "total" },
        color: "blue",
        type: "departments",
      },
      {
        id: 2,
        label: "Active Departments",
        value: activeDepartments,
        trend: { value: 0, label: "currently active" },
        color: "green",
        type: "active",
      },
      {
        id: 3,
        label: "With Head Teacher",
        value: departmentsWithHead,
        trend: { value: 0, label: "assigned" },
        color: "purple",
        type: "assigned",
      },
      {
        id: 4,
        label: "Inactive",
        value: inactiveDepartments,
        trend: { value: 0, label: "archived" },
        color: "orange",
        type: "inactive",
      },
    ];
  }, [departments]);

  // Table columns
  const columns = [
    {
      header: "Department Code",
      accessor: "code",
      sortable: true,
      width: "120px",
      render: (row: Department) => row.code || "—",
    },
    {
      header: "Department Name",
      accessor: "name",
      sortable: true,
      render: (row: Department) => (
        <div className={styles.departmentCell}>
          <div className={styles.departmentIcon}>🏛️</div>
          <div>
            <div className={styles.departmentName}>{row.name}</div>
            <div className={styles.departmentId}>{row.dep_id || "No ID"}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Head Teacher",
      accessor: "head_teacher_details",
      sortable: true,
      width: "200px",
      render: (row: Department) => (
        row.head_teacher_details ? (
          <div className={styles.headTeacherCell}>
            <div className={styles.headTeacherAvatar}>
              {row.head_teacher_details.first_name[0]}{row.head_teacher_details.last_name[0]}
            </div>
            <div>
              <div className={styles.headTeacherName}>
                {row.head_teacher_details.first_name} {row.head_teacher_details.last_name}
              </div>
              <div className={styles.headTeacherEmail}>{row.head_teacher_details.email}</div>
            </div>
          </div>
        ) : (
          <span className={styles.notAssigned}>Not assigned</span>
        )
      ),
    },
    {
      header: "Status",
      accessor: "status",
      sortable: true,
      width: "100px",
      render: (row: Department) => (
        <span className={`${styles.statusBadge} ${row.status === "active" ? styles.statusActive : styles.statusInactive}`}>
          {row.status || "active"}
        </span>
      ),
    },
    {
      header: "Created",
      accessor: "created_at",
      sortable: true,
      width: "120px",
      render: (row: Department) => new Date(row.created_at).toLocaleDateString(),
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
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
      ],
    },
    {
      label: "Has Head Teacher",
      value: "head_teacher",
      key: "head_teacher",
      type: "select" as const,
      options: [
        { label: "Assigned", value: "assigned" },
        { label: "Not Assigned", value: "not_assigned" },
      ],
    },
  ];

  const sortOptions = [
    { label: "Name (A-Z)", value: "name-asc", key: "name", order: "asc" as const },
    { label: "Name (Z-A)", value: "name-desc", key: "name", order: "desc" as const },
    { label: "Code (A-Z)", value: "code-asc", key: "code", order: "asc" as const },
    { label: "Code (Z-A)", value: "code-desc", key: "code", order: "desc" as const },
    { label: "Created (Newest)", value: "created-desc", key: "created_at", order: "desc" as const },
    { label: "Created (Oldest)", value: "created-asc", key: "created_at", order: "asc" as const },
  ];

  // CRUD Operations
  const handleCreate = () => {
    setModalMode("create");
    setFormData({
      name: "",
      dep_id: "",
      code: "",
      head_teacher: "",
      status: "active",
    });
    setShowModal(true);
  };

  const handleEdit = (department: Department) => {
    setModalMode("edit");
    setCurrentDepartment(department);
    setFormData({
      name: department.name,
      dep_id: department.dep_id || "",
      code: department.code || "",
      head_teacher: department.head_teacher?.toString() || "",
      status: department.status,
    });
    setShowModal(true);
  };

  const handleView = (department: Department) => {
    setModalMode("view");
    setCurrentDepartment(department);
    setFormData({
      name: department.name,
      dep_id: department.dep_id || "",
      code: department.code || "",
      head_teacher: department.head_teacher?.toString() || "",
      status: department.status,
    });
    setShowModal(true);
  };

  const handleDelete = (departmentId: number) => {
    setDepartmentToDelete(departmentId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (departmentToDelete) {
      const result = await deleteDepartment(departmentToDelete);
      if (result.success) {
        await loadDepartments();
      } else {
        alert(result.error);
      }
      setShowDeleteConfirm(false);
      setDepartmentToDelete(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitFormData = new FormData();
    submitFormData.append("name", formData.name);
    submitFormData.append("dep_id", formData.dep_id);
    submitFormData.append("code", formData.code);
    submitFormData.append("head_teacher", formData.head_teacher);
    submitFormData.append("status", formData.status);

    let result;
    if (modalMode === "create") {
      result = await createDepartment(submitFormData);
    } else if (modalMode === "edit" && currentDepartment) {
      result = await updateDepartment(currentDepartment.id, submitFormData);
    }

    if (result?.success) {
      await loadDepartments();
      setShowModal(false);
      setCurrentDepartment(null);
    } else if (result?.error) {
      alert(result.error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Custom filter function for "Has Head Teacher"
  const handleFilterChange = (filtered: Department[]) => {
    // Apply custom filtering for head_teacher
    // This is handled by StatFilter, but we'll add additional logic if needed
    setFilteredDepartments(filtered);
  };

  // Actions for table
  const actions: Action<Department>[] = [
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
      icon: (
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path fill="currentColor" d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />
        </svg>
      ),
    },
    {
      label: "Delete",
      variant: "danger",
      onClick: (row) => handleDelete(row.id),
      icon: (
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path fill="currentColor" d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
        </svg>
      ),
    },
  ];

  if (loading) return <div className={styles.loading}>Loading departments...</div>;

  return (
    <div className={styles.pageContainer}>
      <Header
        title="Department Management"
        subtitle="Manage school departments, assign head teachers, and track department codes"
        customActions={
          <button className={styles.addButton} onClick={handleCreate}>
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
            </svg>
            Add New Department
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
            data={departments}
            onFilterChange={setFilteredDepartments}
            searchKeys={["name", "dep_id", "code", "head_teacher_details.first_name", "head_teacher_details.last_name"]}
            sortOptions={sortOptions}
            filterOptions={filterOptions}
            variant="default"
            showSearch={true}
            showSort={true}
            showFilter={true}
            searchPlaceholder="Search departments by name, code, or head teacher..."
            enableReset={true}
          />
        </div>

        <div className={styles.tableSection}>
          <Table
            columns={columns}
            data={filteredDepartments}
            variant="default"
            size="md"
            stickyHeader={true}
            sortable={true}
            pagination={true}
            pageSize={10}
            actions={actions}
            showRowNumbers={true}
            emptyMessage="No departments found"
            loading={loading}
          />
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>
                {modalMode === "create" && "Add New Department"}
                {modalMode === "edit" && "Edit Department"}
                {modalMode === "view" && "Department Details"}
              </h2>
              <button className={styles.closeButton} onClick={() => setShowModal(false)}>
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.modalBody}>
              <div className={styles.formGrid}>
                <div className={styles.formSection}>
                  <h3 className={styles.sectionTitle}>Department Information</h3>
                  
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Department Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        disabled={modalMode === "view"}
                        placeholder="e.g., Science, Mathematics, Languages"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Department ID</label>
                      <input
                        type="text"
                        name="dep_id"
                        value={formData.dep_id}
                        onChange={handleInputChange}
                        disabled={modalMode === "view"}
                        placeholder="e.g., DEP-001"
                      />
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Department Code</label>
                      <input
                        type="text"
                        name="code"
                        value={formData.code}
                        onChange={handleInputChange}
                        disabled={modalMode === "view"}
                        placeholder="e.g., SCI, MATH, LANG"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Head Teacher</label>
                      <select
                        name="head_teacher"
                        value={formData.head_teacher}
                        onChange={handleInputChange}
                        disabled={modalMode === "view"}
                      >
                        <option value="">Select Head Teacher</option>
                        {staff.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.first_name} {s.last_name} ({s.role})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Status</label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        disabled={modalMode === "view"}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {modalMode !== "view" && (
                <div className={styles.modalFooter}>
                  <button
                    type="button"
                    className={styles.cancelButton}
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className={styles.submitButton}>
                    {modalMode === "create" ? "Create Department" : "Update Department"}
                  </button>
                </div>
              )}
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
            <h3>Delete Department</h3>
            <p>Are you sure you want to delete this department? This action can be reversed.</p>
            <div className={styles.confirmActions}>
              <button
                className={styles.cancelButton}
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button className={styles.deleteButton} onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}