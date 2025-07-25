import { GoogleGenerativeAI } from '@google/genai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function processWithGemini(prompt: string): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    return response.text() || 'Sorry, I could not process your request.';
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to process request with Gemini');
  }
}

export async function createMarketingStrategy(content: string): Promise<string> {
  return processWithGemini(`Create a marketing strategy for: ${content}`);
}

export async function analyzeBusiness(content: string): Promise<string> {
  return processWithGemini(`Analyze this business scenario: ${content}`);
}