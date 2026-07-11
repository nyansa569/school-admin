// app/(dashboard)/abtl-analysis/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import styles from "./page.module.css";
import Header from "@/components/Header/Header";

// MOCK DATA - UI Presentation Only
const MOCK_CLASSES = [
  { id: 1, name: "JHS 1", level: "JHS", section: "A" },
  { id: 2, name: "JHS 1", level: "JHS", section: "B" },
  { id: 3, name: "JHS 2", level: "JHS", section: "A" },
  { id: 4, name: "JHS 2", level: "JHS", section: "B" },
  { id: 5, name: "JHS 3", level: "JHS", section: "A" },
  { id: 6, name: "JHS 3", level: "JHS", section: "B" },
];

const MOCK_ACADEMIC_YEARS = [
  { id: 1, year: 2024, term: "Term 1" },
  { id: 2, year: 2024, term: "Term 2" },
  { id: 3, year: 2024, term: "Term 3" },
];

// Mock student data with subject grades
interface StudentGrade {
  id: number;
  first_name: string;
  last_name: string;
  admission_number: string;
  student_id: string;
  scores: {
    mathematics: number;
    english: number;
    science: number;
    socialStudies: number;
    rme: number;
    computing: number;
    creativeArts: number;
    french: number;
  };
}

const MOCK_STUDENTS: StudentGrade[] = [
  // Student 1: Science-oriented student (Excellent in Math & Science)
  {
    id: 1,
    first_name: "Kwame",
    last_name: "Asare",
    admission_number: "JHS/001/24",
    student_id: "STU001",
    scores: {
      mathematics: 92,
      english: 78,
      science: 88,
      socialStudies: 65,
      rme: 75,
      computing: 85,
      creativeArts: 60,
      french: 55,
    },
  },
  // Student 2: All-rounder excellence (High scores across all subjects)
  {
    id: 2,
    first_name: "Adwoa",
    last_name: "Mensah",
    admission_number: "JHS/002/24",
    student_id: "STU002",
    scores: {
      mathematics: 88,
      english: 92,
      science: 90,
      socialStudies: 85,
      rme: 88,
      computing: 86,
      creativeArts: 82,
      french: 78,
    },
  },
  // Student 3: Arts & Humanities focused
  {
    id: 3,
    first_name: "John",
    last_name: "Darko",
    admission_number: "JHS/003/24",
    student_id: "STU003",
    scores: {
      mathematics: 55,
      english: 88,
      science: 52,
      socialStudies: 85,
      rme: 82,
      computing: 58,
      creativeArts: 90,
      french: 75,
    },
  },
  // Student 4: Business & Commerce oriented
  {
    id: 4,
    first_name: "Efua",
    last_name: "Osei",
    admission_number: "JHS/004/24",
    student_id: "STU004",
    scores: {
      mathematics: 85,
      english: 82,
      science: 65,
      socialStudies: 88,
      rme: 75,
      computing: 90,
      creativeArts: 70,
      french: 68,
    },
  },
  // Student 5: Technical & Engineering inclined
  {
    id: 5,
    first_name: "Michael",
    last_name: "Appiah",
    admission_number: "JHS/005/24",
    student_id: "STU005",
    scores: {
      mathematics: 90,
      english: 62,
      science: 85,
      socialStudies: 55,
      rme: 60,
      computing: 88,
      creativeArts: 65,
      french: 45,
    },
  },
  // Student 6: Creative Arts & Design focus
  {
    id: 6,
    first_name: "Grace",
    last_name: "Tetteh",
    admission_number: "JHS/006/24",
    student_id: "STU006",
    scores: {
      mathematics: 58,
      english: 85,
      science: 55,
      socialStudies: 72,
      rme: 70,
      computing: 75,
      creativeArts: 94,
      french: 68,
    },
  },
  // Student 7: ICT / Technology specialist
  {
    id: 7,
    first_name: "Daniel",
    last_name: "Quarshie",
    admission_number: "JHS/007/24",
    student_id: "STU007",
    scores: {
      mathematics: 86,
      english: 70,
      science: 78,
      socialStudies: 60,
      rme: 65,
      computing: 96,
      creativeArts: 62,
      french: 50,
    },
  },
  // Student 8: Agriculture & Environmental Science interest
  {
    id: 8,
    first_name: "Princess",
    last_name: "Amankwah",
    admission_number: "JHS/008/24",
    student_id: "STU008",
    scores: {
      mathematics: 72,
      english: 68,
      science: 88,
      socialStudies: 75,
      rme: 80,
      computing: 65,
      creativeArts: 60,
      french: 55,
    },
  },
  // Student 9: Education & Social Sciences pathway
  {
    id: 9,
    first_name: "Francis",
    last_name: "Boadu",
    admission_number: "JHS/009/24",
    student_id: "STU009",
    scores: {
      mathematics: 68,
      english: 90,
      science: 65,
      socialStudies: 88,
      rme: 85,
      computing: 60,
      creativeArts: 72,
      french: 70,
    },
  },
  // Student 10: Struggling student needing intervention
  {
    id: 10,
    first_name: "Mary",
    last_name: "Adjei",
    admission_number: "JHS/010/24",
    student_id: "STU010",
    scores: {
      mathematics: 48,
      english: 52,
      science: 45,
      socialStudies: 50,
      rme: 55,
      computing: 48,
      creativeArts: 58,
      french: 42,
    },
  },
  // Student 11: Strong Medical Science prospect
  {
    id: 11,
    first_name: "Emmanuel",
    last_name: "Kwarteng",
    admission_number: "JHS/011/24",
    student_id: "STU011",
    scores: {
      mathematics: 86,
      english: 75,
      science: 94,
      socialStudies: 70,
      rme: 72,
      computing: 80,
      creativeArts: 65,
      french: 60,
    },
  },
  // Student 12: Legal & Governance focused
  {
    id: 12,
    first_name: "Serwaa",
    last_name: "Ampofo",
    admission_number: "JHS/012/24",
    student_id: "STU012",
    scores: {
      mathematics: 65,
      english: 94,
      science: 58,
      socialStudies: 92,
      rme: 88,
      computing: 70,
      creativeArts: 75,
      french: 82,
    },
  },
  // Student 13: Engineering & Technology blend
  {
    id: 13,
    first_name: "Richard",
    last_name: "Opoku",
    admission_number: "JHS/013/24",
    student_id: "STU013",
    scores: {
      mathematics: 92,
      english: 55,
      science: 88,
      socialStudies: 52,
      rme: 58,
      computing: 94,
      creativeArts: 50,
      french: 40,
    },
  },
  // Student 14: Home Economics & Hospitality interest
  {
    id: 14,
    first_name: "Akua",
    last_name: "Sarpong",
    admission_number: "JHS/014/24",
    student_id: "STU014",
    scores: {
      mathematics: 62,
      english: 78,
      science: 70,
      socialStudies: 75,
      rme: 72,
      computing: 55,
      creativeArts: 86,
      french: 60,
    },
  },
  // Student 15: Balanced student with Business leanings
  {
    id: 15,
    first_name: "Kofi",
    last_name: "Annan",
    admission_number: "JHS/015/24",
    student_id: "STU015",
    scores: {
      mathematics: 82,
      english: 76,
      science: 70,
      socialStudies: 80,
      rme: 74,
      computing: 78,
      creativeArts: 68,
      french: 58,
    },
  },
  // Student 16: Pure Sciences star
  {
    id: 16,
    first_name: "Abena",
    last_name: "Boateng",
    admission_number: "JHS/016/24",
    student_id: "STU016",
    scores: {
      mathematics: 96,
      english: 82,
      science: 95,
      socialStudies: 68,
      rme: 70,
      computing: 88,
      creativeArts: 62,
      french: 55,
    },
  },
  // Student 17: Visual Arts talent
  {
    id: 17,
    first_name: "Yaw",
    last_name: "Nkansah",
    admission_number: "JHS/017/24",
    student_id: "STU017",
    scores: {
      mathematics: 55,
      english: 80,
      science: 48,
      socialStudies: 70,
      rme: 65,
      computing: 72,
      creativeArts: 96,
      french: 62,
    },
  },
  // Student 18: Underperforming but improving
  {
    id: 18,
    first_name: "Ama",
    last_name: "Sekyere",
    admission_number: "JHS/018/24",
    student_id: "STU018",
    scores: {
      mathematics: 62,
      english: 70,
      science: 55,
      socialStudies: 65,
      rme: 68,
      computing: 58,
      creativeArts: 72,
      french: 54,
    },
  },
  // Student 19: Computing & AI aspirant
  {
    id: 19,
    first_name: "Kelvin",
    last_name: "Asamoah",
    admission_number: "JHS/019/24",
    student_id: "STU019",
    scores: {
      mathematics: 94,
      english: 68,
      science: 82,
      socialStudies: 58,
      rme: 62,
      computing: 98,
      creativeArts: 55,
      french: 48,
    },
  },
  // Student 20: Social Sciences & Policy interest
  {
    id: 20,
    first_name: "Nana Yaa",
    last_name: "Owusu",
    admission_number: "JHS/020/24",
    student_id: "STU020",
    scores: {
      mathematics: 68,
      english: 92,
      science: 60,
      socialStudies: 94,
      rme: 86,
      computing: 72,
      creativeArts: 78,
      french: 84,
    },
  },
];

