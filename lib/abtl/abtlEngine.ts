// lib/abtl/abtlEngine.ts

// Grade to percentage conversion for JHS/Primary (A-F scale)
export const gradeToPercentage = (grade: string): number => {
  const gradeMap: { [key: string]: number } = {
    'A': 95,  // 90-100% - Excellent
    'B': 85,  // 80-89% - Very Good
    'C': 75,  // 70-79% - Good
    'D': 65,  // 60-69% - High Average
    'E': 55,  // 50-59% - Low Average
    'F': 40,  // Below 50% - Pass/Fail
  };
  return gradeMap[grade.toUpperCase()] || 0;
};

// Subject mapping for ABTL analysis
export interface StudentScores {
  mathematics: number | string;
  integratedScience: number | string;
  english: number | string;
  socialStudies: number | string;
  rme: number | string;
  computing: number | string;
  creativeArts: number | string;
  french: number | string;
}

export interface ProgrammeIndex {
  name: string;
  score: number;
  rank: number;
  suitableCourses: string[];
  purpose: string;
  formula: { [key: string]: number };
}

// Define all 9 programmes with their formulas and career pathways
const PROGRAMMES: Omit<ProgrammeIndex, 'score' | 'rank'>[] = [
  {
    name: "General Science",
    purpose: "Students with strong analytical and scientific potential",
    suitableCourses: [
      "Medicine", "Pharmacy", "Nursing", "Biomedical Science", "Computer Science",
      "Engineering", "Statistics", "Data Science", "Actuarial Science", "Artificial Intelligence"
    ],
    formula: {
      mathematics: 0.35,
      integratedScience: 0.35,
      computing: 0.15,
      english: 0.10,
      rme: 0.05,
    }
  },
  {
    name: "General Arts",
    purpose: "Students with strong communication, interpretation, governance, and social reasoning skills",
    suitableCourses: [
      "Law", "Political Science", "International Relations", "Sociology", "Psychology",
      "Public Administration", "Development Studies", "Communication Studies", "Journalism"
    ],
    formula: {
      english: 0.30,
      socialStudies: 0.30,
      rme: 0.20,
      french: 0.10,
      creativeArts: 0.10,
    }
  },
  {
    name: "Business",
    purpose: "Students with strong numerical and commercial reasoning",
    suitableCourses: [
      "Accounting", "Finance", "Banking", "Economics", "Marketing",
      "Human Resource Management", "Business Administration", "Insurance", "Procurement"
    ],
    formula: {
      mathematics: 0.35,
      socialStudies: 0.25,
      english: 0.20,
      computing: 0.15,
      rme: 0.05,
    }
  },
  {
    name: "Agriculture Science",
    purpose: "Students with scientific and practical production potential",
    suitableCourses: [
      "Agribusiness", "Crop Science", "Animal Science", "Agricultural Economics",
      "Agricultural Engineering", "Food Science", "Environmental Science", "Fisheries", "Forestry"
    ],
    formula: {
      integratedScience: 0.30,
      mathematics: 0.25,
      socialStudies: 0.20,
      computing: 0.15,
      english: 0.10,
    }
  },
  {
    name: "Home Economics",
    purpose: "Students interested in food, nutrition, hospitality, and family sciences",
    suitableCourses: [
      "Nutrition", "Dietetics", "Hospitality Management", "Food Science",
      "Fashion Design", "Family and Consumer Sciences", "Catering and Hotel Management"
    ],
    formula: {
      integratedScience: 0.25,
      english: 0.20,
      mathematics: 0.20,
      creativeArts: 0.20,
      socialStudies: 0.15,
    }
  },
  {
    name: "Visual Arts",
    purpose: "Students with strong creative and design potential",
    suitableCourses: [
      "Graphic Design", "Architecture", "Fine Arts", "Animation",
      "Interior Design", "Industrial Design", "Product Design", "Multimedia Design"
    ],
    formula: {
      creativeArts: 0.40,
      english: 0.20,
      mathematics: 0.10,
      socialStudies: 0.15,
      computing: 0.15,
    }
  },
  {
    name: "Technical",
    purpose: "Students suited to engineering, construction, and technical trades",
    suitableCourses: [
      "Mechanical Engineering", "Civil Engineering", "Electrical Engineering",
      "Construction Technology", "Quantity Surveying", "Mechatronics", "Industrial Technology"
    ],
    formula: {
      mathematics: 0.40,
      integratedScience: 0.30,
      computing: 0.20,
      creativeArts: 0.10,
    }
  },
  {
    name: "ICT / Technology",
    purpose: "Students with digital and computational aptitude",
    suitableCourses: [
      "Computer Science", "Information Technology", "Software Engineering",
      "Cybersecurity", "Data Science", "Artificial Intelligence", "Information Systems"
    ],
    formula: {
      computing: 0.40,
      mathematics: 0.30,
      integratedScience: 0.20,
      english: 0.10,
    }
  },
  {
    name: "Education",
    purpose: "Students with strong communication and knowledge-sharing potential",
    suitableCourses: [
      "Education", "Educational Psychology", "Guidance & Counselling",
      "Curriculum Studies", "Educational Leadership"
    ],
    formula: {
      english: 0.25,
      socialStudies: 0.25,
      mathematics: 0.20,
      rme: 0.15,
      integratedScience: 0.15,
    }
  }
];

// Helper to get numeric score from either percentage or letter grade
const getNumericScore = (value: number | string): number => {
  if (typeof value === 'number') return value;
  // Check if it's a letter grade (A, B, C, D, E, F)
  if (typeof value === 'string' && /^[A-F]$/i.test(value)) {
    return gradeToPercentage(value);
  }
  // Try to parse as number
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
};

// Calculate a single programme index score
const calculateProgrammeScore = (
  programme: typeof PROGRAMMES[0],
  scores: StudentScores
): number => {
  let totalWeight = 0;
  let weightedSum = 0;

  for (const [subject, weight] of Object.entries(programme.formula)) {
    const score = getNumericScore(scores[subject as keyof StudentScores] || 0);
    weightedSum += score * weight;
    totalWeight += weight;
  }

  // Normalize to 100 (in case weights don't sum to 1)
  const normalizedScore = totalWeight > 0 ? (weightedSum / totalWeight) : 0;
  return Math.round(normalizedScore);
};

// Main function to calculate all programme indices and return rankings
export const calculateABTLIndices = (scores: StudentScores): ProgrammeIndex[] => {
  // Calculate scores for all programmes
  const results: ProgrammeIndex[] = PROGRAMMES.map(programme => ({
    ...programme,
    score: calculateProgrammeScore(programme, scores),
    rank: 0,
  }));

  // Sort by score (highest first) and assign ranks
  const sorted = [...results].sort((a, b) => b.score - a.score);
  sorted.forEach((item, index) => {
    item.rank = index + 1;
  });

  return sorted;
};

// Get top 3 recommendations with medals
export interface Recommendation {
  rank: number;
  programme: ProgrammeIndex;
  medal: '🥇' | '🥈' | '🥉';
  label: string;
}

export const getTopRecommendations = (indices: ProgrammeIndex[]): Recommendation[] => {
  const top3 = indices.filter(i => i.rank <= 3);
  
  const medalMap: { [key: number]: { medal: '🥇' | '🥈' | '🥉'; label: string } } = {
    1: { medal: '🥇', label: 'Best Programme Fit' },
    2: { medal: '🥈', label: 'Strong Alternative' },
    3: { medal: '🥉', label: 'Viable Alternative' },
  };

  return top3.map(item => ({
    rank: item.rank,
    programme: item,
    medal: medalMap[item.rank].medal,
    label: medalMap[item.rank].label,
  }));
};

// Get career pathways based on top programme
export const getCareerPathways = (topProgramme: ProgrammeIndex): string[] => {
  return topProgramme.suitableCourses.slice(0, 5); // Return top 5 recommended courses
};

// Format scores from subject grades (convert letter grades to percentages)
export const formatScoresFromGrades = (grades: {
  mathematics?: string;
  english?: string;
  science?: string;
  socialStudies?: string;
  rme?: string;
  computing?: string;
  creativeArts?: string;
  french?: string;
}): StudentScores => {
  return {
    mathematics: grades.mathematics ? gradeToPercentage(grades.mathematics) : 0,
    integratedScience: grades.science ? gradeToPercentage(grades.science) : 0,
    english: grades.english ? gradeToPercentage(grades.english) : 0,
    socialStudies: grades.socialStudies ? gradeToPercentage(grades.socialStudies) : 0,
    rme: grades.rme ? gradeToPercentage(grades.rme) : 0,
    computing: grades.computing ? gradeToPercentage(grades.computing) : 0,
    creativeArts: grades.creativeArts ? gradeToPercentage(grades.creativeArts) : 0,
    french: grades.french ? gradeToPercentage(grades.french) : 0,
  };
};

// Generate full ABTL report for a student
export interface ABTLReport {
  studentName: string;
  className: string;
  scores: StudentScores;
  programmeIndices: ProgrammeIndex[];
  topRecommendations: Recommendation[];
  summary: {
    bestFit: ProgrammeIndex;
    scoreRange: { min: number; max: number };
    strengths: string[];
    areasForImprovement: string[];
  };
}

export const generateABTLReport = (
  studentName: string,
  className: string,
  scores: StudentScores
): ABTLReport => {
  const programmeIndices = calculateABTLIndices(scores);
  const topRecommendations = getTopRecommendations(programmeIndices);
  const bestFit = programmeIndices[0];
  
  // Determine strengths (subjects where student scored above 75%)
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  
  const subjectScores = {
    Mathematics: scores.mathematics,
    'Integrated Science': scores.integratedScience,
    English: scores.english,
    'Social Studies': scores.socialStudies,
    RME: scores.rme,
    Computing: scores.computing,
    'Creative Arts': scores.creativeArts,
    French: scores.french,
  };
  
  for (const [subject, score] of Object.entries(subjectScores)) {
    const numericScore = getNumericScore(score);
    if (numericScore >= 75) {
      strengths.push(subject);
    } else if (numericScore < 50 && numericScore > 0) {
      weaknesses.push(subject);
    }
  }
  
  return {
    studentName,
    className,
    scores,
    programmeIndices,
    topRecommendations,
    summary: {
      bestFit,
      scoreRange: {
        min: Math.min(...programmeIndices.map(p => p.score)),
        max: Math.max(...programmeIndices.map(p => p.score)),
      },
      strengths: strengths.slice(0, 3),
      areasForImprovement: weaknesses.slice(0, 3),
    },
  };
};