export interface ErrorLog {
  id: string;
  timestamp: Date;
  level: 'error' | 'warning' | 'info';
  message: string;
  context?: Record<string, any>;
  stack?: string;
  userMessage: string;
}

export type ErrorHandler = (error: ErrorLog) => void;

class ErrorService {
  private logs: ErrorLog[] = [];
  private handlers: ErrorHandler[] = [];
  private readonly MAX_LOGS = 100;

  /**
   * Register error handlers that will be called when errors occur
   */
  onError(handler: ErrorHandler): () => void {
    this.handlers.push(handler);
    // Return unsubscribe function
    return () => {
      this.handlers = this.handlers.filter((h) => h !== handler);
    };
  }

  /**
   * Log an error with automatic retry suggestion and user-friendly message
   */
  logError(
    error: Error | string,
    context?: Record<string, any>,
    userMessage?: string
  ): ErrorLog {
    const errorLog: ErrorLog = {
      id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      level: 'error',
      message: typeof error === 'string' ? error : error.message,
      context,
      stack: error instanceof Error ? error.stack : undefined,
      userMessage:
        userMessage ||
        this.getDefaultUserMessage(
          typeof error === 'string' ? error : error.message
        ),
    };

    this.addLog(errorLog);
    this.notifyHandlers(errorLog);

    return errorLog;
  }

  /**
   * Log a warning
   */
  logWarning(
    message: string,
    context?: Record<string, any>,
    userMessage?: string
  ): ErrorLog {
    const errorLog: ErrorLog = {
      id: `warning-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      level: 'warning',
      message,
      context,
      userMessage: userMessage || `Warning: ${message}`,
    };

    this.addLog(errorLog);
    this.notifyHandlers(errorLog);

    return errorLog;
  }

  /**
   * Log an info message
   */
  logInfo(
    message: string,
    context?: Record<string, any>
  ): ErrorLog {
    const errorLog: ErrorLog = {
      id: `info-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      level: 'info',
      message,
      context,
      userMessage: message,
    };

    this.addLog(errorLog);

    return errorLog;
  }

  /**
   * Get user-friendly error message based on error type
   */
  private getDefaultUserMessage(errorMessage: string): string {
    if (errorMessage.includes('API key') || errorMessage.includes('authentication')) {
      return 'API authentication failed. Please check your API key in settings.';
    }
    if (errorMessage.includes('timeout') || errorMessage.includes('timeout')) {
      return 'Request timeout. Please check your internet connection and try again.';
    }
    if (errorMessage.includes('network') || errorMessage.includes('Network')) {
      return 'Network error. Please check your internet connection.';
    }
    if (errorMessage.includes('CORS')) {
      return 'Cross-origin request failed. This might be a server configuration issue.';
    }
    if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
      return 'Too many requests. Please wait a moment and try again.';
    }
    return 'An error occurred. Please try again later.';
  }

  /**
   * Add log to history (with max limit)
   */
  private addLog(log: ErrorLog): void {
    this.logs.unshift(log);
    if (this.logs.length > this.MAX_LOGS) {
      this.logs = this.logs.slice(0, this.MAX_LOGS);
    }
  }

  /**
   * Notify all registered handlers
   */
  private notifyHandlers(errorLog: ErrorLog): void {
    this.handlers.forEach((handler) => {
      try {
        handler(errorLog);
      } catch (err) {
        console.error('[ErrorService] Handler failed:', err);
      }
    });
  }

  /**
   * Get all error logs
   */
  getLogs(): ErrorLog[] {
    return [...this.logs];
  }

  /**
   * Get recent errors
   */
  getRecentErrors(count: number = 10): ErrorLog[] {
    return this.logs.slice(0, count);
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Export logs for debugging
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

// Singleton instance
let instance: ErrorService | null = null;

export const getErrorService = (): ErrorService => {
  if (!instance) {
    instance = new ErrorService();
  }
  return instance;
};

// For debugging: attach to window in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).__errorService = getErrorService();
}
