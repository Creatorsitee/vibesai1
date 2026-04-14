import React, { useEffect, useState } from 'react';
import { AlertCircle, X, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { ErrorLog } from '../services/errorService';

interface ErrorNotificationProps {
  errorLog: ErrorLog;
  onDismiss: () => void;
  autoHideDuration?: number;
}

const notificationStyles = {
  error: {
    icon: AlertCircle,
    bg: 'bg-red-50 dark:bg-red-950',
    border: 'border-red-200 dark:border-red-800',
    text: 'text-red-800 dark:text-red-200',
    button: 'bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-yellow-50 dark:bg-yellow-950',
    border: 'border-yellow-200 dark:border-yellow-800',
    text: 'text-yellow-800 dark:text-yellow-200',
    button: 'bg-yellow-100 dark:bg-yellow-900 hover:bg-yellow-200 dark:hover:bg-yellow-800',
  },
  info: {
    icon: Info,
    bg: 'bg-blue-50 dark:bg-blue-950',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-800 dark:text-blue-200',
    button: 'bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800',
  },
};

export const ErrorNotification: React.FC<ErrorNotificationProps> = ({
  errorLog,
  onDismiss,
  autoHideDuration = 5000,
}) => {
  const style = notificationStyles[errorLog.level];
  const IconComponent = style.icon;

  useEffect(() => {
    if (autoHideDuration && errorLog.level !== 'error') {
      const timer = setTimeout(onDismiss, autoHideDuration);
      return () => clearTimeout(timer);
    }
  }, [autoHideDuration, errorLog.level, onDismiss]);

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg border ${style.bg} ${style.border} ${style.text} mb-3`}
      role="alert"
    >
      <IconComponent size={20} className="flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm">{errorLog.userMessage}</p>
        {errorLog.message && errorLog.message !== errorLog.userMessage && (
          <p className="text-xs opacity-75 mt-1">{errorLog.message}</p>
        )}
        {errorLog.id && (
          <p className="text-xs opacity-50 mt-1 font-mono">ID: {errorLog.id}</p>
        )}
      </div>
      <button
        onClick={onDismiss}
        className={`flex-shrink-0 p-1 rounded transition-colors ${style.button}`}
        aria-label="Dismiss"
      >
        <X size={16} />
      </button>
    </div>
  );
};

interface ErrorNotificationContainerProps {
  maxNotifications?: number;
}

export const ErrorNotificationContainer: React.FC<ErrorNotificationContainerProps> = ({
  maxNotifications = 3,
}) => {
  const [notifications, setNotifications] = useState<ErrorLog[]>([]);

  useEffect(() => {
    const { getErrorService } = require('../services/errorService');
    const errorService = getErrorService();

    const unsubscribe = errorService.onError((errorLog: ErrorLog) => {
      setNotifications((prev) => {
        const updated = [errorLog, ...prev];
        if (updated.length > maxNotifications) {
          return updated.slice(0, maxNotifications);
        }
        return updated;
      });
    });

    return unsubscribe;
  }, [maxNotifications]);

  const handleDismiss = (id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 max-w-[calc(100vw-2rem)] z-50 space-y-2">
      {notifications.map((errorLog) => (
        <ErrorNotification
          key={errorLog.id}
          errorLog={errorLog}
          onDismiss={() => handleDismiss(errorLog.id)}
        />
      ))}
    </div>
  );
};
