import React, { useEffect, useRef, useState, useCallback, useMemo, memo } from 'react';
import { RefreshCw, X } from 'lucide-react';
import { OptimizationUtils } from '../services/performanceService';
import { getLoggingService } from '../services/loggingService';

interface LivePreviewProps {
  files: Record<string, string>;
  activeFile: string;
  theme: 'light' | 'dark';
}

const LivePreviewComponent: React.FC<LivePreviewProps> = ({
  files,
  activeFile,
  theme,
}) => {
  const loggingService = getLoggingService();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [consoleLogs, setConsoleLogs] = useState<Array<{ type: string; message: string }>>([]);
  const lastFilesHashRef = useRef<string>('');

  /**
   * Generate hash of files to detect actual changes
   */
  const getFilesHash = useCallback((): string => {
    return Object.keys(files)
      .sort()
      .reduce((hash, key) => {
        return hash + key + ':' + files[key].substring(0, 100);
      }, '');
  }, [files]);

  const refreshPreview = useCallback(() => {
    const currentHash = getFilesHash();
    
    // Skip refresh if files haven't actually changed
    if (currentHash === lastFilesHashRef.current) {
      return;
    }

    lastFilesHashRef.current = currentHash;
    loggingService.debug('LivePreview', 'Refreshing preview with new files');

    const htmlFile = Object.keys(files).find((f) => f.endsWith('.html')) || 'index.html';
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
              if (window.logs.length > 100) window.logs.shift();
              window.logs.push({ type: 'log', message: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') });
              originalLog.apply(console, args);
            };
            
            console.error = function(...args) {
              if (window.logs.length > 100) window.logs.shift();
              window.logs.push({ type: 'error', message: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') });
              originalError.apply(console, args);
            };
            
            console.warn = function(...args) {
              if (window.logs.length > 100) window.logs.shift();
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
      loggingService.info('LivePreview', 'Preview refreshed successfully');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(`Error: ${errorMsg}`);
      loggingService.error('LivePreview', 'Error refreshing preview', { error: errorMsg });
    }
  }, [getFilesHash, loggingService]);

  // Debounced refresh to avoid excessive re-renders
  useEffect(() => {
    const debouncedRefresh = OptimizationUtils.debounce(refreshPreview, 300);
    debouncedRefresh();
  }, [refreshPreview]);

  // Intercept console logs from iframe - throttled for performance
  useEffect(() => {
    const iframe = iframeRef.current;
    if (iframe) {
      const throttledLogUpdate = OptimizationUtils.throttle(() => {
        try {
          const iframeWindow = iframe.contentWindow as any;
          if (iframeWindow?.logs) {
            setConsoleLogs((prev) => {
              // Only update if logs have changed
              if (JSON.stringify(prev) !== JSON.stringify(iframeWindow.logs)) {
                return iframeWindow.logs;
              }
              return prev;
            });
          }
        } catch (e) {
          // Cross-origin, can't access
        }
      }, 1000);

      const checkLogs = setInterval(throttledLogUpdate, 1000);

      return () => clearInterval(checkLogs);
    }
  }, []);

  // Memoized console logs display
  const ConsoleDisplay = useMemo(() => {
    if (consoleLogs.length === 0) return null;

    return (
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
    );
  }, [consoleLogs]);

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
      {ConsoleDisplay}
    </div>
  );
};

export const LivePreview = memo(LivePreviewComponent);
