// app/(dashboard)/admin/promotion/page.tsx
"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import styles from "./page.module.css";
import Header from "@/components/Header/Header";
import Stats from "@/components/Stats/Stats";
import Table from "@/components/Table/Table";
import {
  getClasses,
  getAcademicYears,
  getTerms,
  getStudentsByClass,
} from "@/lib/action/admin/grading";
import {
  batchPromoteSameYear,
  batchPromoteNewYear,
  getPromotionStats,
  getPromotionHistory,
  getCombinedHistory,
  validateBatchPromotionInputs,
  getAvailableNextAcademicYears,
  assignPromotedStudentToClass,
  promoteSingleStudent,
  PromotionResult,
  BatchPromotionResult,
  BatchPromotionPayload,
  PromotedStudent,
  RetainedStudent,
  GraduatedStudent,
  DeferredStudent,
  HistoryRecord,
  HistoryFilter,
} from "@/lib/action/admin/promotion";
import { exportToCSV } from "@/utils/export/csv";
import { exportToPDF } from "@/utils/export/pdf";

type ClassType = {
  id: number;
  name: string;
  level: string;
  section: string | null;
  sequence: number;
  status: string;
};

type AcademicYear = {
  id: number;
  year: number;
  name: string;
  is_active: boolean;
  start_date: string;
  end_date: string;
};

type Term = {
  id: number;
  term_number: number;
  name: string;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
};

type Student = {
  id: number;
  first_name: string;
  last_name: string;
  other_names: string | null;
  admission_number: string;
  student_number: string;
  status: string;
  full_name: string;
  current_class_id: number | null;
};

type StudentPromotionStatus = {
  id: number;
  name: string;
  admission_number: string;
  status: "pending" | "already_promoted" | "retained" | "graduated" | "deferred";
  promotedToClass?: string;
  selected?: boolean;
  fromClassId?: number;
  toClassId?: number;
};

type PromotionStep = "type" | "filters" | "review" | "confirm" | "same-year-confirm";

