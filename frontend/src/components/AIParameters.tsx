// src/components/AIParameters.tsx
import React from 'react';
import { SettingsIcon } from './Icons';
import { AIParameters } from '../types';

interface AIParametersProps {
  parameters: AIParameters;
  onParameterChange: (param: keyof AIParameters, value: number) => void;
}

const AIParametersComponent: React.FC<AIParametersProps> = ({ 
  parameters, 
  onParameterChange 
}) => {
  return (
    <div className="bg-gray-100 rounded-lg p-6 mb-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <SettingsIcon />
        <span className="ml-3">AI Parameters</span>
      </h3>
      <div className="grid md:grid-cols-3 gap-4">
        {Object.entries(parameters).map(([key, value]) => (
          <div key={key}>
            <label className="block text-gray-700 mb-2 capitalize">
              {key.replace(/([A-Z])/g, ' $1')}
            </label>
            <div className="flex items-center">
              <input 
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={value}
                onChange={(e) => onParameterChange(key as keyof AIParameters, parseFloat(e.target.value))}
                className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="ml-3 text-gray-600">{value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AIParametersComponent;