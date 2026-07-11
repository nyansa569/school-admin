// app/(teacher)/components/TeacherSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./TeacherSidebar.module.css";
import LogoutButton from "@/components/Logout/Logout";
import { getTeacherProfile } from "@/lib/action/teacher/profile";
import { useRouter } from "next/navigation";

const menuItems = [
  {
    name: "Dashboard",
    path: "/teacher/dashboard",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z"
        />
      </svg>
    ),
  },
  {
    name: "Grade",
    path: "/teacher/grade",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z"
        />
      </svg>
    ),
  },
  {
    name: "Assessment",
    path: "/teacher/assessment",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z"
        />
      </svg>
    ),
  },
  {
    name: "Attendance",
    path: "/teacher/attendance",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
        />
      </svg>
    ),
  },
];

export default function TeacherSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [teacher, setTeacher] = useState({
    name: "",
    role: "",
    email: "",
    avatar: "",
    department: "",
    employeeId: "",
    profile_picture: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeacherProfile();
  }, []);

  const loadTeacherProfile = async () => {
    const result = await getTeacherProfile();
    if (result.profile && !result.error) {
      const profile = result.profile;
      setTeacher({
        name: `${profile.first_name} ${profile.last_name}`,
        role: profile.role === "teacher" ? "Teacher" : profile.role,
        email: profile.email,
        avatar: `${profile.first_name?.[0]}${profile.last_name?.[0]}`,
        department: profile.department?.name || "No Department",
        employeeId: `TCH-${profile.id}`,
        profile_picture: profile.profile_picture || "",
      });
    }
    setLoading(false);
  };

  const getAvatar = () => {
    if (teacher.profile_picture) {
      return (
        <img
          src={teacher.profile_picture}
          alt={teacher.name}
          className={styles.avatarImage}
        />
      );
    }
    return teacher.avatar;
  };

  if (loading) {
    return (
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <div className={styles.logoIcon}>🎓</div>
          <div>
            <div className={styles.brandTitle}>Teacher Portal</div>
            <div className={styles.brandSubtitle}>Loading...</div>
          </div>
        </div>
        <div className={styles.loadingState}>Loading profile...</div>
      </aside>
    );
  }

  return (
    <aside className={styles.sidebar}>
      {/* Brand */}
      <div className={styles.brand}>
        <div className={styles.logoIcon}>🎓</div>
        <div>
          <div className={styles.brandTitle}>Teacher Portal</div>
          <div className={styles.brandSubtitle}>Classroom Management</div>
        </div>
      </div>

      {/* Teacher Profile */}
      <div
        className={styles.profileSection}
        onClick={() => router.push("/teacher/profile")}
        style={{ cursor: "pointer" }}
      >
        <div className={styles.avatarWrapper}>
          <div className={styles.avatar}>{getAvatar()}</div>
          <span className={styles.statusDot} />
        </div>
        <div className={styles.profileInfo}>
          <div className={styles.teacherName}>{teacher.name}</div>
          <div className={styles.teacherRole}>{teacher.role}</div>
          <div className={styles.teacherEmail}>{teacher.email}</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className={styles.nav}>
        {menuItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`${styles.navLink} ${
              pathname === item.path ? styles.active : ""
            }`}
          >
            <span className={styles.navIcon}>{item.icon}</span>
            <span className={styles.navLabel}>{item.name}</span>
            {pathname === item.path && (
              <span className={styles.activeIndicator} />
            )}
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className={styles.logoutSection}>
        <LogoutButton
          variant="text"
          showIcon={true}
          className={styles.logoutBtn}
        />
      </div>

      {/* Footer Info */}
      <div className={styles.footer}>
        <div className={styles.divider} />
        <div className={styles.footerInfo}>
          <div className={styles.deptInfo}>
            <span className={styles.deptIcon}>🏛️</span>
            <span className={styles.deptName}>{teacher.department}</span>
          </div>
          <div className={styles.empId}>ID: {teacher.employeeId}</div>
        </div>
      </div>
    </aside>
  );
}
