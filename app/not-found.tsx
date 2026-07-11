// app/not-found.tsx
"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="not-found-container">
      <div className="not-found-card">
        <div className="not-found-icon">🔍</div>
        <h1 className="not-found-title">404</h1>
        <h2 className="not-found-subtitle">Page not found</h2>
        <p className="not-found-message">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <div className="not-found-actions">
          <Link href="/dashboard" className="not-found-button primary">
            Go to Dashboard
          </Link>
          <button onClick={() => window.history.back()} className="not-found-button secondary">
            Go Back
          </button>
        </div>
      </div>
      
      <style>{`
        .not-found-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
          padding: 1rem;
        }
        
        .not-found-card {
          background: white;
          border-radius: 20px;
          padding: 2.5rem;
          text-align: center;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
          max-width: 500px;
          width: 100%;
        }
        
        .not-found-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }
        
        .not-found-title {
          font-size: 5rem;
          font-weight: 800;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          margin-bottom: 0.5rem;
        }
        
        .not-found-subtitle {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 0.5rem;
        }
        
        .not-found-message {
          color: #64748b;
          font-size: 0.875rem;
          margin-bottom: 1.5rem;
        }
        
        .not-found-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }
        
        .not-found-button {
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .not-found-button.primary {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          color: white;
          border: none;
        }
        
        .not-found-button.primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }
        
        .not-found-button.secondary {
          background: white;
          color: #475569;
          border: 1px solid #e2e8f0;
        }
        
        .not-found-button.secondary:hover {
          background: #f8fafc;
        }
      `}</style>
    </div>
  );
}