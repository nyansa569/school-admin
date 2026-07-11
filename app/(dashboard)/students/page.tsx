// app/(dashboard)/students/page.tsx
"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import styles from "./page.module.css";
import Header from "@/components/Header/Header";
import StatFilter from "@/components/StatFilter/StatFilter";
import Table, { Action } from "@/components/Table/Table";
import Stats from "@/components/Stats/Stats";
import {
  getStudents,
  deleteStudent,
  createStudent,
  updateStudent,
  getClasses,
  getAcademicYears,
  getTerms,
  assignClass,
  getStudentClassHistory,
  removeStudentFromClass,
  getGuardians,
  getContacts,
  getBloodGroups,
  getGenders,
  getStudentStatuses,
  Student,
} from "@/lib/action/admin/student";
import { getAdminProfile, AdminProfile } from "@/lib/action/admin/profile";
import { exportToCSV } from "@/utils/export/csv";
import { exportToPDF } from "@/utils/export/pdf";

const StudentAdminPage = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create");
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<number | null>(null);
  
  // Dropdown data
  const [classes, setClasses] = useState<{ id: number; name: string; level: string }[]>([]);
  const [academicYears, setAcademicYears] = useState<{ id: number; year: number; name: string; is_active: boolean }[]>([]);
  const [terms, setTerms] = useState<{ id: number; term_number: number; name: string }[]>([]);
  const [guardians, setGuardians] = useState<{ id: number; first_name: string; last_name: string; relationship: string; phone: string | null }[]>([]);
  const [contacts, setContacts] = useState<{ id: number; email: string | null; phone: string | null }[]>([]);
  const [bloodGroups, setBloodGroups] = useState<string[]>([]);
  const [genders, setGenders] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);
  
  // Class assignment modal states
  const [showClassModal, setShowClassModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [classHistory, setClassHistory] = useState<any[]>([]);
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState<string>("");
  const [classAssignmentForm, setClassAssignmentForm] = useState({
    class_id: "",
    term_id: "",
    academic_year_id: "",
  });

  // Form state
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    other_names: "",
    gender: "male",
    date_of_birth: "",
    admission_number: "",
    student_number: "",
    current_class_id: "",
    status: "active",
    guardian_id: "",
    contact_id: "",
    medical_conditions: "",
    allergies: "",
    blood_group: "",
    enrollment_date: new Date().toISOString().split("T")[0],
    prev_school_name: "",
    prev_school_class: "",
    prev_school_score: "",
    prev_school_year: "",
    guardian_first_name: "",
    guardian_last_name: "",
    guardian_relationship: "",
    guardian_email: "",
    guardian_phone: "",
    guardian_occupation: "",
    contact_email: "",
    contact_phone: "",
    contact_address: "",
    contact_city: "",
    contact_town: "",
    term_id: "",
    academic_year_id: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);

  // Load admin profile
  useEffect(() => {
    const loadAdminProfile = async () => {
      const { profile } = await getAdminProfile();
      if (profile) setAdminProfile(profile);
    };
    loadAdminProfile();
  }, []);

  useEffect(() => {
  if (formData.academic_year_id) {
    const loadTermsForForm = async () => {
      const result = await getTerms(parseInt(formData.academic_year_id));
      if (result.terms) {
        setTerms(result.terms);
      } else {
        setTerms([]);
      }
    };
    loadTermsForForm();
  } else {
    setTerms([]);
  }
}, [formData.academic_year_id]);

  // Load students and options
  const loadStudents = async () => {
    setLoading(true);
    const result = await getStudents();
    if (!result.error && result.students) {
      setStudents(result.students);
      setFilteredStudents(result.students);
    }
    setLoading(false);
  };

  const loadOptions = async () => {
    setLoadingDropdowns(true);
    const [
      classesResult,
      yearsResult,
      guardiansResult,
      contactsResult,
      bloodResult,
      gendersResult,
      statusesResult,
    ] = await Promise.all([
      getClasses(),
      getAcademicYears(),
      getGuardians(),
      getContacts(),
      getBloodGroups(),
      getGenders(),
      getStudentStatuses(),
    ]);
    
    if (classesResult.classes) setClasses(classesResult.classes);
    if (yearsResult.years) setAcademicYears(yearsResult.years);
    if (guardiansResult.guardians) setGuardians(guardiansResult.guardians);
    if (contactsResult.contacts) setContacts(contactsResult.contacts);
    if (bloodResult.bloodGroups) setBloodGroups(bloodResult.bloodGroups);
    if (gendersResult.genders) setGenders(gendersResult.genders);
    if (statusesResult.statuses) setStatuses(statusesResult.statuses);
    
    setLoadingDropdowns(false);
  };

  // Load terms when academic year changes
  const loadTerms = async (academicYearId: number) => {
    const result = await getTerms(academicYearId);
    if (result.terms) {
      setTerms(result.terms);
    }
  };

  useEffect(() => {
    loadStudents();
    loadOptions();
  }, []);

  // Handle academic year change in class assignment
  useEffect(() => {
    if (selectedAcademicYearId) {
      loadTerms(parseInt(selectedAcademicYearId));
    } else {
      setTerms([]);
    }
  }, [selectedAcademicYearId]);

  // Load class history for a student
  const loadClassHistory = async (studentId: number) => {
    const result = await getStudentClassHistory(studentId);
    if (!result.error && result.history) {
      setClassHistory(result.history);
    }
  };

  // Handle open class assignment modal
  const handleOpenClassModal = async (student: Student) => {
    setSelectedStudent(student);
    setClassAssignmentForm({
      class_id: student.current_class_id?.toString() || "",
      term_id: "",
      academic_year_id: "",
    });
    setSelectedAcademicYearId("");
    await loadClassHistory(student.id);
    setShowClassModal(true);
  };

  // Handle assign class
  const handleAssignClass = async () => {
    if (!selectedStudent || !classAssignmentForm.class_id) {
      alert("Please select a class");
      return;
    }

    const result = await assignClass(
      selectedStudent.id,
      parseInt(classAssignmentForm.class_id),
      classAssignmentForm.term_id ? parseInt(classAssignmentForm.term_id) : undefined,
      classAssignmentForm.academic_year_id ? parseInt(classAssignmentForm.academic_year_id) : undefined,
    );

    if (result.success) {
      await loadStudents();
      if (selectedStudent) {
        await loadClassHistory(selectedStudent.id);
      }
      alert("Class assigned successfully");
      setShowClassModal(false);
    } else {
      alert(result.error);
    }
  };

  // Handle remove from class
  const handleRemoveFromClass = async (assignmentId: number) => {
    if (confirm("Are you sure you want to remove this class assignment?")) {
      const result = await removeStudentFromClass(assignmentId);
      if (result.success) {
        await loadStudents();
        if (selectedStudent) {
          await loadClassHistory(selectedStudent.id);
        }
        alert("Class assignment removed");
      } else {
        alert(result.error);
      }
    }
  };

  // Stats calculations
  const stats = useMemo(() => {
    const totalStudents = students.length;
    const activeStudents = students.filter((s) => s.status === "active").length;
    const maleStudents = students.filter((s) => s.gender === "male").length;
    const femaleStudents = students.filter((s) => s.gender === "female").length;
    const assignedToClass = students.filter((s) => s.current_class_id).length;

    return [
      {
        id: 1,
        label: "Total Students",
        value: totalStudents,
        trend: { value: 0, label: "total enrolled" },
        color: "blue",
        type: "students",
      },
      {
        id: 2,
        label: "Active Students",
        value: activeStudents,
        trend: { value: 0, label: "currently active" },
        color: "green",
        type: "students",
      },
      {
        id: 3,
        label: "Assigned to Class",
        value: assignedToClass,
        trend: { value: 0, label: "have class" },
        color: "purple",
        type: "attendance",
      },
      {
        id: 4,
        label: "Gender Ratio",
        value: `${maleStudents}/${femaleStudents}`,
        trend: { value: 0, label: "M/F" },
        color: "orange",
        type: "revenue",
      },
    ];
  }, [students]);


  

