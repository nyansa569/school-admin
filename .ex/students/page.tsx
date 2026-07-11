'use client';

import { gradeBooksMockData } from '@/data/studentAttendance';
import { studentsAttendancesMockData } from '@/data/studentMockData';
import React, { useState, useMemo } from 'react';

import styles from './page.module.css';
import Header from '@/components/Header/Header';
import StatFilter from '@/components/StatFilter/StatFilter';
import Table from '@/components/Table/Table';
import Stats from '@/components/Stats/Stats';
// Types
interface Student {
  id: string;
  fullName: string;
  admissionNumber: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  class?: string;
  guardianName?: string;
  guardianPhone?: string;
  address?: string;
  enrollmentDate?: string;
  status?: 'Active' | 'Inactive' | 'Graduated' | 'Suspended';
}

const StudentAdminPage = () => {
  // Extract unique students from mock data
  const initialStudents: Student[] = useMemo(() => {
    const studentMap = new Map();
    
    // From attendance data
    studentsAttendancesMockData.forEach(record => {
      if (!studentMap.has(record.student.id)) {
        studentMap.set(record.student.id, {
          id: record.student.id,
          fullName: record.student.fullName,
          admissionNumber: record.student.admissionNumber,
          email: `${record.student.fullName.toLowerCase().replace(' ', '.')}@school.edu`,
          phone: `+233 ${Math.floor(Math.random() * 900000000 + 100000000)}`,
          dateOfBirth: '2008-05-15',
          gender: Math.random() > 0.5 ? 'Male' : 'Female',
          class: 'Science 1',
          guardianName: 'Guardian Name',
          guardianPhone: `+233 ${Math.floor(Math.random() * 900000000 + 100000000)}`,
          address: 'Accra, Ghana',
          enrollmentDate: '2024-09-01',
          status: 'Active' as const
        });
      }
    });
    
    // From gradebook data
    gradeBooksMockData.forEach(record => {
      if (!studentMap.has(record.student.id)) {
        studentMap.set(record.student.id, {
          id: record.student.id,
          fullName: record.student.fullName,
          admissionNumber: record.student.admissionNumber,
          email: `${record.student.fullName.toLowerCase().replace(' ', '.')}@school.edu`,
          phone: `+233 ${Math.floor(Math.random() * 900000000 + 100000000)}`,
          dateOfBirth: '2008-05-15',
          gender: Math.random() > 0.5 ? 'Male' : 'Female',
          class: record.class.name,
          guardianName: 'Guardian Name',
          guardianPhone: `+233 ${Math.floor(Math.random() * 900000000 + 100000000)}`,
          address: 'Accra, Ghana',
          enrollmentDate: '2024-09-01',
          status: 'Active' as const
        });
      }
    });
    
    return Array.from(studentMap.values());
  }, []);

  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>(students);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<Student>>({
    fullName: '',
    admissionNumber: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: 'Male',
    class: '',
    guardianName: '',
    guardianPhone: '',
    address: '',
    enrollmentDate: '',
    status: 'Active'
  });

  // Calculate stats
  const stats = useMemo(() => {
    const activeStudents = students.filter(s => s.status === 'Active').length;
    const inactiveStudents = students.filter(s => s.status === 'Inactive').length;
    const graduatedStudents = students.filter(s => s.status === 'Graduated').length;
    const suspendedStudents = students.filter(s => s.status === 'Suspended').length;

    // Calculate attendance stats
    const attendanceRecords = studentsAttendancesMockData;
    const presentCount = attendanceRecords.filter(r => r.status === 'Present').length;
    const attendanceRate = attendanceRecords.length > 0 
      ? ((presentCount / attendanceRecords.length) * 100).toFixed(1)
      : 0;

    // Calculate average grade
    const gradePoints = gradeBooksMockData.map(g => g.grading.gradePoint);
    const avgGrade = gradePoints.length > 0
      ? (gradePoints.reduce((a, b) => a + b, 0) / gradePoints.length).toFixed(2)
      : 0;

    return [
      {
        id: 1,
        label: 'Total Students',
        value: students.length,
        trend: { value: 12, label: 'vs last month' },
        color: 'blue',
        type: 'students'
      },
      {
        id: 2,
        label: 'Active Students',
        value: activeStudents,
        trend: { value: 5, label: 'this month' },
        color: 'green',
        type: 'students'
      },
      {
        id: 3,
        label: 'Attendance Rate',
        value: `${attendanceRate}%`,
        trend: { value: 3, label: 'vs last week' },
        color: 'purple',
        type: 'attendance'
      },
      {
        id: 4,
        label: 'Average GPA',
        value: avgGrade,
        trend: { value: 0.2, label: 'vs last term' },
        color: 'orange',
        type: 'revenue'
      }
    ];
  }, [students]);

  // Table columns configuration
  const columns = [
    {
      header: 'Admission No.',
      accessor: 'admissionNumber',
      sortable: true,
      width: '140px'
    },
    {
      header: 'Full Name',
      accessor: 'fullName',
      sortable: true,
      render: (row: Student) => (
        <div className={styles.studentCell}>
          <div className={styles.studentAvatar}>
            {row.fullName.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <div className={styles.studentName}>{row.fullName}</div>
            <div className={styles.studentEmail}>{row.email}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Class',
      accessor: 'class',
      sortable: true,
      width: '120px'
    },
    {
      header: 'Gender',
      accessor: 'gender',
      sortable: true,
      width: '100px'
    },
    {
      header: 'Phone',
      accessor: 'phone',
      width: '140px'
    },
    {
      header: 'Guardian',
      accessor: 'guardianName',
      width: '150px'
    },
    {
      header: 'Status',
      accessor: 'status',
      sortable: true,
      width: '120px',
      render: (row: Student) => {
        const statusColors: Record<string, string> = {
          Active: styles.statusActive,
          Inactive: styles.statusInactive,
          Graduated: styles.statusGraduated,
          Suspended: styles.statusSuspended
        };
        return (
          <span className={`${styles.statusBadge} ${statusColors[row.status || 'Active']}`}>
            {row.status}
          </span>
        );
      }
    }
  ];

  // Filter options
  const filterOptions = [
    {
      label: 'Status',
      value: 'status',
      key: 'status',
      type: 'select' as const,
      options: [
        { label: 'Active', value: 'Active' },
        { label: 'Inactive', value: 'Inactive' },
        { label: 'Graduated', value: 'Graduated' },
        { label: 'Suspended', value: 'Suspended' }
      ]
    },
    {
      label: 'Gender',
      value: 'gender',
      key: 'gender',
      type: 'select' as const,
      options: [
        { label: 'Male', value: 'Male' },
        { label: 'Female', value: 'Female' }
      ]
    },
    {
      label: 'Class',
      value: 'class',
      key: 'class',
      type: 'select' as const,
      options: [
        { label: 'Science 1', value: 'Science 1' },
        { label: 'Science 2', value: 'Science 2' },
        { label: 'Arts 1', value: 'Arts 1' }
      ]
    }
  ];

  const sortOptions = [
    { label: 'Name (A-Z)', value: 'name-asc', key: 'fullName', order: 'asc' as const },
    { label: 'Name (Z-A)', value: 'name-desc', key: 'fullName', order: 'desc' as const },
    { label: 'Admission No. (Asc)', value: 'admission-asc', key: 'admissionNumber', order: 'asc' as const },
    { label: 'Admission No. (Desc)', value: 'admission-desc', key: 'admissionNumber', order: 'desc' as const },
    { label: 'Enrollment Date (Newest)', value: 'date-desc', key: 'enrollmentDate', order: 'desc' as const },
    { label: 'Enrollment Date (Oldest)', value: 'date-asc', key: 'enrollmentDate', order: 'asc' as const }
  ];

  // CRUD Operations
  const handleCreate = () => {
    setModalMode('create');
    setFormData({
      fullName: '',
      admissionNumber: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: 'Male',
      class: '',
      guardianName: '',
      guardianPhone: '',
      address: '',
      enrollmentDate: '',
      status: 'Active'
    });
    setShowModal(true);
  };

  const handleEdit = (student: Student) => {
    setModalMode('edit');
    setCurrentStudent(student);
    setFormData(student);
    setShowModal(true);
  };

  const handleView = (student: Student) => {
    setModalMode('view');
    setCurrentStudent(student);
    setFormData(student);
    setShowModal(true);
  };

  const handleDelete = (studentId: string) => {
    setStudentToDelete(studentId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (studentToDelete) {
      setStudents(students.filter(s => s.id !== studentToDelete));
      setFilteredStudents(filteredStudents.filter(s => s.id !== studentToDelete));
      setShowDeleteConfirm(false);
      setStudentToDelete(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (modalMode === 'create') {
      const newStudent: Student = {
        ...formData as Student
      };
      setStudents([...students, newStudent]);
      setFilteredStudents([...filteredStudents, newStudent]);
    } else if (modalMode === 'edit' && currentStudent) {
      const updatedStudents = students.map(s => 
        s.id === currentStudent.id ? { ...s, ...formData } : s
      );
      setStudents(updatedStudents);
      setFilteredStudents(updatedStudents);
    }
    
    setShowModal(false);
    setCurrentStudent(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Table actions
  const actions = [
    {
      label: 'View',
      variant: 'primary',
      onClick: (row: Student) => handleView(row),
      icon: (
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path fill="currentColor" d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z" />
        </svg>
      )
    },
    {
      label: 'Edit',
      variant: 'secondary',
      onClick: (row: Student) => handleEdit(row),
      icon: (
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path fill="currentColor" d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />
        </svg>
      )
    },
    {
      label: 'Delete',
      variant: 'danger',
      onClick: (row: Student) => handleDelete(row.id),
      icon: (
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path fill="currentColor" d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
        </svg>
      )
    }
  ];

  return (
    <div className={styles.pageContainer}>
      <Header 
        title="Student Management"
        subtitle="Manage student records, attendance, and academic performance"
        customActions={
          <button className={styles.addButton} onClick={handleCreate}>
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
            </svg>
            Add New Student
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
            data={students}
            onFilterChange={setFilteredStudents}
            searchKeys={['fullName', 'admissionNumber', 'email', 'phone', 'guardianName']}
            sortOptions={sortOptions}
            filterOptions={filterOptions}
            variant="default"
            showSearch={true}
            showSort={true}
            showFilter={true}
            searchPlaceholder="Search students by name, admission no., email..."
            enableReset={true}
          />
        </div>

        {/* Table Section */}
        <div className={styles.tableSection}>
          <Table
            columns={columns}
            data={filteredStudents}
            variant="default"
            size="md"
            stickyHeader={true}
            sortable={true}
            pagination={true}
            pageSize={10}
            // actions={actions}
            showRowNumbers={true}
            emptyMessage="No students found"
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
                {modalMode === 'create' && 'Add New Student'}
                {modalMode === 'edit' && 'Edit Student'}
                {modalMode === 'view' && 'Student Details'}
              </h2>
              <button className={styles.closeButton} onClick={() => setShowModal(false)}>
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.modalBody}>
              <div className={styles.formGrid}>
                {/* Personal Information */}
                <div className={styles.formSection}>
                  <h3 className={styles.sectionTitle}>Personal Information</h3>
                  
                  <div className={styles.formGroup}>
                    <label>Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      disabled={modalMode === 'view'}
                      placeholder="John Doe"
                    />
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Admission Number *</label>
                      <input
                        type="text"
                        name="admissionNumber"
                        value={formData.admissionNumber}
                        onChange={handleInputChange}
                        required
                        disabled={modalMode === 'view'}
                        placeholder="ADM-2024-001"
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

                  <div className={styles.formRow}>
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

                    <div className={styles.formGroup}>
                      <label>Class</label>
                      <select
                        name="class"
                        value={formData.class}
                        onChange={handleInputChange}
                        disabled={modalMode === 'view'}
                      >
                        <option value="">Select Class</option>
                        <option value="Science 1">Science 1</option>
                        <option value="Science 2">Science 2</option>
                        <option value="Arts 1">Arts 1</option>
                        <option value="Arts 2">Arts 2</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className={styles.formSection}>
                  <h3 className={styles.sectionTitle}>Contact Information</h3>
                  
                  <div className={styles.formGroup}>
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={modalMode === 'view'}
                      placeholder="student@school.edu"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={modalMode === 'view'}
                      placeholder="+233 123456789"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Address</label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      disabled={modalMode === 'view'}
                      rows={3}
                      placeholder="Street address, city, region"
                    />
                  </div>
                </div>

                {/* Guardian Information */}
                <div className={styles.formSection}>
                  <h3 className={styles.sectionTitle}>Guardian Information</h3>
                  
                  <div className={styles.formGroup}>
                    <label>Guardian Name</label>
                    <input
                      type="text"
                      name="guardianName"
                      value={formData.guardianName}
                      onChange={handleInputChange}
                      disabled={modalMode === 'view'}
                      placeholder="Guardian full name"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Guardian Phone</label>
                    <input
                      type="tel"
                      name="guardianPhone"
                      value={formData.guardianPhone}
                      onChange={handleInputChange}
                      disabled={modalMode === 'view'}
                      placeholder="+233 123456789"
                    />
                  </div>
                </div>

                {/* Enrollment Information */}
                <div className={styles.formSection}>
                  <h3 className={styles.sectionTitle}>Enrollment Information</h3>
                  
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Enrollment Date</label>
                      <input
                        type="date"
                        name="enrollmentDate"
                        value={formData.enrollmentDate}
                        onChange={handleInputChange}
                        disabled={modalMode === 'view'}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>Status</label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        disabled={modalMode === 'view'}
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Graduated">Graduated</option>
                        <option value="Suspended">Suspended</option>
                      </select>
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
                    {modalMode === 'create' ? 'Create Student' : 'Update Student'}
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
            <h3>Delete Student</h3>
            <p>Are you sure you want to delete this student? This action cannot be undone.</p>
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

export default StudentAdminPage;