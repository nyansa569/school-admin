"use client";

import { useState } from "react";
import styles from "./page.module.css";

// Mock data for dashboard
const statsData = [
  {
    id: 1,
    title: "Total Students",
    value: "2,456",
    change: "+12.5%",
    trend: "up",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a23.54 23.54 0 0 0-2.688 6.352A48.596 48.596 0 0 1 12 20.904a48.596 48.596 0 0 1 8.399-4.405 23.54 23.54 0 0 0-2.688-6.352M12 2.25l9.75 5.625-9.75 5.625L2.25 7.875 12 2.25Z" />
      </svg>
    ),
    bgColor: "#e0f2fe",
    iconColor: "#0284c7"
  },
  {
    id: 2,
    title: "Total Staff",
    value: "128",
    change: "+4.2%",
    trend: "up",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
      </svg>
    ),
    bgColor: "#dbeafe",
    iconColor: "#2563eb"
  },
  {
    id: 3,
    title: "Total Classes",
    value: "48",
    change: "+2",
    trend: "up",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
      </svg>
    ),
    bgColor: "#fef3c7",
    iconColor: "#d97706"
  },
  {
    id: 4,
    title: "Revenue (MTD)",
    value: "$245K",
    change: "+18.3%",
    trend: "up",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
    bgColor: "#dcfce7",
    iconColor: "#16a34a"
  },
];

const recentActivities = [
  {
    id: 1,
    user: "John Smith",
    action: "enrolled in",
    target: "Grade 10A",
    time: "5 minutes ago",
    avatar: "JS",
    type: "enrollment"
  },
  {
    id: 2,
    user: "Sarah Johnson",
    action: "submitted assignment",
    target: "Mathematics",
    time: "15 minutes ago",
    avatar: "SJ",
    type: "submission"
  },
  {
    id: 3,
    user: "Michael Chen",
    action: "requested leave",
    target: "Medical leave",
    time: "1 hour ago",
    avatar: "MC",
    type: "leave"
  },
  {
    id: 4,
    user: "Emily Rodriguez",
    action: "scheduled meeting with",
    target: "Parents",
    time: "2 hours ago",
    avatar: "ER",
    type: "meeting"
  },
  {
    id: 5,
    user: "David Thompson",
    action: "updated grades for",
    target: "Science Club",
    time: "3 hours ago",
    avatar: "DT",
    type: "grade"
  },
];

const upcomingEvents = [
  {
    id: 1,
    title: "Parent-Teacher Meeting",
    date: "Mar 15, 2024",
    time: "10:00 AM - 2:00 PM",
    location: "Main Auditorium"
  },
  {
    id: 2,
    title: "Science Fair",
    date: "Mar 20, 2024",
    time: "9:00 AM - 4:00 PM",
    location: "Exhibition Hall"
  },
  {
    id: 3,
    title: "Staff Development Day",
    date: "Mar 25, 2024",
    time: "8:30 AM - 3:30 PM",
    location: "Conference Room"
  },
  {
    id: 4,
    title: "Sports Day",
    date: "Apr 5, 2024",
    time: "8:00 AM - 5:00 PM",
    location: "Sports Complex"
  },
];

const attendanceData = [
  { className: "Grade 10A", percentage: 95 },
  { className: "Grade 10B", percentage: 88 },
  { className: "Grade 9A", percentage: 92 },
  { className: "Grade 9B", percentage: 85 },
  { className: "Grade 8A", percentage: 96 },
  { className: "Grade 8B", percentage: 90 },
];

