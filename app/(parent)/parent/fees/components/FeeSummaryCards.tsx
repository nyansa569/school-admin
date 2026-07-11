// app/parent/fees/components/FeeSummaryCards.tsx
"use client";

import { FeeSummary } from "@/app/(parent)/types";
import styles from "./FeeSummaryCards.module.css";

interface FeeSummaryCardsProps {
  summary: FeeSummary;
}

export default function FeeSummaryCards({ summary }: FeeSummaryCardsProps) {
  const formatCurrency = (amount: number) => {
    return `₵${amount.toLocaleString()}`;
  };

  return (
    <div className={styles.summaryGrid}>
      <div className={`${styles.summaryCard} ${styles.total}`}>
        <div className={styles.cardIcon}>💰</div>
        <div className={styles.cardInfo}>
          <span className={styles.cardLabel}>Total Expected</span>
          <span className={styles.cardValue}>{formatCurrency(summary.total_expected)}</span>
        </div>
      </div>

      <div className={`${styles.summaryCard} ${styles.paid}`}>
        <div className={styles.cardIcon}>✅</div>
        <div className={styles.cardInfo}>
          <span className={styles.cardLabel}>Total Paid</span>
          <span className={styles.cardValue}>{formatCurrency(summary.total_paid)}</span>
        </div>
      </div>

      <div className={`${styles.summaryCard} ${styles.balance}`}>
        <div className={styles.cardIcon}>📊</div>
        <div className={styles.cardInfo}>
          <span className={styles.cardLabel}>Outstanding Balance</span>
          <span className={styles.cardValue}>{formatCurrency(summary.total_balance)}</span>
        </div>
      </div>

      <div className={`${styles.summaryCard} ${styles.arrears}`}>
        <div className={styles.cardIcon}>⚠️</div>
        <div className={styles.cardInfo}>
          <span className={styles.cardLabel}>Arrears</span>
          <span className={styles.cardValue}>{formatCurrency(summary.total_arrears)}</span>
        </div>
      </div>
    </div>
  );
}