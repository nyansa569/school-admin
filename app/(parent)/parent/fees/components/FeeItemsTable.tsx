// app/parent/fees/components/FeeItemsTable.tsx
"use client";

import { useState } from "react";
import styles from "./FeeItemsTable.module.css";
import { FeeItem } from "@/app/(parent)/types";

interface FeeItemsTableProps {
  feeItems: FeeItem[];
}

export default function FeeItemsTable({ feeItems }: FeeItemsTableProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return "₵0";
    return `₵${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return styles.statusPaid;
      case "partial":
        return styles.statusPartial;
      case "pending":
        return styles.statusPending;
      case "overdue":
        return styles.statusOverdue;
      case "waived":
        return styles.statusWaived;
      default:
        return styles.statusPending;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "paid":
        return "Paid";
      case "partial":
        return "Partial";
      case "pending":
        return "Pending";
      case "overdue":
        return "Overdue";
      case "waived":
        return "Waived";
      default:
        return status;
    }
  };

  const getProgressPercentage = (item: FeeItem) => {
    const total = item.discounted_amount || item.original_amount;
    if (total === 0) return 0;
    return (item.paid_amount / total) * 100;
  };

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Group by academic year and term
  const groupedItems = feeItems.reduce((acc, item) => {
    const key = `${item.academic_year} - ${item.term}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {} as Record<string, FeeItem[]>);

  return (
    <div className={styles.container}>
      {Object.entries(groupedItems).map(([group, items]) => (
        <div key={group} className={styles.groupSection}>
          <h3 className={styles.groupTitle}>{group}</h3>
          
          {items.map((item) => {
            const progress = getProgressPercentage(item);
            const isExpanded = expandedId === item.id;
            
            return (
              <div key={item.id} className={styles.feeCard}>
                <div className={styles.feeHeader} onClick={() => toggleExpand(item.id)}>
                  <div className={styles.feeTypeInfo}>
                    <span className={styles.feeTypeIcon}>
                      {item.fee_type === "Tuition Fee" && "📚"}
                      {item.fee_type === "Transport Fee" && "🚌"}
                      {item.fee_type === "Library Fee" && "📖"}
                      {item.fee_type === "Sports Fee" && "⚽"}
                      {!["Tuition Fee", "Transport Fee", "Library Fee", "Sports Fee"].includes(item.fee_type) && "💰"}
                    </span>
                    <div>
                      <div className={styles.feeType}>{item.fee_type}</div>
                      <div className={styles.feeTerm}>{item.term}</div>
                    </div>
                  </div>
                  
                  <div className={styles.feeAmounts}>
                    <div className={styles.balanceAmount}>
                      {formatCurrency(item.paid_amount)}
                    </div>
                    <div className={styles.feeStatus}>
                      <span className={`${styles.statusBadge} ${getStatusColor(item.status)}`}>
                        {getStatusText(item.status)}
                      </span>
                    </div>
                    <button className={styles.expandBtn}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d={isExpanded ? "M18 15l-6-6-6 6" : "M6 9l6 6 6-6"} />
                      </svg>
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className={styles.feeDetails}>
                    <div className={styles.detailsGrid}>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Cost Amount:</span>
                        <span className={styles.detailValue}>{formatCurrency(item.original_amount)}</span>
                      </div>
                      {item.discounted_amount && (
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>Discounted Amount:</span>
                          <span className={styles.detailValue}>{formatCurrency(item.discounted_amount)}</span>
                        </div>
                      )}
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Amount Paid:</span>
                        <span className={styles.detailValue}>{formatCurrency(item.paid_amount)}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Amount Remaining:</span>
                        <span className={styles.detailValue}>{formatCurrency(item.balance)}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Due Date:</span>
                        <span className={styles.detailValue}>{formatDate(item.due_date)}</span>
                      </div>
                    </div>

                    <div className={styles.progressSection}>
                      <div className={styles.progressLabel}>
                        <span>Payment Progress</span>
                        <span>{progress.toFixed(0)}%</span>
                      </div>
                      <div className={styles.progressBar}>
                        <div 
                          className={styles.progressFill} 
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {item.is_arrears && (
                      <div className={styles.arrearsNote}>
                        <span>⚠️</span>
                        <p>{item.arrears_reason || "This fee is marked as arrears. Please contact the finance office."}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}