// Define Programme type
interface ProgrammeDefinition {
  name: string;
  purpose: string;
  suitableCourses: string[];
  formula: Record<string, number>;
  icon: string;
}

interface ProgrammeIndex extends ProgrammeDefinition {
  score: number;
  rank: number;
}

interface StudentAnalysis {
  student: StudentGrade;
  programmeIndices: ProgrammeIndex[];
  topProgramme: ProgrammeIndex;
  secondProgramme: ProgrammeIndex;
  thirdProgramme: ProgrammeIndex;
  recommendedPath: string;
  confidenceLevel: "High" | "Medium" | "Low";
}

// ABTL Programme definitions
const PROGRAMMES: ProgrammeDefinition[] = [
  {
    name: "General Science",
    purpose: "Students with strong analytical and scientific potential",
    suitableCourses: [
      "Medicine",
      "Pharmacy",
      "Nursing",
      "Biomedical Science",
      "Computer Science",
      "Engineering",
      "Statistics",
      "Data Science",
      "Actuarial Science",
      "Artificial Intelligence",
    ],
    formula: {
      mathematics: 35,
      integratedScience: 35,
      computing: 15,
      english: 10,
      rme: 5,
    },
    icon: "🔬",
  },
  {
    name: "General Arts",
    purpose:
      "Students with strong communication, interpretation, governance, and social reasoning skills",
    suitableCourses: [
      "Law",
      "Political Science",
      "International Relations",
      "Sociology",
      "Psychology",
      "Public Administration",
      "Development Studies",
      "Communication Studies",
      "Journalism",
    ],
    formula: {
      english: 30,
      socialStudies: 30,
      rme: 20,
      french: 10,
      creativeArts: 10,
    },
    icon: "🎭",
  },
  {
    name: "Business",
    purpose: "Students with strong numerical and commercial reasoning",
    suitableCourses: [
      "Accounting",
      "Finance",
      "Banking",
      "Economics",
      "Marketing",
      "Human Resource Management",
      "Business Administration",
      "Insurance",
      "Procurement",
    ],
    formula: {
      mathematics: 35,
      socialStudies: 25,
      english: 20,
      computing: 15,
      rme: 5,
    },
    icon: "💼",
  },
  {
    name: "Agriculture Science",
    purpose: "Students with scientific and practical production potential",
    suitableCourses: [
      "Agribusiness",
      "Crop Science",
      "Animal Science",
      "Agricultural Economics",
      "Agricultural Engineering",
      "Food Science",
      "Environmental Science",
      "Fisheries",
      "Forestry",
    ],
    formula: {
      integratedScience: 30,
      mathematics: 25,
      socialStudies: 20,
      computing: 15,
      english: 10,
    },
    icon: "🌾",
  },
  {
    name: "Home Economics",
    purpose:
      "Students interested in food, nutrition, hospitality, and family sciences",
    suitableCourses: [
      "Nutrition",
      "Dietetics",
      "Hospitality Management",
      "Food Science",
      "Fashion Design",
      "Family and Consumer Sciences",
      "Catering and Hotel Management",
    ],
    formula: {
      integratedScience: 25,
      english: 20,
      mathematics: 20,
      creativeArts: 20,
      socialStudies: 15,
    },
    icon: "🏠",
  },
  {
    name: "Visual Arts",
    purpose: "Students with strong creative and design potential",
    suitableCourses: [
      "Graphic Design",
      "Architecture",
      "Fine Arts",
      "Animation",
      "Interior Design",
      "Industrial Design",
      "Product Design",
      "Multimedia Design",
    ],
    formula: {
      creativeArts: 40,
      english: 20,
      mathematics: 10,
      socialStudies: 15,
      computing: 15,
    },
    icon: "🎨",
  },
  {
    name: "Technical",
    purpose:
      "Students suited to engineering, construction, and technical trades",
    suitableCourses: [
      "Mechanical Engineering",
      "Civil Engineering",
      "Electrical Engineering",
      "Construction Technology",
      "Quantity Surveying",
      "Mechatronics",
      "Industrial Technology",
    ],
    formula: {
      mathematics: 40,
      integratedScience: 30,
      computing: 20,
      creativeArts: 10,
    },
    icon: "🔧",
  },
  {
    name: "ICT / Technology",
    purpose: "Students with digital and computational aptitude",
    suitableCourses: [
      "Computer Science",
      "Information Technology",
      "Software Engineering",
      "Cybersecurity",
      "Data Science",
      "Artificial Intelligence",
      "Information Systems",
    ],
    formula: {
      computing: 40,
      mathematics: 30,
      integratedScience: 20,
      english: 10,
    },
    icon: "💻",
  },
  {
    name: "Education",
    purpose:
      "Students with strong communication and knowledge-sharing potential",
    suitableCourses: [
      "Education",
      "Educational Psychology",
      "Guidance & Counselling",
      "Curriculum Studies",
      "Educational Leadership",
    ],
    formula: {
      english: 25,
      socialStudies: 25,
      mathematics: 20,
      rme: 15,
      integratedScience: 15,
    },
    icon: "📚",
  },
];

