// components/TerminalReportModal.tsx
"use client";

import { useRef, useEffect } from "react";
import styles from "./TerminalReportModal.module.css";

interface TerminalReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  className: string;
  term: string;
  academicYear: string;
  pdfUrl: string | null;
  isLoading: boolean;
}

export default function TerminalReportModal({
  isOpen,
  onClose,
  studentName,
  className,
  term,
  academicYear,
  pdfUrl,
  isLoading,
}: TerminalReportModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle escape key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Handle print functionality
  const handlePrint = () => {
    if (pdfUrl) {
      const printWindow = window.open(pdfUrl, "_blank");
      if (printWindow) {
        printWindow.print();
      }
    }
  };

  // Handle download functionality
  const handleDownload = () => {
    if (pdfUrl) {
      const link = document.createElement("a");
      link.href = pdfUrl;
      link.download = `Terminal_Report_${studentName.replace(/\s/g, "_")}_${term}_${academicYear}_${new Date().toISOString().split('T')[0]}.pdf`;
      link.click();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        ref={modalRef}
        className={styles.modalContainer}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <div className={styles.headerInfo}>
            <h2>Terminal Report</h2>
            <p>
              {studentName} | {className} | {term} | {academicYear}
            </p>
          </div>
          <div className={styles.headerActions}>
            <button
              className={styles.printButton}
              onClick={handlePrint}
              disabled={!pdfUrl || isLoading}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9V3h12v6" />
                <path d="M6 21H4a2 2 0 01-2-2v-6a2 2 0 012-2h16a2 2 0 012 2v6a2 2 0 01-2 2h-2" />
                <path d="M18 15v6H6v-6" />
                <path d="M6 12h.01M18 12h.01" />
              </svg>
              Print
            </button>
            <button
              className={styles.downloadButton}
              onClick={handleDownload}
              disabled={!pdfUrl || isLoading}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download
            </button>
            <button className={styles.closeButton} onClick={onClose}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        <div className={styles.modalBody}>
          {isLoading ? (
            <div className={styles.loadingState}>
              <div className={styles.spinner}></div>
              <p>Generating terminal report...</p>
            </div>
          ) : pdfUrl ? (
            <iframe
              src={pdfUrl}
              className={styles.pdfViewer}
              title="Terminal Report"
            />
          ) : (
            <div className={styles.errorState}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p>Failed to load report. Please try again.</p>
            </div>
          )}
        </div>

        <div className={styles.modalFooter}>
          <div className={styles.footerNote}>
            <span>ℹ️</span>
            <p>
              This report is automatically generated from student scores and assessments.
              You can print or download the report for your records.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}