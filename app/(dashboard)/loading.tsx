// app/(dashboard)/loading.tsx
"use client";

import React from "react";

export default function DashboardLoading() {
  return (
    <div className="dashboard-loading">
      <div className="loading-card">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
      
      <style>{`
        .dashboard-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: calc(100vh - 120px);
          padding: 2rem;
        }
        
        .loading-card {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          text-align: center;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }
        
        .loading-spinner {
          width: 48px;
          height: 48px;
          border: 3px solid #e2e8f0;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }
        
        .loading-card p {
          color: #64748b;
          font-size: 0.875rem;
          margin: 0;
        }
        
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}