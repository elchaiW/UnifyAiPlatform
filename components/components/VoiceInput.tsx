import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Square, Play, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VoiceInputProps {
  onTranscription: (text: string) => void;
  disabled?: boolean;
}

export function VoiceInput({ onTranscription, disabled = false }: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm;codecs=opus' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      
      toast({
        title: "Recording started",
        description: "Speak clearly into your microphone"
      });
      
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Recording failed",
        description: "Please allow microphone access and try again",
        variant: "destructive"
      });
    }
  }, [toast]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      toast({
        title: "Recording stopped",
        description: "Processing your voice message..."
      });
    }
  }, [isRecording, toast]);

  const processAudio = useCallback(async () => {
    if (!audioBlob) return;
    
    setIsProcessing(true);
    
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Transcription failed: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.text) {
        onTranscription(result.text);
        toast({
          title: "Voice message processed",
          description: `Transcribed: "${result.text.substring(0, 50)}${result.text.length > 50 ? '...' : ''}"`
        });
        
        // Clear the audio after successful processing
        setAudioBlob(null);
        setAudioUrl(null);
      } else {
        throw new Error('No text was transcribed');
      }
      
    } catch (error) {
      console.error('Error processing audio:', error);
      toast({
        title: "Transcription failed",
        description: error instanceof Error ? error.message : "Unable to process voice message",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  }, [audioBlob, onTranscription, toast]);

  const playRecording = useCallback(() => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().catch(error => {
        console.error('Error playing audio:', error);
        toast({
          title: "Playback failed",
          description: "Unable to play recording",
          variant: "destructive"
        });
      });
    }
  }, [audioUrl, toast]);

  const clearRecording = useCallback(() => {
    setAudioBlob(null);
    setAudioUrl(null);
  }, []);

  return (
    <>
      {!audioBlob ? (
        <Button
          type="button"
          variant="ghost" 
          size="sm"
          onClick={isRecording ? stopRecording : startRecording}
          disabled={disabled || isProcessing}
          className={`h-9 w-9 p-0 rounded-full border-none ${
            isRecording 
              ? 'bg-red-600 text-white hover:bg-red-700' 
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          {isRecording ? (
            <Square className="h-4 w-4" />
          ) : (
            <Mic className="h-4 w-4" />
          )}
        </Button>
      ) : (
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={playRecording}
            disabled={disabled}
            className="h-9 w-9 p-0 rounded-full text-gray-400 hover:text-white hover:bg-gray-700 border-none"
          >
            <Play className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={processAudio}
            disabled={disabled || isProcessing}
            className="h-9 px-3 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-600 border-none text-xs"
          >
            {isProcessing ? (
              <>
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent mr-1" />
                Processing
              </>
            ) : (
              'Send'
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearRecording}
            disabled={disabled || isProcessing}
            className="h-9 w-9 p-0 rounded-full text-gray-400 hover:text-white hover:bg-gray-700 border-none"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </>
  );
}