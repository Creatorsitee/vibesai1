import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

const toastStyles: Record<ToastType, { icon: React.ReactNode; bg: string; border: string; text: string }> = {
  success: {
    icon: <CheckCircle size={20} />,
    bg: 'bg-green-50 dark:bg-green-950',
    border: 'border-green-200 dark:border-green-800',
    text: 'text-green-800 dark:text-green-200',
  },
  error: {
    icon: <AlertCircle size={20} />,
    bg: 'bg-red-50 dark:bg-red-950',
    border: 'border-red-200 dark:border-red-800',
    text: 'text-red-800 dark:text-red-200',
  },
  warning: {
    icon: <AlertTriangle size={20} />,
    bg: 'bg-yellow-50 dark:bg-yellow-950',
    border: 'border-yellow-200 dark:border-yellow-800',
    text: 'text-yellow-800 dark:text-yellow-200',
  },
  info: {
    icon: <Info size={20} />,
    bg: 'bg-blue-50 dark:bg-blue-950',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-800 dark:text-blue-200',
  },
};

interface ToastItemProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onDismiss }) => {
  const style = toastStyles[toast.type];

  useEffect(() => {
    if (toast.duration) {
      const timer = setTimeout(() => onDismiss(toast.id), toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast.duration, toast.id, onDismiss]);

  return (
    <div
      className={`flex items-center gap-3 p-4 rounded-lg border ${style.bg} ${style.border} ${style.text} mb-3 animate-in fade-in slide-in-from-bottom-2 duration-200`}
      role="alert"
    >
      {style.icon}
      <p className="flex-1 text-sm">{toast.message}</p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="flex-shrink-0 p-1 hover:opacity-75 transition-opacity"
        aria-label="Dismiss"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = (message: string, type: ToastType = 'info', duration: number = 3000) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const toast: Toast = {
      id,
      type,
      message,
      duration,
    };

    setToasts((prev) => [...prev, toast]);
    return id;
  };

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const success = (message: string, duration?: number) => show(message, 'success', duration);
  const error = (message: string, duration?: number) => show(message, 'error', duration ?? 5000);
  const warning = (message: string, duration?: number) => show(message, 'warning', duration ?? 4000);
  const info = (message: string, duration?: number) => show(message, 'info', duration);

  return {
    toasts,
    show,
    dismiss,
    success,
    error,
    warning,
    info,
  };
};

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-4 z-40 max-w-sm">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};
