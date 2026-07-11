'use client';

import React, { useState, useMemo } from 'react';
import styles from './classes.module.css';
import { classesMockData } from '@/data/classMockData';
import Header from '@/components/Header/Header';
import Stats from '@/components/Stats/Stats';
import StatFilter from '@/components/StatFilter/StatFilter';
import Table from '@/components/Table/Table';

// Types
interface ClassTeacher {
  id: string;
  fullName: string;
  staffId: string;
}

interface Department {
  id: string;
  name: string;
  code: string;
}

interface Class {
  id: string;
  name: string;
  level: string;
  department: Department;
  classTeacher: ClassTeacher;
  capacity: number;
  totalStudents: number;
  academicYear: string;
  status: string;
  createdAt: string;
}

const ClassesAdminPage = () => {
  const [classes, setClasses] = useState<Class[]>(classesMockData);
  const [filteredClasses, setFilteredClasses] = useState<Class[]>(classes);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [currentClass, setCurrentClass] = useState<Class | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [classToDelete, setClassToDelete] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<Class>>({
    name: '',
    level: 'Senior',
    department: {
      id: '',
      name: '',
      code: ''
    },
    classTeacher: {
      id: '',
      fullName: '',
      staffId: ''
    },
    capacity: 40,
    totalStudents: 0,
    academicYear: '2024/2025',
    status: 'Active'
  });

  // Calculate stats
  const stats = useMemo(() => {
    const activeClasses = classes.filter(c => c.status === 'Active').length;
    const totalCapacity = classes.reduce((sum, c) => sum + c.capacity, 0);
    const totalStudents = classes.reduce((sum, c) => sum + c.totalStudents, 0);
    const utilizationRate = totalCapacity > 0 
      ? ((totalStudents / totalCapacity) * 100).toFixed(1)
      : 0;

    // Calculate average class size
    const avgClassSize = classes.length > 0
      ? Math.round(totalStudents / classes.length)
      : 0;

    // Department distribution
    const scienceClasses = classes.filter(c => c.department.code === 'SCI').length;
    const businessClasses = classes.filter(c => c.department.code === 'BUS').length;

    return [
      {
        id: 1,
        label: 'Total Classes',
        value: classes.length,
        trend: { value: 2, label: 'new this year' },
        color: 'blue',
        type: 'classes'
      },
      {
        id: 2,
        label: 'Active Classes',
        value: activeClasses,
        trend: { value: 100, label: 'utilization' },
        color: 'green',
        type: 'students'
      },
      {
        id: 3,
        label: 'Total Students',
        value: totalStudents,
        secondaryValue: `${utilizationRate}%`,
        secondaryLabel: 'Capacity',
        trend: { value: 5, label: 'vs last term' },
        color: 'purple',
        type: 'students'
      },
      {
        id: 4,
        label: 'Avg. Class Size',
        value: avgClassSize,
        unit: ' students',
        trend: { value: 2, label: 'vs target' },
        color: 'orange',
        type: 'attendance'
      }
    ];
  }, [classes]);

  // Table columns configuration
  const columns = [
    {
      header: 'Class ID',
      accessor: 'id',
      sortable: true,
      width: '130px',
      render: (row: Class) => (
        <span className={styles.classId}>{row.id}</span>
      )
    },
    {
      header: 'Class Name',
      accessor: 'name',
      sortable: true,
      render: (row: Class) => (
        <div className={styles.classCell}>
          <div className={styles.classIcon}>
            {row.department.code === 'SCI' ? '🔬' : '💼'}
          </div>
          <div>
            <div className={styles.className}>{row.name}</div>
            <div className={styles.classLevel}>{row.level}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Department',
      accessor: 'department.name',
      sortable: true,
      width: '140px',
      render: (row: Class) => (
        <span className={`${styles.deptBadge} ${styles[`dept${row.department.code}`]}`}>
          {row.department.name}
        </span>
      )
    },
    {
      header: 'Class Teacher',
      accessor: 'classTeacher.fullName',
      sortable: true,
      render: (row: Class) => (
        <div className={styles.teacherCell}>
          <div className={styles.teacherAvatar}>
            {row.classTeacher.fullName.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <div className={styles.teacherName}>{row.classTeacher.fullName}</div>
            <div className={styles.teacherId}>{row.classTeacher.staffId}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Students',
      accessor: 'totalStudents',
      sortable: true,
      width: '140px',
      render: (row: Class) => {
        const percentage = (row.totalStudents / row.capacity) * 100;
        const isFull = percentage >= 90;
        const isLow = percentage < 60;
        
        return (
          <div className={styles.studentCount}>
            <div className={styles.countText}>
              <span className={styles.current}>{row.totalStudents}</span>
              <span className={styles.separator}>/</span>
              <span className={styles.capacity}>{row.capacity}</span>
            </div>
            <div className={styles.progressBar}>
              <div 
                className={`${styles.progressFill} ${isFull ? styles.full : isLow ? styles.low : styles.normal}`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
            <span className={styles.percentage}>{percentage.toFixed(0)}%</span>
          </div>
        );
      }
    },
    {
      header: 'Academic Year',
      accessor: 'academicYear',
      sortable: true,
      width: '130px'
    },
    {
      header: 'Status',
      accessor: 'status',
      sortable: true,
      width: '110px',
      render: (row: Class) => {
        const statusColors: Record<string, string> = {
          Active: styles.statusActive,
          Archived: styles.statusArchived
        };
        return (
          <span className={`${styles.statusBadge} ${statusColors[row.status]}`}>
            {row.status}
          </span>
        );
      }
    }
  ];

  // Filter options
  const filterOptions = [
    {
      label: 'Department',
      value: 'department.code',
      key: 'department.code',
      type: 'select' as const,
      options: [
        { label: 'Science', value: 'SCI' },
        { label: 'Business', value: 'BUS' },
        { label: 'Arts', value: 'ART' }
      ]
    },
    {
      label: 'Level',
      value: 'level',
      key: 'level',
      type: 'select' as const,
      options: [
        { label: 'Senior', value: 'Senior' },
        { label: 'Junior', value: 'Junior' }
      ]
    },
    {
      label: 'Status',
      value: 'status',
      key: 'status',
      type: 'select' as const,
      options: [
        { label: 'Active', value: 'Active' },
        { label: 'Archived', value: 'Archived' }
      ]
    },
    {
      label: 'Academic Year',
      value: 'academicYear',
      key: 'academicYear',
      type: 'select' as const,
      options: [
        { label: '2024/2025', value: '2024/2025' },
        { label: '2023/2024', value: '2023/2024' },
        { label: '2022/2023', value: '2022/2023' }
      ]
    }
  ];

  const sortOptions = [
    { label: 'Name (A-Z)', value: 'name-asc', key: 'name', order: 'asc' as const },
    { label: 'Name (Z-A)', value: 'name-desc', key: 'name', order: 'desc' as const },
    { label: 'Students (Most)', value: 'students-desc', key: 'totalStudents', order: 'desc' as const },
    { label: 'Students (Least)', value: 'students-asc', key: 'totalStudents', order: 'asc' as const },
    { label: 'Capacity (Highest)', value: 'capacity-desc', key: 'capacity', order: 'desc' as const },
    { label: 'Capacity (Lowest)', value: 'capacity-asc', key: 'capacity', order: 'asc' as const },
    { label: 'Created (Newest)', value: 'date-desc', key: 'createdAt', order: 'desc' as const },
    { label: 'Created (Oldest)', value: 'date-asc', key: 'createdAt', order: 'asc' as const }
  ];

  // CRUD Operations
  const handleCreate = () => {
    setModalMode('create');
    setFormData({
      name: '',
      level: 'Senior',
      department: {
        id: '',
        name: '',
        code: ''
      },
      classTeacher: {
        id: '',
        fullName: '',
        staffId: ''
      },
      capacity: 40,
      totalStudents: 0,
      academicYear: '2024/2025',
      status: 'Active'
    });
    setShowModal(true);
  };

  const handleEdit = (classData: Class) => {
    setModalMode('edit');
    setCurrentClass(classData);
    setFormData(classData);
    setShowModal(true);
  };

  const handleView = (classData: Class) => {
    setModalMode('view');
    setCurrentClass(classData);
    setFormData(classData);
    setShowModal(true);
  };

  const handleDelete = (classId: string) => {
    setClassToDelete(classId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (classToDelete) {
      setClasses(classes.filter(c => c.id !== classToDelete));
      setFilteredClasses(filteredClasses.filter(c => c.id !== classToDelete));
      setShowDeleteConfirm(false);
      setClassToDelete(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (modalMode === 'create') {
      const newClass: Class = {
        id: `CLS-${formData.department?.code}-${Date.now().toString().slice(-2)}`,
        ...formData,
        createdAt: new Date().toISOString().split('T')[0]
      } as Class;
      setClasses([...classes, newClass]);
      setFilteredClasses([...filteredClasses, newClass]);
    } else if (modalMode === 'edit' && currentClass) {
      const updatedClasses = classes.map(c => 
        c.id === currentClass.id ? { ...c, ...formData } : c
      );
      setClasses(updatedClasses);
      setFilteredClasses(updatedClasses);
    }
    
    setShowModal(false);
    setCurrentClass(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Handle nested fields
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof Class] as any),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle department selection
  const handleDepartmentChange = (code: string) => {
    const departments: Record<string, Department> = {
      SCI: { id: 'DEP-01', name: 'Science', code: 'SCI' },
      BUS: { id: 'DEP-02', name: 'Business', code: 'BUS' },
      ART: { id: 'DEP-03', name: 'Arts', code: 'ART' }
    };

    setFormData(prev => ({
      ...prev,
      department: departments[code]
    }));
  };

  // Table actions
  const actions = [
    {
      label: 'View',
      variant: 'primary',
      onClick: (row: Class) => handleView(row),
      icon: (
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path fill="currentColor" d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z" />
        </svg>
      )
    },
    {
      label: 'Edit',
      variant: 'secondary',
      onClick: (row: Class) => handleEdit(row),
      icon: (
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path fill="currentColor" d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />
        </svg>
      )
    },
    {
      label: 'Delete',
      variant: 'danger',
      onClick: (row: Class) => handleDelete(row.id),
      icon: (
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path fill="currentColor" d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
        </svg>
      )
    }
  ];

  // Render expanded row
  const renderExpandedRow = (row: Class) => {
    const utilizationRate = ((row.totalStudents / row.capacity) * 100).toFixed(1);
    const availableSeats = row.capacity - row.totalStudents;

    return (
      <div className={styles.expandedContent}>
        <div className={styles.expandedSection}>
          <h4>Class Details</h4>
          <div className={styles.detailGrid}>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Class ID:</span>
              <span className={styles.detailValue}>{row.id}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Level:</span>
              <span className={styles.detailValue}>{row.level}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Department Code:</span>
              <span className={styles.detailValue}>{row.department.code}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Created:</span>
              <span className={styles.detailValue}>{row.createdAt}</span>
            </div>
          </div>
        </div>
        
        <div className={styles.expandedSection}>
          <h4>Capacity Information</h4>
          <div className={styles.capacityInfo}>
            <div className={styles.capacityCard}>
              <span className={styles.capacityLabel}>Total Capacity</span>
              <span className={styles.capacityValue}>{row.capacity}</span>
            </div>
            <div className={styles.capacityCard}>
              <span className={styles.capacityLabel}>Current Students</span>
              <span className={styles.capacityValue}>{row.totalStudents}</span>
            </div>
            <div className={styles.capacityCard}>
              <span className={styles.capacityLabel}>Available Seats</span>
              <span className={styles.capacityValue}>{availableSeats}</span>
            </div>
            <div className={styles.capacityCard}>
              <span className={styles.capacityLabel}>Utilization</span>
              <span className={styles.capacityValue}>{utilizationRate}%</span>
            </div>
          </div>
        </div>

        <div className={styles.expandedSection}>
          <h4>Class Teacher</h4>
          <div className={styles.teacherInfo}>
            <div className={styles.teacherAvatarLarge}>
              {row.classTeacher.fullName.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <div className={styles.teacherNameLarge}>{row.classTeacher.fullName}</div>
              <div className={styles.teacherIdLarge}>Staff ID: {row.classTeacher.staffId}</div>
              <div className={styles.teacherIdLarge}>Teacher ID: {row.classTeacher.id}</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.pageContainer}>
      <Header 
        title="Class Management"
        subtitle="Manage classes, capacity, and class teacher assignments"
        customActions={
          <button className={styles.addButton} onClick={handleCreate}>
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
            </svg>
            Add New Class
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
            data={classes}
            onFilterChange={setFilteredClasses}
            searchKeys={['name', 'id', 'classTeacher.fullName', 'department.name', 'academicYear']}
            sortOptions={sortOptions}
            filterOptions={filterOptions}
            variant="default"
            showSearch={true}
            showSort={true}
            showFilter={true}
            searchPlaceholder="Search classes by name, teacher, department..."
            enableReset={true}
          />
        </div>

        {/* Table Section */}
        <div className={styles.tableSection}>
          <Table
            columns={columns}
            data={filteredClasses}
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
            emptyMessage="No classes found"
            loading={false}
          />
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>
                {modalMode === 'create' && 'Add New Class'}
                {modalMode === 'edit' && 'Edit Class'}
                {modalMode === 'view' && 'Class Details'}
              </h2>
              <button className={styles.closeButton} onClick={() => setShowModal(false)}>
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.modalBody}>
              <div className={styles.formGrid}>
                {/* Basic Information */}
                <div className={styles.formSection}>
                  <h3 className={styles.sectionTitle}>Basic Information</h3>
                  
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Class Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        disabled={modalMode === 'view'}
                        placeholder="Science 1"
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>Level *</label>
                      <select
                        name="level"
                        value={formData.level}
                        onChange={handleInputChange}
                        required
                        disabled={modalMode === 'view'}
                      >
                        <option value="Senior">Senior</option>
                        <option value="Junior">Junior</option>
                      </select>
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Department *</label>
                      <select
                        name="department.code"
                        value={formData.department?.code}
                        onChange={(e) => handleDepartmentChange(e.target.value)}
                        required
                        disabled={modalMode === 'view'}
                      >
                        <option value="">Select Department</option>
                        <option value="SCI">Science</option>
                        <option value="BUS">Business</option>
                        <option value="ART">Arts</option>
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label>Academic Year *</label>
                      <select
                        name="academicYear"
                        value={formData.academicYear}
                        onChange={handleInputChange}
                        required
                        disabled={modalMode === 'view'}
                      >
                        <option value="2024/2025">2024/2025</option>
                        <option value="2023/2024">2023/2024</option>
                        <option value="2022/2023">2022/2023</option>
                      </select>
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Status *</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      required
                      disabled={modalMode === 'view'}
                    >
                      <option value="Active">Active</option>
                      <option value="Archived">Archived</option>
                    </select>
                  </div>
                </div>

                {/* Capacity Information */}
                <div className={styles.formSection}>
                  <h3 className={styles.sectionTitle}>Capacity Information</h3>
                  
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Class Capacity *</label>
                      <input
                        type="number"
                        name="capacity"
                        value={formData.capacity}
                        onChange={handleInputChange}
                        required
                        min="1"
                        disabled={modalMode === 'view'}
                        placeholder="40"
                      />
                      <span className={styles.fieldHint}>Maximum number of students</span>
                    </div>

                    <div className={styles.formGroup}>
                      <label>Current Students</label>
                      <input
                        type="number"
                        name="totalStudents"
                        value={formData.totalStudents}
                        onChange={handleInputChange}
                        min="0"
                        disabled={modalMode === 'view'}
                        placeholder="0"
                      />
                      <span className={styles.fieldHint}>Number of enrolled students</span>
                    </div>
                  </div>

                  {formData.capacity && formData.totalStudents !== undefined && (
                    <div className={styles.capacityPreview}>
                      <div className={styles.previewLabel}>Utilization Preview</div>
                      <div className={styles.previewBar}>
                        <div 
                          className={styles.previewFill}
                          style={{ width: `${Math.min((formData.totalStudents / formData.capacity) * 100, 100)}%` }}
                        />
                      </div>
                      <div className={styles.previewStats}>
                        <span>{formData.totalStudents} / {formData.capacity} students</span>
                        <span>{((formData.totalStudents / formData.capacity) * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Class Teacher Information */}
                <div className={styles.formSection}>
                  <h3 className={styles.sectionTitle}>Class Teacher</h3>
                  
                  <div className={styles.formGroup}>
                    <label>Teacher Name *</label>
                    <input
                      type="text"
                      name="classTeacher.fullName"
                      value={formData.classTeacher?.fullName}
                      onChange={handleInputChange}
                      required
                      disabled={modalMode === 'view'}
                      placeholder="Mary Johnson"
                    />
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Staff ID *</label>
                      <input
                        type="text"
                        name="classTeacher.staffId"
                        value={formData.classTeacher?.staffId}
                        onChange={handleInputChange}
                        required
                        disabled={modalMode === 'view'}
                        placeholder="EMP-2024-006"
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>Teacher ID</label>
                      <input
                        type="text"
                        name="classTeacher.id"
                        value={formData.classTeacher?.id}
                        onChange={handleInputChange}
                        disabled={modalMode === 'view'}
                        placeholder="STF-1006"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {modalMode !== 'view' && (
                <div className={styles.modalFooter}>
                  <button 
                    type="button" 
                    className={styles.cancelButton}
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className={styles.submitButton}>
                    {modalMode === 'create' ? 'Create Class' : 'Update Class'}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className={styles.modalOverlay} onClick={() => setShowDeleteConfirm(false)}>
          <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.confirmIcon}>
              <svg viewBox="0 0 24 24" width="48" height="48">
                <path fill="currentColor" d="M13,14H11V10H13M13,18H11V16H13M1,21H23L12,2L1,21Z" />
              </svg>
            </div>
            <h3>Delete Class</h3>
            <p>Are you sure you want to delete this class? This action cannot be undone and will affect all enrolled students.</p>
            <div className={styles.confirmActions}>
              <button 
                className={styles.cancelButton}
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button 
                className={styles.deleteButton}
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassesAdminPage;