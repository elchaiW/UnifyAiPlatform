// AI Classification Service for determining the best AI model for requests
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ClassificationResult {
  selectedModel: 'claude' | 'chatgpt' | 'gemini' | 'grok';
  confidence: number;
  reasoning: string;
  fallbackUsed?: string;
}

export class AIClassifier {
  private openai: OpenAI | null = null;
  private gemini: GoogleGenerativeAI | null = null;

  constructor() {
    // Initialize OpenAI if available
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }

    // Initialize Gemini if available
    if (process.env.GEMINI_API_KEY) {
      this.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }
  }

  async classifyRequest(prompt: string, fileContent?: string): Promise<ClassificationResult> {
    const content = fileContent ? `${prompt}\n\nFile content: ${fileContent}` : prompt;

    // Use fast keyword classification for better performance
    return this.classifyWithKeywords(content);
  }

  private async classifyWithGPT4o(content: string): Promise<ClassificationResult | null> {
    if (!this.openai) return null;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are an AI model selector. Based on the content, select the best AI model:
          
- Claude: Legal documents, compliance, regulatory analysis, policy interpretation
- ChatGPT: General knowledge, content creation, summaries, Q&A, writing assistance  
- Gemini: Marketing strategies, social media, business development, creative content
- Grok: Coding, debugging, technical analysis, programming tasks

Respond with JSON: {"model": "claude|chatgpt|gemini|grok", "confidence": 0.0-1.0, "reasoning": "brief explanation"}`
        },
        {
          role: 'user',
          content
        }
      ],
      temperature: 0.1,
    });

    const result = response.choices[0]?.message?.content;
    if (!result) return null;

    try {
      const parsed = JSON.parse(result);
      return {
        selectedModel: parsed.model,
        confidence: parsed.confidence * 100,
        reasoning: parsed.reasoning,
      };
    } catch {
      return null;
    }
  }

  private async classifyWithGemini(content: string): Promise<ClassificationResult | null> {
    if (!this.gemini) return null;

    const model = this.gemini.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    
    const prompt = `Based on this content, select the best AI model and respond with JSON:
    
- Claude: Legal documents, compliance, regulatory analysis
- ChatGPT: General knowledge, content creation, summaries  
- Gemini: Marketing strategies, social media, business development
- Grok: Coding, debugging, technical analysis

Content: ${content}

Respond with: {"model": "claude|chatgpt|gemini|grok", "confidence": 0.0-1.0, "reasoning": "brief explanation"}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    try {
      const parsed = JSON.parse(text);
      return {
        selectedModel: parsed.model,
        confidence: parsed.confidence * 100,
        reasoning: parsed.reasoning,
      };
    } catch {
      return null;
    }
  }

  private classifyWithKeywords(content: string): ClassificationResult {
    const lowerContent = content.toLowerCase();

    // Legal/compliance keywords
    if (this.containsKeywords(lowerContent, ['legal', 'law', 'compliance', 'regulation', 'contract', 'policy', 'gdpr', 'privacy'])) {
      return {
        selectedModel: 'claude',
        confidence: 75,
        reasoning: 'Keywords suggest legal/compliance content',
        fallbackUsed: 'keyword-detection',
      };
    }

    // Marketing keywords
    if (this.containsKeywords(lowerContent, ['marketing', 'social media', 'campaign', 'brand', 'seo', 'advertising', 'strategy'])) {
      return {
        selectedModel: 'gemini',
        confidence: 70,
        reasoning: 'Keywords suggest marketing content',
        fallbackUsed: 'keyword-detection',
      };
    }

    // Technical/coding keywords
    if (this.containsKeywords(lowerContent, ['code', 'debug', 'programming', 'javascript', 'python', 'api', 'function', 'algorithm'])) {
      return {
        selectedModel: 'grok',
        confidence: 70,
        reasoning: 'Keywords suggest technical/coding content',
        fallbackUsed: 'keyword-detection',
      };
    }

    // Default to ChatGPT for general content
    return {
      selectedModel: 'chatgpt',
      confidence: 60,
      reasoning: 'General content, suitable for ChatGPT',
      fallbackUsed: 'keyword-detection',
    };
  }

  private containsKeywords(content: string, keywords: string[]): boolean {
    return keywords.some(keyword => content.includes(keyword));
  }
}