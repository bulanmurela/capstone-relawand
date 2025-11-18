"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
}

interface ConfirmDialogData {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
}

interface NotificationContextType {
  showNotification: (type: NotificationType, message: string, duration?: number) => void;
  showConfirm: (data: ConfirmDialogData) => void;
  hideConfirm: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogData | null>(null);

  const showNotification = useCallback((type: NotificationType, message: string, duration: number = 5000) => {
    const id = `notification-${Date.now()}-${Math.random()}`;
    const notification: Notification = { id, type, message, duration };

    setNotifications(prev => [...prev, notification]);

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, duration);
    }
  }, []);

  const showConfirm = useCallback((data: ConfirmDialogData) => {
    setConfirmDialog(data);
  }, []);

  const hideConfirm = useCallback(() => {
    setConfirmDialog(null);
  }, []);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ showNotification, showConfirm, hideConfirm }}>
      {children}

      {/* Notification Toasts */}
      <div className="fixed top-4 right-4 z-[10000] space-y-2 pointer-events-none">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`pointer-events-auto min-w-80 max-w-md px-6 py-4 rounded-lg shadow-lg flex items-start gap-3 animate-slide-in-right ${
              notification.type === 'success' ? 'bg-green-600 text-white' :
              notification.type === 'error' ? 'bg-red-600 text-white' :
              notification.type === 'warning' ? 'bg-yellow-500 text-gray-900' :
              'bg-blue-600 text-white'
            }`}
            style={{ fontFamily: 'Nunito, sans-serif' }}
          >
            <div className="flex-shrink-0 text-2xl">
              {notification.type === 'success' && '✓'}
              {notification.type === 'error' && '✕'}
              {notification.type === 'warning' && '⚠'}
              {notification.type === 'info' && 'ℹ'}
            </div>
            <div className="flex-1 pt-0.5">
              <p className="text-sm font-semibold">{notification.message}</p>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="flex-shrink-0 text-xl opacity-70 hover:opacity-100 transition-opacity"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Confirm Dialog */}
      {confirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10001] p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
            <h3 className="text-xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'Nunito, sans-serif' }}>
              {confirmDialog.title}
            </h3>
            <p className="text-gray-700 mb-6" style={{ fontFamily: 'Nunito, sans-serif' }}>
              {confirmDialog.message}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  confirmDialog.onCancel?.();
                  hideConfirm();
                }}
                className="px-5 py-2.5 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                {confirmDialog.cancelText || 'Batal'}
              </button>
              <button
                onClick={() => {
                  confirmDialog.onConfirm();
                  hideConfirm();
                }}
                className="px-5 py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                {confirmDialog.confirmText || 'Konfirmasi'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes scale-in {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
