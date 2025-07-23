import OpenAI from "openai";
import { formatPlainTextResponse } from "../utils/textFormatter.js";

const openai = new OpenAI({ baseURL: "https://api.x.ai/v1", apiKey: process.env.XAI_API_KEY });

export async function processWithGrok(content: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "grok-2-1212",
      messages: [
        {
          role: "system",
          content: "You are a senior software engineer and technical expert. Provide detailed technical analysis, code reviews, debugging assistance, and programming solutions. Focus on best practices, security, performance, and maintainability. Provide responses in plain text format without markdown formatting, asterisks, or special symbols. Use clear, readable text with proper paragraphs."
        },
        {
          role: "user",
          content: content
        }
      ],
      max_tokens: 4000,
      temperature: 0.1,
    });

    const responseContent = response.choices[0].message.content || 'Error processing response';
    return formatPlainTextResponse(responseContent);
  } catch (error) {
    console.error('Grok processing error:', error);
    throw new Error(`Grok processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function debugCode(content: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "grok-2-1212",
      messages: [
        {
          role: "system",
          content: "You are an expert code debugger and reviewer. Analyze code for bugs, performance issues, security vulnerabilities, and suggest improvements with explanations."
        },
        {
          role: "user",
          content: `Please debug and analyze this code:

${content}

Provide:
1. Bug Analysis
2. Security Review
3. Performance Assessment
4. Code Quality Issues
5. Best Practices Recommendations
6. Refactored/Fixed Code (if needed)
7. Testing Suggestions
8. Documentation Improvements

Be specific about line numbers and issues found.`
        }
      ],
      max_tokens: 4000,
      temperature: 0.1,
    });

    return response.choices[0].message.content || 'Error debugging code';
  } catch (error) {
    console.error('Grok debugging error:', error);
    throw new Error(`Grok debugging failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function analyzeTechnicalDocument(content: string, fileName?: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "grok-2-1212",
      messages: [
        {
          role: "system",
          content: "You are a technical architecture expert. Analyze technical documents, specifications, and code for technical merit, implementation feasibility, and improvements."
        },
        {
          role: "user",
          content: `Analyze this ${fileName ? `technical document (${fileName})` : 'technical content'}:

${content}

Provide technical analysis including:
1. Technical Overview
2. Architecture Assessment
3. Implementation Feasibility
4. Technical Risks & Challenges
5. Security Considerations
6. Performance Implications
7. Scalability Analysis
8. Technology Stack Recommendations
9. Code Quality & Standards
10. Technical Debt Assessment
11. Improvement Suggestions
12. Next Steps for Implementation`
        }
      ],
      max_tokens: 4000,
      temperature: 0.1,
    });

    return response.choices[0].message.content || 'Error analyzing technical document';
  } catch (error) {
    console.error('Grok technical analysis error:', error);
    throw new Error(`Grok technical analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
