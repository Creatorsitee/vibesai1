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

export const useChatState = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      text: 'Halo! Saya adalah VibesAI Assistant. Saya siap membantu Anda mengembangkan aplikasi dengan kode, debugging, dan berbagai fitur lainnya. Apa yang ingin Anda buat hari ini?',
      timestamp: Date.now(),
    },
  ]);

  const [history, setHistory] = useState<Content[]>([
    {
      role: 'model',
      parts: [
        {
          text: 'Halo! Saya adalah VibesAI Assistant. Saya siap membantu Anda mengembangkan aplikasi dengan kode, debugging, dan berbagai fitur lainnya. Apa yang ingin Anda buat hari ini?',
        },
      ],
    },
  ]);

  const [isProcessing, setIsProcessing] = useState(false);

  const addMessage = useCallback((role: 'user' | 'assistant', text: string, codeBlock?: Message['codeBlock']) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role,
      text,
      timestamp: Date.now(),
      codeBlock,
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  }, []);

  const updateLastMessage = useCallback((text: string) => {
    setMessages(prev => {
      const updated = [...prev];
      if (updated.length > 0) {
        updated[updated.length - 1].text = text;
      }
      return updated;
    });
  }, []);

  const clearChat = useCallback(() => {
    setMessages([]);
    setHistory([]);
  }, []);

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
  };
};
