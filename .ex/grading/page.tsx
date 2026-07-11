// app/(dashboard)/grading/page.tsx
"use client";

import React, { useState, useMemo } from "react";
import Header from "@/components/Header/Header";
import Stats from "@/components/Stats/Stats";
import Table from "@/components/Table/Table";
import styles from "./page.module.css";

type ClassType = {
  id: number;
  name: string;
  level: string;
  section: string | null;
};

type SubjectType = {
  id: number;
  title: string;
  subject_code: string;
  is_mandatory: boolean;
};

type StudentGrade = {
  student: {
    id: number;
    name: string;
    first_name: string;
    last_name: string;
    admission_number: string;
    student_id: string;
  };
  assessments: {
    total: number;
    maxTotal: number;
    percentage: string;
    count: number;
    items: any[];
  };
  exams: {
    total: number;
    maxTotal: number;
    percentage: string;
    count: number;
    items: any[];
  };
  finalScore: string;
  letterGrade: string;
  gradePoint: number | null;
  remarks: string;
};

type GradingSummary = {
  class: ClassType;
  subject: SubjectType;
  teacher: any;
  isMandatory: boolean;
  settings: {
    assessmentWeight: number;
    examWeight: number;
  };
  students: StudentGrade[];
  summary: {
    totalStudents: number;
    studentsWithScores: number;
    studentsWithoutScores: number;
    classAverage: string;
    passCount: number;
    failCount: number;
    passRate: string;
    gradeDistribution: {
      A: number;
      B: number;
      C: number;
      D: number;
      E: number;
      F: number;
      NoGrade: number;
    };
  };
};

// MOCK DATA - UI Presentation Only
const MOCK_CLASSES: ClassType[] = [
  { id: 1, name: "JHS 1", level: "JHS", section: "A" },
  { id: 2, name: "JHS 1", level: "JHS", section: "B" },
  { id: 3, name: "JHS 2", level: "JHS", section: "A" },
  { id: 4, name: "JHS 2", level: "JHS", section: "B" },
  { id: 5, name: "JHS 3", level: "JHS", section: "A" },
  { id: 6, name: "JHS 3", level: "JHS", section: "B" },
];

const MOCK_ACADEMIC_YEARS = [
  { id: 1, year: "2024", term: "Term 1" },
  { id: 2, year: "2024", term: "Term 2" },
  { id: 3, year: "2024", term: "Term 3" },
];

const MOCK_SUBJECTS_BY_CLASS: Record<number, SubjectType[]> = {
  1: [
    { id: 101, title: "Mathematics", subject_code: "MTH101", is_mandatory: true },
    { id: 102, title: "Integrated Science", subject_code: "SCI101", is_mandatory: true },
    { id: 103, title: "English Language", subject_code: "ENG101", is_mandatory: true },
    { id: 109, title: "Ghanaian Language", subject_code: "GHL101", is_mandatory: false },
  ],
  2: [
    { id: 101, title: "Mathematics", subject_code: "MTH101", is_mandatory: true },
    { id: 102, title: "Integrated Science", subject_code: "SCI101", is_mandatory: true },
    { id: 103, title: "English Language", subject_code: "ENG101", is_mandatory: true },
    { id: 104, title: "Social Studies", subject_code: "SST102", is_mandatory: true },
  ],
  3: [
    { id: 101, title: "Mathematics", subject_code: "MTH101", is_mandatory: true },
    { id: 102, title: "Integrated Science", subject_code: "SCI101", is_mandatory: true },
    { id: 105, title: "Computing", subject_code: "COM102", is_mandatory: false },
    { id: 106, title: "Creative Arts", subject_code: "ART103", is_mandatory: false },
  ],
  4: [
    { id: 101, title: "Mathematics", subject_code: "MTH101", is_mandatory: true },
    { id: 107, title: "RME", subject_code: "RME103", is_mandatory: true },
    { id: 108, title: "French", subject_code: "FRN103", is_mandatory: false },
    { id: 110, title: "Pre-Technical Skills", subject_code: "TEC102", is_mandatory: false },
  ],
  5: [
    { id: 101, title: "Mathematics", subject_code: "MTH101", is_mandatory: true },
    { id: 102, title: "Integrated Science", subject_code: "SCI101", is_mandatory: true },
    { id: 103, title: "English Language", subject_code: "ENG101", is_mandatory: true },
    { id: 104, title: "Social Studies", subject_code: "SST102", is_mandatory: true },
  ],
  6: [
    { id: 101, title: "Mathematics", subject_code: "MTH101", is_mandatory: true },
    { id: 102, title: "Integrated Science", subject_code: "SCI101", is_mandatory: true },
    { id: 105, title: "Computing", subject_code: "COM102", is_mandatory: false },
    { id: 106, title: "Creative Arts", subject_code: "ART103", is_mandatory: false },
  ],
};

