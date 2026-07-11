// app/(teacher)/layout.tsx
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import TeacherSidebar from "./components/teacherSideBar";
import styles from "./layout.module.css";

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/auth/login");
  }
    if (session.user.role === "admin") {
    redirect("/dashboard");
  }

  if (session.user.role !== "teacher") {
    redirect("/auth/login");
  }

  return (
    <div className={styles.container}>
      <TeacherSidebar />
      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
}