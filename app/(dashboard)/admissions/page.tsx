'use client';

import React, { useState, useMemo } from 'react';
import styles from './admissions.module.css';
import { admissionsMockData } from '@/data/admissionMockData';
import Table from '@/components/Table/Table';
import StatFilter from '@/components/StatFilter/StatFilter';
import Stats from '@/components/Stats/Stats';
import Header from '@/components/Header/Header';

// Types
interface Applicant {
  firstName: string;
  lastName: string;
  fullName: string;
  gender: string;
  dateOfBirth: string;
  age: number;
}

interface Contact {
  email: string;
  phone: string;
  address: string;
}

interface Guardian {
  name: string;
  relationship: string;
  phone: string;
  email: string;
}

interface PreviousSchool {
  name: string;
  lastClass: string;
  averageScore: number;
}

interface ApplyingFor {
  department: { id: string; name: string };
  class: { id: string; name: string };
  academicYear: string;
}

interface Documents {
  birthCertificate: boolean;
  previousResult: boolean;
  passportPhoto: boolean;
}

interface Payment {
  applicationFee: number;
  paid: boolean;
  paymentReference: string | null;
}

interface Timeline {
  submittedAt: string;
  reviewedAt: string | null;
  approvedAt: string | null;
}

interface Admission {
  id: string;
  applicationNumber: string;
  applicant: Applicant;
  contact: Contact;
  guardian: Guardian;
  previousSchool: PreviousSchool;
  applyingFor: ApplyingFor;
  // admissionType: 'Online' | 'Walk-in' | 'Transfer';
  // status: 'Submitted' | 'Under Review' | 'Approved' | 'Rejected' | 'Withdrawn';
  admissionType:string;
  status: string;
  reviewNotes: string | null;
  documents: Documents;
  payment: Payment;
  timeline: Timeline;
  createdAt: string;
}