const MOCK_GRADING_DATA: GradingSummary = {
  class: { id: 1, name: "JHS 1", level: "JHS", section: "A" },
  subject: { id: 101, title: "Mathematics", subject_code: "MTH101", is_mandatory: true },
  teacher: {
    id: 1,
    first_name: "Sarah",
    last_name: "Mensah",
    email: "sarah.mensah@abtl.edu.gh",
  },
  isMandatory: true,
  settings: {
    assessmentWeight: 70,
    examWeight: 30,
  },
  students: [
    {
      student: {
        id: 1,
        name: "Kwame Asare",
        first_name: "Kwame",
        last_name: "Asare",
        admission_number: "JHS/001/24",
        student_id: "STU001",
      },
      assessments: { total: 85, maxTotal: 100, percentage: "85", count: 5, items: [] },
      exams: { total: 78, maxTotal: 100, percentage: "78", count: 1, items: [] },
      finalScore: "82.9",
      letterGrade: "B",
      gradePoint: 3.0,
      remarks: "Good performance",
    },
    {
      student: {
        id: 2,
        name: "Adwoa Mensah",
        first_name: "Adwoa",
        last_name: "Mensah",
        admission_number: "JHS/002/24",
        student_id: "STU002",
      },
      assessments: { total: 92, maxTotal: 100, percentage: "92", count: 5, items: [] },
      exams: { total: 88, maxTotal: 100, percentage: "88", count: 1, items: [] },
      finalScore: "90.8",
      letterGrade: "A",
      gradePoint: 4.0,
      remarks: "Excellent work",
    },
    {
      student: {
        id: 3,
        name: "John Darko",
        first_name: "John",
        last_name: "Darko",
        admission_number: "JHS/003/24",
        student_id: "STU003",
      },
      assessments: { total: 45, maxTotal: 100, percentage: "45", count: 5, items: [] },
      exams: { total: 50, maxTotal: 100, percentage: "50", count: 1, items: [] },
      finalScore: "46.5",
      letterGrade: "F",
      gradePoint: 0.0,
      remarks: "Needs improvement",
    },
    {
      student: {
        id: 4,
        name: "Efua Osei",
        first_name: "Efua",
        last_name: "Osei",
        admission_number: "JHS/004/24",
        student_id: "STU004",
      },
      assessments: { total: 78, maxTotal: 100, percentage: "78", count: 5, items: [] },
      exams: { total: 72, maxTotal: 100, percentage: "72", count: 1, items: [] },
      finalScore: "76.2",
      letterGrade: "C",
      gradePoint: 2.0,
      remarks: "Satisfactory",
    },
    {
      student: {
        id: 5,
        name: "Michael Appiah",
        first_name: "Michael",
        last_name: "Appiah",
        admission_number: "JHS/005/24",
        student_id: "STU005",
      },
      assessments: { total: 0, maxTotal: 0, percentage: "0", count: 0, items: [] },
      exams: { total: 0, maxTotal: 0, percentage: "0", count: 0, items: [] },
      finalScore: "",
      letterGrade: "-",
      gradePoint: null,
      remarks: "No grades entered",
    },
  ],
  summary: {
    totalStudents: 5,
    studentsWithScores: 4,
    studentsWithoutScores: 1,
    classAverage: "74.1",
    passCount: 3,
    failCount: 1,
    passRate: "75.0",
    gradeDistribution: {
      A: 1,
      B: 1,
      C: 1,
      D: 0,
      E: 0,
      F: 1,
      NoGrade: 1,
    },
  },
};

