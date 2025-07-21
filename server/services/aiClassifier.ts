import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface ClassificationResult {
  category: 'legal' | 'marketing' | 'coding' | 'general';
  model: 'claude' | 'chatgpt' | 'gemini' | 'grok';
  confidence: number;
  reasoning: string;
}

export async function classifyRequest(content: string): Promise<ClassificationResult> {
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
    // Fallback to ChatGPT for general queries
    return {
      category: 'general',
      model: 'chatgpt',
      confidence: 0.5,
      reasoning: 'Classification failed, defaulting to general category'
    };
  }
}