const getExportColumns = () => {
  return [
    {
      header: "Student Number",
      accessor: (row: Student) => row.student_number || "—",
    },
    {
      header: "Admission Number",
      accessor: (row: Student) => row.admission_number || "—",
    },
    {
      header: "Full Name",
      accessor: (row: Student) =>
        `${row.first_name} ${row.last_name}${
          row.other_names ? ` ${row.other_names}` : ""
        }`,
    },
    {
      header: "Gender",
      accessor: (row: Student) => row.gender || "—",
    },
    {
      header: "Current Class",
      accessor: (row: Student) => row.class?.name || "Not assigned",
    },
    {
      header: "Guardian",
      accessor: (row: Student) =>
        row.guardian
          ? `${row.guardian.first_name} ${row.guardian.last_name}`
          : "—",
    },
    {
      header: "Guardian Phone",
      accessor: (row: Student) => row.guardian?.phone || "—",
    },
    {
      header: "Status",
      accessor: (row: Student) => row.status || "—",
    },
    {
      header: "Medical Conditions",
      accessor: (row: Student) => row.medical_conditions || "—",
    },
    {
      header: "Allergies",
      accessor: (row: Student) => row.allergies || "—",
    },
    {
      header: "Blood Group",
      accessor: (row: Student) => row.blood_group || "—",
    },
    {
      header: "Enrollment Date",
      accessor: (row: Student) =>
        row.enrollment_date
          ? new Date(row.enrollment_date).toLocaleDateString()
          : "—",
    },
  ];
};

