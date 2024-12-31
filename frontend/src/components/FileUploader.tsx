// src/components/FileUploader.tsx
import React, { useRef, DragEvent, ChangeEvent } from 'react';
import { UploadIcon } from './Icons';

interface FileUploaderProps {
  onFileUpload: (file: File) => void;
  uploadedFile: File | null;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileUpload, uploadedFile }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onFileUpload(files[0]);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileUpload(files[0]);
    }
  };

  return (
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
        accept=".pdf,.jpg,.jpeg,.png"
      />
      <button 
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center justify-center mx-auto mb-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
      >
        <UploadIcon />
        <span className="ml-2">Upload Document</span>
      </button>
      <p className="text-gray-500">
        {uploadedFile 
          ? `Uploaded: ${uploadedFile.name}` 
          : 'Drag and drop your document here, or click to select'}
      </p>
    </div>
  );
};

export default FileUploader;