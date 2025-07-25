// Simple AI classifier for routing requests to appropriate models
export async function classifyRequest(content: string) {
  // Simple keyword-based classification for now
  const contentLower = content.toLowerCase();
  
  // Legal content indicators
  if (contentLower.includes('legal') || contentLower.includes('contract') || 
      contentLower.includes('terms') || contentLower.includes('compliance') ||
      contentLower.includes('regulation') || contentLower.includes('law')) {
    return {
      model: 'claude',
      category: 'legal',
      confidence: 0.8,
      reasoning: 'Legal content detected - routing to Claude for legal expertise'
    };
  }
  
  // Marketing content indicators
  if (contentLower.includes('marketing') || contentLower.includes('campaign') ||
      contentLower.includes('brand') || contentLower.includes('social media') ||
      contentLower.includes('advertisement') || contentLower.includes('promotion')) {
    return {
      model: 'gemini',
      category: 'marketing',
      confidence: 0.8,
      reasoning: 'Marketing content detected - routing to Gemini for creative strategies'
    };
  }
  
  // Technical/coding content indicators
  if (contentLower.includes('code') || contentLower.includes('programming') ||
      contentLower.includes('debug') || contentLower.includes('technical') ||
      contentLower.includes('javascript') || contentLower.includes('python') ||
      contentLower.includes('api') || contentLower.includes('database')) {
    return {
      model: 'grok',
      category: 'coding',
      confidence: 0.8,
      reasoning: 'Technical content detected - routing to Grok for coding expertise'
    };
  }
  
  // Default to ChatGPT for general queries
  return {
    model: 'chatgpt',
    category: 'general',
    confidence: 0.6,
    reasoning: 'General content - routing to ChatGPT for comprehensive response'
  };
}