// Updated handleExport function
const handleExport = useCallback(
  async (format: "pdf" | "csv") => {
    const dataToExport =
      filteredStudents.length > 0 ? filteredStudents : students;

    if (dataToExport.length === 0) {
      alert("No data to export");
      return;
    }

    const columns = getExportColumns();
    const filename = `students-${new Date().toISOString().split("T")[0]}`;

    if (format === "csv") {
      exportToCSV(dataToExport, columns, { filename });
    } else {
      await exportToPDF(dataToExport, columns, {
        filename,
        title: "Student Management Report",
        subtitle: `Total Students: ${dataToExport.length}`,
        orientation: "landscape",
      });
    }
  },
  [filteredStudents, students]
);
  // Table columns configuration
  const columns = [
    {
      header: "Student Number",
      accessor: "student_number",
      sortable: true,
      width: "120px",
      render: (row: Student) => row.student_number || "—",
    },
    {
      header: "Full Name",
      accessor: "first_name",
      sortable: true,
      render: (row: Student) => (
        <div className={styles.studentCell}>
          <div className={styles.studentAvatar}>
            {row.image ? (
              <img src={row.image} alt={row.first_name} className={styles.avatarImage} />
            ) : (
              `${row.first_name?.[0]}${row.last_name?.[0]}`
            )}
          </div>
          <div>
            <div className={styles.studentName}>
              {row.first_name} {row.last_name}
            </div>
            <div className={styles.studentEmail}>
              {row.contact?.email || "No email"}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Admission No.",
      accessor: "admission_number",
      sortable: true,
      width: "120px",
      render: (row: Student) => row.admission_number || "—",
    },
    {
      header: "Current Class",
      accessor: "class",
      sortable: true,
      width: "150px",
      render: (row: Student) => (
        <div className={styles.classCell}>
          <span className={styles.className}>
            {row.class?.name || "Not assigned"}
          </span>
          <button
            className={styles.changeClassBtn}
            onClick={(e) => {
              e.stopPropagation();
              handleOpenClassModal(row);
            }}
            title="Manage class"
          >
            📋
          </button>
        </div>
      ),
    },
    {
      header: "Gender",
      accessor: "gender",
      sortable: true,
      width: "100px",
      render: (row: Student) => row.gender || "—",
    },
    {
      header: "Guardian",
      accessor: "guardian",
      width: "150px",
      render: (row: Student) =>
        row.guardian
          ? `${row.guardian.first_name} ${row.guardian.last_name}`
          : "—",
    },
    {
      header: "Status",
      accessor: "status",
      sortable: true,
      width: "100px",
      render: (row: Student) => {
        const statusColors: Record<string, string> = {
          active: styles.statusActive,
          inactive: styles.statusInactive,
          transferred: styles.statusTransferred,
          graduated: styles.statusGraduated,
          expelled: styles.statusExpelled,
          withdrawn: styles.statusWithdrawn,
          deleted: styles.statusDeleted,
        };
        return (
          <span className={`${styles.statusBadge} ${statusColors[row.status || "active"]}`}>
            {row.status || "active"}
          </span>
        );
      },
    },
  ];

  // Filter options
  const filterOptions = [
    {
      label: "Status",
      value: "status",
      key: "status",
      type: "select" as const,
      options: statuses.map((s) => ({ label: s.charAt(0).toUpperCase() + s.slice(1), value: s })),
    },
    {
      label: "Gender",
      value: "gender",
      key: "gender",
      type: "select" as const,
      options: genders.map((g) => ({ label: g.charAt(0).toUpperCase() + g.slice(1), value: g })),
    },
    {
      label: "Class",
      value: "class",
      key: "class",
      type: "select" as const,
      options: classes.map((c) => ({ label: c.name, value: c.id.toString() })),
    },
  ];

  const sortOptions = [
    { label: "Name (A-Z)", value: "name-asc", key: "first_name", order: "asc" as const },
    { label: "Name (Z-A)", value: "name-desc", key: "first_name", order: "desc" as const },
    { label: "Student No. (Asc)", value: "student_no-asc", key: "student_number", order: "asc" as const },
    { label: "Student No. (Desc)", value: "student_no-desc", key: "student_number", order: "desc" as const },
    { label: "Admission No. (Asc)", value: "admission-asc", key: "admission_number", order: "asc" as const },
    { label: "Admission No. (Desc)", value: "admission-desc", key: "admission_number", order: "desc" as const },
  ];

  // CRUD Operations
  const handleCreate = () => {
    setModalMode("create");
    setFormData({
      first_name: "",
      last_name: "",
      other_names: "",
      gender: "male",
      date_of_birth: "",
      admission_number: "",
      student_number: "",
      current_class_id: "",
      status: "active",
      guardian_id: "",
      contact_id: "",
      medical_conditions: "",
      allergies: "",
      blood_group: "",
      enrollment_date: new Date().toISOString().split("T")[0],
      prev_school_name: "",
      prev_school_class: "",
      prev_school_score: "",
      prev_school_year: "",
      guardian_first_name: "",
      guardian_last_name: "",
      guardian_relationship: "",
      guardian_email: "",
      guardian_phone: "",
      guardian_occupation: "",
      contact_email: "",
      contact_phone: "",
      contact_address: "",
      contact_city: "",
      contact_town: "",
      term_id: "",
      academic_year_id: "",
    });
    setImageFile(null);
    setShowModal(true);
  };

  const handleEdit = (student: Student) => {
    setModalMode("edit");
    setCurrentStudent(student);
    setFormData({
      first_name: student.first_name,
      last_name: student.last_name,
      other_names: student.other_names || "",
      gender: student.gender,
      date_of_birth: student.date_of_birth || "",
      admission_number: student.admission_number || "",
      student_number: student.student_number || "",
      current_class_id: student.current_class_id?.toString() || "",
      status: student.status || "active",
      guardian_id: student.guardian_id?.toString() || "",
      contact_id: student.contact_id?.toString() || "",
      medical_conditions: student.medical_conditions || "",
      allergies: student.allergies || "",
      blood_group: student.blood_group || "",
      enrollment_date: student.enrollment_date || new Date().toISOString().split("T")[0],
      prev_school_name: student.previous_school?.name || "",
      prev_school_class: student.previous_school?.class_ended || "",
      prev_school_score: student.previous_school?.average_score?.toString() || "",
      prev_school_year: student.previous_school?.year_attended?.toString() || "",
      guardian_first_name: student.guardian?.first_name || "",
      guardian_last_name: student.guardian?.last_name || "",
      guardian_relationship: student.guardian?.relationship || "",
      guardian_email: student.guardian?.email || "",
      guardian_phone: student.guardian?.phone || "",
      guardian_occupation: student.guardian?.occupation || "",
      contact_email: student.contact?.email || "",
      contact_phone: student.contact?.phone || "",
      contact_address: student.contact?.address || "",
      contact_city: student.contact?.city || "",
      contact_town: student.contact?.town || "",
      term_id: "",
      academic_year_id: "",
    });
    setImageFile(null);
    setShowModal(true);
  };

  const handleView = (student: Student) => {
    setModalMode("view");
    setCurrentStudent(student);
    setShowModal(true);
  };

  const handleDelete = (studentId: number) => {
    setStudentToDelete(studentId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (studentToDelete) {
      const result = await deleteStudent(studentToDelete);
      if (result.success) {
        await loadStudents();
      } else {
        alert(result.error);
      }
      setShowDeleteConfirm(false);
      setStudentToDelete(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const submitFormData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value) submitFormData.append(key, value);
    });
    if (imageFile) submitFormData.append("image", imageFile);

    let result;
    if (modalMode === "create") {
      result = await createStudent(submitFormData);
    } else if (modalMode === "edit" && currentStudent) {
      result = await updateStudent(currentStudent.id, submitFormData);
    }

    if (result?.success) {
      await loadStudents();
      setShowModal(false);
      setCurrentStudent(null);
    } else if (result?.error) {
      alert(result.error);
    }
    setIsSubmitting(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
  const actions: Action<Student>[] = [
    {
      label: "View",
      variant: "primary",
      onClick: (row: Student) => handleView(row),
      icon: (
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path fill="currentColor" d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z" />
        </svg>
      ),
    },
    {
      label: "Edit",
      variant: "secondary",
      onClick: (row: Student) => handleEdit(row),
      icon: (
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path fill="currentColor" d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />
        </svg>
      ),
    },
    {
      label: "Delete",
      variant: "danger",
      onClick: (row: Student) => handleDelete(row.id),
      icon: (
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path fill="currentColor" d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
        </svg>
      ),
    },
  ];

  // Loading state
  if (loading && students.length === 0) {
    return (
      <div className={styles.pageContainer}>
        <Header title="Student Management" subtitle="Manage student records" />
        <div className={styles.contentWrapper}>
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Loading students...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <Header
        title="Student Management"
        subtitle="Manage student records, class assignments, and academic performance"
        onExport={handleExport}
        exportOptions={[{ value: "students", label: "Students" }]}
       customActions={
          <button className={styles.addButton} onClick={handleCreate}>
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
            </svg>
            Add New Student
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
            data={students}
            onFilterChange={setFilteredStudents}
            searchKeys={["first_name", "last_name", "admission_number", "student_number", "guardian.first_name", "guardian.last_name"]}
            sortOptions={sortOptions}
            filterOptions={filterOptions}
            variant="default"
            showSearch={true}
            showSort={true}
            showFilter={true}
            searchPlaceholder="Search students by name, admission no., student ID..."
            enableReset={true}
          />
        </div>

        <div className={styles.tableSection}>
          <Table
            columns={columns}
            data={filteredStudents}
            variant="default"
            size="md"
            stickyHeader={true}
            sortable={true}
            pagination={true}
            pageSize={10}
            actions={actions}
            showRowNumbers={true}
            emptyMessage="No students found"
            loading={loading}
          />
        </div>
      </div>

      {/* Class Assignment Modal */}
      {showClassModal && selectedStudent && (
        <div className={styles.modalOverlay} onClick={() => setShowClassModal(false)}>
          <div className={`${styles.modal} ${styles.largeModal}`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Class History - {selectedStudent.first_name} {selectedStudent.last_name}</h2>
              <button className={styles.closeButton} onClick={() => setShowClassModal(false)}>
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                </svg>
              </button>
            </div>
            <div className={styles.modalBody}>
              {/* Current Class Assignment */}
              <div className={styles.formSection}>
                <h3 className={styles.sectionTitle}>Assign New Class</h3>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Select Class *</label>
                    <select
                      value={classAssignmentForm.class_id}
                      onChange={(e) => setClassAssignmentForm({ ...classAssignmentForm, class_id: e.target.value })}
                    >
                      <option value="">Select Class</option>
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Academic Year</label>
                    <select
                      value={selectedAcademicYearId}
                      onChange={(e) => setSelectedAcademicYearId(e.target.value)}
                    >
                      <option value="">Select Academic Year</option>
                      {academicYears.map((y) => (
                        <option key={y.id} value={y.id}>
                          {y.year} - {y.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Term</label>
                    <select
                      value={classAssignmentForm.term_id}
                      onChange={(e) => setClassAssignmentForm({ ...classAssignmentForm, term_id: e.target.value })}
                      disabled={!selectedAcademicYearId}
                    >
                      <option value="">Select Term</option>
                      {terms.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <button type="button" className={styles.submitButton} onClick={handleAssignClass}>
                  Assign Class
                </button>
              </div>

              {/* Class History */}
              <div className={styles.formSection}>
                <h3 className={styles.sectionTitle}>Class History</h3>
                {classHistory.length === 0 ? (
                  <p className={styles.noData}>No class history available</p>
                ) : (
                  <div className={styles.historyTable}>
                    <table className={styles.historyTable}>
                      <thead>
                        <tr>
                          <th>Class</th>
                          <th>Term</th>
                          <th>Academic Year</th>
                          <th>Current</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {classHistory.map((history) => (
                          <tr key={history.id}>
                            <td>{history.class?.name || "—"}</td>
                            <td>{history.term?.name || "—"}</td>
                            <td>{history.academic_year ? `${history.academic_year.year} - ${history.academic_year.name}` : "—"}</td>
                            <td>{history.is_current ? <span className={styles.currentBadge}>Current</span> : "—"}</td>
                            <td>
                              {!history.is_current && (
                                <button className={styles.removeBtn} onClick={() => handleRemoveFromClass(history.id)}>
                                  Remove
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelButton} onClick={() => setShowClassModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showModal && modalMode === "view" && currentStudent && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.viewModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Student Details</h2>
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
                  {currentStudent.image ? (
                    <img src={currentStudent.image} alt={currentStudent.first_name} />
                  ) : (
                    <span>{currentStudent.first_name?.[0]}{currentStudent.last_name?.[0]}</span>
                  )}
                </div>
                <div className={styles.profileInfo}>
                  <h3>{currentStudent.first_name} {currentStudent.last_name}</h3>
                  <p className={styles.profileStudentId}>Student No: {currentStudent.student_number}</p>
                  <p className={styles.profileAdmissionNo}>Admission No: {currentStudent.admission_number || "—"}</p>
                </div>
                <div className={styles.profileStatus}>
                  <span className={`${styles.statusBadge} ${currentStudent.status === "active" ? styles.statusActive : styles.statusInactive}`}>
                    {currentStudent.status}
                  </span>
                </div>
              </div>

              {/* Two Column Info */}
              <div className={styles.infoGrid}>
                <div className={styles.infoCard}>
                  <h4>Personal Information</h4>
                  <div className={styles.infoRow}><span>Full Name:</span><strong>{currentStudent.first_name} {currentStudent.last_name}</strong></div>
                  {currentStudent.other_names && <div className={styles.infoRow}><span>Other Names:</span><strong>{currentStudent.other_names}</strong></div>}
                  <div className={styles.infoRow}><span>Gender:</span><strong>{currentStudent.gender}</strong></div>
                  <div className={styles.infoRow}><span>Date of Birth:</span><strong>{currentStudent.date_of_birth ? new Date(currentStudent.date_of_birth).toLocaleDateString() : "—"}</strong></div>
                  <div className={styles.infoRow}><span>Blood Group:</span><strong>{currentStudent.blood_group || "—"}</strong></div>
                </div>

                <div className={styles.infoCard}>
                  <h4>Academic Information</h4>
                  <div className={styles.infoRow}><span>Current Class:</span><strong>{currentStudent.class?.name || "Not assigned"}</strong></div>
                  <div className={styles.infoRow}><span>Enrollment Date:</span><strong>{new Date(currentStudent.enrollment_date).toLocaleDateString()}</strong></div>
                  {currentStudent.previous_school && (
                    <>
                      <div className={styles.infoRow}><span>Previous School:</span><strong>{currentStudent.previous_school.name}</strong></div>
                      <div className={styles.infoRow}><span>Class Ended:</span><strong>{currentStudent.previous_school.class_ended || "—"}</strong></div>
                      <div className={styles.infoRow}><span>Average Score:</span><strong>{currentStudent.previous_school.average_score ? `${currentStudent.previous_school.average_score}%` : "—"}</strong></div>
                    </>
                  )}
                </div>

                <div className={styles.infoCard}>
                  <h4>Guardian Information</h4>
                  {currentStudent.guardian ? (
                    <>
                      <div className={styles.infoRow}><span>Name:</span><strong>{currentStudent.guardian.first_name} {currentStudent.guardian.last_name}</strong></div>
                      <div className={styles.infoRow}><span>Relationship:</span><strong>{currentStudent.guardian.relationship}</strong></div>
                      <div className={styles.infoRow}><span>Occupation:</span><strong>{currentStudent.guardian.occupation || "—"}</strong></div>
                      <div className={styles.infoRow}><span>Phone:</span><strong>{currentStudent.guardian.phone || "—"}</strong></div>
                      <div className={styles.infoRow}><span>Email:</span><strong>{currentStudent.guardian.email || "—"}</strong></div>
                    </>
                  ) : (
                    <div className={styles.infoRow}><span>No guardian information</span></div>
                  )}
                </div>

                <div className={styles.infoCard}>
                  <h4>Contact Information</h4>
                  {currentStudent.contact ? (
                    <>
                      <div className={styles.infoRow}><span>Phone:</span><strong>{currentStudent.contact.phone || "—"}</strong></div>
                      <div className={styles.infoRow}><span>Email:</span><strong>{currentStudent.contact.email || "—"}</strong></div>
                      <div className={styles.infoRow}><span>Address:</span><strong>{currentStudent.contact.address || "—"}</strong></div>
                      <div className={styles.infoRow}><span>City/Town:</span><strong>{currentStudent.contact.city || currentStudent.contact.town || "—"}</strong></div>
                    </>
                  ) : (
                    <div className={styles.infoRow}><span>No contact information</span></div>
                  )}
                </div>

                {(currentStudent.medical_conditions || currentStudent.allergies) && (
                  <div className={styles.infoCardFull}>
                    <h4>Medical Information</h4>
                    {currentStudent.medical_conditions && <div className={styles.infoRow}><span>Medical Conditions:</span><strong>{currentStudent.medical_conditions}</strong></div>}
                    {currentStudent.allergies && <div className={styles.infoRow}><span>Allergies:</span><strong>{currentStudent.allergies}</strong></div>}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && modalMode !== "view" && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={`${styles.modal} ${styles.largeModal}`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{modalMode === "create" ? "Add New Student" : "Edit Student"}</h2>
              <button className={styles.closeButton} onClick={() => setShowModal(false)}>
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.modalBody}>
              <div className={styles.formGrid}>
                {/* Personal Information */}
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
                      <label>Gender *</label>
                      <select name="gender" value={formData.gender} onChange={handleInputChange} required disabled={loadingDropdowns}>
                        <option value="">Select Gender</option>
                        {genders.map((g) => (
                          <option key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Date of Birth *</label>
                      <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleInputChange} required />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Blood Group</label>
                      <select name="blood_group" value={formData.blood_group} onChange={handleInputChange} disabled={loadingDropdowns}>
                        <option value="">Select Blood Group</option>
                        {bloodGroups.map((bg) => (
                          <option key={bg} value={bg}>{bg}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Admission Number</label>
                      <input type="text" name="admission_number" value={formData.admission_number} onChange={handleInputChange} placeholder="Auto-generated if left empty" />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Enrollment Date</label>
                      <input type="date" name="enrollment_date" value={formData.enrollment_date} onChange={handleInputChange} />
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Current Class</label>
                      <select name="current_class_id" value={formData.current_class_id} onChange={handleInputChange} disabled={loadingDropdowns}>
                        <option value="">Select Class</option>
                        {classes.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label>Status</label>
                      <select name="status" value={formData.status} onChange={handleInputChange} disabled={loadingDropdowns}>
                        {statuses.map((s) => (
                          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Student Photo</label>
                    <input type="file" accept="image/*" onChange={handleImageChange} />
                  </div>
                </div>

                {/* Medical Information */}
                <div className={styles.formSection}>
                  <h3 className={styles.sectionTitle}>Medical Information</h3>
                  <div className={styles.formGroup}>
                    <label>Medical Conditions</label>
                    <textarea name="medical_conditions" value={formData.medical_conditions} onChange={handleInputChange} rows={2} placeholder="Any medical conditions to be aware of..." />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Allergies</label>
                    <textarea name="allergies" value={formData.allergies} onChange={handleInputChange} rows={2} placeholder="Any allergies..." />
                  </div>
                </div>

                {/* Previous School */}
                <div className={styles.formSection}>
                  <h3 className={styles.sectionTitle}>Previous School (Optional)</h3>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>School Name</label>
                      <input type="text" name="prev_school_name" value={formData.prev_school_name} onChange={handleInputChange} placeholder="Previous school name" />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Class Ended</label>
                      <input type="text" name="prev_school_class" value={formData.prev_school_class} onChange={handleInputChange} placeholder="e.g., Class 5" />
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Average Score (%)</label>
                      <input type="number" name="prev_school_score" value={formData.prev_school_score} onChange={handleInputChange} min="0" max="100" placeholder="85" />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Year Attended</label>
                      <input type="number" name="prev_school_year" value={formData.prev_school_year} onChange={handleInputChange} placeholder="2023" />
                    </div>
                  </div>
                </div>

                {/* Guardian Information */}
                <div className={styles.formSection}>
                  <h3 className={styles.sectionTitle}>Guardian Information</h3>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Guardian (Optional)</label>
                      <select name="guardian_id" value={formData.guardian_id} onChange={handleInputChange} disabled={loadingDropdowns}>
                        <option value="">Select Existing Guardian</option>
                        {guardians.map((g) => (
                          <option key={g.id} value={g.id}>
                            {g.first_name} {g.last_name} ({g.relationship})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className={styles.formDivider}>OR Add New Guardian</div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>First Name</label>
                      <input type="text" name="guardian_first_name" value={formData.guardian_first_name} onChange={handleInputChange} placeholder="Guardian first name" />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Last Name</label>
                      <input type="text" name="guardian_last_name" value={formData.guardian_last_name} onChange={handleInputChange} placeholder="Guardian last name" />
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Relationship</label>
                      <input type="text" name="guardian_relationship" value={formData.guardian_relationship} onChange={handleInputChange} placeholder="e.g., Father, Mother" />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Occupation</label>
                      <input type="text" name="guardian_occupation" value={formData.guardian_occupation} onChange={handleInputChange} placeholder="Occupation" />
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Phone</label>
                      <input type="tel" name="guardian_phone" value={formData.guardian_phone} onChange={handleInputChange} placeholder="+233 XX XXX XXXX" />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Email</label>
                      <input type="email" name="guardian_email" value={formData.guardian_email} onChange={handleInputChange} placeholder="guardian@example.com" />
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className={styles.formSection}>
                  <h3 className={styles.sectionTitle}>Contact Information</h3>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Contact (Optional)</label>
                      <select name="contact_id" value={formData.contact_id} onChange={handleInputChange} disabled={loadingDropdowns}>
                        <option value="">Select Existing Contact</option>
                        {contacts.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.email || c.phone || `Contact #${c.id}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className={styles.formDivider}>OR Add New Contact</div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Email</label>
                      <input type="email" name="contact_email" value={formData.contact_email} onChange={handleInputChange} placeholder="student@school.edu" />
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

                {/* Class Assignment on Creation */}
                <div className={styles.formSection}>
                  <h3 className={styles.sectionTitle}>Initial Class Assignment (Optional)</h3>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Academic Year</label>
                      <select name="academic_year_id" value={formData.academic_year_id} onChange={handleInputChange} disabled={loadingDropdowns}>
                        <option value="">Select Academic Year</option>
                        {academicYears.map((y) => (
                          <option key={y.id} value={y.id}>{y.year} - {y.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label>Term</label>
                      <select name="term_id" value={formData.term_id} onChange={handleInputChange} disabled={!formData.academic_year_id || loadingDropdowns}>
                        <option value="">Select Term</option>
                        {terms.map((t) => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelButton} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : (modalMode === "create" ? "Create Student" : "Update Student")}
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
            <h3>Delete Student</h3>
            <p>Are you sure you want to delete this student? This action can be reversed.</p>
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

export default StudentAdminPage;