export default function PromotionPage() {
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Filter state
  const [classes, setClasses] = useState<ClassType[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [fromTerms, setFromTerms] = useState<Term[]>([]);
  const [toTerms, setToTerms] = useState<Term[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  // Selected filters
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedFromAcademicYear, setSelectedFromAcademicYear] = useState<string>("");
  const [selectedToAcademicYear, setSelectedToAcademicYear] = useState<string>("");
  const [selectedFromTerm, setSelectedFromTerm] = useState<string>("");
  const [selectedToTerm, setSelectedToTerm] = useState<string>("");

  // Available next academic years
  const [availableNextYears, setAvailableNextYears] = useState<AcademicYear[]>([]);

  // Promotion modal state
  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const [currentStep, setCurrentStep] = useState<PromotionStep>("type");
  const [promotionType, setPromotionType] = useState<"single" | "batch">("batch");

  // Single promotion state
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [targetClassForSingle, setTargetClassForSingle] = useState<string>("");

  // Batch promotion state - New structure
  const [currentClassIndex, setCurrentClassIndex] = useState(0);
  const [classStudents, setClassStudents] = useState<Record<number, StudentPromotionStatus[]>>({});
  // Track student decisions: 'promoted', 'retained', 'graduated', 'deferred'
  const [studentDecisions, setStudentDecisions] = useState<Record<number, string>>({});

  // Promotion results
  const [promotionResults, setPromotionResults] = useState<BatchPromotionResult | null>(null);
  const [showResults, setShowResults] = useState(false);

  // Stats
  const [promotionStats, setPromotionStats] = useState<any>(null);

  // History state
  const [historyData, setHistoryData] = useState<HistoryRecord[]>([]);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [historyFilters, setHistoryFilters] = useState<HistoryFilter>({
    limit: 50,
    offset: 0,
    startDate: "",
    endDate: "",
    type: [],
  });
  const [historyPage, setHistoryPage] = useState(1);
  const historyPageSize = 50;

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Load from terms when from academic year changes
  useEffect(() => {
    if (selectedFromAcademicYear) {
      loadTerms(parseInt(selectedFromAcademicYear), "from");
    }
  }, [selectedFromAcademicYear]);

  // Load to terms when to academic year changes
  useEffect(() => {
    if (selectedToAcademicYear) {
      loadTerms(parseInt(selectedToAcademicYear), "to");
    }
  }, [selectedToAcademicYear]);

  // Load available next academic years when from academic year changes
  useEffect(() => {
    if (selectedFromAcademicYear) {
      loadAvailableNextYears(parseInt(selectedFromAcademicYear));
    }
  }, [selectedFromAcademicYear]);

  // Auto-select to academic year when from changes
  useEffect(() => {
    if (availableNextYears.length > 0 && !selectedToAcademicYear) {
      setSelectedToAcademicYear(availableNextYears[0].id.toString());
    }
  }, [availableNextYears]);

  // Load students when class and term/year change
  useEffect(() => {
    if (selectedClass && selectedFromAcademicYear && selectedFromTerm) {
      loadStudents();
    }
  }, [selectedClass, selectedFromAcademicYear, selectedFromTerm]);

  // Load promotion stats
  useEffect(() => {
    if (selectedFromAcademicYear) {
      loadPromotionStats();
    }
  }, [selectedFromAcademicYear, selectedFromTerm]);

  const loadInitialData = async () => {
    setLoading(true);
    const [classesResult, yearsResult] = await Promise.all([
      getClasses(),
      getAcademicYears(),
    ]);

    if (classesResult.classes) setClasses(classesResult.classes);
    if (yearsResult.years) {
      setAcademicYears(yearsResult.years);
      const activeYear = yearsResult.years.find((y: AcademicYear) => y.is_active);
      if (activeYear) {
        setSelectedFromAcademicYear(activeYear.id.toString());
        setSelectedToAcademicYear(activeYear.id.toString());
      }
      if (yearsResult.years.length > 0) {
        loadTerms(yearsResult.years[0].id, "from");
      }
    }
    setLoading(false);
  };

  const loadTerms = async (academicYearId: number, type: "from" | "to") => {
    const result = await getTerms(academicYearId);
    if (result.terms) {
      if (type === "from") {
        setFromTerms(result.terms);
        const activeTerm = result.terms.find((t: Term) => t.is_active);
        if (activeTerm) {
          setSelectedFromTerm(activeTerm.id.toString());
        } else if (result.terms.length > 0) {
          setSelectedFromTerm(result.terms[0].id.toString());
        }
      } else {
        setToTerms(result.terms);
        const firstTerm = result.terms.find((t: Term) => t.term_number === 1);
        if (firstTerm) {
          setSelectedToTerm(firstTerm.id.toString());
        } else if (result.terms.length > 0) {
          setSelectedToTerm(result.terms[0].id.toString());
        }
      }
    }
  };

  const loadAvailableNextYears = async (academicYearId: number) => {
    const result = await getAvailableNextAcademicYears(academicYearId);
    if (result.success && result.years) {
      setAvailableNextYears(result.years);
    }
  };

  const loadStudents = async () => {
    setLoading(true);
    const result = await getStudentsByClass(parseInt(selectedClass));
    if (result.students) {
      const formattedStudents = result.students.map((student: any) => ({
        ...student,
        full_name: `${student.first_name} ${student.last_name}${student.other_names ? ` ${student.other_names}` : ''}`,
      }));
      setStudents(formattedStudents);
    }
    setLoading(false);
  };

  const loadPromotionStats = async () => {
    const result = await getPromotionStats(
      selectedFromAcademicYear ? parseInt(selectedFromAcademicYear) : undefined,
      selectedFromTerm ? parseInt(selectedFromTerm) : undefined
    );
    if (result.success) {
      setPromotionStats(result.stats);
    }
  };

  // Load combined history with filters
  const loadCombinedHistory = async (filters: HistoryFilter) => {
    setHistoryLoading(true);
    try {
      const result = await getCombinedHistory(filters);
      if (result.success) {
        setHistoryData(result.data);
        setHistoryTotal(result.total);
      } else {
        console.error("Error loading history:", result.error);
        alert("Failed to load history: " + result.error);
      }
    } catch (err: any) {
      console.error("Error loading history:", err);
      alert("An error occurred while loading history");
    } finally {
      setHistoryLoading(false);
    }
  };

  const openHistoryModal = () => {
    setShowHistory(true);
    const initialFilters: HistoryFilter = {
      limit: historyPageSize,
      offset: 0,
      startDate: "",
      endDate: "",
      type: [],
    };
    setHistoryFilters(initialFilters);
    setHistoryPage(1);
    loadCombinedHistory(initialFilters);
  };

  const applyHistoryFilters = () => {
    const filters = {
      ...historyFilters,
      offset: (historyPage - 1) * historyPageSize,
      limit: historyPageSize,
    };
    loadCombinedHistory(filters);
  };

  const handleHistoryFilterChange = (key: keyof HistoryFilter, value: any) => {
    setHistoryFilters(prev => ({
      ...prev,
      [key]: value,
      offset: 0,
    }));
    setHistoryPage(1);
  };

  const clearHistoryFilters = () => {
    const clearedFilters: HistoryFilter = {
      limit: historyPageSize,
      offset: 0,
      startDate: "",
      endDate: "",
      type: [],
    };
    setHistoryFilters(clearedFilters);
    setHistoryPage(1);
    loadCombinedHistory(clearedFilters);
  };

  const handleHistoryPageChange = (page: number) => {
    setHistoryPage(page);
    const filters = {
      ...historyFilters,
      offset: (page - 1) * historyPageSize,
      limit: historyPageSize,
    };
    loadCombinedHistory(filters);
  };

  // Stats for header
  const stats = useMemo(() => {
    if (promotionStats) {
      return [
        {
          id: 1,
          label: "Total Promotions",
          value: promotionStats.total || 0,
          color: "blue",
          type: "students",
        },
        {
          id: 2,
          label: "Promoted",
          value: promotionStats.promoted || 0,
          color: "green",
          type: "attendance",
        },
        {
          id: 3,
          label: "Retained",
          value: promotionStats.retained || 0,
          color: "orange",
          type: "classes",
        },
        {
          id: 4,
          label: "Graduated",
          value: promotionStats.graduated || 0,
          color: "purple",
          type: "revenue",
        },
      ];
    }

    return [
      { id: 1, label: "Total Promotions", value: 0, color: "blue", type: "students" },
      { id: 2, label: "Promoted", value: 0, color: "green", type: "attendance" },
      { id: 3, label: "Retained", value: 0, color: "orange", type: "classes" },
      { id: 4, label: "Graduated", value: 0, color: "purple", type: "revenue" },
    ];
  }, [promotionStats]);

  // Student columns for table
  const studentColumns = [
    {
      header: "Student",
      accessor: "full_name",
      sortable: true,
      render: (row: Student) => (
        <div className={styles.studentCell}>
          <div className={styles.studentAvatar}>
            {row.first_name?.[0]}{row.last_name?.[0]}
          </div>
          <div>
            <div className={styles.studentName}>{row.full_name}</div>
            <div className={styles.studentId}>{row.admission_number || row.student_number}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Current Class",
      accessor: "current_class_id",
      sortable: true,
      render: (row: Student) => {
        const classObj = classes.find(c => c.id === row.current_class_id);
        return classObj ? `${classObj.name}${classObj.section ? ` - ${classObj.section}` : ''}` : "Not Assigned";
      },
    },
    {
      header: "Status",
      accessor: "status",
      sortable: true,
      render: (row: Student) => (
        <span className={`${styles.statusBadge} ${row.status === "active" ? styles.statusActive : styles.statusInactive}`}>
          {row.status}
        </span>
      ),
    },
    {
      header: "Actions",
      render: (row: Student) => (
        <button
          className={styles.promoteButton}
          onClick={() => handleSinglePromote(row)}
          disabled={row.status !== "active" || row.current_class_id === null}
        >
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path fill="currentColor" d="M12,2C6.48,2,2,6.48,2,12s4.48,10,10,10s10-4.48,10-10S17.52,2,12,2z M12,20c-4.41,0-8-3.59-8-8s3.59-8,8-8s8,3.59,8,8S16.41,20,12,20z M13,7h-2v6h6v-2h-4V7z"/>
          </svg>
          Promote
        </button>
      ),
    },
  ];

  // History table columns
  const historyColumns = [
    {
      header: "Student",
      accessor: "studentName",
      sortable: true,
      render: (row: HistoryRecord) => (
        <div className={styles.studentCell}>
          <div className={styles.studentAvatar}>
            {row.studentName?.[0] || "?"}
          </div>
          <div>
            <div className={styles.studentName}>{row.studentName}</div>
            <div className={styles.studentId}>{row.admissionNumber || row.studentNumber || "—"}</div>
          </div>
        </div>
      ),
    },
    {
      header: "From Class",
      accessor: "fromClass",
      sortable: true,
    },
    {
      header: "To Class",
      accessor: "toClass",
      sortable: true,
      render: (row: HistoryRecord) => row.toClass || "—",
    },
    {
      header: "Type",
      accessor: "type",
      sortable: true,
      render: (row: HistoryRecord) => (
        <span className={`${styles.statusBadge} ${
          row.type === "promoted" ? styles.statusPromoted :
          row.type === "retained" ? styles.statusRetained :
          row.type === "graduated" ? styles.statusGraduated :
          row.type === "deferred" ? styles.statusDeferred : ""
        }`}>
          {row.type}
        </span>
      ),
    },
    {
      header: "Date",
      accessor: "date",
      sortable: true,
      render: (row: HistoryRecord) => new Date(row.date).toLocaleDateString(),
    },
    {
      header: "Reason",
      accessor: "reason",
      sortable: false,
      render: (row: HistoryRecord) => row.reason || "—",
    },
  ];

  // Export columns for history
  const getHistoryExportColumns = () => [
    { header: "Student", accessor: (row: HistoryRecord) => row.studentName },
    { header: "Student ID", accessor: (row: HistoryRecord) => row.studentNumber || "—" },
    { header: "Admission No", accessor: (row: HistoryRecord) => row.admissionNumber || "—" },
    { header: "From Class", accessor: (row: HistoryRecord) => row.fromClass },
    { header: "To Class", accessor: (row: HistoryRecord) => row.toClass || "—" },
    { header: "Type", accessor: (row: HistoryRecord) => row.type },
    { header: "Date", accessor: (row: HistoryRecord) => new Date(row.date).toLocaleDateString() },
    { header: "Reason", accessor: (row: HistoryRecord) => row.reason || "—" },
  ];

  // Handle export history
  const handleExportHistory = useCallback(async (format: "pdf" | "csv") => {
    if (historyData.length === 0) {
      alert("No history data to export");
      return;
    }

    const columns = getHistoryExportColumns();
    const filename = `promotion-retention-history-${new Date().toISOString().split("T")[0]}`;
    const title = "Promotion & Retention History Report";
    const subtitle = `Total Records: ${historyTotal} | Generated on ${new Date().toLocaleDateString()}`;

    if (format === "csv") {
      exportToCSV(historyData, columns, { filename });
    } else {
      await exportToPDF(historyData, columns, {
        filename,
        title,
        subtitle,
        orientation: "landscape",
      });
    }
  }, [historyData, historyTotal]);

  // ============================================
  // PROMOTION MODAL HANDLERS
  // ============================================

  const handleOpenPromotionModal = () => {
    setCurrentStep("type");
    setPromotionType("batch");
    setClassStudents({});
    setStudentDecisions({});
    setCurrentClassIndex(0);
    setShowPromotionModal(true);
    setPromotionResults(null);
    setShowResults(false);
  };

  const handleClosePromotionModal = () => {
    if (processing) return;
    setShowPromotionModal(false);
    setCurrentStep("type");
    setPromotionResults(null);
    setShowResults(false);
  };

  const handleSinglePromote = (student: Student) => {
    setSelectedStudent(student);
    setTargetClassForSingle("");
    setPromotionType("single");
    setCurrentStep("filters");
    setShowPromotionModal(true);
  };

  // Step 1: Select promotion type
  const handleSelectPromotionType = (type: "single" | "batch") => {
    setPromotionType(type);
    if (type === "single" && selectedStudent) {
      setCurrentStep("filters");
    } else {
      setCurrentStep("filters");
    }
  };

  // Step 2: Filters (single promotion)
  const handleSinglePromotionSubmit = async () => {
    if (!selectedStudent) return;
    if (!targetClassForSingle) {
      alert("Please select a target class");
      return;
    }

    const targetClass = classes.find(c => c.id === parseInt(targetClassForSingle));
    
    const confirmMessage = `Are you sure you want to promote ${selectedStudent.full_name}?\n\n` +
      `Current Class: ${classes.find(c => c.id === selectedStudent.current_class_id)?.name || "Not Assigned"}\n` +
      `Target Class: ${targetClass?.name || "Unknown"}\n` +
      `Academic Year: ${academicYears.find(y => y.id === parseInt(selectedFromAcademicYear))?.year || "—"}\n` +
      `Term: ${fromTerms.find(t => t.id === parseInt(selectedFromTerm))?.name || "—"}\n\n` +
      `⚠️ This action cannot be undone.`;

    if (!confirm(confirmMessage)) {
      return;
    }

    setProcessing(true);
    try {
      const promoteResult = await promoteSingleStudent(selectedStudent.id);
      if (!promoteResult.success) {
        alert(promoteResult.error || "Failed to promote student");
        return;
      }

      const assignResult = await assignPromotedStudentToClass(
        selectedStudent.id,
        parseInt(targetClassForSingle),
        parseInt(selectedFromTerm),
        parseInt(selectedFromAcademicYear)
      );

      if (assignResult.success) {
        alert(`✅ ${selectedStudent.full_name} promoted successfully to ${targetClass?.name || "Unknown"}!`);
        setShowPromotionModal(false);
        loadStudents();
        loadPromotionStats();
      } else {
        alert(assignResult.error || "Failed to assign student to class");
      }
    } catch (err: any) {
      alert(err.message || "An error occurred");
    } finally {
      setProcessing(false);
    }
  };

  // Step 2: Filters (batch promotion)
  const handleBatchPromotionSubmit = async () => {
    if (!selectedFromAcademicYear || !selectedToAcademicYear || !selectedFromTerm || !selectedToTerm) {
      alert("Please select all required fields");
      return;
    }

    const validation = await validateBatchPromotionInputs(
      parseInt(selectedFromAcademicYear),
      parseInt(selectedToAcademicYear),
      parseInt(selectedFromTerm),
      parseInt(selectedToTerm)
    );

    if (!validation.valid) {
      alert(validation.reason || "Invalid promotion configuration");
      return;
    }

    // Check if this is same academic year promotion (Term 1→2 or 2→3)
    const isSameYear = parseInt(selectedFromAcademicYear) === parseInt(selectedToAcademicYear);
    const fromTerm = fromTerms.find(t => t.id === parseInt(selectedFromTerm));
    const toTerm = toTerms.find(t => t.id === parseInt(selectedToTerm));

    if (isSameYear && fromTerm && toTerm) {
      // Same year promotion - no student review needed
      setCurrentStep("same-year-confirm");
    } else {
      // Year-end promotion - load students for review
      await loadAllStudentsForBatchPromotion();
      setCurrentStep("review");
    }
  };

  // Handle same-year promotion confirmation
  const handleSameYearPromotionConfirm = async () => {
    const fromTermId = parseInt(selectedFromTerm);
    const toTermId = parseInt(selectedToTerm);
    const fromAcademicYearId = parseInt(selectedFromAcademicYear);
    const toAcademicYearId = parseInt(selectedToAcademicYear);

    const fromTerm = fromTerms.find(t => t.id === fromTermId);
    const toTerm = toTerms.find(t => t.id === toTermId);

    const confirmMessage = 
      `⚠️ ARE YOU SURE YOU WANT TO PROCEED?\n\n` +
      `This action cannot be undone.\n\n` +
      `📅 FROM: ${fromTerm?.name || "—"}\n` +
      `📅 TO: ${toTerm?.name || "—"}\n\n` +
      `All students will remain in their current classes.\n` +
      `Only the active term will change.`;

    if (!confirm(confirmMessage)) {
      return;
    }

    setProcessing(true);

    try {
      const result = await batchPromoteSameYear(
        fromAcademicYearId,
        toAcademicYearId,
        fromTermId,
        toTermId
      );

      setPromotionResults(result);
      setShowResults(true);

      if (result.success) {
        loadStudents();
        loadPromotionStats();
        alert(`✅ Term changed successfully!\n\n` +
          `From: ${fromTerm?.name || "—"}\n` +
          `To: ${toTerm?.name || "—"}\n` +
          `All students remain in their current classes.`);
      } else {
        alert("⚠️ Promotion completed with errors. Check the results for details.");
      }
    } catch (err: any) {
      alert(err.message || "An error occurred during promotion");
    } finally {
      setProcessing(false);
    }
  };

  const loadAllStudentsForBatchPromotion = async () => {
    setLoading(true);
    // Get ALL active classes sorted by sequence
    const classList = classes
      .filter(c => c.status === "active")
      .sort((a, b) => a.sequence - b.sequence);
    
    const studentsMap: Record<number, StudentPromotionStatus[]> = {};

    // For each class, get students
    for (const classObj of classList) {
      const result = await getStudentsByClass(classObj.id);
      if (result.students) {
        // Get next class for this class
        const nextClass = classes.find(c => c.sequence === classObj.sequence + 1 && c.status === "active");
        
        studentsMap[classObj.id] = result.students.map((s: any) => ({
          id: s.id,
          name: s.full_name || `${s.first_name} ${s.last_name}`,
          admission_number: s.admission_number || s.student_number || "",
          status: "pending" as const,
          selected: true, // Default to promoted
          fromClassId: classObj.id,
          toClassId: nextClass?.id, // undefined if no next class
        }));
      } else {
        // Empty class - add empty array
        studentsMap[classObj.id] = [];
      }
    }

    setClassStudents(studentsMap);
    setStudentDecisions({});
    setCurrentClassIndex(0);
    setLoading(false);
  };

  // Step 3: Review - Navigation - SHOW ALL CLASSES even with no students
  const getClassesWithStudents = () => {
    return classes
      .filter(c => c.status === "active")
      .sort((a, b) => a.sequence - b.sequence);
  };

  const getCurrentClassData = () => {
    const classesWithStudents = getClassesWithStudents();
    if (classesWithStudents.length === 0) return null;
    return classesWithStudents[currentClassIndex] || null;
  };

  const getCurrentStudents = () => {
    const classData = getCurrentClassData();
    if (!classData) return [];
    return classStudents[classData.id] || [];
  };

  const handlePreviousClass = () => {
    if (currentClassIndex > 0) {
      setCurrentClassIndex(currentClassIndex - 1);
    }
  };

  const handleNextClass = () => {
    const classesWithStudents = getClassesWithStudents();
    if (currentClassIndex < classesWithStudents.length - 1) {
      setCurrentClassIndex(currentClassIndex + 1);
    } else {
      setCurrentStep("confirm");
    }
  };

  // Handle student decision - promote/retain/graduate/defer
  const handleStudentDecision = (studentId: number, decision: string) => {
    setStudentDecisions(prev => ({
      ...prev,
      [studentId]: decision,
    }));

    // Also update the student's status in classStudents for display
    const classData = getCurrentClassData();
    if (!classData) return;

    setClassStudents(prev => ({
      ...prev,
      [classData.id]: prev[classData.id].map(s =>
        s.id === studentId ? { ...s, selected: decision === "promoted" } : s
      ),
    }));
  };

  const handleMarkAllPromote = () => {
    const classData = getCurrentClassData();
    if (!classData) return;

    const students = getCurrentStudents();
    students.forEach(s => {
      setStudentDecisions(prev => ({
        ...prev,
        [s.id]: "promoted",
      }));
    });

    setClassStudents(prev => ({
      ...prev,
      [classData.id]: prev[classData.id].map(s => ({
        ...s,
        selected: true,
      })),
    }));
  };

  const handleMarkAllRetain = () => {
    const classData = getCurrentClassData();
    if (!classData) return;

    const students = getCurrentStudents();
    students.forEach(s => {
      setStudentDecisions(prev => ({
        ...prev,
        [s.id]: "retained",
      }));
    });

    setClassStudents(prev => ({
      ...prev,
      [classData.id]: prev[classData.id].map(s => ({
        ...s,
        selected: false,
      })),
    }));
  };

  // Step 4: Confirm Year-End Promotion
  const handleConfirmPromotion = async () => {
    const fromAcademicYearId = parseInt(selectedFromAcademicYear);
    const toAcademicYearId = parseInt(selectedToAcademicYear);
    const fromTermId = parseInt(selectedFromTerm);
    const toTermId = parseInt(selectedToTerm);

    // Build the payload
    const promotedStudents: PromotedStudent[] = [];
    const retainedStudents: RetainedStudent[] = [];
    const graduatedStudents: GraduatedStudent[] = [];
    const deferredStudents: DeferredStudent[] = [];

    // Get all students from all classes
    const allStudents: StudentPromotionStatus[] = [];
    Object.values(classStudents).forEach(students => {
      allStudents.push(...students);
    });

    // Categorize each student based on their decision
    allStudents.forEach(student => {
      const decision = studentDecisions[student.id] || "promoted";

      switch (decision) {
        case "promoted":
          if (student.toClassId) {
            promotedStudents.push({
              studentId: student.id,
              fromClassId: student.fromClassId!,
              toClassId: student.toClassId,
            });
          } else {
            // No next class - graduate instead
            graduatedStudents.push({ studentId: student.id });
          }
          break;
        case "retained":
          retainedStudents.push({
            studentId: student.id,
            classId: student.fromClassId!,
          });
          break;
        case "graduated":
          graduatedStudents.push({ studentId: student.id });
          break;
        case "deferred":
          deferredStudents.push({ studentId: student.id });
          break;
        default:
          // Default to promoted if no decision
          if (student.toClassId) {
            promotedStudents.push({
              studentId: student.id,
              fromClassId: student.fromClassId!,
              toClassId: student.toClassId,
            });
          } else {
            graduatedStudents.push({ studentId: student.id });
          }
      }
    });

    if (
      promotedStudents.length === 0 &&
      retainedStudents.length === 0 &&
      graduatedStudents.length === 0 &&
      deferredStudents.length === 0
    ) {
      alert("No students selected for promotion, retention, graduation, or deferral");
      return;
    }

    const fromYear = academicYears.find(y => y.id === fromAcademicYearId);
    const toYear = academicYears.find(y => y.id === toAcademicYearId);
    const fromTerm = fromTerms.find(t => t.id === fromTermId);
    const toTerm = toTerms.find(t => t.id === toTermId);

    const confirmMessage = 
      `⚠️ ARE YOU SURE YOU WANT TO PROCEED?\n\n` +
      `This action cannot be undone.\n\n` +
      `📊 SUMMARY:\n` +
      `• ${promotedStudents.length} students will be PROMOTED\n` +
      `• ${retainedStudents.length} students will be RETAINED\n` +
      `• ${graduatedStudents.length} students will be GRADUATED\n` +
      `• ${deferredStudents.length} students will be DEFERRED\n\n` +
      `📅 FROM: ${fromYear?.year || "—"} - ${fromTerm?.name || "—"}\n` +
      `📅 TO: ${toYear?.year || "—"} - ${toTerm?.name || "—"}\n\n` +
      `Total students affected: ${promotedStudents.length + retainedStudents.length + graduatedStudents.length + deferredStudents.length}`;

    if (!confirm(confirmMessage)) {
      return;
    }

    setProcessing(true);

    try {
      const payload: BatchPromotionPayload = {
        fromAcademicYearId,
        toAcademicYearId,
        fromTermId,
        toTermId,
        promotedStudents,
        retainedStudents,
        graduatedStudents,
        deferredStudents,
      };

      const result = await batchPromoteNewYear(payload);

      setPromotionResults(result);
      setShowResults(true);

      if (result.success) {
        loadStudents();
        loadPromotionStats();
        alert(`✅ Promotion completed successfully!\n\n` +
          `Promoted: ${result.promotedCount}\n` +
          `Retained: ${result.retainedCount}\n` +
          `Graduated: ${result.graduatedCount}\n` +
          `Deferred: ${result.deferredCount}\n` +
          `Already Promoted: ${result.alreadyPromotedCount}`);
      } else {
        alert("⚠️ Promotion completed with errors. Check the results for details.");
      }
    } catch (err: any) {
      alert(err.message || "An error occurred during promotion");
    } finally {
      setProcessing(false);
    }
  };

  // ============================================
  // RENDER METHODS
  // ============================================

  const renderPromotionTypeStep = () => (
    <div className={styles.stepContent}>
      <h3 className={styles.stepTitle}>Select Promotion Type</h3>
      <p className={styles.stepDescription}>
        Choose how you want to promote students
      </p>

      <div className={styles.promotionTypeGrid}>
        <div
          className={`${styles.promotionTypeCard} ${promotionType === "single" ? styles.selected : ""}`}
          onClick={() => handleSelectPromotionType("single")}
        >
          <div className={styles.promotionTypeIcon}>👤</div>
          <h4>Single Student</h4>
          <p>Promote one student at a time</p>
          <div className={styles.promotionTypeHint}>
            Best for individual cases or quick adjustments
          </div>
          {promotionType === "single" && (
            <div className={styles.checkmark}>✓</div>
          )}
        </div>

        <div
          className={`${styles.promotionTypeCard} ${promotionType === "batch" ? styles.selected : ""}`}
          onClick={() => handleSelectPromotionType("batch")}
        >
          <div className={styles.promotionTypeIcon}>👥</div>
          <h4>Batch Promotion</h4>
          <p>Promote all students in a class</p>
          <div className={styles.promotionTypeHint}>
            Best for end-of-term or end-of-year promotions
          </div>
          {promotionType === "batch" && (
            <div className={styles.checkmark}>✓</div>
          )}
        </div>
      </div>
    </div>
  );

  const renderFiltersStep = () => {
    if (promotionType === "single") {
      return renderSingleFilters();
    }
    return renderBatchFilters();
  };

  const renderSingleFilters = () => (
    <div className={styles.stepContent}>
      <h3 className={styles.stepTitle}>Promote Single Student</h3>
      <p className={styles.stepDescription}>
        {selectedStudent ? `Promoting: ${selectedStudent.full_name}` : "Select student and target class"}
      </p>

      <div className={styles.formGroup}>
        <label>Target Class *</label>
        <select
          value={targetClassForSingle}
          onChange={(e) => setTargetClassForSingle(e.target.value)}
          className={styles.select}
        >
          <option value="">Select Target Class</option>
          {classes
            .sort((a, b) => a.sequence - b.sequence)
            .map(cls => (
              <option key={cls.id} value={cls.id}>
                {cls.name} {cls.section ? `- ${cls.section}` : ""} ({cls.level})
              </option>
            ))}
        </select>
      </div>

      {selectedStudent && (
        <div className={styles.studentInfoCard}>
          <div className={styles.studentInfoHeader}>
            <span className={styles.studentInfoAvatar}>
              {selectedStudent.first_name?.[0]}{selectedStudent.last_name?.[0]}
            </span>
            <div>
              <div className={styles.studentInfoName}>{selectedStudent.full_name}</div>
              <div className={styles.studentInfoId}>
                {selectedStudent.admission_number || selectedStudent.student_number}
              </div>
            </div>
          </div>
          <div className={styles.studentInfoDetails}>
            <div>
              <span className={styles.label}>Current Class:</span>
              <span className={styles.value}>
                {classes.find(c => c.id === selectedStudent.current_class_id)?.name || "Not Assigned"}
              </span>
            </div>
            <div>
              <span className={styles.label}>Academic Year:</span>
              <span className={styles.value}>
                {academicYears.find(y => y.id === parseInt(selectedFromAcademicYear))?.year || "—"}
              </span>
            </div>
            <div>
              <span className={styles.label}>Term:</span>
              <span className={styles.value}>
                {fromTerms.find(t => t.id === parseInt(selectedFromTerm))?.name || "—"}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className={styles.warningBox}>
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path fill="currentColor" d="M13,14H11V10H13M13,18H11V16H13M1,21H23L12,2L1,21Z" />
        </svg>
        <div>
          <strong>Note:</strong> The student will be promoted to the selected class for the current term.
          This action will update the student's current class and create a promotion history record.
        </div>
      </div>
    </div>
  );

  const renderBatchFilters = () => {
    const fromYear = academicYears.find(y => y.id === parseInt(selectedFromAcademicYear));
    const toYear = academicYears.find(y => y.id === parseInt(selectedToAcademicYear));
    const fromTerm = fromTerms.find(t => t.id === parseInt(selectedFromTerm));
    const toTerm = toTerms.find(t => t.id === parseInt(selectedToTerm));

    const isSameYear = selectedFromAcademicYear === selectedToAcademicYear;

    return (
      <div className={styles.stepContent}>
        <h3 className={styles.stepTitle}>Batch Promotion</h3>
        <p className={styles.stepDescription}>
          Configure the promotion parameters
        </p>

        <div className={styles.filterGrid}>
          <div className={styles.formGroup}>
            <label>From Academic Year *</label>
            <select
              value={selectedFromAcademicYear}
              onChange={(e) => setSelectedFromAcademicYear(e.target.value)}
              className={styles.select}
            >
              <option value="">Select Academic Year</option>
              {academicYears.map((year) => (
                <option key={year.id} value={year.id}>
                  {year.year} - {year.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>From Term *</label>
            <select
              value={selectedFromTerm}
              onChange={(e) => setSelectedFromTerm(e.target.value)}
              className={styles.select}
              disabled={!selectedFromAcademicYear}
            >
              <option value="">Select Term</option>
              {fromTerms.map((term) => (
                <option key={term.id} value={term.id}>
                  {term.name} {term.is_active ? "(Active)" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.filterGrid}>
          <div className={styles.formGroup}>
            <label>To Academic Year *</label>
            <select
              value={selectedToAcademicYear}
              onChange={(e) => setSelectedToAcademicYear(e.target.value)}
              className={styles.select}
            >
              <option value="">Select Academic Year</option>
              {availableNextYears.map((year) => (
                <option key={year.id} value={year.id}>
                  {year.year} - {year.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>To Term *</label>
            <select
              value={selectedToTerm}
              onChange={(e) => setSelectedToTerm(e.target.value)}
              className={styles.select}
              disabled={!selectedToAcademicYear}
            >
              <option value="">Select Term</option>
              {toTerms.map((term) => (
                <option key={term.id} value={term.id}>
                  {term.name} {term.is_active ? "(Active)" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedFromAcademicYear && selectedToAcademicYear && selectedFromTerm && selectedToTerm && (
          <div className={styles.promotionInfoBox}>
            <div className={styles.promotionInfoIcon}>ℹ️</div>
            <div className={styles.promotionInfoContent}>
              <strong>Promotion Configuration:</strong>
              <ul className={styles.promotionInfoList}>
                <li>
                  From: {fromYear?.year || "—"} - {fromTerm?.name || "—"}
                </li>
                <li>
                  To: {toYear?.year || "—"} - {toTerm?.name || "—"}
                </li>
                <li>
                  {isSameYear ? 
                    "Same academic year - students will stay in the same class. Only the term will change." :
                    "Year transition - students will move to the next class (or be retained/graduated/deferred)"
                  }
                </li>
              </ul>
            </div>
          </div>
        )}

        <div className={styles.warningBox}>
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M13,14H11V10H13M13,18H11V16H13M1,21H23L12,2L1,21Z" />
          </svg>
          <div>
            <strong>Note:</strong> 
            {isSameYear ? 
              "All students will remain in their current classes. Only the active term will change." :
              "Students will be reviewed class by class. You will have the opportunity to select which students to promote, retain, graduate, or defer."
            }
          </div>
        </div>
      </div>
    );
  };

  const renderSameYearConfirmStep = () => {
    const fromTerm = fromTerms.find(t => t.id === parseInt(selectedFromTerm));
    const toTerm = toTerms.find(t => t.id === parseInt(selectedToTerm));

    return (
      <div className={styles.stepContent}>
        <h3 className={styles.stepTitle}>Confirm Term Change</h3>
        <p className={styles.stepDescription}>
          Review the term change details below before confirming
        </p>

        <div className={styles.confirmSummary}>
          <div className={styles.confirmCard}>
            <div className={styles.confirmIcon}>📅</div>
            <div className={styles.confirmLabel}>From</div>
            <div className={styles.confirmValue}>{fromTerm?.name || "—"}</div>
            <div className={styles.confirmSub}>Current active term</div>
          </div>

          <div className={styles.confirmCard}>
            <div className={styles.confirmIcon}>➡️</div>
            <div className={styles.confirmLabel}>To</div>
            <div className={styles.confirmValue}>{toTerm?.name || "—"}</div>
            <div className={styles.confirmSub}>Next term</div>
          </div>

          <div className={styles.confirmCard}>
            <div className={styles.confirmIcon}>🏫</div>
            <div className={styles.confirmLabel}>Academic Year</div>
            <div className={styles.confirmValue}>
              {academicYears.find(y => y.id === parseInt(selectedFromAcademicYear))?.year || "—"}
            </div>
            <div className={styles.confirmSub}>Stays the same</div>
          </div>

          <div className={styles.confirmCard}>
            <div className={styles.confirmIcon}>👨‍🎓</div>
            <div className={styles.confirmLabel}>Students</div>
            <div className={styles.confirmValue}>All</div>
            <div className={styles.confirmSub}>Stay in current classes</div>
          </div>
        </div>

        <div className={styles.dangerWarning}>
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M12,2C6.48,2,2,6.48,2,12s4.48,10,10,10s10-4.48,10-10S17.52,2,12,2z M12,20c-4.41,0-8-3.59-8-8s3.59-8,8-8s8,3.59,8,8S16.41,20,12,20z M11,7h2v8h-2V7z M11,17h2v2h-2V17z"/>
          </svg>
          <div>
            <strong>Warning:</strong> This action cannot be undone. The active term will change from {fromTerm?.name || "—"} to {toTerm?.name || "—"}.
          </div>
        </div>
      </div>
    );
  };

  const renderReviewStep = () => {
    const currentClass = getCurrentClassData();
    const currentStudents = getCurrentStudents();
    const classesWithStudents = getClassesWithStudents();
    const totalClasses = classesWithStudents.length;
    const progress = totalClasses > 0 ? ((currentClassIndex + 1) / totalClasses) * 100 : 0;

    if (!currentClass) {
      return (
        <div className={styles.emptyState}>
          <p>No active classes found</p>
        </div>
      );
    }

    const selectedCount = currentStudents.filter(s => s.selected).length;
    const totalPending = currentStudents.length;

    return (
      <div className={styles.stepContent}>
        <div className={styles.reviewHeader}>
          <div>
            <h3 className={styles.stepTitle}>
              {currentClass.name} {currentClass.section ? `- ${currentClass.section}` : ""}
            </h3>
            <p className={styles.stepDescription}>
              Class {currentClassIndex + 1} of {totalClasses}
            </p>
          </div>
          <div className={styles.progressInfo}>
            <span className={styles.progressText}>
              {totalPending > 0 ? `${selectedCount} of ${totalPending} selected for promotion` : "No students in this class"}
            </span>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {totalPending === 0 ? (
          <div className={styles.emptyClassMessage}>
            <p>No students enrolled in this class.</p>
            <p className={styles.emptyClassSub}>Click "Next" to continue to the next class.</p>
          </div>
        ) : (
          <>
            <div className={styles.reviewActions}>
              <button
                className={styles.reviewActionButton}
                onClick={handleMarkAllPromote}
                disabled={totalPending === 0}
              >
                Mark All Promote
              </button>
              <button
                className={styles.reviewActionButtonSecondary}
                onClick={handleMarkAllRetain}
                disabled={totalPending === 0}
              >
                Mark All Retain
              </button>
            </div>

            <div className={styles.studentReviewTable}>
              <table className={styles.reviewTable}>
                <thead>
                  <tr>
                    <th style={{ width: "40px" }}>#</th>
                    <th>Student</th>
                    <th style={{ width: "120px" }}>Status</th>
                    <th style={{ width: "280px" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentStudents.map((student, index) => {
                    const decision = studentDecisions[student.id] || "promoted";
                    const isPromoted = decision === "promoted";
                    const isRetained = decision === "retained";
                    const isGraduated = decision === "graduated";
                    const isDeferred = decision === "deferred";

                    let statusText = isPromoted ? "Promote" :
                                     isRetained ? "Retain" :
                                     isGraduated ? "Graduate" :
                                     isDeferred ? "Defer" : "Pending";

                    let statusClass = isPromoted ? styles.statusPromoted :
                                     isRetained ? styles.statusRetained :
                                     isGraduated ? styles.statusGraduated :
                                     isDeferred ? styles.statusDeferred : styles.statusPending;

                    return (
                      <tr key={student.id}>
                        <td>{index + 1}</td>
                        <td>
                          <div className={styles.studentCell}>
                            <div className={styles.studentAvatar}>
                              {student.name?.[0] || "?"}
                            </div>
                            <div>
                              <div className={styles.studentName}>{student.name}</div>
                              <div className={styles.studentId}>{student.admission_number || "—"}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`${styles.statusBadge} ${statusClass}`}>
                            {statusText}
                            {student.toClassId && isPromoted && ` → ${classes.find(c => c.id === student.toClassId)?.name || "Next"}`}
                          </span>
                        </td>
                        <td>
                          <div className={styles.actionButtons}>
                            <button
                              className={`${styles.actionButton} ${isPromoted ? styles.activePromote : ""}`}
                              onClick={() => handleStudentDecision(student.id, "promoted")}
                            >
                              {isPromoted ? "✓ Promote" : "Promote"}
                            </button>
                            <button
                              className={`${styles.actionButton} ${isRetained ? styles.activeRetain : ""}`}
                              onClick={() => handleStudentDecision(student.id, "retained")}
                            >
                              {isRetained ? "✓ Retain" : "Retain"}
                            </button>
                            <button
                              className={`${styles.actionButton} ${isGraduated ? styles.activeGraduate : ""}`}
                              onClick={() => handleStudentDecision(student.id, "graduated")}
                            >
                              {isGraduated ? "✓ Graduate" : "Graduate"}
                            </button>
                            <button
                              className={`${styles.actionButton} ${isDeferred ? styles.activeDefer : ""}`}
                              onClick={() => handleStudentDecision(student.id, "deferred")}
                            >
                              {isDeferred ? "✓ Defer" : "Defer"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        <div className={styles.reviewFooter}>
          <div className={styles.reviewSummary}>
            <span>Total: {currentStudents.length}</span>
            <span className={styles.summaryPromoted}>Promoted: {currentStudents.filter(s => studentDecisions[s.id] === "promoted" || !studentDecisions[s.id]).length}</span>
            <span className={styles.summaryRetained}>Retained: {currentStudents.filter(s => studentDecisions[s.id] === "retained").length}</span>
            <span className={styles.summaryGraduated}>Graduated: {currentStudents.filter(s => studentDecisions[s.id] === "graduated").length}</span>
            <span className={styles.summaryDeferred}>Deferred: {currentStudents.filter(s => studentDecisions[s.id] === "deferred").length}</span>
          </div>
          <div className={styles.reviewNavigation}>
            <button
              className={styles.navButton}
              onClick={handlePreviousClass}
              disabled={currentClassIndex === 0}
            >
              ← Previous
            </button>
            <button
              className={styles.navButton}
              onClick={handleNextClass}
            >
              {currentClassIndex < totalClasses - 1 ? "Next →" : "Review Complete →"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderConfirmStep = () => {
    const allStudents: StudentPromotionStatus[] = [];
    Object.values(classStudents).forEach(students => {
      allStudents.push(...students);
    });

    let totalPromoted = 0;
    let totalRetained = 0;
    let totalGraduated = 0;
    let totalDeferred = 0;

    allStudents.forEach(s => {
      const decision = studentDecisions[s.id] || "promoted";
      if (decision === "promoted") totalPromoted++;
      else if (decision === "retained") totalRetained++;
      else if (decision === "graduated") totalGraduated++;
      else if (decision === "deferred") totalDeferred++;
    });

    const totalProcessed = allStudents.length;

    if (totalPromoted === 0 && totalRetained === 0 && totalGraduated === 0 && totalDeferred === 0) {
      return (
        <div className={styles.stepContent}>
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>⚠️</div>
            <h3>No Students Selected</h3>
            <p>You haven't selected any students for promotion, retention, graduation, or deferral.</p>
            <button
              className={styles.primaryButton}
              onClick={() => setCurrentStep("review")}
            >
              Go Back to Review
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className={styles.stepContent}>
        <h3 className={styles.stepTitle}>Confirm Promotion</h3>
        <p className={styles.stepDescription}>
          Review the summary below before confirming
        </p>

        <div className={styles.confirmSummary}>
          <div className={styles.confirmCard}>
            <div className={styles.confirmIcon}>✅</div>
            <div className={styles.confirmLabel}>Promoted</div>
            <div className={styles.confirmValue}>{totalPromoted}</div>
            <div className={styles.confirmSub}>Students will move to the next class</div>
          </div>

          <div className={styles.confirmCard}>
            <div className={styles.confirmIcon}>🔄</div>
            <div className={styles.confirmLabel}>Retained</div>
            <div className={styles.confirmValue}>{totalRetained}</div>
            <div className={styles.confirmSub}>Students will repeat the same class</div>
          </div>

          <div className={styles.confirmCard}>
            <div className={styles.confirmIcon}>🎓</div>
            <div className={styles.confirmLabel}>Graduated</div>
            <div className={styles.confirmValue}>{totalGraduated}</div>
            <div className={styles.confirmSub}>Students will graduate from the school</div>
          </div>

          <div className={styles.confirmCard}>
            <div className={styles.confirmIcon}>⏸️</div>
            <div className={styles.confirmLabel}>Deferred</div>
            <div className={styles.confirmValue}>{totalDeferred}</div>
            <div className={styles.confirmSub}>Students will have no class assigned</div>
          </div>

          <div className={styles.confirmCard}>
            <div className={styles.confirmIcon}>📌</div>
            <div className={styles.confirmLabel}>Total Students</div>
            <div className={styles.confirmValue}>{totalProcessed}</div>
            <div className={styles.confirmSub}>All students processed</div>
          </div>
        </div>

        <div className={styles.confirmDetails}>
          <h4>Promotion Details</h4>
          <div className={styles.confirmDetailsGrid}>
            <div>
              <span className={styles.label}>From:</span>
              <span className={styles.value}>
                {academicYears.find(y => y.id === parseInt(selectedFromAcademicYear))?.year} - 
                {fromTerms.find(t => t.id === parseInt(selectedFromTerm))?.name}
              </span>
            </div>
            <div>
              <span className={styles.label}>To:</span>
              <span className={styles.value}>
                {academicYears.find(y => y.id === parseInt(selectedToAcademicYear))?.year} - 
                {toTerms.find(t => t.id === parseInt(selectedToTerm))?.name}
              </span>
            </div>
            <div>
              <span className={styles.label}>Total Students:</span>
              <span className={styles.value}>{totalProcessed}</span>
            </div>
          </div>
        </div>

        <div className={styles.dangerWarning}>
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M12,2C6.48,2,2,6.48,2,12s4.48,10,10,10s10-4.48,10-10S17.52,2,12,2z M12,20c-4.41,0-8-3.59-8-8s3.59-8,8-8s8,3.59,8,8S16.41,20,12,20z M11,7h2v8h-2V7z M11,17h2v2h-2V17z"/>
          </svg>
          <div>
            <strong>Warning:</strong> This action cannot be undone. Please ensure all selections are correct before proceeding.
          </div>
        </div>
      </div>
    );
  };

  const renderResults = () => {
    if (!promotionResults) return null;

    return (
      <div className={styles.stepContent}>
        <h3 className={styles.stepTitle}>
          {promotionResults.success ? "✅ Promotion Complete" : "⚠️ Promotion Completed with Errors"}
        </h3>
        <p className={styles.stepDescription}>
          {promotionResults.success
            ? "All students have been processed successfully."
            : `Some errors occurred. ${promotionResults.errors?.length || 0} error(s) reported.`}
        </p>

        <div className={styles.resultSummary}>
          <div className={styles.resultCard}>
            <div className={styles.resultLabel}>Total Processed</div>
            <div className={styles.resultValue}>{promotionResults.totalProcessed}</div>
          </div>
          <div className={styles.resultCard}>
            <div className={styles.resultLabel}>Promoted</div>
            <div className={styles.resultValue}>{promotionResults.promotedCount}</div>
          </div>
          <div className={styles.resultCard}>
            <div className={styles.resultLabel}>Retained</div>
            <div className={styles.resultValue}>{promotionResults.retainedCount}</div>
          </div>
          <div className={styles.resultCard}>
            <div className={styles.resultLabel}>Graduated</div>
            <div className={styles.resultValue}>{promotionResults.graduatedCount}</div>
          </div>
          <div className={styles.resultCard}>
            <div className={styles.resultLabel}>Deferred</div>
            <div className={styles.resultValue}>{promotionResults.deferredCount || 0}</div>
          </div>
          <div className={styles.resultCard}>
            <div className={styles.resultLabel}>Already Promoted</div>
            <div className={styles.resultValue}>{promotionResults.alreadyPromotedCount}</div>
          </div>
          {promotionResults.failedCount > 0 && (
            <div className={`${styles.resultCard} ${styles.resultError}`}>
              <div className={styles.resultLabel}>Failed</div>
              <div className={styles.resultValue}>{promotionResults.failedCount}</div>
            </div>
          )}
        </div>

        {promotionResults.errors && promotionResults.errors.length > 0 && (
          <div className={styles.errorList}>
            <h4>Errors:</h4>
            <ul>
              {promotionResults.errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <div className={styles.resultActions}>
          <button
            className={styles.primaryButton}
            onClick={() => {
              setShowPromotionModal(false);
              setShowResults(false);
            }}
          >
            Close
          </button>
          {promotionResults.results && promotionResults.results.length > 0 && (
            <button
              className={styles.secondaryButton}
              onClick={() => {
                const columns = [
                  { header: "Student", accessor: (row: PromotionResult) => row.studentName },
                  { header: "From Class", accessor: (row: PromotionResult) => row.fromClass },
                  { header: "To Class", accessor: (row: PromotionResult) => row.toClass || "—" },
                  { header: "Status", accessor: (row: PromotionResult) => row.status },
                  { header: "Error", accessor: (row: PromotionResult) => row.errorMessage || "—" },
                ];
                exportToCSV(promotionResults.results, columns, {
                  filename: `promotion-results-${new Date().toISOString().split("T")[0]}`,
                });
              }}
            >
              Export Results
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderModalContent = () => {
    if (showResults && promotionResults) {
      return renderResults();
    }

    switch (currentStep) {
      case "type":
        return renderPromotionTypeStep();
      case "filters":
        return renderFiltersStep();
      case "same-year-confirm":
        return renderSameYearConfirmStep();
      case "review":
        return renderReviewStep();
      case "confirm":
        return renderConfirmStep();
      default:
        return null;
    }
  };

  const renderModalFooter = () => {
    if (showResults && promotionResults) return null;

    const getFooterButtons = () => {
      switch (currentStep) {
        case "type":
          return (
            <>
              <button
                className={styles.secondaryButton}
                onClick={handleClosePromotionModal}
              >
                Cancel
              </button>
              <button
                className={styles.primaryButton}
                onClick={() => {
                  if (promotionType === "single" && selectedStudent) {
                    setCurrentStep("filters");
                  } else {
                    setCurrentStep("filters");
                  }
                }}
              >
                Continue →
              </button>
            </>
          );

        case "filters":
          return (
            <>
              <button
                className={styles.secondaryButton}
                onClick={() => setCurrentStep("type")}
              >
                ← Back
              </button>
              <button
                className={styles.primaryButton}
                onClick={promotionType === "single" ? handleSinglePromotionSubmit : handleBatchPromotionSubmit}
                disabled={processing}
              >
                {processing ? "Processing..." : promotionType === "single" ? "Promote" : "Review Students →"}
              </button>
            </>
          );

        case "same-year-confirm":
          return (
            <>
              <button
                className={styles.secondaryButton}
                onClick={() => setCurrentStep("filters")}
              >
                ← Back
              </button>
              <button
                className={styles.dangerButton}
                onClick={handleSameYearPromotionConfirm}
                disabled={processing}
              >
                {processing ? "Processing..." : "Confirm Term Change"}
              </button>
            </>
          );

        case "review":
          return (
            <>
              <button
                className={styles.secondaryButton}
                onClick={() => setCurrentStep("filters")}
              >
                ← Back
              </button>
              <button
                className={styles.primaryButton}
                onClick={() => setCurrentStep("confirm")}
              >
                Proceed to Confirmation →
              </button>
            </>
          );

        case "confirm":
          return (
            <>
              <button
                className={styles.secondaryButton}
                onClick={() => setCurrentStep("review")}
              >
                ← Back
              </button>
              <button
                className={styles.dangerButton}
                onClick={handleConfirmPromotion}
                disabled={processing}
              >
                {processing ? "Processing..." : "Confirm Promotion"}
              </button>
            </>
          );

        default:
          return null;
      }
    };

    return (
      <div className={styles.modalFooter}>
        {getFooterButtons()}
      </div>
    );
  };

  // ============================================
  // RENDER HISTORY MODAL
  // ============================================

  const renderHistoryModal = () => {
    if (!showHistory) return null;

    return (
      <div className={styles.modalOverlay} onClick={() => setShowHistory(false)}>
        <div className={`${styles.modal} ${styles.historyModal}`} onClick={(e) => e.stopPropagation()}>
          <div className={styles.modalHeader}>
            <h2>Promotion & Retention History</h2>
            <button className={styles.closeButton} onClick={() => setShowHistory(false)}>
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
              </svg>
            </button>
          </div>

          <div className={styles.modalBody}>
            {/* Filters */}
            <div className={styles.historyFilters}>
              <div className={styles.filterRow}>
                <div className={styles.filterGroup}>
                  <label>Start Date</label>
                  <input
                    type="date"
                    className={styles.filterInput}
                    value={historyFilters.startDate || ""}
                    onChange={(e) => handleHistoryFilterChange("startDate", e.target.value)}
                  />
                </div>
                <div className={styles.filterGroup}>
                  <label>End Date</label>
                  <input
                    type="date"
                    className={styles.filterInput}
                    value={historyFilters.endDate || ""}
                    onChange={(e) => handleHistoryFilterChange("endDate", e.target.value)}
                  />
                </div>
                <div className={styles.filterGroup}>
                  <label>Type</label>
                  <select
                    className={styles.select}
                    value={historyFilters.type?.join(",") || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      const types = value ? value.split(",") : [];
                      handleHistoryFilterChange("type", types);
                    }}
                  >
                    <option value="">All Types</option>
                    <option value="promoted">Promoted</option>
                    <option value="retained">Retained</option>
                    <option value="graduated">Graduated</option>
                    <option value="deferred">Deferred</option>
                    <option value="promoted,retained">Promoted & Retained</option>
                    <option value="promoted,graduated">Promoted & Graduated</option>
                    <option value="promoted,deferred">Promoted & Deferred</option>
                    <option value="retained,graduated">Retained & Graduated</option>
                    <option value="retained,deferred">Retained & Deferred</option>
                    <option value="graduated,deferred">Graduated & Deferred</option>
                    <option value="promoted,retained,graduated,deferred">All Types</option>
                  </select>
                </div>
                <div className={styles.filterGroup}>
                  <label>&nbsp;</label>
                  <div className={styles.filterActions}>
                    <button className={styles.primaryButtonSmall} onClick={applyHistoryFilters}>
                      Apply Filters
                    </button>
                    <button className={styles.secondaryButtonSmall} onClick={clearHistoryFilters}>
                      Clear
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* History Table */}
            <div className={styles.historyTableWrapper}>
              <Table
                columns={historyColumns}
                data={historyData}
                variant="default"
                size="md"
                pagination={true}
                pageSize={historyPageSize}
                currentPage={historyPage}
                totalItems={historyTotal}
                onPageChange={handleHistoryPageChange}
                loading={historyLoading}
                emptyMessage="No history records found"
                showRowNumbers={true}
              />
            </div>
          </div>

          <div className={styles.modalFooter}>
            <div className={styles.footerLeft}>
              <span className={styles.totalRecords}>Total: {historyTotal} records</span>
            </div>
            <div className={styles.footerRight}>
              <button className={styles.secondaryButton} onClick={() => setShowHistory(false)}>
                Close
              </button>
              {historyData.length > 0 && (
                <>
                  <button className={styles.exportButton} onClick={() => handleExportHistory("csv")}>
                    Export CSV
                  </button>
                  <button className={styles.exportButton} onClick={() => handleExportHistory("pdf")}>
                    Export PDF
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ============================================
  // MAIN RENDER
  // ============================================

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <Header title="Promotion Management" subtitle="Loading..." />
        <div className={styles.contentWrapper}>
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <Header
        title="Promotion Management"
        subtitle="Promote students to the next class or term"
        customActions={
          <div className={styles.headerActions}>
            <button
              className={styles.historyButton}
              onClick={openHistoryModal}
            >
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path fill="currentColor" d="M13,3a9,9,0,0,0-9,9H1l3.89,3.89L7.78,12H5a7,7,0,1,1,7,7,7,7,0,0,1-4.82-1.82l-1.42,1.42A9,9,0,1,0,13,3Z"/>
              </svg>
              History
            </button>
            <button
              className={styles.promoteButton}
              onClick={handleOpenPromotionModal}
            >
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path fill="currentColor" d="M12,2C6.48,2,2,6.48,2,12s4.48,10,10,10s10-4.48,10-10S17.52,2,12,2z M12,20c-4.41,0-8-3.59-8-8s3.59-8,8-8s8,3.59,8,8S16.41,20,12,20z M13,7h-2v6h6v-2h-4V7z"/>
              </svg>
              Promote Students
            </button>
          </div>
        }
      />

      <div className={styles.contentWrapper}>
        <Stats stats={stats} variant="cards" columns={4} showIcon={true} size="md" />

        <div className={styles.filterSection}>
          <div className={styles.filterRow}>
            <div className={styles.filterGroup}>
              <label>Academic Year</label>
              <select
                value={selectedFromAcademicYear}
                onChange={(e) => setSelectedFromAcademicYear(e.target.value)}
                className={styles.select}
              >
                <option value="">Select Academic Year</option>
                {academicYears.map((year) => (
                  <option key={year.id} value={year.id}>
                    {year.year} - {year.name}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label>Term</label>
              <select
                value={selectedFromTerm}
                onChange={(e) => setSelectedFromTerm(e.target.value)}
                className={styles.select}
                disabled={!selectedFromAcademicYear}
              >
                <option value="">Select Term</option>
                {fromTerms.map((term) => (
                  <option key={term.id} value={term.id}>
                    {term.name} {term.is_active ? "(Active)" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label>Class</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className={styles.select}
              >
                <option value="">All Classes</option>
                {classes
                  .filter(c => c.status === "active")
                  .sort((a, b) => a.sequence - b.sequence)
                  .map(cls => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} {cls.section ? `- ${cls.section}` : ""} ({cls.level})
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </div>

        <div className={styles.tableSection}>
          <Table
            columns={studentColumns}
            data={students}
            variant="default"
            size="md"
            pagination={true}
            pageSize={10}
            showRowNumbers={true}
            emptyMessage="No students found. Select a class to view students."
            loading={loading}
          />
        </div>
      </div>

      {/* Promotion Modal */}
      {showPromotionModal && (
        <div className={styles.modalOverlay} onClick={handleClosePromotionModal}>
          <div className={`${styles.modal} ${currentStep === "review" ? styles.largeModal : ""}`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>
                {showResults && promotionResults ? "Promotion Results" : (
                  promotionType === "single" ? "Promote Student" : "Batch Promotion"
                )}
              </h2>
              <button
                className={styles.closeButton}
                onClick={handleClosePromotionModal}
                disabled={processing}
              >
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                </svg>
              </button>
            </div>

            <div className={styles.modalBody}>
              {renderModalContent()}
            </div>

            {renderModalFooter()}
          </div>
        </div>
      )}

      {/* History Modal */}
      {renderHistoryModal()}
    </div>
  );
}