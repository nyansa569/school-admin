// app/parent/results/components/TermSelector.tsx
"use client";

import { TermResult } from "@/app/(parent)/types";
import styles from "./TermSelector.module.css";

interface TermSelectorProps {
  terms: TermResult[];
  selectedTermId: number;
  onTermChange: (termId: number) => void;
}

export default function TermSelector({
  terms,
  selectedTermId,
  onTermChange,
}: TermSelectorProps) {
  return (
    <div className={styles.termSelector}>
      <div className={styles.termLabel}>Select Term</div>
      <div className={styles.termButtons}>
        {terms.map((term) => (
          <button
            key={term.term_id}
            className={`${styles.termBtn} ${
              selectedTermId === term.term_id ? styles.activeTerm : ""
            }`}
            onClick={() => onTermChange(term.term_id)}
          >
            <span className={styles.termName}>{term.term_name}</span>
            <span className={styles.termYear}>{term.academic_year}</span>
          </button>
        ))}
      </div>
    </div>
  );
}