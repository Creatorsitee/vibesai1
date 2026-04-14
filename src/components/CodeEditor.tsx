import React, { useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { FileService } from '../services/fileService';

interface CodeEditorProps {
  filename: string;
  content: string;
  onChange: (content: string) => void;
  theme: 'light' | 'dark';
  fontSize: number;
  lineNumbers: boolean;
  wordWrap: boolean;
  minimap: boolean;
  readOnly?: boolean;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  filename,
  content,
  onChange,
  theme,
  fontSize,
  lineNumbers,
  wordWrap,
  minimap,
  readOnly = false,
}) => {
  const editorRef = useRef<any>(null);
  const language = FileService.getLanguageFromExtension(filename);

  useEffect(() => {
    if (editorRef.current && editorRef.current.layout) {
      editorRef.current.layout();
    }
  }, []);

  return (
    <div className="h-full bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800">
      <Editor
        ref={editorRef}
        height="100%"
        language={language}
        value={content}
        onChange={(value) => onChange(value || '')}
        theme={theme === 'dark' ? 'vs-dark' : 'vs'}
        options={{
          fontSize,
          lineNumbers: lineNumbers ? 'on' : 'off',
          wordWrap: wordWrap ? 'on' : 'off',
          minimap: { enabled: minimap },
          formatOnPaste: true,
          formatOnType: true,
          autoClosingBrackets: 'always',
          autoClosingQuotes: 'always',
          bracketPairColorization: { enabled: true },
          smoothScrolling: true,
          cursorBlinking: 'smooth',
          fontFamily: '"Fira Code", "Monaco", "Courier New", monospace',
          suggestOnTriggerCharacters: true,
          quickSuggestions: {
            other: true,
            comments: false,
            strings: false,
          },
          readOnly,
        }}
      />
    </div>
  );
};
