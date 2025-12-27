
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { GoogleGenAI, Type } from "@google/genai";
import { TranscriptionSegment, Emotion } from "../types";

export const transcribeAudio = async (
  base64Audio: string,
  mimeType: string
): Promise<{ segments: TranscriptionSegment[]; summary: string }> => {
  
  // The API key is baked into process.env.API_KEY during 'npm run app:dist'
  const apiKey = process.env.API_KEY;

  if (!apiKey || apiKey === 'undefined' || apiKey === '') {
    throw new Error("API Key missing in build. Make sure .env has VITE_API_KEY and you ran a fresh build.");
  }

  // Initialize SDK
  const ai = new GoogleGenAI({ apiKey: apiKey.trim() });
  const modelId = "gemini-3-flash-preview";

  const cleanMimeType = mimeType.split(';')[0];

  const prompt = `
    Analyze this audio. 
    1. Transcribe everything with speaker labels (e.g. Speaker 1, Speaker 2).
    2. Use Urdu script for Urdu speech, English for English.
    3. Provide a summary in English.
    4. Detect emotion for each segment.
    Return strictly JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          { inlineData: { mimeType: cleanMimeType, data: base64Audio } },
          { text: prompt }
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            segments: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  speaker: { type: Type.STRING },
                  timestamp: { type: Type.STRING },
                  content: { type: Type.STRING },
                  language: { type: Type.STRING },
                  language_code: { type: Type.STRING },
                  translation: { type: Type.STRING },
                  emotion: { type: Type.STRING, enum: Object.values(Emotion) },
                },
                required: ["speaker", "timestamp", "content", "language", "language_code", "emotion"],
              },
            },
          },
          required: ["summary", "segments"],
        },
      },
    });

    if (!response.text) throw new Error("Empty response from Gemini.");
    return JSON.parse(response.text);

  } catch (error: any) {
    console.error("Detailed Gemini Error:", error);
    
    // If Google returns 400 or "API key not valid", it's 100% a key problem
    if (error.message?.includes('400') || error.message?.includes('API key not valid')) {
      throw new Error(`Google rejected the API key. Please:
      1. Go to https://aistudio.google.com/app/apikey
      2. Copy your key again.
      3. Paste it in .env as VITE_API_KEY=AIza... (NO QUOTES)
      4. Delete 'dist' folder and run 'npm run app:dist' again.`);
    }
    
    throw new Error(error.message || "AI Transcription failed.");
  }
};
