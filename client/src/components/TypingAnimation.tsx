import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface TypingAnimationProps {
  text?: string;
  speed?: number;
}

export default function TypingAnimation({ text = "Generating response...", speed = 50 }: TypingAnimationProps) {
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
    <div className="flex items-center space-x-4 px-6 pb-8">
      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
        <Loader2 className="h-4 w-4 animate-spin text-white" />
      </div>
      <div className="flex-1 flex items-center">
        <div className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
          <span>{displayText}</span>
          <span className={`inline-block w-0.5 h-4 bg-blue-600 ml-1 ${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity`}>|</span>
        </div>
      </div>
    </div>
  );
}