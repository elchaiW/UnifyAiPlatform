import * as fs from 'fs';
import * as path from 'path';

export interface DocumentProcessingResult {
  text: string;
  metadata: {
    fileName: string;
    fileSize: number;
    fileType: string;
    pageCount?: number;
  };
}

export async function extractTextFromFile(filePath: string, originalName: string): Promise<DocumentProcessingResult> {
  try {
    const stats = fs.statSync(filePath);
    const ext = path.extname(originalName).toLowerCase();
    
    let text = '';
    
    switch (ext) {
      case '.txt':
        text = fs.readFileSync(filePath, 'utf-8');
        break;
        
      case '.pdf':
        // For now, return placeholder - would need pdf-parse or similar library
        text = `PDF content extraction would be implemented here for ${originalName}. Please use TXT files for now.`;
        break;
        
      case '.docx':
        // For now, return placeholder - would need mammoth or similar library
        text = `DOCX content extraction would be implemented here for ${originalName}. Please use TXT files for now.`;
        break;
        
      default:
        throw new Error(`Unsupported file type: ${ext}`);
    }
    
    if (!text.trim()) {
      throw new Error('No text content found in file');
    }
    
    return {
      text: text.trim(),
      metadata: {
        fileName: originalName,
        fileSize: stats.size,
        fileType: ext.substring(1),
        pageCount: ext === '.pdf' ? 1 : undefined, // Placeholder
      }
    };
  } catch (error) {
    console.error('Document processing error:', error);
    throw new Error(`Failed to process document: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function validateFileUpload(file: Express.Multer.File): void {
  const allowedTypes = ['.txt', '.pdf', '.docx'];
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (!allowedTypes.includes(ext)) {
    throw new Error(`File type ${ext} not supported. Allowed types: ${allowedTypes.join(', ')}`);
  }
  
  if (file.size > maxSize) {
    throw new Error(`File size exceeds limit of ${maxSize / 1024 / 1024}MB`);
  }
}
