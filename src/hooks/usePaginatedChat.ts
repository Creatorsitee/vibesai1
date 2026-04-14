import { useState, useCallback } from 'react';
import { Content } from '@google/genai';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
  codeBlock?: {
    language: string;
    code: string;
  };
}

export interface PaginatedChatState {
  messages: Message[];
  history: Content[];
  isProcessing: boolean;
  currentPage: number;
  pageSize: number;
  totalMessages: number;
}

const DEFAULT_PAGE_SIZE = 50;
const INITIAL_MESSAGE: Message = {
  id: '0',
  role: 'assistant',
  text: 'Halo! Saya adalah VibesAI Assistant. Saya siap membantu Anda mengembangkan aplikasi dengan kode, debugging, dan berbagai fitur lainnya. Apa yang ingin Anda buat hari ini?',
  timestamp: Date.now(),
};

const INITIAL_HISTORY: Content[] = [
  {
    role: 'model',
    parts: [
      {
        text: INITIAL_MESSAGE.text,
      },
    ],
  },
];

export const usePaginatedChat = (pageSize: number = DEFAULT_PAGE_SIZE) => {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [history, setHistory] = useState<Content[]>(INITIAL_HISTORY);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  const totalMessages = messages.length;

  /**
   * Get paginated messages for current page
   */
  const getPaginatedMessages = useCallback(() => {
    const startIdx = currentPage * pageSize;
    const endIdx = startIdx + pageSize;
    return messages.slice(startIdx, endIdx);
  }, [messages, currentPage, pageSize]);

  /**
   * Add a new message
   */
  const addMessage = useCallback(
    (role: 'user' | 'assistant', text: string, codeBlock?: Message['codeBlock']) => {
      const newMessage: Message = {
        id: Date.now().toString(),
        role,
        text,
        timestamp: Date.now(),
        codeBlock,
      };
      setMessages((prev) => [...prev, newMessage]);
      
      // Auto-scroll to last page when new message added
      const newTotal = messages.length + 1;
      const newPage = Math.floor((newTotal - 1) / pageSize);
      setCurrentPage(newPage);
      
      return newMessage;
    },
    [messages.length, pageSize]
  );

  /**
   * Update the last message (for streaming)
   */
  const updateLastMessage = useCallback((text: string) => {
    setMessages((prev) => {
      const updated = [...prev];
      if (updated.length > 0) {
        updated[updated.length - 1].text = text;
      }
      return updated;
    });
  }, []);

  /**
   * Clear chat but keep history for context
   */
  const clearChat = useCallback(() => {
    setMessages([INITIAL_MESSAGE]);
    setHistory(INITIAL_HISTORY);
    setCurrentPage(0);
  }, []);

  /**
   * Delete a message by ID
   */
  const deleteMessage = useCallback((messageId: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
  }, []);

  /**
   * Navigate to specific page
   */
  const goToPage = useCallback(
    (page: number) => {
      const maxPage = Math.ceil(totalMessages / pageSize) - 1;
      const validPage = Math.max(0, Math.min(page, maxPage));
      setCurrentPage(validPage);
    },
    [totalMessages, pageSize]
  );

  /**
   * Go to last page
   */
  const goToLastPage = useCallback(() => {
    const maxPage = Math.ceil(totalMessages / pageSize) - 1;
    setCurrentPage(maxPage);
  }, [totalMessages, pageSize]);

  /**
   * Export messages for backup
   */
  const exportMessages = useCallback(() => {
    return JSON.stringify(
      {
        messages,
        history,
        exportedAt: new Date().toISOString(),
      },
      null,
      2
    );
  }, [messages, history]);

  /**
   * Get stats about the chat
   */
  const getStats = useCallback(() => {
    const userMessages = messages.filter((m) => m.role === 'user').length;
    const assistantMessages = messages.filter((m) => m.role === 'assistant').length;
    const totalTokens = history.reduce(
      (sum, content) =>
        sum +
        (content.parts?.reduce((s, part) => {
          if ('text' in part) return s + (part.text?.length ?? 0) / 4;
          return s;
        }, 0) ?? 0),
      0
    );

    return {
      totalMessages,
      userMessages,
      assistantMessages,
      estimatedTokens: Math.round(totalTokens),
      currentPage,
      totalPages: Math.ceil(totalMessages / pageSize),
    };
  }, [messages, history, totalMessages, currentPage, pageSize]);

  return {
    messages,
    setMessages,
    history,
    setHistory,
    isProcessing,
    setIsProcessing,
    addMessage,
    updateLastMessage,
    clearChat,
    deleteMessage,
    currentPage,
    pageSize,
    totalMessages,
    paginatedMessages: getPaginatedMessages(),
    goToPage,
    goToLastPage,
    exportMessages,
    getStats,
  };
};
