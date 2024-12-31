// src/types/index.ts
export interface AIParameters {
    topP: number;
    temperature: number;
    maxTokens: number;
  }
  
  export interface DocumentExtractionProps {
    file: File | null;
    systemPrompt: string;
    userPrompt: string;
    parameters: AIParameters;
  }