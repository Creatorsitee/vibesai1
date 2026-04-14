import React, { useState, useCallback } from 'react';
import { Settings, ChevronDown, Check } from 'lucide-react';
import { AIProvider } from '../services/unifiedAIService';
import { getLoggingService } from '../services/loggingService';

interface AIProviderSelectorProps {
  currentProvider: AIProvider;
  availableProviders: AIProvider[];
  onProviderChange: (provider: AIProvider) => void;
}

export const AIProviderSelector: React.FC<AIProviderSelectorProps> = ({
  currentProvider,
  availableProviders,
  onProviderChange,
}) => {
  const loggingService = getLoggingService();
  const [isOpen, setIsOpen] = useState(false);

  const handleProviderSelect = useCallback(
    (provider: AIProvider) => {
      onProviderChange(provider);
      setIsOpen(false);
      loggingService.info('AIProviderSelector', `Switched to ${provider}`);
    },
    [onProviderChange, loggingService]
  );

  const getProviderLabel = (provider: AIProvider): string => {
    if (provider === 'gemini') return 'Gemini 2.0 Flash';
    if (provider === 'claude') return 'Claude 3.5 Sonnet';
    return provider;
  };

  const getProviderColor = (provider: AIProvider): string => {
    if (provider === 'gemini') return 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300';
    if (provider === 'claude') return 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300';
    return 'bg-zinc-100 dark:bg-zinc-800';
  };

  if (availableProviders.length === 0) {
    return (
      <div className="px-3 py-2 text-xs text-red-600 dark:text-red-400">
        ⚠️ No AI providers configured
      </div>
    );
  }

  if (availableProviders.length === 1) {
    return (
      <div className={`px-3 py-2 rounded text-xs font-semibold flex items-center gap-2 ${getProviderColor(currentProvider)}`}>
        <span className="w-2 h-2 rounded-full bg-current"></span>
        {getProviderLabel(currentProvider)}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded text-xs font-semibold ${getProviderColor(
          currentProvider
        )} hover:opacity-80 transition-opacity`}
      >
        <span className="w-2 h-2 rounded-full bg-current"></span>
        {getProviderLabel(currentProvider)}
        <ChevronDown size={14} />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg z-50 min-w-[200px]">
          <div className="p-2">
            {availableProviders.map((provider) => (
              <button
                key={provider}
                onClick={() => handleProviderSelect(provider)}
                className={`w-full text-left px-3 py-2 rounded text-sm flex items-center justify-between transition-colors ${
                  provider === currentProvider
                    ? 'bg-zinc-100 dark:bg-zinc-700'
                    : 'hover:bg-zinc-50 dark:hover:bg-zinc-700'
                }`}
              >
                <span>
                  <div className="font-semibold">{getProviderLabel(provider)}</div>
                  {provider === 'gemini' && (
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">Google Gemini</div>
                  )}
                  {provider === 'claude' && (
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">Anthropic Claude</div>
                  )}
                </span>
                {provider === currentProvider && (
                  <Check size={16} className="text-green-600 dark:text-green-400" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
