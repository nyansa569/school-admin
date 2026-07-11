"use client";

import React, { useState, useMemo } from "react";
import styles from "./page.module.css";
import { inventoriesMockData } from "@/data/inventory"; // Adjust path as needed
import Header from "@/components/Header/Header";
import Stats from "@/components/Stats/Stats";
import StatFilter from "@/components/StatFilter/StatFilter";
import Table from "@/components/Table/Table";

// Types
interface Location {
  building: string;
  room: string;
}
interface Supplier {
  name: string;
  contactEmail: string;
  phone: string;
}
interface InventoryItem {
  id: string;
  itemCode: string;
  name: string;
  category: string;
  // type: "Asset" | "Consumable";
  type: string;
  quantity: number;
  unitPrice: number;
  totalValue: number;
  reorderLevel: number;
  // condition: 'New' | 'Good' | 'Fair' | 'Damaged' | null;
  // status: 'In Use' | 'In Storage' | 'Under Maintenance' | 'Disposed';
  condition: string | null;
  status: string;
  location: Location;
  supplier: Supplier;
  purchaseDate: string;
  lastMaintenanceDate: string | null;
  createdAt: string;
}

const InventoryAdminPage = () => {
  const [inventory, setInventory] =
    useState<InventoryItem[]>(inventoriesMockData);
  const [filteredInventory, setFilteredInventory] =
    useState<InventoryItem[]>(inventory);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create",
  );
  const [currentItem, setCurrentItem] = useState<InventoryItem | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<InventoryItem>>({
    name: "",
    category: "Electronics",
    type: "Asset",
    quantity: 0,
    unitPrice: 0,
    reorderLevel: 5,
    condition: "New",
    status: "In Storage",
    location: { building: "", room: "" },
    supplier: { name: "", contactEmail: "", phone: "" },
    purchaseDate: new Date().toISOString().split("T")[0],
  });

  // Calculate Stats
  const stats = useMemo(() => {
    const totalValue = inventory.reduce(
      (sum, item) => sum + item.totalValue,
      0,
    );
    const totalItems = inventory.reduce((sum, item) => sum + item.quantity, 0);
    const lowStockCount = inventory.filter(
      (item) => item.quantity <= item.reorderLevel,
    ).length;
    const assetsCount = inventory.filter(
      (item) => item.type === "Asset",
    ).length;

    return [
      {
        id: 1,
        label: "Total Inventory Value",
        value: `GH₵${totalValue.toLocaleString()}`,
        trend: { value: 12, label: "assets appraisal" },
        color: "purple",
        type: "revenue",
      },
      {
        id: 2,
        label: "Total Unique Items",
        value: inventory.length,
        trend: { value: assetsCount, label: "assets" },
        color: "blue",
        type: "classes",
      },
      {
        id: 3,
        label: "Total Quantity",
        value: totalItems,
        subtitle: "units in stock",
        color: "green",
        type: "students",
      },
      {
        id: 4,
        label: "Low Stock Alerts",
        value: lowStockCount,
        trend: { value: lowStockCount > 0 ? 100 : 0, label: "needs restock" },
        color: lowStockCount > 0 ? "red" : "orange",
        type: "events",
      },
    ];
  }, [inventory]);

  // Table Columns
  const columns = [
    {
      header: "Item Details",
      accessor: "name",
      sortable: true,
      render: (row: InventoryItem) => (
        <div className={styles.itemCell}>
          <div className={styles.itemIcon}>
            {row.category === "Electronics"
              ? "💻"
              : row.category === "Furniture"
                ? "🪑"
                : row.category === "Lab Equipment"
                  ? "🔬"
                  : row.category === "Books"
                    ? "📚"
                    : "🧹"}
          </div>
          <div>
            <div className={styles.itemName}>{row.name}</div>
            <div className={styles.itemCode}>{row.itemCode}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Category",
      accessor: "category",
      sortable: true,
      render: (row: InventoryItem) => (
        <span
          className={`${styles.catBadge} ${styles[`cat${row.category.replace(/\s/g, "")}`]}`}
        >
          {row.category}
        </span>
      ),
    },
    {
      header: "Type",
      accessor: "type",
      sortable: true,
      width: "100px",
      render: (row: InventoryItem) => (
        <span
          className={
            row.type === "Asset" ? styles.typeAsset : styles.typeConsumable
          }
        >
          {row.type}
        </span>
      ),
    },
    {
      header: "Stock",
      accessor: "quantity",
      sortable: true,
      width: "140px",
      render: (row: InventoryItem) => {
        const isLow = row.quantity <= row.reorderLevel;
        return (
          <div className={styles.stockInfo}>
            <span className={isLow ? styles.lowStock : ""}>{row.quantity}</span>
            {isLow && <span className={styles.alertBadge}>Low</span>}
          </div>
        );
      },
    },
    {
      header: "Unit Price",
      accessor: "unitPrice",
      sortable: true,
      render: (row: InventoryItem) => `GH₵${row.unitPrice.toLocaleString()}`,
    },
    {
      header: "Total Value",
      accessor: "totalValue",
      sortable: true,
      render: (row: InventoryItem) => (
        <strong className={styles.valueText}>
          GH₵{row.totalValue.toLocaleString()}
        </strong>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      sortable: true,
      width: "130px",
      render: (row: InventoryItem) => {
        const statusMap: Record<string, string> = {
          "In Use": styles.statusInUse,
          "In Storage": styles.statusStorage,
          "Under Maintenance": styles.statusMaintenance,
          Disposed: styles.statusDisposed,
        };
        return (
          <span className={`${styles.statusBadge} ${statusMap[row.status]}`}>
            {row.status}
          </span>
        );
      },
    },
    {
      header: "Condition",
      accessor: "condition",
      sortable: true,
      width: "110px",
      render: (row: InventoryItem) => {
        if (!row.condition) return <span className={styles.muted}>N/A</span>;
        const condMap: Record<string, string> = {
          New: styles.condNew,
          Good: styles.condGood,
          Fair: styles.condFair,
          Damaged: styles.condDamaged,
        };
        return (
          <span className={`${styles.condBadge} ${condMap[row.condition]}`}>
            {row.condition}
          </span>
        );
      },
    },
  ];

  // Filters
  const filterOptions = [
    {
      label: "Category",
      value: "category",
      key: "category",
      type: "select" as const,
      options: [
        { label: "Electronics", value: "Electronics" },
        { label: "Furniture", value: "Furniture" },
        { label: "Lab Equipment", value: "Lab Equipment" },
        { label: "Books", value: "Books" },
        { label: "Cleaning", value: "Cleaning" },
      ],
    },
    {
      label: "Type",
      value: "type",
      key: "type",
      type: "select" as const,
      options: [
        { label: "Asset", value: "Asset" },
        { label: "Consumable", value: "Consumable" },
      ],
    },
    {
      label: "Status",
      value: "status",
      key: "status",
      type: "select" as const,
      options: [
        { label: "In Use", value: "In Use" },
        { label: "In Storage", value: "In Storage" },
        { label: "Maintenance", value: "Under Maintenance" },
      ],
    },
  ];

  const sortOptions = [
    {
      label: "Name (A-Z)",
      value: "name-asc",
      key: "name",
      order: "asc" as const,
    },
    {
      label: "Value (High to Low)",
      value: "value-desc",
      key: "totalValue",
      order: "desc" as const,
    },
    {
      label: "Quantity (Low to High)",
      value: "qty-asc",
      key: "quantity",
      order: "asc" as const,
    },
    {
      label: "Purchase Date (Newest)",
      value: "date-desc",
      key: "purchaseDate",
      order: "desc" as const,
    },
  ];

  // CRUD Handlers
  const handleCreate = () => {
    setModalMode("create");
    setFormData({
      name: "",
      category: "Electronics",
      type: "Asset",
      quantity: 0,
      unitPrice: 0,
      reorderLevel: 5,
      condition: "New",
      status: "In Storage",
      location: { building: "", room: "" },
      supplier: { name: "", contactEmail: "", phone: "" },
      purchaseDate: new Date().toISOString().split("T")[0],
    });
    setShowModal(true);
  };

  const handleEdit = (item: InventoryItem) => {
    setModalMode("edit");
    setCurrentItem(item);
    setFormData({ ...item });
    setShowModal(true);
  };

  const handleView = (item: InventoryItem) => {
    setModalMode("view");
    setCurrentItem(item);
    setFormData({ ...item });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    setItemToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      setInventory(inventory.filter((i) => i.id !== itemToDelete));
      setFilteredInventory(
        filteredInventory.filter((i) => i.id !== itemToDelete),
      );
      setShowDeleteConfirm(false);
      setItemToDelete(null);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    // Handle numeric fields
    if (["quantity", "unitPrice", "reorderLevel"].includes(name)) {
      setFormData((prev) => ({ ...prev, [name]: Number(value) }));
      return;
    }

    // Handle nested objects (location, supplier)
    if (name.startsWith("location.") || name.startsWith("supplier.")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof InventoryItem] as any),
          [child]: value,
        },
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Auto-calculate total value
  const handlePriceOrQtyChange = (name: string, value: number) => {
    const newData = { ...formData, [name]: value };
    const total = (newData.quantity || 0) * (newData.unitPrice || 0);
    setFormData({ ...newData, totalValue: total });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const totalVal = (formData.quantity || 0) * (formData.unitPrice || 0);

    if (modalMode === "create") {
      const newItem: InventoryItem = {
        id: `INV-${Date.now().toString().slice(-4)}`,
        itemCode: `ITM-${Date.now().toString().slice(-6)}`,
        ...formData,
        totalValue: totalVal,
        createdAt: new Date().toISOString().split("T")[0],
      } as InventoryItem;
      setInventory([newItem, ...inventory]);
    } else if (modalMode === "edit" && currentItem) {
      const updated = inventory.map((i) =>
        i.id === currentItem.id
          ? { ...i, ...formData, totalValue: totalVal }
          : i,
      );
      setInventory(updated);
    }
    setShowModal(false);
  };

  const actions = [
    { label: "View", variant: "primary", onClick: handleView },
    { label: "Edit", variant: "secondary", onClick: handleEdit },
    {
      label: "Delete",
      variant: "danger",
      onClick: (row: InventoryItem) => handleDelete(row.id),
    },
  ];

  const renderExpandedRow = (row: InventoryItem) => (
    <div className={styles.expandedContent}>
      <div className={styles.expandedGrid}>
        <div className={styles.expandedSection}>
          <h4>Location Details</h4>
          <div className={styles.detailRow}>
            <span>Building:</span> <strong>{row.location.building}</strong>
          </div>
          <div className={styles.detailRow}>
            <span>Room:</span> <strong>{row.location.room}</strong>
          </div>
          <div className={styles.detailRow}>
            <span>Purchase Date:</span> <strong>{row.purchaseDate}</strong>
          </div>
          {row.lastMaintenanceDate && (
            <div className={styles.detailRow}>
              <span>Last Maintenance:</span>{" "}
              <strong>{row.lastMaintenanceDate}</strong>
            </div>
          )}
        </div>
        <div className={styles.expandedSection}>
          <h4>Supplier Information</h4>
          <div className={styles.detailRow}>
            <span>Supplier:</span> <strong>{row.supplier.name}</strong>
          </div>
          <div className={styles.detailRow}>
            <span>Email:</span> <strong>{row.supplier.contactEmail}</strong>
          </div>
          <div className={styles.detailRow}>
            <span>Phone:</span> <strong>{row.supplier.phone}</strong>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.pageContainer}>
      <Header
        title="Inventory Management"
        subtitle="Track assets, consumables, and supplier details"
        customActions={
          <button className={styles.addButton} onClick={handleCreate}>
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path
                fill="currentColor"
                d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"
              />
            </svg>
            Add New Item
          </button>
        }
      />

      <div className={styles.contentWrapper}>
        <Stats stats={stats} variant="cards" columns={4} showTrend showIcon />

        <div className={styles.filterSection}>
          <StatFilter
            data={inventory}
            onFilterChange={setFilteredInventory}
            searchKeys={[
              "name",
              "itemCode",
              "supplier.name",
              "location.building",
            ]}
            sortOptions={sortOptions}
            filterOptions={filterOptions}
            searchPlaceholder="Search items by name or code..."
          />
        </div>

        <div className={styles.tableSection}>
          <Table
            columns={columns}
            data={filteredInventory}
            // actions={actions}
            expandable
            renderExpandedRow={renderExpandedRow}
            pagination
            pageSize={10}
            showRowNumbers
          />
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowModal(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>
                {modalMode === "create" && "Add New Inventory Item"}
                {modalMode === "edit" && "Edit Item"}
                {modalMode === "view" && "Item Details"}
              </h2>
              <button
                className={styles.closeButton}
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.modalBody}>
              <div className={styles.formGrid}>
                {/* Left Col */}
                <div className={styles.formSection}>
                  <h3 className={styles.sectionTitle}>Basic Information</h3>

                  <div className={styles.formGroup}>
                    <label>Item Name *</label>
                    <input
                      name="name"
                      value={formData.name || ""}
                      onChange={handleInputChange}
                      required
                      disabled={modalMode === "view"}
                    />
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Category *</label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        disabled={modalMode === "view"}
                      >
                        <option>Electronics</option>
                        <option>Furniture</option>
                        <option>Lab Equipment</option>
                        <option>Books</option>
                        <option>Stationery</option>
                        <option>Cleaning</option>
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label>Type *</label>
                      <select
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        disabled={modalMode === "view"}
                      >
                        <option value="Asset">Asset</option>
                        <option value="Consumable">Consumable</option>
                      </select>
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Location (Building - Room)</label>
                    <div className={styles.formRow}>
                      <input
                        name="location.building"
                        placeholder="Building"
                        value={formData.location?.building || ""}
                        onChange={handleInputChange}
                        disabled={modalMode === "view"}
                      />
                      <input
                        name="location.room"
                        placeholder="Room"
                        value={formData.location?.room || ""}
                        onChange={handleInputChange}
                        disabled={modalMode === "view"}
                      />
                    </div>
                  </div>
                </div>

                {/* Right Col */}
                <div className={styles.formSection}>
                  <h3 className={styles.sectionTitle}>Stock & Valuation</h3>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Quantity *</label>
                      <input
                        type="number"
                        name="quantity"
                        min="0"
                        value={formData.quantity || 0}
                        onChange={(e) =>
                          handlePriceOrQtyChange(
                            "quantity",
                            Number(e.target.value),
                          )
                        }
                        disabled={modalMode === "view"}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Unit Price (GH₵) *</label>
                      <input
                        type="number"
                        name="unitPrice"
                        min="0"
                        value={formData.unitPrice || 0}
                        onChange={(e) =>
                          handlePriceOrQtyChange(
                            "unitPrice",
                            Number(e.target.value),
                          )
                        }
                        disabled={modalMode === "view"}
                      />
                    </div>
                  </div>

                  <div className={styles.calcBox}>
                    <span>Total Value:</span>
                    <strong>
                      GH₵
                      {(
                        (formData.quantity || 0) * (formData.unitPrice || 0)
                      ).toLocaleString()}
                    </strong>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Reorder Level</label>
                      <input
                        type="number"
                        name="reorderLevel"
                        min="0"
                        value={formData.reorderLevel || 0}
                        onChange={handleInputChange}
                        disabled={modalMode === "view"}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Status</label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        disabled={modalMode === "view"}
                      >
                        <option>In Use</option>
                        <option>In Storage</option>
                        <option>Under Maintenance</option>
                        <option>Disposed</option>
                      </select>
                    </div>
                  </div>

                  {formData.type === "Asset" && (
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label>Condition</label>
                        <select
                          name="condition"
                          value={formData.condition || "Good"}
                          onChange={handleInputChange}
                          disabled={modalMode === "view"}
                        >
                          <option>New</option>
                          <option>Good</option>
                          <option>Fair</option>
                          <option>Damaged</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {/* Supplier Section (Full Width Bottom) */}
                <div className={styles.formSectionFull}>
                  <h3 className={styles.sectionTitle}>Supplier Details</h3>
                  <div className={styles.formGridInline}>
                    <div className={styles.formGroup}>
                      <label>Supplier Name</label>
                      <input
                        name="supplier.name"
                        value={formData.supplier?.name || ""}
                        onChange={handleInputChange}
                        disabled={modalMode === "view"}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Email</label>
                      <input
                        name="supplier.contactEmail"
                        type="email"
                        value={formData.supplier?.contactEmail || ""}
                        onChange={handleInputChange}
                        disabled={modalMode === "view"}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Phone</label>
                      <input
                        name="supplier.phone"
                        value={formData.supplier?.phone || ""}
                        onChange={handleInputChange}
                        disabled={modalMode === "view"}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {modalMode !== "view" && (
                <div className={styles.modalFooter}>
                  <button
                    type="button"
                    className={styles.cancelButton}
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className={styles.submitButton}>
                    Save Item
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {showDeleteConfirm && (
        <div className={styles.modalOverlay}>
          <div className={styles.confirmModal}>
            <h3>Delete Item?</h3>
            <p>This will permanently remove this inventory record.</p>
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

export default InventoryAdminPage;