export default function Dashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState("weekly");

  return (
    <div className={styles.dashboard}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.pageTitle}>Dashboard</h1>
            <p className={styles.pageSubtitle}>Welcome back, Admin User! Here's what's happening today.</p>
          </div>
          <div className={styles.headerActions}>
            <div className={styles.periodSelector}>
              <button
                className={`${styles.periodButton} ${selectedPeriod === "daily" ? styles.activePeriod : ""}`}
                onClick={() => setSelectedPeriod("daily")}
              >
                Daily
              </button>
              <button
                className={`${styles.periodButton} ${selectedPeriod === "weekly" ? styles.activePeriod : ""}`}
                onClick={() => setSelectedPeriod("weekly")}
              >
                Weekly
              </button>
              <button
                className={`${styles.periodButton} ${selectedPeriod === "monthly" ? styles.activePeriod : ""}`}
                onClick={() => setSelectedPeriod("monthly")}
              >
                Monthly
              </button>
            </div>
            <button className={styles.refreshButton}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          {statsData.map((stat) => (
            <div key={stat.id} className={styles.statCard}>
              <div className={styles.statHeader}>
                <div 
                  className={styles.statIcon}
                  style={{ backgroundColor: stat.bgColor, color: stat.iconColor }}
                >
                  {stat.icon}
                </div>
                <span className={`${styles.statTrend} ${styles[stat.trend]}`}>
                  {stat.change}
                </span>
              </div>
              <div className={styles.statContent}>
                <h3 className={styles.statTitle}>{stat.title}</h3>
                <p className={styles.statValue}>{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className={styles.chartsSection}>
          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <h3 className={styles.chartTitle}>Attendance Overview</h3>
              <select className={styles.chartSelect}>
                <option>This Week</option>
                <option>This Month</option>
                <option>This Term</option>
              </select>
            </div>
            <div className={styles.attendanceList}>
              {attendanceData.map((item, index) => (
                <div key={index} className={styles.attendanceItem}>
                  <span className={styles.attendanceClass}>{item.className}</span>
                  <div className={styles.attendanceBarContainer}>
                    <div 
                      className={styles.attendanceBar}
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                  <span className={styles.attendancePercentage}>{item.percentage}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <h3 className={styles.chartTitle}>Quick Actions</h3>
            </div>
            <div className={styles.quickActions}>
              <button className={styles.quickAction}>
                <div className={styles.quickActionIcon}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
                  </svg>
                </div>
                <span>Add Student</span>
              </button>
              <button className={styles.quickAction}>
                <div className={styles.quickActionIcon}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM4 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 10.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
                  </svg>
                </div>
                <span>Add Teacher</span>
              </button>
              <button className={styles.quickAction}>
                <div className={styles.quickActionIcon}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                  </svg>
                </div>
                <span>Schedule Event</span>
              </button>
              <button className={styles.quickAction}>
                <div className={styles.quickActionIcon}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
                  </svg>
                </div>
                <span>Send Notice</span>
              </button>
            </div>
          </div>
        </div>

        {/* Activities and Events */}
        <div className={styles.activitySection}>
          {/* Recent Activities */}
          <div className={styles.activityCard}>
            <div className={styles.activityHeader}>
              <h3 className={styles.activityTitle}>Recent Activities</h3>
              <a href="#" className={styles.viewAllLink}>View All</a>
            </div>
            <div className={styles.activityList}>
              {recentActivities.map((activity) => (
                <div key={activity.id} className={styles.activityItem}>
                  <div className={`${styles.activityAvatar} ${styles[activity.type]}`}>
                    {activity.avatar}
                  </div>
                  <div className={styles.activityContent}>
                    <p className={styles.activityText}>
                      <span className={styles.activityUser}>{activity.user}</span>{" "}
                      {activity.action}{" "}
                      <span className={styles.activityTarget}>{activity.target}</span>
                    </p>
                    <span className={styles.activityTime}>{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className={styles.activityCard}>
            <div className={styles.activityHeader}>
              <h3 className={styles.activityTitle}>Upcoming Events</h3>
              <a href="#" className={styles.viewAllLink}>View All</a>
            </div>
            <div className={styles.eventList}>
              {upcomingEvents.map((event) => (
                <div key={event.id} className={styles.eventItem}>
                  <div className={styles.eventDate}>
                    <span className={styles.eventMonth}>{event.date.split(' ')[0]}</span>
                    <span className={styles.eventDay}>{event.date.split(' ')[1].replace(',', '')}</span>
                  </div>
                  <div className={styles.eventContent}>
                    <h4 className={styles.eventTitle}>{event.title}</h4>
                    <p className={styles.eventDetails}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
                      </svg>
                      {event.time}
                    </p>
                    <p className={styles.eventDetails}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                      </svg>
                      {event.location}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}