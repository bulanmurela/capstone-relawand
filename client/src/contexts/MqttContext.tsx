'use client';

import React, { createContext, useContext, ReactNode, useEffect, useRef } from 'react';
import { useMqtt, MqttSensorData } from '../hooks/useMqtt';
import { useAlert } from './AlertContexts';

interface MqttContextValue {
  data: MqttSensorData | null;
  isConnected: boolean;
  error: string | null;
  lastUpdate: Date | null;
  WarningComponent: React.ReactNode;
}

const MqttContext = createContext<MqttContextValue | undefined>(undefined);

interface MqttProviderProps {
  children: ReactNode;
  enabled?: boolean;
}

// Alert thresholds
const THRESHOLDS = {
  DARURAT: {
    temperature: 40,
    humidity: 35,
    gas_ppm: 1500  // Alert DARURAT if gas > 1500 ppm
  },
  SIAGA: {
    temperature: 35,
    humidity: 50,
    gas_ppm: 1000   // Alert SIAGA if gas >= 1000 ppm (up to 1500 ppm)
  }
};

function checkAlertLevel(data: MqttSensorData): 'NORMAL' | 'SIAGA' | 'DARURAT' | null {
  const temp = data.temperature || 0;
  const humidity = data.humidity || 0;
  const gas = data.gas_ppm || 0;

  // Check DARURAT conditions (highest priority)
  if (temp >= THRESHOLDS.DARURAT.temperature ||
      humidity <= THRESHOLDS.DARURAT.humidity ||
      gas >= THRESHOLDS.DARURAT.gas_ppm) {
    return 'DARURAT';
  }

  // Check SIAGA conditions
  if (temp >= THRESHOLDS.SIAGA.temperature ||
      humidity <= THRESHOLDS.SIAGA.humidity ||
      gas >= THRESHOLDS.SIAGA.gas_ppm) {
    return 'SIAGA';
  }

  return null; // NORMAL - no alert needed
}

export function MqttProvider({ children, enabled = true }: MqttProviderProps) {
  const mqttState = useMqtt({ enabled });
  const { showAlert } = useAlert();
  const lastAlertTime = useRef<number>(0);
  const ALERT_COOLDOWN = 60000; // 1 minute cooldown between alerts

  // Check for alerts when new data arrives
  useEffect(() => {
    if (mqttState.data) {
      const alertLevel = checkAlertLevel(mqttState.data);
      const now = Date.now();

      // Only show alert if level is SIAGA or DARURAT and cooldown has passed
      if (alertLevel && alertLevel !== 'NORMAL' && (now - lastAlertTime.current) > ALERT_COOLDOWN) {
        lastAlertTime.current = now;
        showAlert({
          level: alertLevel,
          deviceId: mqttState.data.device_id,
          deviceName: mqttState.data.device_id || 'Unknown Device',
          temperature: mqttState.data.temperature || 0,
          humidity: mqttState.data.humidity || 0,
          gasConcentration: mqttState.data.gas_ppm || 0
        });
      }
    }
  }, [mqttState.data, showAlert]);

  return (
    <MqttContext.Provider value={mqttState}>
      {children}
      {mqttState.WarningComponent}
    </MqttContext.Provider>
  );
}

export function useMqttContext() {
  const context = useContext(MqttContext);
  if (context === undefined) {
    throw new Error('useMqttContext must be used within a MqttProvider');
  }
  return context;
}
