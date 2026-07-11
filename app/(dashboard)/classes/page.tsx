// app/(dashboard)/admin/classes/page.tsx
"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import styles from "./classes.module.css";
import Header from "@/components/Header/Header";
import Stats from "@/components/Stats/Stats";
import StatFilter from "@/components/StatFilter/StatFilter";
import Table from "@/components/Table/Table";
import {
  getClasses,
  createClass,
  updateClass,
  deleteClass,
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getTeacherSubjectClassAssignments,
  assignTeacherToSubjectClass,
  deleteTeacherSubjectClassAssignment,
  getAcademicYears,
  createAcademicYear,
  updateAcademicYear,
  deleteAcademicYear,
  getAvailableTeachers,
  getAvailableSubjects,
  getAvailableClasses,
  getAvailableAcademicYears,
  getAvailableTerms,
  getClassSubjects,
  assignSubjectToClass,
  removeSubjectFromClass,
  Class,
  Department,
  TeacherSubjectClass,
  AcademicYear,
  ClassSubject,
} from "@/lib/action/admin/class";
import { getAdminProfile, AdminProfile } from "@/lib/action/admin/profile";
import { Action } from "@/components/Table/Table";
import { exportToCSV } from "@/utils/export/csv";
import { exportToPDF } from "@/utils/export/pdf";

type TabType = "classes" | "departments" | "assignments" | "academic-years" | "class-subjects";

