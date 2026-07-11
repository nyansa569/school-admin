// app/(dashboard)/fees/extra-tracking/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import styles from "./page.module.css";
import Header from "@/components/Header/Header";
import Stats from "@/components/Stats/Stats";
import {
  getClasses,
  getAcademicYears,
  getTerms,
  getExtraFeeStructures,
  getExtraFeePaymentStatus,
  markExtraFeePayment,
  getExtraFeeTrackingFilters,
  ExtraFeeTrackingData,
  StudentPaymentStatus,
} from "@/lib/action/admin/fees";
import { getStudentsByClass } from "@/lib/action/admin/fees";
import { DownloadPDFButton } from "@/components/DownloadPDFButton";

export default function ExtraFeeTrackingPage() {
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [terms, setTerms] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>("");
  const [selectedTerm, setSelectedTerm] = useState<string>("");
  const [selectedExtraFeeStructure, setSelectedExtraFeeStructure] =
    useState<string>("");
  const [extraFeeStructures, setExtraFeeStructures] = useState<any[]>([]);
  const [trackingData, setTrackingData] = useState<ExtraFeeTrackingData | null>(
    null
  );
  const [processing, setProcessing] = useState(false);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Load terms when academic year changes
  useEffect(() => {
    if (selectedAcademicYear) {
      loadTerms(parseInt(selectedAcademicYear));
    } else {
      setTerms([]);
    }
  }, [selectedAcademicYear]);

  // Load extra fee structures when class changes
  useEffect(() => {
    if (selectedClass && selectedAcademicYear) {
      loadExtraFeeStructures();
    }
  }, [selectedClass, selectedAcademicYear, selectedTerm]);

  // Load tracking data when extra fee structure changes
  useEffect(() => {
    if (selectedExtraFeeStructure && selectedClass && selectedAcademicYear) {
      loadTrackingData();
    }
  }, [selectedExtraFeeStructure, selectedClass, selectedAcademicYear, selectedTerm]);

  const loadInitialData = async () => {
    setLoading(true);
    const [classesResult, yearsResult] = await Promise.all([
      getClasses(),
      getAcademicYears(),
    ]);

    if (classesResult.classes) setClasses(classesResult.classes);
    if (yearsResult.years) {
      setAcademicYears(yearsResult.years);
      const activeYear = yearsResult.years.find((y: any) => y.is_active);
      if (activeYear) {
        setSelectedAcademicYear(activeYear.id.toString());
      }
    }

    setLoading(false);
  };

  const loadTerms = async (academicYearId: number) => {
    const result = await getTerms(academicYearId);
    if (result.terms) {
      setTerms(result.terms);
      const activeTerm = result.terms.find((t: any) => t.is_active);
      if (activeTerm) {
        setSelectedTerm(activeTerm.id.toString());
      }
    }
  };

  const loadExtraFeeStructures = async () => {
    const result = await getExtraFeeStructures(
      selectedClass ? parseInt(selectedClass) : undefined,
      selectedAcademicYear ? parseInt(selectedAcademicYear) : undefined,
      selectedTerm ? parseInt(selectedTerm) : undefined
    );
    if (result.structures) {
      setExtraFeeStructures(result.structures);
      if (result.structures.length > 0) {
        setSelectedExtraFeeStructure(result.structures[0].id.toString());
      } else {
        setSelectedExtraFeeStructure("");
        setTrackingData(null);
      }
    }
  };

  const loadTrackingData = async () => {
    setLoading(true);
    const result = await getExtraFeePaymentStatus(
      parseInt(selectedExtraFeeStructure),
      parseInt(selectedClass),
      parseInt(selectedAcademicYear),
      selectedTerm ? parseInt(selectedTerm) : undefined
    );

    if (result.success && result.data) {
      setTrackingData(result.data);
    } else {
      setTrackingData(null);
      if (result.error) {
        console.error("Error loading tracking data:", result.error);
      }
    }
    setLoading(false);
  };

  const handleMarkPayment = async (
    extraFeeId: number,
    studentId: number,
    paymentDate: string,
    amount: number,
    currentPaid: boolean
  ) => {
    setProcessing(true);
    try {
      const result = await markExtraFeePayment(
        extraFeeId,
        studentId,
        paymentDate,
        amount
      );

      if (result.success) {
        // Reload tracking data
        await loadTrackingData();
        // Show success feedback
        const message = currentPaid
          ? "Payment unmarked successfully"
          : "Payment marked successfully";
        // You could use a toast notification here
        console.log(message);
      } else {
        alert(result.error || "Failed to mark payment");
      }
    } catch (err: any) {
      alert(err.message || "An error occurred");
    } finally {
      setProcessing(false);
    }
  };

  // Get column labels based on frequency
  const getColumnLabels = () => {
    if (!trackingData) return [];

    const frequency = trackingData.frequency;
    const students = trackingData.students;

    if (students.length === 0) return [];

    // Get the first student's expected payments
    const firstStudent = students[0];
    return firstStudent.expectedPayments.map((payment) => ({
      date: payment.date,
      label: payment.label,
      isFuture: payment.isFuture || false,
    }));
  };

  // Stats for header
  const stats = useMemo(() => {
    if (!trackingData) return [];

    return [
      {
        id: 1,
        label: "Total Students",
        value: trackingData.summary.totalStudents,
        color: "blue",
        type: "students",
      },
      {
        id: 2,
        label: "Fully Paid",
        value: trackingData.summary.fullyPaid,
        color: "green",
        type: "attendance",
      },
      {
        id: 3,
        label: "Partial",
        value: trackingData.summary.partialPaid,
        color: "orange",
        type: "classes",
      },
      {
        id: 4,
        label: "Payment Rate",
        value: trackingData.summary.overallPaymentRate,
        color: "purple",
        type: "revenue",
      },
    ];
  }, [trackingData]);

  // Render the frequency grid
  const renderFrequencyGrid = () => {
    if (!trackingData || trackingData.students.length === 0) {
      return (
        <div className={styles.emptyState}>
          <p>No students have this extra fee assigned</p>
        </div>
      );
    }

    const columnLabels = getColumnLabels();

    return (
      <div className={styles.gridContainer}>
        <div className={styles.gridHeader}>
          <div className={styles.studentNameHeader}>Student</div>
          {columnLabels.map((col, index) => (
            <div
              key={index}
              className={`${styles.columnHeader} ${col.isFuture ? styles.futureDate : ""}`}
              title={col.date}
            >
              {col.label}
            </div>
          ))}
          <div className={styles.summaryHeader}>Rate</div>
          <div className={styles.summaryHeader}>Status</div>
        </div>

        {trackingData.students.map((student) => (
          <div key={student.studentId} className={styles.gridRow}>
            <div className={styles.studentNameCell}>
              <div className={styles.studentName}>{student.studentName}</div>
              <div className={styles.studentId}>{student.admissionNumber}</div>
            </div>

            {student.expectedPayments.map((payment, index) => {
              const isFuture = payment.isFuture || false;
              const isPaid = payment.paid;

              let cellContent = "─";
              let cellClass = styles.emptyCell;

              if (isFuture) {
                cellContent = "─";
                cellClass = styles.futureCell;
              } else if (isPaid) {
                cellContent = "✓";
                cellClass = styles.paidCell;
              } else {
                cellContent = "✗";
                cellClass = styles.missedCell;
              }

              return (
                <div
                  key={index}
                  className={`${styles.gridCell} ${cellClass}`}
                  onClick={() => {
                    if (isFuture) return;
                    handleMarkPayment(
                      student.extraFeeId,
                      student.studentId,
                      payment.date,
                      trackingData.amount,
                      isPaid
                    );
                  }}
                  title={`${student.studentName} - ${payment.label}${isFuture ? " (Future)" : ""}`}
                >
                  {cellContent}
                </div>
              );
            })}

            <div className={styles.rateCell}>{student.paymentRate}</div>
            <div className={styles.statusCell}>
              <span
                className={`${styles.statusBadge} ${
                  student.status === "paid"
                    ? styles.statusPaid
                    : student.status === "partial"
                    ? styles.statusPartial
                    : styles.statusPending
                }`}
              >
                {student.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render legend
  const renderLegend = () => (
    <div className={styles.legend}>
      <span className={styles.legendTitle}>Legend:</span>
      <span className={styles.legendItem}>
        <span className={`${styles.legendBox} ${styles.paidCell}`}>✓</span> Paid
      </span>
      <span className={styles.legendItem}>
        <span className={`${styles.legendBox} ${styles.missedCell}`}>✗</span> Missed
      </span>
      <span className={styles.legendItem}>
        <span className={`${styles.legendBox} ${styles.futureCell}`}>─</span> Not Applicable
      </span>
      <span className={styles.legendItem}>
        <span className={`${styles.legendBox} ${styles.futureDate}`}>Future</span> Future Date
      </span>
    </div>
  );

  // Render info card
  const renderInfoCard = () => {
    if (!trackingData) return null;

    const frequencyMap: Record<string, string> = {
      daily: "Daily",
      weekly: "Weekly",
      monthly: "Monthly",
      termly: "Termly",
      "one-time": "One-time",
    };

    return (
      <div className={styles.infoCard}>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Class:</span>
          <span className={styles.infoValue}>{trackingData.className}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Fee Type:</span>
          <span className={styles.infoValue}>{trackingData.feeType}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Frequency:</span>
          <span className={styles.infoValue}>
            {frequencyMap[trackingData.frequency] || trackingData.frequency}
          </span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Amount:</span>
          <span className={styles.infoValue}>
            ₵{trackingData.amount.toLocaleString()}
          </span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Period:</span>
          <span className={styles.infoValue}>
            {new Date(trackingData.dateRange.start).toLocaleDateString()} -{" "}
            {new Date(trackingData.dateRange.end).toLocaleDateString()}
          </span>
        </div>
      </div>
    );
  };

  // Render frequency badge
  const getFrequencyBadge = (frequency: string) => {
    const frequencyMap: Record<string, { label: string; color: string }> = {
      daily: { label: "Daily", color: "#3b82f6" },
      weekly: { label: "Weekly", color: "#10b981" },
      monthly: { label: "Monthly", color: "#f59e0b" },
      termly: { label: "Termly", color: "#8b5cf6" },
      "one-time": { label: "One-time", color: "#6b7280" },
    };
    const freq = frequencyMap[frequency] || { label: frequency, color: "#6b7280" };
    return (
      <span className={styles.frequencyBadge} style={{ backgroundColor: freq.color }}>
        {freq.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <Header title="Extra Fee Payment Tracking" subtitle="Loading..." />
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
        title="Extra Fee Payment Tracking"
        subtitle="Track student payments by frequency (Daily, Weekly, Monthly, Termly)"
      />

      <div className={styles.contentWrapper}>
        {/* Filters */}
        <div className={styles.filterSection}>
          <div className={styles.filterRow}>
            <div className={styles.filterGroup}>
              <label>Academic Year *</label>
              <select
                value={selectedAcademicYear}
                onChange={(e) => setSelectedAcademicYear(e.target.value)}
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
                value={selectedTerm}
                onChange={(e) => setSelectedTerm(e.target.value)}
                className={styles.select}
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

            <div className={styles.filterGroup}>
              <label>Class *</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className={styles.select}
              >
                <option value="">Select Class</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} {cls.section ? `- ${cls.section}` : ""} ({cls.level})
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label>Extra Fee *</label>
              <select
                value={selectedExtraFeeStructure}
                onChange={(e) => setSelectedExtraFeeStructure(e.target.value)}
                className={styles.select}
                disabled={!selectedClass || extraFeeStructures.length === 0}
              >
                <option value="">
                  {extraFeeStructures.length === 0
                    ? "No extra fees found"
                    : "Select Extra Fee"}
                </option>
                {extraFeeStructures.map((structure) => (
                  <option key={structure.id} value={structure.id}>
                    {structure.fee_type?.name || "Extra Fee"} - ₵                    {structure.amount?.toLocaleString()} ({structure.frequency})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        {trackingData && <Stats stats={stats} variant="cards" columns={4} showIcon={true} size="md" />}

        {/* Info Card */}
        {trackingData && renderInfoCard()}

        {/* Legend */}
        {trackingData && renderLegend()}

        {/* Frequency Grid */}
        {trackingData ? (
          <div className={styles.tableSection}>
            <div className={styles.tableHeader}>
              <div className={styles.tableTitle}>
                Payment Tracking - {getFrequencyBadge(trackingData.frequency)}
              </div>
              <div className={styles.tableActions}>
                <span className={styles.totalStudents}>
                  {trackingData.summary.totalStudents} students
                </span>
              </div>
            </div>
            {renderFrequencyGrid()}
          </div>
        ) : (
          <div className={styles.emptyState}>
            {selectedClass && selectedAcademicYear ? (
              <p>
                No extra fee structure selected or no students assigned to this
                extra fee.
              </p>
            ) : (
              <p>
                Please select a class, academic year, and extra fee structure to
                view tracking.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}