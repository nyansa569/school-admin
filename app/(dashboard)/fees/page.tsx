// app/(dashboard)/fees/page.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import styles from "./fees.module.css";
import Header from "@/components/Header/Header";
import Stats from "@/components/Stats/Stats";
import Table from "@/components/Table/Table";
import {
  getFeeStructures,
  createFeeStructure,
  updateFeeStructure,
  deleteFeeStructure,
  bulkAssignFeesToClass,
  assignStudentFee,
  getClassFeeStatus,
  recordPayment,
  getFeeStatistics,
  updateStudentFeeStatus,
  applyStudentDiscount,
  getAllFeesTransactions,
  addArrearsToStudentFee,
  getFeeTypes,
  getExtraFees,
  createExtraFeeStructure,
  getExtraFeeStructures,
  assignExtraFeeToIndividualStudent,
  recordExtraFeePayment,
  getExtraFeeStatistics,
  getExtraFeePayments,
  deleteExtraFeeStructure,
  deleteExtraFee,
  updateExtraFeeStructure,
  createFeeType,
  updateFeeType,
  deleteFeeType,
  getStudentsByClass,
} from "@/lib/action/admin/fees";
import { getClasses } from "@/lib/action/admin/fees";
import { getAcademicYears, getTerms } from "@/lib/action/admin/fees";
import {
  generatePaymentReceipt,
  generateBulkPaymentReceipts,
} from "@/lib/actions/pdf";
import { DownloadPDFButton } from "@/components/DownloadPDFButton";
import {
  generateFeeReceiptPDF,
  generateExtraFeeReceiptPDF,
} from "@/lib/pdf/generator";
import { useRouter } from "next/navigation";
type TabType =
  | "overview"
  | "feeStructure"
  | "classFees"
  | "extraFees"
  | "payments";

export default function FeesPage() {
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [terms, setTerms] = useState<any[]>([]);
  const [feeStructures, setFeeStructures] = useState<any[]>([]);
  const [classFeeStatus, setClassFeeStatus] = useState<any[]>([]);
  const [allPayments, setAllPayments] = useState<any[]>([]);
  const [extraFees, setExtraFees] = useState<any[]>([]);
  const [extraFeeStructures, setExtraFeeStructures] = useState<any[]>([]);
  const [extraFeePayments, setExtraFeePayments] = useState<any[]>([]);
  const [feeTypes, setFeeTypes] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>("");
  const [selectedTerm, setSelectedTerm] = useState<string>("");
  const [selectedFrequency, setSelectedFrequency] = useState<string>("");
  const [statistics, setStatistics] = useState<any>(null);
  const [extraFeeStatistics, setExtraFeeStatistics] = useState<any>(null);
  const [lastPaymentRecord, setLastPaymentRecord] = useState<any>(null);
  const [lastExtraPaymentRecord, setLastExtraPaymentRecord] =
    useState<any>(null);
  const router = useRouter();

  // Modal states
  const [showFeeStructureModal, setShowFeeStructureModal] = useState(false);
  const [showEditFeeStructureModal, setShowEditFeeStructureModal] =
    useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showIndividualModal, setShowIndividualModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [showArrearsModal, setShowArrearsModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showExtraFeeStructureModal, setShowExtraFeeStructureModal] =
    useState(false);
  const [
    showExtraFeeIndividualAssignModal,
    setShowExtraFeeIndividualAssignModal,
  ] = useState(false);
  const [showExtraPaymentModal, setShowExtraPaymentModal] = useState(false);
  const [showFeeTypeModal, setShowFeeTypeModal] = useState(false);
  const [showExtraSuccessModal, setShowExtraSuccessModal] = useState(false);

  const [selectedStudentFee, setSelectedStudentFee] = useState<any>(null);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [selectedExtraFee, setSelectedExtraFee] = useState<any>(null);
  const [editingFeeStructure, setEditingFeeStructure] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  // Form states - Fee Structure
  const [feeStructureForm, setFeeStructureForm] = useState({
    class_id: "",
    academic_year_id: "",
    term_id: "",
    fee_type_id: "",
    amount: "",
    description: "",
    is_mandatory: true,
    due_date: "",
    late_fee_amount: "",
  });

  // Form states - Bulk Assign
  const [bulkForm, setBulkForm] = useState({
    amount: "",
    scholarship_type: "none",
    discount_percentage: "0",
    term_id: "",
    due_date: "",
  });

  // Form states - Individual Assign
  const [individualForm, setIndividualForm] = useState({
    student_id: "",
    amount: "",
    scholarship_type: "none",
    discount_percentage: "0",
    term_id: "",
    due_date: "",
  });

  // Form states - Payment
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    payment_method: "cash",
    payment_reference: "",
    notes: "",
  });

  // Form states - Discount
  const [discountForm, setDiscountForm] = useState({
    discount_percentage: "",
    reason: "",
  });

  // Form states - Arrears
  const [arrearsForm, setArrearsForm] = useState({
    amount: "",
    reason: "",
  });

  // Form states - Extra Fee Structure
  const [extraFeeStructureForm, setExtraFeeStructureForm] = useState({
    class_id: "",
    fee_type_id: "",
    academic_year_id: "",
    term_id: "",
    amount: "",
    description: "",
    frequency: "one-time",
    due_date: "",
    is_mandatory: true,
  });

  // Form states - Extra Fee Individual Assign
  const [extraFeeIndividualForm, setExtraFeeIndividualForm] = useState({
    student_id: "",
    extra_fee_structure_id: "",
  });

  // Form states - Extra Payment
  const [extraPaymentForm, setExtraPaymentForm] = useState({
    amount: "",
    payment_method: "cash",
    payment_reference: "",
    notes: "",
  });

  // Form states - Fee Type
  const [feeTypeForm, setFeeTypeForm] = useState({
    name: "",
    code: "",
    description: "",
  });
  const [editingFeeType, setEditingFeeType] = useState<any>(null);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Load data based on active tab
  useEffect(() => {
    if (activeTab === "overview") {
      loadStatistics();
      loadExtraFeeStatistics();
    } else if (activeTab === "feeStructure") {
      loadFeeStructures();
      loadFeeTypes();
    } else if (activeTab === "classFees" && selectedClass) {
      loadClassFeeStatus();
    } else if (activeTab === "extraFees") {
      loadExtraFeeStructures();
      loadExtraFees();
      loadFeeTypes();
    } else if (activeTab === "payments") {
      loadAllPayments();
    }
  }, [
    activeTab,
    selectedClass,
    selectedAcademicYear,
    selectedTerm,
    selectedFrequency,
  ]);

  // Load students when class changes for extra fee individual assign
  useEffect(() => {
    if (selectedClass) {
      loadStudents(parseInt(selectedClass));
    } else {
      setStudents([]);
    }
  }, [selectedClass]);

  // Load terms when academic year changes
  useEffect(() => {
    if (selectedAcademicYear) {
      loadTerms(parseInt(selectedAcademicYear));
    } else {
      setTerms([]);
    }
  }, [selectedAcademicYear]);

  // ============================================
  // LOAD FUNCTIONS
  // ============================================

  const loadInitialData = async () => {
    setLoading(true);
    const [classesResult, yearsResult] = await Promise.all([
      getClasses(),
      getAcademicYears(),
    ]);

    if (classesResult.classes) setClasses(classesResult.classes);
    if (yearsResult.years) setAcademicYears(yearsResult.years);

    setLoading(false);
  };

  const loadTerms = async (academicYearId: number) => {
    const termsResult = await getTerms(academicYearId);
    if (termsResult.terms) setTerms(termsResult.terms);
  };

  const loadStudents = async (classId: number) => {
    const result = await getStudentsByClass(classId);
    if (result.students) setStudents(result.students);
  };

  const loadStatistics = async () => {
    const result = await getFeeStatistics(
      selectedAcademicYear ? parseInt(selectedAcademicYear) : undefined,
      selectedTerm ? parseInt(selectedTerm) : undefined,
    );
    if (result.stats) setStatistics(result.stats);
  };

  const loadExtraFeeStatistics = async () => {
    const result = await getExtraFeeStatistics(
      selectedAcademicYear ? parseInt(selectedAcademicYear) : undefined,
      selectedTerm ? parseInt(selectedTerm) : undefined,
    );
    if (result.stats) setExtraFeeStatistics(result.stats);
  };

  const loadFeeStructures = async () => {
    const result = await getFeeStructures(
      selectedClass ? parseInt(selectedClass) : undefined,
      selectedAcademicYear ? parseInt(selectedAcademicYear) : undefined,
      selectedTerm ? parseInt(selectedTerm) : undefined,
    );
    if (result.fees) setFeeStructures(result.fees);
  };

  const loadClassFeeStatus = async () => {
    const result = await getClassFeeStatus(
      parseInt(selectedClass),
      selectedAcademicYear ? parseInt(selectedAcademicYear) : undefined,
      selectedTerm ? parseInt(selectedTerm) : undefined,
    );
    if (result.students) setClassFeeStatus(result.students);
  };

  const loadAllPayments = async () => {
    const [feePayments, extraPayments] = await Promise.all([
      getAllFeesTransactions(1, 50, {
        classId: selectedClass ? parseInt(selectedClass) : undefined,
      }),
      getExtraFeePayments(undefined, undefined, 50),
    ]);

    let combined: any[] = [];
    if (feePayments.payments) combined = [...combined, ...feePayments.payments];
    if (extraPayments.payments)
      combined = [...combined, ...extraPayments.payments];
    combined.sort(
      (a, b) =>
        new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime(),
    );
    setAllPayments(combined);
  };

  const loadExtraFees = async () => {
    const result = await getExtraFees(
      undefined, // studentId - not filtering by student
      selectedAcademicYear ? parseInt(selectedAcademicYear) : undefined,
      selectedTerm ? parseInt(selectedTerm) : undefined,
      undefined, // status
    );
    if (result.fees) {
      let filteredFees = result.fees;

      // Filter by class if selected
      if (selectedClass) {
        filteredFees = filteredFees.filter(
          (fee: any) => fee.class_id === parseInt(selectedClass),
        );
      }

      // Filter by frequency if selected
      if (selectedFrequency) {
        filteredFees = filteredFees.filter(
          (fee: any) => fee.frequency === selectedFrequency,
        );
      }

      setExtraFees(filteredFees);
    }
  };

  const loadExtraFeeStructures = async () => {
    const result = await getExtraFeeStructures(
      selectedClass ? parseInt(selectedClass) : undefined,
      selectedAcademicYear ? parseInt(selectedAcademicYear) : undefined,
      selectedTerm ? parseInt(selectedTerm) : undefined,
    );
    if (result.structures) setExtraFeeStructures(result.structures);
  };

  const loadFeeTypes = async () => {
    const result = await getFeeTypes();
    if (result.feeTypes) setFeeTypes(result.feeTypes);
  };

  // ============================================
  // FEE STRUCTURE HANDLERS
  // ============================================

  const handleCreateFeeStructure = async () => {
    if (
      !feeStructureForm.class_id ||
      !feeStructureForm.academic_year_id ||
      !feeStructureForm.amount
    ) {
      alert("Please fill all required fields");
      return;
    }

    const formData = new FormData();
    formData.append("class_id", feeStructureForm.class_id);
    formData.append("academic_year_id", feeStructureForm.academic_year_id);
    formData.append("amount", feeStructureForm.amount);
    formData.append("description", feeStructureForm.description);
    formData.append("is_mandatory", String(feeStructureForm.is_mandatory));

    if (feeStructureForm.term_id)
      formData.append("term_id", feeStructureForm.term_id);
    if (feeStructureForm.fee_type_id)
      formData.append("fee_type_id", feeStructureForm.fee_type_id);
    if (feeStructureForm.due_date)
      formData.append("due_date", feeStructureForm.due_date);
    if (feeStructureForm.late_fee_amount)
      formData.append("late_fee_amount", feeStructureForm.late_fee_amount);

    const result = await createFeeStructure(formData);
    if (result.success) {
      alert("Fee structure created successfully");
      setShowFeeStructureModal(false);
      setFeeStructureForm({
        class_id: "",
        academic_year_id: "",
        term_id: "",
        fee_type_id: "",
        amount: "",
        description: "",
        is_mandatory: true,
        due_date: "",
        late_fee_amount: "",
      });
      loadFeeStructures();
    } else {
      alert(result.error);
    }
  };

  const handleEditFeeStructure = (feeStructure: any) => {
    setEditingFeeStructure(feeStructure);
    setFeeStructureForm({
      class_id: feeStructure.class_id.toString(),
      academic_year_id: feeStructure.academic_year_id.toString(),
      term_id: feeStructure.term_id?.toString() || "",
      fee_type_id: feeStructure.fee_type_id?.toString() || "",
      amount: feeStructure.amount.toString(),
      description: feeStructure.description || "",
      is_mandatory: feeStructure.is_mandatory,
      due_date: feeStructure.due_date || "",
      late_fee_amount: feeStructure.late_fee_amount?.toString() || "",
    });
    setShowEditFeeStructureModal(true);
  };

  const handleUpdateFeeStructure = async () => {
    if (!editingFeeStructure) return;

    const formData = new FormData();
    formData.append("amount", feeStructureForm.amount);
    formData.append("description", feeStructureForm.description);
    formData.append("is_mandatory", String(feeStructureForm.is_mandatory));
    if (feeStructureForm.term_id)
      formData.append("term_id", feeStructureForm.term_id);
    if (feeStructureForm.fee_type_id)
      formData.append("fee_type_id", feeStructureForm.fee_type_id);
    if (feeStructureForm.due_date)
      formData.append("due_date", feeStructureForm.due_date);
    if (feeStructureForm.late_fee_amount)
      formData.append("late_fee_amount", feeStructureForm.late_fee_amount);
    formData.append("status", "active");

    const result = await updateFeeStructure(editingFeeStructure.id, formData);
    if (result.success) {
      alert("Fee structure updated successfully");
      setShowEditFeeStructureModal(false);
      setEditingFeeStructure(null);
      loadFeeStructures();
    } else {
      alert(result.error);
    }
  };

  const handleDeleteFeeStructure = async (id: number) => {
    if (confirm("Are you sure you want to delete this fee structure?")) {
      const result = await deleteFeeStructure(id);
      if (result.success) {
        alert("Fee structure deleted successfully");
        loadFeeStructures();
      } else {
        alert(result.error);
      }
    }
  };

  // ============================================
  // BULK/INDIVIDUAL ASSIGN HANDLERS
  // ============================================

  const handleBulkAssign = async () => {
    if (!selectedClass || !selectedAcademicYear || !bulkForm.amount) {
      alert("Please fill all required fields");
      return;
    }

    const result = await bulkAssignFeesToClass(
      parseInt(selectedClass),
      parseInt(selectedAcademicYear),
      bulkForm.term_id ? parseInt(bulkForm.term_id) : null,
      parseFloat(bulkForm.amount),
      undefined,
      undefined,
      bulkForm.due_date || undefined,
      bulkForm.scholarship_type,
      bulkForm.discount_percentage
        ? parseInt(bulkForm.discount_percentage)
        : undefined,
    );

    if (result.success) {
      alert(`Successfully assigned fees to ${result.assignedCount} students`);
      setShowBulkModal(false);
      setBulkForm({
        amount: "",
        scholarship_type: "none",
        discount_percentage: "0",
        term_id: "",
        due_date: "",
      });
      loadClassFeeStatus();
    } else {
      alert(result.error);
    }
  };

  const handleIndividualAssign = async () => {
    if (!individualForm.student_id || !individualForm.amount) {
      alert("Please select a student and enter amount");
      return;
    }

    const result = await assignStudentFee(
      parseInt(individualForm.student_id),
      parseInt(selectedClass),
      parseInt(selectedAcademicYear),
      individualForm.term_id ? parseInt(individualForm.term_id) : null,
      parseFloat(individualForm.amount),
      undefined,
      undefined,
      individualForm.due_date || undefined,
      individualForm.scholarship_type,
      individualForm.discount_percentage
        ? parseInt(individualForm.discount_percentage)
        : undefined,
    );

    if (result.success) {
      alert("Fee assigned successfully");
      setShowIndividualModal(false);
      setIndividualForm({
        student_id: "",
        amount: "",
        scholarship_type: "none",
        discount_percentage: "0",
        term_id: "",
        due_date: "",
      });
      loadClassFeeStatus();
    } else {
      alert(result.error);
    }
  };

  // ============================================
  // PAYMENT HANDLERS
  // ============================================

  const handleRecordPayment = async () => {
    if (!selectedStudentFee || !paymentForm.amount) {
      alert("Please enter amount");
      return;
    }

    const result = await recordPayment(
      selectedStudentFee.id,
      selectedStudentFee.student_id,
      parseFloat(paymentForm.amount),
      paymentForm.payment_method,
      paymentForm.payment_reference || undefined,
      paymentForm.notes || undefined,
    );

    if (result.success) {
      setLastPaymentRecord({
        receiptNumber: result.receiptNumber,
        amount: parseFloat(paymentForm.amount),
        studentName:
          selectedStudent?.full_name ||
          `${selectedStudent?.first_name} ${selectedStudent?.last_name}`,
        paymentMethod: paymentForm.payment_method,
        paymentDate: new Date().toLocaleDateString(),
        className: selectedStudentFee.class_name,
        term: selectedStudentFee.term_name,
        academicYear: selectedStudentFee.academic_year,
        admissionNumber: selectedStudent?.admission_number,
        balance: selectedStudentFee.balance - parseFloat(paymentForm.amount),
        totalFees: selectedStudentFee.original_amount,
      });

      setShowPaymentModal(false);
      setPaymentForm({
        amount: "",
        payment_method: "cash",
        payment_reference: "",
        notes: "",
      });
      setShowSuccessModal(true);
      loadClassFeeStatus();
      loadAllPayments();
      loadStatistics();
    } else {
      alert(result.error);
    }
  };

  const handleDownloadPaymentReceipt = async () => {
    if (!lastPaymentRecord?.receiptNumber) return null;

    const receiptData = {
      receiptNo: lastPaymentRecord.receiptNumber,
      date: lastPaymentRecord.paymentDate,
      studentName: lastPaymentRecord.studentName,
      studentId: lastPaymentRecord.admissionNumber,
      className: lastPaymentRecord.className,
      term: lastPaymentRecord.term,
      academicYear: lastPaymentRecord.academicYear,
      amountPaid: lastPaymentRecord.amount,
      paymentMethod: lastPaymentRecord.paymentMethod,
      paymentDate: lastPaymentRecord.paymentDate,
      receivedFrom: lastPaymentRecord.studentName,
      paymentType: "School Fees",
      paymentFor: lastPaymentRecord.term || "Term Fees",
      fees: [
        { description: "Payment Received", amount: lastPaymentRecord.amount },
      ],
      total: lastPaymentRecord.amount,
      totalFees: lastPaymentRecord.totalFees,
      balance: lastPaymentRecord.balance,
    };

    const pdfDataUrl = await generateFeeReceiptPDF(receiptData);
    return pdfDataUrl;
  };

  // ============================================
  // DISCOUNT & ARREARS HANDLERS
  // ============================================

  const handleApplyDiscount = async () => {
    if (!selectedStudentFee || !discountForm.discount_percentage) {
      alert("Please enter discount percentage");
      return;
    }

    const result = await applyStudentDiscount(
      selectedStudentFee.id,
      parseInt(discountForm.discount_percentage),
      discountForm.reason || undefined,
    );

    if (result.success) {
      alert("Discount applied successfully");
      setShowDiscountModal(false);
      setDiscountForm({ discount_percentage: "", reason: "" });
      loadClassFeeStatus();
      loadStatistics();
    } else {
      alert(result.error);
    }
  };

  const handleAddArrears = async () => {
    if (!selectedStudentFee || !arrearsForm.amount) {
      alert("Please enter arrears amount");
      return;
    }

    const result = await addArrearsToStudentFee(
      selectedStudentFee.id,
      parseFloat(arrearsForm.amount),
      arrearsForm.reason || "Manual arrears addition",
    );

    if (result.success) {
      alert(`Arrears of ₵${arrearsForm.amount} added successfully`);
      setShowArrearsModal(false);
      setArrearsForm({ amount: "", reason: "" });
      loadClassFeeStatus();
      loadStatistics();
    } else {
      alert(result.error);
    }
  };

  // ============================================
  // EXTRA FEE STRUCTURE HANDLERS
  // ============================================

  const handleCreateExtraFeeStructure = async () => {
    if (
      !extraFeeStructureForm.class_id ||
      !extraFeeStructureForm.fee_type_id ||
      !extraFeeStructureForm.academic_year_id ||
      !extraFeeStructureForm.amount
    ) {
      alert("Please fill all required fields");
      return;
    }

    const formData = new FormData();
    formData.append("class_id", extraFeeStructureForm.class_id);
    formData.append("fee_type_id", extraFeeStructureForm.fee_type_id);
    formData.append("academic_year_id", extraFeeStructureForm.academic_year_id);
    formData.append("amount", extraFeeStructureForm.amount);
    formData.append("frequency", extraFeeStructureForm.frequency);
    formData.append("is_mandatory", String(extraFeeStructureForm.is_mandatory));

    if (extraFeeStructureForm.term_id)
      formData.append("term_id", extraFeeStructureForm.term_id);
    if (extraFeeStructureForm.description)
      formData.append("description", extraFeeStructureForm.description);
    if (extraFeeStructureForm.due_date)
      formData.append("due_date", extraFeeStructureForm.due_date);

    const result = await createExtraFeeStructure(formData);
    if (result.success) {
      alert("Extra fee structure created successfully");
      setShowExtraFeeStructureModal(false);
      setExtraFeeStructureForm({
        class_id: "",
        fee_type_id: "",
        academic_year_id: "",
        term_id: "",
        amount: "",
        description: "",
        frequency: "one-time",
        due_date: "",
        is_mandatory: true,
      });
      loadExtraFeeStructures();
    } else {
      alert(result.error);
    }
  };

  const handleAssignExtraFeeToIndividual = async () => {
    if (
      !extraFeeIndividualForm.student_id ||
      !extraFeeIndividualForm.extra_fee_structure_id
    ) {
      alert("Please select a student and extra fee structure");
      return;
    }

    const structure = extraFeeStructures.find(
      (s) => s.id === parseInt(extraFeeIndividualForm.extra_fee_structure_id),
    );
    if (!structure) {
      alert("Extra fee structure not found");
      return;
    }

    const result = await assignExtraFeeToIndividualStudent(
      parseInt(extraFeeIndividualForm.extra_fee_structure_id),
      parseInt(extraFeeIndividualForm.student_id),
      structure.class_id,
      structure.academic_year_id,
      structure.term_id || null,
      structure.amount,
      structure.fee_type_id,
      structure.frequency,
      structure.due_date,
      structure.description,
    );

    if (result.success) {
      alert("Extra fee assigned to student successfully");
      setShowExtraFeeIndividualAssignModal(false);
      setExtraFeeIndividualForm({
        student_id: "",
        extra_fee_structure_id: "",
      });
      loadExtraFees();
    } else {
      alert(result.error);
    }
  };

  const handleDeleteExtraFeeStructure = async (id: number) => {
    if (
      confirm(
        "Are you sure you want to delete this extra fee structure? This will also delete all associated student fees.",
      )
    ) {
      const result = await deleteExtraFeeStructure(id);
      if (result.success) {
        alert("Extra fee structure deleted successfully");
        loadExtraFeeStructures();
        loadExtraFees();
      } else {
        alert(result.error);
      }
    }
  };

  const handleDeleteExtraFee = async (id: number) => {
    if (confirm("Are you sure you want to delete this extra fee?")) {
      const result = await deleteExtraFee(id);
      if (result.success) {
        alert("Extra fee deleted successfully");
        loadExtraFees();
      } else {
        alert(result.error);
      }
    }
  };

  // ============================================
  // EXTRA FEE PAYMENT HANDLERS
  // ============================================

  const handleRecordExtraPayment = async () => {
    if (!selectedExtraFee || !extraPaymentForm.amount) {
      alert("Please enter amount");
      return;
    }

    const result = await recordExtraFeePayment({
      extraFeeId: selectedExtraFee.id,
      studentId: selectedExtraFee.student_id,
      amount: parseFloat(extraPaymentForm.amount),
      paymentMethod: extraPaymentForm.payment_method,
      paymentReference: extraPaymentForm.payment_reference || undefined,
      notes: extraPaymentForm.notes || undefined,
    });

    if (result.success) {
      setLastExtraPaymentRecord({
        receiptNumber: result.receiptNumber,
        amount: parseFloat(extraPaymentForm.amount),
        studentName:
          selectedExtraFee.student_name ||
          `Student ${selectedExtraFee.student_id}`,
        paymentMethod: extraPaymentForm.payment_method,
        paymentDate: new Date().toLocaleDateString(),
        feeType: selectedExtraFee.fee_type_name,
        frequency: selectedExtraFee.frequency,
        balance: selectedExtraFee.balance - parseFloat(extraPaymentForm.amount),
        totalFees: selectedExtraFee.amount,
      });

      setShowExtraPaymentModal(false);
      setExtraPaymentForm({
        amount: "",
        payment_method: "cash",
        payment_reference: "",
        notes: "",
      });
      setShowExtraSuccessModal(true);
      loadExtraFees();
      loadAllPayments();
      loadExtraFeeStatistics();
    } else {
      alert(result.error);
    }
  };

  const handleDownloadExtraPaymentReceipt = async () => {
    if (!lastExtraPaymentRecord?.receiptNumber) return null;

    const receiptData = {
      receiptNo: lastExtraPaymentRecord.receiptNumber,
      date: lastExtraPaymentRecord.paymentDate,
      studentName: lastExtraPaymentRecord.studentName,
      amountPaid: lastExtraPaymentRecord.amount,
      paymentMethod: lastExtraPaymentRecord.paymentMethod,
      paymentDate: lastExtraPaymentRecord.paymentDate,
      receivedFrom: lastExtraPaymentRecord.studentName,
      paymentType: "Extra Fee",
      paymentFor: lastExtraPaymentRecord.feeType || "Extra Fee",
      feeType: lastExtraPaymentRecord.feeType,
      frequency: lastExtraPaymentRecord.frequency,
      total: lastExtraPaymentRecord.amount,
      totalFees: lastExtraPaymentRecord.totalFees,
      balance: lastExtraPaymentRecord.balance,
    };

    const pdfDataUrl = await generateExtraFeeReceiptPDF(receiptData);
    return pdfDataUrl;
  };

  // ============================================
  // FEE TYPE HANDLERS
  // ============================================

  const handleCreateFeeType = async () => {
    if (!feeTypeForm.name || !feeTypeForm.code) {
      alert("Please enter name and code");
      return;
    }

    const result = await createFeeType({
      name: feeTypeForm.name,
      code: feeTypeForm.code,
      description: feeTypeForm.description || undefined,
    });

    if (result.success) {
      alert("Fee type created successfully");
      setShowFeeTypeModal(false);
      setFeeTypeForm({ name: "", code: "", description: "" });
      loadFeeTypes();
    } else {
      alert(result.error);
    }
  };

  const handleEditFeeType = (feeType: any) => {
    setEditingFeeType(feeType);
    setFeeTypeForm({
      name: feeType.name,
      code: feeType.code,
      description: feeType.description || "",
    });
    setShowFeeTypeModal(true);
  };

  const handleUpdateFeeType = async () => {
    if (!editingFeeType) return;

    const result = await updateFeeType(editingFeeType.id, {
      name: feeTypeForm.name,
      code: feeTypeForm.code,
      description: feeTypeForm.description || undefined,
    });

    if (result.success) {
      alert("Fee type updated successfully");
      setShowFeeTypeModal(false);
      setEditingFeeType(null);
      setFeeTypeForm({ name: "", code: "", description: "" });
      loadFeeTypes();
    } else {
      alert(result.error);
    }
  };

  const handleDeleteFeeType = async (id: number) => {
    if (confirm("Are you sure you want to delete this fee type?")) {
      const result = await deleteFeeType(id);
      if (result.success) {
        alert("Fee type deleted successfully");
        loadFeeTypes();
      } else {
        alert(result.error);
      }
    }
  };

  const handleBulkDownloadReceipts = async () => {
    alert("Bulk download functionality coming soon");
  };

  // ============================================
  // STATS
  // ============================================

  const overviewStats = useMemo(() => {
    if (!statistics) return [];
    return [
      {
        id: 1,
        label: "Total Expected",
        value: `₵${statistics.totalExpected?.toLocaleString() || "0"}`,
        color: "blue",
        type: "revenue",
      },
      {
        id: 2,
        label: "Total Paid",
        value: `₵${statistics.totalPaid?.toLocaleString() || "0"}`,
        color: "green",
        type: "revenue",
      },
      {
        id: 3,
        label: "Outstanding",
        value: `₵${statistics.totalOutstanding?.toLocaleString() || "0"}`,
        color: "orange",
        type: "revenue",
      },
      {
        id: 4,
        label: "Total Arrears",
        value: `₵${statistics.totalArrears?.toLocaleString() || "0"}`,
        color: "red",
        type: "revenue",
      },
      {
        id: 5,
        label: "Collection Rate",
        value: `${statistics.collectionRate || "0"}%`,
        color: "purple",
        type: "attendance",
      },
    ];
  }, [statistics]);

  const extraFeeStats = useMemo(() => {
    if (!extraFeeStatistics) return [];
    return [
      {
        id: 1,
        label: "Extra Fees Total",
        value: `₵${extraFeeStatistics.totalExpected?.toLocaleString() || "0"}`,
        color: "purple",
        type: "revenue",
      },
      {
        id: 2,
        label: "Extra Fees Paid",
        value: `₵${extraFeeStatistics.totalPaid?.toLocaleString() || "0"}`,
        color: "green",
        type: "revenue",
      },
      {
        id: 3,
        label: "Extra Fees Balance",
        value: `₵${extraFeeStatistics.totalOutstanding?.toLocaleString() || "0"}`,
        color: "orange",
        type: "revenue",
      },
      {
        id: 4,
        label: "Extra Fee Records",
        value: extraFeeStatistics.totalRecords || 0,
        color: "blue",
        type: "students",
      },
    ];
  }, [extraFeeStatistics]);

  // ============================================
  // TABLE COLUMNS
  // ============================================

  const feeStructureColumns = [
    { header: "Class", accessor: "class.name", sortable: true },
    {
      header: "Academic Year",
      render: (row: any) => row.academic_year?.year || "—",
    },
    { header: "Term", render: (row: any) => row.term?.name || "Full Year" },
    {
      header: "Fee Type",
      render: (row: any) => row.fee_type_ref?.name || row.fee_type || "Tuition",
    },
    {
      header: "Amount",
      render: (row: any) => `₵${row.amount?.toLocaleString()}`,
    },
    {
      header: "Due Date",
      render: (row: any) =>
        row.due_date ? new Date(row.due_date).toLocaleDateString() : "—",
    },
    {
      header: "Mandatory",
      render: (row: any) => (row.is_mandatory ? "Yes" : "No"),
    },
    {
      header: "Actions",
      render: (row: any) => (
        <div className={styles.actionButtons}>
          <button
            className={styles.editButton}
            onClick={() => handleEditFeeStructure(row)}
          >
            Edit
          </button>
          <button
            className={styles.deleteButton}
            onClick={() => handleDeleteFeeStructure(row.id)}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  const classFeeColumns = [
    {
      header: "Student",
      render: (row: any) =>
        row.full_name || `${row.first_name} ${row.last_name}`,
    },
    { header: "Admission No.", accessor: "admission_number" },
    {
      header: "Total Owed",
      render: (row: any) =>
        `₵${row.fee_summary?.totalOwed?.toLocaleString() || "0"}`,
    },
    {
      header: "Total Paid",
      render: (row: any) =>
        `₵${row.fee_summary?.totalPaid?.toLocaleString() || "0"}`,
    },
    {
      header: "Balance",
      render: (row: any) =>
        `₵${row.fee_summary?.totalBalance?.toLocaleString() || "0"}`,
    },
    {
      header: "Arrears",
      render: (row: any) =>
        `₵${row.fee_summary?.totalArrears?.toLocaleString() || "0"}`,
    },
    {
      header: "Status",
      render: (row: any) => {
        if (row.fee_summary?.isOverdue)
          return (
            <span className={`${styles.statusBadge} ${styles.statusOverdue}`}>
              Overdue
            </span>
          );
        if (row.fee_summary?.hasPartial)
          return (
            <span className={`${styles.statusBadge} ${styles.statusPartial}`}>
              Partial
            </span>
          );
        if (row.fee_summary?.isFullyPaid)
          return (
            <span className={`${styles.statusBadge} ${styles.statusPaid}`}>
              Paid
            </span>
          );
        return (
          <span className={`${styles.statusBadge} ${styles.statusPending}`}>
            Pending
          </span>
        );
      },
    },
    {
      header: "Actions",
      render: (row: any) => (
        <div className={styles.actionButtons}>
          {row.fee_summary?.totalBalance > 0 && (
            <button
              className={styles.payButton}
              onClick={() => {
                setSelectedStudent(row);
                const activeFee = row.student_fees?.find(
                  (f: any) => f.balance > 0,
                );
                setSelectedStudentFee({
                  id: activeFee?.id || row.student_fees?.[0]?.id,
                  student_id: row.id,
                  balance: row.fee_summary?.totalBalance,
                  original_amount: row.fee_summary?.totalOwed,
                  class_name: row.class_name || selectedClass,
                  term_name: activeFee?.term?.name || row.term?.name,
                  academic_year:
                    activeFee?.academic_year?.year || row.academic_year?.year,
                });
                setShowPaymentModal(true);
              }}
            >
              Pay
            </button>
          )}
          <button
            className={styles.discountButton}
            onClick={() => {
              setSelectedStudent(row);
              setShowDiscountModal(true);
            }}
          >
            Discount
          </button>
          <button
            className={styles.arrearsButton}
            onClick={() => {
              setSelectedStudent(row);
              setShowArrearsModal(true);
            }}
          >
            Add Arrears
          </button>
          <button
            className={styles.detailsButton}
            onClick={() => {
              setSelectedStudent(row);
              alert(
                "Fee details: " + JSON.stringify(row.student_fees, null, 2),
              );
            }}
          >
            Details
          </button>
        </div>
      ),
    },
  ];

  const extraFeeStructureColumns = [
    { header: "Class", accessor: "class.name", sortable: true },
    { header: "Fee Type", render: (row: any) => row.fee_type?.name || "—" },
    {
      header: "Amount",
      render: (row: any) => `₵${row.amount?.toLocaleString()}`,
    },
    { header: "Frequency", accessor: "frequency" },
    {
      header: "Due Date",
      render: (row: any) =>
        row.due_date ? new Date(row.due_date).toLocaleDateString() : "—",
    },
    {
      header: "Mandatory",
      render: (row: any) => (row.is_mandatory ? "Yes" : "No"),
    },
    {
      header: "Actions",
      render: (row: any) => (
        <div className={styles.actionButtons}>
          <button
            className={styles.editButton}
            onClick={() => {
              // Edit extra fee structure
              alert("Edit functionality coming soon");
            }}
          >
            Edit
          </button>
          <button
            className={styles.deleteButton}
            onClick={() => handleDeleteExtraFeeStructure(row.id)}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  const extraFeeColumns = [
    {
      header: "Student",
      render: (row: any) => {
        const student = Array.isArray(row.student)
          ? row.student[0]
          : row.student;
        return student ? `${student.first_name} ${student.last_name}` : "—";
      },
    },
    {
      header: "Fee Type",
      render: (row: any) => {
        const feeType = Array.isArray(row.fee_type)
          ? row.fee_type[0]
          : row.fee_type;
        return feeType?.name || "—";
      },
    },
    {
      header: "Amount",
      render: (row: any) => `₵${row.amount?.toLocaleString()}`,
    },
    {
      header: "Paid",
      render: (row: any) => `₵${(row.paid_amount || 0)?.toLocaleString()}`,
    },
    {
      header: "Balance",
      render: (row: any) => `₵${row.balance?.toLocaleString()}`,
    },
    { header: "Frequency", accessor: "frequency" },
    {
      header: "Actions",
      render: (row: any) => (
        <div className={styles.actionButtons}>
          {row.balance > 0 && (
            <button
              className={styles.payButton}
              onClick={() => {
                setSelectedExtraFee({
                  ...row,
                  student_name: row.student
                    ? `${row.student.first_name} ${row.student.last_name}`
                    : "Unknown",
                  fee_type_name: row.fee_type ? row.fee_type.name : "Unknown",
                });
                setShowExtraPaymentModal(true);
              }}
            >
              Pay
            </button>
          )}
          <button
            className={styles.deleteButton}
            onClick={() => handleDeleteExtraFee(row.id)}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  const paymentColumns = [
    {
      header: "Date",
      accessor: "payment_date",
      render: (row: any) => new Date(row.payment_date).toLocaleDateString(),
    },
    {
      header: "Student",
      render: (row: any) =>
        `${row.student?.first_name || ""} ${row.student?.last_name || ""}`,
    },
    {
      header: "Amount",
      render: (row: any) => `₵${row.amount?.toLocaleString()}`,
    },
    { header: "Method", accessor: "payment_method" },
    {
      header: "Type",
      accessor: "type",
      render: (row: any) => row.type || "School Fees",
    },
    { header: "Receipt No.", accessor: "receipt_number" },
    {
      header: "Recorded By",
      render: (row: any) =>
        row.recorded_by_staff
          ? `${row.recorded_by_staff.first_name || ""} ${row.recorded_by_staff.last_name || ""}`
          : "—",
    },
    {
      header: "Receipt",
      render: (row: any) => (
        <DownloadPDFButton
          onClick={async () => {
            const result = await generatePaymentReceipt(row.id);
            if (result.success && result.pdf) return result.pdf;
            alert("Failed to generate receipt");
            return null;
          }}
          fileName={`Fee_Receipt_${row.student?.first_name || ""}_${row.student?.last_name || ""}_${row.receipt_number}_${new Date().toISOString().split("T")[0]}.pdf`}
          className={styles.downloadButton}
        >
          📄 Download
        </DownloadPDFButton>
      ),
    },
  ];

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className={styles.pageContainer}>
      <Header
        title="Fee Management"
        subtitle="Manage fee structures, student fees, extra fees, payments, discounts, and arrears"
      />

      <div className={styles.contentWrapper}>
        {/* Tabs */}
        <div className={styles.tabsContainer}>
          <button
            className={`${styles.tab} ${activeTab === "overview" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>
          <button
            className={`${styles.tab} ${activeTab === "feeStructure" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("feeStructure")}
          >
            Fee Structure
          </button>
          <button
            className={`${styles.tab} ${activeTab === "classFees" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("classFees")}
          >
            Class Fees
          </button>
          <button
            className={`${styles.tab} ${activeTab === "extraFees" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("extraFees")}
          >
            Extra Fees
          </button>
          <button
            className={`${styles.tab} ${activeTab === "payments" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("payments")}
          >
            Payment History
          </button>
        </div>

        {/* Filters */}
        <div className={styles.filterSection}>
          <div className={styles.filterRow}>
            <div className={styles.filterGroup}>
              <label>Class</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                <option value="">All Classes</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} ({cls.level})
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.filterGroup}>
              <label>Academic Year</label>
              <select
                value={selectedAcademicYear}
                onChange={(e) => setSelectedAcademicYear(e.target.value)}
              >
                <option value="">All Years</option>
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
                value={selectedTerm}
                onChange={(e) => setSelectedTerm(e.target.value)}
                disabled={!selectedAcademicYear}
              >
                <option value="">All Terms</option>
                {terms.map((term) => (
                  <option key={term.id} value={term.id}>
                    {term.name}
                  </option>
                ))}
              </select>
            </div>
            {activeTab === "extraFees" && (
              <div className={styles.filterGroup}>
                <label>Frequency</label>
                <select
                  value={selectedFrequency}
                  onChange={(e) => setSelectedFrequency(e.target.value)}
                >
                  <option value="">All Frequencies</option>
                  <option value="one-time">One-time</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="termly">Termly</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className={styles.actionBar}>
          {activeTab === "feeStructure" && (
            <button
              className={styles.primaryButton}
              onClick={() => setShowFeeStructureModal(true)}
            >
              + Create Fee Structure
            </button>
          )}
          {activeTab === "classFees" && selectedClass && (
            <>
              <button
                className={styles.primaryButton}
                onClick={() => setShowBulkModal(true)}
              >
                Bulk Assign Fees
              </button>
              <button
                className={styles.secondaryButton}
                onClick={() => setShowIndividualModal(true)}
              >
                Assign Individual Student
              </button>
            </>
          )}
          {activeTab === "extraFees" && (
            <>
              <button
                className={styles.primaryButton}
                onClick={() => setShowExtraFeeStructureModal(true)}
              >
                + Create Extra Fee Structure
              </button>
              <button
                className={styles.secondaryButton}
                onClick={() => setShowExtraFeeIndividualAssignModal(true)}
              >
                Assign to Individual
              </button>
              <button
                className={styles.secondaryButton}
                onClick={() => router.push("/fees/extra-tracking")}
              >
                View Extra Fee Details
              </button>
              <button
                className={styles.secondaryButton}
                onClick={() => setShowFeeTypeModal(true)}
              >
                Manage Fee Types
              </button>
            </>
          )}
          {activeTab === "payments" && allPayments.length > 0 && (
            <button
              className={styles.secondaryButton}
              onClick={handleBulkDownloadReceipts}
            >
              📄 Download Recent Receipts
            </button>
          )}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <>
            {statistics && (
              <Stats
                stats={overviewStats}
                variant="cards"
                columns={5}
                showIcon={true}
                size="md"
              />
            )}
            {extraFeeStatistics && (
              <>
                <div className={styles.sectionTitle}>Extra Fees Overview</div>
                <Stats
                  stats={extraFeeStats}
                  variant="cards"
                  columns={4}
                  showIcon={true}
                  size="md"
                />
              </>
            )}
            {statistics && (
              <div className={styles.summaryCards}>
                <div className={styles.summaryCard}>
                  <h4>Fully Paid</h4>
                  <div className={styles.summaryNumber}>
                    {statistics.fullyPaid || 0}
                  </div>
                  <span>students</span>
                </div>
                <div className={styles.summaryCard}>
                  <h4>Partial Payment</h4>
                  <div className={styles.summaryNumber}>
                    {statistics.partiallyPaid || 0}
                  </div>
                  <span>students</span>
                </div>
                <div className={styles.summaryCard}>
                  <h4>Pending</h4>
                  <div className={styles.summaryNumber}>
                    {statistics.pending || 0}
                  </div>
                  <span>students</span>
                </div>
                <div className={styles.summaryCard}>
                  <h4>Total Records</h4>
                  <div className={styles.summaryNumber}>
                    {statistics.totalRecords || 0}
                  </div>
                  <span>fee records</span>
                </div>
              </div>
            )}
          </>
        )}

        {/* Fee Structure Tab */}
        {activeTab === "feeStructure" && (
          <div className={styles.tableSection}>
            <Table
              columns={feeStructureColumns}
              data={feeStructures}
              variant="default"
              size="md"
              pagination={true}
              pageSize={10}
              showRowNumbers={true}
              emptyMessage="No fee structures found"
              loading={loading}
            />
          </div>
        )}

        {/* Class Fees Tab */}
        {activeTab === "classFees" && (
          <div className={styles.tableSection}>
            {!selectedClass ? (
              <div className={styles.emptyState}>
                Please select a class to view student fees
              </div>
            ) : (
              <Table
                columns={classFeeColumns}
                data={classFeeStatus}
                variant="default"
                size="md"
                pagination={true}
                pageSize={10}
                showRowNumbers={true}
                emptyMessage="No students found"
                loading={loading}
              />
            )}
          </div>
        )}

        {/* Extra Fees Tab */}
        {activeTab === "extraFees" && (
          <div className={styles.tableSection}>
            <div className={styles.subSectionTitle}>
              <h3>Extra Fee Structures</h3>
            </div>
            <Table
              columns={extraFeeStructureColumns}
              data={extraFeeStructures}
              variant="default"
              size="md"
              pagination={true}
              pageSize={10}
              showRowNumbers={true}
              emptyMessage="No extra fee structures found"
              loading={loading}
            />

            <div
              className={styles.subSectionTitle}
              style={{ marginTop: "2rem" }}
            >
              <h3>Assigned Extra Fees</h3>
            </div>
            <Table
              columns={extraFeeColumns}
              data={extraFees}
              variant="default"
              size="md"
              pagination={true}
              pageSize={10}
              showRowNumbers={true}
              emptyMessage="No extra fees assigned to students"
              loading={loading}
            />
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === "payments" && (
          <div className={styles.tableSection}>
            <Table
              columns={paymentColumns}
              data={allPayments.map((p) => ({
                ...p,
                id: p._id || `payment-${p.id}`,
              }))}
              variant="default"
              size="md"
              pagination={true}
              pageSize={10}
              showRowNumbers={true}
              emptyMessage="No payments found"
              loading={loading}
            />
          </div>
        )}

        {/* ============================================ */}
        {/* MODALS */}
        {/* ============================================ */}

        {/* Create Fee Structure Modal */}
        {showFeeStructureModal && (
          <div
            className={styles.modalOverlay}
            onClick={() => setShowFeeStructureModal(false)}
          >
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3>Create Fee Structure</h3>
                <button
                  className={styles.closeButton}
                  onClick={() => setShowFeeStructureModal(false)}
                >
                  ✕
                </button>
              </div>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label>Class *</label>
                  <select
                    value={feeStructureForm.class_id}
                    onChange={(e) =>
                      setFeeStructureForm({
                        ...feeStructureForm,
                        class_id: e.target.value,
                      })
                    }
                  >
                    <option value="">Select Class</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Academic Year *</label>
                  <select
                    value={feeStructureForm.academic_year_id}
                    onChange={(e) =>
                      setFeeStructureForm({
                        ...feeStructureForm,
                        academic_year_id: e.target.value,
                      })
                    }
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
                    value={feeStructureForm.term_id}
                    onChange={(e) =>
                      setFeeStructureForm({
                        ...feeStructureForm,
                        term_id: e.target.value,
                      })
                    }
                  >
                    <option value="">Full Year</option>
                    {terms.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Amount (₵) *</label>
                  <input
                    type="number"
                    value={feeStructureForm.amount}
                    onChange={(e) =>
                      setFeeStructureForm({
                        ...feeStructureForm,
                        amount: e.target.value,
                      })
                    }
                    placeholder="Enter amount"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Due Date</label>
                  <input
                    type="date"
                    value={feeStructureForm.due_date}
                    onChange={(e) =>
                      setFeeStructureForm({
                        ...feeStructureForm,
                        due_date: e.target.value,
                      })
                    }
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Late Fee Amount (₵)</label>
                  <input
                    type="number"
                    value={feeStructureForm.late_fee_amount}
                    onChange={(e) =>
                      setFeeStructureForm({
                        ...feeStructureForm,
                        late_fee_amount: e.target.value,
                      })
                    }
                    placeholder="Optional"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Description</label>
                  <textarea
                    value={feeStructureForm.description}
                    onChange={(e) =>
                      setFeeStructureForm({
                        ...feeStructureForm,
                        description: e.target.value,
                      })
                    }
                    rows={2}
                    placeholder="Optional description"
                  />
                </div>
                <div className={styles.checkboxGroup}>
                  <label>
                    <input
                      type="checkbox"
                      checked={feeStructureForm.is_mandatory}
                      onChange={(e) =>
                        setFeeStructureForm({
                          ...feeStructureForm,
                          is_mandatory: e.target.checked,
                        })
                      }
                    />{" "}
                    Mandatory Fee
                  </label>
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button
                  className={styles.cancelButton}
                  onClick={() => setShowFeeStructureModal(false)}
                >
                  Cancel
                </button>
                <button
                  className={styles.submitButton}
                  onClick={handleCreateFeeStructure}
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Fee Structure Modal */}
        {showEditFeeStructureModal && editingFeeStructure && (
          <div
            className={styles.modalOverlay}
            onClick={() => setShowEditFeeStructureModal(false)}
          >
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3>Edit Fee Structure</h3>
                <button
                  className={styles.closeButton}
                  onClick={() => setShowEditFeeStructureModal(false)}
                >
                  ✕
                </button>
              </div>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label>Amount (₵) *</label>
                  <input
                    type="number"
                    value={feeStructureForm.amount}
                    onChange={(e) =>
                      setFeeStructureForm({
                        ...feeStructureForm,
                        amount: e.target.value,
                      })
                    }
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Due Date</label>
                  <input
                    type="date"
                    value={feeStructureForm.due_date}
                    onChange={(e) =>
                      setFeeStructureForm({
                        ...feeStructureForm,
                        due_date: e.target.value,
                      })
                    }
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Late Fee Amount (₵)</label>
                  <input
                    type="number"
                    value={feeStructureForm.late_fee_amount}
                    onChange={(e) =>
                      setFeeStructureForm({
                        ...feeStructureForm,
                        late_fee_amount: e.target.value,
                      })
                    }
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Description</label>
                  <textarea
                    value={feeStructureForm.description}
                    onChange={(e) =>
                      setFeeStructureForm({
                        ...feeStructureForm,
                        description: e.target.value,
                      })
                    }
                    rows={2}
                  />
                </div>
                <div className={styles.checkboxGroup}>
                  <label>
                    <input
                      type="checkbox"
                      checked={feeStructureForm.is_mandatory}
                      onChange={(e) =>
                        setFeeStructureForm({
                          ...feeStructureForm,
                          is_mandatory: e.target.checked,
                        })
                      }
                    />{" "}
                    Mandatory Fee
                  </label>
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button
                  className={styles.cancelButton}
                  onClick={() => setShowEditFeeStructureModal(false)}
                >
                  Cancel
                </button>
                <button
                  className={styles.submitButton}
                  onClick={handleUpdateFeeStructure}
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Assign Modal */}
        {showBulkModal && (
          <div
            className={styles.modalOverlay}
            onClick={() => setShowBulkModal(false)}
          >
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3>Bulk Assign Fees to Class</h3>
                <button
                  className={styles.closeButton}
                  onClick={() => setShowBulkModal(false)}
                >
                  ✕
                </button>
              </div>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label>Amount (₵) *</label>
                  <input
                    type="number"
                    value={bulkForm.amount}
                    onChange={(e) =>
                      setBulkForm({ ...bulkForm, amount: e.target.value })
                    }
                    placeholder="Enter amount"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Term</label>
                  <select
                    value={bulkForm.term_id}
                    onChange={(e) =>
                      setBulkForm({ ...bulkForm, term_id: e.target.value })
                    }
                  >
                    <option value="">Full Year</option>
                    {terms.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Due Date</label>
                  <input
                    type="date"
                    value={bulkForm.due_date}
                    onChange={(e) =>
                      setBulkForm({ ...bulkForm, due_date: e.target.value })
                    }
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Scholarship Type</label>
                  <select
                    value={bulkForm.scholarship_type}
                    onChange={(e) =>
                      setBulkForm({
                        ...bulkForm,
                        scholarship_type: e.target.value,
                      })
                    }
                  >
                    <option value="none">None</option>
                    <option value="partial">Partial Scholarship</option>
                    <option value="full">Full Scholarship</option>
                  </select>
                </div>
                {bulkForm.scholarship_type === "partial" && (
                  <div className={styles.formGroup}>
                    <label>Discount (%)</label>
                    <input
                      type="number"
                      value={bulkForm.discount_percentage}
                      onChange={(e) =>
                        setBulkForm({
                          ...bulkForm,
                          discount_percentage: e.target.value,
                        })
                      }
                      placeholder="e.g., 50"
                    />
                  </div>
                )}
              </div>
              <div className={styles.modalFooter}>
                <button
                  className={styles.cancelButton}
                  onClick={() => setShowBulkModal(false)}
                >
                  Cancel
                </button>
                <button
                  className={styles.submitButton}
                  onClick={handleBulkAssign}
                >
                  Assign Fees
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Individual Assign Modal */}
        {showIndividualModal && (
          <div
            className={styles.modalOverlay}
            onClick={() => setShowIndividualModal(false)}
          >
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3>Assign Fee to Individual Student</h3>
                <button
                  className={styles.closeButton}
                  onClick={() => setShowIndividualModal(false)}
                >
                  ✕
                </button>
              </div>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label>Student *</label>
                  <select
                    value={individualForm.student_id}
                    onChange={(e) =>
                      setIndividualForm({
                        ...individualForm,
                        student_id: e.target.value,
                      })
                    }
                  >
                    <option value="">Select Student</option>
                    {classFeeStatus.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.first_name} {s.last_name} ({s.admission_number})
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Amount (₵) *</label>
                  <input
                    type="number"
                    value={individualForm.amount}
                    onChange={(e) =>
                      setIndividualForm({
                        ...individualForm,
                        amount: e.target.value,
                      })
                    }
                    placeholder="Enter amount"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Term</label>
                  <select
                    value={individualForm.term_id}
                    onChange={(e) =>
                      setIndividualForm({
                        ...individualForm,
                        term_id: e.target.value,
                      })
                    }
                  >
                    <option value="">Full Year</option>
                    {terms.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Due Date</label>
                  <input
                    type="date"
                    value={individualForm.due_date}
                    onChange={(e) =>
                      setIndividualForm({
                        ...individualForm,
                        due_date: e.target.value,
                      })
                    }
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Scholarship Type</label>
                  <select
                    value={individualForm.scholarship_type}
                    onChange={(e) =>
                      setIndividualForm({
                        ...individualForm,
                        scholarship_type: e.target.value,
                      })
                    }
                  >
                    <option value="none">None</option>
                    <option value="partial">Partial Scholarship</option>
                    <option value="full">Full Scholarship</option>
                  </select>
                </div>
                {individualForm.scholarship_type === "partial" && (
                  <div className={styles.formGroup}>
                    <label>Discount (%)</label>
                    <input
                      type="number"
                      value={individualForm.discount_percentage}
                      onChange={(e) =>
                        setIndividualForm({
                          ...individualForm,
                          discount_percentage: e.target.value,
                        })
                      }
                      placeholder="e.g., 50"
                    />
                  </div>
                )}
              </div>
              <div className={styles.modalFooter}>
                <button
                  className={styles.cancelButton}
                  onClick={() => setShowIndividualModal(false)}
                >
                  Cancel
                </button>
                <button
                  className={styles.submitButton}
                  onClick={handleIndividualAssign}
                >
                  Assign Fee
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && selectedStudentFee && (
          <div
            className={styles.modalOverlay}
            onClick={() => setShowPaymentModal(false)}
          >
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3>
                  Make Payment - {selectedStudent?.first_name}{" "}
                  {selectedStudent?.last_name}
                </h3>
                <button
                  className={styles.closeButton}
                  onClick={() => setShowPaymentModal(false)}
                >
                  ✕
                </button>
              </div>
              <div className={styles.modalBody}>
                <div className={styles.paymentInfo}>
                  <div className={styles.paymentInfoRow}>
                    <strong>Student:</strong> {selectedStudent?.first_name}{" "}
                    {selectedStudent?.last_name}
                  </div>
                  <div className={styles.paymentInfoRow}>
                    <strong>Admission No.:</strong>{" "}
                    {selectedStudent?.admission_number}
                  </div>
                  <div className={styles.paymentInfoRow}>
                    <strong>Outstanding Balance:</strong> ₵
                    {selectedStudentFee.balance?.toLocaleString()}
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label>Amount to Pay (₵) *</label>
                  <input
                    type="number"
                    value={paymentForm.amount}
                    onChange={(e) =>
                      setPaymentForm({ ...paymentForm, amount: e.target.value })
                    }
                    max={selectedStudentFee.balance}
                    placeholder="Enter amount"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Payment Method</label>
                  <select
                    value={paymentForm.payment_method}
                    onChange={(e) =>
                      setPaymentForm({
                        ...paymentForm,
                        payment_method: e.target.value,
                      })
                    }
                  >
                    <option value="cash">Cash</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="mobile_money">Mobile Money</option>
                    <option value="card">Card</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Reference Number</label>
                  <input
                    type="text"
                    value={paymentForm.payment_reference}
                    onChange={(e) =>
                      setPaymentForm({
                        ...paymentForm,
                        payment_reference: e.target.value,
                      })
                    }
                    placeholder="Optional reference"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Notes</label>
                  <textarea
                    value={paymentForm.notes}
                    onChange={(e) =>
                      setPaymentForm({ ...paymentForm, notes: e.target.value })
                    }
                    rows={2}
                    placeholder="Optional notes"
                  />
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button
                  className={styles.cancelButton}
                  onClick={() => setShowPaymentModal(false)}
                >
                  Cancel
                </button>
                <button
                  className={styles.submitButton}
                  onClick={handleRecordPayment}
                >
                  Record Payment
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Discount Modal */}
        {showDiscountModal && selectedStudentFee && (
          <div
            className={styles.modalOverlay}
            onClick={() => setShowDiscountModal(false)}
          >
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3>
                  Apply Discount - {selectedStudent?.first_name}{" "}
                  {selectedStudent?.last_name}
                </h3>
                <button
                  className={styles.closeButton}
                  onClick={() => setShowDiscountModal(false)}
                >
                  ✕
                </button>
              </div>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label>Discount Percentage (%) *</label>
                  <input
                    type="number"
                    value={discountForm.discount_percentage}
                    onChange={(e) =>
                      setDiscountForm({
                        ...discountForm,
                        discount_percentage: e.target.value,
                      })
                    }
                    min="0"
                    max="100"
                    placeholder="e.g., 50"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Reason</label>
                  <textarea
                    value={discountForm.reason}
                    onChange={(e) =>
                      setDiscountForm({
                        ...discountForm,
                        reason: e.target.value,
                      })
                    }
                    rows={2}
                    placeholder="Reason for discount"
                  />
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button
                  className={styles.cancelButton}
                  onClick={() => setShowDiscountModal(false)}
                >
                  Cancel
                </button>
                <button
                  className={styles.submitButton}
                  onClick={handleApplyDiscount}
                >
                  Apply Discount
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Arrears Modal */}
        {showArrearsModal && selectedStudentFee && (
          <div
            className={styles.modalOverlay}
            onClick={() => setShowArrearsModal(false)}
          >
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3>
                  Add Arrears - {selectedStudent?.first_name}{" "}
                  {selectedStudent?.last_name}
                </h3>
                <button
                  className={styles.closeButton}
                  onClick={() => setShowArrearsModal(false)}
                >
                  ✕
                </button>
              </div>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label>Arrears Amount (₵) *</label>
                  <input
                    type="number"
                    value={arrearsForm.amount}
                    onChange={(e) =>
                      setArrearsForm({ ...arrearsForm, amount: e.target.value })
                    }
                    placeholder="Enter arrears amount"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Reason *</label>
                  <textarea
                    value={arrearsForm.reason}
                    onChange={(e) =>
                      setArrearsForm({ ...arrearsForm, reason: e.target.value })
                    }
                    rows={2}
                    placeholder="Reason for adding arrears"
                  />
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button
                  className={styles.cancelButton}
                  onClick={() => setShowArrearsModal(false)}
                >
                  Cancel
                </button>
                <button
                  className={styles.submitButton}
                  onClick={handleAddArrears}
                >
                  Add Arrears
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Extra Fee Structure Modal */}
        {showExtraFeeStructureModal && (
          <div
            className={styles.modalOverlay}
            onClick={() => setShowExtraFeeStructureModal(false)}
          >
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3>Create Extra Fee Structure</h3>
                <button
                  className={styles.closeButton}
                  onClick={() => setShowExtraFeeStructureModal(false)}
                >
                  ✕
                </button>
              </div>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label>Class *</label>
                  <select
                    value={extraFeeStructureForm.class_id}
                    onChange={(e) =>
                      setExtraFeeStructureForm({
                        ...extraFeeStructureForm,
                        class_id: e.target.value,
                      })
                    }
                  >
                    <option value="">Select Class</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Fee Type *</label>
                  <select
                    value={extraFeeStructureForm.fee_type_id}
                    onChange={(e) =>
                      setExtraFeeStructureForm({
                        ...extraFeeStructureForm,
                        fee_type_id: e.target.value,
                      })
                    }
                  >
                    <option value="">Select Fee Type</option>
                    {feeTypes.map((ft) => (
                      <option key={ft.id} value={ft.id}>
                        {ft.name} ({ft.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Academic Year *</label>
                  <select
                    value={extraFeeStructureForm.academic_year_id}
                    onChange={(e) =>
                      setExtraFeeStructureForm({
                        ...extraFeeStructureForm,
                        academic_year_id: e.target.value,
                      })
                    }
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
                    value={extraFeeStructureForm.term_id}
                    onChange={(e) =>
                      setExtraFeeStructureForm({
                        ...extraFeeStructureForm,
                        term_id: e.target.value,
                      })
                    }
                  >
                    <option value="">Full Year</option>
                    {terms.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Amount (₵) *</label>
                  <input
                    type="number"
                    value={extraFeeStructureForm.amount}
                    onChange={(e) =>
                      setExtraFeeStructureForm({
                        ...extraFeeStructureForm,
                        amount: e.target.value,
                      })
                    }
                    placeholder="Enter amount"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Frequency</label>
                  <select
                    value={extraFeeStructureForm.frequency}
                    onChange={(e) =>
                      setExtraFeeStructureForm({
                        ...extraFeeStructureForm,
                        frequency: e.target.value,
                      })
                    }
                  >
                    <option value="one-time">One-time</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="termly">Termly</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Due Date</label>
                  <input
                    type="date"
                    value={extraFeeStructureForm.due_date}
                    onChange={(e) =>
                      setExtraFeeStructureForm({
                        ...extraFeeStructureForm,
                        due_date: e.target.value,
                      })
                    }
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Description</label>
                  <textarea
                    value={extraFeeStructureForm.description}
                    onChange={(e) =>
                      setExtraFeeStructureForm({
                        ...extraFeeStructureForm,
                        description: e.target.value,
                      })
                    }
                    rows={2}
                    placeholder="Optional description"
                  />
                </div>
                <div className={styles.checkboxGroup}>
                  <label>
                    <input
                      type="checkbox"
                      checked={extraFeeStructureForm.is_mandatory}
                      onChange={(e) =>
                        setExtraFeeStructureForm({
                          ...extraFeeStructureForm,
                          is_mandatory: e.target.checked,
                        })
                      }
                    />{" "}
                    Mandatory
                  </label>
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button
                  className={styles.cancelButton}
                  onClick={() => setShowExtraFeeStructureModal(false)}
                >
                  Cancel
                </button>
                <button
                  className={styles.submitButton}
                  onClick={handleCreateExtraFeeStructure}
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Extra Fee Individual Assign Modal */}
        {showExtraFeeIndividualAssignModal && (
          <div
            className={styles.modalOverlay}
            onClick={() => setShowExtraFeeIndividualAssignModal(false)}
          >
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3>Assign Extra Fee to Individual Student</h3>
                <button
                  className={styles.closeButton}
                  onClick={() => setShowExtraFeeIndividualAssignModal(false)}
                >
                  ✕
                </button>
              </div>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label>Student *</label>
                  <select
                    value={extraFeeIndividualForm.student_id}
                    onChange={(e) =>
                      setExtraFeeIndividualForm({
                        ...extraFeeIndividualForm,
                        student_id: e.target.value,
                      })
                    }
                  >
                    <option value="">Select Student</option>
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.full_name} ({s.admission_number})
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Extra Fee Structure *</label>
                  <select
                    value={extraFeeIndividualForm.extra_fee_structure_id}
                    onChange={(e) =>
                      setExtraFeeIndividualForm({
                        ...extraFeeIndividualForm,
                        extra_fee_structure_id: e.target.value,
                      })
                    }
                  >
                    <option value="">Select Extra Fee Structure</option>
                    {extraFeeStructures.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.fee_type?.name || "—"} - ₵{s.amount} ({s.frequency})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button
                  className={styles.cancelButton}
                  onClick={() => setShowExtraFeeIndividualAssignModal(false)}
                >
                  Cancel
                </button>
                <button
                  className={styles.submitButton}
                  onClick={handleAssignExtraFeeToIndividual}
                >
                  Assign Fee
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Extra Payment Modal */}
        {showExtraPaymentModal && selectedExtraFee && (
          <div
            className={styles.modalOverlay}
            onClick={() => setShowExtraPaymentModal(false)}
          >
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3>Pay Extra Fee - {selectedExtraFee.student_name}</h3>
                <button
                  className={styles.closeButton}
                  onClick={() => setShowExtraPaymentModal(false)}
                >
                  ✕
                </button>
              </div>
              <div className={styles.modalBody}>
                <div className={styles.paymentInfo}>
                  <div className={styles.paymentInfoRow}>
                    <strong>Fee Type:</strong> {selectedExtraFee.fee_type_name}
                  </div>
                  <div className={styles.paymentInfoRow}>
                    <strong>Total Amount:</strong> ₵
                    {selectedExtraFee.amount?.toLocaleString()}
                  </div>
                  <div className={styles.paymentInfoRow}>
                    <strong>Balance:</strong> ₵
                    {selectedExtraFee.balance?.toLocaleString()}
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label>Amount to Pay (₵) *</label>
                  <input
                    type="number"
                    value={extraPaymentForm.amount}
                    onChange={(e) =>
                      setExtraPaymentForm({
                        ...extraPaymentForm,
                        amount: e.target.value,
                      })
                    }
                    max={selectedExtraFee.balance}
                    placeholder="Enter amount"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Payment Method</label>
                  <select
                    value={extraPaymentForm.payment_method}
                    onChange={(e) =>
                      setExtraPaymentForm({
                        ...extraPaymentForm,
                        payment_method: e.target.value,
                      })
                    }
                  >
                    <option value="cash">Cash</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="mobile_money">Mobile Money</option>
                    <option value="card">Card</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Reference Number</label>
                  <input
                    type="text"
                    value={extraPaymentForm.payment_reference}
                    onChange={(e) =>
                      setExtraPaymentForm({
                        ...extraPaymentForm,
                        payment_reference: e.target.value,
                      })
                    }
                    placeholder="Optional reference"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Notes</label>
                  <textarea
                    value={extraPaymentForm.notes}
                    onChange={(e) =>
                      setExtraPaymentForm({
                        ...extraPaymentForm,
                        notes: e.target.value,
                      })
                    }
                    rows={2}
                    placeholder="Optional notes"
                  />
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button
                  className={styles.cancelButton}
                  onClick={() => setShowExtraPaymentModal(false)}
                >
                  Cancel
                </button>
                <button
                  className={styles.submitButton}
                  onClick={handleRecordExtraPayment}
                >
                  Record Payment
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Fee Type Modal */}
        {showFeeTypeModal && (
          <div
            className={styles.modalOverlay}
            onClick={() => setShowFeeTypeModal(false)}
          >
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3>{editingFeeType ? "Edit" : "Create"} Fee Type</h3>
                <button
                  className={styles.closeButton}
                  onClick={() => {
                    setShowFeeTypeModal(false);
                    setEditingFeeType(null);
                  }}
                >
                  ✕
                </button>
              </div>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label>Name *</label>
                  <input
                    type="text"
                    value={feeTypeForm.name}
                    onChange={(e) =>
                      setFeeTypeForm({ ...feeTypeForm, name: e.target.value })
                    }
                    placeholder="e.g., Sports Fee"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Code *</label>
                  <input
                    type="text"
                    value={feeTypeForm.code}
                    onChange={(e) =>
                      setFeeTypeForm({ ...feeTypeForm, code: e.target.value })
                    }
                    placeholder="e.g., SPORT"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Description</label>
                  <textarea
                    value={feeTypeForm.description}
                    onChange={(e) =>
                      setFeeTypeForm({
                        ...feeTypeForm,
                        description: e.target.value,
                      })
                    }
                    rows={2}
                    placeholder="Optional description"
                  />
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button
                  className={styles.cancelButton}
                  onClick={() => {
                    setShowFeeTypeModal(false);
                    setEditingFeeType(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  className={styles.submitButton}
                  onClick={
                    editingFeeType ? handleUpdateFeeType : handleCreateFeeType
                  }
                >
                  {editingFeeType ? "Update" : "Create"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payment Success Modal */}
        {showSuccessModal && lastPaymentRecord && (
          <div
            className={styles.modalOverlay}
            onClick={() => setShowSuccessModal(false)}
          >
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3>Payment Successful!</h3>
                <button
                  className={styles.closeButton}
                  onClick={() => setShowSuccessModal(false)}
                >
                  ✕
                </button>
              </div>
              <div className={styles.modalBody}>
                <div className={styles.successIcon}>✓</div>
                <div className={styles.paymentInfo}>
                  <div className={styles.paymentInfoRow}>
                    <strong>Receipt No:</strong>{" "}
                    {lastPaymentRecord.receiptNumber}
                  </div>
                  <div className={styles.paymentInfoRow}>
                    <strong>Amount Paid:</strong> ₵
                    {lastPaymentRecord.amount.toLocaleString()}
                  </div>
                  <div className={styles.paymentInfoRow}>
                    <strong>Student:</strong> {lastPaymentRecord.studentName}
                  </div>
                  <div className={styles.paymentInfoRow}>
                    <strong>Payment Method:</strong>{" "}
                    {lastPaymentRecord.paymentMethod}
                  </div>
                  <div className={styles.paymentInfoRow}>
                    <strong>Date:</strong> {lastPaymentRecord.paymentDate}
                  </div>
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button
                  className={styles.secondaryButton}
                  onClick={() => setShowSuccessModal(false)}
                >
                  Close
                </button>
                <DownloadPDFButton
                  onClick={handleDownloadPaymentReceipt}
                  fileName={`receipt-${lastPaymentRecord.receiptNumber}.pdf`}
                  className={styles.primaryButton}
                >
                  📄 Download Receipt
                </DownloadPDFButton>
              </div>
            </div>
          </div>
        )}

        {/* Extra Payment Success Modal */}
        {showExtraSuccessModal && lastExtraPaymentRecord && (
          <div
            className={styles.modalOverlay}
            onClick={() => setShowExtraSuccessModal(false)}
          >
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3>Extra Fee Payment Successful!</h3>
                <button
                  className={styles.closeButton}
                  onClick={() => setShowExtraSuccessModal(false)}
                >
                  ✕
                </button>
              </div>
              <div className={styles.modalBody}>
                <div className={styles.successIcon}>✓</div>
                <div className={styles.paymentInfo}>
                  <div className={styles.paymentInfoRow}>
                    <strong>Receipt No:</strong>{" "}
                    {lastExtraPaymentRecord.receiptNumber}
                  </div>
                  <div className={styles.paymentInfoRow}>
                    <strong>Amount Paid:</strong> ₵
                    {lastExtraPaymentRecord.amount.toLocaleString()}
                  </div>
                  <div className={styles.paymentInfoRow}>
                    <strong>Student:</strong>{" "}
                    {lastExtraPaymentRecord.studentName}
                  </div>
                  <div className={styles.paymentInfoRow}>
                    <strong>Payment Method:</strong>{" "}
                    {lastExtraPaymentRecord.paymentMethod}
                  </div>
                  <div className={styles.paymentInfoRow}>
                    <strong>Date:</strong> {lastExtraPaymentRecord.paymentDate}
                  </div>
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button
                  className={styles.secondaryButton}
                  onClick={() => setShowExtraSuccessModal(false)}
                >
                  Close
                </button>
                <DownloadPDFButton
                  onClick={handleDownloadExtraPaymentReceipt}
                  fileName={`extra-receipt-${lastExtraPaymentRecord.receiptNumber}.pdf`}
                  className={styles.primaryButton}
                >
                  📄 Download Receipt
                </DownloadPDFButton>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
