'use client';

import React, { useState, useMemo } from 'react';
import styles from './staff.module.css';
import { staffsMockData } from '@/data/staffMockData';
import Stats from '@/components/Stats/Stats';
import StatFilter from '@/components/StatFilter/StatFilter';
import Table from '@/components/Table/Table';
import Header from '@/components/Header/Header';

// Types
interface Staff {
  id: string;
  staffId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  gender: string;
  dateOfBirth: string;
  role: string;
  department: string;
  employment: {
    // type: 'Full-Time' | 'Part-Time' | 'Contract';
    // status: 'Active' | 'On Leave' | 'Suspended' | 'Resigned';
    type: string;
    status: string;
    hireDate: string;
    salary: number;
  };
  contact: {
    email: string;
    phone: string;
    address: string;
  };
  assignedClasses: Array<{ id: string; name: string; section: string }>;
  assignedCourses: Array<{ id: string; name: string; code: string }>;
  mainClass: { id: string; name: string; section: string } | null;
  mainCourse: { id: string; name: string; code: string } | null;
  workload: {
    weeklyHours: number;
    classesCount: number;
    coursesCount: number;
  };
  performance: {
    rating: number;
    reviews: number;
  };
  createdAt: string;
}

const StaffAdminPage = () => {
  const [staff, setStaff] = useState<Staff[]>(staffsMockData);
  const [filteredStaff, setFilteredStaff] = useState<Staff[]>(staff);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [currentStaff, setCurrentStaff] = useState<Staff | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'employment' | 'workload'>('basic');

  // Form state
  const [formData, setFormData] = useState<Partial<Staff>>({
    staffId: '',
    firstName: '',
    lastName: '',
    fullName: '',
    gender: 'Male',
    dateOfBirth: '',
    role: 'Teacher',
    department: 'Academics',
    employment: {
      type: 'Full-Time',
      status: 'Active',
      hireDate: '',
      salary: 0
    },
    contact: {
      email: '',
      phone: '',
      address: ''
    },
    assignedClasses: [],
    assignedCourses: [],
    mainClass: null,
    mainCourse: null,
    workload: {
      weeklyHours: 0,
      classesCount: 0,
      coursesCount: 0
    },
    performance: {
      rating: 0,
      reviews: 0
    }
  });

  // Calculate stats
  const stats = useMemo(() => {
    const activeStaff = staff.filter(s => s.employment.status === 'Active').length;
    const teachers = staff.filter(s => s.role === 'Teacher').length;
    const onLeave = staff.filter(s => s.employment.status === 'On Leave').length;
    
    // Calculate average rating
    const ratings = staff.map(s => s.performance.rating);
    const avgRating = ratings.length > 0
      ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
      : 0;

    // Calculate average salary
    const salaries = staff.map(s => s.employment.salary);
    const avgSalary = salaries.length > 0
      ? Math.round(salaries.reduce((a, b) => a + b, 0) / salaries.length)
      : 0;

    return [
      {
        id: 1,
        label: 'Total Staff',
        value: staff.length,
        trend: { value: 8, label: 'vs last month' },
        color: 'blue',
        type: 'teachers'
      },
      {
        id: 2,
        label: 'Active Staff',
        value: activeStaff,
        trend: { value: 5, label: 'currently active' },
        color: 'green',
        type: 'students'
      },
      {
        id: 3,
        label: 'Teachers',
        value: teachers,
        trend: { value: 2, label: 'new this term' },
        color: 'purple',
        type: 'classes'
      },
      {
        id: 4,
        label: 'Avg. Rating',
        value: avgRating,
        unit: '/5.0',
        trend: { value: 0.3, label: 'vs last review' },
        color: 'orange',
        type: 'attendance'
      }
    ];
  }, [staff]);

  // Table columns configuration
  const columns = [
    {
      header: 'Staff ID',
      accessor: 'staffId',
      sortable: true,
      width: '130px'
    },
    {
      header: 'Staff Member',
      accessor: 'fullName',
      sortable: true,
      render: (row: Staff) => (
        <div className={styles.staffCell}>
          <div className={styles.staffAvatar}>
            {row.firstName[0]}{row.lastName[0]}
          </div>
          <div>
            <div className={styles.staffName}>{row.fullName}</div>
            <div className={styles.staffEmail}>{row.contact.email}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Role',
      accessor: 'role',
      sortable: true,
      width: '150px',
      render: (row: Staff) => (
        <span className={`${styles.roleBadge} ${styles[`role${row.role.replace(/\s/g, '')}`]}`}>
          {row.role}
        </span>
      )
    },
    {
      header: 'Department',
      accessor: 'department',
      sortable: true,
      width: '130px'
    },
    {
      header: 'Employment',
      accessor: 'employment.type',
      sortable: true,
      width: '120px',
      render: (row: Staff) => (
        <span className={styles.employmentType}>
          {row.employment.type}
        </span>
      )
    },
    {
      header: 'Workload',
      accessor: 'workload.weeklyHours',
      sortable: true,
      width: '100px',
      render: (row: Staff) => (
        <div className={styles.workloadCell}>
          <span className={styles.hours}>{row.workload.weeklyHours}h</span>
          {row.role === 'Teacher' && (
            <span className={styles.classes}>{row.workload.classesCount} classes</span>
          )}
        </div>
      )
    },
    {
      header: 'Rating',
      accessor: 'performance.rating',
      sortable: true,
      width: '100px',
      render: (row: Staff) => (
        <div className={styles.ratingCell}>
          <span className={styles.ratingValue}>⭐ {row.performance.rating}</span>
          <span className={styles.reviewCount}>({row.performance.reviews})</span>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'employment.status',
      sortable: true,
      width: '110px',
      render: (row: Staff) => {
        const statusColors: Record<string, string> = {
          Active: styles.statusActive,
          'On Leave': styles.statusOnLeave,
          Suspended: styles.statusSuspended,
          Resigned: styles.statusResigned
        };
        return (
          <span className={`${styles.statusBadge} ${statusColors[row.employment.status]}`}>
            {row.employment.status}
          </span>
        );
      }
    }
  ];

  // Filter options
  const filterOptions = [
    {
      label: 'Status',
      value: 'employment.status',
      key: 'employment.status',
      type: 'select' as const,
      options: [
        { label: 'Active', value: 'Active' },
        { label: 'On Leave', value: 'On Leave' },
        { label: 'Suspended', value: 'Suspended' },
        { label: 'Resigned', value: 'Resigned' }
      ]
    },
    {
      label: 'Role',
      value: 'role',
      key: 'role',
      type: 'select' as const,
      options: [
        { label: 'Teacher', value: 'Teacher' },
        { label: 'Admin', value: 'Admin' },
        { label: 'Finance', value: 'Finance' },
        { label: 'Asset Manager', value: 'Asset Manager' },
        { label: 'Non Teaching Staff', value: 'Non Teaching Staff' }
      ]
    },
    {
      label: 'Department',
      value: 'department',
      key: 'department',
      type: 'select' as const,
      options: [
        { label: 'Academics', value: 'Academics' },
        { label: 'Administration', value: 'Administration' },
        { label: 'Finance', value: 'Finance' },
        { label: 'Operations', value: 'Operations' },
        { label: 'Maintenance', value: 'Maintenance' }
      ]
    },
    {
      label: 'Employment Type',
      value: 'employment.type',
      key: 'employment.type',
      type: 'select' as const,
      options: [
        { label: 'Full-Time', value: 'Full-Time' },
        { label: 'Part-Time', value: 'Part-Time' },
        { label: 'Contract', value: 'Contract' }
      ]
    }
  ];

  const sortOptions = [
    { label: 'Name (A-Z)', value: 'name-asc', key: 'fullName', order: 'asc' as const },
    { label: 'Name (Z-A)', value: 'name-desc', key: 'fullName', order: 'desc' as const },
    { label: 'Staff ID (Asc)', value: 'id-asc', key: 'staffId', order: 'asc' as const },
    { label: 'Staff ID (Desc)', value: 'id-desc', key: 'staffId', order: 'desc' as const },
    { label: 'Hire Date (Newest)', value: 'hire-desc', key: 'employment.hireDate', order: 'desc' as const },
    { label: 'Hire Date (Oldest)', value: 'hire-asc', key: 'employment.hireDate', order: 'asc' as const },
    { label: 'Rating (Highest)', value: 'rating-desc', key: 'performance.rating', order: 'desc' as const },
    { label: 'Rating (Lowest)', value: 'rating-asc', key: 'performance.rating', order: 'asc' as const }
  ];

  // CRUD Operations
  const handleCreate = () => {
    setModalMode('create');
    setActiveTab('basic');
    setFormData({
      staffId: '',
      firstName: '',
      lastName: '',
      fullName: '',
      gender: 'Male',
      dateOfBirth: '',
      role: 'Teacher',
      department: 'Academics',
      employment: {
        type: 'Full-Time',
        status: 'Active',
        hireDate: '',
        salary: 0
      },
      contact: {
        email: '',
        phone: '',
        address: ''
      },
      assignedClasses: [],
      assignedCourses: [],
      mainClass: null,
      mainCourse: null,
      workload: {
        weeklyHours: 0,
        classesCount: 0,
        coursesCount: 0
      },
      performance: {
        rating: 0,
        reviews: 0
      }
    });
    setShowModal(true);
  };

  const handleEdit = (staffMember: Staff) => {
    setModalMode('edit');
    setActiveTab('basic');
    setCurrentStaff(staffMember);
    setFormData(staffMember);
    setShowModal(true);
  };

  const handleView = (staffMember: Staff) => {
    setModalMode('view');
    setActiveTab('basic');
    setCurrentStaff(staffMember);
    setFormData(staffMember);
    setShowModal(true);
  };

  const handleDelete = (staffId: string) => {
    setStaffToDelete(staffId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (staffToDelete) {
      setStaff(staff.filter(s => s.id !== staffToDelete));
      setFilteredStaff(filteredStaff.filter(s => s.id !== staffToDelete));
      setShowDeleteConfirm(false);
      setStaffToDelete(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Auto-generate fullName
    const fullName = `${formData.firstName} ${formData.lastName}`;
    
    if (modalMode === 'create') {
      const newStaff: Staff = {
        id: `STF-${Date.now()}`,
        ...formData,
        fullName,
        createdAt: new Date().toISOString().split('T')[0]
      } as Staff;
      setStaff([...staff, newStaff]);
      setFilteredStaff([...filteredStaff, newStaff]);
    } else if (modalMode === 'edit' && currentStaff) {
      const updatedStaff = staff.map(s => 
        s.id === currentStaff.id ? { ...s, ...formData, fullName } : s
      );
      setStaff(updatedStaff);
      setFilteredStaff(updatedStaff);
    }
    
    setShowModal(false);
    setCurrentStaff(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Handle nested fields
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof Staff] as any),
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
      onClick: (row: Staff) => handleView(row),
      icon: (
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path fill="currentColor" d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z" />
        </svg>
      )
    },
    {
      label: 'Edit',
      variant: 'secondary',
      onClick: (row: Staff) => handleEdit(row),
      icon: (
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path fill="currentColor" d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />
        </svg>
      )
    },
    {
      label: 'Delete',
      variant: 'danger',
      onClick: (row: Staff) => handleDelete(row.id),
      icon: (
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path fill="currentColor" d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
        </svg>
      )
    }
  ];

  // Render expanded row for teachers
  const renderExpandedRow = (row: Staff) => {
    if (row.role !== 'Teacher') {
      return (
        <div className={styles.expandedContent}>
          <p className={styles.noData}>No additional details available for this role.</p>
        </div>
      );
    }

    return (
      <div className={styles.expandedContent}>
        <div className={styles.expandedSection}>
          <h4>Assigned Classes</h4>
          {row.assignedClasses.length > 0 ? (
            <div className={styles.classList}>
              {row.assignedClasses.map(cls => (
                <span key={cls.id} className={styles.classChip}>
                  {cls.name} - Section {cls.section}
                </span>
              ))}
            </div>
          ) : (
            <p className={styles.noData}>No classes assigned</p>
          )}
        </div>
        
        <div className={styles.expandedSection}>
          <h4>Assigned Courses</h4>
          {row.assignedCourses.length > 0 ? (
            <div className={styles.courseList}>
              {row.assignedCourses.map(course => (
                <span key={course.id} className={styles.courseChip}>
                  {course.name} ({course.code})
                </span>
              ))}
            </div>
          ) : (
            <p className={styles.noData}>No courses assigned</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.pageContainer}>
      <Header 
        title="Staff Management"
        subtitle="Manage teaching and non-teaching staff, assignments, and performance"
        customActions={
          <button className={styles.addButton} onClick={handleCreate}>
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
            </svg>
            Add New Staff
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
            data={staff}
            onFilterChange={setFilteredStaff}
            searchKeys={['fullName', 'staffId', 'contact.email', 'contact.phone', 'role', 'department']}
            sortOptions={sortOptions}
            filterOptions={filterOptions}
            variant="default"
            showSearch={true}
            showSort={true}
            showFilter={true}
            searchPlaceholder="Search staff by name, ID, email, role..."
            enableReset={true}
          />
        </div>

        {/* Table Section */}
        <div className={styles.tableSection}>
          <Table
            columns={columns}
            data={filteredStaff}
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
            emptyMessage="No staff members found"
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
                {modalMode === 'create' && 'Add New Staff Member'}
                {modalMode === 'edit' && 'Edit Staff Member'}
                {modalMode === 'view' && 'Staff Member Details'}
              </h2>
              <button className={styles.closeButton} onClick={() => setShowModal(false)}>
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                </svg>
              </button>
            </div>

            {/* Tabs */}
            {modalMode !== 'view' && (
              <div className={styles.modalTabs}>
                <button 
                  className={`${styles.tab} ${activeTab === 'basic' ? styles.activeTab : ''}`}
                  onClick={() => setActiveTab('basic')}
                >
                  Basic Info
                </button>
                <button 
                  className={`${styles.tab} ${activeTab === 'employment' ? styles.activeTab : ''}`}
                  onClick={() => setActiveTab('employment')}
                >
                  Employment
                </button>
                <button 
                  className={`${styles.tab} ${activeTab === 'workload' ? styles.activeTab : ''}`}
                  onClick={() => setActiveTab('workload')}
                >
                  Workload & Performance
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className={styles.modalBody}>
              {/* Basic Information Tab */}
              {(activeTab === 'basic' || modalMode === 'view') && (
                <div className={styles.tabContent}>
                  <div className={styles.formSection}>
                    <h3 className={styles.sectionTitle}>Personal Information</h3>
                    
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label>First Name *</label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required
                          disabled={modalMode === 'view'}
                          placeholder="James"
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label>Last Name *</label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required
                          disabled={modalMode === 'view'}
                          placeholder="Anderson"
                        />
                      </div>
                    </div>

                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label>Staff ID *</label>
                        <input
                          type="text"
                          name="staffId"
                          value={formData.staffId}
                          onChange={handleInputChange}
                          required
                          disabled={modalMode === 'view'}
                          placeholder="EMP-2024-001"
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label>Date of Birth</label>
                        <input
                          type="date"
                          name="dateOfBirth"
                          value={formData.dateOfBirth}
                          onChange={handleInputChange}
                          disabled={modalMode === 'view'}
                        />
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label>Gender</label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        disabled={modalMode === 'view'}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                  </div>

                  <div className={styles.formSection}>
                    <h3 className={styles.sectionTitle}>Contact Information</h3>
                    
                    <div className={styles.formGroup}>
                      <label>Email *</label>
                      <input
                        type="email"
                        name="contact.email"
                        value={formData.contact?.email}
                        onChange={handleInputChange}
                        required
                        disabled={modalMode === 'view'}
                        placeholder="staff@school.com"
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>Phone Number</label>
                      <input
                        type="tel"
                        name="contact.phone"
                        value={formData.contact?.phone}
                        onChange={handleInputChange}
                        disabled={modalMode === 'view'}
                        placeholder="08011112222"
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>Address</label>
                      <textarea
                        name="contact.address"
                        value={formData.contact?.address}
                        onChange={handleInputChange}
                        disabled={modalMode === 'view'}
                        rows={3}
                        placeholder="Street address, city, state"
                      />
                    </div>
                  </div>

                  <div className={styles.formSection}>
                    <h3 className={styles.sectionTitle}>Role & Department</h3>
                    
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label>Role *</label>
                        <select
                          name="role"
                          value={formData.role}
                          onChange={handleInputChange}
                          required
                          disabled={modalMode === 'view'}
                        >
                          <option value="Teacher">Teacher</option>
                          <option value="Admin">Admin</option>
                          <option value="Finance">Finance</option>
                          <option value="Asset Manager">Asset Manager</option>
                          <option value="Non Teaching Staff">Non Teaching Staff</option>
                        </select>
                      </div>

                      <div className={styles.formGroup}>
                        <label>Department *</label>
                        <select
                          name="department"
                          value={formData.department}
                          onChange={handleInputChange}
                          required
                          disabled={modalMode === 'view'}
                        >
                          <option value="Academics">Academics</option>
                          <option value="Administration">Administration</option>
                          <option value="Finance">Finance</option>
                          <option value="Operations">Operations</option>
                          <option value="Maintenance">Maintenance</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Employment Tab */}
              {activeTab === 'employment' && modalMode !== 'view' && (
                <div className={styles.tabContent}>
                  <div className={styles.formSection}>
                    <h3 className={styles.sectionTitle}>Employment Details</h3>
                    
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label>Employment Type *</label>
                        <select
                          name="employment.type"
                          value={formData.employment?.type}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="Full-Time">Full-Time</option>
                          <option value="Part-Time">Part-Time</option>
                          <option value="Contract">Contract</option>
                        </select>
                      </div>

                      <div className={styles.formGroup}>
                        <label>Employment Status *</label>
                        <select
                          name="employment.status"
                          value={formData.employment?.status}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="Active">Active</option>
                          <option value="On Leave">On Leave</option>
                          <option value="Suspended">Suspended</option>
                          <option value="Resigned">Resigned</option>
                        </select>
                      </div>
                    </div>

                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label>Hire Date *</label>
                        <input
                          type="date"
                          name="employment.hireDate"
                          value={formData.employment?.hireDate}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label>Salary (₦) *</label>
                        <input
                          type="number"
                          name="employment.salary"
                          value={formData.employment?.salary}
                          onChange={handleInputChange}
                          required
                          min="0"
                          placeholder="250000"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Workload & Performance Tab */}
              {activeTab === 'workload' && modalMode !== 'view' && (
                <div className={styles.tabContent}>
                  <div className={styles.formSection}>
                    <h3 className={styles.sectionTitle}>Workload Information</h3>
                    
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label>Weekly Hours</label>
                        <input
                          type="number"
                          name="workload.weeklyHours"
                          value={formData.workload?.weeklyHours}
                          onChange={handleInputChange}
                          min="0"
                          placeholder="40"
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label>Classes Count</label>
                        <input
                          type="number"
                          name="workload.classesCount"
                          value={formData.workload?.classesCount}
                          onChange={handleInputChange}
                          min="0"
                          placeholder="2"
                        />
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label>Courses Count</label>
                      <input
                        type="number"
                        name="workload.coursesCount"
                        value={formData.workload?.coursesCount}
                        onChange={handleInputChange}
                        min="0"
                        placeholder="2"
                      />
                    </div>
                  </div>

                  <div className={styles.formSection}>
                    <h3 className={styles.sectionTitle}>Performance</h3>
                    
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label>Rating (0-5)</label>
                        <input
                          type="number"
                          name="performance.rating"
                          value={formData.performance?.rating}
                          onChange={handleInputChange}
                          min="0"
                          max="5"
                          step="0.1"
                          placeholder="4.5"
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label>Number of Reviews</label>
                        <input
                          type="number"
                          name="performance.reviews"
                          value={formData.performance?.reviews}
                          onChange={handleInputChange}
                          min="0"
                          placeholder="24"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* View Mode - Show All Data */}
              {modalMode === 'view' && (
                <div className={styles.viewMode}>
                  <div className={styles.viewSection}>
                    <h3 className={styles.sectionTitle}>Employment Details</h3>
                    <div className={styles.viewGrid}>
                      <div className={styles.viewItem}>
                        <span className={styles.viewLabel}>Type:</span>
                        <span className={styles.viewValue}>{formData.employment?.type}</span>
                      </div>
                      <div className={styles.viewItem}>
                        <span className={styles.viewLabel}>Status:</span>
                        <span className={styles.viewValue}>{formData.employment?.status}</span>
                      </div>
                      <div className={styles.viewItem}>
                        <span className={styles.viewLabel}>Hire Date:</span>
                        <span className={styles.viewValue}>{formData.employment?.hireDate}</span>
                      </div>
                      <div className={styles.viewItem}>
                        <span className={styles.viewLabel}>Salary:</span>
                        <span className={styles.viewValue}>₦{formData.employment?.salary?.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.viewSection}>
                    <h3 className={styles.sectionTitle}>Workload & Performance</h3>
                    <div className={styles.viewGrid}>
                      <div className={styles.viewItem}>
                        <span className={styles.viewLabel}>Weekly Hours:</span>
                        <span className={styles.viewValue}>{formData.workload?.weeklyHours}h</span>
                      </div>
                      <div className={styles.viewItem}>
                        <span className={styles.viewLabel}>Classes:</span>
                        <span className={styles.viewValue}>{formData.workload?.classesCount}</span>
                      </div>
                      <div className={styles.viewItem}>
                        <span className={styles.viewLabel}>Courses:</span>
                        <span className={styles.viewValue}>{formData.workload?.coursesCount}</span>
                      </div>
                      <div className={styles.viewItem}>
                        <span className={styles.viewLabel}>Rating:</span>
                        <span className={styles.viewValue}>⭐ {formData.performance?.rating} ({formData.performance?.reviews} reviews)</span>
                      </div>
                    </div>
                  </div>

                  {formData.role === 'Teacher' && formData.assignedClasses && formData.assignedClasses.length > 0 && (
                    <div className={styles.viewSection}>
                      <h3 className={styles.sectionTitle}>Assigned Classes</h3>
                      <div className={styles.chipContainer}>
                        {formData.assignedClasses.map(cls => (
                          <span key={cls.id} className={styles.viewChip}>
                            {cls.name} - Section {cls.section}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {formData.role === 'Teacher' && formData.assignedCourses && formData.assignedCourses.length > 0 && (
                    <div className={styles.viewSection}>
                      <h3 className={styles.sectionTitle}>Assigned Courses</h3>
                      <div className={styles.chipContainer}>
                        {formData.assignedCourses.map(course => (
                          <span key={course.id} className={styles.viewChip}>
                            {course.name} ({course.code})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

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
                    {modalMode === 'create' ? 'Create Staff Member' : 'Update Staff Member'}
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
            <h3>Delete Staff Member</h3>
            <p>Are you sure you want to delete this staff member? This action cannot be undone.</p>
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

export default StaffAdminPage;