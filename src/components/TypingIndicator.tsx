import React from 'react';

interface TypingIndicatorProps {
  text?: string;
  variant?: 'dots' | 'bounce' | 'wave';
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  text = 'AI is thinking',
  variant = 'dots',
}) => {
  const indicators = {
    dots: (
      <div className="flex items-center gap-1">
        <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
        <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
        <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
      </div>
    ),
    bounce: (
      <div className="flex items-center gap-1">
        <div
          className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
          style={{ animationDelay: '0s' }}
        />
        <div
          className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
          style={{ animationDelay: '0.15s' }}
        />
        <div
          className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
          style={{ animationDelay: '0.3s' }}
        />
      </div>
    ),
    wave: (
      <div className="flex items-end gap-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="w-1 bg-blue-500 rounded-full animate-pulse"
            style={{
              height: `${10 + i * 4}px`,
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>
    ),
  };

  return (
    <div className="flex items-center gap-2">
      {indicators[variant]}
      <span className="text-sm text-zinc-600 dark:text-zinc-400">{text}</span>
    </div>
  );
};

interface StreamingTextProps {
  text: string;
  showCursor?: boolean;
}

export const StreamingText: React.FC<StreamingTextProps> = ({
  text,
  showCursor = true,
}) => {
  return (
    <div className="inline">
      {text}
      {showCursor && (
        <span className="animate-pulse ml-0.5">|</span>
      )}
    </div>
  );
};
