// Grok AI Service (using OpenAI-compatible endpoint)
import OpenAI from 'openai';

const client = process.env.XAI_API_KEY 
  ? new OpenAI({ 
      apiKey: process.env.XAI_API_KEY,
      baseURL: 'https://api.x.ai/v1'
    })
  : null;

export async function processWithGrok(content: string): Promise<string> {
  if (!client) {
    throw new Error('Grok API key not configured');
  }

  const response = await client.chat.completions.create({
    model: 'grok-2-1212',
    messages: [
      {
        role: 'user',
        content: content,
      },
    ],
    max_tokens: 4000,
  });

  const message = response.choices[0]?.message?.content;
  if (!message) {
    throw new Error('No response from Grok');
  }

  return message;
}