// Helper to get score for a subject
const getSubjectScore = (subject: string, student: StudentGrade): number => {
  const scoreMap: Record<string, keyof StudentGrade["scores"]> = {
    mathematics: "mathematics",
    english: "english",
    integratedScience: "science",
    socialStudies: "socialStudies",
    rme: "rme",
    computing: "computing",
    creativeArts: "creativeArts",
    french: "french",
  };
  const key = scoreMap[subject];
  return key ? student.scores[key] : 0;
};

// Calculate programme score for a student
const calculateProgrammeScore = (
  programme: ProgrammeDefinition,
  student: StudentGrade,
): number => {
  let totalWeight = 0;
  let weightedSum = 0;

  for (const [subject, weight] of Object.entries(programme.formula)) {
    const score = getSubjectScore(subject, student);
    weightedSum += score * weight;
    totalWeight += weight;
  }

  return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
};

// Analyze all students in a class
const analyzeClassStudents = (students: StudentGrade[]): StudentAnalysis[] => {
  return students.map((student) => {
    // Calculate indices for all programmes
    const indices: ProgrammeIndex[] = PROGRAMMES.map((programme) => {
      const score = calculateProgrammeScore(programme, student);
      return {
        ...programme,
        score,
        rank: 0,
      };
    });

    // Sort by score (descending) and assign ranks
    indices.sort((a, b) => b.score - a.score);
    indices.forEach((item, idx) => {
      item.rank = idx + 1;
    });

    const topProgramme = indices[0];
    const secondProgramme = indices[1];
    const thirdProgramme = indices[2];

    // Determine confidence level based on score gap between 1st and 2nd
    const gap = topProgramme.score - secondProgramme.score;
    let confidenceLevel: "High" | "Medium" | "Low" = "Medium";
    if (gap >= 10) confidenceLevel = "High";
    if (gap <= 3) confidenceLevel = "Low";

    return {
      student,
      programmeIndices: indices,
      topProgramme,
      secondProgramme,
      thirdProgramme,
      recommendedPath: topProgramme.name,
      confidenceLevel,
    };
  });
};

