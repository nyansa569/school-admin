// app/(teacher)/teacher/(sub-teacher)/loading.tsx
"use client";

import React from "react";

export default function SubTeacherLoading() {
  return (
    <div className="subteacher-loading">
      <div className="loading-skeleton">
        <div className="skeleton-sidebar"></div>
        <div className="skeleton-content">
          <div className="skeleton-header"></div>
          <div className="skeleton-card"></div>
          <div className="skeleton-table"></div>
        </div>
      </div>
      
      <style>{`
        .subteacher-loading {
          min-height: calc(100vh - 70px);
          background: #f8fafc;
        }
        
        .loading-skeleton {
          display: flex;
          height: 100%;
        }
        
        .skeleton-sidebar {
          width: 380px;
          background: #f1f5f9;
          border-radius: 12px;
          margin: 1rem;
          animation: pulse 1.5s ease-in-out infinite;
        }
        
        .skeleton-content {
          flex: 1;
          padding: 1.5rem;
        }
        
        .skeleton-header {
          height: 80px;
          background: #f1f5f9;
          border-radius: 12px;
          margin-bottom: 1.5rem;
          animation: pulse 1.5s ease-in-out infinite;
        }
        
        .skeleton-card {
          height: 120px;
          background: #f1f5f9;
          border-radius: 12px;
          margin-bottom: 1.5rem;
          animation: pulse 1.5s ease-in-out infinite 0.2s;
        }
        
        .skeleton-table {
          height: 400px;
          background: #f1f5f9;
          border-radius: 12px;
          animation: pulse 1.5s ease-in-out infinite 0.4s;
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
}