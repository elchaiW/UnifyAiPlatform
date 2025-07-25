// AssemblyAI Service for audio transcription
import { AssemblyAI } from 'assemblyai';

const client = process.env.ASSEMBLYAI_API_KEY
  ? new AssemblyAI({ apiKey: process.env.ASSEMBLYAI_API_KEY })
  : null;

export async function transcribeAudio(file: any): Promise<{ text: string; confidence: number }> {
  if (!client) {
    throw new Error('AssemblyAI API key not configured');
  }

  // Convert buffer to base64 data URL
  const base64Audio = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
  
  const transcript = await client.transcripts.transcribe({
    audio: base64Audio,
    speech_model: 'best'
  });

  if (transcript.status === 'error') {
    throw new Error(transcript.error || 'Transcription failed');
  }

  return {
    text: transcript.text || '',
    confidence: transcript.confidence || 0
  };
}