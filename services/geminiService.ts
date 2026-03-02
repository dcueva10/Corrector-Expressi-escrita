
import { GoogleGenAI, Type } from "@google/genai";
import { Cycle } from "../types";
import { RUBRICS_SYSTEM_PROMPT } from "../constants";

export interface FileData {
  base64: string;
  mimeType: string;
}

export const evaluateText = async (text: string, cycle: Cycle, file?: FileData) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const parts: any[] = [];
  
  if (text.trim()) {
    parts.push({ text: `Text de l'alumne: "${text}"` });
  }

  if (file) {
    parts.push({
      inlineData: {
        data: file.base64.split(',')[1] || file.base64,
        mimeType: file.mimeType
      }
    });
  }

  const prompt = `Avalua el treball adjunt (text o imatge/pdf) per a un alumne de ${cycle} segons la rúbrica corresponent. Si hi ha una imatge, realitza l'OCR primer. Calcula obligatòriament la nota total sobre 10. RESPOSTA SEMPRE EN CATALÀ.`;
  parts.push({ text: prompt });

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ parts }],
    config: {
      systemInstruction: RUBRICS_SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          notaTotal: { type: Type.NUMBER },
          puntuacionPorCategorias: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING },
                level: { type: Type.STRING },
                justification: { type: Type.STRING }
              },
              required: ["category", "level", "justification"]
            }
          },
          puntosFuertes: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          propuestasMejora: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          textoCorregido: { type: Type.STRING }
        },
        required: ["notaTotal", "puntuacionPorCategorias", "puntosFuertes", "propuestasMejora", "textoCorregido"]
      }
    },
  });

  return JSON.parse(response.text);
};
