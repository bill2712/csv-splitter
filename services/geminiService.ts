import { GoogleGenAI } from "@google/genai";

export const analyzeCSVData = async (header: string[], sampleRows: string[][]): Promise<string> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API Key not found");
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // Construct a representation of the data
    const dataPreview = [header.join(","), ...sampleRows.map(r => r.join(","))].join("\n");

    const prompt = `
      You are a data analyst. I have a CSV file.
      Here are the headers and the first 5 rows of data:
      
      \`\`\`csv
      ${dataPreview}
      \`\`\`
      
      Please provide a concise summary (max 3 sentences) describing what this dataset likely represents. 
      Then, verify if the data looks consistent or if there are any obvious anomalies in this small sample.
      Keep it professional and helpful.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Could not generate summary.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Failed to analyze CSV data. Please ensure your API key is configured correctly.";
  }
};