import { GoogleGenAI } from "@google/genai";
import { CocktailRecipe } from "../types";

// Setup API Key for both AI Environment (process.env) and Local Vite (import.meta.env)
// Note: In local Vite, you must name your variable VITE_API_KEY in the .env file
const getApiKey = () => {
  // @ts-ignore - Handle Vite specific env
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_KEY) {
    // @ts-ignore
    return import.meta.env.VITE_API_KEY;
  }
  // Fallback for standard node/cloud env
  if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
    return process.env.API_KEY;
  }
  return "";
};

const apiKey = getApiKey();

// Initialize Gemini Client
// We allow empty key here to prevent crash on load, but requests will fail if key is missing
const ai = new GoogleGenAI({ apiKey: apiKey || "MISSING_KEY" });

const SYSTEM_INSTRUCTION = `
你是「春節心情小酒館」的 AI 調酒師。
你的任務是根據客人的心情，設計一款「特調飲品 (Mocktail/Creative Drink)」，並寫下一段溫暖的話。

【指令】
1. 請回傳純 JSON 格式。
2. 不要使用 Markdown 代碼區塊。
3. 飲品設計請充滿創意與美感。

JSON 格式範例：
{
  "name": "飲品名稱",
  "description": "50字以內的口感與外觀描述",
  "ingredients": ["材料1", "材料2"],
  "quote": "80字以內的暖心小語",
  "visualPrompt": "Photorealistic beverage photography, cinematic lighting, [描述飲品], 8k resolution"
}
`;

// Helper: Delay function
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper: Retry Logic Wrapper
async function retryOperation<T>(operation: () => Promise<T>, retries = 3, baseWait = 4000): Promise<T> {
  let lastError: any;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      const msg = error.message || '';
      const status = error.status || 0;
      
      // Check for Rate Limit (429) or Service Overload (503)
      const isQuotaError = msg.includes('429') || status === 429 || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED');
      const isServerOverload = msg.includes('503') || status === 503;

      if ((isQuotaError || isServerOverload) && attempt < retries - 1) {
        const waitTime = baseWait * Math.pow(2, attempt); 
        console.warn(`API Busy (Attempt ${attempt + 1}/${retries}). Retrying in ${waitTime}ms...`);
        await delay(waitTime);
        continue;
      }
      
      if (!isQuotaError && !isServerOverload) {
        throw error;
      }
    }
  }
  throw lastError;
}

export const generateCocktailRecipe = async (userMood: string): Promise<CocktailRecipe> => {
  if (!apiKey || apiKey === "MISSING_KEY") {
    throw new Error("API Key 未設定。請在 .env 檔案中設定 VITE_API_KEY。");
  }

  return retryOperation(async () => {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `客人的心情是：${userMood}`,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json", 
        }
      });

      const rawText = response.text;
      if (!rawText) throw new Error("API returned empty response.");

      // Aggressive JSON Cleanup
      let cleanText = rawText.replace(/```json/g, '').replace(/```/g, '');
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
          cleanText = jsonMatch[0];
      } else {
          console.error("Raw response:", rawText);
          throw new Error("無法解析酒單格式 (Invalid JSON)");
      }

      try {
        return JSON.parse(cleanText) as CocktailRecipe;
      } catch (e) {
        console.error("JSON Parse Error:", e);
        throw new Error("酒單解析失敗 (Parse Error)");
      }

    } catch (error: any) {
      console.error("Recipe generation failed:", error);
      throw new Error(error.message || "Unknown API Error");
    }
  }, 3, 4000); 
};

export const generateCocktailImage = async (visualPrompt: string): Promise<string> => {
  if (!apiKey || apiKey === "MISSING_KEY") return "FALLBACK_IMAGE";

  try {
    return await retryOperation(async () => {
      const safePrompt = `${visualPrompt}, non-alcoholic, artistic beverage photography, cozy atmosphere`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: { parts: [{ text: safePrompt }] },
        config: {
          imageConfig: { aspectRatio: "1:1" }
        }
      });

      let imageUrl = "";
      if (response.candidates?.[0]?.content?.parts) {
         for (const part of response.candidates[0].content.parts) {
           if (part.inlineData) {
             imageUrl = `data:image/png;base64,${part.inlineData.data}`;
             break;
           }
         }
      }
      
      if (!imageUrl) throw new Error("No image data returned");
      return imageUrl;
    }, 2, 5000);

  } catch (error) {
    console.warn("Image gen failed after retries:", error);
    return "FALLBACK_IMAGE";
  }
};