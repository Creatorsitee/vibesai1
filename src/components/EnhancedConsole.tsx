import React, { useState } from 'react';
import { Trash2, ChevronDown, Copy, AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react';

export interface ConsoleLog {
  id: string;
  type: 'log' | 'error' | 'warn' | 'info';
  message: string;
  timestamp: number;
  stack?: string;
  context?: Record<string, any>;
}

interface EnhancedConsoleProps {
  logs: ConsoleLog[];
  onClear: () => void;
}

export const EnhancedConsole: React.FC<EnhancedConsoleProps> = ({
  logs,
  onClear,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'log' | 'error' | 'warn' | 'info'>('all');

  const filteredLogs = filterType === 'all'
    ? logs
    : logs.filter(log => log.type === filterType);

  const getIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertCircle size={14} className="text-red-500" />;
      case 'warn':
        return <AlertTriangle size={14} className="text-yellow-500" />;
      case 'info':
        return <Info size={14} className="text-blue-500" />;
      default:
        return <CheckCircle size={14} className="text-green-500" />;
    }
  };

  const getLogColor = (type: string) => {
    switch (type) {
      case 'error':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
      case 'warn':
        return 'text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20';
      case 'info':
        return 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20';
      default:
        return 'text-zinc-700 dark:text-zinc-300';
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const copyLog = (message: string) => {
    navigator.clipboard.writeText(message);
  };

  return (
    <div className="h-full flex flex-col bg-zinc-900 dark:bg-black text-white">
      {/* Toolbar */}
      <div className="border-b border-zinc-700 bg-zinc-800 px-3 py-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-zinc-400">CONSOLE</span>
          <span className="text-xs text-zinc-500">{filteredLogs.length} logs</span>
        </div>

        <div className="flex items-center gap-1">
          {/* Filter buttons */}
          <div className="flex gap-1 mr-2">
            {(['all', 'log', 'error', 'warn', 'info'] as const).map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  filterType === type
                    ? 'bg-blue-600 text-white'
                    : 'text-zinc-400 hover:text-zinc-300'
                }`}
              >
                {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>

          {/* Clear button */}
          <button
            onClick={onClear}
            className="p-1 hover:bg-zinc-700 rounded transition-colors"
            title="Clear console"
          >
            <Trash2 size={14} className="text-zinc-400" />
          </button>
        </div>
      </div>

      {/* Logs */}
      <div className="flex-1 overflow-y-auto font-mono text-xs">
        {filteredLogs.length > 0 ? (
          <div className="space-y-0">
            {filteredLogs.map(log => (
              <div key={log.id} className="border-b border-zinc-800">
                <div
                  onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                  className={`flex items-start gap-2 px-3 py-2 hover:bg-zinc-800 cursor-pointer group ${getLogColor(log.type)}`}
                >
                  <div className="shrink-0 mt-0.5">{getIcon(log.type)}</div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="truncate">{log.message}</p>
                      </div>
                      <span className="text-xs text-zinc-500 whitespace-nowrap ml-2">
                        {formatTime(log.timestamp)}
                      </span>
                    </div>
                  </div>

                  {(log.stack || log.context) && (
                    <ChevronDown
                      size={14}
                      className={`shrink-0 transition-transform ${
                        expandedId === log.id ? 'rotate-180' : ''
                      }`}
                    />
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyLog(log.message);
                    }}
                    className="p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-zinc-700 rounded"
                    title="Copy log"
                  >
                    <Copy size={12} />
                  </button>
                </div>

                {/* Expanded Details */}
                {expandedId === log.id && (log.stack || log.context) && (
                  <div className="bg-zinc-800/50 px-3 py-2 space-y-2 text-zinc-300">
                    {log.stack && (
                      <div>
                        <p className="text-xs font-semibold text-zinc-400 mb-1">Stack Trace:</p>
                        <pre className="text-xs whitespace-pre-wrap break-words">
                          {log.stack}
                        </pre>
                      </div>
                    )}
                    {log.context && (
                      <div>
                        <p className="text-xs font-semibold text-zinc-400 mb-1">Context:</p>
                        <pre className="text-xs whitespace-pre-wrap break-words">
                          {JSON.stringify(log.context, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-zinc-500">
            <p className="text-sm">No logs yet</p>
          </div>
        )}
      </div>

      {/* Stats Footer */}
      {logs.length > 0 && (
        <div className="border-t border-zinc-700 bg-zinc-800 px-3 py-1 flex gap-4 text-xs text-zinc-400">
          <span>Total: {logs.length}</span>
          <span>Errors: {logs.filter(l => l.type === 'error').length}</span>
          <span>Warnings: {logs.filter(l => l.type === 'warn').length}</span>
        </div>
      )}
    </div>
  );
};
