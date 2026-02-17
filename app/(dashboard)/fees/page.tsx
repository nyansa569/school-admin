'use client';

import React, { useState, useMemo } from 'react';
import styles from './page.module.css';
import { 
  feeStructuresMockData, 
  studentFeeRecordsMockData, 
  feePaymentsMockData 
} from '@/data/fees'; // Adjust path as needed
import Header from '@/components/Header/Header';
import Stats from '@/components/Stats/Stats';
import StatFilter from '@/components/StatFilter/StatFilter';
import Table from '@/components/Table/Table';

// Types
interface FeeBreakdown { label: string; amount: number; }
interface FeeStructure {
  id: string; name: string; department: { id: string; name: string }; 
  class: { id: string; name: string }; academicYear: string; term: string;
  breakdown: FeeBreakdown[]; totalAmount: number; dueDate: string; createdAt: string;
}
interface StudentFeeRecord {
  id: string; student: { id: string; fullName: string; admissionNumber: string };
  feeStructure: { id: string; name: string }; academicYear: string; term: string;
  totalAmount: number; totalPaid: number; balance: number; status: string; createdAt: string;
}
interface FeePayment {
  id: string; studentFeeRecord: { id: string }; student: { id: string; fullName: string };
  amountPaid: number; paymentMethod: string; paymentReference: string; paidAt: string;
  receivedBy: { id: string; fullName: string }; createdAt: string;
}

type TabType = 'records' | 'structures' | 'payments';

