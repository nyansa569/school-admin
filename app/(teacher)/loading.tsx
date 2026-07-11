// app/(teacher)/loading.tsx
"use client";

import React from "react";

export default function TeacherLoading() {
  return (
    <div className="teacher-loading">
      <div className="loading-spinner"></div>
      <p>Loading teacher portal...</p>
      
      <style>{`
        .teacher-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: #f8fafc;
        }
        
        .loading-spinner {
          width: 48px;
          height: 48px;
          border: 3px solid #e2e8f0;
          border-top-color: #8b5cf6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }
        
        .teacher-loading p {
          color: #64748b;
          font-size: 0.875rem;
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