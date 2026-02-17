'use client';

import React, { useState, useMemo } from 'react';
import styles from './page.module.css';
import { gradeBooksMockData } from '@/data/gradeBook'; // Adjust import path
import Header from '@/components/Header/Header';
import Stats from '@/components/Stats/Stats';
import StatFilter from '@/components/StatFilter/StatFilter';
import Table from '@/components/Table/Table';

// Types
interface Score { continuousAssessment: number; exam: number; total: number; }
interface Grading { letter: string; gradePoint: number; }
interface Entity { id: string; fullName?: string; name?: string; admissionNumber?: string; code?: string; }
interface GradeBookEntry {
  id: string; student: Entity; course: Entity; class: Entity;
  academicYear: string; term: string; scores: Score; grading: Grading;
  remark: string; teacher: Entity; published: boolean; createdAt: string;
}

const GradesAdminPage = () => {
  const [grades, setGrades] = useState<GradeBookEntry[]>(gradeBooksMockData);
  const [filteredGrades, setFilteredGrades] = useState<GradeBookEntry[]>(grades);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [currentGrade, setCurrentGrade] = useState<GradeBookEntry | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [gradeToDelete, setGradeToDelete] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<GradeBookEntry>>({
    student: { id: '', fullName: '', admissionNumber: '' },
    course: { id: '', name: '', code: '' },
    class: { id: '', name: '' },
    academicYear: '2025/2026',
    term: 'First Term',
    scores: { continuousAssessment: 0, exam: 0, total: 0 },
    grading: { letter: 'N/A', gradePoint: 0 },
    remark: '',
    teacher: { id: '', fullName: '' },
    published: false
  });

  // Helper: Calculate Grade
  const calculateGrading = (total: number): Grading => {
    if (total >= 70) return { letter: 'A', gradePoint: 4.0 };
    if (total >= 60) return { letter: 'B', gradePoint: 3.0 };
    if (total >= 50) return { letter: 'C', gradePoint: 2.0 };
    if (total >= 45) return { letter: 'D', gradePoint: 1.0 };
    return { letter: 'F', gradePoint: 0.0 };
  };

  // Stats Calculation
  const stats = useMemo(() => {
    const totalEntries = grades.length;
    const avgScore = totalEntries > 0 
      ? (grades.reduce((sum, g) => sum + g.scores.total, 0) / totalEntries).toFixed(1) 
      : 0;
    const passCount = grades.filter(g => g.scores.total >= 50).length;
    const publishedCount = grades.filter(g => g.published).length;

    return [
      { id: 1, label: 'Total Entries', value: totalEntries, color: 'blue', type: 'classes' },
      { id: 2, label: 'Average Score', value: avgScore, unit: '%', color: 'purple', type: 'attendance' },
      { id: 3, label: 'Pass Rate', value: `${((passCount / totalEntries) * 100 || 0).toFixed(0)}%`, color: 'green', type: 'students' },
      { id: 4, label: 'Published', value: publishedCount, trend: { value: totalEntries - publishedCount, label: 'unpublished' }, color: 'orange', type: 'events' }
    ];
  }, [grades]);

  // Columns Configuration
  const columns = [
    {
      header: 'Student',
      accessor: 'student.fullName',
      sortable: true,
      render: (row: GradeBookEntry) => (
        <div className={styles.studentCell}>
          <div className={styles.avatar}>
            {row.student.fullName?.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <div className={styles.name}>{row.student.fullName}</div>
            <div className={styles.sub}>{row.student.admissionNumber}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Course',
      accessor: 'course.name',
      sortable: true,
      render: (row: GradeBookEntry) => (
        <div className={styles.courseCell}>
          <span className={styles.courseName}>{row.course.name}</span>
          <span className={styles.courseCode}>{row.course.code}</span>
        </div>
      )
    },
    {
      header: 'Class',
      accessor: 'class.name',
      sortable: true,
      width: '120px'
    },
    {
      header: 'CA (40)',
      accessor: 'scores.continuousAssessment',
      sortable: true,
      width: '90px',
      render: (row: GradeBookEntry) => (
        <span className={row.scores.continuousAssessment < 20 ? styles.lowScore : ''}>
          {row.scores.continuousAssessment}
        </span>
      )
    },
    {
      header: 'Exam (60)',
      accessor: 'scores.exam',
      sortable: true,
      width: '90px',
      render: (row: GradeBookEntry) => (
        <span className={row.scores.exam < 30 ? styles.lowScore : ''}>
          {row.scores.exam}
        </span>
      )
    },
    {
      header: 'Total (100)',
      accessor: 'scores.total',
      sortable: true,
      width: '120px',
      render: (row: GradeBookEntry) => (
        <div className={styles.scoreBarContainer}>
          <div className={styles.scoreBar}>
            <div 
              className={`${styles.scoreFill} ${row.scores.total >= 50 ? styles.pass : styles.fail}`}
              style={{ width: `${row.scores.total}%` }}
            />
          </div>
          <span className={styles.scoreText}>{row.scores.total}</span>
        </div>
      )
    },
    {
      header: 'Grade',
      accessor: 'grading.letter',
      sortable: true,
      width: '80px',
      render: (row: GradeBookEntry) => (
        <span className={`${styles.gradeBadge} ${styles[`grade${row.grading.letter}`]}`}>
          {row.grading.letter}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: 'published',
      sortable: true,
      width: '100px',
      render: (row: GradeBookEntry) => (
        <span className={`${styles.publishBadge} ${row.published ? styles.published : styles.unpublished}`}>
          {row.published ? 'Published' : 'Draft'}
        </span>
      )
    }
  ];

  // Filters
  const filterOptions = [
    {
      label: 'Grade',
      value: 'grading.letter',
      key: 'grading.letter',
      type: 'select' as const,
      options: ['A', 'B', 'C', 'D', 'F'].map(g => ({ label: g, value: g }))
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
        { label: 'Published', value: 'true' },
        { label: 'Unpublished', value: 'false' }
      ]
    }
  ];

  const sortOptions = [
    { label: 'Score (Highest)', value: 'score-desc', key: 'scores.total', order: 'desc' as const },
    { label: 'Score (Lowest)', value: 'score-asc', key: 'scores.total', order: 'asc' as const },
    { label: 'Student (A-Z)', value: 'name-asc', key: 'student.fullName', order: 'asc' as const },
  ];

  // Handlers
  const handleCreate = () => {
    setModalMode('create');
    setFormData({
      academicYear: '2025/2026',
      term: 'First Term',
      scores: { continuousAssessment: 0, exam: 0, total: 0 },
      grading: { letter: 'N/A', gradePoint: 0 },
      remark: '',
      published: false
    });
    setShowModal(true);
  };

  const handleEdit = (grade: GradeBookEntry) => {
    setModalMode('edit');
    setCurrentGrade(grade);
    setFormData({ ...grade });
    setShowModal(true);
  };

  const handleView = (grade: GradeBookEntry) => {
    setModalMode('view');
    setCurrentGrade(grade);
    setFormData({ ...grade });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    setGradeToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (gradeToDelete) {
      setGrades(grades.filter(g => g.id !== gradeToDelete));
      setFilteredGrades(filteredGrades.filter(g => g.id !== gradeToDelete));
      setShowDeleteConfirm(false);
      setGradeToDelete(null);
    }
  };

  const handleScoreChange = (type: 'CA' | 'Exam', value: number) => {
    const max = type === 'CA' ? 40 : 60;
    const validValue = Math.min(Math.max(value, 0), max);
    
    const newScores = { ...formData.scores! };
    if (type === 'CA') newScores.continuousAssessment = validValue;
    else newScores.exam = validValue;

    newScores.total = newScores.continuousAssessment + newScores.exam;
    const newGrading = calculateGrading(newScores.total);

    setFormData(prev => ({
      ...prev,
      scores: newScores,
      grading: newGrading
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (modalMode === 'create') {
      const newGrade: GradeBookEntry = {
        id: `GB-${Date.now().toString().slice(-4)}`,
        ...formData,
        createdAt: new Date().toISOString().split('T')[0]
      } as GradeBookEntry;
      setGrades([newGrade, ...grades]);
      setFilteredGrades([newGrade, ...filteredGrades]);
    } else if (modalMode === 'edit' && currentGrade) {
      const updated = grades.map(g => g.id === currentGrade.id ? { ...g, ...formData } : g);
      setGrades(updated);
      setFilteredGrades(updated);
    }
    setShowModal(false);
  };

  const togglePublish = (grade: GradeBookEntry) => {
    const updated = grades.map(g => 
      g.id === grade.id ? { ...g, published: !g.published } : g
    );
    setGrades(updated);
    setFilteredGrades(updated);
  };

  const actions = [
    {
      label: 'View',
      variant: 'primary',
      onClick: (row: GradeBookEntry) => handleView(row),
      icon: <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17Z" /></svg>
    },
    {
      label: 'Edit',
      variant: 'secondary',
      onClick: (row: GradeBookEntry) => handleEdit(row),
      icon: <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" /></svg>
    },
    {
      label: 'Toggle Publish',
      variant: 'success',
      onClick: (row: GradeBookEntry) => togglePublish(row),
      icon: <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M16.2,16.2L11,13V7H12.5V12.2L17,14.9L16.2,16.2Z" /></svg>
    },
    {
      label: 'Delete',
      variant: 'danger',
      onClick: (row: GradeBookEntry) => handleDelete(row.id),
      icon: <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" /></svg>
    }
  ];

  const renderExpandedRow = (row: GradeBookEntry) => (
    <div className={styles.expandedContent}>
      <div className={styles.expandedGrid}>
        <div className={styles.expandedSection}>
          <h4>Remarks & Teacher</h4>
          <p className={styles.remarkText}>{row.remark || 'No remarks added.'}</p>
          <div className={styles.teacherInfo}>
            <span className={styles.teacherLabel}>Recorded by:</span>
            <strong>{row.teacher.fullName}</strong> (ID: {row.teacher.id})
          </div>
        </div>
        <div className={styles.expandedSection}>
          <h4>Academic Context</h4>
          <div className={styles.detailRow}>
            <span>Academic Year:</span> <strong>{row.academicYear}</strong>
          </div>
          <div className={styles.detailRow}>
            <span>Term:</span> <strong>{row.term}</strong>
          </div>
          <div className={styles.detailRow}>
            <span>Date Recorded:</span> <strong>{row.createdAt}</strong>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.pageContainer}>
      <Header 
        title="Grade Book"
        subtitle="Manage student scores, grades, and academic performance"
        customActions={
          <button className={styles.addButton} onClick={handleCreate}>
            <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" /></svg>
            Add New Entry
          </button>
        }
      />

      <div className={styles.contentWrapper}>
        <Stats stats={stats} variant="cards" columns={4} showTrend showIcon />

        <div className={styles.filterSection}>
          <StatFilter
            data={grades}
            onFilterChange={setFilteredGrades}
            searchKeys={['student.fullName', 'student.admissionNumber', 'course.name', 'course.code']}
            sortOptions={sortOptions}
            filterOptions={filterOptions}
            searchPlaceholder="Search by student or course..."
          />
        </div>

        <div className={styles.tableSection}>
          <Table
            columns={columns}
            data={filteredGrades}
            // actions={actions}
            expandable
            renderExpandedRow={renderExpandedRow}
            pagination pageSize={10}
            showRowNumbers
          />
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>
                {modalMode === 'create' && 'Add New Grade Entry'}
                {modalMode === 'edit' && 'Edit Grade Entry'}
                {modalMode === 'view' && 'Grade Details'}
              </h2>
              <button className={styles.closeButton} onClick={() => setShowModal(false)}>×</button>
            </div>

            <form onSubmit={handleSubmit} className={styles.modalBody}>
              <div className={styles.formGrid}>
                {/* Left Column: Basic Info */}
                <div className={styles.formSection}>
                  <h3 className={styles.sectionTitle}>Student & Course</h3>
                  
                  <div className={styles.formGroup}>
                    <label>Student Name *</label>
                    <input 
                      type="text" 
                      value={formData.student?.fullName || ''} 
                      onChange={(e) => setFormData({...formData, student: {...formData.student!, fullName: e.target.value}})}
                      disabled={modalMode === 'view'}
                      required
                    />
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Admission No</label>
                      <input 
                        type="text" 
                        value={formData.student?.admissionNumber || ''} 
                        onChange={(e) => setFormData({...formData, student: {...formData.student!, admissionNumber: e.target.value}})}
                        disabled={modalMode === 'view'}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Class</label>
                      <input 
                        type="text" 
                        value={formData.class?.name || ''} 
                        onChange={(e) => setFormData({...formData, class: {...formData.class!, name: e.target.value}})}
                        disabled={modalMode === 'view'}
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Course *</label>
                    <input 
                      type="text" 
                      value={formData.course?.name || ''} 
                      onChange={(e) => setFormData({...formData, course: {...formData.course!, name: e.target.value}})}
                      disabled={modalMode === 'view'}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Teacher</label>
                    <input 
                      type="text" 
                      value={formData.teacher?.fullName || ''} 
                      onChange={(e) => setFormData({...formData, teacher: {...formData.teacher!, fullName: e.target.value}})}
                      disabled={modalMode === 'view'}
                    />
                  </div>
                </div>

                {/* Right Column: Scores & Grading */}
                <div className={styles.formSection}>
                  <h3 className={styles.sectionTitle}>Scores & Grading</h3>
                  
                  <div className={styles.scoreInputGrid}>
                    <div className={styles.formGroup}>
                      <label>CA Score (Max 40)</label>
                      <input 
                        type="number" 
                        max="40" min="0"
                        value={formData.scores?.continuousAssessment || 0} 
                        onChange={(e) => handleScoreChange('CA', Number(e.target.value))}
                        disabled={modalMode === 'view'}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Exam Score (Max 60)</label>
                      <input 
                        type="number" 
                        max="60" min="0"
                        value={formData.scores?.exam || 0} 
                        onChange={(e) => handleScoreChange('Exam', Number(e.target.value))}
                        disabled={modalMode === 'view'}
                      />
                    </div>
                  </div>

                  <div className={styles.autoCalcBox}>
                    <div className={styles.calcItem}>
                      <span>Total Score:</span>
                      <strong>{formData.scores?.total || 0}</strong>
                    </div>
                    <div className={styles.calcItem}>
                      <span>Grade:</span>
                      <strong className={`${styles.gradeBadge} ${styles[`grade${formData.grading?.letter}`]}`}>
                        {formData.grading?.letter || 'N/A'}
                      </strong>
                    </div>
                    <div className={styles.calcItem}>
                      <span>Point:</span>
                      <strong>{formData.grading?.gradePoint || 0}</strong>
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Remark</label>
                    <textarea 
                      value={formData.remark || ''} 
                      onChange={(e) => setFormData({...formData, remark: e.target.value})}
                      disabled={modalMode === 'view'}
                      rows={3}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.checkboxLabel}>
                      <input 
                        type="checkbox" 
                        checked={formData.published} 
                        onChange={(e) => setFormData({...formData, published: e.target.checked})}
                        disabled={modalMode === 'view'}
                      />
                      <span>Published (Visible to Student/Parent)</span>
                    </label>
                  </div>
                </div>
              </div>

              {modalMode !== 'view' && (
                <div className={styles.modalFooter}>
                  <button type="button" className={styles.cancelButton} onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className={styles.submitButton}>Save Entry</button>
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
            <h3>Delete Entry?</h3>
            <p>This will permanently remove this grade record. This action cannot be undone.</p>
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

export default GradesAdminPage;