// src/components/ResultDisplay.tsx
import React from 'react';

interface ResultDisplayProps {
  extractedData: string | null;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ extractedData }) => {
  if (!extractedData) return null;

  return (
    <div className="mt-6 bg-gray-100 rounded-lg p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="ml-3">Extracted Information</span>
      </h3>
      <pre className="bg-white p-4 rounded-md overflow-x-auto text-sm">
        {extractedData}
      </pre>
    </div>
  );
};

export default ResultDisplay;