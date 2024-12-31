// src/components/PromptInputs.tsx
import React from 'react';

interface PromptInputsProps {
  systemPrompt: string;
  userPrompt: string;
  onSystemPromptChange: (value: string) => void;
  onUserPromptChange: (value: string) => void;
}

const PromptInputs: React.FC<PromptInputsProps> = ({
  systemPrompt,
  userPrompt,
  onSystemPromptChange,
  onUserPromptChange
}) => {
  return (
    <div className="grid md:grid-cols-2 gap-4 mb-6">
      <div>
        <label className="block text-gray-700 mb-2">System Prompt (Optional)</label>
        <textarea 
          value={systemPrompt}
          onChange={(e) => onSystemPromptChange(e.target.value)}
          className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-300 resize-y"
          placeholder="Enter system context or instructions"
          rows={3}
        />
      </div>
      <div>
        <label className="block text-gray-700 mb-2">User Prompt</label>
        <textarea 
          value={userPrompt}
          onChange={(e) => onUserPromptChange(e.target.value)}
          className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-300 resize-y"
          placeholder="What information do you want to extract?"
          rows={3}
          required
        />
      </div>
    </div>
  );
};

export default PromptInputs;