// app/(parent)/parent/fees/page.tsx
"use client";

import { useState } from "react";
import styles from "./page.module.css";
import { dummyFeeItems, dummyPaymentHistory, dummyFeeSummary, dummyChildren } from "../../data";
import { Child, FeeItem, FeeSummary, PaymentHistory as PaymentHistoryType } from "../../types";
import FeeItemsTable from "./components/FeeItemsTable";
import FeeSummaryCards from "./components/FeeSummaryCards";
import PaymentHistory from "./components/PaymentHistory";
import ChildSelector from "./components/ChildSelector";

type TabType = "current" | "history";


// Map fee data by child ID
const feeDataByChild: Record<number, { feeItems: FeeItem[]; paymentHistory: PaymentHistoryType[]; summary: FeeSummary }> = {
  1: { // Kindergarten 2
    feeItems: dummyFeeItems.map(item => ({ ...item, academic_year: "2024-2025" })),
    paymentHistory: dummyPaymentHistory,
    summary: { ...dummyFeeSummary, total_expected: 2500, total_paid: 2500, total_balance: 0, total_arrears: 0 },
  },
  2: { // Primary 5
    feeItems: dummyFeeItems.map(item => ({ ...item, original_amount: item.original_amount * 1.2, balance: item.balance * 1.2 })),
    paymentHistory: dummyPaymentHistory,
    summary: { ...dummyFeeSummary, total_expected: 6000, total_paid: 4500, total_balance: 1500, total_arrears: 600 },
  },
  3: { // JHS 2
    feeItems: dummyFeeItems,
    paymentHistory: dummyPaymentHistory,
    summary: dummyFeeSummary,
  },
};

export default function FeesPage() {
  const [children] = useState<Child[]>(dummyChildren);
  const [selectedChildId, setSelectedChildId] = useState<number>(children[0]?.id || 1);
  const [activeTab, setActiveTab] = useState<TabType>("current");

  const selectedChild = children.find(c => c.id === selectedChildId);
  const childFeeData = feeDataByChild[selectedChildId] || feeDataByChild[3];

  const [feeItems] = useState<FeeItem[]>(childFeeData.feeItems);
  const [paymentHistory] = useState<PaymentHistoryType[]>(childFeeData.paymentHistory);
  const [summary] = useState<FeeSummary>(childFeeData.summary);

  const handleChildChange = (childId: number) => {
    setSelectedChildId(childId);
    // In a real app, you would fetch fee data for the selected child here
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Fee Status</h2>
        <p>View your children's fee payment status and history</p>
      </div>

      {/* Child Selector */}
      <ChildSelector
        children={children}
        selectedChildId={selectedChildId}
        onChildChange={handleChildChange}
      />

      {/* Selected Child Info */}
      {selectedChild && (
        <div className={styles.selectedChildInfo}>
          <div className={styles.childAvatar}>
            {selectedChild.first_name[0]}{selectedChild.last_name[0]}
          </div>
          <div className={styles.childDetails}>
            <h3>{selectedChild.first_name} {selectedChild.last_name}</h3>
            <p>{selectedChild.class?.name} | {selectedChild.admission_number}</p>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <FeeSummaryCards summary={summary} />

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === "current" ? styles.activeTab : ""}`}
          onClick={() => handleTabChange("current")}
        >
          Current Fees
        </button>
        <button
          className={`${styles.tab} ${activeTab === "history" ? styles.activeTab : ""}`}
          onClick={() => handleTabChange("history")}
        >
          Payment History
        </button>
      </div>

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {activeTab === "current" && <FeeItemsTable feeItems={feeItems} />}
        {activeTab === "history" && <PaymentHistory payments={paymentHistory} />}
      </div>
    </div>
  );
}