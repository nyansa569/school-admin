"use client";

import { useEffect, useState } from "react";
import { 
  getDashboardStats, 
  getRecentActivities, 
  getUpcomingEvents,
  getFeeCollectionTrend,
  getEnrollmentTrend,
  getClassPerformanceSummary,
  getTeacherWorkloadSummary
} from "@/lib/action/admin/dashboard";
import styles from "./page.module.css";

// SVG Icons
const StudentsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 6C13.6569 6 15 7.34315 15 9C15 10.6569 13.6569 12 12 12C10.3431 12 9 10.6569 9 9C9 7.34315 10.3431 6 12 6Z" stroke="currentColor" strokeWidth="1.5" />
    <path d="M20 21C20 17.134 16.4183 14 12 14C7.58172 14 4 17.134 4 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const StaffIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 21V19C17 16.8 15.2 15 13 15H5C2.8 15 1 16.8 1 19V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" />
    <path d="M23 21V19C22.9 16.7 21.1 15 18.9 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M16 3.13C18.1 3.53 19.7 5.4 19.7 7.5C19.7 9.6 18.1 11.5 16 11.9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const MoneyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2V4M12 20V22M4 12H2M6.31412 6.31412L4.8999 4.8999M17.6859 6.31412L19.1001 4.8999M6.31412 17.69L4.8999 19.1042M17.6859 17.69L19.1001 19.1042M22 12H20M4.5 16.5C5.5 17.5 6.5 18 8 18C10 18 11 16 12 15C13 14 14 12 16 12C17.5 12 18.5 12.5 19.5 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M12 8C13.1046 8 14 8.89543 14 10C14 11.1046 13.1046 12 12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="1.5" />
    <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="12" cy="15" r="1" fill="currentColor" />
    <circle cx="16" cy="15" r="1" fill="currentColor" />
    <circle cx="8" cy="15" r="1" fill="currentColor" />
  </svg>
);

const TrendingUpIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M23 6L13.5 15.5L8.5 10.5L1 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M17 6H23V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [feeTrend, setFeeTrend] = useState<any[]>([]);
  const [enrollmentTrend, setEnrollmentTrend] = useState<any[]>([]);
  const [classPerformance, setClassPerformance] = useState<any[]>([]);
  const [teacherWorkload, setTeacherWorkload] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    
    const [statsResult, activitiesResult, eventsResult, feeTrendResult, enrollmentTrendResult, classPerfResult, teacherWorkloadResult] = await Promise.all([
      getDashboardStats(),
      getRecentActivities(6),
      getUpcomingEvents(5),
      getFeeCollectionTrend(),
      getEnrollmentTrend(),
      getClassPerformanceSummary(),
      getTeacherWorkloadSummary(),
    ]);

    if (statsResult.stats) setStats(statsResult.stats);
    if (activitiesResult.activities) setActivities(activitiesResult.activities);
    if (eventsResult.events) setEvents(eventsResult.events);
    if (feeTrendResult.data) setFeeTrend(feeTrendResult.data);
    if (enrollmentTrendResult.data) setEnrollmentTrend(enrollmentTrendResult.data);
    if (classPerfResult.data) setClassPerformance(classPerfResult.data);
    if (teacherWorkloadResult.data) setTeacherWorkload(teacherWorkloadResult.data);

    setLoading(false);
  };

  const statCards = [
    {
      title: "Total Students",
      value: stats?.totalStudents || 0,
      icon: <StudentsIcon />,
      color: "#0f5c3f",
      bgColor: "#d1fae5",
      trend: "+12%",
    },
    {
      title: "Total Staff",
      value: stats?.totalStaff || 0,
      icon: <StaffIcon />,
      color: "#d4a529",
      bgColor: "#fef3c7",
      trend: "+5%",
    },
    {
      title: "Total Revenue",
      value: `GHS ${(stats?.totalFeesCollected || 0).toLocaleString()}`,
      icon: <MoneyIcon />,
      color: "#0f5c3f",
      bgColor: "#d1fae5",
      trend: "+18%",
    },
    {
      title: "Attendance Rate",
      value: `${stats?.attendanceRate || 0}%`,
      icon: <CalendarIcon />,
      color: "#d4a529",
      bgColor: "#fef3c7",
      trend: "+3%",
    },
  ];

  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>Welcome back! Here's what's happening at Kiddiewise School Complex today.</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.exportBtn}>
            <TrendingUpIcon />
            Export Report
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        {statCards.map((stat, index) => (
          <div key={index} className={styles.statCard}>
            <div className={styles.statIcon} style={{ backgroundColor: stat.bgColor, color: stat.color }}>
              {stat.icon}
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statTitle}>{stat.title}</span>
              <span className={styles.statValue}>{stat.value}</span>
              <span className={styles.statTrend}>
                <TrendingUpIcon />
                {stat.trend} from last month
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className={styles.chartsRow}>
        {/* Fee Collection Chart */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3>Fee Collection Trend</h3>
            <span className={styles.chartSubtitle}>Monthly revenue (GHS)</span>
          </div>
          <div className={styles.chartContainer}>
            {feeTrend.length > 0 ? (
              <div className={styles.barChart}>
                {feeTrend.map((item, index) => (
                  <div key={index} className={styles.barItem}>
                    <div className={styles.barLabel}>{item.month}</div>
                    <div className={styles.barWrapper}>
                      <div 
                        className={styles.bar} 
                        style={{ 
                          height: `${Math.min(100, (item.amount / Math.max(...feeTrend.map(t => t.amount), 1)) * 60)}px`,
                          backgroundColor: "#0f5c3f"
                        }}
                      />
                    </div>
                    <div className={styles.barValue}>{item.amount.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.noData}>No fee data available</div>
            )}
          </div>
        </div>

        {/* Enrollment Trend Chart */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3>Enrollment Trend</h3>
            <span className={styles.chartSubtitle}>Students enrolled per month</span>
          </div>
          <div className={styles.chartContainer}>
            {enrollmentTrend.length > 0 ? (
              <div className={styles.lineChart}>
                <svg viewBox="0 0 500 200" className={styles.chartSvg}>
                  <polyline
                    points={enrollmentTrend.map((item, index) => 
                      `${(index / (enrollmentTrend.length - 1)) * 500},${200 - (item.count / Math.max(...enrollmentTrend.map(t => t.count), 1)) * 180}`
                    ).join(" ")}
                    fill="none"
                    stroke="#d4a529"
                    strokeWidth="2"
                  />
                  {enrollmentTrend.map((item, index) => (
                    <circle
                      key={index}
                      cx={(index / (enrollmentTrend.length - 1)) * 500}
                      cy={200 - (item.count / Math.max(...enrollmentTrend.map(t => t.count), 1)) * 180}
                      r="4"
                      fill="#0f5c3f"
                    />
                  ))}
                </svg>
                <div className={styles.chartLabels}>
                  {enrollmentTrend.map((item, index) => (
                    <span key={index} className={styles.chartLabel}>{item.month}</span>
                  ))}
                </div>
              </div>
            ) : (
              <div className={styles.noData}>No enrollment data available</div>
            )}
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className={styles.twoColumn}>
        {/* Recent Activities */}
        <div className={styles.activityCard}>
          <div className={styles.cardHeader}>
            <h3>Recent Activities</h3>
            <button className={styles.viewAllBtn}>View All</button>
          </div>
          <div className={styles.activityList}>
            {activities.length > 0 ? (
              activities.map((activity) => (
                <div key={activity.id} className={styles.activityItem}>
                  <div className={styles.activityIcon}>{activity.icon}</div>
                  <div className={styles.activityContent}>
                    <div className={styles.activityTitle}>{activity.title}</div>
                    <div className={styles.activityDescription}>{activity.description}</div>
                    <div className={styles.activityTime}>
                      {new Date(activity.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.noData}>No recent activities</div>
            )}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className={styles.eventsCard}>
          <div className={styles.cardHeader}>
            <h3>Upcoming Events</h3>
            <button className={styles.viewAllBtn}>View Calendar</button>
          </div>
          <div className={styles.eventsList}>
            {events.length > 0 ? (
              events.map((event) => (
                <div key={event.id} className={styles.eventItem}>
                  <div className={styles.eventDate}>
                    <span className={styles.eventDay}>{new Date(event.date).getDate()}</span>
                    <span className={styles.eventMonth}>
                      {new Date(event.date).toLocaleString('default', { month: 'short' })}
                    </span>
                  </div>
                  <div className={styles.eventContent}>
                    <div className={styles.eventTitle}>{event.title}</div>
                    {event.description && (
                      <div className={styles.eventDescription}>{event.description}</div>
                    )}
                    <div className={`${styles.eventType} ${styles[event.type]}`}>
                      {event.type}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.noData}>No upcoming events</div>
            )}
          </div>
        </div>
      </div>

      {/* Class Performance Table */}
      <div className={styles.tableCard}>
        <div className={styles.cardHeader}>
          <h3>Class Performance Overview</h3>
          <button className={styles.viewAllBtn}>View Details</button>
        </div>
        <div className={styles.tableWrapper}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Class Name</th>
                <th>Level</th>
                <th>Students</th>
                <th>Average Score</th>
                <th>Performance</th>
              </tr>
            </thead>
            <tbody>
              {classPerformance.length > 0 ? (
                classPerformance.map((classItem) => (
                  <tr key={classItem.class_id}>
                    <td className={styles.className}>{classItem.class_name}</td>
                    <td>{classItem.level}</td>
                    <td>{classItem.student_count}</td>
                    <td>{classItem.average_score}%</td>
                    <td>
                      <div className={styles.progressBar}>
                        <div 
                          className={styles.progressFill} 
                          style={{ width: `${classItem.average_score}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className={styles.noData}>No class performance data</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Teacher Workload Table */}
      <div className={styles.tableCard}>
        <div className={styles.cardHeader}>
          <h3>Teacher Workload Summary</h3>
          <button className={styles.viewAllBtn}>View All</button>
        </div>
        <div className={styles.tableWrapper}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Teacher Name</th>
                <th>Email</th>
                <th>Classes</th>
                <th>Subjects</th>
                <th>Students</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {teacherWorkload.length > 0 ? (
                teacherWorkload.map((teacher) => (
                  <tr key={teacher.id}>
                    <td className={styles.teacherName}>{teacher.name}</td>
                    <td>{teacher.email}</td>
                    <td>{teacher.total_classes}</td>
                    <td>{teacher.total_subjects}</td>
                    <td>{teacher.total_students}</td>
                    <td>
                      <span className={styles.statusBadge}>Active</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className={styles.noData}>No teacher workload data</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}