// app/(dashboard)/layout.tsx
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import styles from "./layout.module.css";
import { getSession } from "@/lib/auth";
import DashboardClient from "./DashboardClient";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/auth/login");
  }
  if (session.user.role === "teacher") {
    redirect("/teacher/dashboard");
  }
  if (session.user.role === "parent") {
    redirect("/parent");
  }
  if (session.user.role !== "admin") {
    redirect("/auth/login");
  }

  return (
    <div className={styles.body}>
      <Sidebar />
      <DashboardClient>{children}</DashboardClient>
    </div>
  );
}