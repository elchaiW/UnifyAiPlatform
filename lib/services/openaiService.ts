// OpenAI Service
import OpenAI from 'openai';

const client = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export async function processWithChatGPT(content: string): Promise<string> {
  if (!client) {
    throw new Error('OpenAI API key not configured');
  }

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: content,
      },
    ],
    max_tokens: 1500, // Reduced for faster responses
    temperature: 0.7,
  });

  const message = response.choices[0]?.message?.content;
  if (!message) {
    throw new Error('No response from ChatGPT');
  }

  return message;
}