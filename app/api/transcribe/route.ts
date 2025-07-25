import { NextRequest, NextResponse } from 'next/server';
import { transcribeAudio } from '../../../server/services/assemblyaiService';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    
    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // Convert File to Buffer
    const buffer = Buffer.from(await audioFile.arrayBuffer());
    
    // Create a mock file object for the transcribe function
    const mockFile = {
      buffer,
      mimetype: audioFile.type,
      originalname: audioFile.name,
      size: audioFile.size
    };

    const transcription = await transcribeAudio(mockFile as any);
    
    return NextResponse.json({
      success: true,
      text: transcription.text,
      confidence: transcription.confidence
    });
    
  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Transcription failed'
    }, { status: 500 });
  }
}