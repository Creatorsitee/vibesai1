import React, { ReactNode } from 'react';
import { getErrorService } from '../services/errorService';
import { getLoggingService } from '../services/loggingService';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorId: string | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  private errorService = getErrorService();
  private loggingService = getLoggingService();

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorId: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log to error service
    const errorLog = this.errorService.logError(
      error,
      {
        componentStack: errorInfo.componentStack,
      },
      'An unexpected error occurred in the application. Please refresh the page.'
    );

    // Log to logging service
    this.loggingService.error(
      'ErrorBoundary',
      error.message,
      {
        componentStack: errorInfo.componentStack,
        errorId: errorLog.id,
      }
    );

    // Update state with error ID for display
    this.setState({ errorId: errorLog.id });

    // Call parent handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorId: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen flex items-center justify-center bg-red-50 dark:bg-red-950 p-4">
            <div className="max-w-md w-full bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="text-red-600 dark:text-red-400" size={24} />
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                  Something went wrong
                </h2>
              </div>

              <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                An unexpected error occurred. Please try refreshing the page.
              </p>

              {this.state.errorId && (
                <div className="bg-zinc-100 dark:bg-zinc-800 rounded p-3 mb-4">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                    Error ID: {this.state.errorId}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    Share this ID if you report the issue.
                  </p>
                </div>
              )}

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mb-4">
                  <summary className="text-sm text-zinc-600 dark:text-zinc-400 cursor-pointer hover:text-zinc-900 dark:hover:text-white">
                    Error details (development only)
                  </summary>
                  <pre className="mt-2 text-xs bg-zinc-100 dark:bg-zinc-800 p-2 rounded overflow-auto max-h-40 text-red-600 dark:text-red-400">
                    {this.state.error.message}
                    {'\n\n'}
                    {this.state.error.stack}
                  </pre>
                </details>
              )}

              <div className="flex gap-2">
                <button
                  onClick={this.handleReset}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Try again
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="flex-1 px-4 py-2 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-900 dark:text-white rounded-lg font-medium transition-colors"
                >
                  Reload page
                </button>
              </div>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
