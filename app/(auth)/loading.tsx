// app/(auth)/loading.tsx
"use client";

import React from "react";

export default function AuthLoading() {
  return (
    <div className="auth-loading">
      <div className="loading-card">
        <div className="loading-logo">🎓</div>
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
      
      <style>{`
        .auth-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        
        .loading-card {
          background: white;
          border-radius: 20px;
          padding: 2.5rem;
          text-align: center;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          min-width: 300px;
        }
        
        .loading-logo {
          font-size: 3rem;
          margin-bottom: 1.5rem;
        }
        
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e2e8f0;
          border-top-color: #667eea;
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