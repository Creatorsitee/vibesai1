import React, { useRef, useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { FileService } from '../services/fileService';
import { FormattingService } from '../services/formattingService';
import { Wand2, Minimize2, Copy, MoreVertical } from 'lucide-react';

interface EnhancedCodeEditorProps {
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

interface EditorStats {
  lines: number;
  characters: number;
  words: number;
}

export const EnhancedCodeEditor: React.FC<EnhancedCodeEditorProps> = ({
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
  const [stats, setStats] = useState<EditorStats>({ lines: 0, characters: 0, words: 0 });
  const [showMenu, setShowMenu] = useState(false);
  const language = FileService.getLanguageFromExtension(filename);

  const updateStats = (code: string) => {
    const newStats = FormattingService.getLanguageStats(code, language);
    setStats(newStats);
  };

  useEffect(() => {
    updateStats(content);
    if (editorRef.current && editorRef.current.layout) {
      editorRef.current.layout();
    }
  }, [content, language]);

  const handleFormat = () => {
    const formatted = FormattingService.formatCode(content, language);
    onChange(formatted);
  };

  const handleMinify = () => {
    const minified = FormattingService.minifyCode(content, language);
    onChange(minified);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
  };

  const handleSelectAll = () => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.selectAll').run();
    }
  };

  return (
    <div className="h-full bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 flex flex-col">
      {/* Toolbar */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
            {filename}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Stats */}
          <div className="text-xs text-zinc-500 dark:text-zinc-400 px-2 py-1 flex gap-4">
            <span title="Lines">Ln {stats.lines}</span>
            <span title="Characters">Ch {stats.characters}</span>
          </div>

          <div className="w-px h-4 bg-zinc-300 dark:bg-zinc-700" />

          {/* Format button */}
          {!readOnly && (
            <button
              onClick={handleFormat}
              className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded transition-colors"
              title="Format code"
            >
              <Wand2 size={16} className="text-blue-600 dark:text-blue-400" />
            </button>
          )}

          {/* Copy button */}
          <button
            onClick={handleCopy}
            className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded transition-colors"
            title="Copy code"
          >
            <Copy size={16} className="text-zinc-600 dark:text-zinc-400" />
          </button>

          {/* Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded transition-colors"
              title="More options"
            >
              <MoreVertical size={16} className="text-zinc-600 dark:text-zinc-400" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg z-10">
                <button
                  onClick={() => {
                    handleMinify();
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-sm text-zinc-900 dark:text-white flex items-center gap-2"
                >
                  <Minimize2 size={14} />
                  Minify code
                </button>
                <button
                  onClick={() => {
                    handleSelectAll();
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-sm text-zinc-900 dark:text-white border-t border-zinc-200 dark:border-zinc-700"
                >
                  Select all
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        <Editor
          ref={editorRef}
          height="100%"
          language={language}
          value={content}
          onChange={(value) => {
            onChange(value || '');
            updateStats(value || '');
          }}
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
            contextmenu: true,
          }}
        />
      </div>
    </div>
  );
};
