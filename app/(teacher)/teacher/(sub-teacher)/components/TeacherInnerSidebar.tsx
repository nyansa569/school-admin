// app/(teacher)/teacher/(sub-teacher)/components/TeacherInnerSidebar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import styles from "./TeacherInnerSidebar.module.css";

type Subject = {
  id: number;
  title: string;
  subject_code: string;
};

type Class = {
  id: number;
  name: string;
  level: string;
  section?: string;
};

type Assignment = {
  id: number;
  subject_id: number;
  class_id: number;
  subject: Subject;
  class: Class;
};

type Profile = {
  assignments?: Assignment[];
};

type TeacherInnerSidebarProps = {
  profile: Profile | null;
};

export default function TeacherInnerSidebar({ profile }: TeacherInnerSidebarProps) {
  const pathname = usePathname();
  const params = useParams();
  const module = params.module;
  const [expandedClasses, setExpandedClasses] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const assignments = profile?.assignments || [];

  // Build classes with their subjects from assignments
  const classMap = new Map<number, { class: Class; subjects: Subject[] }>();

  assignments.forEach((assignment) => {
    if (!classMap.has(assignment.class_id)) {
      classMap.set(assignment.class_id, {
        class: assignment.class,
        subjects: [],
      });
    }
    // Add subject if not already added for this class
    const classData = classMap.get(assignment.class_id)!;
    if (!classData.subjects.some((s) => s.id === assignment.subject_id)) {
      classData.subjects.push(assignment.subject);
    }
  });

  // Convert map to array for rendering
  const classesWithSubjects = Array.from(classMap.values());

  // Filter classes based on search
  const filteredClasses = classesWithSubjects.filter((item) =>
    item.class.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.class.section && item.class.section.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const toggleClass = (classId: number) => {
    setExpandedClasses((prev) =>
      prev.includes(classId)
        ? prev.filter((id) => id !== classId)
        : [...prev, classId]
    );
  };

  if (assignments.length === 0) {
    return (
      <aside className={styles.sidebar}>
        <div className={styles.header}>
          <h3>My Classes</h3>
          <p>No classes assigned yet</p>
        </div>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📭</div>
          <p>You have no classes assigned</p>
        </div>
      </aside>
    );
  }

  return (
    <aside className={styles.sidebar}>
      {/* Header */}
      <div className={styles.header}>
        <h3>My Classes</h3>
        <p>Select a class to view subjects</p>
      </div>

      {/* Search */}
      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search classes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
        <span className={styles.searchIcon}>🔍</span>
      </div>

      {/* Classes and Subjects List */}
      <div className={styles.content}>
        {filteredClasses.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📭</div>
            <p>No classes found</p>
          </div>
        ) : (
          <div className={styles.treeList}>
            {filteredClasses.map((item) => {
              const isExpanded = expandedClasses.includes(item.class.id);

              return (
                <div key={item.class.id} className={styles.treeNode}>
                  {/* Class Header */}
                  <button
                    className={`${styles.classHeader} ${isExpanded ? styles.expanded : ""}`}
                    onClick={() => toggleClass(item.class.id)}
                  >
                    <span className={styles.expandIcon}>
                      {isExpanded ? "▼" : "▶"}
                    </span>
                    <span className={styles.classIcon}>🏫</span>
                    <span className={styles.className}>
                      {item.class.name}
                      {item.class.section ? ` ${item.class.section}` : ""}
                    </span>
                    <span className={styles.classBadge}>
                      {item.subjects.length} subjects
                    </span>
                  </button>

                  {/* Subjects List (shown when expanded) */}
                  {isExpanded && (
                    <div className={styles.subjectsContainer}>
                      {item.subjects.length === 0 ? (
                        <div className={styles.noSubjects}>No subjects assigned</div>
                      ) : (
                        item.subjects.map((subject) => (
                          <Link
                            key={subject.id}
                            href={`/teacher/${module}/class/${item.class.id}/subject/${subject.id}`}
                            className={`${styles.subjectLink} ${
                              pathname.includes(`/class/${item.class.id}/subject/${subject.id}`) ? styles.activeSubject : ""
                            }`}
                          >
                            <span className={styles.subjectIcon}>📘</span>
                            <span className={styles.subjectName}>{subject.title}</span>
                            <span className={styles.subjectCode}>{subject.subject_code}</span>
                          </Link>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <div className={styles.footerDivider} />
        <div className={styles.footerText}>
          <span>📋 Total Classes: {classesWithSubjects.length}</span>
        </div>
      </div>
    </aside>
  );
}