const ClassesAdminPage = () => {
  const [activeTab, setActiveTab] = useState<TabType>("classes");
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for Classes
  const [classes, setClasses] = useState<Class[]>([]);
  const [filteredClasses, setFilteredClasses] = useState<Class[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);

  // State for Departments
  const [departments, setDepartments] = useState<Department[]>([]);
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);

  // State for Assignments
  const [assignments, setAssignments] = useState<TeacherSubjectClass[]>([]);
  const [filteredAssignments, setFilteredAssignments] = useState<TeacherSubjectClass[]>([]);
  const [loadingAssignments, setLoadingAssignments] = useState(true);

  // State for Academic Years
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [filteredAcademicYears, setFilteredAcademicYears] = useState<AcademicYear[]>([]);
  const [loadingAcademicYears, setLoadingAcademicYears] = useState(true);

  // State for Class Subjects
  const [classSubjects, setClassSubjects] = useState<ClassSubject[]>([]);
  const [filteredClassSubjects, setFilteredClassSubjects] = useState<ClassSubject[]>([]);
  const [loadingClassSubjects, setLoadingClassSubjects] = useState(true);

  // Dropdown options
  const [teachers, setTeachers] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [availableClassesList, setAvailableClassesList] = useState<any[]>([]);
  const [availableAcademicYears, setAvailableAcademicYears] = useState<any[]>([]);
  const [availableTerms, setAvailableTerms] = useState<any[]>([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create");
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: number; type: string } | null>(null);

  // Assignment modal
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [assignmentForm, setAssignmentForm] = useState({
    teacher_id: "",
    subject_id: "",
    class_id: "",
    academic_year_id: "",
  });

  // Class Subject modal
  const [showClassSubjectModal, setShowClassSubjectModal] = useState(false);
  const [classSubjectForm, setClassSubjectForm] = useState({
    class_id: "",
    subject_id: "",
    academic_year_id: "",
    term_id: "",
    is_mandatory: true,
    weekly_hours: "1",
  });

  // Form state for Classes
  const [classFormData, setClassFormData] = useState({
    name: "",
    sequence: "",
    section: "",
    class_code: "",
    assigned_teacher: "",
    status: "active",
    max_students: "",
    level: "",
  });

  // Form state for Departments
  const [deptFormData, setDeptFormData] = useState({
    name: "",
    dep_code: "",
    description: "",
  });

  // Form state for Academic Years
  const [yearFormData, setYearFormData] = useState({
    name: "",
    year: "",
    start_date: "",
    end_date: "",
    is_active: false,
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
    loadClasses();
    loadDepartments();
    loadAssignments();
    loadAcademicYears();
    loadClassSubjects();
    loadDropdownOptions();
  }, []);

  // Load terms when academic year changes in class subject form
  useEffect(() => {
    if (classSubjectForm.academic_year_id) {
      loadTermsForClassSubject(parseInt(classSubjectForm.academic_year_id));
    } else {
      setAvailableTerms([]);
    }
  }, [classSubjectForm.academic_year_id]);

  const loadClasses = async () => {
    setLoadingClasses(true);
    const result = await getClasses();
    if (!result.error && result.classes) {
      setClasses(result.classes);
      setFilteredClasses(result.classes);
    }
    setLoadingClasses(false);
  };

  const loadDepartments = async () => {
    setLoadingDepartments(true);
    const result = await getDepartments();
    if (!result.error && result.departments) {
      setDepartments(result.departments);
      setFilteredDepartments(result.departments);
    }
    setLoadingDepartments(false);
  };

  const loadAssignments = async () => {
    setLoadingAssignments(true);
    const result = await getTeacherSubjectClassAssignments();
    if (!result.error && result.assignments) {
      setAssignments(result.assignments);
      setFilteredAssignments(result.assignments);
    }
    setLoadingAssignments(false);
  };

  const loadAcademicYears = async () => {
    setLoadingAcademicYears(true);
    const result = await getAcademicYears();
    if (!result.error && result.years) {
      setAcademicYears(result.years);
      setFilteredAcademicYears(result.years);
    }
    setLoadingAcademicYears(false);
  };

  const loadClassSubjects = async () => {
    setLoadingClassSubjects(true);
    const result = await getClassSubjects();
    if (!result.error && result.subjects) {
      setClassSubjects(result.subjects);
      setFilteredClassSubjects(result.subjects);
    }
    setLoadingClassSubjects(false);
  };

  const loadDropdownOptions = async () => {
    setLoadingDropdowns(true);
    const [teachersResult, subjectsResult, classesResult, yearsResult] = await Promise.all([
      getAvailableTeachers(),
      getAvailableSubjects(),
      getAvailableClasses(),
      getAvailableAcademicYears(),
    ]);

    if (teachersResult.teachers) setTeachers(teachersResult.teachers);
    if (subjectsResult.subjects) setSubjects(subjectsResult.subjects);
    if (classesResult.classes) setAvailableClassesList(classesResult.classes);
    if (yearsResult.years) setAvailableAcademicYears(yearsResult.years);
    setLoadingDropdowns(false);
  };

  const loadTermsForClassSubject = async (academicYearId: number) => {
    const result = await getAvailableTerms(academicYearId);
    if (result.terms) {
      setAvailableTerms(result.terms);
    }
  };

  // ============================================
  // EXPORT FUNCTIONALITY
  // ============================================

  // Export columns for Classes
  const getClassExportColumns = () => [
    { header: "Class Name", accessor: (row: Class) => row.name || "—" },
    { header: "Sequence", accessor: (row: Class) => row.sequence.toString() },
    { header: "Section", accessor: (row: Class) => row.section || "—" },
    { header: "Class Code", accessor: (row: Class) => row.class_code || "—" },
    { header: "Class Teacher", accessor: (row: Class) => row.teacher ? `${row.teacher.first_name} ${row.teacher.last_name}` : "Not assigned" },
    { header: "Level", accessor: (row: Class) => row.level || "—" },
    { header: "Max Students", accessor: (row: Class) => row.max_students?.toString() || "—" },
    { header: "Status", accessor: (row: Class) => row.status || "active" },
    { header: "Created Date", accessor: (row: Class) => new Date(row.created_at).toLocaleDateString() },
  ];

  // Export columns for Departments
  const getDepartmentExportColumns = () => [
    { header: "Department Name", accessor: (row: Department) => row.name || "—" },
    { header: "Department Code", accessor: (row: Department) => row.dep_code || "—" },
    { header: "Description", accessor: (row: Department) => row.description || "—" },
    { header: "Status", accessor: (row: Department) => row.status || "active" },
    { header: "Created Date", accessor: (row: Department) => new Date(row.created_at).toLocaleDateString() },
  ];

  // Export columns for Assignments
  const getAssignmentExportColumns = () => [
    { header: "Teacher", accessor: (row: TeacherSubjectClass) => row.teacher ? `${row.teacher.first_name} ${row.teacher.last_name}` : "—" },
    { header: "Subject", accessor: (row: TeacherSubjectClass) => row.subject ? row.subject.title : "—" },
    { header: "Class", accessor: (row: TeacherSubjectClass) => row.class ? row.class.name : "—" },
    { header: "Academic Year", accessor: (row: TeacherSubjectClass) => row.academic_year ? `${row.academic_year.year} - ${row.academic_year.name}` : "—" },
    { header: "Term", accessor: (row: TeacherSubjectClass) => row.term?.name || "—" },
    { header: "Is Class Teacher", accessor: (row: TeacherSubjectClass) => row.is_class_teacher ? "Yes" : "No" },
    { header: "Created Date", accessor: (row: TeacherSubjectClass) => new Date(row.created_at).toLocaleDateString() },
  ];

  // Export columns for Academic Years
  const getAcademicYearExportColumns = () => [
    { header: "Year", accessor: (row: AcademicYear) => row.year.toString() },
    { header: "Name", accessor: (row: AcademicYear) => row.name || "—" },
    { header: "Start Date", accessor: (row: AcademicYear) => row.start_date ? new Date(row.start_date).toLocaleDateString() : "—" },
    { header: "End Date", accessor: (row: AcademicYear) => row.end_date ? new Date(row.end_date).toLocaleDateString() : "—" },
    { header: "Status", accessor: (row: AcademicYear) => row.is_active ? "Active" : "Inactive" },
    { header: "Created Date", accessor: (row: AcademicYear) => new Date(row.created_at).toLocaleDateString() },
  ];

  // Export columns for Class Subjects
  const getClassSubjectExportColumns = () => [
    { header: "Class", accessor: (row: ClassSubject) => row.class ? `${row.class.name} ${row.class.section ? `- ${row.class.section}` : ""}` : "—" },
    { header: "Subject", accessor: (row: ClassSubject) => row.subject ? `${row.subject.title} (${row.subject.subject_code})` : "—" },
    { header: "Academic Year", accessor: (row: ClassSubject) => row.academic_year ? `${row.academic_year.year} - ${row.academic_year.name}` : "—" },
    { header: "Term", accessor: (row: ClassSubject) => row.term?.name || "Full Year" },
    { header: "Mandatory", accessor: (row: ClassSubject) => row.is_mandatory ? "Yes" : "No" },
    { header: "Weekly Hours", accessor: (row: ClassSubject) => row.weekly_hours?.toString() || "—" },
    { header: "Status", accessor: (row: ClassSubject) => row.status || "active" },
    { header: "Created Date", accessor: (row: ClassSubject) => new Date(row.created_at).toLocaleDateString() },
  ];

  const handleExport = useCallback(async (format: "pdf" | "csv", target?: string) => {
    if (!target) return;

    let dataToExport: any[] = [];
    let columns: any[] = [];
    let title = "";
    let filename = "";

    switch (target) {
      case "classes":
        dataToExport = filteredClasses.length > 0 ? filteredClasses : classes;
        columns = getClassExportColumns();
        title = "Class Management Report";
        filename = `classes-${new Date().toISOString().split("T")[0]}`;
        break;
      case "departments":
        dataToExport = filteredDepartments.length > 0 ? filteredDepartments : departments;
        columns = getDepartmentExportColumns();
        title = "Department Management Report";
        filename = `departments-${new Date().toISOString().split("T")[0]}`;
        break;
      case "assignments":
        dataToExport = filteredAssignments.length > 0 ? filteredAssignments : assignments;
        columns = getAssignmentExportColumns();
        title = "Teacher Assignment Report";
        filename = `assignments-${new Date().toISOString().split("T")[0]}`;
        break;
      case "academic-years":
        dataToExport = filteredAcademicYears.length > 0 ? filteredAcademicYears : academicYears;
        columns = getAcademicYearExportColumns();
        title = "Academic Year Report";
        filename = `academic-years-${new Date().toISOString().split("T")[0]}`;
        break;
      case "class-subjects":
        dataToExport = filteredClassSubjects.length > 0 ? filteredClassSubjects : classSubjects;
        columns = getClassSubjectExportColumns();
        title = "Class Subject Assignment Report";
        filename = `class-subjects-${new Date().toISOString().split("T")[0]}`;
        break;
      default:
        return;
    }

    if (dataToExport.length === 0) {
      alert(`No ${target} data to export`);
      return;
    }

    if (format === "csv") {
      exportToCSV(dataToExport, columns, { filename });
    } else {
      await exportToPDF(dataToExport, columns, {
        filename,
        title,
        subtitle: `Total Records: ${dataToExport.length} | Generated on ${new Date().toLocaleDateString()}`,
        orientation: "landscape",
      });
    }
  }, [
    filteredClasses,
    classes,
    filteredDepartments,
    departments,
    filteredAssignments,
    assignments,
    filteredAcademicYears,
    academicYears,
    filteredClassSubjects,
    classSubjects,
  ]);

  const exportOptions = [
    { value: "classes", label: "Classes" },
    { value: "departments", label: "Departments" },
    { value: "assignments", label: "Teacher Assignments" },
    { value: "academic-years", label: "Academic Years" },
    { value: "class-subjects", label: "Class Subjects" },
  ];

  // ============================================
  // END EXPORT FUNCTIONALITY
  // ============================================

  // Stats calculations
  const stats = useMemo(() => {
    const activeClasses = classes.filter((c) => c.status === "active").length;
    const totalStudents = classes.reduce((sum, c) => sum + (c.max_students || 0), 0);
    const activeDepartments = departments.filter((d) => d.status === "active").length;

    return [
      {
        id: 1,
        label: "Total Classes",
        value: classes.length,
        trend: { value: 0, label: "total" },
        color: "blue",
        type: "classes",
      },
      {
        id: 2,
        label: "Active Classes",
        value: activeClasses,
        trend: { value: 0, label: "currently active" },
        color: "green",
        type: "students",
      },
      {
        id: 3,
        label: "Total Capacity",
        value: totalStudents,
        trend: { value: 0, label: "max students" },
        color: "purple",
        type: "students",
      },
      {
        id: 4,
        label: "Departments",
        value: activeDepartments,
        trend: { value: 0, label: "active" },
        color: "orange",
        type: "attendance",
      },
    ];
  }, [classes, departments]);

  // Table columns for Classes
  const classColumns = [
    {
      header: "Class Name",
      accessor: "name",
      sortable: true,
      render: (row: Class) => (
        <div className={styles.classCell}>
          <div className={styles.classIcon}>
            {row.level === "preschool" ? "🎨" : row.level === "primary" ? "📚" : "📖"}
          </div>
          <div>
            <div className={styles.className}>{row.name}</div>
            <div className={styles.classLevel}>
              {row.level === "preschool" ? "Preschool" : row.level === "primary" ? "Primary" : "JHS"}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Sequence",
      accessor: "sequence",
      sortable: true,
      width: "100px",
    },
    {
      header: "Section",
      accessor: "section",
      sortable: true,
      width: "100px",
      render: (row: Class) => row.section || "—",
    },
    {
      header: "Class Code",
      accessor: "class_code",
      sortable: true,
      width: "120px",
      render: (row: Class) => row.class_code || "—",
    },
    {
      header: "Class Teacher",
      accessor: "assigned_teacher",
      sortable: true,
      render: (row: Class) =>
        row.teacher ? `${row.teacher.first_name} ${row.teacher.last_name}` : "Not assigned",
    },
    {
      header: "Max Students",
      accessor: "max_students",
      sortable: true,
      width: "120px",
      render: (row: Class) => row.max_students || "—",
    },
    {
      header: "Status",
      accessor: "status",
      sortable: true,
      width: "100px",
      render: (row: Class) => (
        <span className={`${styles.statusBadge} ${row.status === "active" ? styles.statusActive : styles.statusInactive}`}>
          {row.status}
        </span>
      ),
    },
  ];

  // Table columns for Departments
  const deptColumns = [
    {
      header: "Department Name",
      accessor: "name",
      sortable: true,
      render: (row: Department) => (
        <div className={styles.deptCell}>
          <div className={styles.deptIcon}>🏛️</div>
          <div>
            <div className={styles.deptName}>{row.name}</div>
            <div className={styles.deptCode}>{row.dep_code}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Department Code",
      accessor: "dep_code",
      sortable: true,
      width: "120px",
    },
    {
      header: "Description",
      accessor: "description",
      sortable: false,
      render: (row: Department) => row.description || "—",
    },
    {
      header: "Status",
      accessor: "status",
      sortable: true,
      width: "100px",
      render: (row: Department) => (
        <span className={`${styles.statusBadge} ${row.status === "active" ? styles.statusActive : styles.statusInactive}`}>
          {row.status}
        </span>
      ),
    },
    {
      header: "Created",
      accessor: "created_at",
      sortable: true,
      width: "150px",
      render: (row: Department) => new Date(row.created_at).toLocaleDateString(),
    },
  ];

  // Table columns for Assignments
  const assignmentColumns = [
    {
      header: "Teacher",
      accessor: "teacher",
      sortable: true,
      render: (row: TeacherSubjectClass) =>
        row.teacher ? `${row.teacher.first_name} ${row.teacher.last_name}` : "—",
    },
    {
      header: "Subject",
      accessor: "subject",
      sortable: true,
      render: (row: TeacherSubjectClass) => row.subject ? `${row.subject.title}` : "—",
    },
    {
      header: "Class",
      accessor: "class",
      sortable: true,
      render: (row: TeacherSubjectClass) => row.class ? `${row.class.name}` : "—",
    },
    {
      header: "Academic Year",
      accessor: "academic_year",
      sortable: true,
      width: "150px",
      render: (row: TeacherSubjectClass) =>
        row.academic_year ? `${row.academic_year.year} - ${row.academic_year.name}` : "—",
    },
    {
      header: "Created",
      accessor: "created_at",
      sortable: true,
      width: "150px",
      render: (row: TeacherSubjectClass) => new Date(row.created_at).toLocaleDateString(),
    },
  ];

  // Table columns for Academic Years
  const yearColumns = [
    {
      header: "Year",
      accessor: "year",
      sortable: true,
      width: "100px",
    },
    {
      header: "Name",
      accessor: "name",
      sortable: true,
      render: (row: AcademicYear) => row.name || "—",
    },
    {
      header: "Start Date",
      accessor: "start_date",
      sortable: true,
      width: "120px",
      render: (row: AcademicYear) =>
        row.start_date ? new Date(row.start_date).toLocaleDateString() : "—",
    },
    {
      header: "End Date",
      accessor: "end_date",
      sortable: true,
      width: "120px",
      render: (row: AcademicYear) =>
        row.end_date ? new Date(row.end_date).toLocaleDateString() : "—",
    },
    {
      header: "Status",
      accessor: "is_active",
      sortable: true,
      width: "100px",
      render: (row: AcademicYear) => (
        <span className={`${styles.statusBadge} ${row.is_active ? styles.statusActive : styles.statusInactive}`}>
          {row.is_active ? "Active" : "Inactive"}
        </span>
      ),
    },
  ];

  // Table columns for Class Subjects
  const classSubjectColumns = [
    {
      header: "Class",
      accessor: "class",
      sortable: true,
      render: (row: ClassSubject) =>
        row.class ? `${row.class.name} ${row.class.section ? `- ${row.class.section}` : ""}` : "—",
    },
    {
      header: "Subject",
      accessor: "subject",
      sortable: true,
      render: (row: ClassSubject) =>
        row.subject ? `${row.subject.title} (${row.subject.subject_code})` : "—",
    },
    {
      header: "Academic Year",
      accessor: "academic_year",
      sortable: true,
      width: "150px",
      render: (row: ClassSubject) =>
        row.academic_year ? `${row.academic_year.year} - ${row.academic_year.name}` : "—",
    },
    {
      header: "Term",
      accessor: "term",
      sortable: true,
      width: "100px",
      render: (row: ClassSubject) => row.term?.name || "Full Year",
    },
    {
      header: "Mandatory",
      accessor: "is_mandatory",
      sortable: true,
      width: "100px",
      render: (row: ClassSubject) => (
        <span className={`${styles.statusBadge} ${row.is_mandatory ? styles.statusActive : styles.statusInactive}`}>
          {row.is_mandatory ? "Yes" : "No"}
        </span>
      ),
    },
    {
      header: "Weekly Hours",
      accessor: "weekly_hours",
      sortable: true,
      width: "120px",
      render: (row: ClassSubject) => row.weekly_hours || "—",
    },
    {
      header: "Status",
      accessor: "status",
      sortable: true,
      width: "100px",
      render: (row: ClassSubject) => (
        <span className={`${styles.statusBadge} ${row.status === "active" ? styles.statusActive : styles.statusInactive}`}>
          {row.status}
        </span>
      ),
    },
  ];

  // Filter options for classes
  const classFilterOptions = [
    {
      label: "Level",
      value: "level",
      key: "level",
      type: "select" as const,
      options: [
        { label: "Preschool", value: "preschool" },
        { label: "Primary", value: "primary" },
        { label: "Junior High School", value: "jhs" },
      ],
    },
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
  ];

  // Filter options for class subjects
  const classSubjectFilterOptions = [
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
      label: "Mandatory",
      value: "is_mandatory",
      key: "is_mandatory",
      type: "select" as const,
      options: [
        { label: "Yes", value: "true" },
        { label: "No", value: "false" },
      ],
    },
  ];

  // CRUD Operations for Classes
  const handleCreateClass = () => {
    setModalMode("create");
    setClassFormData({
      name: "",
      sequence: "",
      section: "",
      class_code: "",
      assigned_teacher: "",
      status: "active",
      max_students: "",
      level: "primary",
    });
    setShowModal(true);
  };

  const handleEditClass = (item: Class) => {
    setModalMode("edit");
    setCurrentItem(item);
    setClassFormData({
      name: item.name,
      sequence: item.sequence.toString(),
      section: item.section || "",
      class_code: item.class_code || "",
      assigned_teacher: item.assigned_teacher?.toString() || "",
      status: item.status,
      max_students: item.max_students?.toString() || "",
      level: item.level,
    });
    setShowModal(true);
  };

  const handleViewClass = (item: Class) => {
    setModalMode("view");
    setCurrentItem(item);
    setShowModal(true);
  };

  const handleClassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData();
    Object.entries(classFormData).forEach(([key, value]) => {
      if (value) formData.append(key, value);
    });

    let result;
    if (modalMode === "create") {
      result = await createClass(formData);
    } else if (modalMode === "edit" && currentItem) {
      result = await updateClass(currentItem.id, formData);
    }

    if (result?.success) {
      await loadClasses();
      setShowModal(false);
    } else if (result?.error) {
      alert(result.error);
    }
    setIsSubmitting(false);
  };

  // CRUD Operations for Departments
  const handleCreateDept = () => {
    setModalMode("create");
    setDeptFormData({ name: "", dep_code: "", description: "" });
    setShowModal(true);
  };

  const handleEditDept = (item: Department) => {
    setModalMode("edit");
    setCurrentItem(item);
    setDeptFormData({
      name: item.name,
      dep_code: item.dep_code || "",
      description: item.description || "",
    });
    setShowModal(true);
  };

  const handleViewDept = (item: Department) => {
    setModalMode("view");
    setCurrentItem(item);
    setShowModal(true);
  };

  const handleDeptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("name", deptFormData.name);
    formData.append("dep_code", deptFormData.dep_code);
    if (deptFormData.description) formData.append("description", deptFormData.description);

    let result;
    if (modalMode === "create") {
      result = await createDepartment(formData);
    } else if (modalMode === "edit" && currentItem) {
      result = await updateDepartment(currentItem.id, formData);
    }

    if (result?.success) {
      await loadDepartments();
      setShowModal(false);
    } else if (result?.error) {
      alert(result.error);
    }
    setIsSubmitting(false);
  };

  // CRUD Operations for Academic Years
  const handleCreateYear = () => {
    setModalMode("create");
    setYearFormData({
      name: "",
      year: "",
      start_date: "",
      end_date: "",
      is_active: false,
    });
    setShowModal(true);
  };

  const handleEditYear = (item: AcademicYear) => {
    setModalMode("edit");
    setCurrentItem(item);
    setYearFormData({
      name: item.name || "",
      year: item.year.toString(),
      start_date: item.start_date || "",
      end_date: item.end_date || "",
      is_active: item.is_active,
    });
    setShowModal(true);
  };

  const handleViewYear = (item: AcademicYear) => {
    setModalMode("view");
    setCurrentItem(item);
    setShowModal(true);
  };

  const handleYearSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("name", yearFormData.name);
    formData.append("year", yearFormData.year);
    if (yearFormData.start_date) formData.append("start_date", yearFormData.start_date);
    if (yearFormData.end_date) formData.append("end_date", yearFormData.end_date);
    formData.append("is_active", String(yearFormData.is_active));

    let result;
    if (modalMode === "create") {
      result = await createAcademicYear(formData);
    } else if (modalMode === "edit" && currentItem) {
      result = await updateAcademicYear(currentItem.id, formData);
    }

    if (result?.success) {
      await loadAcademicYears();
      setShowModal(false);
    } else if (result?.error) {
      alert(result.error);
    }
    setIsSubmitting(false);
  };

  // Assignment operations
  const handleOpenAssignmentModal = () => {
    setAssignmentForm({
      teacher_id: "",
      subject_id: "",
      class_id: "",
      academic_year_id: "",
    });
    setShowAssignmentModal(true);
  };

  const handleAssignmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!assignmentForm.teacher_id || !assignmentForm.subject_id || !assignmentForm.class_id) {
      alert("Please select teacher, subject, and class");
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append("teacher_id", assignmentForm.teacher_id);
    formData.append("subject_id", assignmentForm.subject_id);
    formData.append("class_id", assignmentForm.class_id);
    if (assignmentForm.academic_year_id) formData.append("academic_year_id", assignmentForm.academic_year_id);

    const result = await assignTeacherToSubjectClass(formData);
    if (result?.success) {
      await loadAssignments();
      setShowAssignmentModal(false);
    } else if (result?.error) {
      alert(result.error);
    }
    setIsSubmitting(false);
  };

  const handleDeleteAssignment = async (id: number) => {
    const result = await deleteTeacherSubjectClassAssignment(id);
    if (result?.success) {
      await loadAssignments();
    } else if (result?.error) {
      alert(result.error);
    }
  };

  // Class Subject operations
  const handleOpenClassSubjectModal = () => {
    setClassSubjectForm({
      class_id: "",
      subject_id: "",
      academic_year_id: "",
      term_id: "",
      is_mandatory: true,
      weekly_hours: "1",
    });
    setAvailableTerms([]);
    setShowClassSubjectModal(true);
  };

  const handleClassSubjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!classSubjectForm.class_id || !classSubjectForm.subject_id || !classSubjectForm.academic_year_id) {
      alert("Please select class, subject, and academic year");
      setIsSubmitting(false);
      return;
    }

    const result = await assignSubjectToClass(
      parseInt(classSubjectForm.class_id),
      parseInt(classSubjectForm.subject_id),
      parseInt(classSubjectForm.academic_year_id),
      classSubjectForm.term_id ? parseInt(classSubjectForm.term_id) : undefined,
      classSubjectForm.is_mandatory,
      parseInt(classSubjectForm.weekly_hours)
    );

    if (result?.success) {
      await loadClassSubjects();
      setShowClassSubjectModal(false);
    } else if (result?.error) {
      alert(result.error);
    }
    setIsSubmitting(false);
  };

  const handleDeleteClassSubject = async (classId: number, subjectId: number, academicYearId: number, termId?: number) => {
    const result = await removeSubjectFromClass(classId, subjectId, academicYearId, termId);
    if (result?.success) {
      await loadClassSubjects();
    } else if (result?.error) {
      alert(result.error);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    let result;
    if (itemToDelete.type === "class") {
      result = await deleteClass(itemToDelete.id);
      if (result?.success) await loadClasses();
    } else if (itemToDelete.type === "department") {
      result = await deleteDepartment(itemToDelete.id);
      if (result?.success) await loadDepartments();
    } else if (itemToDelete.type === "academic-year") {
      result = await deleteAcademicYear(itemToDelete.id);
      if (result?.success) await loadAcademicYears();
    }

    if (result?.error) alert(result.error);
    setShowDeleteConfirm(false);
    setItemToDelete(null);
  };

  // Actions for tables
  const classActions: Action<Class>[] = [
    { label: "View", variant: "primary", onClick: (row) => handleViewClass(row) },
    { label: "Edit", variant: "secondary", onClick: (row) => handleEditClass(row) },
    {
      label: "Delete",
      variant: "danger",
      onClick: (row) => {
        setItemToDelete({ id: row.id, type: "class" });
        setShowDeleteConfirm(true);
      },
    },
  ];

  const deptActions: Action<Department>[] = [
    { label: "View", variant: "primary", onClick: (row) => handleViewDept(row) },
    { label: "Edit", variant: "secondary", onClick: (row) => handleEditDept(row) },
    {
      label: "Delete",
      variant: "danger",
      onClick: (row) => {
        setItemToDelete({ id: row.id, type: "department" });
        setShowDeleteConfirm(true);
      },
    },
  ];

  const assignmentActions: Action<TeacherSubjectClass>[] = [
    { label: "Remove", variant: "danger", onClick: (row) => handleDeleteAssignment(row.id) },
  ];

  const yearActions: Action<AcademicYear>[] = [
    { label: "View", variant: "primary", onClick: (row) => handleViewYear(row) },
    { label: "Edit", variant: "secondary", onClick: (row) => handleEditYear(row) },
    {
      label: "Delete",
      variant: "danger",
      onClick: (row) => {
        setItemToDelete({ id: row.id, type: "academic-year" });
        setShowDeleteConfirm(true);
      },
    },
  ];

  const classSubjectActions: Action<ClassSubject>[] = [
    {
      label: "Remove",
      variant: "danger",
      onClick: (row) => {
        handleDeleteClassSubject(row.class_id, row.subject_id, row.academic_year_id, row.term_id || undefined);
      },
    },
  ];

  // Render modal content based on active tab and mode
  const renderModalContent = () => {
    if (modalMode === "view" && currentItem) {
      if (activeTab === "classes") {
        const item = currentItem as Class;
        return (
          <div className={styles.viewModalBody}>
            <div className={styles.viewHeader}>
              <div className={styles.viewAvatar}>
                {item.level === "preschool" ? "🎨" : item.level === "primary" ? "📚" : "📖"}
              </div>
              <div className={styles.viewInfo}>
                <h3>{item.name}</h3>
                <p>Class Code: {item.class_code || "—"}</p>
              </div>
            </div>
            <div className={styles.viewGrid}>
              <div className={styles.viewCard}>
                <h4>Basic Information</h4>
                <div className={styles.viewRow}><span>Name:</span><strong>{item.name}</strong></div>
                <div className={styles.viewRow}><span>Sequence:</span><strong>{item.sequence}</strong></div>
                <div className={styles.viewRow}><span>Section:</span><strong>{item.section || "—"}</strong></div>
                <div className={styles.viewRow}><span>Level:</span><strong>{item.level}</strong></div>
              </div>
              <div className={styles.viewCard}>
                <h4>Capacity & Staff</h4>
                <div className={styles.viewRow}><span>Max Students:</span><strong>{item.max_students || "—"}</strong></div>
                <div className={styles.viewRow}>
                  <span>Class Teacher:</span>
                  <strong>{item.teacher ? `${item.teacher.first_name} ${item.teacher.last_name}` : "Not assigned"}</strong>
                </div>
                <div className={styles.viewRow}><span>Status:</span><strong>{item.status}</strong></div>
                <div className={styles.viewRow}><span>Created:</span><strong>{new Date(item.created_at).toLocaleDateString()}</strong></div>
              </div>
            </div>
          </div>
        );
      }

      if (activeTab === "departments") {
        const item = currentItem as Department;
        return (
          <div className={styles.viewModalBody}>
            <div className={styles.viewHeader}>
              <div className={styles.viewAvatar}>🏛️</div>
              <div className={styles.viewInfo}>
                <h3>{item.name}</h3>
                <p>Code: {item.dep_code}</p>
              </div>
            </div>
            <div className={styles.viewGrid}>
              <div className={styles.viewCard}>
                <h4>Department Information</h4>
                <div className={styles.viewRow}><span>Name:</span><strong>{item.name}</strong></div>
                <div className={styles.viewRow}><span>Code:</span><strong>{item.dep_code}</strong></div>
                <div className={styles.viewRow}><span>Description:</span><strong>{item.description || "—"}</strong></div>
                <div className={styles.viewRow}><span>Status:</span><strong>{item.status}</strong></div>
                <div className={styles.viewRow}><span>Created:</span><strong>{new Date(item.created_at).toLocaleDateString()}</strong></div>
              </div>
            </div>
          </div>
        );
      }

      if (activeTab === "academic-years") {
        const item = currentItem as AcademicYear;
        return (
          <div className={styles.viewModalBody}>
            <div className={styles.viewHeader}>
              <div className={styles.viewAvatar}>📅</div>
              <div className={styles.viewInfo}>
                <h3>{item.name}</h3>
                <p>{item.year}</p>
              </div>
            </div>
            <div className={styles.viewGrid}>
              <div className={styles.viewCard}>
                <h4>Academic Year Details</h4>
                <div className={styles.viewRow}><span>Name:</span><strong>{item.name}</strong></div>
                <div className={styles.viewRow}><span>Year:</span><strong>{item.year}</strong></div>
                <div className={styles.viewRow}><span>Start Date:</span><strong>{item.start_date ? new Date(item.start_date).toLocaleDateString() : "—"}</strong></div>
                <div className={styles.viewRow}><span>End Date:</span><strong>{item.end_date ? new Date(item.end_date).toLocaleDateString() : "—"}</strong></div>
                <div className={styles.viewRow}><span>Status:</span><strong>{item.is_active ? "Active" : "Inactive"}</strong></div>
              </div>
            </div>
            {item.terms && item.terms.length > 0 && (
              <div className={styles.viewCard}>
                <h4>Terms</h4>
                {item.terms.map((term: any) => (
                  <div key={term.id} className={styles.viewRow}>
                    <span>{term.name}:</span>
                    <strong>{term.start_date ? new Date(term.start_date).toLocaleDateString() : "TBD"} - {term.end_date ? new Date(term.end_date).toLocaleDateString() : "TBD"}</strong>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      }
    }

    // Create/Edit forms
    if (activeTab === "classes") {
      return (
        <div className={styles.formGrid}>
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>Basic Information</h3>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Class Name *</label>
                <input type="text" name="name" value={classFormData.name} onChange={(e) => setClassFormData({ ...classFormData, name: e.target.value })} required placeholder="JHS 2" />
              </div>
              <div className={styles.formGroup}>
                <label>Sequence *</label>
                <input type="number" name="sequence" value={classFormData.sequence} onChange={(e) => setClassFormData({ ...classFormData, sequence: e.target.value })} required placeholder="8" />
              </div>
            </div>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Section</label>
                <input type="text" name="section" value={classFormData.section} onChange={(e) => setClassFormData({ ...classFormData, section: e.target.value })} placeholder="A" />
              </div>
              <div className={styles.formGroup}>
                <label>Class Code</label>
                <input type="text" name="class_code" value={classFormData.class_code} onChange={(e) => setClassFormData({ ...classFormData, class_code: e.target.value })} placeholder="JHS-2A" />
              </div>
            </div>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Level *</label>
                <select name="level" value={classFormData.level} onChange={(e) => setClassFormData({ ...classFormData, level: e.target.value })} required disabled={modalMode === "view"}>
                  <option value="preschool">Preschool</option>
                  <option value="primary">Primary</option>
                  <option value="jhs">Junior High School (JHS)</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Max Students</label>
                <input type="number" name="max_students" value={classFormData.max_students} onChange={(e) => setClassFormData({ ...classFormData, max_students: e.target.value })} placeholder="40" />
              </div>
            </div>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Assigned Teacher</label>
                <select name="assigned_teacher" value={classFormData.assigned_teacher} onChange={(e) => setClassFormData({ ...classFormData, assigned_teacher: e.target.value })} disabled={loadingDropdowns}>
                  <option value="">Select Teacher</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Status</label>
                <select name="status" value={classFormData.status} onChange={(e) => setClassFormData({ ...classFormData, status: e.target.value })}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === "departments") {
      return (
        <div className={styles.formGrid}>
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>Department Information</h3>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Department Name *</label>
                <input type="text" name="name" value={deptFormData.name} onChange={(e) => setDeptFormData({ ...deptFormData, name: e.target.value })} required placeholder="Science" />
              </div>
              <div className={styles.formGroup}>
                <label>Department Code *</label>
                <input type="text" name="dep_code" value={deptFormData.dep_code} onChange={(e) => setDeptFormData({ ...deptFormData, dep_code: e.target.value })} required placeholder="SCI" />
              </div>
            </div>
            <div className={styles.formGroup}>
              <label>Description</label>
              <textarea name="description" value={deptFormData.description} onChange={(e) => setDeptFormData({ ...deptFormData, description: e.target.value })} rows={3} placeholder="Department description..." />
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === "academic-years") {
      return (
        <div className={styles.formGrid}>
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>Academic Year Information</h3>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Academic Year Name *</label>
                <input type="text" name="name" value={yearFormData.name} onChange={(e) => setYearFormData({ ...yearFormData, name: e.target.value })} required placeholder="2024-2025 Academic Year" />
              </div>
              <div className={styles.formGroup}>
                <label>Year *</label>
                <input type="number" name="year" value={yearFormData.year} onChange={(e) => setYearFormData({ ...yearFormData, year: e.target.value })} required placeholder="2024" />
              </div>
            </div>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Start Date *</label>
                <input type="date" name="start_date" value={yearFormData.start_date} onChange={(e) => setYearFormData({ ...yearFormData, start_date: e.target.value })} required />
              </div>
              <div className={styles.formGroup}>
                <label>End Date *</label>
                <input type="date" name="end_date" value={yearFormData.end_date} onChange={(e) => setYearFormData({ ...yearFormData, end_date: e.target.value })} required />
              </div>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.checkboxLabel}>
                <input type="checkbox" name="is_active" checked={yearFormData.is_active} onChange={(e) => setYearFormData({ ...yearFormData, is_active: e.target.checked })} />
                Set as Active Academic Year
              </label>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  // Loading state for entire page
  if (loadingClasses && loadingDepartments && loadingAssignments && loadingAcademicYears && loadingClassSubjects) {
    return (
      <div className={styles.pageContainer}>
        <Header title="Class & Department Management" subtitle="Loading..." />
        <div className={styles.contentWrapper}>
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Loading data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <Header
        title="Class & Department Management"
        subtitle="Manage classes, departments, teacher assignments, class subjects, and academic years"
        onExport={handleExport}
        exportOptions={exportOptions}
       customActions={
          activeTab === "classes" ? (
            <button className={styles.addButton} onClick={handleCreateClass}>
              <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" /></svg>
              Add New Class
            </button>
          ) : activeTab === "departments" ? (
            <button className={styles.addButton} onClick={handleCreateDept}>
              <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" /></svg>
              Add Department
            </button>
          ) : activeTab === "assignments" ? (
            <button className={styles.addButton} onClick={handleOpenAssignmentModal}>
              <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M12,2C6.48,2,2,6.48,2,12s4.48,10,10,10s10-4.48,10-10S17.52,2,12,2z M12,20c-4.41,0-8-3.59-8-8s3.59-8,8-8s8,3.59,8,8 S16.41,20,12,20z M13,7h-2v6h6v-2h-4V7z" /></svg>
              Assign Teacher
            </button>
          ) : activeTab === "class-subjects" ? (
            <button className={styles.addButton} onClick={handleOpenClassSubjectModal}>
              <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M12,2C6.48,2,2,6.48,2,12s4.48,10,10,10s10-4.48,10-10S17.52,2,12,2z M12,20c-4.41,0-8-3.59-8-8s3.59-8,8-8s8,3.59,8,8 S16.41,20,12,20z M13,7h-2v6h6v-2h-4V7z" /></svg>
              Assign Subject to Class
            </button>
          ) : (
            <button className={styles.addButton} onClick={handleCreateYear}>
              <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" /></svg>
              Add Academic Year
            </button>
          )
        }
      />

      <div className={styles.contentWrapper}>
        {/* Tabs */}
        <div className={styles.tabsContainer}>
          <button className={`${styles.tab} ${activeTab === "classes" ? styles.activeTab : ""}`} onClick={() => setActiveTab("classes")}>Classes</button>
          <button className={`${styles.tab} ${activeTab === "departments" ? styles.activeTab : ""}`} onClick={() => setActiveTab("departments")}>Departments</button>
          <button className={`${styles.tab} ${activeTab === "assignments" ? styles.activeTab : ""}`} onClick={() => setActiveTab("assignments")}>Teacher Assignments</button>
          <button className={`${styles.tab} ${activeTab === "class-subjects" ? styles.activeTab : ""}`} onClick={() => setActiveTab("class-subjects")}>Class Subjects</button>
          <button className={`${styles.tab} ${activeTab === "academic-years" ? styles.activeTab : ""}`} onClick={() => setActiveTab("academic-years")}>Academic Years</button>
        </div>

        <Stats stats={stats} variant="cards" columns={4} showTrend={true} showIcon={true} size="md" />

        {activeTab === "classes" && (
          <>
            <div className={styles.filterSection}>
              <StatFilter
                data={classes}
                onFilterChange={setFilteredClasses}
                searchKeys={["name", "class_code", "teacher.first_name", "teacher.last_name"]}
                sortOptions={[]}
                filterOptions={classFilterOptions}
                variant="default"
                showSearch={true}
                showSort={true}
                showFilter={true}
                searchPlaceholder="Search classes..."
                enableReset={true}
              />
            </div>
            <div className={styles.tableSection}>
              <Table
                columns={classColumns}
                data={filteredClasses}
                variant="default"
                size="md"
                stickyHeader={true}
                sortable={true}
                pagination={true}
                pageSize={10}
                actions={classActions}
                showRowNumbers={true}
                emptyMessage="No classes found"
                loading={loadingClasses}
              />
            </div>
          </>
        )}

        {activeTab === "departments" && (
          <>
            <div className={styles.filterSection}>
              <StatFilter
                data={departments}
                onFilterChange={setFilteredDepartments}
                searchKeys={["name", "dep_code", "description"]}
                sortOptions={[]}
                filterOptions={[]}
                variant="default"
                showSearch={true}
                showSort={true}
                showFilter={false}
                searchPlaceholder="Search departments..."
                enableReset={true}
              />
            </div>
            <div className={styles.tableSection}>
              <Table
                columns={deptColumns}
                data={filteredDepartments}
                variant="default"
                size="md"
                stickyHeader={true}
                sortable={true}
                pagination={true}
                pageSize={10}
                actions={deptActions}
                showRowNumbers={true}
                emptyMessage="No departments found"
                loading={loadingDepartments}
              />
            </div>
          </>
        )}

        {activeTab === "assignments" && (
          <div className={styles.tableSection}>
            <Table
              columns={assignmentColumns}
              data={assignments}
              variant="default"
              size="md"
              stickyHeader={true}
              sortable={true}
              pagination={true}
              pageSize={10}
              actions={assignmentActions}
              showRowNumbers={true}
              emptyMessage="No assignments found"
              loading={loadingAssignments}
            />
          </div>
        )}

        {activeTab === "class-subjects" && (
          <>
            <div className={styles.filterSection}>
              <StatFilter
                data={classSubjects}
                onFilterChange={setFilteredClassSubjects}
                searchKeys={["class.name", "subject.title", "subject.subject_code"]}
                sortOptions={[]}
                filterOptions={classSubjectFilterOptions}
                variant="default"
                showSearch={true}
                showSort={true}
                showFilter={true}
                searchPlaceholder="Search class subjects..."
                enableReset={true}
              />
            </div>
            <div className={styles.tableSection}>
              <Table
                columns={classSubjectColumns}
                data={filteredClassSubjects}
                variant="default"
                size="md"
                stickyHeader={true}
                sortable={true}
                pagination={true}
                pageSize={10}
                actions={classSubjectActions}
                showRowNumbers={true}
                emptyMessage="No class subject assignments found"
                loading={loadingClassSubjects}
              />
            </div>
          </>
        )}

        {activeTab === "academic-years" && (
          <>
            <div className={styles.filterSection}>
              <StatFilter
                data={academicYears}
                onFilterChange={setFilteredAcademicYears}
                searchKeys={["year", "name"]}
                sortOptions={[]}
                filterOptions={[]}
                variant="default"
                showSearch={true}
                showSort={true}
                showFilter={false}
                searchPlaceholder="Search academic years..."
                enableReset={true}
              />
            </div>
            <div className={styles.tableSection}>
              <Table
                columns={yearColumns}
                data={filteredAcademicYears}
                variant="default"
                size="md"
                stickyHeader={true}
                sortable={true}
                pagination={true}
                pageSize={10}
                actions={yearActions}
                showRowNumbers={true}
                emptyMessage="No academic years found"
                loading={loadingAcademicYears}
              />
            </div>
          </>
        )}
      </div>

      {/* Assignment Modal */}
      {showAssignmentModal && (
        <div className={styles.modalOverlay} onClick={() => setShowAssignmentModal(false)}>
          <div className={`${styles.modal} ${styles.largeModal}`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Assign Teacher to Subject & Class</h2>
              <button className={styles.closeButton} onClick={() => setShowAssignmentModal(false)}>
                <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" /></svg>
              </button>
            </div>
            <form onSubmit={handleAssignmentSubmit}>
              <div className={styles.modalBody}>
                <div className={styles.formSection}>
                  <h3 className={styles.sectionTitle}>Assignment Details</h3>
                  <div className={styles.formGroup}>
                    <label>Teacher *</label>
                    <select value={assignmentForm.teacher_id} onChange={(e) => setAssignmentForm({ ...assignmentForm, teacher_id: e.target.value })} required disabled={loadingDropdowns}>
                      <option value="">Select Teacher</option>
                      {teachers.map((t) => (<option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>))}
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Subject *</label>
                    <select value={assignmentForm.subject_id} onChange={(e) => setAssignmentForm({ ...assignmentForm, subject_id: e.target.value })} required disabled={loadingDropdowns}>
                      <option value="">Select Subject</option>
                      {subjects.map((s) => (<option key={s.id} value={s.id}>{s.title} ({s.subject_code})</option>))}
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Class *</label>
                    <select value={assignmentForm.class_id} onChange={(e) => setAssignmentForm({ ...assignmentForm, class_id: e.target.value })} required disabled={loadingDropdowns}>
                      <option value="">Select Class</option>
                      {availableClassesList.map((c) => (<option key={c.id} value={c.id}>{c.name} ({c.level})</option>))}
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Academic Year (Optional)</label>
                    <select value={assignmentForm.academic_year_id} onChange={(e) => setAssignmentForm({ ...assignmentForm, academic_year_id: e.target.value })} disabled={loadingDropdowns}>
                      <option value="">Select Academic Year</option>
                      {availableAcademicYears.map((y) => (<option key={y.id} value={y.id}>{y.year} - {y.name}</option>))}
                    </select>
                  </div>
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelButton} onClick={() => setShowAssignmentModal(false)}>Cancel</button>
                <button type="submit" className={styles.submitButton} disabled={isSubmitting}>{isSubmitting ? "Creating..." : "Create Assignment"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Class Subject Modal */}
      {showClassSubjectModal && (
        <div className={styles.modalOverlay} onClick={() => setShowClassSubjectModal(false)}>
          <div className={`${styles.modal} ${styles.largeModal}`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Assign Subject to Class</h2>
              <button className={styles.closeButton} onClick={() => setShowClassSubjectModal(false)}>
                <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" /></svg>
              </button>
            </div>
            <form onSubmit={handleClassSubjectSubmit}>
              <div className={styles.modalBody}>
                <div className={styles.formSection}>
                  <h3 className={styles.sectionTitle}>Assignment Details</h3>
                  <div className={styles.formGroup}>
                    <label>Class *</label>
                    <select value={classSubjectForm.class_id} onChange={(e) => setClassSubjectForm({ ...classSubjectForm, class_id: e.target.value })} required disabled={loadingDropdowns}>
                      <option value="">Select Class</option>
                      {availableClassesList.map((c) => (<option key={c.id} value={c.id}>{c.name} ({c.level})</option>))}
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Subject *</label>
                    <select value={classSubjectForm.subject_id} onChange={(e) => setClassSubjectForm({ ...classSubjectForm, subject_id: e.target.value })} required disabled={loadingDropdowns}>
                      <option value="">Select Subject</option>
                      {subjects.map((s) => (<option key={s.id} value={s.id}>{s.title} ({s.subject_code})</option>))}
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Academic Year *</label>
                    <select value={classSubjectForm.academic_year_id} onChange={(e) => setClassSubjectForm({ ...classSubjectForm, academic_year_id: e.target.value })} required disabled={loadingDropdowns}>
                      <option value="">Select Academic Year</option>
                      {availableAcademicYears.map((y) => (<option key={y.id} value={y.id}>{y.year} - {y.name}</option>))}
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Term (Optional - leave empty for full year)</label>
                    <select value={classSubjectForm.term_id} onChange={(e) => setClassSubjectForm({ ...classSubjectForm, term_id: e.target.value })} disabled={!classSubjectForm.academic_year_id || loadingDropdowns}>
                      <option value="">Full Year</option>
                      {availableTerms.map((t) => (<option key={t.id} value={t.id}>{t.name}</option>))}
                    </select>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.checkboxLabel}>
                        <input type="checkbox" checked={classSubjectForm.is_mandatory} onChange={(e) => setClassSubjectForm({ ...classSubjectForm, is_mandatory: e.target.checked })} />
                        Mandatory Subject
                      </label>
                    </div>
                    <div className={styles.formGroup}>
                      <label>Weekly Hours</label>
                      <input type="number" min="0" max="40" value={classSubjectForm.weekly_hours} onChange={(e) => setClassSubjectForm({ ...classSubjectForm, weekly_hours: e.target.value })} placeholder="1" />
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelButton} onClick={() => setShowClassSubjectModal(false)}>Cancel</button>
                <button type="submit" className={styles.submitButton} disabled={isSubmitting}>{isSubmitting ? "Assigning..." : "Assign Subject"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create/Edit/View Modal */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={`${styles.modal} ${modalMode === "view" ? styles.viewModal : ""}`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>
                {modalMode === "create" && `Create New ${activeTab === "classes" ? "Class" : activeTab === "departments" ? "Department" : "Academic Year"}`}
                {modalMode === "edit" && `Edit ${activeTab === "classes" ? "Class" : activeTab === "departments" ? "Department" : "Academic Year"}`}
                {modalMode === "view" && `${activeTab === "classes" ? "Class" : activeTab === "departments" ? "Department" : "Academic Year"} Details`}
              </h2>
              <button className={styles.closeButton} onClick={() => setShowModal(false)}>
                <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" /></svg>
              </button>
            </div>
            {modalMode === "view" ? renderModalContent() : (
              <form onSubmit={activeTab === "classes" ? handleClassSubmit : activeTab === "departments" ? handleDeptSubmit : handleYearSubmit}>
                <div className={styles.modalBody}>{renderModalContent()}</div>
                <div className={styles.modalFooter}>
                  <button type="button" className={styles.cancelButton} onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className={styles.submitButton} disabled={isSubmitting}>{isSubmitting ? "Saving..." : modalMode === "create" ? "Create" : "Update"}</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className={styles.modalOverlay} onClick={() => setShowDeleteConfirm(false)}>
          <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.confirmIcon}>
              <svg viewBox="0 0 24 24" width="48" height="48"><path fill="currentColor" d="M13,14H11V10H13M13,18H11V16H13M1,21H23L12,2L1,21Z" /></svg>
            </div>
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this item? This action cannot be undone.</p>
            <div className={styles.confirmActions}>
              <button className={styles.cancelButton} onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
              <button className={styles.deleteButton} onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassesAdminPage;