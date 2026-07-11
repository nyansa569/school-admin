
// =============================================
// GET GRADE SCALE (Helper)
// =============================================

export async function getGradeScale() {
  // Standard grade scale - can be stored in DB later
  const gradeScale = [
    { min: 80, max: 100, grade: "A", description: "Excellent" },
    { min: 70, max: 79, grade: "B", description: "Very Good" },
    { min: 60, max: 69, grade: "C", description: "Good" },
    { min: 50, max: 59, grade: "D", description: "Satisfactory" },
    { min: 40, max: 49, grade: "E", description: "Pass" },
    { min: 0, max: 39, grade: "F", description: "Fail" },
  ];

  // Return only the data, not the functions
  return { gradeScale };
}

export function calculateGrade(score: number): string {
  if (score >= 80) return "A";
  if (score >= 70) return "B";
  if (score >= 60) return "C";
  if (score >= 50) return "D";
  if (score >= 40) return "E";
  return "F";
}

export function getGradeDescription(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 70) return "Very Good";
  if (score >= 60) return "Good";
  if (score >= 50) return "Satisfactory";
  if (score >= 40) return "Pass";
  return "Fail";
}