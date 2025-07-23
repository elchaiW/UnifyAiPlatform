import { GoogleGenAI } from "@google/genai";
import { formatPlainTextResponse } from "../utils/textFormatter.js";

// DON'T DELETE THIS COMMENT
// Follow these instructions when using this blueprint:
// - Note that the newest Gemini model series is "gemini-2.5-flash" or gemini-2.5-pro"
//   - do not change this unless explicitly requested by the user

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function processWithGemini(content: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: `As a marketing and business strategy specialist, please analyze and respond to the following request with focus on:
1. Marketing strategies and tactics
2. Business development opportunities
3. Social media recommendations
4. Campaign ideas and execution plans
5. Target audience insights

Request: ${content}

Please provide detailed, actionable recommendations in plain text format without markdown formatting, asterisks, or special symbols. Use clear, readable text with proper paragraphs.`,
    });

    const responseContent = response.text || "Error processing response";
    return formatPlainTextResponse(responseContent);
  } catch (error) {
    console.error('Gemini processing error:', error);
    throw new Error(`Gemini processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function createMarketingStrategy(content: string): Promise<string> {
  try {
    const systemPrompt = `You are a senior marketing strategist. Create comprehensive marketing strategies with specific, actionable recommendations.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: systemPrompt,
      },
      contents: `Create a detailed marketing strategy based on: ${content}

Include:
1. Executive Summary
2. Target Audience Analysis
3. Marketing Channels & Tactics
4. Content Strategy
5. Social Media Plan
6. Campaign Timeline
7. Success Metrics & KPIs
8. Budget Considerations
9. Risk Mitigation
10. Next Steps

Make recommendations specific and actionable.`,
    });

    return response.text || "Error creating marketing strategy";
  } catch (error) {
    console.error('Gemini marketing strategy error:', error);
    throw new Error(`Gemini marketing strategy failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function analyzeBusiness(content: string, fileName?: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: `Analyze this ${fileName ? `business document (${fileName})` : 'business content'} from a marketing and growth perspective:

${content}

Provide:
1. Business Opportunity Assessment
2. Market Positioning Analysis
3. Competitive Advantages
4. Growth Opportunities
5. Marketing Recommendations
6. Social Media Strategy
7. Content Marketing Ideas
8. Partnership Opportunities
9. Revenue Growth Tactics
10. Implementation Roadmap`,
    });

    return response.text || "Error analyzing business content";
  } catch (error) {
    console.error('Gemini business analysis error:', error);
    throw new Error(`Gemini business analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
