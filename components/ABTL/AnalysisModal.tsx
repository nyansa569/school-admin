// components/ABTL/AnalysisModal.tsx
"use client";

import React from "react";
import { ProgrammeIndex, Recommendation, ABTLReport } from "@/lib/abtl/abtlEngine";
import styles from "./AnalysisModal.module.css";

interface AnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: ABTLReport | null;
  studentName: string;
}

export default function AnalysisModal({ isOpen, onClose, report, studentName }: AnalysisModalProps) {
  if (!isOpen || !report) return null;

  const getScoreColor = (score: number) => {
    if (score >= 80) return styles.scoreExcellent;
    if (score >= 70) return styles.scoreGood;
    if (score >= 60) return styles.scoreAverage;
    return styles.scoreLow;
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>ABTL Programme Analysis</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
            </svg>
          </button>
        </div>

        <div className={styles.modalBody}>
          {/* Student Info */}
          <div className={styles.studentInfo}>
            <h3>{report.studentName}</h3>
            <p className={styles.className}>{report.className}</p>
          </div>

          {/* Top Recommendations */}
          <div className={styles.recommendationsSection}>
            <h4>🎯 Programme Recommendations</h4>
            <div className={styles.recommendationCards}>
              {report.topRecommendations.map((rec) => (
                <div key={rec.rank} className={`${styles.recommendationCard} ${styles[`rank${rec.rank}`]}`}>
                  <div className={styles.medal}>{rec.medal}</div>
                  <div className={styles.recommendationContent}>
                    <div className={styles.programmeName}>{rec.programme.name}</div>
                    <div className={styles.fitScore}>
                      Fit Score: <strong>{rec.programme.score}%</strong>
                    </div>
                    <div className={styles.rankLabel}>{rec.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* All Programmes Table */}
          <div className={styles.allProgrammesSection}>
            <h4>📊 All Programme Indices</h4>
            <div className={styles.tableContainer}>
              <table className={styles.programmeTable}>
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Programme</th>
                    <th>Fit Score</th>
                    <th>Career Path</th>
                  </tr>
                </thead>
                <tbody>
                  {report.programmeIndices.map((programme) => (
                    <tr key={programme.name}>
                      <td className={styles.rankCell}>
                        {programme.rank <= 3 ? (
                          <span className={styles.medalSmall}>
                            {programme.rank === 1 ? "🥇" : programme.rank === 2 ? "🥈" : "🥉"}
                          </span>
                        ) : (
                          programme.rank
                        )}
                      </td>
                      <td className={styles.programmeCell}>{programme.name}</td>
                      <td className={styles.scoreCell}>
                        <span className={`${styles.scoreBadge} ${getScoreColor(programme.score)}`}>
                          {programme.score}%
                        </span>
                      </td>
                      <td className={styles.careerCell}>
                        {programme.suitableCourses.slice(0, 3).join(", ")}...
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Career Pathways */}
          <div className={styles.careerSection}>
            <h4>🎓 Recommended Career Pathways</h4>
            <div className={styles.careerGrid}>
              {report.summary.bestFit.suitableCourses.map((course, idx) => (
                <div key={idx} className={styles.careerCard}>
                  <span className={styles.careerIcon}>📘</span>
                  <span>{course}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Strengths & Improvement Areas */}
          <div className={styles.strengthsSection}>
            <div className={styles.strengthsCard}>
              <h5>💪 Strengths</h5>
              {report.summary.strengths.length > 0 ? (
                <ul>
                  {report.summary.strengths.map((strength, idx) => (
                    <li key={idx}>{strength}</li>
                  ))}
                </ul>
              ) : (
                <p>No significant strengths identified</p>
              )}
            </div>
            <div className={styles.improvementCard}>
              <h5>📚 Areas for Improvement</h5>
              {report.summary.areasForImprovement.length > 0 ? (
                <ul>
                  {report.summary.areasForImprovement.map((area, idx) => (
                    <li key={idx}>{area}</li>
                  ))}
                </ul>
              ) : (
                <p>Keep up the good work!</p>
              )}
            </div>
          </div>

          {/* Programme Formula Reference */}
          <details className={styles.formulaReference}>
            <summary>📐 View Programme Formulas</summary>
            <div className={styles.formulaGrid}>
              {report.programmeIndices.map((programme) => (
                <div key={programme.name} className={styles.formulaItem}>
                  <strong>{programme.name}</strong>
                  <p className={styles.purpose}>{programme.purpose}</p>
                  <div className={styles.formula}>
                    {Object.entries(programme.formula).map(([subject, weight]) => (
                      <span key={subject}>
                        {subject}: {(weight * 100).toFixed(0)}%
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </details>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.closeBtn} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}