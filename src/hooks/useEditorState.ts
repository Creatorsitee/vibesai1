import { useState, useCallback } from 'react';

export interface EditorState {
  activeFile: string;
  editorMode: 'code' | 'preview' | 'split';
  fontSize: number;
  theme: 'light' | 'dark';
  lineNumbers: boolean;
  wordWrap: boolean;
  minimap: boolean;
}

export const useEditorState = (initialFile: string) => {
  const [state, setState] = useState<EditorState>({
    activeFile: initialFile,
    editorMode: 'split',
    fontSize: 14,
    theme: 'dark',
    lineNumbers: true,
    wordWrap: true,
    minimap: true,
  });

  const updateEditorState = useCallback((updates: Partial<EditorState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const setActiveFile = useCallback((file: string) => {
    setState(prev => ({ ...prev, activeFile: file }));
  }, []);

  const setEditorMode = useCallback((mode: 'code' | 'preview' | 'split') => {
    setState(prev => ({ ...prev, editorMode: mode }));
  }, []);

  const toggleTheme = useCallback(() => {
    setState(prev => ({ ...prev, theme: prev.theme === 'dark' ? 'light' : 'dark' }));
  }, []);

  return {
    ...state,
    updateEditorState,
    setActiveFile,
    setEditorMode,
    toggleTheme,
  };
};
