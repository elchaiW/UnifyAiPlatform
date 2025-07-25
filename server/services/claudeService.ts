import Anthropic from '@anthropic-ai/sdk';
import { cleanMarkdownFormatting } from '../utils/textFormatter';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function processWithClaude(prompt: string): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1500, // Maximum tokens for complete responses
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const response = message.content[0].type === 'text' 
      ? message.content[0].text 
      : 'Sorry, I could not process your request.';
    return cleanMarkdownFormatting(response);
  } catch (error) {
    console.error('Claude API error:', error);
    throw new Error('Failed to process request with Claude');
  }
}

export async function analyzeDocument(content: string): Promise<string> {
  return processWithClaude(`Please analyze this document and provide key insights: ${content}`);
}