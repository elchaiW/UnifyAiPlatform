// Gemini AI Service
import { GoogleGenerativeAI } from '@google/generative-ai';

const client = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

export async function processWithGemini(content: string): Promise<string> {
  if (!client) {
    throw new Error('Gemini API key not configured');
  }

  const model = client.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
  const response = await model.generateContent(content);
  
  const text = response.response.text();
  if (!text) {
    throw new Error('No response from Gemini');
  }

  return text;
}