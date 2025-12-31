import React from 'react';
import { Settings, Split, RefreshCw } from 'lucide-react';

interface SplitConfigProps {
  rowsPerFile: number;
  setRowsPerFile: (val: number) => void;
  totalRows: number;
  onSplit: () => void;
  isProcessing: boolean;
}

const SplitConfig: React.FC<SplitConfigProps> = ({ 
  rowsPerFile, 
  setRowsPerFile, 
  totalRows,
  onSplit,
  isProcessing
}) => {
  const estimatedFiles = Math.ceil(totalRows / (rowsPerFile || 1));

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-8">
      <div className="flex items-center gap-2 mb-6 text-slate-800">
        <Settings className="w-5 h-5 text-indigo-500" />
        <h2 className="text-lg font-semibold">Configuration</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
        <div>
          <label htmlFor="rows" className="block text-sm font-medium text-slate-600 mb-2">
            Rows per file
          </label>
          <div className="relative">
            <input
              id="rows"
              type="number"
              min="1"
              value={rowsPerFile}
              onChange={(e) => setRowsPerFile(Math.max(1, parseInt(e.target.value) || 100))}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
              rows
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Total records: <span className="font-medium text-slate-700">{totalRows.toLocaleString()}</span>
          </p>
        </div>

        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex flex-col justify-center">
            <span className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-1">Estimated Output</span>
            <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-800">{estimatedFiles}</span>
                <span className="text-sm text-slate-600">files</span>
            </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
        <button
          onClick={onSplit}
          disabled={isProcessing}
          className={`
            flex items-center gap-2 px-6 py-2.5 rounded-lg text-white font-medium shadow-md hover:shadow-lg transform active:scale-95 transition-all
            ${isProcessing ? 'bg-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}
          `}
        >
          {isProcessing ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Split className="w-5 h-5" />
              Split CSV
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default SplitConfig;