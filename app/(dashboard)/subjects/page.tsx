// app/(dashboard)/admin/subjects/page.tsx
'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import styles from './page.module.css';
import Header from '@/components/Header/Header';
import StatFilter from '@/components/StatFilter/StatFilter';
import Table from '@/components/Table/Table';
import Stats from '@/components/Stats/Stats';
import { getSubjects, deleteSubject, createSubject, updateSubject, Subject } from '@/lib/action/admin/subject';
import { Action } from '@/components/Table/Table';
import { exportToCSV } from '@/utils/export/csv';
import { exportToPDF } from '@/utils/export/pdf';

const SubjectAdminPage = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [currentSubject, setCurrentSubject] = useState<Subject | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    subject_code: '',
    description: '',
    status: 'active',
  });

  // Load subjects
  const loadSubjects = async () => {
    setLoading(true);
    const result = await getSubjects();
    if (!result.error && result.subjects) {
      setSubjects(result.subjects);
      setFilteredSubjects(result.subjects);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadSubjects();
  }, []);

  // Calculate stats
  const stats = useMemo(() => {
    const totalSubjects = subjects.length;
    const activeSubjects = subjects.filter(s => s.status === 'active').length;
    const inactiveSubjects = subjects.filter(s => s.status === 'inactive').length;
    
    return [
      {
        id: 1,
        label: 'Total Subjects',
        value: totalSubjects,
        trend: { value: 0, label: 'total' },
        color: 'blue',
        type: 'subjects'
      },
      {
        id: 2,
        label: 'Active Subjects',
        value: activeSubjects,
        trend: { value: 0, label: 'currently active' },
        color: 'green',
        type: 'active'
      },
      {
        id: 3,
        label: 'Inactive Subjects',
        value: inactiveSubjects,
        trend: { value: 0, label: 'archived' },
        color: 'orange',
        type: 'inactive'
      },
      {
        id: 4,
        label: 'Total Classes',
        value: '-',
        trend: { value: 0, label: 'coming soon' },
        color: 'purple',
        type: 'classes'
      }
    ];
  }, [subjects]);

  // ============================================
  // EXPORT FUNCTIONALITY
  // ============================================

  const getExportColumns = () => [
    {
      header: 'Subject Code',
      accessor: (row: Subject) => row.subject_code || '—',
    },
    {
      header: 'Subject Title',
      accessor: (row: Subject) => row.title || '—',
    },
    {
      header: 'Description',
      accessor: (row: Subject) => row.description || '—',
    },
    {
      header: 'Status',
      accessor: (row: Subject) => row.status || 'active',
    },
    {
      header: 'Created Date',
      accessor: (row: Subject) => new Date(row.created_at).toLocaleDateString(),
    },
  ];

  const handleExport = useCallback(
    async (format: 'pdf' | 'csv') => {
      const dataToExport = filteredSubjects.length > 0 ? filteredSubjects : subjects;

      if (dataToExport.length === 0) {
        alert('No data to export');
        return;
      }

      const columns = getExportColumns();
      const filename = `subjects-${new Date().toISOString().split('T')[0]}`;

      if (format === 'csv') {
        exportToCSV(dataToExport, columns, { filename });
      } else {
        await exportToPDF(dataToExport, columns, {
          filename,
          title: 'Subject Management Report',
          subtitle: `Total Subjects: ${dataToExport.length} | Generated on ${new Date().toLocaleDateString()}`,
          orientation: 'landscape',
        });
      }
    },
    [filteredSubjects, subjects]
  );

  // ============================================
  // END EXPORT FUNCTIONALITY
  // ============================================

  // Table columns configuration
  const columns = [
    {
      header: 'Subject Code',
      accessor: 'subject_code',
      sortable: true,
      width: '120px',
      render: (row: Subject) => row.subject_code || '—'
    },
    {
      header: 'Subject Title',
      accessor: 'title',
      sortable: true,
      render: (row: Subject) => (
        <div className={styles.subjectCell}>
          <div className={styles.subjectAvatar}>
            {row.title?.[0]?.toUpperCase() || 'S'}
          </div>
          <div>
            <div className={styles.subjectName}>{row.title}</div>
            {row.description && (
              <div className={styles.subjectDescription}>{row.description}</div>
            )}
          </div>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      sortable: true,
      width: '120px',
      render: (row: Subject) => {
        const statusColors: Record<string, string> = {
          active: styles.statusActive,
          inactive: styles.statusInactive,
        };
        return (
          <span className={`${styles.statusBadge} ${statusColors[row.status || 'active']}`}>
            {row.status || 'active'}
          </span>
        );
      }
    },
    {
      header: 'Created',
      accessor: 'created_at',
      sortable: true,
      width: '150px',
      render: (row: Subject) => new Date(row.created_at).toLocaleDateString()
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
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' }
      ]
    }
  ];

  const sortOptions = [
    { label: 'Title (A-Z)', value: 'title-asc', key: 'title', order: 'asc' as const },
    { label: 'Title (Z-A)', value: 'title-desc', key: 'title', order: 'desc' as const },
    { label: 'Code (A-Z)', value: 'code-asc', key: 'subject_code', order: 'asc' as const },
    { label: 'Code (Z-A)', value: 'code-desc', key: 'subject_code', order: 'desc' as const },
    { label: 'Created (Newest)', value: 'created-desc', key: 'created_at', order: 'desc' as const },
    { label: 'Created (Oldest)', value: 'created-asc', key: 'created_at', order: 'asc' as const }
  ];

  // CRUD Operations
  const handleCreate = () => {
    setModalMode('create');
    setFormData({
      title: '',
      subject_code: '',
      description: '',
      status: 'active',
    });
    setShowModal(true);
  };

  const handleEdit = (subject: Subject) => {
    setModalMode('edit');
    setCurrentSubject(subject);
    setFormData({
      title: subject.title,
      subject_code: subject.subject_code || '',
      description: subject.description || '',
      status: subject.status,
    });
    setShowModal(true);
  };

  const handleView = (subject: Subject) => {
    setModalMode('view');
    setCurrentSubject(subject);
    setShowModal(true);
  };

  const handleDelete = (subjectId: number) => {
    setSubjectToDelete(subjectId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (subjectToDelete) {
      const result = await deleteSubject(subjectToDelete);
      if (result.success) {
        await loadSubjects();
      } else {
        alert(result.error);
      }
      setShowDeleteConfirm(false);
      setSubjectToDelete(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const submitFormData = new FormData();
    submitFormData.append('title', formData.title);
    submitFormData.append('subject_code', formData.subject_code);
    submitFormData.append('description', formData.description);
    submitFormData.append('status', formData.status);

    let result;
    if (modalMode === 'create') {
      result = await createSubject(submitFormData);
    } else if (modalMode === 'edit' && currentSubject) {
      result = await updateSubject(currentSubject.id, submitFormData);
    }

    if (result?.success) {
      await loadSubjects();
      setShowModal(false);
      setCurrentSubject(null);
    } else if (result?.error) {
      alert(result.error);
    }
    setIsSubmitting(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Table actions
  const actions: Action<Subject>[] = [
    {
      label: 'View',
      variant: 'primary',
      onClick: (row: Subject) => handleView(row),
      icon: (
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path fill="currentColor" d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z" />
        </svg>
      )
    },
    {
      label: 'Edit',
      variant: 'secondary',
      onClick: (row: Subject) => handleEdit(row),
      icon: (
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path fill="currentColor" d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />
        </svg>
      )
    },
    {
      label: 'Delete',
      variant: 'danger',
      onClick: (row: Subject) => handleDelete(row.id),
      icon: (
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path fill="currentColor" d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
        </svg>
      )
    }
  ];

  // Loading UI
  if (loading && subjects.length === 0) {
    return (
      <div className={styles.pageContainer}>
        <Header title="Subject Management" subtitle="Manage school subjects, codes, and descriptions" />
        <div className={styles.contentWrapper}>
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Loading subjects...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <Header 
        title="Subject Management"
        subtitle="Manage school subjects, codes, and descriptions"
        onExport={handleExport}
        exportOptions={[{ value: 'subjects', label: 'Subjects' }]}
        customActions={
          <button className={styles.addButton} onClick={handleCreate}>
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
            </svg>
            Add New Subject
          </button>
        }
      />

      <div className={styles.contentWrapper}>
        <Stats 
          stats={stats}
          variant="cards"
          columns={4}
          showTrend={true}
          showIcon={true}
          size="md"
        />

        <div className={styles.filterSection}>
          <StatFilter
            data={subjects}
            onFilterChange={setFilteredSubjects}
            searchKeys={['title', 'subject_code', 'description']}
            sortOptions={sortOptions}
            filterOptions={filterOptions}
            variant="default"
            showSearch={true}
            showSort={true}
            showFilter={true}
            searchPlaceholder="Search subjects by name or code..."
            enableReset={true}
          />
        </div>

        <div className={styles.tableSection}>
          <Table
            columns={columns}
            data={filteredSubjects}
            variant="default"
            size="md"
            stickyHeader={true}
            sortable={true}
            pagination={true}
            pageSize={10}
            actions={actions}
            showRowNumbers={true}
            emptyMessage="No subjects found"
            loading={loading}
          />
        </div>
      </div>

      {/* View Modal - Clean display mode */}
      {showModal && modalMode === 'view' && currentSubject && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.viewModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Subject Details</h2>
              <button className={styles.closeButton} onClick={() => setShowModal(false)}>
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                </svg>
              </button>
            </div>
            <div className={styles.viewModalBody}>
              {/* Subject Header */}
              <div className={styles.subjectHeader}>
                <div className={styles.subjectAvatarLarge}>
                  {currentSubject.title?.[0]?.toUpperCase() || 'S'}
                </div>
                <div className={styles.subjectInfo}>
                  <h3>{currentSubject.title}</h3>
                  <p className={styles.subjectCode}>Code: {currentSubject.subject_code || 'Not assigned'}</p>
                  <div className={styles.subjectStatus}>
                    <span className={`${styles.statusBadge} ${currentSubject.status === 'active' ? styles.statusActive : styles.statusInactive}`}>
                      {currentSubject.status || 'active'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description Section */}
              {currentSubject.description && (
                <div className={styles.infoCard}>
                  <h4>Description</h4>
                  <p>{currentSubject.description}</p>
                </div>
              )}

              {/* Metadata Section */}
              <div className={styles.infoCard}>
                <h4>Metadata</h4>
                <div className={styles.infoRow}>
                  <span>Created:</span>
                  <strong>{new Date(currentSubject.created_at).toLocaleString()}</strong>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && modalMode !== 'view' && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>
                {modalMode === 'create' && 'Add New Subject'}
                {modalMode === 'edit' && 'Edit Subject'}
              </h2>
              <button className={styles.closeButton} onClick={() => setShowModal(false)}>
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.modalBody}>
              <div className={styles.formGrid}>
                <div className={styles.formSection}>
                  <h3 className={styles.sectionTitle}>Subject Information</h3>
                  
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Subject Title *</label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g., Mathematics, English, Science"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Subject Code</label>
                      <input
                        type="text"
                        name="subject_code"
                        value={formData.subject_code}
                        onChange={handleInputChange}
                        placeholder="e.g., MATH101, ENG102"
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={4}
                      placeholder="Brief description of the subject..."
                    />
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Status</label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button 
                  type="button" 
                  className={styles.cancelButton}
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : (modalMode === 'create' ? 'Create Subject' : 'Update Subject')}
                </button>
              </div>
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
            <h3>Delete Subject</h3>
            <p>Are you sure you want to delete this subject? This action cannot be undone.</p>
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

export default SubjectAdminPage;