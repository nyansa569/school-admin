'use client';

import React, { useState, useMemo } from 'react';
import styles from './assessments.module.css';
import { assessmentsMockData } from '@/data/assessmentMockData';
import StatFilter from '@/components/StatFilter/StatFilter';
import Header from '@/components/Header/Header';
import Stats from '@/components/Stats/Stats';
import Table from '@/components/Table/Table';

// Types
interface Course {
  id: string;
  name: string;
  code: string;
}

interface Class {
  id: string;
  name: string;
}

interface Teacher {
  id: string;
  fullName: string;
}

interface Assessment {
  id: string;
  title: string;
  // type: 'Assignment' | 'Test' | 'Quiz' | 'Midterm' | 'Exam' | 'Practical';
  type: string;
  course: Course;
  class: Class;
  teacher: Teacher;
  academicYear: string;
  term: string;
  maxScore: number;
  weight: number;
  dateGiven: string;
  dueDate: string;
  published: boolean;
  createdAt: string;
}

const AssessmentsAdminPage = () => {
  const [assessments, setAssessments] = useState<Assessment[]>(assessmentsMockData);
  const [filteredAssessments, setFilteredAssessments] = useState<Assessment[]>(assessments);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [currentAssessment, setCurrentAssessment] = useState<Assessment | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [assessmentToDelete, setAssessmentToDelete] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<Assessment>>({
    title: '',
    type: 'Test',
    course: {
      id: '',
      name: '',
      code: ''
    },
    class: {
      id: '',
      name: ''
    },
    teacher: {
      id: '',
      fullName: ''
    },
    academicYear: '2025/2026',
    term: 'First Term',
    maxScore: 100,
    weight: 10,
    dateGiven: '',
    dueDate: '',
    published: false
  });

  // Calculate stats
  const stats = useMemo(() => {
    const totalAssessments = assessments.length;
    const published = assessments.filter(a => a.published).length;
    const unpublished = totalAssessments - published;
    
    // Count by type
    const tests = assessments.filter(a => a.type === 'Test').length;
    const assignments = assessments.filter(a => a.type === 'Assignment').length;
    const exams = assessments.filter(a => a.type === 'Exam' || a.type === 'Midterm').length;

    // Calculate upcoming (due dates in future)
    const today = new Date();
    const upcoming = assessments.filter(a => new Date(a.dueDate) > today).length;

    // Calculate average weight
    const avgWeight = assessments.length > 0
      ? (assessments.reduce((sum, a) => sum + a.weight, 0) / assessments.length).toFixed(1)
      : 0;

    return [
      {
        id: 1,
        label: 'Total Assessments',
        value: totalAssessments,
        secondaryValue: published,
        secondaryLabel: 'Published',
        trend: { value: 12, label: 'this term' },
        color: 'blue',
        type: 'classes'
      },
      {
        id: 2,
        label: 'Upcoming',
        value: upcoming,
        secondaryValue: unpublished,
        secondaryLabel: 'Draft',
        trend: { value: 5, label: 'this week' },
        color: 'orange',
        type: 'events'
      },
      {
        id: 3,
        label: 'Tests & Quizzes',
        value: tests,
        secondaryValue: assignments,
        secondaryLabel: 'Assignments',
        trend: { value: 3, label: 'vs last term' },
        color: 'purple',
        type: 'classes'
      },
      {
        id: 4,
        label: 'Avg. Weight',
        value: `${avgWeight}%`,
        secondaryValue: exams,
        secondaryLabel: 'Major Exams',
        trend: { value: 2, label: 'balanced' },
        color: 'green',
        type: 'attendance'
      }
    ];
  }, [assessments]);

  // Table columns configuration
  const columns = [
    {
      header: 'Assessment ID',
      accessor: 'id',
      sortable: true,
      width: '120px',
      render: (row: Assessment) => (
        <span className={styles.assessmentId}>{row.id}</span>
      )
    },
    {
      header: 'Title',
      accessor: 'title',
      sortable: true,
      render: (row: Assessment) => (
        <div className={styles.titleCell}>
          <div className={styles.typeIcon}>
            {row.type === 'Test' && '📝'}
            {row.type === 'Assignment' && '📋'}
            {row.type === 'Quiz' && '❓'}
            {row.type === 'Midterm' && '📚'}
            {row.type === 'Exam' && '📖'}
            {row.type === 'Practical' && '🔬'}
          </div>
          <div>
            <div className={styles.assessmentTitle}>{row.title}</div>
            <div className={styles.assessmentCourse}>{row.course.name}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Type',
      accessor: 'type',
      sortable: true,
      width: '120px',
      render: (row: Assessment) => {
        const typeColors: Record<string, string> = {
          Assignment: styles.typeAssignment,
          Test: styles.typeTest,
          Quiz: styles.typeQuiz,
          Midterm: styles.typeMidterm,
          Exam: styles.typeExam,
          Practical: styles.typePractical
        };
        return (
          <span className={`${styles.typeBadge} ${typeColors[row.type]}`}>
            {row.type}
          </span>
        );
      }
    },
    {
      header: 'Class',
      accessor: 'class.name',
      sortable: true,
      width: '120px'
    },
    {
      header: 'Teacher',
      accessor: 'teacher.fullName',
      sortable: true,
      width: '150px',
      render: (row: Assessment) => (
        <div className={styles.teacherCell}>
          <div className={styles.teacherAvatar}>
            {row.teacher.fullName.split(' ').map(n => n[0]).join('')}
          </div>
          <span>{row.teacher.fullName}</span>
        </div>
      )
    },
    {
      header: 'Score / Weight',
      accessor: 'maxScore',
      sortable: true,
      width: '130px',
      render: (row: Assessment) => (
        <div className={styles.scoreCell}>
          <span className={styles.maxScore}>{row.maxScore} pts</span>
          <span className={styles.weight}>{row.weight}% weight</span>
        </div>
      )
    },
    {
      header: 'Due Date',
      accessor: 'dueDate',
      sortable: true,
      width: '110px',
      render: (row: Assessment) => {
        const isOverdue = new Date(row.dueDate) < new Date() && row.published;
        return (
          <div className={styles.dateCell}>
            <span className={isOverdue ? styles.overdue : styles.dateText}>
              {row.dueDate}
            </span>
            {isOverdue && <span className={styles.overdueLabel}>Overdue</span>}
          </div>
        );
      }
    },
    {
      header: 'Status',
      accessor: 'published',
      sortable: true,
      width: '100px',
      render: (row: Assessment) => (
        <span className={`${styles.statusBadge} ${row.published ? styles.statusPublished : styles.statusDraft}`}>
          {row.published ? 'Published' : 'Draft'}
        </span>
      )
    }
  ];

  // Filter options
  const filterOptions = [
    {
      label: 'Type',
      value: 'type',
      key: 'type',
      type: 'select' as const,
      options: [
        { label: 'Assignment', value: 'Assignment' },
        { label: 'Test', value: 'Test' },
        { label: 'Quiz', value: 'Quiz' },
        { label: 'Midterm', value: 'Midterm' },
        { label: 'Exam', value: 'Exam' },
        { label: 'Practical', value: 'Practical' }
      ]
    },
    {
      label: 'Term',
      value: 'term',
      key: 'term',
      type: 'select' as const,
      options: [
        { label: 'First Term', value: 'First Term' },
        { label: 'Second Term', value: 'Second Term' },
        { label: 'Third Term', value: 'Third Term' }
      ]
    },
    {
      label: 'Status',
      value: 'published',
      key: 'published',
      type: 'select' as const,
      options: [
        { label: 'Published', value: true },
        { label: 'Draft', value: false }
      ]
    },
    {
      label: 'Class',
      value: 'class.name',
      key: 'class.name',
      type: 'select' as const,
      options: [
        { label: 'Science 1', value: 'Science 1' },
        { label: 'Science 2', value: 'Science 2' },
        { label: 'Business 1', value: 'Business 1' }
      ]
    }
  ];

  const sortOptions = [
    { label: 'Title (A-Z)', value: 'title-asc', key: 'title', order: 'asc' as const },
    { label: 'Title (Z-A)', value: 'title-desc', key: 'title', order: 'desc' as const },
    { label: 'Due Date (Nearest)', value: 'due-asc', key: 'dueDate', order: 'asc' as const },
    { label: 'Due Date (Farthest)', value: 'due-desc', key: 'dueDate', order: 'desc' as const },
    { label: 'Created (Newest)', value: 'created-desc', key: 'createdAt', order: 'desc' as const },
    { label: 'Created (Oldest)', value: 'created-asc', key: 'createdAt', order: 'asc' as const },
    { label: 'Weight (Highest)', value: 'weight-desc', key: 'weight', order: 'desc' as const },
    { label: 'Weight (Lowest)', value: 'weight-asc', key: 'weight', order: 'asc' as const }
  ];

  // CRUD Operations
  const handleCreate = () => {
    setModalMode('create');
    setFormData({
      title: '',
      type: 'Test',
      course: {
        id: '',
        name: '',
        code: ''
      },
      class: {
        id: '',
        name: ''
      },
      teacher: {
        id: '',
        fullName: ''
      },
      academicYear: '2025/2026',
      term: 'First Term',
      maxScore: 100,
      weight: 10,
      dateGiven: '',
      dueDate: '',
      published: false
    });
    setShowModal(true);
  };

  const handleEdit = (assessment: Assessment) => {
    setModalMode('edit');
    setCurrentAssessment(assessment);
    setFormData(assessment);
    setShowModal(true);
  };

  const handleView = (assessment: Assessment) => {
    setModalMode('view');
    setCurrentAssessment(assessment);
    setFormData(assessment);
    setShowModal(true);
  };

  const handleDelete = (assessmentId: string) => {
    setAssessmentToDelete(assessmentId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (assessmentToDelete) {
      setAssessments(assessments.filter(a => a.id !== assessmentToDelete));
      setFilteredAssessments(filteredAssessments.filter(a => a.id !== assessmentToDelete));
      setShowDeleteConfirm(false);
      setAssessmentToDelete(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (modalMode === 'create') {
      const newAssessment: Assessment = {
        id: `ASM-${Date.now()}`,
        ...formData,
        createdAt: new Date().toISOString().split('T')[0]
      } as Assessment;
      setAssessments([...assessments, newAssessment]);
      setFilteredAssessments([...filteredAssessments, newAssessment]);
    } else if (modalMode === 'edit' && currentAssessment) {
      const updatedAssessments = assessments.map(a => 
        a.id === currentAssessment.id ? { ...a, ...formData } : a
      );
      setAssessments(updatedAssessments);
      setFilteredAssessments(updatedAssessments);
    }
    
    setShowModal(false);
    setCurrentAssessment(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    // Handle nested fields
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof Assessment] as any),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ 
        ...prev, 
        [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value 
      }));
    }
  };

  // Quick publish toggle
  const handlePublishToggle = (assessmentId: string) => {
    const updatedAssessments = assessments.map(a => 
      a.id === assessmentId ? { ...a, published: !a.published } : a
    );
    setAssessments(updatedAssessments);
    setFilteredAssessments(updatedAssessments);
  };

  // Table actions
  const actions = [
    {
      label: 'View',
      variant: 'primary',
      onClick: (row: Assessment) => handleView(row),
      icon: (
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path fill="currentColor" d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z" />
        </svg>
      )
    },
    {
      label: 'Edit',
      variant: 'secondary',
      onClick: (row: Assessment) => handleEdit(row),
      icon: (
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path fill="currentColor" d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />
        </svg>
      )
    },
    {
      label: 'Publish',
      variant: 'success',
      onClick: (row: Assessment) => handlePublishToggle(row.id),
      hidden: (row: Assessment) => row.published,
      icon: (
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path fill="currentColor" d="M5,4V7H10.5V19H13.5V7H19V4H5Z" />
        </svg>
      )
    },
    {
      label: 'Unpublish',
      variant: 'warning',
      onClick: (row: Assessment) => handlePublishToggle(row.id),
      hidden: (row: Assessment) => !row.published,
      icon: (
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path fill="currentColor" d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M14.59,8L12,10.59L9.41,8L8,9.41L10.59,12L8,14.59L9.41,16L12,13.41L14.59,16L16,14.59L13.41,12L16,9.41L14.59,8Z" />
        </svg>
      )
    },
    {
      label: 'Delete',
      variant: 'danger',
      onClick: (row: Assessment) => handleDelete(row.id),
      icon: (
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path fill="currentColor" d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
        </svg>
      )
    }
  ];

  // Render expanded row
  const renderExpandedRow = (row: Assessment) => {
    const daysUntilDue = Math.ceil((new Date(row.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    const isOverdue = daysUntilDue < 0;

    return (
      <div className={styles.expandedContent}>
        <div className={styles.expandedSection}>
          <h4>Course Information</h4>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Course Name:</span>
              <span className={styles.infoValue}>{row.course.name}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Course Code:</span>
              <span className={styles.infoValue}>{row.course.code}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Class:</span>
              <span className={styles.infoValue}>{row.class.name}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Teacher:</span>
              <span className={styles.infoValue}>{row.teacher.fullName}</span>
            </div>
          </div>
        </div>
        
        <div className={styles.expandedSection}>
          <h4>Academic Details</h4>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Academic Year:</span>
              <span className={styles.infoValue}>{row.academicYear}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Term:</span>
              <span className={styles.infoValue}>{row.term}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Date Given:</span>
              <span className={styles.infoValue}>{row.dateGiven}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Created:</span>
              <span className={styles.infoValue}>{row.createdAt}</span>
            </div>
          </div>
        </div>

        <div className={styles.expandedSection}>
          <h4>Grading Information</h4>
          <div className={styles.gradingCards}>
            <div className={styles.gradingCard}>
              <span className={styles.cardLabel}>Maximum Score</span>
              <span className={styles.cardValue}>{row.maxScore}</span>
              <span className={styles.cardUnit}>points</span>
            </div>
            <div className={styles.gradingCard}>
              <span className={styles.cardLabel}>Grade Weight</span>
              <span className={styles.cardValue}>{row.weight}</span>
              <span className={styles.cardUnit}>percent</span>
            </div>
            <div className={styles.gradingCard}>
              <span className={styles.cardLabel}>Due Status</span>
              <span className={`${styles.cardValue} ${isOverdue ? styles.cardOverdue : styles.cardActive}`}>
                {isOverdue ? 'Overdue' : daysUntilDue === 0 ? 'Today' : `${daysUntilDue} days`}
              </span>
              <span className={styles.cardUnit}>{isOverdue ? '' : 'remaining'}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.pageContainer}>
      <Header 
        title="Assessment Management"
        subtitle="Manage tests, assignments, quizzes, and exams"
        customActions={
          <button className={styles.addButton} onClick={handleCreate}>
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
            </svg>
            Create Assessment
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
            data={assessments}
            onFilterChange={setFilteredAssessments}
            searchKeys={['title', 'id', 'course.name', 'course.code', 'class.name', 'teacher.fullName']}
            sortOptions={sortOptions}
            filterOptions={filterOptions}
            variant="default"
            showSearch={true}
            showSort={true}
            showFilter={true}
            searchPlaceholder="Search by title, course, class, or teacher..."
            enableReset={true}
          />
        </div>

        {/* Table Section */}
        <div className={styles.tableSection}>
          <Table
            columns={columns}
            data={filteredAssessments}
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
            emptyMessage="No assessments found"
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
                {modalMode === 'create' && 'Create Assessment'}
                {modalMode === 'edit' && 'Edit Assessment'}
                {modalMode === 'view' && 'Assessment Details'}
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
                  
                  <div className={styles.formGroup}>
                    <label>Assessment Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      disabled={modalMode === 'view'}
                      placeholder="Test 1, Assignment 2, Final Exam..."
                    />
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Type *</label>
                      <select
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        required
                        disabled={modalMode === 'view'}
                      >
                        <option value="Assignment">Assignment</option>
                        <option value="Test">Test</option>
                        <option value="Quiz">Quiz</option>
                        <option value="Midterm">Midterm</option>
                        <option value="Exam">Exam</option>
                        <option value="Practical">Practical</option>
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label>Term *</label>
                      <select
                        name="term"
                        value={formData.term}
                        onChange={handleInputChange}
                        required
                        disabled={modalMode === 'view'}
                      >
                        <option value="First Term">First Term</option>
                        <option value="Second Term">Second Term</option>
                        <option value="Third Term">Third Term</option>
                      </select>
                    </div>
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
                      <option value="2025/2026">2025/2026</option>
                      <option value="2024/2025">2024/2025</option>
                      <option value="2023/2024">2023/2024</option>
                    </select>
                  </div>
                </div>

                {/* Course & Class Information */}
                <div className={styles.formSection}>
                  <h3 className={styles.sectionTitle}>Course & Class</h3>
                  
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Course Name *</label>
                      <input
                        type="text"
                        name="course.name"
                        value={formData.course?.name}
                        onChange={handleInputChange}
                        required
                        disabled={modalMode === 'view'}
                        placeholder="Mathematics"
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>Course Code *</label>
                      <input
                        type="text"
                        name="course.code"
                        value={formData.course?.code}
                        onChange={handleInputChange}
                        required
                        disabled={modalMode === 'view'}
                        placeholder="MATH101"
                      />
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Class *</label>
                      <select
                        name="class.name"
                        value={formData.class?.name}
                        onChange={handleInputChange}
                        required
                        disabled={modalMode === 'view'}
                      >
                        <option value="">Select Class</option>
                        <option value="Science 1">Science 1</option>
                        <option value="Science 2">Science 2</option>
                        <option value="Business 1">Business 1</option>
                        <option value="Business 2">Business 2</option>
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label>Teacher Name *</label>
                      <input
                        type="text"
                        name="teacher.fullName"
                        value={formData.teacher?.fullName}
                        onChange={handleInputChange}
                        required
                        disabled={modalMode === 'view'}
                        placeholder="James Anderson"
                      />
                    </div>
                  </div>
                </div>

                {/* Grading & Dates */}
                <div className={styles.formSection}>
                  <h3 className={styles.sectionTitle}>Grading & Schedule</h3>
                  
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Maximum Score *</label>
                      <input
                        type="number"
                        name="maxScore"
                        value={formData.maxScore}
                        onChange={handleInputChange}
                        required
                        min="1"
                        disabled={modalMode === 'view'}
                        placeholder="100"
                      />
                      <span className={styles.fieldHint}>Total points possible</span>
                    </div>

                    <div className={styles.formGroup}>
                      <label>Weight (%) *</label>
                      <input
                        type="number"
                        name="weight"
                        value={formData.weight}
                        onChange={handleInputChange}
                        required
                        min="0"
                        max="100"
                        disabled={modalMode === 'view'}
                        placeholder="10"
                      />
                      <span className={styles.fieldHint}>Contribution to final grade</span>
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Date Given *</label>
                      <input
                        type="date"
                        name="dateGiven"
                        value={formData.dateGiven}
                        onChange={handleInputChange}
                        required
                        disabled={modalMode === 'view'}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>Due Date *</label>
                      <input
                        type="date"
                        name="dueDate"
                        value={formData.dueDate}
                        onChange={handleInputChange}
                        required
                        disabled={modalMode === 'view'}
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        name="published"
                        checked={formData.published}
                        onChange={handleInputChange}
                        disabled={modalMode === 'view'}
                      />
                      <span>Publish assessment (visible to students)</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* View Mode - Show All Data */}
              {modalMode === 'view' && currentAssessment && (
                <div className={styles.viewMode}>
                  {renderExpandedRow(currentAssessment)}
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
                    {modalMode === 'create' ? 'Create Assessment' : 'Update Assessment'}
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
            <h3>Delete Assessment</h3>
            <p>Are you sure you want to delete this assessment? This action cannot be undone and will affect all associated student records.</p>
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

export default AssessmentsAdminPage;