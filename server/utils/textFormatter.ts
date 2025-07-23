/**
 * Utility functions for cleaning and formatting text responses from AI models
 */

export function cleanMarkdownFormatting(text: string): string {
  if (!text) return text;
  
  return text
    // Remove markdown headers (### ## #)
    .replace(/^#{1,6}\s+/gm, '')
    // Replace **bold** with plain text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    // Replace *italic* with plain text
    .replace(/\*(.*?)\*/g, '$1')
    // Remove backticks for inline code
    .replace(/`([^`]+)`/g, '$1')
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, '')
    // Remove bullet points (- * +)
    .replace(/^[\s]*[-\*\+]\s+/gm, '• ')
    // Remove numbered lists
    .replace(/^[\s]*\d+\.\s+/gm, '')
    // Clean up multiple consecutive newlines
    .replace(/\n{3,}/g, '\n\n')
    // Remove leading/trailing whitespace
    .trim();
}

export function formatPlainTextResponse(text: string): string {
  if (!text) return text;
  
  // First clean markdown formatting
  let cleaned = cleanMarkdownFormatting(text);
  
  // Ensure proper paragraph spacing
  cleaned = cleaned
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n\n');
    
  return cleaned;
}