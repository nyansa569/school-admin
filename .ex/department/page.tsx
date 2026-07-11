'use client';

import React, { useState, useMemo } from 'react';
import styles from './page.module.css';
import { departmentsMockData } from '@/data/departmentMockData'; // Adjust path as needed
import Header from '@/components/Header/Header';
import Stats from '@/components/Stats/Stats';
import StatFilter from '@/components/StatFilter/StatFilter';
import Table from '@/components/Table/Table';

// Types
interface HeadTeacher {
  id: string;
  fullName: string;
  staffId: string;
}

interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  headTeacher: HeadTeacher;
  totalClasses: number;
  totalStudents: number;
  createdAt: string;
}

const DepartmentsAdminPage = () => {
  const [departments, setDepartments] = useState<Department[]>(departmentsMockData);
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>(departments);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [currentDepartment, setCurrentDepartment] = useState<Department | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<Department>>({
    name: '',
    code: '',
    description: '',
    headTeacher: {
      id: '',
      fullName: '',
      staffId: ''
    },
    totalClasses: 0,
    totalStudents: 0,
  });

  // Calculate stats
  const stats = useMemo(() => {
    const totalClasses = departments.reduce((sum, d) => sum + d.totalClasses, 0);
    const totalStudents = departments.reduce((sum, d) => sum + d.totalStudents, 0);
    const avgStudentsPerDept = departments.length > 0 
      ? Math.round(totalStudents / departments.length) 
      : 0;

    return [
      {
        id: 1,
        label: 'Total Departments',
        value: departments.length,
        trend: { value: 0, label: 'stable' },
        color: 'blue',
        type: 'classes'
      },
      {
        id: 2,
        label: 'Total Classes',
        value: totalClasses,
        trend: { value: 2, label: 'new' },
        color: 'green',
        type: 'classes'
      },
      {
        id: 3,
        label: 'Total Students',
        value: totalStudents,
        trend: { value: 5, label: 'growth' },
        color: 'purple',
        type: 'students'
      },
      {
        id: 4,
        label: 'Avg Students/Dept',
        value: avgStudentsPerDept,
        unit: ' students',
        color: 'orange',
        type: 'attendance'
      }
    ];
  }, [departments]);

  // Table columns configuration
  const columns = [
    {
      header: 'Dept ID',
      accessor: 'id',
      sortable: true,
      width: '120px',
      render: (row: Department) => (
        <span className={styles.deptId}>{row.id}</span>
      )
    },
    {
      header: 'Department',
      accessor: 'name',
      sortable: true,
      render: (row: Department) => (
        <div className={styles.deptCell}>
          <div className={styles.deptIcon}>
            {row.code === 'SCI' ? '🔬' : row.code === 'BUS' ? '💼' : '🎨'}
          </div>
          <div>
            <div className={styles.deptName}>{row.name}</div>
            <div className={styles.deptDesc}>{row.description}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Code',
      accessor: 'code',
      sortable: true,
      width: '100px',
      render: (row: Department) => (
        <span className={`${styles.codeBadge} ${styles[`code${row.code}`]}`}>
          {row.code}
        </span>
      )
    },
    {
      header: 'Head Teacher',
      accessor: 'headTeacher.fullName',
      sortable: true,
      render: (row: Department) => (
        <div className={styles.teacherCell}>
          <div className={styles.teacherAvatar}>
            {row.headTeacher.fullName.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <div className={styles.teacherName}>{row.headTeacher.fullName}</div>
            <div className={styles.teacherId}>{row.headTeacher.staffId}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Classes',
      accessor: 'totalClasses',
      sortable: true,
      width: '100px',
      render: (row: Department) => (
        <span className={styles.metricValue}>{row.totalClasses}</span>
      )
    },
    {
      header: 'Students',
      accessor: 'totalStudents',
      sortable: true,
      width: '120px',
      render: (row: Department) => (
        <div className={styles.studentInfo}>
          <span className={styles.studentCount}>{row.totalStudents}</span>
          <span className={styles.studentLabel}>students</span>
        </div>
      )
    },
    {
      header: 'Created',
      accessor: 'createdAt',
      sortable: true,
      width: '120px'
    }
  ];

  // Filter options
  const filterOptions = [
    {
      label: 'Department Code',
      value: 'code',
      key: 'code',
      type: 'select' as const,
      options: [
        { label: 'Science', value: 'SCI' },
        { label: 'Business', value: 'BUS' },
        { label: 'Arts', value: 'ART' }
      ]
    }
  ];

  const sortOptions = [
    { label: 'Name (A-Z)', value: 'name-asc', key: 'name', order: 'asc' as const },
    { label: 'Name (Z-A)', value: 'name-desc', key: 'name', order: 'desc' as const },
    { label: 'Students (High to Low)', value: 'students-desc', key: 'totalStudents', order: 'desc' as const },
    { label: 'Students (Low to High)', value: 'students-asc', key: 'totalStudents', order: 'asc' as const },
    { label: 'Classes (Most)', value: 'classes-desc', key: 'totalClasses', order: 'desc' as const },
    { label: 'Created (Newest)', value: 'date-desc', key: 'createdAt', order: 'desc' as const }
  ];

  // CRUD Operations
  const handleCreate = () => {
    setModalMode('create');
    setFormData({
      name: '',
      code: '',
      description: '',
      headTeacher: { id: '', fullName: '', staffId: '' },
      totalClasses: 0,
      totalStudents: 0
    });
    setShowModal(true);
  };

  const handleEdit = (dept: Department) => {
    setModalMode('edit');
    setCurrentDepartment(dept);
    setFormData(dept);
    setShowModal(true);
  };

  const handleView = (dept: Department) => {
    setModalMode('view');
    setCurrentDepartment(dept);
    setFormData(dept);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    setDepartmentToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (departmentToDelete) {
      setDepartments(departments.filter(d => d.id !== departmentToDelete));
      setFilteredDepartments(filteredDepartments.filter(d => d.id !== departmentToDelete));
      setShowDeleteConfirm(false);
      setDepartmentToDelete(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (modalMode === 'create') {
      const newDept: Department = {
        id: `DEP-${String(departments.length + 1).padStart(2, '0')}`,
        ...formData,
        createdAt: new Date().toISOString().split('T')[0]
      } as Department;
      setDepartments([...departments, newDept]);
      setFilteredDepartments([...filteredDepartments, newDept]);
    } else if (modalMode === 'edit' && currentDepartment) {
      const updated = departments.map(d => 
        d.id === currentDepartment.id ? { ...d, ...formData } : d
      );
      setDepartments(updated);
      setFilteredDepartments(updated);
    }
    
    setShowModal(false);
    setCurrentDepartment(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof Department] as any),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Table actions
  const actions = [
    {
      label: 'View',
      variant: 'primary',
      onClick: (row: Department) => handleView(row),
      icon: (
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path fill="currentColor" d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z" />
        </svg>
      )
    },
    {
      label: 'Edit',
      variant: 'secondary',
      onClick: (row: Department) => handleEdit(row),
      icon: (
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path fill="currentColor" d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />
        </svg>
      )
    },
    {
      label: 'Delete',
      variant: 'danger',
      onClick: (row: Department) => handleDelete(row.id),
      icon: (
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path fill="currentColor" d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
        </svg>
      )
    }
  ];

  // Expanded row render
  const renderExpandedRow = (row: Department) => (
    <div className={styles.expandedContent}>
      <div className={styles.expandedSection}>
        <h4>Department Details</h4>
        <div className={styles.detailGrid}>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>ID:</span>
            <span className={styles.detailValue}>{row.id}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Code:</span>
            <span className={styles.detailValue}>{row.code}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Description:</span>
            <span className={styles.detailValue}>{row.description}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Created At:</span>
            <span className={styles.detailValue}>{row.createdAt}</span>
          </div>
        </div>
      </div>

      <div className={styles.expandedSection}>
        <h4>Head Teacher</h4>
        <div className={styles.teacherInfo}>
          <div className={styles.teacherAvatarLarge}>
            {row.headTeacher.fullName.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <div className={styles.teacherNameLarge}>{row.headTeacher.fullName}</div>
            <div className={styles.teacherIdLarge}>Staff ID: {row.headTeacher.staffId}</div>
            <div className={styles.teacherIdLarge}>Teacher ID: {row.headTeacher.id}</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.pageContainer}>
      <Header 
        title="Department Management"
        subtitle="Manage departments, assign head teachers, and monitor capacity"
        customActions={
          <button className={styles.addButton} onClick={handleCreate}>
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
            </svg>
            Add New Department
          </button>
        }
      />

      <div className={styles.contentWrapper}>
        {/* Stats Section */}
        <Stats 
          stats={stats}
          variant="cards"
          columns={4}
          showTrend={true}
          showIcon={true}
          size="md"
        />

        {/* Filter Section */}
        <div className={styles.filterSection}>
          <StatFilter
            data={departments}
            onFilterChange={setFilteredDepartments}
            searchKeys={['name', 'code', 'headTeacher.fullName', 'description']}
            sortOptions={sortOptions}
            filterOptions={filterOptions}
            variant="default"
            showSearch={true}
            showSort={true}
            showFilter={true}
            searchPlaceholder="Search departments..."
            enableReset={true}
          />
        </div>

        {/* Table Section */}
        <div className={styles.tableSection}>
          <Table
            columns={columns}
            data={filteredDepartments}
            variant="default"
            size="md"
            stickyHeader={true}
            sortable={true}
            pagination={true}
            pageSize={10}
            // actions={actions}
            expandable={true}
            renderExpandedRow={renderExpandedRow}
            showRowNumbers={true}
            emptyMessage="No departments found"
            loading={false}
          />
        </div>
      </div>

      {/* Modal Section (Same structure as example) */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>
                {modalMode === 'create' && 'Add New Department'}
                {modalMode === 'edit' && 'Edit Department'}
                {modalMode === 'view' && 'Department Details'}
              </h2>
              <button className={styles.closeButton} onClick={() => setShowModal(false)}>
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.modalBody}>
              <div className={styles.formGrid}>
                {/* Basic Info */}
                <div className={styles.formSection}>
                  <h3 className={styles.sectionTitle}>Basic Information</h3>
                  
                  <div className={styles.formGroup}>
                    <label>Department Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      disabled={modalMode === 'view'}
                      placeholder="Science"
                    />
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Code *</label>
                      <input
                        type="text"
                        name="code"
                        value={formData.code}
                        onChange={handleInputChange}
                        required
                        disabled={modalMode === 'view'}
                        placeholder="SCI"
                        maxLength={3}
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      disabled={modalMode === 'view'}
                      rows={3}
                      placeholder="Department description..."
                      className={styles.textarea}
                    />
                  </div>
                </div>

                {/* Head Teacher & Stats */}
                <div className={styles.formSection}>
                  <h3 className={styles.sectionTitle}>Head Teacher</h3>
                  
                  <div className={styles.formGroup}>
                    <label>Full Name *</label>
                    <input
                      type="text"
                      name="headTeacher.fullName"
                      value={formData.headTeacher?.fullName}
                      onChange={handleInputChange}
                      required
                      disabled={modalMode === 'view'}
                      placeholder="John Doe"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Staff ID *</label>
                    <input
                      type="text"
                      name="headTeacher.staffId"
                      value={formData.headTeacher?.staffId}
                      onChange={handleInputChange}
                      required
                      disabled={modalMode === 'view'}
                      placeholder="EMP-2024-001"
                    />
                  </div>

                  <h3 className={styles.sectionTitle} style={{ marginTop: '20px' }}>Statistics</h3>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Total Classes</label>
                      <input
                        type="number"
                        name="totalClasses"
                        value={formData.totalClasses}
                        onChange={handleInputChange}
                        min="0"
                        disabled={modalMode === 'view'}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Total Students</label>
                      <input
                        type="number"
                        name="totalStudents"
                        value={formData.totalStudents}
                        onChange={handleInputChange}
                        min="0"
                        disabled={modalMode === 'view'}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {modalMode !== 'view' && (
                <div className={styles.modalFooter}>
                  <button type="button" className={styles.cancelButton} onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className={styles.submitButton}>
                    {modalMode === 'create' ? 'Create Department' : 'Update Department'}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className={styles.modalOverlay} onClick={() => setShowDeleteConfirm(false)}>
          <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.confirmIcon}>
              <svg viewBox="0 0 24 24" width="48" height="48">
                <path fill="currentColor" d="M13,14H11V10H13M13,18H11V16H13M1,21H23L12,2L1,21Z" />
              </svg>
            </div>
            <h3>Delete Department</h3>
            <p>Are you sure you want to delete this department? This action cannot be undone.</p>
            <div className={styles.confirmActions}>
              <button className={styles.cancelButton} onClick={() => setShowDeleteConfirm(false)}>
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

export default DepartmentsAdminPage;