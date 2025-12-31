import React from 'react';
import { Sparkles, BrainCircuit } from 'lucide-react';

interface AnalysisPanelProps {
  summary: string | null;
  loading: boolean;
  onAnalyze: () => void;
  hasData: boolean;
}

const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ summary, loading, onAnalyze, hasData }) => {
  if (!hasData) return null;

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-indigo-900">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-semibold">AI Insights</h2>
        </div>
        {!summary && !loading && (
          <button
            onClick={onAnalyze}
            className="text-xs font-medium text-indigo-600 hover:text-indigo-800 bg-white px-3 py-1.5 rounded-full border border-indigo-200 shadow-sm hover:shadow transition-all"
          >
            Analyze Dataset
          </button>
        )}
      </div>

      {loading && (
        <div className="flex items-center gap-3 text-sm text-slate-600 animate-pulse">
            <BrainCircuit className="w-5 h-5" />
            <span>Analyzing structure and content with Gemini...</span>
        </div>
      )}

      {summary && (
        <div className="prose prose-sm prose-indigo max-w-none text-slate-700 bg-white/50 p-4 rounded-lg border border-indigo-100/50">
          <p>{summary}</p>
        </div>
      )}
      
      {!summary && !loading && (
        <p className="text-sm text-slate-500">
            Get a quick AI-powered summary of your CSV columns and data distribution before splitting.
        </p>
      )}
    </div>
  );
};

export default AnalysisPanel;