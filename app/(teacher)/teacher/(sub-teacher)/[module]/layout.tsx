// app/(teacher)/teacher/(sub-teacher)/layout.tsx
import { getTeacherProfile } from "@/lib/action/teacher/profile";
import TeacherInnerSidebar from "../components/TeacherInnerSidebar";
import styles from "./layout.module.css";

export default async function SubTeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const result = await getTeacherProfile();

  return (
    <div className={styles.container}>
      <TeacherInnerSidebar profile={result.profile || null} />
      <main className={styles.main}>{children}</main>
    </div>
  );
}