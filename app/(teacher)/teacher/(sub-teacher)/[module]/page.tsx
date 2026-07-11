// app/(teacher)/teacher/(sub-teacher)/[module]/page.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./page.module.css";

type ValidModule = "attendance" | "grade" | "exam" | "assessment";

export default function ModulePage() {
  const params = useParams();
  const router = useRouter();
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [classes, setClasses] = useState<{ id: number; name: string }[]>([]);
  const [subjects, setSubjects] = useState<{ id: number; title: string; subject_code: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [isValidModule, setIsValidModule] = useState(true);

  const module = params?.module as string;
  const validModules: ValidModule[] = ["attendance", "grade", "exam", "assessment"];

  useEffect(() => {
    // Check if module is valid
    if (!validModules.includes(module as ValidModule)) {
      setIsValidModule(false);
      setLoading(false);
      return;
    }
    setIsValidModule(true);
    loadTeacherData();
  }, [module]);

  const loadTeacherData = async () => {
    setLoading(true);
    try {
      // Fetch teacher's assigned classes and subjects from API
      const response = await fetch("/api/teacher/assignments");
      const data = await response.json();
      
      if (data.classes) {
        setClasses(data.classes);
      }
      if (data.subjects) {
        setSubjects(data.subjects);
      }
    } catch (error) {
      console.error("Failed to load teacher data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProceed = () => {
    if (selectedClass && selectedSubject) {
      router.push(`/teacher/${module}/class/${selectedClass}/subject/${selectedSubject}`);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading your classes and subjects...</p>
        </div>
      </div>
    );
  }

  if (!isValidModule) {
    return (
      <div className={styles.container}>
        <div className={styles.errorCard}>
          <div className={styles.errorIcon}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2>Invalid Module</h2>
          <p>The module "{module}" does not exist.</p>
          <p className={styles.validModules}>Valid modules: {validModules.join(", ")}</p>
          <button className={styles.backButton} onClick={() => router.push("/teacher/dashboard")}>
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (classes.length === 0 || subjects.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.infoCard}>
          <div className={styles.infoIcon}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
            </svg>
          </div>
          <h2>No Assignments Found</h2>
          <p>You have not been assigned to any classes or subjects yet.</p>
          <p>Please contact the administrator to get assigned.</p>
          <button className={styles.backButton} onClick={() => router.push("/teacher/dashboard")}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const moduleTitle = module.charAt(0).toUpperCase() + module.slice(1);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.moduleIcon}>
            {module === "attendance" && (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
              </svg>
            )}
            {module === "grade" && (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z" />
              </svg>
            )}
            {module === "exam" && (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" />
              </svg>
            )}
            {module === "assessment" && (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
              </svg>
            )}
          </div>
          <h1 className={styles.title}>{moduleTitle}</h1>
          <p className={styles.subtitle}>Select a class and subject to continue</p>
        </div>

        <div className={styles.formSection}>
          <div className={styles.formGroup}>
            <label>Select Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="">-- Select a class --</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Select Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              disabled={!selectedClass}
            >
              <option value="">-- Select a subject --</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.title} ({subject.subject_code})
                </option>
              ))}
            </select>
            {!selectedClass && (
              <p className={styles.hint}>Please select a class first</p>
            )}
          </div>

          <button
            className={styles.proceedButton}
            onClick={handleProceed}
            disabled={!selectedClass || !selectedSubject}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            Proceed to {moduleTitle}
          </button>
        </div>

        <div className={styles.infoBox}>
          <div className={styles.infoIconSmall}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
            </svg>
          </div>
          <div className={styles.infoContent}>
            <strong>About {moduleTitle}</strong>
            {module === "attendance" && (
              <p>Track and manage student attendance for your classes. Mark students as present, absent, late, or excused.</p>
            )}
            {module === "grade" && (
              <p>Manage student grades including assessments and exams. Configure weight distribution and calculate final scores.</p>
            )}
            {module === "exam" && (
              <p>Create and manage exams. Enter scores for each student and track performance.</p>
            )}
            {module === "assessment" && (
              <p>Evaluate student performance, attitude, behavior, and participation. Provide descriptive feedback and recommendations.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}