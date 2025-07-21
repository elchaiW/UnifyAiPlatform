import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";
import Anthropic from '@anthropic-ai/sdk';

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

/*
The newest Anthropic model is "claude-sonnet-4-20250514", not "claude-3-7-sonnet-20250219", "claude-3-5-sonnet-20241022" nor "claude-3-sonnet-20240229". 
If the user doesn't specify a model, always prefer using "claude-sonnet-4-20250514" as it is the latest model.
*/
const DEFAULT_MODEL_STR = "claude-sonnet-4-20250514";
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface ClassificationResult {
  category: 'legal' | 'marketing' | 'coding' | 'general';
  model: 'claude' | 'chatgpt' | 'gemini' | 'grok';
  confidence: number;
  reasoning: string;
  documentType?: string;
  keyTopics?: string[];
  complexity?: 'low' | 'medium' | 'high';
}

// Claude-powered deep document analysis and classification
async function claudeDeepAnalysis(content: string): Promise<ClassificationResult> {
  try {
    console.log('Using Claude for deep document analysis and classification');
    
    const message = await anthropic.messages.create({
      max_tokens: 2000,
      messages: [
        { 
          role: 'user', 
          content: `You are an expert AI document analyst. Read and understand the ENTIRE document content below, then classify it for AI model routing.

TASK: Analyze the complete document content to understand:
1. What type of document this is
2. What the main topics and themes are
3. What the document is trying to achieve
4. What kind of expertise would be most valuable

AI MODEL SPECIALIZATIONS:
- Claude: Legal documents, contracts, compliance, regulatory analysis, terms & conditions, privacy policies, employment agreements, legal advice, constitutional matters, legislative analysis
- ChatGPT: General knowledge, content creation, summaries, writing, research, academic work, creative writing, explanations, educational content, general Q&A
- Gemini: Marketing strategies, social media campaigns, business development, brand positioning, advertising, consumer insights, market research, competitive analysis, brand messaging
- Grok: Coding, programming, debugging, technical analysis, software development, code review, technical documentation, API documentation, system architecture

ANALYZE THE COMPLETE DOCUMENT CONTENT:
${content}

Based on your complete understanding of this document, respond with JSON containing:
- category: 'legal', 'marketing', 'coding', or 'general'  
- model: 'claude', 'chatgpt', 'gemini', or 'grok'
- confidence: number between 0.7-1.0 (higher confidence since you read the full document)
- reasoning: detailed explanation of what the document is about and why you chose this model
- documentType: specific type of document (e.g., "privacy policy", "marketing brief", "code documentation")
- keyTopics: array of 3-5 main topics/themes from the document
- complexity: 'low', 'medium', or 'high' based on document sophistication`
        }
      ],
      // "claude-sonnet-4-20250514"
      model: DEFAULT_MODEL_STR,
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '{}';
    
    // Extract JSON from Claude's response (it might include additional text)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const result = JSON.parse(jsonMatch ? jsonMatch[0] : '{}');
    
    return {
      category: result.category,
      model: result.model,
      confidence: Math.max(0.7, Math.min(1, result.confidence || 0.9)), // High confidence for full document analysis
      reasoning: result.reasoning || 'Deep document analysis completed',
      documentType: result.documentType,
      keyTopics: result.keyTopics || [],
      complexity: result.complexity || 'medium'
    };
  } catch (error) {
    console.error('Claude deep analysis failed, using AI fallback:', error);
    return aiPoweredFallback(content);
  }
}

// AI-powered fallback classification using Gemini when Claude is unavailable  
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
  // Primary: Use Claude for deep document understanding and classification
  try {
    return await claudeDeepAnalysis(content);
  } catch (error) {
    console.error('Claude deep analysis failed, trying GPT-4o fallback:', error);
  }

  // Secondary: Fall back to GPT-4o classification  
  try {
    console.log('Using GPT-4o for classification fallback');
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
    console.error('GPT-4o classification failed, using Gemini fallback:', error);
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
