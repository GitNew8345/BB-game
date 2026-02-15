
import { GoogleGenAI } from "@google/genai";

export const generateChassisImages = async (parts: string[]): Promise<Record<string, string>> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  const model = 'gemini-2.5-flash-image';
  const images: Record<string, string> = {};

  const promises = parts.map(async (part) => {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: {
          parts: [
            {
              text: `A cute, vibrant, cartoon-style 2D illustration of a car ${part}, isolated on a clean white background, thick outlines, sticker style, professional vector art look, high contrast, child-friendly.`
            }
          ]
        }
      });

      let imageUrl = '';
      const candidate = response.candidates?.[0];
      if (candidate && candidate.content && candidate.content.parts) {
        for (const partRes of candidate.content.parts) {
          if (partRes.inlineData) {
            imageUrl = `data:image/png;base64,${partRes.inlineData.data}`;
            break;
          }
        }
      }
      
      return { name: part, url: imageUrl || `https://picsum.photos/seed/${part}/200/200` };
    } catch (error) {
      console.error(`Error generating image for ${part}:`, error);
      return { name: part, url: `https://picsum.photos/seed/${part}/200/200` };
    }
  });

  const results = await Promise.all(promises);
  results.forEach(res => {
    images[res.name] = res.url;
  });

  return images;
};
