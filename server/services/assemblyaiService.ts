import { AssemblyAI } from 'assemblyai';

const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY || ''
});

export async function transcribeAudio(audioBuffer: Buffer, mimeType: string): Promise<string> {
  try {
    console.log('Starting AssemblyAI transcription...');
    
    // Upload the audio file to AssemblyAI
    const uploadUrl = await client.files.upload(audioBuffer);
    
    // Request transcription with enhanced options
    const transcript = await client.transcripts.transcribe({
      audio: uploadUrl,
      speech_model: 'best',
      language_detection: true,
      auto_highlights: true,
      punctuate: true,
      format_text: true,
      disfluencies: false,
      dual_channel: false,
    });
    
    if (transcript.status === 'error') {
      throw new Error(`Transcription failed: ${transcript.error}`);
    }
    
    if (!transcript.text) {
      throw new Error('No text was transcribed from the audio');
    }
    
    console.log('AssemblyAI transcription completed successfully');
    return transcript.text;
    
  } catch (error) {
    console.error('AssemblyAI transcription error:', error);
    throw new Error(`Voice transcription failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function transcribeAudioWithSentimentAnalysis(audioBuffer: Buffer, mimeType: string): Promise<{
  text: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  confidence?: number;
  topics?: string[];
}> {
  try {
    console.log('Starting AssemblyAI transcription with analysis...');
    
    // Upload the audio file to AssemblyAI
    const uploadUrl = await client.files.upload(audioBuffer);
    
    // Request transcription with advanced features
    const transcript = await client.transcripts.transcribe({
      audio: uploadUrl,
      speech_model: 'best',
      language_detection: true,
      sentiment_analysis: true,
      auto_highlights: true,
      iab_categories: true,
      punctuate: true,
      format_text: true,
      disfluencies: false,
    });
    
    if (transcript.status === 'error') {
      throw new Error(`Transcription failed: ${transcript.error}`);
    }
    
    if (!transcript.text) {
      throw new Error('No text was transcribed from the audio');
    }
    
    // Extract sentiment analysis results
    const sentimentResults = transcript.sentiment_analysis_results || [];
    let overallSentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
    let avgConfidence = 0;
    
    if (sentimentResults.length > 0) {
      const sentimentCounts = { positive: 0, negative: 0, neutral: 0 };
      let totalConfidence = 0;
      
      sentimentResults.forEach(result => {
        sentimentCounts[result.sentiment as keyof typeof sentimentCounts]++;
        totalConfidence += result.confidence;
      });
      
      // Determine overall sentiment
      const maxCount = Math.max(...Object.values(sentimentCounts));
      overallSentiment = Object.keys(sentimentCounts).find(
        key => sentimentCounts[key as keyof typeof sentimentCounts] === maxCount
      ) as 'positive' | 'negative' | 'neutral';
      
      avgConfidence = totalConfidence / sentimentResults.length;
    }
    
    // Extract topics from IAB categories
    const topics = transcript.iab_categories_result?.summary || {};
    const topTopics = Object.entries(topics)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 3)
      .map(([topic]) => topic);
    
    console.log('AssemblyAI transcription with analysis completed successfully');
    return {
      text: transcript.text,
      sentiment: overallSentiment,
      confidence: avgConfidence,
      topics: topTopics
    };
    
  } catch (error) {
    console.error('AssemblyAI transcription with analysis error:', error);
    throw new Error(`Voice transcription with analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Real-time transcription setup (for future streaming implementation)
export async function createRealtimeTranscript(): Promise<any> {
  try {
    const rt = client.realtime.transcriber({
      sampleRate: 16000,
      wordBoost: ['AI', 'Claude', 'ChatGPT', 'Gemini', 'Grok']
    });
    
    return rt;
  } catch (error) {
    console.error('Real-time transcript setup error:', error);
    throw error;
  }
}