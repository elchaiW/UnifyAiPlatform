import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface ClassificationResult {
  category: 'legal' | 'marketing' | 'coding' | 'general';
  model: 'claude' | 'chatgpt' | 'gemini' | 'grok';
  confidence: number;
  reasoning: string;
}

// Fallback classification based on keywords when OpenAI quota is exceeded
function fallbackClassification(content: string): ClassificationResult {
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
  // Use fallback classification for now to test all AI models while OpenAI quota is exceeded
  console.log('Using fallback classification due to OpenAI quota limits');
  return fallbackClassification(content);
  
  /* Original OpenAI classification (disabled due to quota limits)
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
