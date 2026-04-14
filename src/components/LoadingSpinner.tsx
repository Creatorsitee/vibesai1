import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
  message?: string;
  overlay?: boolean;
}

const sizeMap = {
  sm: 24,
  md: 40,
  lg: 64,
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  fullScreen = false,
  message,
  overlay = true,
}) => {
  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <Loader2 size={sizeMap[size]} className="animate-spin text-blue-600 dark:text-blue-400" />
      {message && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400 text-center max-w-xs">
          {message}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div
        className={`fixed inset-0 flex items-center justify-center ${
          overlay
            ? 'bg-black/50 dark:bg-black/70'
            : 'bg-white dark:bg-zinc-950'
        } z-50`}
      >
        {spinner}
      </div>
    );
  }

  return <div className="flex items-center justify-center">{spinner}</div>;
};

interface SkeletonProps {
  count?: number;
  height?: number;
  width?: number;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  count = 1,
  height = 20,
  width = '100%',
  className = '',
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse"
          style={{
            height: `${height}px`,
            width: typeof width === 'number' ? `${width}px` : width,
          }}
        />
      ))}
    </div>
  );
};

interface ProgressBarProps {
  progress: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  showLabel = true,
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div className="w-full">
      <div
        className={`w-full bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden ${sizeClasses[size]}`}
      >
        <div
          className="bg-blue-600 dark:bg-blue-500 h-full transition-all duration-300"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
      {showLabel && (
        <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
          {clampedProgress.toFixed(0)}%
        </p>
      )}
    </div>
  );
};
