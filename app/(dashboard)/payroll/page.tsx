"use client";

import React, { useState, useMemo } from "react";
import styles from "./page.module.css";
import { payrollsMockData } from "@/data/payroll"; // Adjust path
import Header from "@/components/Header/Header";
import Stats from "@/components/Stats/Stats";
import StatFilter from "@/components/StatFilter/StatFilter";
import Table from "@/components/Table/Table";

// Types
interface Allowances {
  housing: number;
  transport: number;
  meal: number;
  bonus: number;
  total: number;
}
interface Deductions {
  pension: number;
  loan: number;
  absencePenalty: number;
  total: number;
}
interface PayrollRecord {
  payrollId: string;
  staffId: string;
  month: string;
  year: number;
  basicSalary: number;
  allowances: Allowances;
  deductions: Deductions;
  tax: number;
  grossSalary: number;
  netSalary: number;
  // status: "Paid" | "Pending" | "Failed";
  status: string;
  paymentDate: string | null;
  createdAt: string;
}

const PayrollAdminPage = () => {
  const [payrolls, setPayrolls] = useState<PayrollRecord[]>(payrollsMockData);
  const [filteredPayrolls, setFilteredPayrolls] =
    useState<PayrollRecord[]>(payrolls);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"view" | "edit">("view");
  const [currentRecord, setCurrentRecord] = useState<PayrollRecord | null>(
    null,
  );

  // Stats Calculation
  const stats = useMemo(() => {
    const totalNet = payrolls.reduce((sum, p) => sum + p.netSalary, 0);
    const totalGross = payrolls.reduce((sum, p) => sum + p.grossSalary, 0);
    const paidCount = payrolls.filter((p) => p.status === "Paid").length;
    const pendingTotal = payrolls
      .filter((p) => p.status === "Pending")
      .reduce((sum, p) => sum + p.netSalary, 0);

    return [
      {
        id: 1,
        label: "Total Gross Payout",
        value: `GH₵${totalGross.toLocaleString()}`,
        subtitle: "This period",
        color: "purple",
        type: "revenue",
      },
      {
        id: 2,
        label: "Total Net Payout",
        value: `GH₵${totalNet.toLocaleString()}`,
        subtitle: "Take home",
        color: "blue",
        type: "revenue",
      },
      {
        id: 3,
        label: "Pending Amount",
        value: `GH₵${pendingTotal.toLocaleString()}`,
        trend: {
          value: payrolls.filter((p) => p.status === "Pending").length,
          label: "staff",
        },
        color: "orange",
        type: "attendance",
      },
      {
        id: 4,
        label: "Processed",
        value: paidCount,
        subtitle: `of ${payrolls.length} records`,
        color: "green",
        type: "students",
      },
    ];
  }, [payrolls]);

  // Table Columns
  const columns = [
    {
      header: "Staff ID",
      accessor: "staffId",
      sortable: true,
      width: "130px",
      render: (row: PayrollRecord) => (
        <span className={styles.staffId}>{row.staffId}</span>
      ),
    },
    {
      header: "Period",
      accessor: "month",
      sortable: true,
      width: "120px",
      render: (row: PayrollRecord) => (
        <div className={styles.periodCell}>
          <span className={styles.month}>{row.month}</span>
          <span className={styles.year}>{row.year}</span>
        </div>
      ),
    },
    {
      header: "Basic Salary",
      accessor: "basicSalary",
      sortable: true,
      render: (row: PayrollRecord) => `GH₵${row.basicSalary.toLocaleString()}`,
    },
    {
      header: "Allowances",
      accessor: "allowances.total",
      sortable: true,
      render: (row: PayrollRecord) => (
        <span className={styles.allowanceAmt}>
          +GH₵${row.allowances.total.toLocaleString()}
        </span>
      ),
    },
    {
      header: "Deductions",
      accessor: "deductions.total",
      sortable: true,
      render: (row: PayrollRecord) => (
        <span className={styles.deductAmt}>
          -GH₵${row.deductions.total.toLocaleString()}
        </span>
      ),
    },
    {
      header: "Net Salary",
      accessor: "netSalary",
      sortable: true,
      render: (row: PayrollRecord) => (
        <strong className={styles.netSalary}>
          GH₵{row.netSalary.toLocaleString()}
        </strong>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      sortable: true,
      width: "100px",
      render: (row: PayrollRecord) => {
        const statusMap: Record<string, string> = {
          Paid: styles.statusPaid,
          Pending: styles.statusPending,
          Failed: styles.statusFailed,
        };
        return (
          <span className={`${styles.statusBadge} ${statusMap[row.status]}`}>
            {row.status}
          </span>
        );
      },
    },
  ];

  // Filters
  const filterOptions = [
    {
      label: "Status",
      value: "status",
      key: "status",
      type: "select" as const,
      options: [
        { label: "Paid", value: "Paid" },
        { label: "Pending", value: "Pending" },
        { label: "Failed", value: "Failed" },
      ],
    },
    {
      label: "Month",
      value: "month",
      key: "month",
      type: "select" as const,
      options: ["January", "February", "March"].map((m) => ({
        label: m,
        value: m,
      })),
    },
  ];

  const sortOptions = [
    {
      label: "Net Salary (High to Low)",
      value: "net-desc",
      key: "netSalary",
      order: "desc" as const,
    },
    {
      label: "Net Salary (Low to High)",
      value: "net-asc",
      key: "netSalary",
      order: "asc" as const,
    },
    {
      label: "Period (Newest)",
      value: "date-desc",
      key: "createdAt",
      order: "desc" as const,
    },
  ];

  // Handlers
  const handleView = (record: PayrollRecord) => {
    setModalMode("view");
    setCurrentRecord(record);
    setShowModal(true);
  };

  const handleEdit = (record: PayrollRecord) => {
    setModalMode("edit");
    setCurrentRecord({ ...record });
    setShowModal(true);
  };

  const handleProcessPayment = (record: PayrollRecord) => {
    const updated = payrolls.map((p) =>
      p.payrollId === record.payrollId
        ? ({
            ...p,
            status: "Paid",
            paymentDate: new Date().toISOString().split("T")[0],
          } as PayrollRecord)
        : p,
    );
    setPayrolls(updated);
    // Optionally close modal if open
    if (showModal && currentRecord?.payrollId === record.payrollId) {
      setCurrentRecord({
        ...record,
        status: "Paid",
        paymentDate: new Date().toISOString().split("T")[0],
      });
    }
  };

  const handleUpdateRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRecord) return;

    // Recalculate totals
    const newGross = currentRecord.basicSalary + currentRecord.allowances.total;
    const newNet =
      newGross - currentRecord.deductions.total - currentRecord.tax;

    const updated = payrolls.map((p) =>
      p.payrollId === currentRecord.payrollId
        ? { ...currentRecord, grossSalary: newGross, netSalary: newNet }
        : p,
    );
    setPayrolls(updated);
    setFilteredPayrolls(updated);
    setShowModal(false);
  };

  const actions = [
    {
      label: "View Slip",
      variant: "primary",
      onClick: (row: PayrollRecord) => handleView(row),
    },
    {
      label: "Edit",
      variant: "secondary",
      onClick: (row: PayrollRecord) => handleEdit(row),
      hidden: (row: PayrollRecord) => row.status === "Paid", // Usually don't edit paid records
    },
    {
      label: "Pay Now",
      variant: "success",
      onClick: (row: PayrollRecord) => handleProcessPayment(row),
      hidden: (row: PayrollRecord) => row.status !== "Pending",
    },
  ];

  const renderExpandedRow = (row: PayrollRecord) => (
    <div className={styles.expandedContent}>
      <div className={styles.expandedGrid}>
        <div className={styles.expandedSection}>
          <h4>Earnings Breakdown</h4>
          <div className={styles.detailRow}>
            <span>Basic Salary:</span>{" "}
            <span>GH₵{row.basicSalary.toLocaleString()}</span>
          </div>
          <div className={styles.detailRow}>
            <span>Housing:</span>{" "}
            <span>GH₵{row.allowances.housing.toLocaleString()}</span>
          </div>
          <div className={styles.detailRow}>
            <span>Transport:</span>{" "}
            <span>GH₵{row.allowances.transport.toLocaleString()}</span>
          </div>
          <div className={styles.detailRow}>
            <span>Meal:</span>{" "}
            <span>GH₵{row.allowances.meal.toLocaleString()}</span>
          </div>
          <div className={styles.detailRow}>
            <span>Bonus:</span>{" "}
            <span>GH₵{row.allowances.bonus.toLocaleString()}</span>
          </div>
        </div>
        <div className={styles.expandedSection}>
          <h4>Deductions & Tax</h4>
          <div className={styles.detailRow}>
            <span>Pension:</span>{" "}
            <span>-GH₵{row.deductions.pension.toLocaleString()}</span>
          </div>
          <div className={styles.detailRow}>
            <span>Loan:</span>{" "}
            <span>-GH₵{row.deductions.loan.toLocaleString()}</span>
          </div>
          <div className={styles.detailRow}>
            <span>Penalty:</span>{" "}
            <span>-GH₵{row.deductions.absencePenalty.toLocaleString()}</span>
          </div>
          <div className={styles.detailRow}>
            <span>Tax:</span> <span>-GH₵{row.tax.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.pageContainer}>
      <Header
        title="Payroll Management"
        subtitle="Process salaries, manage allowances, and track payments"
        customActions={
          <button className={styles.addButton}>
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path
                fill="currentColor"
                d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"
              />
            </svg>
            Generate Payroll
          </button>
        }
      />

      <div className={styles.contentWrapper}>
        <Stats stats={stats} variant="cards" columns={4} showTrend showIcon />

        <div className={styles.filterSection}>
          <StatFilter
            data={payrolls}
            onFilterChange={setFilteredPayrolls}
            searchKeys={["staffId", "payrollId"]}
            sortOptions={sortOptions}
            filterOptions={filterOptions}
            searchPlaceholder="Search by Staff ID..."
          />
        </div>

        <div className={styles.tableSection}>
          <Table
            columns={columns}
            data={filteredPayrolls}
            // actions={actions}
            expandable
            renderExpandedRow={renderExpandedRow}
            pagination
            pageSize={10}
            showRowNumbers
          />
        </div>
      </div>

      {/* Modal (View/Edit) */}
      {showModal && currentRecord && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowModal(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className={styles.modalHeader}>
              <div>
                <h2>{modalMode === "view" ? "Payslip" : "Edit Payroll"}</h2>
                <span className={styles.subHeader}>
                  {currentRecord.staffId} • {currentRecord.month}{" "}
                  {currentRecord.year}
                </span>
              </div>
              <button
                className={styles.closeButton}
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>

            {/* Content */}
            <form onSubmit={handleUpdateRecord} className={styles.modalBody}>
              <div className={styles.slipLayout}>
                {/* Earnings Column */}
                <div className={styles.slipColumn}>
                  <h3>Earnings</h3>
                  <div className={styles.slipRow}>
                    <span>Basic Salary</span>
                    {modalMode === "edit" ? (
                      <input
                        type="number"
                        value={currentRecord.basicSalary}
                        onChange={(e) =>
                          setCurrentRecord({
                            ...currentRecord,
                            basicSalary: Number(e.target.value),
                          })
                        }
                      />
                    ) : (
                      <span>GH₵{currentRecord.basicSalary.toLocaleString()}</span>
                    )}
                  </div>
                  <div className={styles.slipGroup}>
                    <span className={styles.groupTitle}>Allowances</span>
                    {["housing", "transport", "meal", "bonus"].map((key) => (
                      <div key={key} className={styles.slipRow}>
                        <span className={styles.capitalize}>{key}</span>
                        {modalMode === "edit" ? (
                          <input
                            type="number"
                            value={
                              currentRecord.allowances[key as keyof Allowances]
                            }
                            onChange={(e) =>
                              setCurrentRecord({
                                ...currentRecord,
                                allowances: {
                                  ...currentRecord.allowances,
                                  [key]: Number(e.target.value),
                                },
                              })
                            }
                          />
                        ) : (
                          <span>
                            GH₵
                            {currentRecord.allowances[
                              key as keyof Allowances
                            ].toLocaleString()}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className={styles.slipTotal}>
                    <span>Gross Salary</span>
                    <strong>
                      GH₵{currentRecord.grossSalary.toLocaleString()}
                    </strong>
                  </div>
                </div>

                {/* Deductions Column */}
                <div className={styles.slipColumn}>
                  <h3>Deductions</h3>
                  <div className={styles.slipGroup}>
                    <span className={styles.groupTitle}>
                      Statutory & Others
                    </span>
                    {["pension", "loan", "absencePenalty"].map((key) => (
                      <div key={key} className={styles.slipRow}>
                        <span className={styles.capitalize}>
                          {key.replace(/([A-Z])/g, " $1").trim()}
                        </span>
                        {modalMode === "edit" ? (
                          <input
                            type="number"
                            value={
                              currentRecord.deductions[key as keyof Deductions]
                            }
                            onChange={(e) =>
                              setCurrentRecord({
                                ...currentRecord,
                                deductions: {
                                  ...currentRecord.deductions,
                                  [key]: Number(e.target.value),
                                },
                              })
                            }
                          />
                        ) : (
                          <span className={styles.deductText}>
                            GH₵
                            {currentRecord.deductions[
                              key as keyof Deductions
                            ].toLocaleString()}
                          </span>
                        )}
                      </div>
                    ))}
                    <div className={styles.slipRow}>
                      <span>Tax</span>
                      {modalMode === "edit" ? (
                        <input
                          type="number"
                          value={currentRecord.tax}
                          onChange={(e) =>
                            setCurrentRecord({
                              ...currentRecord,
                              tax: Number(e.target.value),
                            })
                          }
                        />
                      ) : (
                        <span className={styles.deductText}>
                          GH₵{currentRecord.tax.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={styles.slipTotal}>
                    <span>Total Deductions</span>
                    <strong className={styles.deductText}>
                      -GH₵
                      {(
                        currentRecord.deductions.total + currentRecord.tax
                      ).toLocaleString()}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Net Salary Footer */}
              <div className={styles.slipFooter}>
                <div className={styles.netBox}>
                  <span>Net Salary</span>
                  <h1>GH₵{currentRecord.netSalary.toLocaleString()}</h1>
                </div>
                <div className={styles.statusInfo}>
                  <span
                    className={`${styles.statusBadge} ${styles[`status${currentRecord.status}`]}`}
                  >
                    {currentRecord.status}
                  </span>
                  {currentRecord.paymentDate && (
                    <small>Paid on: {currentRecord.paymentDate}</small>
                  )}
                </div>
              </div>

              {modalMode === "edit" ? (
                <div className={styles.modalActions}>
                  <button
                    type="button"
                    className={styles.cancelButton}
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className={styles.saveButton}>
                    Save Changes
                  </button>
                </div>
              ) : (
                currentRecord.status === "Pending" && (
                  <div className={styles.modalActions}>
                    <button
                      className={styles.payButton}
                      onClick={() => handleProcessPayment(currentRecord)}
                    >
                      Mark as Paid
                    </button>
                  </div>
                )
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayrollAdminPage;