// Class statistics interface
interface ClassStatistics {
  totalStudents: number;
  topProgrammeDistribution: Record<string, number>;
  averageScoresByProgramme: Record<string, number>;
  confidenceDistribution: { High: number; Medium: number; Low: number };
  strongestSubjects: Array<{ subject: string; average: number }>;
  weakestSubjects: Array<{ subject: string; average: number }>;
}

const calculateClassStatistics = (
  analyses: StudentAnalysis[],
): ClassStatistics => {
  const topProgrammeDistribution: Record<string, number> = {};
  const programmeScores: Record<string, number[]> = {};
  let confidenceHigh = 0,
    confidenceMedium = 0,
    confidenceLow = 0;

  // Subject averages
  const subjectTotals = {
    mathematics: 0,
    english: 0,
    science: 0,
    socialStudies: 0,
    rme: 0,
    computing: 0,
    creativeArts: 0,
    french: 0,
  };

  analyses.forEach((analysis) => {
    // Top programme distribution
    const top = analysis.topProgramme.name;
    topProgrammeDistribution[top] = (topProgrammeDistribution[top] || 0) + 1;

    // Programme scores for average calculation
    analysis.programmeIndices.forEach((p) => {
      if (!programmeScores[p.name]) programmeScores[p.name] = [];
      programmeScores[p.name].push(p.score);
    });

    // Confidence distribution
    if (analysis.confidenceLevel === "High") confidenceHigh++;
    else if (analysis.confidenceLevel === "Medium") confidenceMedium++;
    else confidenceLow++;

    // Subject averages
    subjectTotals.mathematics += analysis.student.scores.mathematics;
    subjectTotals.english += analysis.student.scores.english;
    subjectTotals.science += analysis.student.scores.science;
    subjectTotals.socialStudies += analysis.student.scores.socialStudies;
    subjectTotals.rme += analysis.student.scores.rme;
    subjectTotals.computing += analysis.student.scores.computing;
    subjectTotals.creativeArts += analysis.student.scores.creativeArts;
    subjectTotals.french += analysis.student.scores.french;
  });

  const total = analyses.length;

  // Calculate average scores per programme
  const averageScoresByProgramme: Record<string, number> = {};
  for (const [programme, scores] of Object.entries(programmeScores)) {
    averageScoresByProgramme[programme] = Math.round(
      scores.reduce((a, b) => a + b, 0) / scores.length,
    );
  }

  // Calculate subject averages
  const subjectAverages = [
    {
      subject: "Mathematics",
      average: Math.round(subjectTotals.mathematics / total),
    },
    { subject: "English", average: Math.round(subjectTotals.english / total) },
    {
      subject: "Integrated Science",
      average: Math.round(subjectTotals.science / total),
    },
    {
      subject: "Social Studies",
      average: Math.round(subjectTotals.socialStudies / total),
    },
    { subject: "RME", average: Math.round(subjectTotals.rme / total) },
    {
      subject: "Computing",
      average: Math.round(subjectTotals.computing / total),
    },
    {
      subject: "Creative Arts",
      average: Math.round(subjectTotals.creativeArts / total),
    },
    { subject: "French", average: Math.round(subjectTotals.french / total) },
  ];

  const strongestSubjects = [...subjectAverages]
    .sort((a, b) => b.average - a.average)
    .slice(0, 3);
  const weakestSubjects = [...subjectAverages]
    .sort((a, b) => a.average - b.average)
    .slice(0, 3);

  return {
    totalStudents: total,
    topProgrammeDistribution,
    averageScoresByProgramme,
    confidenceDistribution: {
      High: confidenceHigh,
      Medium: confidenceMedium,
      Low: confidenceLow,
    },
    strongestSubjects,
    weakestSubjects,
  };
};

export default function ABTLAnalysisPage() {
  const [classes] = useState(MOCK_CLASSES);
  const [academicYears] = useState(MOCK_ACADEMIC_YEARS);
  const [students] = useState<StudentGrade[]>(MOCK_STUDENTS);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>("");
  const [selectedStudent, setSelectedStudent] = useState<StudentGrade | null>(
    null,
  );
  const [showStudentDetail, setShowStudentDetail] = useState(false);
  const [classAnalyses, setClassAnalyses] = useState<StudentAnalysis[]>([]);
  const [classStats, setClassStats] = useState<ClassStatistics | null>(null);
  const [selectedProgrammeFilter, setSelectedProgrammeFilter] =
    useState<string>("");
  const [sortBy, setSortBy] = useState<string>("rank");

  // Filter students by selected class (in real app, you'd filter by class ID)
  const filteredStudents = selectedClass ? students : [];

  // Run analysis when class is selected
  useEffect(() => {
    if (selectedClass && filteredStudents.length > 0) {
      const analyses = analyzeClassStudents(filteredStudents);
      setClassAnalyses(analyses);
      setClassStats(calculateClassStatistics(analyses));
    } else {
      setClassAnalyses([]);
      setClassStats(null);
    }
  }, [selectedClass, filteredStudents]);

  // Filter and sort analyses for display
  const displayedAnalyses = useMemo(() => {
    let filtered = [...classAnalyses];

    if (selectedProgrammeFilter) {
      filtered = filtered.filter(
        (a) => a.topProgramme.name === selectedProgrammeFilter,
      );
    }

    if (sortBy === "score") {
      filtered.sort((a, b) => b.topProgramme.score - a.topProgramme.score);
    } else if (sortBy === "name") {
      filtered.sort((a, b) =>
        a.student.last_name.localeCompare(b.student.last_name),
      );
    } else {
      filtered.sort((a, b) => a.topProgramme.rank - b.topProgramme.rank);
    }

    return filtered;
  }, [classAnalyses, selectedProgrammeFilter, sortBy]);

  const handleViewStudentDetails = (student: StudentGrade) => {
    setSelectedStudent(student);
    setShowStudentDetail(true);
  };

  const getConfidenceClass = (level: string): string => {
    switch (level) {
      case "High":
        return styles.confidenceHigh;
      case "Medium":
        return styles.confidenceMedium;
      default:
        return styles.confidenceLow;
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return styles.scoreExcellent;
    if (score >= 70) return styles.scoreGood;
    if (score >= 60) return styles.scoreAverage;
    return styles.scoreLow;
  };

  // Student detail modal content
  const selectedStudentAnalysis = selectedStudent
    ? classAnalyses.find((a) => a.student.id === selectedStudent.id)
    : null;

  const programmeOptions = classStats
    ? Object.keys(classStats.topProgrammeDistribution)
    : [];

  return (
    <div className={styles.pageContainer}>
      <Header
        title="ABTL Programme Analysis"
        subtitle="Analyze student strengths and get personalized SHS programme recommendations based on academic performance"
      />

      <div className={styles.contentWrapper}>
        {/* Filters */}
        <div className={styles.filterSection}>
          <div className={styles.filterRow}>
            <div className={styles.filterGroup}>
              <label>Class *</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className={styles.select}
              >
                <option value="">Select Class</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} ({cls.level}) - Section {cls.section}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label>Academic Year *</label>
              <select
                value={selectedAcademicYear}
                onChange={(e) => setSelectedAcademicYear(e.target.value)}
                className={styles.select}
              >
                <option value="">Select Academic Year</option>
                {academicYears.map((year) => (
                  <option key={year.id} value={year.id}>
                    {year.year} - {year.term}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {selectedClass && selectedAcademicYear && classStats && (
          <>
            {/* Statistics Dashboard */}
            <div className={styles.statsDashboard}>
              <h3 className={styles.sectionTitle}>
                📊 Class Performance Overview
              </h3>

              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <div className={styles.statIcon}>👨‍🎓</div>
                  <div className={styles.statValue}>
                    {classStats.totalStudents}
                  </div>
                  <div className={styles.statLabel}>
                    Total Students Analyzed
                  </div>
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statIcon}>🎯</div>
                  <div className={styles.statValue}>
                    {Object.keys(classStats.topProgrammeDistribution).length}
                  </div>
                  <div className={styles.statLabel}>
                    Different Programme Matches
                  </div>
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statIcon}>💪</div>
                  <div className={styles.statValue}>
                    {classStats.strongestSubjects[0]?.subject || "N/A"}
                  </div>
                  <div className={styles.statLabel}>Strongest Subject</div>
                  <div className={styles.statSub}>
                    Avg: {classStats.strongestSubjects[0]?.average || 0}%
                  </div>
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statIcon}>📚</div>
                  <div className={styles.statValue}>
                    {classStats.weakestSubjects[0]?.subject || "N/A"}
                  </div>
                  <div className={styles.statLabel}>Area for Improvement</div>
                  <div className={styles.statSub}>
                    Avg: {classStats.weakestSubjects[0]?.average || 0}%
                  </div>
                </div>
              </div>

              {/* Programme Distribution */}
              <div className={styles.distributionSection}>
                <h4>🎓 Programme Distribution</h4>
                <div className={styles.distributionBars}>
                  {Object.entries(classStats.topProgrammeDistribution)
                    .sort(([, a], [, b]) => b - a)
                    .map(([programme, count]) => {
                      const percentage =
                        (count / classStats.totalStudents) * 100;
                      return (
                        <div
                          key={programme}
                          className={styles.distributionItem}
                        >
                          <div className={styles.distributionLabel}>
                            <span>{programme}</span>
                            <span>
                              {count} students ({percentage.toFixed(1)}%)
                            </span>
                          </div>
                          <div className={styles.distributionBarContainer}>
                            <div
                              className={styles.distributionBar}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Confidence Distribution */}
              <div className={styles.confidenceSection}>
                <h4>📈 Recommendation Confidence</h4>
                <div className={styles.confidenceCards}>
                  <div className={styles.confidenceCard}>
                    <div className={styles.confidenceValue}>
                      {classStats.confidenceDistribution.High}
                    </div>
                    <div className={styles.confidenceLabel}>
                      High Confidence
                    </div>
                    <div className={styles.confidenceDesc}>
                      Clear programme fit (10+ point gap)
                    </div>
                  </div>
                  <div className={styles.confidenceCard}>
                    <div className={styles.confidenceValue}>
                      {classStats.confidenceDistribution.Medium}
                    </div>
                    <div className={styles.confidenceLabel}>
                      Medium Confidence
                    </div>
                    <div className={styles.confidenceDesc}>
                      Close competition between programmes
                    </div>
                  </div>
                  <div className={styles.confidenceCard}>
                    <div className={styles.confidenceValue}>
                      {classStats.confidenceDistribution.Low}
                    </div>
                    <div className={styles.confidenceLabel}>Low Confidence</div>
                    <div className={styles.confidenceDesc}>
                      Needs further assessment
                    </div>
                  </div>
                </div>
              </div>

              {/* Subject Performance */}
              <div className={styles.subjectSection}>
                <h4>📚 Subject Performance Analysis</h4>
                <div className={styles.subjectGrid}>
                  <div className={styles.strengthBox}>
                    <h5>💪 Top Strengths</h5>
                    {classStats.strongestSubjects.map((subject, idx) => (
                      <div key={idx} className={styles.subjectItem}>
                        <span>{subject.subject}</span>
                        <div className={styles.subjectBar}>
                          <div
                            className={styles.subjectBarFill}
                            style={{
                              width: `${subject.average}%`,
                              background: "#10b981",
                            }}
                          />
                        </div>
                        <span className={styles.subjectScore}>
                          {subject.average}%
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className={styles.improvementBox}>
                    <h5>📖 Areas for Growth</h5>
                    {classStats.weakestSubjects.map((subject, idx) => (
                      <div key={idx} className={styles.subjectItem}>
                        <span>{subject.subject}</span>
                        <div className={styles.subjectBar}>
                          <div
                            className={styles.subjectBarFill}
                            style={{
                              width: `${subject.average}%`,
                              background: "#f59e0b",
                            }}
                          />
                        </div>
                        <span className={styles.subjectScore}>
                          {subject.average}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Filters for student table */}
            <div className={styles.tableFilters}>
              <div className={styles.filterGroup}>
                <label>Filter by Programme</label>
                <select
                  value={selectedProgrammeFilter}
                  onChange={(e) => setSelectedProgrammeFilter(e.target.value)}
                  className={styles.selectSmall}
                >
                  <option value="">All Programmes</option>
                  {programmeOptions.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.filterGroup}>
                <label>Sort by</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={styles.selectSmall}
                >
                  <option value="rank">Rank</option>
                  <option value="score">Fit Score</option>
                  <option value="name">Student Name</option>
                </select>
              </div>
            </div>

            {/* Students Analysis Table */}
            <div className={styles.tableSection}>
              <div className={styles.tableHeader}>
                <h3 className={styles.tableTitle}>
                  Student Programme Analysis
                </h3>
                <div className={styles.tableInfo}>
                  Showing {displayedAnalyses.length} of {classAnalyses.length}{" "}
                  students
                </div>
              </div>

              <div className={styles.tableContainer}>
                <table className={styles.analysisTable}>
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Admission No.</th>
                      <th>🥇 Best Fit</th>
                      <th>Score</th>
                      <th>🥈 Second Choice</th>
                      <th>🥉 Third Choice</th>
                      <th>Confidence</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedAnalyses.map((analysis) => (
                      <tr key={analysis.student.id}>
                        <td className={styles.studentCell}>
                          <div className={styles.studentAvatar}>
                            {analysis.student.first_name[0]}
                            {analysis.student.last_name[0]}
                          </div>
                          <span>
                            {analysis.student.first_name}{" "}
                            {analysis.student.last_name}
                          </span>
                        </td>
                        <td>{analysis.student.admission_number}</td>
                        <td>
                          <div className={styles.programmeCell}>
                            <span className={styles.programmeIcon}>
                              {analysis.topProgramme.icon}
                            </span>
                            <span>{analysis.topProgramme.name}</span>
                          </div>
                        </td>
                        <td>
                          <span
                            className={`${styles.scoreBadge} ${getScoreColor(analysis.topProgramme.score)}`}
                          >
                            {analysis.topProgramme.score}%
                          </span>
                        </td>
                        <td>
                          <div className={styles.programmeCell}>
                            <span className={styles.programmeIcon}>
                              {analysis.secondProgramme.icon}
                            </span>
                            <span>{analysis.secondProgramme.name}</span>
                            <span className={styles.secondScore}>
                              ({analysis.secondProgramme.score}%)
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className={styles.programmeCell}>
                            <span className={styles.programmeIcon}>
                              {analysis.thirdProgramme.icon}
                            </span>
                            <span>{analysis.thirdProgramme.name}</span>
                          </div>
                        </td>
                        <td>
                          <span
                            className={`${styles.confidenceBadge} ${getConfidenceClass(analysis.confidenceLevel)}`}
                          >
                            {analysis.confidenceLevel}
                          </span>
                        </td>
                        <td>
                          <button
                            className={styles.viewButton}
                            onClick={() =>
                              handleViewStudentDetails(analysis.student)
                            }
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Methodology Explanation */}
            <div className={styles.methodologySection}>
              <details className={styles.methodologyDetails}>
                <summary>📐 How ABTL Programme Index is Calculated</summary>
                <div className={styles.methodologyContent}>
                  <p>
                    The ABTL Programme Index Engine uses a weighted scoring
                    system based on subject performance to recommend the most
                    suitable SHS programme for each student.
                  </p>

                  <h4>Calculation Methodology:</h4>
                  <ul>
                    <li>
                      <strong>Weighted Average Formula:</strong> Each programme
                      has specific subject weights based on its core
                      requirements
                    </li>
                    <li>
                      <strong>Normalization:</strong> Scores are normalized to
                      100% for fair comparison across programmes
                    </li>
                    <li>
                      <strong>Ranking:</strong> Programmes are ranked from
                      highest to lowest fit score
                    </li>
                    <li>
                      <strong>Confidence Level:</strong> Based on the score gap
                      between 1st and 2nd choice (High: 10+ points, Medium: 4-9
                      points, Low: 0-3 points)
                    </li>
                  </ul>

                  <h4>Programme Formulas:</h4>
                  <div className={styles.formulasGrid}>
                    {PROGRAMMES.map((programme) => (
                      <div key={programme.name} className={styles.formulaCard}>
                        <div className={styles.formulaHeader}>
                          <span>{programme.icon}</span>
                          <strong>{programme.name}</strong>
                        </div>
                        <div className={styles.formulaBody}>
                          {Object.entries(programme.formula).map(
                            ([subject, weight]) => (
                              <span key={subject} className={styles.formulaTag}>
                                {subject.replace(/([A-Z])/g, " $1").trim()}:{" "}
                                {weight}%
                              </span>
                            ),
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className={styles.methodologyNote}>
                    <strong>Note:</strong> The ABTL analysis provides
                    recommendations based on academic performance. Final
                    programme selection should also consider student interests,
                    aptitude tests, and career counseling.
                  </p>
                </div>
              </details>
            </div>
          </>
        )}

        {!selectedClass && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🎯</div>
            <h3>Select a Class and Academic Year</h3>
            <p>
              Please select a class and academic year to begin the ABTL
              programme analysis.
            </p>
            <p className={styles.emptyHint}>
              The system will analyze student performance across all subjects
              and recommend the best-fit SHS programmes.
            </p>
          </div>
        )}

        {selectedClass && !selectedAcademicYear && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📅</div>
            <h3>Select an Academic Year</h3>
            <p>Please select an academic year to view the analysis.</p>
          </div>
        )}
      </div>

      {/* Student Detail Modal */}
      {showStudentDetail && selectedStudent && selectedStudentAnalysis && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowStudentDetail(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>
                Detailed Analysis: {selectedStudent.first_name}{" "}
                {selectedStudent.last_name}
              </h2>
              <button
                className={styles.closeButton}
                onClick={() => setShowStudentDetail(false)}
              >
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path
                    fill="currentColor"
                    d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"
                  />
                </svg>
              </button>
            </div>
            <div className={styles.modalBody}>
              {/* Student Info */}
              <div className={styles.detailStudentInfo}>
                <div className={styles.detailAvatar}>
                  {selectedStudent.first_name[0]}
                  {selectedStudent.last_name[0]}
                </div>
                <div>
                  <h3>
                    {selectedStudent.first_name} {selectedStudent.last_name}
                  </h3>
                  <p>
                    Admission: {selectedStudent.admission_number} | ID:{" "}
                    {selectedStudent.student_id}
                  </p>
                </div>
              </div>

              {/* Top Recommendations */}
              <div className={styles.detailRecommendations}>
                <h4>🎯 Programme Recommendations</h4>
                <div className={styles.recommendationCards}>
                  <div className={`${styles.recCard} ${styles.recCard1}`}>
                    <div className={styles.recRank}>🥇 Best Fit</div>
                    <div className={styles.recName}>
                      {selectedStudentAnalysis.topProgramme.name}
                    </div>
                    <div className={styles.recScore}>
                      {selectedStudentAnalysis.topProgramme.score}% Match
                    </div>
                    <div className={styles.recCourses}>
                      <strong>Career Paths:</strong>
                      <ul>
                        {selectedStudentAnalysis.topProgramme.suitableCourses
                          .slice(0, 5)
                          .map((course, i) => (
                            <li key={i}>{course}</li>
                          ))}
                      </ul>
                    </div>
                  </div>
                  <div className={`${styles.recCard} ${styles.recCard2}`}>
                    <div className={styles.recRank}>🥈 Strong Alternative</div>
                    <div className={styles.recName}>
                      {selectedStudentAnalysis.secondProgramme.name}
                    </div>
                    <div className={styles.recScore}>
                      {selectedStudentAnalysis.secondProgramme.score}% Match
                    </div>
                  </div>
                  <div className={`${styles.recCard} ${styles.recCard3}`}>
                    <div className={styles.recRank}>🥉 Viable Alternative</div>
                    <div className={styles.recName}>
                      {selectedStudentAnalysis.thirdProgramme.name}
                    </div>
                    <div className={styles.recScore}>
                      {selectedStudentAnalysis.thirdProgramme.score}% Match
                    </div>
                  </div>
                </div>
              </div>

              {/* Subject Performance */}
              <div className={styles.detailSubjects}>
                <h4>📊 Subject Performance</h4>
                <div className={styles.subjectPerformanceGrid}>
                  {Object.entries(selectedStudent.scores).map(
                    ([subject, score]) => (
                      <div
                        key={subject}
                        className={styles.subjectPerformanceItem}
                      >
                        <div className={styles.subjectPerformanceLabel}>
                          <span>
                            {subject.replace(/([A-Z])/g, " $1").trim()}
                          </span>
                          <span className={getScoreColor(score)}>{score}%</span>
                        </div>
                        <div className={styles.subjectPerformanceBar}>
                          <div
                            className={styles.subjectPerformanceFill}
                            style={{ width: `${score}%` }}
                          />
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>

              {/* All Programme Scores */}
              <div className={styles.detailAllScores}>
                <h4>📈 All Programme Fit Scores</h4>
                <div className={styles.allScoresGrid}>
                  {selectedStudentAnalysis.programmeIndices.map((p) => (
                    <div key={p.name} className={styles.scoreItem}>
                      <div className={styles.scoreItemHeader}>
                        <span>{p.icon}</span>
                        <span>{p.name}</span>
                        <span className={getScoreColor(p.score)}>
                          {p.score}%
                        </span>
                      </div>
                      <div className={styles.scoreItemBar}>
                        <div
                          className={styles.scoreItemFill}
                          style={{ width: `${p.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendation Explanation */}
              <div className={styles.detailExplanation}>
                <h4>💡 Why This Recommendation?</h4>
                <div className={styles.explanationBox}>
                  <p>
                    <strong>
                      Programme Fit Score:{" "}
                      {selectedStudentAnalysis.topProgramme.score}%
                    </strong>
                  </p>
                  <p>
                    The {selectedStudentAnalysis.topProgramme.name} programme is
                    recommended because:
                  </p>
                  <ul>
                    <li>
                      Strong performance in key subjects:{" "}
                      {Object.entries(
                        selectedStudentAnalysis.topProgramme.formula,
                      )
                        .filter(([, weight]) => weight >= 25)
                        .map(([subject]) =>
                          subject.replace(/([A-Z])/g, " $1").trim(),
                        )
                        .join(", ")}
                    </li>
                    <li>
                      Weighted formula prioritizes subjects where the student
                      excels
                    </li>
                    <li>
                      Score gap from second choice:{" "}
                      {selectedStudentAnalysis.topProgramme.score -
                        selectedStudentAnalysis.secondProgramme.score}{" "}
                      points
                    </li>
                  </ul>
                  <p className={styles.explanationNote}>
                    <strong>
                      Confidence Level:{" "}
                      {selectedStudentAnalysis.confidenceLevel}
                    </strong>{" "}
                    -
                    {selectedStudentAnalysis.confidenceLevel === "High" &&
                      " Strong programme fit with clear academic alignment"}
                    {selectedStudentAnalysis.confidenceLevel === "Medium" &&
                      " Student shows aptitude for multiple programmes"}
                    {selectedStudentAnalysis.confidenceLevel === "Low" &&
                      " Consider additional assessment or career counseling"}
                  </p>
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button
                className={styles.closeBtn}
                onClick={() => setShowStudentDetail(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
