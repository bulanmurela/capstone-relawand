import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export interface SensorDataUpdate {
  deviceId: string;
  timestamp: Date;
  temperature: number | null;
  humidity: number | null;
  gas_adc: number;
  gas_ppm: number;
  voltage: number;
  alarm: boolean;
}

interface UseRealtimeSensorDataOptions {
  deviceId?: string;
  enabled?: boolean;
}

export function useRealtimeSensorData(options: UseRealtimeSensorDataOptions = {}) {
  const { deviceId, enabled = true } = options;
  const [data, setData] = useState<SensorDataUpdate | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const serverUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    console.log('[Socket.IO] Connecting to:', serverUrl);

    const socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      reconnectionDelayMax: 10000,
      reconnectionAttempts: 5
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Socket.IO] ✅ Connected');
      setIsConnected(true);
      setError(null);

      // Subscribe to specific device if provided
      if (deviceId) {
        socket.emit('subscribe-device', deviceId);
        console.log(`[Socket.IO] 📡 Subscribed to device: ${deviceId}`);
      }
    });

    socket.on('disconnect', () => {
      console.log('[Socket.IO] 🔌 Disconnected');
      setIsConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.error('[Socket.IO] ❌ Connection error:', err);
      setError(err.message);
      setIsConnected(false);
    });

    // Listen for sensor data updates
    socket.on('sensor-data', (update: SensorDataUpdate) => {
      console.log('[Socket.IO] 📩 Received sensor data:', update);
      setData(update);
    });

    // Cleanup on unmount
    return () => {
      if (deviceId) {
        socket.emit('unsubscribe-device', deviceId);
      }
      socket.disconnect();
      console.log('[Socket.IO] Disconnected');
    };
  }, [deviceId, enabled]);

  return {
    data,
    isConnected,
    error
  };
}