const AdmissionsAdminPage = () => {
  const [admissions, setAdmissions] = useState<Admission[]>(admissionsMockData);
  const [filteredAdmissions, setFilteredAdmissions] = useState<Admission[]>(admissions);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [currentAdmission, setCurrentAdmission] = useState<Admission | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [admissionToDelete, setAdmissionToDelete] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'applicant' | 'guardian' | 'academic' | 'payment'>('applicant');

  // Form state
  const [formData, setFormData] = useState<Partial<Admission>>({
    applicationNumber: '',
    applicant: {
      firstName: '',
      lastName: '',
      fullName: '',
      gender: 'Male',
      dateOfBirth: '',
      age: 0
    },
    contact: {
      email: '',
      phone: '',
      address: ''
    },
    guardian: {
      name: '',
      relationship: 'Mother',
      phone: '',
      email: ''
    },
    previousSchool: {
      name: '',
      lastClass: '',
      averageScore: 0
    },
    applyingFor: {
      department: { id: '', name: '' },
      class: { id: '', name: '' },
      academicYear: '2025/2026'
    },
    admissionType: 'Online',
    status: 'Submitted',
    reviewNotes: null,
    documents: {
      birthCertificate: false,
      previousResult: false,
      passportPhoto: false
    },
    payment: {
      applicationFee: 20000,
      paid: false,
      paymentReference: null
    },
    timeline: {
      submittedAt: '',
      reviewedAt: null,
      approvedAt: null
    }
  });

  // Calculate stats
  const stats = useMemo(() => {
    const totalApplications = admissions.length;
    const submitted = admissions.filter(a => a.status === 'Submitted').length;
    const underReview = admissions.filter(a => a.status === 'Under Review').length;
    const approved = admissions.filter(a => a.status === 'Approved').length;
    const rejected = admissions.filter(a => a.status === 'Rejected').length;

    // Calculate approval rate
    const processed = approved + rejected;
    const approvalRate = processed > 0 ? ((approved / processed) * 100).toFixed(1) : 0;

    // Calculate payment completion
    const paidApplications = admissions.filter(a => a.payment.paid).length;
    const paymentRate = totalApplications > 0 
      ? ((paidApplications / totalApplications) * 100).toFixed(1)
      : 0;

    return [
      {
        id: 1,
        label: 'Total Applications',
        value: totalApplications,
        trend: { value: 12, label: 'this month' },
        color: 'blue',
        type: 'students'
      },
      {
        id: 2,
        label: 'Under Review',
        value: underReview,
        secondaryValue: submitted,
        secondaryLabel: 'Submitted',
        trend: { value: 5, label: 'pending' },
        color: 'orange',
        type: 'classes'
      },
      {
        id: 3,
        label: 'Approved',
        value: approved,
        unit: ` (${approvalRate}%)`,
        trend: { value: 8, label: 'this week' },
        color: 'green',
        type: 'students'
      },
      {
        id: 4,
        label: 'Payment Rate',
        value: `${paymentRate}%`,
        secondaryValue: `₦${(admissions.reduce((sum, a) => sum + (a.payment.paid ? a.payment.applicationFee : 0), 0)).toLocaleString()}`,
        secondaryLabel: 'Collected',
        trend: { value: 3, label: 'vs target' },
        color: 'purple',
        type: 'revenue'
      }
    ];
  }, [admissions]);

  // Table columns configuration
  const columns = [
    {
      header: 'App. Number',
      accessor: 'applicationNumber',
      sortable: true,
      width: '140px',
      render: (row: Admission) => (
        <span className={styles.appNumber}>{row.applicationNumber}</span>
      )
    },
    {
      header: 'Applicant',
      accessor: 'applicant.fullName',
      sortable: true,
      render: (row: Admission) => (
        <div className={styles.applicantCell}>
          <div className={styles.applicantAvatar}>
            {row.applicant.firstName[0]}{row.applicant.lastName[0]}
          </div>
          <div>
            <div className={styles.applicantName}>{row.applicant.fullName}</div>
            <div className={styles.applicantInfo}>
              {row.applicant.age} years • {row.applicant.gender}
            </div>
          </div>
        </div>
      )
    },
    {
      header: 'Contact',
      accessor: 'contact.email',
      width: '180px',
      render: (row: Admission) => (
        <div className={styles.contactCell}>
          <div className={styles.contactEmail}>{row.contact.email}</div>
          <div className={styles.contactPhone}>{row.contact.phone}</div>
        </div>
      )
    },
    {
      header: 'Applying For',
      accessor: 'applyingFor.class.name',
      sortable: true,
      width: '160px',
      render: (row: Admission) => (
        <div className={styles.applyingCell}>
          <span className={styles.className}>{row.applyingFor.class.name}</span>
          <span className={styles.deptName}>{row.applyingFor.department.name}</span>
        </div>
      )
    },
    {
      header: 'Type',
      accessor: 'admissionType',
      sortable: true,
      width: '100px',
      render: (row: Admission) => {
        const typeColors: Record<string, string> = {
          Online: styles.typeOnline,
          'Walk-in': styles.typeWalkin,
          Transfer: styles.typeTransfer
        };
        return (
          <span className={`${styles.typeBadge} ${typeColors[row.admissionType]}`}>
            {row.admissionType}
          </span>
        );
      }
    },
    {
      header: 'Payment',
      accessor: 'payment.paid',
      sortable: true,
      width: '100px',
      render: (row: Admission) => (
        <div className={styles.paymentCell}>
          {row.payment.paid ? (
            <span className={styles.paymentPaid}>
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path fill="currentColor" d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z" />
              </svg>
              Paid
            </span>
          ) : (
            <span className={styles.paymentPending}>
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M16.59,7.58L10,14.17L7.41,11.59L6,13L10,17L18,9L16.59,7.58Z" />
              </svg>
              Pending
            </span>
          )}
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      sortable: true,
      width: '130px',
      render: (row: Admission) => {
        const statusColors: Record<string, string> = {
          Submitted: styles.statusSubmitted,
          'Under Review': styles.statusReview,
          Approved: styles.statusApproved,
          Rejected: styles.statusRejected,
          Withdrawn: styles.statusWithdrawn
        };
        return (
          <span className={`${styles.statusBadge} ${statusColors[row.status]}`}>
            {row.status}
          </span>
        );
      }
    },
    {
      header: 'Submitted',
      accessor: 'timeline.submittedAt',
      sortable: true,
      width: '110px',
      render: (row: Admission) => (
        <span className={styles.dateText}>{row.timeline.submittedAt}</span>
      )
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
        { label: 'Submitted', value: 'Submitted' },
        { label: 'Under Review', value: 'Under Review' },
        { label: 'Approved', value: 'Approved' },
        { label: 'Rejected', value: 'Rejected' },
        { label: 'Withdrawn', value: 'Withdrawn' }
      ]
    },
    {
      label: 'Admission Type',
      value: 'admissionType',
      key: 'admissionType',
      type: 'select' as const,
      options: [
        { label: 'Online', value: 'Online' },
        { label: 'Walk-in', value: 'Walk-in' },
        { label: 'Transfer', value: 'Transfer' }
      ]
    },
    {
      label: 'Department',
      value: 'applyingFor.department.name',
      key: 'applyingFor.department.name',
      type: 'select' as const,
      options: [
        { label: 'Science', value: 'Science' },
        { label: 'Business', value: 'Business' },
        { label: 'Arts', value: 'Arts' }
      ]
    },
    {
      label: 'Payment Status',
      value: 'payment.paid',
      key: 'payment.paid',
      type: 'select' as const,
      options: [
        { label: 'Paid', value: true },
        { label: 'Pending', value: false }
      ]
    }
  ];

  const sortOptions = [
    { label: 'Name (A-Z)', value: 'name-asc', key: 'applicant.fullName', order: 'asc' as const },
    { label: 'Name (Z-A)', value: 'name-desc', key: 'applicant.fullName', order: 'desc' as const },
    { label: 'Date (Newest)', value: 'date-desc', key: 'timeline.submittedAt', order: 'desc' as const },
    { label: 'Date (Oldest)', value: 'date-asc', key: 'timeline.submittedAt', order: 'asc' as const },
    { label: 'App Number (Asc)', value: 'app-asc', key: 'applicationNumber', order: 'asc' as const },
    { label: 'App Number (Desc)', value: 'app-desc', key: 'applicationNumber', order: 'desc' as const }
  ];

  // CRUD Operations
  const handleCreate = () => {
    setModalMode('create');
    setActiveTab('applicant');
    setFormData({
      applicationNumber: '',
      applicant: {
        firstName: '',
        lastName: '',
        fullName: '',
        gender: 'Male',
        dateOfBirth: '',
        age: 0
      },
      contact: {
        email: '',
        phone: '',
        address: ''
      },
      guardian: {
        name: '',
        relationship: 'Mother',
        phone: '',
        email: ''
      },
      previousSchool: {
        name: '',
        lastClass: '',
        averageScore: 0
      },
      applyingFor: {
        department: { id: '', name: '' },
        class: { id: '', name: '' },
        academicYear: '2025/2026'
      },
      admissionType: 'Online',
      status: 'Submitted',
      reviewNotes: null,
      documents: {
        birthCertificate: false,
        previousResult: false,
        passportPhoto: false
      },
      payment: {
        applicationFee: 20000,
        paid: false,
        paymentReference: null
      },
      timeline: {
        submittedAt: new Date().toISOString().split('T')[0],
        reviewedAt: null,
        approvedAt: null
      }
    });
    setShowModal(true);
  };

  const handleEdit = (admission: Admission) => {
    setModalMode('edit');
    setActiveTab('applicant');
    setCurrentAdmission(admission);
    setFormData(admission);
    setShowModal(true);
  };

  const handleView = (admission: Admission) => {
    setModalMode('view');
    setActiveTab('applicant');
    setCurrentAdmission(admission);
    setFormData(admission);
    setShowModal(true);
  };

  const handleDelete = (admissionId: string) => {
    setAdmissionToDelete(admissionId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (admissionToDelete) {
      setAdmissions(admissions.filter(a => a.id !== admissionToDelete));
      setFilteredAdmissions(filteredAdmissions.filter(a => a.id !== admissionToDelete));
      setShowDeleteConfirm(false);
      setAdmissionToDelete(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Auto-generate fullName and calculate age
    const fullName = `${formData.applicant?.firstName} ${formData.applicant?.lastName}`;
    const age = formData.applicant?.dateOfBirth 
      ? new Date().getFullYear() - new Date(formData.applicant.dateOfBirth).getFullYear()
      : 0;
    
    if (modalMode === 'create') {
      const newAdmission: Admission = {
        id: `ADM-APP-${Date.now()}`,
        applicationNumber: `APP-2026-${String(admissions.length + 1).padStart(4, '0')}`,
        ...formData,
        applicant: {
          ...formData.applicant!,
          fullName,
          age
        },
        createdAt: new Date().toISOString().split('T')[0]
      } as Admission;
      setAdmissions([...admissions, newAdmission]);
      setFilteredAdmissions([...filteredAdmissions, newAdmission]);
    } else if (modalMode === 'edit' && currentAdmission) {
      const updatedAdmissions = admissions.map(a => 
        a.id === currentAdmission.id 
          ? { 
              ...a, 
              ...formData, 
              applicant: { ...formData.applicant!, fullName, age } 
            } 
          : a
      );
      setAdmissions(updatedAdmissions);
      setFilteredAdmissions(updatedAdmissions);
    }
    
    setShowModal(false);
    setCurrentAdmission(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    // Handle nested fields
    if (name.includes('.')) {
      const parts = name.split('.');
      if (parts.length === 2) {
        const [parent, child] = parts;
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...(prev[parent as keyof Admission] as any),
            [child]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value
          }
        }));
      } else if (parts.length === 3) {
        const [parent, child, grandchild] = parts;
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...(prev[parent as keyof Admission] as any),
            [child]: {
              ...((prev[parent as keyof Admission] as any)?.[child] || {}),
              [grandchild]: type === 'checkbox' ? checked : value
            }
          }
        }));
      }
    } else {
      setFormData(prev => ({ 
        ...prev, 
        [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value 
      }));
    }
  };

  // Quick status update
  const handleStatusChange = (admissionId: string, newStatus: Admission['status']) => {
    const updatedAdmissions = admissions.map(a => {
      if (a.id === admissionId) {
        const timeline = { ...a.timeline };
        if (newStatus === 'Under Review' && !timeline.reviewedAt) {
          timeline.reviewedAt = new Date().toISOString().split('T')[0];
        }
        if (newStatus === 'Approved' && !timeline.approvedAt) {
          timeline.approvedAt = new Date().toISOString().split('T')[0];
        }
        return { ...a, status: newStatus, timeline };
      }
      return a;
    });
    setAdmissions(updatedAdmissions);
    setFilteredAdmissions(updatedAdmissions);
  };

  // Table actions
  const actions = [
    {
      label: 'View',
      variant: 'primary',
      onClick: (row: Admission) => handleView(row),
      icon: (
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path fill="currentColor" d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z" />
        </svg>
      )
    },
    {
      label: 'Edit',
      variant: 'secondary',
      onClick: (row: Admission) => handleEdit(row),
      icon: (
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path fill="currentColor" d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />
        </svg>
      )
    },
    {
      label: 'Approve',
      variant: 'success',
      onClick: (row: Admission) => handleStatusChange(row.id, 'Approved'),
      hidden: (row: Admission) => row.status === 'Approved',
      icon: (
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path fill="currentColor" d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z" />
        </svg>
      )
    },
    {
      label: 'Delete',
      variant: 'danger',
      onClick: (row: Admission) => handleDelete(row.id),
      icon: (
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path fill="currentColor" d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
        </svg>
      )
    }
  ];

  // Render expanded row
  const renderExpandedRow = (row: Admission) => {
    const allDocsComplete = row.documents.birthCertificate && 
                            row.documents.previousResult && 
                            row.documents.passportPhoto;

    return (
      <div className={styles.expandedContent}>
        <div className={styles.expandedSection}>
          <h4>Guardian Information</h4>
          <div className={styles.guardianInfo}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Name:</span>
              <span className={styles.infoValue}>{row.guardian.name}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Relationship:</span>
              <span className={styles.infoValue}>{row.guardian.relationship}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Phone:</span>
              <span className={styles.infoValue}>{row.guardian.phone}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Email:</span>
              <span className={styles.infoValue}>{row.guardian.email}</span>
            </div>
          </div>
        </div>
        
        <div className={styles.expandedSection}>
          <h4>Previous School</h4>
          <div className={styles.schoolInfo}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>School Name:</span>
              <span className={styles.infoValue}>{row.previousSchool.name}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Last Class:</span>
              <span className={styles.infoValue}>{row.previousSchool.lastClass}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Average Score:</span>
              <span className={styles.infoValue}>{row.previousSchool.averageScore}%</span>
            </div>
          </div>
        </div>

        <div className={styles.expandedSection}>
          <h4>Documents Status</h4>
          <div className={styles.documentsGrid}>
            <div className={`${styles.docItem} ${row.documents.birthCertificate ? styles.docComplete : styles.docMissing}`}>
              <svg viewBox="0 0 24 24" width="20" height="20">
                {row.documents.birthCertificate ? (
                  <path fill="currentColor" d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z" />
                ) : (
                  <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                )}
              </svg>
              <span>Birth Certificate</span>
            </div>
            <div className={`${styles.docItem} ${row.documents.previousResult ? styles.docComplete : styles.docMissing}`}>
              <svg viewBox="0 0 24 24" width="20" height="20">
                {row.documents.previousResult ? (
                  <path fill="currentColor" d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z" />
                ) : (
                  <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                )}
              </svg>
              <span>Previous Result</span>
            </div>
            <div className={`${styles.docItem} ${row.documents.passportPhoto ? styles.docComplete : styles.docMissing}`}>
              <svg viewBox="0 0 24 24" width="20" height="20">
                {row.documents.passportPhoto ? (
                  <path fill="currentColor" d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z" />
                ) : (
                  <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                )}
              </svg>
              <span>Passport Photo</span>
            </div>
          </div>
          {allDocsComplete && (
            <div className={styles.docsComplete}>✓ All documents submitted</div>
          )}
        </div>

        <div className={styles.expandedSection}>
          <h4>Timeline</h4>
          <div className={styles.timeline}>
            <div className={styles.timelineItem}>
              <div className={styles.timelineDot}></div>
              <div>
                <div className={styles.timelineLabel}>Submitted</div>
                <div className={styles.timelineDate}>{row.timeline.submittedAt}</div>
              </div>
            </div>
            {row.timeline.reviewedAt && (
              <div className={styles.timelineItem}>
                <div className={styles.timelineDot}></div>
                <div>
                  <div className={styles.timelineLabel}>Reviewed</div>
                  <div className={styles.timelineDate}>{row.timeline.reviewedAt}</div>
                </div>
              </div>
            )}
            {row.timeline.approvedAt && (
              <div className={styles.timelineItem}>
                <div className={styles.timelineDot}></div>
                <div>
                  <div className={styles.timelineLabel}>Approved</div>
                  <div className={styles.timelineDate}>{row.timeline.approvedAt}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.pageContainer}>
      <Header 
        title="Admissions Management"
        subtitle="Manage student applications, reviews, and approvals"
        customActions={
          <button className={styles.addButton} onClick={handleCreate}>
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
            </svg>
            New Application
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
            data={admissions}
            onFilterChange={setFilteredAdmissions}
            searchKeys={['applicationNumber', 'applicant.fullName', 'contact.email', 'contact.phone', 'guardian.name']}
            sortOptions={sortOptions}
            filterOptions={filterOptions}
            variant="default"
            showSearch={true}
            showSort={true}
            showFilter={true}
            searchPlaceholder="Search by name, application number, email..."
            enableReset={true}
          />
        </div>

        {/* Table Section */}
        <div className={styles.tableSection}>
          <Table
            columns={columns}
            data={filteredAdmissions}
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
            emptyMessage="No applications found"
            loading={false}
          />
        </div>
      </div>

      {/* Create/Edit Modal - Continued in next file due to length */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>
                {modalMode === 'create' && 'New Application'}
                {modalMode === 'edit' && 'Edit Application'}
                {modalMode === 'view' && 'Application Details'}
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
                  className={`${styles.tab} ${activeTab === 'applicant' ? styles.activeTab : ''}`}
                  onClick={() => setActiveTab('applicant')}
                >
                  Applicant Info
                </button>
                <button 
                  className={`${styles.tab} ${activeTab === 'guardian' ? styles.activeTab : ''}`}
                  onClick={() => setActiveTab('guardian')}
                >
                  Guardian & School
                </button>
                <button 
                  className={`${styles.tab} ${activeTab === 'academic' ? styles.activeTab : ''}`}
                  onClick={() => setActiveTab('academic')}
                >
                  Academic Details
                </button>
                <button 
                  className={`${styles.tab} ${activeTab === 'payment' ? styles.activeTab : ''}`}
                  onClick={() => setActiveTab('payment')}
                >
                  Payment & Documents
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className={styles.modalBody}>
              {/* Applicant Tab */}
              {(activeTab === 'applicant' || modalMode === 'view') && (
                <div className={styles.tabContent}>
                  <div className={styles.formSection}>
                    <h3 className={styles.sectionTitle}>Personal Information</h3>
                    
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label>First Name *</label>
                        <input
                          type="text"
                          name="applicant.firstName"
                          value={formData.applicant?.firstName}
                          onChange={handleInputChange}
                          required
                          disabled={modalMode === 'view'}
                          placeholder="Samuel"
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label>Last Name *</label>
                        <input
                          type="text"
                          name="applicant.lastName"
                          value={formData.applicant?.lastName}
                          onChange={handleInputChange}
                          required
                          disabled={modalMode === 'view'}
                          placeholder="Johnson"
                        />
                      </div>
                    </div>

                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label>Gender *</label>
                        <select
                          name="applicant.gender"
                          value={formData.applicant?.gender}
                          onChange={handleInputChange}
                          required
                          disabled={modalMode === 'view'}
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                      </div>

                      <div className={styles.formGroup}>
                        <label>Date of Birth *</label>
                        <input
                          type="date"
                          name="applicant.dateOfBirth"
                          value={formData.applicant?.dateOfBirth}
                          onChange={handleInputChange}
                          required
                          disabled={modalMode === 'view'}
                        />
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label>Email *</label>
                      <input
                        type="email"
                        name="contact.email"
                        value={formData.contact?.email}
                        onChange={handleInputChange}
                        required
                        disabled={modalMode === 'view'}
                        placeholder="samuel.johnson@email.com"
                      />
                    </div>

                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label>Phone *</label>
                        <input
                          type="tel"
                          name="contact.phone"
                          value={formData.contact?.phone}
                          onChange={handleInputChange}
                          required
                          disabled={modalMode === 'view'}
                          placeholder="08012345678"
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label>Admission Type *</label>
                        <select
                          name="admissionType"
                          value={formData.admissionType}
                          onChange={handleInputChange}
                          required
                          disabled={modalMode === 'view'}
                        >
                          <option value="Online">Online</option>
                          <option value="Walk-in">Walk-in</option>
                          <option value="Transfer">Transfer</option>
                        </select>
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label>Address</label>
                      <textarea
                        name="contact.address"
                        value={formData.contact?.address}
                        onChange={handleInputChange}
                        disabled={modalMode === 'view'}
                        rows={2}
                        placeholder="Full address"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Guardian & School Tab */}
              {activeTab === 'guardian' && modalMode !== 'view' && (
                <div className={styles.tabContent}>
                  <div className={styles.formSection}>
                    <h3 className={styles.sectionTitle}>Guardian Information</h3>
                    
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label>Guardian Name *</label>
                        <input
                          type="text"
                          name="guardian.name"
                          value={formData.guardian?.name}
                          onChange={handleInputChange}
                          required
                          placeholder="Grace Johnson"
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label>Relationship *</label>
                        <select
                          name="guardian.relationship"
                          value={formData.guardian?.relationship}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="Mother">Mother</option>
                          <option value="Father">Father</option>
                          <option value="Guardian">Guardian</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label>Guardian Phone *</label>
                        <input
                          type="tel"
                          name="guardian.phone"
                          value={formData.guardian?.phone}
                          onChange={handleInputChange}
                          required
                          placeholder="08087654321"
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label>Guardian Email</label>
                        <input
                          type="email"
                          name="guardian.email"
                          value={formData.guardian?.email}
                          onChange={handleInputChange}
                          placeholder="grace.johnson@email.com"
                        />
                      </div>
                    </div>
                  </div>

                  <div className={styles.formSection}>
                    <h3 className={styles.sectionTitle}>Previous School</h3>
                    
                    <div className={styles.formGroup}>
                      <label>School Name *</label>
                      <input
                        type="text"
                        name="previousSchool.name"
                        value={formData.previousSchool?.name}
                        onChange={handleInputChange}
                        required
                        placeholder="Bright Future Academy"
                      />
                    </div>

                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label>Last Class *</label>
                        <input
                          type="text"
                          name="previousSchool.lastClass"
                          value={formData.previousSchool?.lastClass}
                          onChange={handleInputChange}
                          required
                          placeholder="JSS3"
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label>Average Score (%)</label>
                        <input
                          type="number"
                          name="previousSchool.averageScore"
                          value={formData.previousSchool?.averageScore}
                          onChange={handleInputChange}
                          min="0"
                          max="100"
                          placeholder="75"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Academic Details Tab */}
              {activeTab === 'academic' && modalMode !== 'view' && (
                <div className={styles.tabContent}>
                  <div className={styles.formSection}>
                    <h3 className={styles.sectionTitle}>Applying For</h3>
                    
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label>Department *</label>
                        <select
                          name="applyingFor.department.name"
                          value={formData.applyingFor?.department.name}
                          onChange={(e) => {
                            const deptMap: Record<string, any> = {
                              Science: { id: 'DEP-01', name: 'Science' },
                              Business: { id: 'DEP-02', name: 'Business' },
                              Arts: { id: 'DEP-03', name: 'Arts' }
                            };
                            setFormData(prev => ({
                              ...prev,
                              applyingFor: {
                                ...prev.applyingFor!,
                                department: deptMap[e.target.value]
                              }
                            }));
                          }}
                          required
                        >
                          <option value="">Select Department</option>
                          <option value="Science">Science</option>
                          <option value="Business">Business</option>
                          <option value="Arts">Arts</option>
                        </select>
                      </div>

                      <div className={styles.formGroup}>
                        <label>Class *</label>
                        <input
                          type="text"
                          name="applyingFor.class.name"
                          value={formData.applyingFor?.class.name}
                          onChange={handleInputChange}
                          required
                          placeholder="Science 1"
                        />
                      </div>
                    </div>

                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label>Academic Year *</label>
                        <select
                          name="applyingFor.academicYear"
                          value={formData.applyingFor?.academicYear}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="2025/2026">2025/2026</option>
                          <option value="2024/2025">2024/2025</option>
                        </select>
                      </div>

                      <div className={styles.formGroup}>
                        <label>Status *</label>
                        <select
                          name="status"
                          value={formData.status}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="Submitted">Submitted</option>
                          <option value="Under Review">Under Review</option>
                          <option value="Approved">Approved</option>
                          <option value="Rejected">Rejected</option>
                          <option value="Withdrawn">Withdrawn</option>
                        </select>
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label>Review Notes</label>
                      <textarea
                        name="reviewNotes"
                        value={formData.reviewNotes || ''}
                        onChange={handleInputChange}
                        rows={3}
                        placeholder="Internal notes about the application..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Payment & Documents Tab */}
              {activeTab === 'payment' && modalMode !== 'view' && (
                <div className={styles.tabContent}>
                  <div className={styles.formSection}>
                    <h3 className={styles.sectionTitle}>Payment Information</h3>
                    
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label>Application Fee (₦)</label>
                        <input
                          type="number"
                          name="payment.applicationFee"
                          value={formData.payment?.applicationFee}
                          onChange={handleInputChange}
                          min="0"
                          placeholder="20000"
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label>Payment Status</label>
                        <select
                          name="payment.paid"
                          value={String(formData.payment?.paid)}
                          onChange={(e) => {
                            setFormData(prev => ({
                              ...prev,
                              payment: {
                                ...prev.payment!,
                                paid: e.target.value === 'true'
                              }
                            }));
                          }}
                        >
                          <option value="false">Pending</option>
                          <option value="true">Paid</option>
                        </select>
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label>Payment Reference</label>
                      <input
                        type="text"
                        name="payment.paymentReference"
                        value={formData.payment?.paymentReference || ''}
                        onChange={handleInputChange}
                        placeholder="PAY-123456"
                      />
                    </div>
                  </div>

                  <div className={styles.formSection}>
                    <h3 className={styles.sectionTitle}>Required Documents</h3>
                    
                    <div className={styles.checkboxGroup}>
                      <label className={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          name="documents.birthCertificate"
                          checked={formData.documents?.birthCertificate}
                          onChange={handleInputChange}
                        />
                        <span>Birth Certificate</span>
                      </label>

                      <label className={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          name="documents.previousResult"
                          checked={formData.documents?.previousResult}
                          onChange={handleInputChange}
                        />
                        <span>Previous Result</span>
                      </label>

                      <label className={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          name="documents.passportPhoto"
                          checked={formData.documents?.passportPhoto}
                          onChange={handleInputChange}
                        />
                        <span>Passport Photograph</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* View Mode - Show All Data */}
              {modalMode === 'view' && (
                <div className={styles.viewMode}>
                  <div className={styles.viewSection}>
                    <h3 className={styles.sectionTitle}>Application Details</h3>
                    <div className={styles.viewGrid}>
                      <div className={styles.viewItem}>
                        <span className={styles.viewLabel}>Application Number:</span>
                        <span className={styles.viewValue}>{formData.applicationNumber}</span>
                      </div>
                      <div className={styles.viewItem}>
                        <span className={styles.viewLabel}>Type:</span>
                        <span className={styles.viewValue}>{formData.admissionType}</span>
                      </div>
                      <div className={styles.viewItem}>
                        <span className={styles.viewLabel}>Status:</span>
                        <span className={styles.viewValue}>{formData.status}</span>
                      </div>
                      <div className={styles.viewItem}>
                        <span className={styles.viewLabel}>Submitted:</span>
                        <span className={styles.viewValue}>{formData.timeline?.submittedAt}</span>
                      </div>
                    </div>
                  </div>

                  {renderExpandedRow(formData as Admission)}
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
                    {modalMode === 'create' ? 'Submit Application' : 'Update Application'}
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
            <h3>Delete Application</h3>
            <p>Are you sure you want to delete this application? This action cannot be undone.</p>
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

export default AdmissionsAdminPage;