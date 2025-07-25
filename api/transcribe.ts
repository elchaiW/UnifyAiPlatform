import type { VercelRequest, VercelResponse } from '@vercel/node'
import { transcribeAudio, transcribeAudioWithSentimentAnalysis } from '../server/services/assemblyaiService'
import multer from 'multer'

// Configure multer for file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit for audio files
  },
  fileFilter: (req, file, cb) => {
    // Accept common audio formats
    const allowedMimes = [
      'audio/webm',
      'audio/mp3',
      'audio/wav',
      'audio/m4a',
      'audio/aac',
      'audio/ogg'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported audio format. Please use WebM, MP3, WAV, M4A, AAC, or OGG.'));
    }
  }
});

// Helper to promisify multer
const runMiddleware = (req: any, res: any, fn: any) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Run multer middleware
    await runMiddleware(req, res, upload.single('audio'));
    
    const file = (req as any).file;
    
    if (!file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    console.log('Received audio file:', {
      filename: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    });

    // Check if AssemblyAI API key is available
    if (!process.env.ASSEMBLYAI_API_KEY) {
      return res.status(500).json({ 
        error: 'AssemblyAI API key not configured. Please add ASSEMBLYAI_API_KEY to environment variables.' 
      });
    }

    // Determine if enhanced analysis is requested
    const enhancedAnalysis = req.query.enhanced === 'true';
    
    let result;
    if (enhancedAnalysis) {
      // Use enhanced transcription with sentiment and topic analysis
      result = await transcribeAudioWithSentimentAnalysis(file.buffer, file.mimetype);
    } else {
      // Use basic transcription
      const text = await transcribeAudio(file.buffer, file.mimetype);
      result = { text };
    }

    return res.json({
      success: true,
      ...result,
      audioInfo: {
        duration: file.size / (16000 * 2), // Rough estimate for audio duration
        format: file.mimetype,
        size: file.size
      }
    });

  } catch (error) {
    console.error('Transcription error:', error);
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return res.status(401).json({ error: 'Invalid AssemblyAI API key' });
      }
      
      if (error.message.includes('file size')) {
        return res.status(413).json({ error: 'Audio file too large. Maximum size is 25MB.' });
      }
      
      if (error.message.includes('format')) {
        return res.status(400).json({ error: 'Unsupported audio format' });
      }
    }

    return res.status(500).json({ 
      error: 'Transcription failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Disable default body parser to handle multipart data
export const config = {
  api: {
    bodyParser: false,
  },
};