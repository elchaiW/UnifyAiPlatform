/**
 * Text formatter utility to clean AI responses from markdown symbols
 */

export function cleanMarkdownFormatting(text: string): string {
  if (!text || typeof text !== 'string') {
    return text;
  }

  return text
    // Remove markdown headers (##, ###, ####, etc.)
    .replace(/^#{1,6}\s+/gm, '')
    // Remove bold formatting (**text** or __text__)
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    // Remove italic formatting (*text* or _text_)
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/_(.+?)_/g, '$1')
    // Remove strikethrough (~~text~~)
    .replace(/~~(.+?)~~/g, '$1')
    // Remove inline code (`text`)
    .replace(/`(.+?)`/g, '$1')
    // Remove code blocks (```text```)
    .replace(/```[\s\S]*?```/g, '')
    // Remove blockquotes (> text)
    .replace(/^>\s+/gm, '')
    // Remove horizontal rules (---, ***, ___)
    .replace(/^(-{3,}|\*{3,}|_{3,})$/gm, '')
    // Remove list markers (-, *, +)
    .replace(/^[\s]*[-\*\+]\s+/gm, '• ')
    // Remove numbered list markers (1., 2., etc.)
    .replace(/^[\s]*\d+\.\s+/gm, '')
    // Remove multiple consecutive newlines
    .replace(/\n{3,}/g, '\n\n')
    // Trim whitespace
    .trim();
}