import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface ClassificationResult {
  category: 'legal' | 'marketing' | 'coding' | 'general';
  model: 'claude' | 'chatgpt' | 'gemini' | 'grok';
  confidence: number;
  reasoning: string;
}

// AI-powered fallback classification using Gemini when OpenAI is unavailable
async function aiPoweredFallback(content: string): Promise<ClassificationResult> {
  try {
    console.log('Using Gemini AI for classification fallback');
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: `You are an expert AI classifier that reads and understands document content to route requests to the most appropriate AI model.

ANALYZE the content carefully to determine the best AI model specialization:

AI MODEL SPECIALIZATIONS:
- Claude: Legal documents, contracts, compliance, regulatory analysis, terms & conditions, privacy policies, employment agreements, legal advice
- ChatGPT: General knowledge, content creation, summaries, writing, research, academic work, creative writing, explanations  
- Gemini: Marketing strategies, social media campaigns, business development, brand positioning, advertising, consumer insights, market research
- Grok: Coding, programming, debugging, technical analysis, software development, code review, technical documentation

Respond with JSON containing:
- category: 'legal', 'marketing', 'coding', or 'general'
- model: 'claude', 'chatgpt', 'gemini', or 'grok'
- confidence: number between 0-1 
- reasoning: detailed explanation of classification`,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            category: { type: "string" },
            model: { type: "string" },
            confidence: { type: "number" },
            reasoning: { type: "string" }
          },
          required: ["category", "model", "confidence", "reasoning"]
        }
      },
      contents: `Please classify this request:\n\n${content}`
    });

    const result = JSON.parse(response.text || '{}');
    return {
      category: result.category,
      model: result.model,
      confidence: Math.max(0, Math.min(1, result.confidence)),
      reasoning: result.reasoning
    };
  } catch (error) {
    console.error('Gemini classification failed, using keyword fallback:', error);
    return keywordFallbackClassification(content);
  }
}

// Simple keyword-based classification as final fallback
function keywordFallbackClassification(content: string): ClassificationResult {
  const lowerContent = content.toLowerCase();
  
  // Marketing keywords
  const marketingKeywords = ['marketing', 'brand', 'campaign', 'social media', 'strategy', 'gen z', 'consumer', 'fashion', 'influencer', 'positioning', 'launch', 'sustainable'];
  
  // Legal keywords
  const legalKeywords = ['contract', 'legal', 'compliance', 'regulatory', 'terms', 'agreement', 'policy', 'law', 'regulation'];
  
  // Coding keywords
  const codingKeywords = ['code', 'debug', 'function', 'javascript', 'python', 'programming', 'syntax', 'error', 'development'];
  
  const marketingScore = marketingKeywords.filter(keyword => lowerContent.includes(keyword)).length;
  const legalScore = legalKeywords.filter(keyword => lowerContent.includes(keyword)).length;
  const codingScore = codingKeywords.filter(keyword => lowerContent.includes(keyword)).length;
  
  if (marketingScore > 0 && marketingScore >= legalScore && marketingScore >= codingScore) {
    return {
      category: 'marketing',
      model: 'gemini',
      confidence: Math.min(0.9, 0.5 + (marketingScore * 0.1)),
      reasoning: `Detected marketing content with ${marketingScore} marketing-related keywords`
    };
  }
  
  if (legalScore > 0 && legalScore >= codingScore) {
    return {
      category: 'legal',
      model: 'claude',
      confidence: Math.min(0.9, 0.5 + (legalScore * 0.1)),
      reasoning: `Detected legal content with ${legalScore} legal-related keywords`
    };
  }
  
  if (codingScore > 0) {
    return {
      category: 'coding',
      model: 'grok',
      confidence: Math.min(0.9, 0.5 + (codingScore * 0.1)),
      reasoning: `Detected coding content with ${codingScore} programming-related keywords`
    };
  }
  
  return {
    category: 'general',
    model: 'chatgpt',
    confidence: 0.5,
    reasoning: 'No specific category detected, using general classification'
  };
}

export async function classifyRequest(content: string): Promise<ClassificationResult> {
  // Try AI-powered classification first, fall back to keywords if needed
  try {
    console.log('Using AI-powered classification with GPT-4o');
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert AI classifier that reads and understands document content to route requests to the most appropriate AI model. 

CAREFULLY ANALYZE the content, context, and intent to determine the best specialization:

AI MODEL SPECIALIZATIONS:
- Claude: Legal documents, contracts, compliance, regulatory analysis, terms & conditions, privacy policies, employment agreements, legal advice
- ChatGPT: General knowledge, content creation, summaries, writing, research, academic work, creative writing, explanations
- Gemini: Marketing strategies, social media campaigns, business development, brand positioning, advertising, consumer insights, market research
- Grok: Coding, programming, debugging, technical analysis, software development, code review, technical documentation

READ THE ENTIRE CONTENT and respond with JSON containing:
- category: 'legal', 'marketing', 'coding', or 'general'
- model: 'claude', 'chatgpt', 'gemini', or 'grok'
- confidence: number between 0-1 (based on how clearly the content fits the category)
- reasoning: detailed explanation of why you chose this classification

EXAMPLES:
"Review this employment contract for compliance issues" → legal/claude (0.95 confidence)
"Create a social media strategy for Gen Z targeting" → marketing/gemini (0.90 confidence)
"Debug this Python function with syntax errors" → coding/grok (0.95 confidence)
"Summarize the key points of this research paper" → general/chatgpt (0.85 confidence)

Focus on the MAIN PURPOSE and INTENT of the request, not just keywords.`
        },
        {
          role: "user",
          content: `Please classify this request:\n\n${content}`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    const result = JSON.parse(response.choices[0].message.content!);
    
    return {
      category: result.category,
      model: result.model,
      confidence: Math.max(0, Math.min(1, result.confidence)),
      reasoning: result.reasoning
    };
  } catch (error) {
    console.error('AI classification failed, using AI-powered fallback:', error);
    return await aiPoweredFallback(content);
  }
  
  /* Legacy keyword-only classification (now used as fallback)
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an AI classifier that routes requests to the most appropriate AI model based on content analysis. 

SPECIALIZATIONS:
- Claude: Legal documents, compliance, regulatory analysis, contracts
- ChatGPT: General knowledge, content creation, summaries, writing
- Gemini: Marketing strategies, social media, business development, campaigns
- Grok: Coding, debugging, technical analysis, programming tasks

Analyze the input and respond with JSON containing:
- category: 'legal', 'marketing', 'coding', or 'general'
- model: 'claude', 'chatgpt', 'gemini', or 'grok'
- confidence: number between 0-1
- reasoning: brief explanation of classification

EXAMPLES:
"Review this contract" → legal/claude
"Create a marketing plan" → marketing/gemini
"Debug this Python code" → coding/grok
"Summarize this article" → general/chatgpt`
        },
        {
          role: "user",
          content: content
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    const result = JSON.parse(response.choices[0].message.content!);
    
    return {
      category: result.category,
      model: result.model,
      confidence: Math.max(0, Math.min(1, result.confidence)),
      reasoning: result.reasoning
    };
  } catch (error) {
    console.error('Classification error:', error);
    return fallbackClassification(content);
  }
  */
}
