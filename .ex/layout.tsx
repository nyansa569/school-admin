"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import styles from "./layout.module.css";

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/students": "Students",
  "/teachers": "Teachers",
  "/classes": "Classes",
  "/settings": "Settings",
  "/support": "Help & Support",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const currentPage = pageTitles[pathname] || "Dashboard";

  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={styles.body}>
        <Sidebar />

        <main className={styles.main}>
          <div>{children}</div>
        </main>
      </body>
    </html>
  );
}
