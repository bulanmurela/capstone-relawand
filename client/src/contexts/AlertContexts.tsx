// src/contexts/AlertContext.tsx
"use client";

import AlertNotificationModal from '@/components/AlertNotifModal';
import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type AlertLevel = 'SIAGA' | 'DARURAT';

interface AlertData {
  level: AlertLevel;
  deviceName: string;
  deviceId?: string;
  temperature: number;
  humidity: number;
  gasConcentration: number;
}

interface AlertContextType {
  showAlert: (data: AlertData) => void;
  hideAlert: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [alertData, setAlertData] = useState<AlertData | null>(null);

  const showAlert = useCallback(async (data: AlertData) => {
    setAlertData(data);
    setIsOpen(true);

    // Save alert to backend as viewed
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/alerts/mark-viewed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          deviceId: data.deviceId,
          deviceName: data.deviceName,
          level: data.level,
          temperature: data.temperature,
          humidity: data.humidity,
          gasConcentration: data.gasConcentration
        })
      });
    } catch (error) {
      console.error('Failed to save alert history:', error);
    }
  }, []);

  const hideAlert = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      {isOpen && alertData && (
        <AlertNotificationModal
          isOpen={isOpen}
          onClose={hideAlert}
          level={alertData.level}
          deviceName={alertData.deviceName}
          temperature={alertData.temperature}
          humidity={alertData.humidity}
          gasConcentration={alertData.gasConcentration}
        />
      )}
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
}