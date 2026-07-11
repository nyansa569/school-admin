// // app/(teacher)/teacher/(sub-teacher)/[module]/class/[classid]/subject/[subjectid]/components/ExamView.tsx
// "use client";

// import React, { useState, useEffect } from "react";
// import {
//   getStudentScores,
//   getAssessmentTitles,
//   createBulkScores,
//   getCalculatedGrades,
//   getGradeWeights,
//   updateGradeWeights,
//   checkTeacherAuthorization,
// } from "@/lib/action/teacher/grade";
// import { getStudentsByClass } from "@/lib/action/teacher/attendance";
// import { getTermsAndAcademicYears } from "@/lib/action/teacher/attendance";
// import styles from "./ExamView.module.css";

// type ExamViewProps = {
//   classId: number;
//   subjectId: number;
// };

// type Student = {
//   id: number;
//   first_name: string;
//   last_name: string;
//   admission_number: string;
//   student_id: string;
// };

// type Score = {
//   id: number;
//   student_id: number;
//   mark: number;
//   total: number;
//   title: string;
//   description: string;
//   created_at: string;
// };

// type ExamTitle = {
//   title: string;
//   description: string;
//   total: number;
//   id: number;
// };

// type GradeResult = {
//   student: Student;
//   assessments: Score[];
//   exams: Score[];
//   assessmentTotal: number;
//   examTotal: number;
//   assessmentMaxTotal: number;
//   examMaxTotal: number;
//   assessmentPercentage: string;
//   examPercentage: string;
//   finalScore: string;
//   letterGrade: string;
//   gradePoint: number;
//   remarks: string;
// };

// export default function ExamView({ classId, subjectId }: ExamViewProps) {
//   const [loading, setLoading] = useState(true);
//   const [authorized, setAuthorized] = useState<boolean | null>(null);
//   const [students, setStudents] = useState<Student[]>([]);
//   const [examTitles, setExamTitles] = useState<ExamTitle[]>([]);
//   const [grades, setGrades] = useState<GradeResult[]>([]);
//   const [summary, setSummary] = useState<any>(null);
//   const [viewMode, setViewMode] = useState<"overview" | "grade">("overview");
//   const [selectedTerm, setSelectedTerm] = useState<number | undefined>(undefined);
//   const [selectedAcademicYear, setSelectedAcademicYear] = useState<number | undefined>(undefined);
//   const [academicYears, setAcademicYears] = useState<any[]>([]);
//   const [assessmentWeight, setAssessmentWeight] = useState(70);
//   const [examWeight, setExamWeight] = useState(30);
//   const [showWeightModal, setShowWeightModal] = useState(false);
  
//   // Bulk grading states
//   const [showBulkModal, setShowBulkModal] = useState(false);
//   const [examTitle, setExamTitle] = useState("");
//   const [examDescription, setExamDescription] = useState("");
//   const [examTotalMarks, setExamTotalMarks] = useState(100);
//   const [studentScores, setStudentScores] = useState<Map<number, number>>(new Map());

//   useEffect(() => {
//     checkAccess();
//   }, []);

//   useEffect(() => {
//     if (authorized === true) {
//       loadData();
//     }
//   }, [authorized, selectedTerm, selectedAcademicYear, assessmentWeight, examWeight]);

//   const checkAccess = async () => {
//     setLoading(true);
//     const result = await checkTeacherAuthorization(classId, subjectId);
//     if (result.isAuthorized) {
//       setAuthorized(true);
//     } else {
//       setAuthorized(false);
//     }
//     setLoading(false);
//   };

//   const loadData = async () => {
//     setLoading(true);
    
//     // Load students
//     const studentsResult = await getStudentsByClass(classId);
//     if (studentsResult.students) {
//       setStudents(studentsResult.students);
//     }
    
//     // Load exam titles
//     const titlesResult = await getAssessmentTitles(classId, subjectId, "exam", selectedTerm, selectedAcademicYear);
//     if (titlesResult.titles) {
//       setExamTitles(titlesResult.titles);
//     }
    
