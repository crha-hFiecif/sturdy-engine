import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import axios from 'axios';
import ReactJson from 'react-json-view';


// (Keeping all previous SVG icon components from previous implementation)
const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const FileIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0013.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);

const DocumentIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

// Main application component
const DocumentExtractionApp: React.FC = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [systemPrompt, setSystemPrompt] = useState<string>('');
  const [userPrompt, setUserPrompt] = useState<string>('');
  const [extractedData, setExtractedData] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<'haiku' | 'sonnet'>('haiku');
  const [parameters, setParameters] = useState({
    topP: 0.7,
    temperature: 0.5,
    maxTokens: 1000
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
    setUploadedImageUrl(URL.createObjectURL(file));
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };


  const processDocument = async () => {
    if (!uploadedFile || !userPrompt) {
      alert("Please provide both a document and a user prompt.");
      return;
    }
  
    const formData = new FormData();
    formData.append("image", uploadedFile);
    formData.append("user_prompt", userPrompt);
    formData.append("model_name", selectedModel === "haiku" ? "Claude 3 Haiku" : "Claude 3.5 Sonnet");
    formData.append("max_tokens", parameters.maxTokens.toString());
    formData.append("temperature", parameters.temperature.toString());
    formData.append("top_p", parameters.topP.toString());
  
    try {
      console.log("Sending request to backend...");
      const response = await axios.post("http://127.0.0.1:8000/api/extract", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      console.log("Backend response received:", response);
  
      if (response.status === 200 && response.data.extracted_data) {
        setExtractedData(JSON.stringify(response.data.extracted_data, null, 2));
      } else {
        console.error("Unexpected response format:", response.data);
        setExtractedData("Error: Unexpected response format.");
      }
    } catch (error: any) {
      console.error("Error while processing request:", error);
  
      if (error.response) {
        console.error("Error Response Data:", error.response.data);
        setExtractedData(`Error: ${error.response.data.detail || "Unknown error from server."}`);
      } else {
        console.error("No response received:", error.message);
        setExtractedData("Error: No response from the server.");
      }
    }
  };

  const handleParameterChange = (param: keyof typeof parameters, value: number) => {
    setParameters(prev => ({
      ...prev,
      [param]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-8">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
          <FileIcon />
          <span className="ml-3">AI Image Query</span>
        </h1>

        {/* Model Selection and AI Parameters in a Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Model Selection */}
          <div className="bg-gray-100 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              <span className="ml-3">Select AI Model</span>
            </h3>
            <select 
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value as 'haiku' | 'sonnet')}
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-300"
            >
              <option value="haiku">Claude Haiku</option>
              <option value="sonnet">Claude Sonnet</option>
            </select>
            <p className="text-sm text-gray-600 mt-2">
              Choose the AI model for document extraction. Haiku is faster, while Sonnet offers more advanced capabilities.
            </p>
          </div>

          {/* AI Parameters */}
          <div className="bg-gray-100 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <SettingsIcon />
              <span className="ml-3">AI Parameters</span>
            </h3>
            {Object.entries(parameters).map(([key, value]) => (
              <div key={key} className="mb-4">
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
                    onChange={(e) => handleParameterChange(key as keyof typeof parameters, parseFloat(e.target.value))}
                    className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="ml-3 text-gray-600">{value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rest of the component remains the same as in previous implementation */}
        {/* File Upload Section */}
        <div 
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center mb-6 transition-all hover:border-blue-500 group"
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileInputChange}
            className="hidden"
            accept=".jpg,.jpeg,.png"
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center mx-auto mb-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            <UploadIcon />
            <span className="ml-2">Upload Image</span>
          </button>
          {uploadedImageUrl ? (
          <div className="mt-4">
            <p className="text-gray-500 mb-2"> Uploaded Image:</p>
            <img
              src={uploadedImageUrl}
              alt='Uploaded Preview'
              className='max-auto max-w-full h-auto rounded-md shadow-md'
            />
          </div>
          ) : (
            <p className="text-gray-500"> 
              Drag and drop your image here, or click to select
            </p>
          )}
        </div>

        {/* Prompt Inputs */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-gray-700 mb-2">System Prompt (Optional)</label>
            <textarea 
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-300 resize-y"
              placeholder="Enter system context or instructions"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">User Prompt</label>
            <textarea 
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-300 resize-y"
              placeholder="What information do you want to extract?"
              rows={3}
              required
            />
          </div>
        </div>

        {/* Process Button */}
        <button 
          onClick={processDocument}
          disabled={!uploadedFile || !userPrompt}
          className="w-full bg-teal-500 text-white p-3 rounded-md hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <DocumentIcon />
          <span className="ml-2">Query Information</span>
        </button>

        {/* Results Section */}
        {extractedData && (
          <div className="mt-6 bg-gray-100 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="ml-3">Response  Information</span>
            </h3>
            {/* <pre className="bg-white p-4 rounded-md overflow-x-auto text-sm">
              {extractedData}
            </pre> */}
            <ReactJson
             src={JSON.parse(extractedData)}
             theme="monokai"
             collapsed={false}
             enableClipboard={false}
             displayDataTypes={false}
             />
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentExtractionApp;