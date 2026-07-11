// app/parent/results/components/ChildSelector.tsx
"use client";

import { useState } from "react";
import styles from "./ChildSelector.module.css";
import { Child } from "@/app/(parent)/types";

interface ChildSelectorProps {
  children: Child[];
  selectedChildId: number;
  onChildChange: (childId: number) => void;
}

export default function ChildSelector({
  children,
  selectedChildId,
  onChildChange,
}: ChildSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedChild = children.find(c => c.id === selectedChildId);

  const handleSelect = (childId: number) => {
    onChildChange(childId);
    setIsOpen(false);
  };

  return (
    <div className={styles.selectorContainer}>
      <div className={styles.selectorLabel}>Select Child</div>
      <div className={styles.dropdown} onClick={() => setIsOpen(!isOpen)}>
        <div className={styles.selectedOption}>
          <div className={styles.selectedAvatar}>
            {selectedChild?.first_name[0]}{selectedChild?.last_name[0]}
          </div>
          <div className={styles.selectedInfo}>
            <span className={styles.selectedName}>
              {selectedChild?.first_name} {selectedChild?.last_name}
            </span>
            <span className={styles.selectedClass}>{selectedChild?.class?.name}</span>
          </div>
          <svg
            className={`${styles.dropdownArrow} ${isOpen ? styles.open : ""}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>

        {isOpen && (
          <div className={styles.dropdownMenu}>
            {children.map((child) => (
              <div
                key={child.id}
                className={`${styles.dropdownItem} ${selectedChildId === child.id ? styles.active : ""}`}
                onClick={() => handleSelect(child.id)}
              >
                <div className={styles.itemAvatar}>
                  {child.first_name[0]}{child.last_name[0]}
                </div>
                <div className={styles.itemInfo}>
                  <span className={styles.itemName}>
                    {child.first_name} {child.last_name}
                  </span>
                  <span className={styles.itemClass}>{child.class?.name}</span>
                </div>
                {selectedChildId === child.id && (
                  <svg className={styles.checkIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}