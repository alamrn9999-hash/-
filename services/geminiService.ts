
import { GoogleGenAI, Type } from "@google/genai";
import { StructuredDocument } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const SYSTEM_INSTRUCTION = `
أنت خبير أكاديمي سعودي متخصص في تنسيق البحوث.
مهمتك: توزيع الحواشي بدقة متناهية داخل النص.

قواعد صارمة:
1. ضع الواسمة [[FN:id]] مباشرة بعد الكلمة أو علامة الترقيم التي تتعلق بها الحاشية.
2. لا تقم أبداً بتجميع الحواشي في نهاية الفقرة إذا كانت تتعلق بكلمات مختلفة داخلها.
3. إذا وجدت أرقاماً يدوية للحواشي في النص الأصلي (مثل 1 أو (1) أو [1])، فقم باستبدالها بالواسمة [[FN:id]] واحذف الرقم الأصلي تماماً.
4. حافظ على الأسلوب الأكاديمي: المباحث والمطالب يجب أن تأخذ النوع 'heading1' و 'heading2'.
5. لا تعدل أي كلمة في النص، التزم بالأمانة العلمية.
`;

export const analyzeText = async (rawText: string): Promise<StructuredDocument> => {
  const model = 'gemini-3-pro-preview';
  
  const response = await ai.models.generateContent({
    model,
    contents: [{ parts: [{ text: rawText }] }],
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          elements: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING, enum: ['title', 'heading1', 'heading2', 'paragraph'] },
                text: { type: Type.STRING }
              },
              required: ['type', 'text']
            }
          },
          footnotes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                text: { type: Type.STRING }
              },
              required: ['id', 'text']
            }
          }
        },
        required: ['title', 'elements', 'footnotes']
      }
    }
  });

  try {
    return JSON.parse(response.text || '{}') as StructuredDocument;
  } catch (error) {
    throw new Error("فشل تحليل النص. يرجى التأكد من وضوح علامات الحواشي.");
  }
};