//     // Load academic years
//     const yearsResult = await getTermsAndAcademicYears();
//     if (yearsResult.academicYears) {
//       setAcademicYears(yearsResult.academicYears);
//     }
    
//     // Load weight settings
//     const weightsResult = await getGradeWeights(classId, subjectId, selectedTerm, selectedAcademicYear);
//     if (!weightsResult.error) {
//       setAssessmentWeight(weightsResult.assessmentWeight);
//       setExamWeight(weightsResult.examWeight);
//     }
    
//     // Load calculated grades
//     const gradesResult = await getCalculatedGrades(
//       classId, 
//       subjectId, 
//       assessmentWeight, 
//       examWeight, 
//       selectedTerm, 
//       selectedAcademicYear
//     );
//     if (gradesResult.students) {
//       setGrades(gradesResult.students);
//       setSummary(gradesResult.summary);
//     }
    
//     setLoading(false);
//   };

//   const handleWeightUpdate = async () => {
//     const result = await updateGradeWeights(
//       classId,
//       subjectId,
//       assessmentWeight,
//       examWeight,
//       selectedTerm,
//       selectedAcademicYear
//     );
//     if (result.success) {
//       setShowWeightModal(false);
//       await loadData();
//     } else {
//       alert(result.error);
//     }
//   };

//   const handleBulkGrade = async () => {
//     if (!examTitle.trim()) {
//       alert("Please enter an exam title");
//       return;
//     }

//     const scores = Array.from(studentScores.entries()).map(([studentId, mark]) => ({
//       studentId: parseInt(studentId.toString()),
//       mark: mark || 0,
//     }));

//     const result = await createBulkScores(
//       classId,
//       subjectId,
//       "exam",
//       examTitle,
//       examDescription,
//       examTotalMarks,
//       scores,
//       selectedTerm,
//       selectedAcademicYear
//     );

//     if (result.success) {
//       setShowBulkModal(false);
//       setExamTitle("");
//       setExamDescription("");
//       setExamTotalMarks(100);
//       setStudentScores(new Map());
//       await loadData();
//     } else {
//       alert(result.error);
//     }
//   };

//   const updateStudentScore = (studentId: number, mark: number) => {
//     const newScores = new Map(studentScores);
//     newScores.set(studentId, Math.min(mark, examTotalMarks));
//     setStudentScores(newScores);
//   };

//   const getLetterGradeColor = (grade: string) => {
//     switch (grade) {
//       case "A": return styles.gradeA;
//       case "B": return styles.gradeB;
//       case "C": return styles.gradeC;
//       case "D": return styles.gradeD;
//       case "E": return styles.gradeE;
//       default: return styles.gradeF;
//     }
//   };

//   if (loading) {
//     return (
//       <div className={styles.loading}>
//         <div className={styles.spinner}></div>
//         <p>Loading exam data...</p>
//       </div>
//     );
//   }

//   if (authorized === false) {
//     return (
//       <div className={styles.unauthorized}>
//         <div className={styles.unauthorizedIcon}>
//           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//             <path d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
//             <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z" />
//           </svg>
//         </div>
//         <h2>Unauthorized Access</h2>
//         <p>You are not authorized to manage exams for this class and subject.</p>
//       </div>
//     );
//   }

//   return (
//     <div className={styles.container}>
//       {/* Header */}
//       <div className={styles.header}>
//         <div>
//           <h1 className={styles.title}>Exam Management</h1>
//           <p className={styles.subtitle}>Class ID: {classId} | Subject ID: {subjectId}</p>
//         </div>
//         <div className={styles.headerActions}>
//           <div className={styles.viewToggle}>
//             <button
//               className={`${styles.viewButton} ${viewMode === "overview" ? styles.activeView : ""}`}
//               onClick={() => setViewMode("overview")}
//             >
//               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                 <path d="M3 13h8V3H3v10Zm0 8h8v-6H3v6Zm10 0h8V11h-8v10Zm0-18v6h8V3h-8Z" />
//               </svg>
//               Overview
//             </button>
//             <button
//               className={`${styles.viewButton} ${viewMode === "grade" ? styles.activeView : ""}`}
//               onClick={() => setViewMode("grade")}
//             >
//               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                 <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2Z" />
//               </svg>
//               Grade Exam
//             </button>
//           </div>
//           <button
//             className={styles.weightButton}
//             onClick={() => setShowWeightModal(true)}
//           >
//             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//               <path d="M12 6v12m-3-3h6" />
//             </svg>
//             Weights: {assessmentWeight}/{examWeight}
//           </button>
//         </div>
//       </div>