const MOCK_OVERALL_STATS = {
  totalClasses: 6,
  totalSubjects: 8,
  totalEnrollments: 156,
  overallAverage: "76.3",
};

export default function GradingPage() {
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>("");
  const [selectedTerm, setSelectedTerm] = useState<string>("");

  // Get subjects based on selected class
  const subjects = selectedClass && MOCK_SUBJECTS_BY_CLASS[parseInt(selectedClass)]
    ? MOCK_SUBJECTS_BY_CLASS[parseInt(selectedClass)]
    : [];

  // Get grading data based on selections
  const getGradingData = (): GradingSummary | null => {
    if (!selectedClass || !selectedSubject) return null;
    
    // Return mock data for demonstration
    return {
      ...MOCK_GRADING_DATA,
      class: MOCK_CLASSES.find(c => c.id === parseInt(selectedClass)) || MOCK_GRADING_DATA.class,
      subject: subjects.find(s => s.id === parseInt(selectedSubject)) || MOCK_GRADING_DATA.subject,
    };
  };

  const gradingData = getGradingData();

  // Stats for display
  const stats = useMemo(() => {
    if (gradingData) {
      return [
        {
          id: 1,
          label: "Total Students",
          value: gradingData.summary.totalStudents,
          color: "blue",
          type: "students",
        },
        {
          id: 2,
          label: "Class Average",
          value: `${gradingData.summary.classAverage}%`,
          color: "green",
          type: "attendance",
        },
        {
          id: 3,
          label: "Pass Rate",
          value: `${gradingData.summary.passRate}%`,
          color: "purple",
          type: "classes",
        },
        {
          id: 4,
          label: "No Grade",
          value: gradingData.summary.studentsWithoutScores,
          color: "orange",
          type: "revenue",
        },
      ];
    }

    return [
      { id: 1, label: "Total Classes", value: MOCK_OVERALL_STATS.totalClasses, color: "blue", type: "classes" },
      { id: 2, label: "Total Subjects", value: MOCK_OVERALL_STATS.totalSubjects, color: "green", type: "subjects" },
      { id: 3, label: "Total Enrollments", value: MOCK_OVERALL_STATS.totalEnrollments, color: "purple", type: "students" },
      { id: 4, label: "Overall Average", value: `${MOCK_OVERALL_STATS.overallAverage}%`, color: "orange", type: "attendance" },
    ];
  }, [gradingData]);

  // Table columns for student grades
  const columns = [
    {
      header: "Student",
      accessor: "student",
      sortable: true,
      render: (row: StudentGrade) => (
        <div className={styles.studentCell}>
          <div className={styles.studentAvatar}>
            {row.student.first_name[0]}{row.student.last_name[0]}
          </div>
          <div>
            <div className={styles.studentName}>{row.student.name}</div>
            <div className={styles.studentId}>
              {row.student.admission_number || row.student.student_id || "—"}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Assessment",
      accessor: "assessments",
      sortable: true,
      width: "120px",
      render: (row: StudentGrade) => {
        if (row.assessments.count === 0 && row.exams.count === 0) {
          return <span className={styles.noScore}>—</span>;
        }
        return (
          <div className={styles.scoreCell}>
            <span className={styles.scoreValue}>{row.assessments.percentage}%</span>
            <span className={styles.scoreDetail}>
              ({row.assessments.total}/{row.assessments.maxTotal})
            </span>
          </div>
        );
      },
    },
    {
      header: "Exam",
      accessor: "exams",
      sortable: true,
      width: "120px",
      render: (row: StudentGrade) => {
        if (row.assessments.count === 0 && row.exams.count === 0) {
          return <span className={styles.noScore}>—</span>;
        }
        return (
          <div className={styles.scoreCell}>
            <span className={styles.scoreValue}>{row.exams.percentage}%</span>
            <span className={styles.scoreDetail}>
              ({row.exams.total}/{row.exams.maxTotal})
            </span>
          </div>
        );
      },
    },
    {
      header: "Total Score",
      accessor: "finalScore",
      sortable: true,
      width: "100px",
      render: (row: StudentGrade) => {
        if (row.assessments.count === 0 && row.exams.count === 0) {
          return <span className={styles.noScore}>—</span>;
        }
        return <span className={styles.finalScore}>{row.finalScore}%</span>;
      },
    },
    {
      header: "Grade",
      accessor: "letterGrade",
      sortable: true,
      width: "80px",
      render: (row: StudentGrade) => {
        if (row.letterGrade === "-") {
          return <span className={styles.noGradeBadge}>—</span>;
        }
        const gradeClass = 
          row.letterGrade === "A" ? styles.gradeA :
          row.letterGrade === "B" ? styles.gradeB :
          row.letterGrade === "C" ? styles.gradeC :
          row.letterGrade === "D" ? styles.gradeD :
          row.letterGrade === "E" ? styles.gradeE : styles.gradeF;
        return (
          <span className={`${styles.gradeBadge} ${gradeClass}`}>
            {row.letterGrade}
          </span>
        );
      },
    },
    {
      header: "Remarks",
      accessor: "remarks",
      sortable: true,
      width: "120px",
      render: (row: StudentGrade) => (
        <span className={row.assessments.count > 0 || row.exams.count > 0 ? styles.remarks : styles.noScore}>
          {row.remarks}
        </span>
      ),
    },
  ];

  const loading = false;
  const loadingSubjects = false;

  return (
    <div className={styles.pageContainer}>
      <Header
        title="Grading Management"
        subtitle="View student grades, assessment and exam scores based on class curriculum"
      />

      <div className={styles.contentWrapper}>
        {/* Filters */}
        <div className={styles.filterSection}>
          <div className={styles.filterRow}>
            <div className={styles.filterGroup}>
              <label>Academic Year</label>
              <select
                value={selectedAcademicYear}
                onChange={(e) => setSelectedAcademicYear(e.target.value)}
              >
                <option value="">All Years</option>
                {MOCK_ACADEMIC_YEARS.map((year) => (
                  <option key={year.id} value={year.id}>
                    {year.year} - {year.term}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label>Class *</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                <option value="">Select Class</option>
                {MOCK_CLASSES.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} {cls.section ? `- ${cls.section}` : ""} ({cls.level})
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label>Subject *</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                disabled={!selectedClass}
              >
                <option value="">Select Subject</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.title} ({subject.subject_code})
                    {subject.is_mandatory ? " *" : ""}
                  </option>
                ))}
              </select>
              {selectedClass && subjects.length === 0 && (
                <div className={styles.filterWarning}>
                  No subjects assigned to this class. Go to Classes page &gt; Class Subjects tab to assign subjects.
                </div>
              )}
            </div>

            <div className={styles.filterGroup}>
              <label>Term</label>
              <select
                value={selectedTerm}
                onChange={(e) => setSelectedTerm(e.target.value)}
              >
                <option value="">All Terms</option>
                <option value="1">Term 1</option>
                <option value="2">Term 2</option>
                <option value="3">Term 3</option>
              </select>
            </div>
          </div>
        </div>

        {/* Class & Subject Info */}
        {gradingData && (
          <div className={styles.infoSection}>
            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>🏫</div>
              <div className={styles.infoContent}>
                <span className={styles.infoLabel}>Class</span>
                <span className={styles.infoValue}>
                  {gradingData.class.name} {gradingData.class.section ? `- ${gradingData.class.section}` : ""}
                </span>
                <span className={styles.infoSub}>{gradingData.class.level}</span>
              </div>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>📘</div>
              <div className={styles.infoContent}>
                <span className={styles.infoLabel}>Subject</span>
                <span className={styles.infoValue}>{gradingData.subject.title}</span>
                <span className={styles.infoSub}>
                  {gradingData.subject.subject_code}
                  {gradingData.isMandatory && <span className={styles.mandatoryBadge}>Mandatory</span>}
                </span>
              </div>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>👨‍🏫</div>
              <div className={styles.infoContent}>
                <span className={styles.infoLabel}>Teacher</span>
                <span className={styles.infoValue}>
                  {gradingData.teacher ? `${gradingData.teacher.first_name} ${gradingData.teacher.last_name}` : "Not Assigned"}
                </span>
                <span className={styles.infoSub}>{gradingData.teacher?.email || "—"}</span>
              </div>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>⚖️</div>
              <div className={styles.infoContent}>
                <span className={styles.infoLabel}>Weight Distribution</span>
                <span className={styles.infoValue}>
                  Assessment: {gradingData.settings.assessmentWeight}% | Exam: {gradingData.settings.examWeight}%
                </span>
                <span className={styles.infoSub}>
                  {gradingData.settings.assessmentWeight === 70 && gradingData.settings.examWeight === 30
                    ? "Using default weights"
                    : "Custom weights applied"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        {stats && (
          <Stats stats={stats} variant="cards" columns={4} showIcon={true} size="md" />
        )}

        {/* Grade Distribution Chart */}
        {gradingData && gradingData.summary.gradeDistribution && (
          <div className={styles.distributionSection}>
            <h3 className={styles.sectionTitle}>Grade Distribution</h3>
            <div className={styles.distributionBars}>
              {Object.entries(gradingData.summary.gradeDistribution).map(([grade, count]) => {
                const total = gradingData.summary.totalStudents;
                const percentage = total > 0 ? ((count as number) / total) * 100 : 0;
                const barClass = 
                  grade === "A" ? styles.barA :
                  grade === "B" ? styles.barB :
                  grade === "C" ? styles.barC :
                  grade === "D" ? styles.barD :
                  grade === "E" ? styles.barE :
                  grade === "F" ? styles.barF : styles.barNoGrade;
                
                const gradeLabel = grade === "NoGrade" ? "No Grade" : `Grade ${grade}`;
                
                return (
                  <div key={grade} className={styles.distributionItem}>
                    <div className={styles.distributionLabel}>
                      <span className={`${styles.gradeDot} ${barClass}`}></span>
                      <span>{gradeLabel}</span>
                      <span className={styles.distributionCount}>{count as number} students</span>
                    </div>
                    <div className={styles.distributionBarContainer}>
                      <div
                        className={`${styles.distributionBar} ${barClass}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className={styles.distributionPercentage}>{percentage.toFixed(1)}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Students Table */}
        {gradingData && (
          <div className={styles.tableSection}>
            <div className={styles.tableHeader}>
              <h3 className={styles.tableTitle}>Student Grades</h3>
              <div className={styles.tableInfo}>
                Showing {gradingData.students.length} of {gradingData.summary.totalStudents} students
                {gradingData.summary.studentsWithoutScores > 0 && (
                  <span className={styles.warningBadge}>
                    {gradingData.summary.studentsWithoutScores} student(s) have no grades
                  </span>
                )}
              </div>
            </div>
            <Table
              columns={columns}
              data={gradingData.students}
              variant="default"
              size="md"
              stickyHeader={true}
              sortable={true}
              pagination={true}
              pageSize={10}
              showRowNumbers={true}
              emptyMessage="No students found"
              loading={loading}
            />
          </div>
        )}

        {/* No Selection State */}
        {!selectedClass && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📊</div>
            <h3>Select a Class and Subject</h3>
            <p>Please select a class and subject from the filters above to view grading information.</p>
            <p className={styles.emptyHint}>
              Subjects shown are only those assigned to the selected class via Class Subjects.
            </p>
          </div>
        )}

        {/* Class Selected but No Subjects */}
        {selectedClass && subjects.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📚</div>
            <h3>No Subjects Assigned</h3>
            <p>This class has no subjects assigned to it yet.</p>
            <p className={styles.emptyHint}>
              Go to the Classes page &gt; Class Subjects tab to assign subjects to this class.
            </p>
          </div>
        )}

        {/* No Data State */}
        {selectedClass && selectedSubject && !gradingData && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📭</div>
            <h3>No Grading Data Available</h3>
            <p>No scores have been recorded for this class and subject yet.</p>
            <p className={styles.emptyHint}>
              Teachers need to enter assessment and exam scores first.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}