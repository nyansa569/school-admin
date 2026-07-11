// components/DownloadPDFButton.tsx
"use client";

import { useState } from 'react';

interface DownloadPDFButtonProps {
  onClick: () => Promise<any>;
  fileName?: string;
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export function DownloadPDFButton({ 
  onClick, 
  fileName, 
  children, 
  className, 
  disabled 
}: DownloadPDFButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async () => {
    setIsLoading(true);
    try {
      const pdfDataUrl = await onClick();
      if (pdfDataUrl && typeof pdfDataUrl === 'string') {
        const link = document.createElement('a');
        link.href = pdfDataUrl;
        link.download = fileName || `document-${Date.now()}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to generate PDF. Please try again.');
    }
    setIsLoading(false);
  };

  return (
    <button
      onClick={handleDownload}
      disabled={disabled || isLoading}
      className={className}
      style={{ 
        cursor: isLoading ? 'wait' : 'pointer', 
        opacity: isLoading ? 0.6 : 1 
      }}
    >
      {isLoading ? (
        <>
          <svg 
            viewBox="0 0 24 24" 
            width="16" 
            height="16" 
            style={{ animation: 'spin 1s linear infinite' }}
          >
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="32" />
          </svg>
          Generating...
        </>
      ) : (
        children || 'Download PDF'
      )}
    </button>
  );
}