import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function processWithChatGPT(prompt: string): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Use faster mini model for better performance
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 1500, // Maximum tokens for complete responses
      temperature: 0.5, // Lower temperature for faster processing
    });

    return completion.choices[0]?.message?.content || 'Sorry, I could not process your request.';
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to process request with ChatGPT');
  }
}

export async function summarizeContent(content: string): Promise<string> {
  return processWithChatGPT(`Please summarize this content: ${content}`);
}