//       {/* Filters */}
//       <div className={styles.filters}>
//         <div className={styles.filterGroup}>
//           <label>Academic Year</label>
//           <select
//             value={selectedAcademicYear || ""}
//             onChange={(e) => setSelectedAcademicYear(e.target.value ? parseInt(e.target.value) : undefined)}
//           >
//             <option value="">All Years</option>
//             {academicYears.map((year) => (
//               <option key={year.id} value={year.id}>
//                 {year.year} - {year.term}
//               </option>
//             ))}
//           </select>
//         </div>
//         <div className={styles.filterGroup}>
//           <label>Term</label>
//           <select
//             value={selectedTerm || ""}
//             onChange={(e) => setSelectedTerm(e.target.value ? parseInt(e.target.value) : undefined)}
//           >
//             <option value="">All Terms</option>
//             <option value="1">Term 1</option>
//             <option value="2">Term 2</option>
//             <option value="3">Term 3</option>
//           </select>
//         </div>
//       </div>

//       {/* Overview View */}
//       {viewMode === "overview" && (
//         <>
//           {/* Summary Cards */}
//           {summary && (
//             <div className={styles.summaryCards}>
//               <div className={styles.card}>
//                 <div className={styles.cardIcon}>
//                   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                     <path d="M12 4.354a4 4 0 1 1 0 5.292M15 21H3v-1a6 6 0 0 1 12 0v1Zm0 0h6v-1a6 6 0 0 0-9-5.197M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" />
//                   </svg>
//                 </div>
//                 <div className={styles.cardContent}>
//                   <span className={styles.cardValue}>{summary.totalStudents}</span>
//                   <span className={styles.cardLabel}>Total Students</span>
//                 </div>
//               </div>
//               <div className={styles.card}>
//                 <div className={styles.cardIcon}>
//                   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                     <path d="M9 19v-6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v6" />
//                     <path d="M12 3v3m0 0-2-2m2 2 2-2" />
//                   </svg>
//                 </div>
//                 <div className={styles.cardContent}>
//                   <span className={styles.cardValue}>{summary.classAverage}%</span>
//                   <span className={styles.cardLabel}>Class Average</span>
//                 </div>
//               </div>
//               <div className={styles.card}>
//                 <div className={styles.cardIcon}>
//                   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                     <path d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
//                   </svg>
//                 </div>
//                 <div className={styles.cardContent}>
//                   <span className={styles.cardValue}>{summary.passRate}%</span>
//                   <span className={styles.cardLabel}>Pass Rate</span>
//                 </div>
//               </div>
//               <div className={styles.card}>
//                 <div className={styles.cardIcon}>
//                   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                     <circle cx="12" cy="12" r="10" />
//                     <path d="M12 6v6l4 2" />
//                   </svg>
//                 </div>
//                 <div className={styles.cardContent}>
//                   <span className={styles.cardValue}>{summary.passCount}/{summary.totalStudents}</span>
//                   <span className={styles.cardLabel}>Pass/Fail</span>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Exam Titles Section */}
//           {examTitles.length > 0 && (
//             <div className={styles.examTitlesSection}>
//               <h3 className={styles.sectionTitle}>Recorded Exams</h3>
//               <div className={styles.examTitlesList}>
//                 {examTitles.map((exam) => (
//                   <div key={exam.id} className={styles.examTitleCard}>
//                     <div className={styles.examTitleHeader}>
//                       <span className={styles.examTitleName}>{exam.title}</span>
//                       <span className={styles.examTotal}>Total: {exam.total}</span>
//                     </div>
//                     {exam.description && (
//                       <p className={styles.examDescription}>{exam.description}</p>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* Grades Table */}
//           <div className={styles.tableContainer}>
//             <table className={styles.table}>
//               <thead>
//                 <tr>
//                   <th>Student</th>
//                   <th>Admission No.</th>
//                   <th>Exam Score</th>
//                   <th>Exam %</th>
//                   <th>Weighted (30%)</th>
//                   <th>Total Score</th>
//                   <th>Grade</th>
//                   <th>Remarks</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {grades.map((grade) => (
//                   <tr key={grade.student.id}>
//                     <td className={styles.studentCell}>
//                       <div className={styles.studentAvatar}>
//                         {grade.student.first_name[0]}{grade.student.last_name[0]}
//                       </div>
//                       <span>{grade.student.first_name} {grade.student.last_name}</span>
//                     </td>
//                     <td>{grade.student.admission_number || "—"}</td>
//                     <td className={styles.scoreCell}>
//                       {grade.examTotal}/{grade.examMaxTotal || "—"}
//                     </td>
//                     <td>{grade.examPercentage}%</td>
//                     <td>{grade.examTotal}%</td>
//                     <td className={styles.finalScore}>{grade.finalScore}%</td>
//                     <td>
//                       <span className={`${styles.letterGrade} ${getLetterGradeColor(grade.letterGrade)}`}>
//                         {grade.letterGrade}
//                       </span>
//                     </td>
//                     <td className={styles.remarks}>{grade.remarks}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </>
//       )}

