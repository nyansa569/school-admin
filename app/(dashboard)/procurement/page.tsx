"use client";

import React, { useState, useMemo } from "react";
import styles from "./page.module.css";
import { purchaseOrdersMockData, expensesMockData } from "@/data/purchaseOrder"; // Adjust path
import Header from "@/components/Header/Header";
import Stats from "@/components/Stats/Stats";
import StatFilter from "@/components/StatFilter/StatFilter";
import Table from "@/components/Table/Table";

// Types
interface POItem {
  name: string;
  quantity: number;
  unitPrice: number;
}
interface Entity {
  id: string;
  name?: string;
  fullName?: string;
}
interface PurchaseOrder {
  id: string;
  referenceNumber: string;
  title: string;
  description: string;
  department: Entity;
  requestedBy: Entity;
  items: POItem[];
  totalAmount: number;
  status: string;
  academicYear: string;
  term: string;
  createdAt: string;
}
interface Expense {
  id: string;
  purchaseOrder: { id: string; referenceNumber: string };
  department: Entity;
  vendor: { name: string; phone: string };
  totalAmount: number;
  amountPaid: number;
  paymentMethod: string;
  paymentReference: string;
  recordedBy: Entity;
  expenseDate: string;
}

type TabType = "orders" | "expenses";

const ProcurementAdminPage = () => {
  // State
  const [orders, setOrders] = useState<PurchaseOrder[]>(purchaseOrdersMockData);
  const [expenses, setExpenses] = useState<Expense[]>(expensesMockData);

  const [activeTab, setActiveTab] = useState<TabType>("orders");
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<
    "create" | "edit" | "view" | "payment"
  >("create");
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    type: TabType;
  } | null>(null);

  // Form State
  type ProcurementFormData = Partial<PurchaseOrder> & Partial<Expense>;

  const [formData, setFormData] = useState<ProcurementFormData>({});

  // --- Stats ---
  const stats = useMemo(() => {
    const totalOrderValue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const pendingCount = orders.filter((o) =>
      o.status.includes("Pending"),
    ).length;
    const totalSpent = expenses.reduce((sum, e) => sum + e.amountPaid, 0);

    return [
      {
        id: 1,
        label: "Total Order Value",
        value: `GH₵${totalOrderValue.toLocaleString()}`,
        color: "blue",
        type: "revenue",
      },
      {
        id: 2,
        label: "Pending Approvals",
        value: pendingCount,
        color: "orange",
        type: "events",
      },
      {
        id: 3,
        label: "Total Expenses",
        value: `GH₵${totalSpent.toLocaleString()}`,
        color: "red",
        type: "revenue",
      },
      {
        id: 4,
        label: "Processed Orders",
        value: orders.filter(
          (o) => o.status === "Approved" || o.status === "Paid",
        ).length,
        color: "green",
        type: "classes",
      },
    ];
  }, [orders, expenses]);

  // --- Columns ---

  const orderColumns = [
    {
      header: "Ref Number",
      accessor: "referenceNumber",
      width: "130px",
      render: (r: PurchaseOrder) => (
        <span className={styles.refId}>{r.referenceNumber}</span>
      ),
    },
    {
      header: "Title",
      accessor: "title",
      sortable: true,
      render: (r: PurchaseOrder) => (
        <div className={styles.titleCell}>
          <strong>{r.title}</strong>
          <small>{r.description}</small>
        </div>
      ),
    },
    { header: "Department", accessor: "department.name", sortable: true },
    { header: "Requester", accessor: "requestedBy.fullName" },
    {
      header: "Amount",
      accessor: "totalAmount",
      sortable: true,
      render: (r: PurchaseOrder) => (
        <span className={styles.amountText}>
          GH₵{r.totalAmount.toLocaleString()}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      sortable: true,
      render: (r: PurchaseOrder) => {
        const statusMap: Record<string, string> = {
          "Pending Admin Approval": styles.statusPending,
          Approved: styles.statusApproved,
          Paid: styles.statusPaid,
          Rejected: styles.statusRejected,
        };
        return (
          <span
            className={`${styles.statusBadge} ${statusMap[r.status] || ""}`}
          >
            {r.status}
          </span>
        );
      },
    },
  ];

  const expenseColumns = [
    {
      header: "PO Reference",
      accessor: "purchaseOrder.referenceNumber",
      render: (r: Expense) => (
        <span className={styles.refId}>{r.purchaseOrder.referenceNumber}</span>
      ),
    },
    {
      header: "Vendor",
      accessor: "vendor.name",
      render: (r: Expense) => (
        <div>
          <strong>{r.vendor.name}</strong>
          <small>{r.vendor.phone}</small>
        </div>
      ),
    },
    {
      header: "Amount Paid",
      accessor: "amountPaid",
      sortable: true,
      render: (r: Expense) => (
        <span className={styles.amountPaidText}>
          GH₵{r.amountPaid.toLocaleString()}
        </span>
      ),
    },
    { header: "Method", accessor: "paymentMethod" },
    { header: "Ref/Trans ID", accessor: "paymentReference" },
    { header: "Date", accessor: "expenseDate" },
  ];

  // --- Handlers ---

  const handleCreateOrder = () => {
    setModalMode("create");
    setFormData({
      title: "",
      description: "",
      department: { id: "", name: "" },
      requestedBy: { id: "STF-ADMIN", fullName: "Admin" },
      items: [],
      totalAmount: 0,
      status: "Pending Admin Approval",
    });
    setShowModal(true);
  };

  const handleEditOrder = (order: PurchaseOrder) => {
    if (order.status !== "Pending Admin Approval") return; // Safety check
    setModalMode("edit");
    setCurrentItem(order);
    setFormData({ ...order });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    setDeleteTarget({ id, type: "orders" });
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === "orders") {
      setOrders(orders.filter((o) => o.id !== deleteTarget.id));
    }
    setShowDeleteConfirm(false);
    setDeleteTarget(null);
  };

  // Calculations for items
  const calculateTotal = (items: POItem[]) =>
    items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  const handleItemChange = (index: number, field: keyof POItem, value: any) => {
    const newItems = [...(formData.items || [])];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({
      ...formData,
      items: newItems,
      totalAmount: calculateTotal(newItems),
    });
  };

  const addItem = () => {
    const newItems = [
      ...(formData.items || []),
      { name: "", quantity: 1, unitPrice: 0 },
    ];
    setFormData({ ...formData, items: newItems });
  };

  const removeItem = (index: number) => {
    const newItems = (formData.items || []).filter((_, i) => i !== index);
    setFormData({
      ...formData,
      items: newItems,
      totalAmount: calculateTotal(newItems),
    });
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (modalMode === "create") {
      const newOrder: PurchaseOrder = {
        id: `PO-${Date.now().toString().slice(-4)}`,
        referenceNumber: `PO-${new Date().getFullYear()}-${String(orders.length + 1).padStart(4, "0")}`,
        ...formData,
        createdAt: new Date().toISOString().split("T")[0],
      } as PurchaseOrder;
      setOrders([newOrder, ...orders]);
    } else if (modalMode === "edit" && currentItem) {
      setOrders(
        orders.map((o) =>
          o.id === currentItem.id ? { ...o, ...formData } : o,
        ),
      );
    }
    setShowModal(false);
  };

  // Approval & Payment Actions
  const handleApproveOrder = (order: PurchaseOrder) => {
    setOrders(
      orders.map((o) => (o.id === order.id ? { ...o, status: "Approved" } : o)),
    );
  };

  const handleOpenPaymentModal = (order: PurchaseOrder) => {
    setModalMode("payment");
    setCurrentItem(order);
    setFormData({
      purchaseOrder: { id: order.id, referenceNumber: order.referenceNumber },
      department: order.department,
      totalAmount: order.totalAmount,
      amountPaid: order.totalAmount, // Default to full payment
      expenseDate: new Date().toISOString().split("T")[0],
      paymentMethod: "Transfer",
      vendor: { name: "", phone: "" },
      paymentReference: "",
      recordedBy: { id: "STF-ADMIN", fullName: "Admin" },
    });
    setShowModal(true);
  };

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const newExpense: Expense = {
      id: `EXP-${Date.now().toString().slice(-4)}`,
      ...(formData as any),
      createdAt: new Date().toISOString().split("T")[0],
    };
    setExpenses([newExpense, ...expenses]);
    // Update Order status
    setOrders(
      orders.map((o) =>
        o.id === currentItem.id ? { ...o, status: "Paid" } : o,
      ),
    );
    setShowModal(false);
  };

  // Action Arrays
  const getOrderActions = () => [
    {
      label: "Approve",
      variant: "success",
      onClick: handleApproveOrder,
      hidden: (r: PurchaseOrder) => r.status !== "Pending Admin Approval",
    },
    {
      label: "Pay",
      variant: "primary",
      onClick: handleOpenPaymentModal,
      hidden: (r: PurchaseOrder) => r.status !== "Approved",
    },
    {
      label: "Edit",
      variant: "secondary",
      onClick: handleEditOrder,
      hidden: (r: PurchaseOrder) => r.status !== "Pending Admin Approval",
    },
    {
      label: "Delete",
      variant: "danger",
      onClick: (r: PurchaseOrder) => handleDelete(r.id),
      hidden: (r: PurchaseOrder) => r.status !== "Pending Admin Approval",
    },
  ];

  return (
    <div className={styles.pageContainer}>
      <Header
        title="Procurement & Expenses"
        subtitle="Manage purchase orders and track expenditures"
        customActions={
          <button className={styles.addButton} onClick={handleCreateOrder}>
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path
                fill="currentColor"
                d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"
              />
            </svg>
            New Purchase Order
          </button>
        }
      />

      <div className={styles.contentWrapper}>
        <Stats stats={stats} variant="cards" columns={4} showTrend showIcon />

        {/* Tabs */}
        <div className={styles.tabsContainer}>
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === "orders" ? styles.active : ""}`}
              onClick={() => setActiveTab("orders")}
            >
              Purchase Orders
            </button>
            <button
              className={`${styles.tab} ${activeTab === "expenses" ? styles.active : ""}`}
              onClick={() => setActiveTab("expenses")}
            >
              Expenses & Payments
            </button>
          </div>
        </div>

        <div className={styles.filterSection}>
          <StatFilter
            data={activeTab === "orders" ? orders : expenses}
            onFilterChange={() => {}}
            searchKeys={[
              "title",
              "referenceNumber",
              "vendor.name",
              "department.name",
            ]}
            searchPlaceholder="Search records..."
          />
        </div>

        <div className={styles.tableSection}>
          {activeTab === "orders" && (
            <Table
              columns={orderColumns}
              data={orders}
              // actions={getOrderActions()}
              pagination
              pageSize={10}
              showRowNumbers
            />
          )}
          {activeTab === "expenses" && (
            <Table
              columns={expenseColumns}
              data={expenses}
              pagination
              pageSize={10}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      {showModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowModal(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>
                {modalMode === "create" && "New Purchase Order"}
                {modalMode === "edit" && "Edit Purchase Order"}
                {modalMode === "payment" && "Record Payment"}
              </h2>
              <button
                className={styles.closeButton}
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>

            <form
              onSubmit={
                modalMode === "payment"
                  ? handleSubmitPayment
                  : handleSubmitOrder
              }
              className={styles.modalBody}
            >
              {modalMode !== "payment" ? (
                // PO Form
                <div className={styles.formGrid}>
                  <div className={styles.formSection}>
                    <div className={styles.formGroup}>
                      <label>Title *</label>
                      <input
                        value={formData.title || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Description</label>
                      <textarea
                        value={formData.description || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        rows={2}
                      />
                    </div>
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label>Department</label>
                        <input
                          value={formData.department?.name || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              department: {
                                id: formData.department?.id || "DEP-TEMP",
                                name: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label>Term</label>
                        <select
                          value={formData.term || "First Term"}
                          onChange={(e) =>
                            setFormData({ ...formData, term: e.target.value })
                          }
                        >
                          <option>First Term</option>
                          <option>Second Term</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className={styles.formSection}>
                    <div className={styles.itemsHeader}>
                      <label>Items</label>
                      <button
                        type="button"
                        className={styles.addItemBtn}
                        onClick={addItem}
                      >
                        + Add Item
                      </button>
                    </div>
                    <div className={styles.itemsList}>
                      {(formData.items || []).map(
                        (item: POItem, index: number) => (
                          <div key={index} className={styles.itemRow}>
                            <input
                              placeholder="Item Name"
                              value={item.name}
                              onChange={(e) =>
                                handleItemChange(index, "name", e.target.value)
                              }
                            />
                            <input
                              type="number"
                              placeholder="Qty"
                              value={item.quantity}
                              onChange={(e) =>
                                handleItemChange(
                                  index,
                                  "quantity",
                                  Number(e.target.value),
                                )
                              }
                            />
                            <input
                              type="number"
                              placeholder="Price"
                              value={item.unitPrice}
                              onChange={(e) =>
                                handleItemChange(
                                  index,
                                  "unitPrice",
                                  Number(e.target.value),
                                )
                              }
                            />
                            <button
                              type="button"
                              className={styles.removeItemBtn}
                              onClick={() => removeItem(index)}
                            >
                              ×
                            </button>
                          </div>
                        ),
                      )}
                    </div>
                    <div className={styles.totalDisplay}>
                      <span>Total:</span>{" "}
                      <strong>
                        GH₵{(formData.totalAmount || 0).toLocaleString()}
                      </strong>
                    </div>
                  </div>
                </div>
              ) : (
                // Payment Form
                <div className={styles.formGrid}>
                  <div className={styles.formSection}>
                    <div className={styles.formGroup}>
                      <label>PO Reference</label>
                      <input
                        value={formData.purchaseOrder?.referenceNumber || ""}
                        disabled
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Vendor Name *</label>
                      <input
                        value={formData.vendor?.name || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            vendor: {
                              ...formData.vendor!,
                              name: e.target.value,
                            },
                          })
                        }
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Vendor Phone</label>
                      <input
                        value={formData.vendor?.phone || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            vendor: {
                              ...formData.vendor!,
                              phone: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className={styles.formSection}>
                    <div className={styles.formGroup}>
                      <label>Amount to Pay (GH₵) *</label>
                      <input
                        type="number"
                        value={formData.amountPaid || 0}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            amountPaid: Number(e.target.value),
                          })
                        }
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Payment Method *</label>
                      <select
                        value={formData.paymentMethod || "Transfer"}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            paymentMethod: e.target.value,
                          })
                        }
                      >
                        <option>Transfer</option>
                        <option>Cash</option>
                        <option>Card</option>
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label>Transaction Ref *</label>
                      <input
                        value={formData.paymentReference || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            paymentReference: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Date</label>
                      <input
                        type="date"
                        value={formData.expenseDate || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            expenseDate: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.submitButton}>
                  {modalMode === "payment" ? "Record Payment" : "Save Order"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className={styles.modalOverlay}>
          <div className={styles.confirmModal}>
            <h3>Delete Order?</h3>
            <p>This action cannot be undone.</p>
            <div className={styles.confirmActions}>
              <button
                className={styles.cancelButton}
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button className={styles.deleteButton} onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcurementAdminPage;
