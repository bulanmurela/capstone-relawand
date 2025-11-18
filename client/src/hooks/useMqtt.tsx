import { useEffect, useRef, useState, useCallback } from 'react';
import mqtt from 'mqtt';
import { toast } from 'sonner';

export interface MqttSensorData {
  temperature: number | null;
  humidity: number | null;
  gas_adc: number;
  gas_ppm: number;
  voltage: number;
  alarm: boolean;
  device_id?: string;
  timestamp?: string;
}

interface UseMqttOptions {
  broker?: string;
  port?: number;
  topic?: string;
  enabled?: boolean;
}

interface UseMqttReturn {
  data: MqttSensorData | null;
  isConnected: boolean;
  error: string | null;
  lastUpdate: Date | null;
}

export function useMqtt(options: UseMqttOptions = {}): UseMqttReturn {
  const {
    broker = process.env.NEXT_PUBLIC_MQTT_BROKER || 'broker.emqx.io',
    port = parseInt(process.env.NEXT_PUBLIC_MQTT_PORT || '8084', 10),
    topic = process.env.NEXT_PUBLIC_MQTT_TOPIC || 'Relawand',
    enabled = true
  } = options;

  const [data, setData] = useState<MqttSensorData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const clientRef = useRef<mqtt.MqttClient | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (!enabled || clientRef.current?.connected) {
      return;
    }

    try {
      console.log('[MQTT Client] Connecting to:', `wss://${broker}:${port}`);

      const client = mqtt.connect(`wss://${broker}:${port}`, {
        clientId: `relawand_client_${Math.random().toString(16).substring(2, 8)}`,
        clean: true,
        connectTimeout: 10000,
        reconnectPeriod: 5000,
        keepalive: 60
      });

      client.on('connect', () => {
        console.log('[MQTT Client] ✅ Connected');
        setIsConnected(true);
        setError(null);

        client.subscribe(topic, (err) => {
          if (err) {
            console.error('[MQTT Client] ❌ Subscription error:', err);
            setError(`Subscription error: ${err.message}`);
          } else {
            console.log('[MQTT Client] ✅ Subscribed to:', topic);
          }
        });
      });

      client.on('message', (_topic, payload) => {
        try {
          const parsedData: MqttSensorData = JSON.parse(payload.toString());
          setData(parsedData);
          setLastUpdate(new Date());
          console.log('[MQTT Client] 📩 Data received:', parsedData);
        } catch (err) {
          console.error('[MQTT Client] ❌ Parse error:', err);
        }
      });

      client.on('error', (err) => {
        // Check if it's a connack timeout or connection timeout
        if (err.message.includes('timeout') || err.message.includes('CONNACK')) {
          console.warn('[MQTT Client] ⚠️ Connection timeout - showing warning instead of error:', err);
          toast.warning('MQTT Connection Timeout', {
            description: `Unable to connect to MQTT broker at ${broker}:${port}. The application will continue trying to reconnect in the background.`,
            duration: 5000,
          });
          // Don't set error state for connack timeout, just show warning
        } else {
          // For other errors, log as error and set error state
          console.error('[MQTT Client] ❌ Error:', err);
          setError(err.message);
        }
        setIsConnected(false);
      });

      client.on('close', () => {
        console.log('[MQTT Client] 🔌 Disconnected');
        setIsConnected(false);
      });

      client.on('offline', () => {
        console.log('[MQTT Client] 📵 Offline');
        setIsConnected(false);
        // Don't show warning for offline events as it might be too frequent
      });

      client.on('reconnect', () => {
        console.log('[MQTT Client] 🔄 Reconnecting...');
      });

      clientRef.current = client;
    } catch (err: unknown) {
      console.error('[MQTT Client] ❌ Connection error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setIsConnected(false);

      // Retry connection after 5 seconds
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, 5000);
    }
  }, [broker, port, topic, enabled]);

  useEffect(() => {
    if (enabled) {
      connect();
    }

    // Cleanup on unmount
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (clientRef.current) {
        console.log('[MQTT Client] Disconnecting...');
        clientRef.current.end();
        clientRef.current = null;
      }
    };
  }, [connect, enabled, broker, port]);

  return {
    data,
    isConnected,
    error,
    lastUpdate
  };
}