const FeesAdminPage = () => {
  // State for Data
  const [structures, setStructures] = useState<FeeStructure[]>(feeStructuresMockData);
  const [records, setRecords] = useState<StudentFeeRecord[]>(studentFeeRecordsMockData);
  const [payments, setPayments] = useState<FeePayment[]>(feePaymentsMockData);
  
  // UI State
  const [activeTab, setActiveTab] = useState<TabType>('records');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view' | 'payment'>('create');
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; type: TabType } | null>(null);

  // Form State
  const [formData, setFormData] = useState<any>({});

  // --- Calculation & Stats ---
  const stats = useMemo(() => {
    const totalExpected = records.reduce((sum, r) => sum + r.totalAmount, 0);
    const totalCollected = records.reduce((sum, r) => sum + r.totalPaid, 0);
    const totalOutstanding = records.reduce((sum, r) => sum + r.balance, 0);
    const paidCount = records.filter(r => r.status === 'Paid').length;

    return [
      {
        id: 1, label: 'Total Expected', value: `GH₵${totalExpected.toLocaleString()}`,
        trend: { value: 12, label: 'vs last term' }, color: 'blue', type: 'revenue'
      },
      {
        id: 2, label: 'Total Collected', value: `GH₵${totalCollected.toLocaleString()}`,
        trend: { value: 8, label: 'increase' }, color: 'green', type: 'revenue'
      },
      {
        id: 3, label: 'Outstanding Balance', value: `GH₵${totalOutstanding.toLocaleString()}`,
        trend: { value: 5, label: 'needs attention' }, color: 'red', type: 'revenue'
      },
      {
        id: 4, label: 'Payment Rate', value: `${((paidCount / records.length) * 100 || 0).toFixed(0)}%`,
        subtitle: `${paidCount} of ${records.length} students`, color: 'purple', type: 'attendance'
      }
    ];
  }, [records]);

  // --- Table Configurations ---

  // 1. Student Fee Records Columns
  const recordsColumns = [
    {
      header: 'Student', accessor: 'student.fullName', sortable: true,
      render: (row: StudentFeeRecord) => (
        <div className={styles.studentCell}>
          <div className={styles.avatar}>
            {row.student.fullName.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <div className={styles.name}>{row.student.fullName}</div>
            <div className={styles.sub}>{row.student.admissionNumber}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Fee Structure', accessor: 'feeStructure.name', sortable: true,
      render: (row: StudentFeeRecord) => (
        <span className={styles.feeName}>{row.feeStructure.name}</span>
      )
    },
    { header: 'Term', accessor: 'term', sortable: true },
    { 
      header: 'Total Amount', accessor: 'totalAmount', sortable: true,
      render: (row: StudentFeeRecord) => `GH₵${row.totalAmount.toLocaleString()}`
    },
    { 
      header: 'Paid', accessor: 'totalPaid', sortable: true,
      render: (row: StudentFeeRecord) => <span className={styles.paidAmt}>GH₵{row.totalPaid.toLocaleString()}</span>
    },
    { 
      header: 'Balance', accessor: 'balance', sortable: true,
      render: (row: StudentFeeRecord) => (
        <span className={row.balance > 0 ? styles.balanceDue : styles.balanceCleared}>
          GH₵{row.balance.toLocaleString()}
        </span>
      )
    },
    {
      header: 'Status', accessor: 'status', sortable: true,
      render: (row: StudentFeeRecord) => {
        const statusMap: Record<string, string> = {
          Paid: styles.statusPaid,
          Partial: styles.statusPartial,
          Owing: styles.statusOwing
        };
        return <span className={`${styles.statusBadge} ${statusMap[row.status]}`}>{row.status}</span>;
      }
    }
  ];

  // 2. Fee Structures Columns
  const structuresColumns = [
    { header: 'ID', accessor: 'id', width: '100px' },
    { 
      header: 'Structure Name', accessor: 'name', sortable: true,
      render: (row: FeeStructure) => (
        <div>
          <div className={styles.name}>{row.name}</div>
          <div className={styles.sub}>{row.class.name}</div>
        </div>
      )
    },
    { header: 'Department', accessor: 'department.name', sortable: true },
    { header: 'Academic Year', accessor: 'academicYear' },
    { 
      header: 'Total Amount', accessor: 'totalAmount', sortable: true,
      render: (row: FeeStructure) => <strong>GH₵{row.totalAmount.toLocaleString()}</strong>
    },
    { header: 'Due Date', accessor: 'dueDate', sortable: true }
  ];

  // 3. Payments History Columns
  const paymentsColumns = [
    { header: 'Ref ID', accessor: 'id', width: '110px' },
    { 
      header: 'Student', accessor: 'student.fullName', sortable: true,
      render: (row: FeePayment) => (
        <div className={styles.studentCell}>
          <div className={styles.avatar}>{row.student.fullName.split(' ').map(n => n[0]).join('')}</div>
          <div className={styles.name}>{row.student.fullName}</div>
        </div>
      )
    },
    { 
      header: 'Amount', accessor: 'amountPaid', sortable: true,
      render: (row: FeePayment) => <span className={styles.paidAmt}>GH₵{row.amountPaid.toLocaleString()}</span>
    },
    { header: 'Method', accessor: 'paymentMethod' },
    { header: 'Reference', accessor: 'paymentReference' },
    { header: 'Date', accessor: 'paidAt', sortable: true },
    { header: 'Received By', accessor: 'receivedBy.fullName' }
  ];

  // --- Filter Options ---
  const filterOptions = useMemo(() => {
    if (activeTab === 'records') {
      return [
        { label: 'Status', value: 'status', key: 'status', type: 'select' as const, options: [
          { label: 'Paid', value: 'Paid' }, { label: 'Partial', value: 'Partial' }, { label: 'Owing', value: 'Owing' }
        ]},
        { label: 'Term', value: 'term', key: 'term', type: 'select' as const, options: [
          { label: 'First Term', value: 'First Term' }, { label: 'Second Term', value: 'Second Term' }
        ]}
      ];
    }
    return [];
  }, [activeTab]);

  const sortOptions = [
    { label: 'Name (A-Z)', value: 'name-asc', key: 'student.fullName', order: 'asc' as const },
    { label: 'Balance (Highest)', value: 'balance-desc', key: 'balance', order: 'desc' as const },
    { label: 'Amount (Highest)', value: 'amount-desc', key: 'totalAmount', order: 'desc' as const },
  ];

  // --- CRUD & Handlers ---

  const handleCreateStructure = () => {
    setModalMode('create');
    setCurrentItem(null);
    setFormData({
      name: '', department: { name: '' }, class: { name: '' }, 
      academicYear: '2025/2026', term: 'First Term', 
      totalAmount: 0, dueDate: '', breakdown: []
    });
    setShowModal(true);
  };

  const handleRecordPayment = (record: StudentFeeRecord) => {
    setModalMode('payment');
    setCurrentItem(record);
    setFormData({
      recordId: record.id,
      student: record.student,
      balance: record.balance,
      amountPaid: 0,
      paymentMethod: 'Transfer',
      paymentReference: '',
    });
    setShowModal(true);
  };

  const handleViewDetails = (item: any, type: TabType) => {
    setModalMode('view');
    setCurrentItem(item);
    setShowModal(true);
  };

  const handleDelete = (id: string, type: TabType) => {
    setDeleteTarget({ id, type });
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'structures') {
      setStructures(structures.filter(s => s.id !== deleteTarget.id));
    } else if (deleteTarget.type === 'records') {
      setRecords(records.filter(r => r.id !== deleteTarget.id));
    }
    setShowDeleteConfirm(false);
    setDeleteTarget(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (modalMode === 'create') {
      const newStructure: FeeStructure = {
        id: `FS-${Date.now().toString().slice(-4)}`,
        ...formData,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setStructures([...structures, newStructure]);
    } else if (modalMode === 'payment' && currentItem) {
      // 1. Add Payment
      const newPayment: FeePayment = {
        id: `PAY-${Date.now().toString().slice(-5)}`,
        studentFeeRecord: { id: currentItem.id },
        student: currentItem.student,
        amountPaid: Number(formData.amountPaid),
        paymentMethod: formData.paymentMethod,
        paymentReference: formData.paymentReference,
        paidAt: new Date().toISOString().split('T')[0],
        receivedBy: { id: 'STF-ADMIN', fullName: 'Admin User' },
        createdAt: new Date().toISOString().split('T')[0]
      };
      setPayments([newPayment, ...payments]);

      // 2. Update Record
      const updatedRecords = records.map(r => {
        if (r.id === currentItem.id) {
          const newPaid = r.totalPaid + Number(formData.amountPaid);
          const newBalance = r.totalAmount - newPaid;
          return {
            ...r,
            totalPaid: newPaid,
            balance: newBalance,
            status: newBalance <= 0 ? 'Paid' : 'Partial'
          };
        }
        return r;
      });
      setRecords(updatedRecords);
    }
    
    setShowModal(false);
  };

  // Dynamic Actions based on Tab
  const getActions = () => {
    if (activeTab === 'records') {
      return [
        { 
          label: 'Pay', variant: 'success', 
          onClick: (row: StudentFeeRecord) => handleRecordPayment(row),
          icon: <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M14.6,16.6L19.2,12L14.6,7.4L16,6L22,12L16,18L14.6,16.6M9.4,16.6L4.8,12L9.4,7.4L8,6L2,12L8,18L9.4,16.6Z" /></svg>
        },
        { 
          label: 'View', variant: 'primary',
          onClick: (row: StudentFeeRecord) => handleViewDetails(row, 'records')
        },
        { 
          label: 'Delete', variant: 'danger',
          onClick: (row: StudentFeeRecord) => handleDelete(row.id, 'records')
        }
      ];
    }
    if (activeTab === 'structures') {
      return [
        { label: 'Edit', variant: 'secondary', onClick: (row: FeeStructure) => { setModalMode('edit'); setCurrentItem(row); setFormData(row); setShowModal(true); } },
        { label: 'Delete', variant: 'danger', onClick: (row: FeeStructure) => handleDelete(row.id, 'structures') }
      ];
    }
    return [];
  };

  return (
    <div className={styles.pageContainer}>
      <Header 
        title="Fees & Payments"
        subtitle="Manage fee structures, student payments, and financial records"
        customActions={
          <button className={styles.addButton} onClick={handleCreateStructure}>
            <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" /></svg>
            New Fee Structure
          </button>
        }
      />

      <div className={styles.contentWrapper}>
        <Stats stats={stats} variant="cards" columns={4} showTrend showIcon />

        <div className={styles.tabsContainer}>
          <div className={styles.tabs}>
            <button 
              className={`${styles.tab} ${activeTab === 'records' ? styles.active : ''}`}
              onClick={() => setActiveTab('records')}
            >
              Student Records
            </button>
            <button 
              className={`${styles.tab} ${activeTab === 'structures' ? styles.active : ''}`}
              onClick={() => setActiveTab('structures')}
            >
              Fee Structures
            </button>
            <button 
              className={`${styles.tab} ${activeTab === 'payments' ? styles.active : ''}`}
              onClick={() => setActiveTab('payments')}
            >
              Payment History
            </button>
          </div>
        </div>

        <div className={styles.filterSection}>
          <StatFilter
            data={activeTab === 'records' ? records : activeTab === 'structures' ? structures : payments}
            onFilterChange={(d: any) => { /* Implement filtering logic if needed */ }}
            searchKeys={activeTab === 'records' ? ['student.fullName', 'student.admissionNumber'] : ['name', 'id']}
            sortOptions={sortOptions}
            filterOptions={filterOptions}
            searchPlaceholder={activeTab === 'records' ? "Search by student name..." : "Search..."}
          />
        </div>

        <div className={styles.tableSection}>
          {activeTab === 'records' && (
            <Table 
              columns={recordsColumns}
              data={records} // Note: In real app, use filtered state
              // actions={getActions()}
              pagination pageSize={10}
              showRowNumbers
            />
          )}
          {activeTab === 'structures' && (
            <Table 
              columns={structuresColumns}
              data={structures}
              // actions={getActions()}
              pagination pageSize={10}
            />
          )}
          {activeTab === 'payments' && (
            <Table 
              columns={paymentsColumns}
              data={payments}
              pagination pageSize={10}
            />
          )}
        </div>
      </div>

      {/* --- Modals --- */}
      
      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>
                {modalMode === 'create' && 'New Fee Structure'}
                {modalMode === 'payment' && 'Record Payment'}
                {modalMode === 'view' && 'Details'}
              </h2>
              <button className={styles.closeButton} onClick={() => setShowModal(false)}>×</button>
            </div>

            <form onSubmit={handleSubmit} className={styles.modalBody}>
              {modalMode === 'payment' && (
                <>
                  <div className={styles.paymentInfo}>
                    <span>Student: <strong>{formData.student?.fullName}</strong></span>
                    <span>Current Balance: <strong className={styles.balanceDue}>GH₵{formData.balance?.toLocaleString()}</strong></span>
                  </div>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label>Amount Paying (GH₵) *</label>
                      <input 
                        type="number" 
                        value={formData.amountPaid} 
                        onChange={(e) => setFormData({...formData, amountPaid: e.target.value})}
                        required max={formData.balance}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Payment Method *</label>
                      <select 
                        value={formData.paymentMethod}
                        onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                      >
                        <option>Transfer</option>
                        <option>Cash</option>
                        <option>Card</option>
                        <option>POS</option>
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label>Reference / Receipt No</label>
                      <input 
                        type="text" 
                        value={formData.paymentReference}
                        onChange={(e) => setFormData({...formData, paymentReference: e.target.value})}
                        placeholder="Optional"
                      />
                    </div>
                  </div>
                </>
              )}

              {modalMode === 'create' && (
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label>Structure Name *</label>
                    <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g. First Term Fees" />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Total Amount (GH₵) *</label>
                    <input type="number" value={formData.totalAmount} onChange={(e) => setFormData({...formData, totalAmount: Number(e.target.value)})} />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Academic Year</label>
                    <select value={formData.academicYear} onChange={(e) => setFormData({...formData, academicYear: e.target.value})}>
                      <option>2025/2026</option>
                      <option>2024/2025</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Due Date</label>
                    <input type="date" value={formData.dueDate} onChange={(e) => setFormData({...formData, dueDate: e.target.value})} />
                  </div>
                </div>
              )}

              {modalMode === 'view' && currentItem && (
                <div className={styles.viewDetails}>
                  {/* Detailed view implementation */}
                  <p>Details for {currentItem.student?.fullName || currentItem.name}</p>
                </div>
              )}

              {modalMode !== 'view' && (
                <div className={styles.modalFooter}>
                  <button type="button" className={styles.cancelButton} onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className={styles.submitButton}>
                    {modalMode === 'create' ? 'Save Structure' : 'Confirm Payment'}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className={styles.modalOverlay}>
          <div className={styles.confirmModal}>
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this record? This action cannot be undone.</p>
            <div className={styles.confirmActions}>
              <button className={styles.cancelButton} onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
              <button className={styles.deleteButton} onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeesAdminPage;