import React, { useEffect, useRef, useState } from 'react';
import { RefreshCw, X } from 'lucide-react';

interface LivePreviewProps {
  files: Record<string, string>;
  activeFile: string;
  theme: 'light' | 'dark';
}

export const LivePreview: React.FC<LivePreviewProps> = ({
  files,
  activeFile,
  theme,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [consoleLogs, setConsoleLogs] = useState<Array<{ type: string; message: string }>>([]);

  const refreshPreview = () => {
    const htmlFile = Object.keys(files).find(f => f.endsWith('.html')) || 'index.html';
    const htmlContent = files[htmlFile];

    if (!htmlContent) {
      setError('No HTML file found');
      return;
    }

    try {
      const iframe = iframeRef.current;
      if (!iframe) return;

      // Create new content with console interception
      const wrappedContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: system-ui, -apple-system, sans-serif; }
          </style>
        </head>
        <body>
          <div id="root"></div>
          <script>
            window.logs = [];
            const originalLog = console.log;
            const originalError = console.error;
            const originalWarn = console.warn;
            
            console.log = function(...args) {
              window.logs.push({ type: 'log', message: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') });
              originalLog.apply(console, args);
            };
            
            console.error = function(...args) {
              window.logs.push({ type: 'error', message: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') });
              originalError.apply(console, args);
            };
            
            console.warn = function(...args) {
              window.logs.push({ type: 'warn', message: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') });
              originalWarn.apply(console, args);
            };
          </script>
          ${htmlContent}
        </body>
        </html>
      `;

      const blob = new Blob([wrappedContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      iframe.src = url;
      setError(null);
    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  useEffect(() => {
    refreshPreview();
  }, [files, activeFile]);

  // Intercept console logs from iframe
  useEffect(() => {
    const iframe = iframeRef.current;
    if (iframe) {
      const checkLogs = setInterval(() => {
        try {
          const iframeWindow = iframe.contentWindow as any;
          if (iframeWindow?.logs) {
            setConsoleLogs(iframeWindow.logs);
          }
        } catch (e) {
          // Cross-origin, can't access
        }
      }, 500);

      return () => clearInterval(checkLogs);
    }
  }, []);

  return (
    <div className={`h-full flex flex-col bg-white dark:bg-zinc-950 ${theme === 'dark' ? 'dark' : ''}`}>
      {/* Toolbar */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-3 flex items-center justify-between">
        <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">PREVIEW</span>
        <button
          onClick={refreshPreview}
          className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded transition-colors"
          title="Refresh preview"
        >
          <RefreshCw size={16} className="text-zinc-600 dark:text-zinc-400" />
        </button>
      </div>

      {/* Preview area */}
      <div className="flex-1 overflow-hidden">
        {error ? (
          <div className="h-full flex items-center justify-center p-4">
            <div className="text-center">
              <p className="text-red-600 dark:text-red-400 font-semibold mb-2">Preview Error</p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">{error}</p>
            </div>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
            title="Live preview"
          />
        )}
      </div>

      {/* Console */}
      {consoleLogs.length > 0 && (
        <div className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-900 dark:bg-black p-3 max-h-48 overflow-y-auto">
          <p className="text-xs font-semibold text-zinc-400 mb-2">CONSOLE</p>
          <div className="space-y-1">
            {consoleLogs.slice(-20).map((log, i) => (
              <div
                key={i}
                className={`text-xs font-mono ${
                  log.type === 'error'
                    ? 'text-red-400'
                    : log.type === 'warn'
                    ? 'text-yellow-400'
                    : 'text-green-400'
                }`}
              >
                {log.message}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
