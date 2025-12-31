export interface SplitFile {
  name: string;
  content: string; // CSV string content
  rowCount: number;
  size: number;
}

export interface CSVData {
  header: string[];
  rows: string[][];
  fileName: string;
}

export interface AppState {
  file: File | null;
  csvData: CSVData | null;
  splitFiles: SplitFile[];
  isProcessing: boolean;
  rowsPerFile: number;
  aiSummary: string | null;
  isAnalyzing: boolean;
}