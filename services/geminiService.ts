
import { GoogleGenAI } from "@google/genai";

export const generateChassisImages = async (parts: string[]): Promise<Record<string, string>> => {
  const model = 'gemini-3-pro-image-preview';
  const images: Record<string, string> = {};

  const promises = parts.map(async (part) => {
    try {
      // Create a new instance right before making an API call to ensure it always uses the most up-to-date API key
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model,
        contents: {
          parts: [
            {
              text: `A cute, vibrant, cartoon-style 2D illustration of a car ${part}, isolated on a clean white background, thick outlines, sticker style, professional vector art look, high contrast, child-friendly, bright colors.`
            }
          ]
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1",
            imageSize: "1K"
          }
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
      
      if (!imageUrl) {
        throw new Error(`No image data returned for ${part}`);
      }
      
      return { name: part, url: imageUrl };
    } catch (error: any) {
      console.error(`Error generating image for ${part}:`, error);
      // Check if it's a key/entity error to signal re-authentication
      if (error.message?.includes("Requested entity was not found") || error.message?.includes("API key")) {
        throw error; // Let App.tsx handle the re-auth logic
      }
      return { name: part, url: `https://picsum.photos/seed/${part}/200/200` };
    }
  });

  const results = await Promise.all(promises);
  results.forEach(res => {
    images[res.name] = res.url;
  });

  return images;
};