//       {/* Grade Exam View */}
//       {viewMode === "grade" && (
//         <>
//           <div className={styles.gradeSection}>
//             <div className={styles.gradeHeader}>
//               <h3 className={styles.sectionTitle}>New Exam</h3>
//               <button
//                 className={styles.gradeButton}
//                 onClick={() => setShowBulkModal(true)}
//               >
//                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                   <path d="M12 4v16m8-8H4" />
//                 </svg>
//                 Start Grading
//               </button>
//             </div>
//             <p className={styles.gradeHint}>
//               Click "Start Grading" to create a new exam and enter scores for all students.
//             </p>
//           </div>

//           {/* Existing Exams Summary */}
//           {examTitles.length > 0 && (
//             <div className={styles.recentExams}>
//               <h3 className={styles.sectionTitle}>Recent Exams</h3>
//               <div className={styles.recentExamsList}>
//                 {examTitles.slice(0, 5).map((exam) => (
//                   <div key={exam.id} className={styles.recentExamItem}>
//                     <div>
//                       <div className={styles.recentExamTitle}>{exam.title}</div>
//                       <div className={styles.recentExamDesc}>{exam.description || "No description"}</div>
//                     </div>
//                     <div className={styles.recentExamTotal}>Total: {exam.total} marks</div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}
//         </>
//       )}

//       {/* Bulk Grading Modal */}
//       {showBulkModal && (
//         <div className={styles.modalOverlay} onClick={() => setShowBulkModal(false)}>
//           <div className={`${styles.modal} ${styles.largeModal}`} onClick={(e) => e.stopPropagation()}>
//             <div className={styles.modalHeader}>
//               <h3>Grade Exam</h3>
//               <button className={styles.closeButton} onClick={() => setShowBulkModal(false)}>
//                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                   <path d="M6 18L18 6M6 6l12 12" />
//                 </svg>
//               </button>
//             </div>
//             <div className={styles.modalBody}>
//               <div className={styles.formSection}>
//                 <h4>Exam Details</h4>
//                 <div className={styles.formGroup}>
//                   <label>Exam Title *</label>
//                   <input
//                     type="text"
//                     placeholder="e.g., End of Term Exam, Mid Term Exam"
//                     value={examTitle}
//                     onChange={(e) => setExamTitle(e.target.value)}
//                   />
//                 </div>
//                 <div className={styles.formGroup}>
//                   <label>Description</label>
//                   <textarea
//                     placeholder="Optional description"
//                     value={examDescription}
//                     onChange={(e) => setExamDescription(e.target.value)}
//                     rows={2}
//                   />
//                 </div>
//                 <div className={styles.formGroup}>
//                   <label>Total Marks *</label>
//                   <input
//                     type="number"
//                     placeholder="100"
//                     value={examTotalMarks}
//                     onChange={(e) => setExamTotalMarks(parseInt(e.target.value) || 0)}
//                   />
//                 </div>
//               </div>

