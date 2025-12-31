import React, { useState } from 'react';
import { FileText, Download, Trash2, Archive, CheckCircle } from 'lucide-react';
import DropZone from './components/DropZone';
import SplitConfig from './components/SplitConfig';
import AnalysisPanel from './components/AnalysisPanel';
import { parseCSV, splitCSV, downloadFile, downloadAllAsZip } from './services/csvService';
import { analyzeCSVData } from './services/geminiService';
import { CSVData, SplitFile } from './types';

const App: React.FC = () => {
  const [csvData, setCsvData] = useState<CSVData | null>(null);
  const [splitFiles, setSplitFiles] = useState<SplitFile[]>([]);
  const [rowsPerFile, setRowsPerFile] = useState<number>(100);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFileAccepted = async (file: File) => {
    setIsProcessing(true);
    setSplitFiles([]); // Reset previous splits
    setAiSummary(null);
    try {
      const data = await parseCSV(file);
      setCsvData(data);
    } catch (error) {
      alert("Error parsing CSV: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSplit = () => {
    if (!csvData) return;
    setIsProcessing(true);
    
    // Use setTimeout to allow UI to update (show loading state) before heavy calculation
    setTimeout(() => {
      try {
        const result = splitCSV(csvData, rowsPerFile);
        setSplitFiles(result);
      } catch (error) {
        console.error(error);
        alert("Failed to split CSV");
      } finally {
        setIsProcessing(false);
      }
    }, 100);
  };

  const handleAnalyze = async () => {
    if (!csvData) return;
    setIsAnalyzing(true);
    try {
      const summary = await analyzeCSVData(csvData.header, csvData.rows.slice(0, 5));
      setAiSummary(summary);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setCsvData(null);
    setSplitFiles([]);
    setAiSummary(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 text-white p-1.5 rounded-lg">
               <FileText className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              CSV Splitter Pro
            </h1>
          </div>
          <div className="text-sm text-slate-500 hidden sm:block">
            Split large datasets securely in your browser
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        
        {/* Upload Section - Only show if no data loaded */}
        {!csvData && (
          <div className="max-w-2xl mx-auto mt-10 animate-fade-in-up">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Split CSV files with ease</h2>
              <p className="text-lg text-slate-600">
                Upload your CSV, define your split size, and download chunks instantly. 
                Headers are preserved in every file.
              </p>
            </div>
            <DropZone onFileAccepted={handleFileAccepted} />
          </div>
        )}

        {/* Workspace Section - Show when data is loaded */}
        {csvData && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
            
            {/* Left Column: Configuration & Info */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* File Info Card */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-green-100 p-3 rounded-full">
                    <FileText className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 truncate max-w-[200px] sm:max-w-xs" title={csvData.fileName}>
                      {csvData.fileName}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {csvData.rows.length.toLocaleString()} rows • {csvData.header.length} columns
                    </p>
                  </div>
                </div>
                <button 
                  onClick={reset}
                  className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"
                  title="Remove file"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              {/* AI Analysis */}
              <AnalysisPanel 
                summary={aiSummary}
                loading={isAnalyzing}
                onAnalyze={handleAnalyze}
                hasData={true}
              />

              {/* Split Configuration */}
              <SplitConfig 
                rowsPerFile={rowsPerFile}
                setRowsPerFile={setRowsPerFile}
                totalRows={csvData.rows.length}
                onSplit={handleSplit}
                isProcessing={isProcessing}
              />

              {/* Preview Table (First 5 rows) */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="font-semibold text-slate-700">Data Preview</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                      <tr>
                        {csvData.header.map((head, i) => (
                          <th key={i} className="px-6 py-3 font-medium whitespace-nowrap">
                            {head}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {csvData.rows.slice(0, 5).map((row, i) => (
                        <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50">
                          {row.map((cell, j) => (
                            <td key={j} className="px-6 py-3 whitespace-nowrap text-slate-600 max-w-xs truncate">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-6 py-3 bg-slate-50/50 border-t border-slate-100 text-xs text-slate-500 text-center">
                  Showing first 5 rows of {csvData.rows.length}
                </div>
              </div>

            </div>

            {/* Right Column: Results */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                {splitFiles.length > 0 ? (
                  <div className="bg-white rounded-xl shadow-lg border border-indigo-100 overflow-hidden flex flex-col max-h-[calc(100vh-8rem)]">
                    <div className="p-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-between shrink-0">
                      <div>
                        <h3 className="font-bold text-lg">Results</h3>
                        <p className="text-indigo-100 text-sm">{splitFiles.length} files created</p>
                      </div>
                      <CheckCircle className="w-6 h-6 text-indigo-200" />
                    </div>
                    
                    <div className="p-4 border-b border-slate-100 shrink-0 bg-slate-50">
                      <button
                        onClick={() => downloadAllAsZip(splitFiles, `${csvData.fileName.replace('.csv', '')}_split`)}
                        className="w-full flex items-center justify-center gap-2 bg-white border border-slate-200 hover:border-indigo-300 text-indigo-600 hover:bg-indigo-50 font-medium py-2.5 rounded-lg transition-all shadow-sm"
                      >
                        <Archive className="w-4 h-4" />
                        Download All as ZIP
                      </button>
                    </div>

                    <div className="overflow-y-auto p-2 space-y-2 grow">
                      {splitFiles.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group bg-white">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-700 truncate" title={file.name}>
                              {file.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {file.rowCount} rows • {(file.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                          <button
                            onClick={() => downloadFile(file)}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors"
                            title="Download file"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 text-center text-slate-400 border-dashed">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Split className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="text-sm font-medium text-slate-500">No output yet</p>
                    <p className="text-xs mt-1">Configure settings and click "Split CSV" to generate files.</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-auto py-8">
        <div className="max-w-5xl mx-auto px-6 text-center text-slate-400 text-sm">
          <p>© {new Date().getFullYear()} CSV Splitter Pro. Processed locally in your browser.</p>
        </div>
      </footer>
    </div>
  );
};

// Simple icon for empty state
const Split = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
    <line x1="12" x2="12" y1="3" y2="21"/>
    <line x1="3" x2="21" y1="12" y2="12"/>
  </svg>
);

export default App;