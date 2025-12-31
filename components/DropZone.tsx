import React, { useCallback } from 'react';
import { Upload, FileType } from 'lucide-react';

interface DropZoneProps {
  onFileAccepted: (file: File) => void;
}

const DropZone: React.FC<DropZoneProps> = ({ onFileAccepted }) => {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files && files.length > 0 && files[0].type === "text/csv") {
      onFileAccepted(files[0]);
    } else if (files && files.length > 0 && files[0].name.endsWith('.csv')) {
       // Fallback check for extension if type is missing/incorrect
       onFileAccepted(files[0]);
    } else {
      alert("Please upload a valid CSV file.");
    }
  }, [onFileAccepted]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileAccepted(e.target.files[0]);
    }
  };

  return (
    <div 
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="w-full border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/50 hover:bg-indigo-50 rounded-2xl p-12 transition-all duration-200 ease-in-out cursor-pointer group flex flex-col items-center justify-center text-center"
      onClick={() => document.getElementById('file-upload')?.click()}
    >
      <input 
        id="file-upload"
        type="file" 
        accept=".csv"
        className="hidden"
        onChange={handleFileInput}
      />
      
      <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
        <Upload className="w-8 h-8 text-indigo-500" />
      </div>
      
      <h3 className="text-xl font-semibold text-slate-800 mb-2">
        Upload your CSV file
      </h3>
      <p className="text-slate-500 max-w-sm mx-auto">
        Drag and drop your file here, or click to browse.
      </p>
      <div className="mt-4 flex items-center gap-2 text-sm text-indigo-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
        <FileType className="w-4 h-4" />
        <span>Supports .csv files</span>
      </div>
    </div>
  );
};

export default DropZone;