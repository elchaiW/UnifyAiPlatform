// Claude AI Service
import { Anthropic } from '@anthropic-ai/sdk';

const client = process.env.ANTHROPIC_API_KEY 
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

export async function processWithClaude(content: string): Promise<string> {
  if (!client) {
    throw new Error('Claude API key not configured');
  }

  const response = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 4000,
    messages: [
      {
        role: 'user',
        content: content,
      },
    ],
  });

  const textContent = response.content[0];
  if (textContent.type === 'text') {
    return textContent.text;
  }
  
  throw new Error('Unexpected response format from Claude');
}