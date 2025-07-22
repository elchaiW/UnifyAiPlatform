import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface TypingAnimationProps {
  text?: string;
  speed?: number;
}

export default function TypingAnimation({ text = "Analyzing your message and routing to the best AI model...", speed = 50 }: TypingAnimationProps) {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, speed]);

  // Blinking cursor effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => clearInterval(cursorInterval);
  }, []);

  // Reset when text changes
  useEffect(() => {
    setDisplayText("");
    setCurrentIndex(0);
  }, [text]);

  return (
    <div className="flex items-start space-x-3 px-4 pb-6">
      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
        <Loader2 className="h-4 w-4 animate-spin text-white" />
      </div>
      <div className="flex-1">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3 shadow-sm">
          <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
            <span>{displayText}</span>
            <span className={`inline-block w-2 h-5 bg-gray-400 ${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity`}>|</span>
          </div>
        </div>
      </div>
    </div>
  );
}