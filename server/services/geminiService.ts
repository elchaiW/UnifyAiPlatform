export async function processWithGemini(prompt: string): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  try {
    // Using direct HTTP API call for Gemini
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates[0]?.content?.parts[0]?.text || 'Sorry, I could not process your request.';
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to process request with Gemini');
  }
}

export async function createMarketingStrategy(content: string): Promise<string> {
  return processWithGemini(`Create a marketing strategy for: ${content}`);
}

export async function analyzeBusiness(content: string): Promise<string> {
  return processWithGemini(`Analyze this business scenario: ${content}`);
}