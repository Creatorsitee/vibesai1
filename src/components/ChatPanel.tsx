import React, { useRef, useEffect, useMemo } from 'react';
import { Send, Loader2, Copy, Check, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from '../hooks/useChatState';
import { TypingIndicator } from './TypingIndicator';
import { getLoggingService } from '../services/loggingService';

interface ChatPanelProps {
  messages: Message[];
  isProcessing: boolean;
  onSendMessage: (text: string) => void;
  theme: 'light' | 'dark';
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  isProcessing,
  onSendMessage,
  theme,
}) => {
  const loggingService = getLoggingService();
  const [input, setInput] = React.useState('');
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [charCount, setCharCount] = React.useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const MAX_CHAR_LIMIT = 2000;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (input.trim() && !isProcessing) {
      loggingService.info('ChatPanel', 'Sending message', { length: input.length });
      onSendMessage(input);
      setInput('');
      setCharCount(0);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    loggingService.info('ChatPanel', 'Message copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (text.length <= MAX_CHAR_LIMIT) {
      setInput(text);
      setCharCount(text.length);
    }
  };

  // Memoize message list to prevent unnecessary re-renders
  const messagesList = useMemo(() => {
    return messages.map((message) => (
      <div
        key={message.id}
        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
      >
        <div
          className={`max-w-xs lg:max-w-md xl:max-w-lg ${
            message.role === 'user'
              ? 'bg-blue-600 text-white rounded-lg rounded-tr-none'
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-lg rounded-tl-none'
          } p-3`}
        >
          <div className="prose dark:prose-invert prose-sm max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}
              components={{
                pre: ({ node, ...props }) => (
                  <div className="relative group">
                    <pre className="bg-zinc-900 text-zinc-100 p-3 rounded overflow-x-auto" {...props} />
                    <button
                      onClick={() => {
                        const code = props.children?.[0]?.props?.children || '';
                        copyToClipboard(String(code), message.id);
                      }}
                      className="absolute top-2 right-2 p-2 bg-zinc-700 hover:bg-zinc-600 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {copiedId === message.id ? (
                        <Check size={14} className="text-green-400" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                  </div>
                ),
              }}
            >
              {message.text}
            </ReactMarkdown>
          </div>
          <div className="text-xs mt-2 opacity-70">
            {new Date(message.timestamp).toLocaleTimeString()}
          </div>
        </div>
      </div>
    ));
  }, [messages, copiedId]);

  return (
    <div className={`h-full flex flex-col bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 ${theme === 'dark' ? 'dark' : ''}`}>
      {/* Header */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-4 py-3">
        <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">AI ASSISTANT</p>
        <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">Messages: {messages.length}</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messagesList}
        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-lg rounded-tl-none p-3">
              <TypingIndicator text="AI is responding..." variant="dots" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-50 dark:bg-zinc-900 space-y-2">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your message... (Shift+Enter for new line)"
            rows={3}
            disabled={isProcessing}
            maxLength={MAX_CHAR_LIMIT}
            className="flex-1 p-3 border border-zinc-200 dark:border-zinc-700 rounded-lg dark:bg-zinc-800 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isProcessing}
            className="px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-400 text-white rounded-lg transition-colors flex items-center justify-center"
            title="Send message (Ctrl+Enter)"
          >
            {isProcessing ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
        
        {/* Character count and hint */}
        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
          <p>{charCount} / {MAX_CHAR_LIMIT} characters</p>
          {charCount > MAX_CHAR_LIMIT * 0.8 && (
            <p className="text-yellow-600 dark:text-yellow-400">Approaching limit</p>
          )}
        </div>
      </div>
    </div>
  );
};
