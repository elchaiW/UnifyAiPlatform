import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, Brain, MessageSquare, TrendingUp } from 'lucide-react';

export function VoiceFeatureShowcase() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="border-blue-200 dark:border-blue-800">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <Mic className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle className="text-sm">Voice Input</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-xs">
            Record voice messages using your microphone with support for multiple audio formats
          </CardDescription>
          <div className="mt-2">
            <Badge variant="outline" className="text-xs">WebM • MP3 • WAV</Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="border-green-200 dark:border-green-800">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <Brain className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-sm">AI Transcription</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-xs">
            Powered by AssemblyAI for accurate speech-to-text with language detection
          </CardDescription>
          <div className="mt-2">
            <Badge variant="outline" className="text-xs">95%+ Accuracy</Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="border-purple-200 dark:border-purple-800">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <MessageSquare className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <CardTitle className="text-sm">Smart Routing</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-xs">
            Voice messages automatically routed to the best AI model based on content
          </CardDescription>
          <div className="mt-2">
            <Badge variant="outline" className="text-xs">Auto-Classify</Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="border-orange-200 dark:border-orange-800">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
            <CardTitle className="text-sm">Enhanced Analysis</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-xs">
            Optional sentiment analysis and topic extraction from voice messages
          </CardDescription>
          <div className="mt-2">
            <Badge variant="outline" className="text-xs">Sentiment • Topics</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}