//               <div className={styles.formSection}>
//                 <h4>Student Scores</h4>
//                 <div className={styles.scoresTable}>
//                   <table className={styles.scoreTable}>
//                     <thead>
//                       <tr>
//                         <th>Student</th>
//                         <th>Admission No.</th>
//                         <th>Score (/{examTotalMarks})</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {students.map((student) => (
//                         <tr key={student.id}>
//                           <td className={styles.studentCell}>
//                             <div className={styles.studentAvatarSmall}>
//                               {student.first_name[0]}{student.last_name[0]}
//                             </div>
//                             {student.first_name} {student.last_name}
//                           </td>
//                           <td>{student.admission_number || "—"}</td>
//                           <td>
//                             <input
//                               type="number"
//                               min="0"
//                               max={examTotalMarks}
//                               value={studentScores.get(student.id) || ""}
//                               onChange={(e) => updateStudentScore(student.id, parseInt(e.target.value) || 0)}
//                               className={styles.scoreInput}
//                               placeholder="Mark"
//                             />
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             </div>
//             <div className={styles.modalFooter}>
//               <button className={styles.cancelButton} onClick={() => setShowBulkModal(false)}>
//                 Cancel
//               </button>
//               <button className={styles.submitButton} onClick={handleBulkGrade}>
//                 Save All Scores
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Weight Settings Modal */}
//       {showWeightModal && (
//         <div className={styles.modalOverlay} onClick={() => setShowWeightModal(false)}>
//           <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
//             <div className={styles.modalHeader}>
//               <h3>Grade Weight Distribution</h3>
//               <button className={styles.closeButton} onClick={() => setShowWeightModal(false)}>
//                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                   <path d="M6 18L18 6M6 6l12 12" />
//                 </svg>
//               </button>
//             </div>
//             <div className={styles.modalBody}>
//               <p className={styles.modalText}>
//                 Set the weight distribution for Assessments and Exams. Total must be 100%.
//               </p>
//               <div className={styles.weightInputs}>
//                 <div className={styles.formGroup}>
//                   <label>Assessment Weight (%)</label>
//                   <input
//                     type="number"
//                     min="0"
//                     max="100"
//                     value={assessmentWeight}
//                     onChange={(e) => {
//                       const val = parseInt(e.target.value) || 0;
//                       setAssessmentWeight(val);
//                       setExamWeight(100 - val);
//                     }}
//                   />
//                 </div>
//                 <div className={styles.formGroup}>
//                   <label>Exam Weight (%)</label>
//                   <input
//                     type="number"
//                     min="0"
//                     max="100"
//                     value={examWeight}
//                     onChange={(e) => {
//                       const val = parseInt(e.target.value) || 0;
//                       setExamWeight(val);
//                       setAssessmentWeight(100 - val);
//                     }}
//                   />
//                 </div>
//               </div>
//               <div className={styles.weightTotal}>
//                 Total: {assessmentWeight + examWeight}%
//                 {assessmentWeight + examWeight !== 100 && (
//                   <span className={styles.weightError}> (Must equal 100%)</span>
//                 )}
//               </div>
//             </div>
//             <div className={styles.modalFooter}>
//               <button className={styles.cancelButton} onClick={() => setShowWeightModal(false)}>
//                 Cancel
//               </button>
//               <button
//                 className={styles.submitButton}
//                 onClick={handleWeightUpdate}
//                 disabled={assessmentWeight + examWeight !== 100}
//               >
//                 Save Weights
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }