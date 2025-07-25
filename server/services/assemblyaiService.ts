import { AssemblyAI } from 'assemblyai';

const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY || ''
});

export async function transcribeAudio(audioFile: any): Promise<{ text: string; confidence: number }> {
  if (!process.env.ASSEMBLYAI_API_KEY) {
    throw new Error('ASSEMBLYAI_API_KEY not configured');
  }

  try {
    // First upload the audio file
    const uploadUrl = await client.files.upload(audioFile.buffer);
    
    // Then transcribe using the uploaded URL
    const transcript = await client.transcripts.transcribe({
      audio_url: uploadUrl,
      speech_model: 'nano' // Use faster nano model for better performance
    });

    if (transcript.status === 'error') {
      throw new Error(transcript.error || 'Transcription failed');
    }

    return {
      text: transcript.text || '',
      confidence: transcript.confidence || 0.95
    };
  } catch (error) {
    console.error('AssemblyAI transcription error:', error);
    throw new Error('Failed to transcribe audio');
  }
}

export async function transcribeAudioWithSentimentAnalysis(audioFile: any): Promise<any> {
  if (!process.env.ASSEMBLYAI_API_KEY) {
    throw new Error('ASSEMBLYAI_API_KEY not configured');
  }

  try {
    const transcript = await client.transcripts.transcribe({
      audio: audioFile.buffer,
      sentiment_analysis: true,
      speaker_labels: true
    });

    return {
      text: transcript.text,
      confidence: transcript.confidence,
      sentiment: transcript.sentiment_analysis_results
    };
  } catch (error) {
    console.error('AssemblyAI sentiment analysis error:', error);
    throw new Error('Failed to transcribe audio with sentiment analysis');
  }
}