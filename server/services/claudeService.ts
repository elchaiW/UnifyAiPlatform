import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function processWithClaude(prompt: string): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    return message.content[0].type === 'text' 
      ? message.content[0].text 
      : 'Sorry, I could not process your request.';
  } catch (error) {
    console.error('Claude API error:', error);
    throw new Error('Failed to process request with Claude');
  }
}

export async function analyzeDocument(content: string): Promise<string> {
  return processWithClaude(`Please analyze this document and provide key insights: ${content}`);
}