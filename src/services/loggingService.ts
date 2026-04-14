export interface LogEntry {
  timestamp: Date;
  level: 'debug' | 'info' | 'warn' | 'error';
  category: string;
  message: string;
  data?: any;
}

class LoggingService {
  private logs: LogEntry[] = [];
  private readonly MAX_LOGS = 500;
  private isDevelopment = process.env.NODE_ENV === 'development';

  /**
   * Log debug message (development only)
   */
  debug(category: string, message: string, data?: any): void {
    if (!this.isDevelopment) return;
    this.addLog('debug', category, message, data);
  }

  /**
   * Log info message
   */
  info(category: string, message: string, data?: any): void {
    this.addLog('info', category, message, data);
  }

  /**
   * Log warning
   */
  warn(category: string, message: string, data?: any): void {
    this.addLog('warn', category, message, data);
  }

  /**
   * Log error
   */
  error(category: string, message: string, data?: any): void {
    this.addLog('error', category, message, data);
  }

  /**
   * Add log entry
   */
  private addLog(
    level: 'debug' | 'info' | 'warn' | 'error',
    category: string,
    message: string,
    data?: any
  ): void {
    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      category,
      message,
      data,
    };

    // Also log to console in development
    if (this.isDevelopment) {
      const consoleMethod = {
        debug: console.debug,
        info: console.info,
        warn: console.warn,
        error: console.error,
      }[level];

      consoleMethod(
        `[${category}] ${message}`,
        data ? data : ''
      );
    }

    this.logs.unshift(entry);
    if (this.logs.length > this.MAX_LOGS) {
      this.logs = this.logs.slice(0, this.MAX_LOGS);
    }
  }

  /**
   * Get all logs
   */
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * Get logs by level
   */
  getLogsByLevel(level: string): LogEntry[] {
    return this.logs.filter((log) => log.level === level);
  }

  /**
   * Get logs by category
   */
  getLogsByCategory(category: string): LogEntry[] {
    return this.logs.filter((log) => log.category === category);
  }

  /**
   * Get recent logs
   */
  getRecentLogs(count: number = 50): LogEntry[] {
    return this.logs.slice(0, count);
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Export logs as JSON for debugging
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Generate formatted log report
   */
  generateReport(): string {
    const groupedByCategory: Record<string, LogEntry[]> = {};

    for (const log of this.logs) {
      if (!groupedByCategory[log.category]) {
        groupedByCategory[log.category] = [];
      }
      groupedByCategory[log.category].push(log);
    }

    let report = 'Logging Report\n===============\n\n';

    for (const [category, logs] of Object.entries(groupedByCategory)) {
      report += `${category} (${logs.length} entries)\n`;
      report += '---\n';

      for (const log of logs.slice(0, 5)) {
        report += `[${log.timestamp.toISOString()}] ${log.level.toUpperCase()}: ${log.message}\n`;
      }

      if (logs.length > 5) {
        report += `... and ${logs.length - 5} more\n`;
      }

      report += '\n';
    }

    return report;
  }
}

// Singleton instance
let instance: LoggingService | null = null;

export const getLoggingService = (): LoggingService => {
  if (!instance) {
    instance = new LoggingService();
  }
  return instance;
};

// For debugging: attach to window in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).__loggingService = getLoggingService();
}
