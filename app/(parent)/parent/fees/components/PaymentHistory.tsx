// app/parent/fees/components/PaymentHistory.tsx
"use client";

import styles from "./PaymentHistory.module.css";
import { PaymentHistory as PaymentHistoryType } from "../../../types";

interface PaymentHistoryProps {
  payments: PaymentHistoryType[];
}

export default function PaymentHistory({ payments }: PaymentHistoryProps) {
  const formatCurrency = (amount: number) => {
    return `₵${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "Cash":
        return "💵";
      case "Mobile Money":
        return "📱";
      case "Bank Transfer":
        return "🏦";
      default:
        return "💳";
    }
  };

  if (payments.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>💸</div>
        <h4>No Payment History</h4>
        <p>No payment records found for this student.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {payments.map((payment) => (
        <div key={payment.id} className={styles.paymentCard}>
          <div className={styles.paymentHeader}>
            <div className={styles.paymentReceipt}>
              <span className={styles.receiptIcon}>🧾</span>
              <div>
                <div className={styles.receiptNumber}>{payment.receipt_number}</div>
                <div className={styles.paymentDate}>{formatDate(payment.payment_date)}</div>
              </div>
            </div>
            <div className={styles.paymentAmount}>
              {formatCurrency(payment.amount)}
            </div>
          </div>

          <div className={styles.paymentDetails}>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Payment Method:</span>
              <span className={styles.detailValue}>
                <span className={styles.methodIcon}>{getPaymentMethodIcon(payment.payment_method)}</span>
                {payment.payment_method}
              </span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Fee Type:</span>
              <span className={styles.detailValue}>{payment.fee_type}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Term:</span>
              <span className={styles.detailValue}>{payment.term}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Academic Year:</span>
              <span className={styles.detailValue}>{payment.academic_year}</span>
            </div>
            {payment.payment_reference && (
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Reference:</span>
                <span className={styles.detailValue}>{payment.payment_reference}</span>
              </div>
            )}
            {payment.notes && (
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Notes:</span>
                <span className={styles.detailValue}>{payment.notes}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}