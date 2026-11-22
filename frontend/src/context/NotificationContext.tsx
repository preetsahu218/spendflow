import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
}

interface NotificationContextType {
  showNotification: (type: NotificationType, message: string) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const showNotification = useCallback((type: NotificationType, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications((prev) => [...prev, { id, type, message }]);

    setTimeout(() => {
      removeNotification(id);
    }, 4500);
  }, [removeNotification]);

  const showSuccess = useCallback((message: string) => showNotification('success', message), [showNotification]);
  const showError = useCallback((message: string) => showNotification('error', message), [showNotification]);

  return (
    <NotificationContext.Provider value={{ showNotification, showSuccess, showError }}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2 max-w-sm w-full pointer-events-none">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-xl border backdrop-blur-xl transition-all duration-300 animate-slide-up ${
              n.type === 'success'
                ? 'bg-emerald-50/95 dark:bg-emerald-950/90 border-emerald-200/90 dark:border-emerald-800/80 text-emerald-900 dark:text-emerald-100 shadow-emerald-500/10'
                : n.type === 'error'
                ? 'bg-rose-50/95 dark:bg-rose-950/90 border-rose-200/90 dark:border-rose-800/80 text-rose-900 dark:text-rose-100 shadow-rose-500/10'
                : n.type === 'warning'
                ? 'bg-amber-50/95 dark:bg-amber-950/90 border-amber-200/90 dark:border-amber-800/80 text-amber-900 dark:text-amber-100 shadow-amber-500/10'
                : 'bg-blue-50/95 dark:bg-blue-950/90 border-blue-200/90 dark:border-blue-800/80 text-blue-900 dark:text-blue-100 shadow-blue-500/10'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {n.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
              {n.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />}
              {n.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
              {n.type === 'info' && <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
            </div>
            <p className="text-sm font-medium flex-1 leading-snug">{n.message}</p>
            <button
              onClick={() => removeNotification(n.id)}
              className="text-slate-400 hover:text-slate-600 transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
