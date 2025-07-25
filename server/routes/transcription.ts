import { Router } from 'express';
import multer from 'multer';
import { transcribeAudio, transcribeAudioWithSentimentAnalysis } from '../services/assemblyaiService';

const router = Router();

// Configure multer for audio file uploads
const audioUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit
  },
  fileFilter: (req, file, cb) => {
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
      cb(new Error('Unsupported audio format'));
    }
  }
});

// Basic transcription endpoint
router.post('/transcribe', audioUpload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    console.log('Processing audio transcription:', {
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    const text = await transcribeAudio(req.file.buffer, req.file.mimetype);
    
    res.json({
      success: true,
      text,
      audioInfo: {
        format: req.file.mimetype,
        size: req.file.size
      }
    });

  } catch (error) {
    console.error('Transcription error:', error);
    res.status(500).json({ 
      error: 'Transcription failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Enhanced transcription with sentiment analysis
router.post('/transcribe/enhanced', audioUpload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    console.log('Processing enhanced audio transcription:', {
      filename: req.file.originalname,
      mimetype: req.file.mimetype,  
      size: req.file.size
    });

    const result = await transcribeAudioWithSentimentAnalysis(req.file.buffer, req.file.mimetype);
    
    res.json({
      success: true,
      ...result,
      audioInfo: {
        format: req.file.mimetype,
        size: req.file.size
      }
    });

  } catch (error) {
    console.error('Enhanced transcription error:', error);
    res.status(500).json({ 
      error: 'Enhanced transcription failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;