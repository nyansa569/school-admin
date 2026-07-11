// app/parent/attendance/components/TermSelector.tsx
"use client";

import styles from "./TermSelector.module.css";

interface TermSelectorProps {
  selectedTermId: number;
  onTermChange: (termId: number) => void;
}

export default function TermSelector({
  selectedTermId,
  onTermChange,
}: TermSelectorProps) {
  const terms = [
    { id: 1, name: "Term 1", period: "Jan - Apr 2024" },
    { id: 2, name: "Term 2", period: "May - Aug 2024" },
  ];

  return (
    <div className={styles.termSelector}>
      <div className={styles.termLabel}>Select Term</div>
      <div className={styles.termButtons}>
        {terms.map((term) => (
          <button
            key={term.id}
            className={`${styles.termBtn} ${
              selectedTermId === term.id ? styles.activeTerm : ""
            }`}
            onClick={() => onTermChange(term.id)}
          >
            <span className={styles.termName}>{term.name}</span>
            <span className={styles.termPeriod}>{term.period}</span>
          </button>
        ))}
      </div>
    </div>
  );
}