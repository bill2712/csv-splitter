import Papa from 'papaparse';
import JSZip from 'jszip';
import saveAs from 'file-saver';
import { CSVData, SplitFile } from '../types';

export const parseCSV = (file: File): Promise<CSVData> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      complete: (results) => {
        if (results.data && results.data.length > 0) {
          const allRows = results.data as string[][];
          // Filter out completely empty rows that PapaParse might capture at the end
          const cleanRows = allRows.filter(row => row.some(cell => cell !== '' && cell !== null && cell !== undefined));
          
          if (cleanRows.length === 0) {
            reject(new Error("CSV is empty"));
            return;
          }

          const header = cleanRows[0];
          const rows = cleanRows.slice(1);

          resolve({
            header,
            rows,
            fileName: file.name
          });
        } else {
          reject(new Error("Failed to parse CSV or file is empty"));
        }
      },
      error: (error) => {
        reject(error);
      },
      skipEmptyLines: true,
    });
  });
};

export const splitCSV = (csvData: CSVData, rowsPerFile: number): SplitFile[] => {
  const { header, rows, fileName } = csvData;
  const splitFiles: SplitFile[] = [];
  
  const totalChunks = Math.ceil(rows.length / rowsPerFile);
  const baseName = fileName.replace('.csv', '');

  for (let i = 0; i < totalChunks; i++) {
    const chunkRows = rows.slice(i * rowsPerFile, (i + 1) * rowsPerFile);
    const fileContentArray = [header, ...chunkRows];
    const csvContent = Papa.unparse(fileContentArray);
    
    // Create zero-padded index (e.g., _01, _02)
    const suffix = (i + 1).toString().padStart(totalChunks.toString().length, '0');
    const newFileName = `${baseName}_part_${suffix}.csv`;

    splitFiles.push({
      name: newFileName,
      content: csvContent,
      rowCount: chunkRows.length,
      size: new Blob([csvContent]).size
    });
  }

  return splitFiles;
};

export const downloadFile = (file: SplitFile) => {
  const blob = new Blob([file.content], { type: "text/csv;charset=utf-8;" });
  saveAs(blob, file.name);
};

export const downloadAllAsZip = async (files: SplitFile[], zipName: string) => {
  const zip = new JSZip();
  files.forEach(file => {
    zip.file(file.name, file.content);
  });
  
  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, zipName.endsWith('.zip') ? zipName : `${zipName}.zip`);
};