// app/parent/children/page.tsx
"use client";

import { useState } from "react";
import styles from "./page.module.css";
import ChildCard from "./component/ChildCard";
import ChildDetailsModal from "./component/ChildDetailsModal";
import { Child } from "../../types";
import { dummyChildren } from "../../data";


export default function MyChildrenPage() {
  const [children] = useState<Child[]>(dummyChildren);
  const [loading] = useState(false);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleViewChild = (child: Child) => {
    setSelectedChild(child);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedChild(null);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading children information...</p>
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <div className={styles.emptyIcon}>👶</div>
        <h3>No Children Found</h3>
        <p>You don't have any children registered in the system.</p>
        <p className={styles.contactText}>Please contact the school administration for assistance.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>My Children</h2>
        <p>View and manage your children's academic information</p>
      </div>

      <div className={styles.childrenGrid}>
        {children.map((child) => (
          <ChildCard
            key={child.id}
            child={child}
            onView={handleViewChild}
          />
        ))}
      </div>

      {selectedChild && (
        <ChildDetailsModal
          child={selectedChild}
          isOpen={showModal}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}