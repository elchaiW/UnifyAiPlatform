import React from 'react';

interface LoadingAnimationProps {
  message?: string;
}

export default function LoadingAnimation({ message = "Processing your request..." }: LoadingAnimationProps) {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-8">
      {/* Logo with pulsing animation */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-md opacity-50 animate-pulse"></div>
        <img 
          src="/attached_assets/Group 1171274849 (1)_1753432882218.png" 
          alt="LUMINADOC" 
          className="relative h-12 w-auto animate-bounce z-10"
        />
      </div>

      {/* Creative text animation */}
      <div className="text-center">
        <div className="flex items-center space-x-1 mb-2">
          {/* Animated LUMINADOC text */}
          <div className="flex">
            {['L', 'U', 'M', 'I', 'N', 'A', 'D', 'O', 'C'].map((letter, index) => (
              <span
                key={index}
                className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent animate-pulse"
                style={{
                  animationDelay: `${index * 0.1}s`,
                  animationDuration: '1.5s'
                }}
              >
                {letter}
              </span>
            ))}
          </div>
          
          {/* Animated dots */}
          <div className="flex space-x-1 ml-2">
            {[0, 1, 2].map((dot) => (
              <div
                key={dot}
                className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-bounce"
                style={{
                  animationDelay: `${dot * 0.2}s`,
                  animationDuration: '1.4s'
                }}
              />
            ))}
          </div>
        </div>
        
        {/* Status message */}
        <p className="text-gray-400 text-sm animate-pulse">
          {message}
        </p>
      </div>

      {/* Progress bar effect */}
      <div className="w-64 h-1 bg-gray-700 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-pulse"></div>
      </div>
    </div>
  );
}

/* Alternative typing effect version */
export function TypingLoadingAnimation({ message = "AI is thinking..." }: LoadingAnimationProps) {
  return (
    <div className="flex items-center space-x-3 py-4">
      {/* Small logo */}
      <img 
        src="/attached_assets/Group 1171274849 (1)_1753432882218.png" 
        alt="LUMINADOC" 
        className="h-8 w-auto opacity-80"
      />
      
      {/* Typing animation */}
      <div className="flex items-center space-x-2">
        <span className="text-gray-300 font-medium">LUMINADOC</span>
        <span className="text-gray-400">is thinking</span>
        
        {/* Typing dots */}
        <div className="flex space-x-1">
          {[0, 1, 2].map((dot) => (
            <div
              key={dot}
              className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"
              style={{
                animationDelay: `${dot * 0.3}s`,
                animationDuration: '1.5s'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}