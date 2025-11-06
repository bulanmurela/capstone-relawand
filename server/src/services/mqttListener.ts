import mqtt from 'mqtt';

interface MqttListenerOptions {
  broker: string;
  topic: string;
  port?: number;
  onMessage?: (topic: string, message: string) => void;
  onConnect?: () => void;
  onError?: (error: Error) => void;
}

class MqttListener {
  private client: mqtt.MqttClient | null = null;
  private options: MqttListenerOptions;

  constructor(options: MqttListenerOptions) {
    this.options = {
      port: 1883, // Default MQTT port
      ...options
    };
  }

  connect() {
    const { broker, port, topic, onMessage, onConnect, onError } = this.options;

    console.log(`[MQTT] Connecting to broker: ${broker}:${port}`);
    console.log(`[MQTT] Topic: ${topic}`);

    // Connect to MQTT broker
    this.client = mqtt.connect(`mqtt://${broker}:${port}`, {
      clientId: `relawand_${Math.random().toString(16).substring(2, 8)}`,
      clean: true,
      connectTimeout: 4000,
      reconnectPeriod: 1000
    });

    // Handle connection
    this.client.on('connect', () => {
      console.log('[MQTT] ✅ Connected to broker');

      if (this.client) {
        this.client.subscribe(topic, (err) => {
          if (err) {
            console.error('[MQTT] ❌ Subscription error:', err);
          } else {
            console.log(`[MQTT] ✅ Subscribed to topic: ${topic}`);
            console.log('[MQTT] 👂 Listening for messages...\n');
          }
        });
      }

      if (onConnect) {
        onConnect();
      }
    });

    // Handle incoming messages
    this.client.on('message', (receivedTopic, payload) => {
      const message = payload.toString();
      const timestamp = new Date().toISOString();

      console.log('─'.repeat(60));
      console.log(`[${timestamp}]`);
      console.log(`Topic: ${receivedTopic}`);
      console.log(`Message: ${message}`);

      // Try to parse JSON if possible
      try {
        const jsonData = JSON.parse(message);
        console.log('Parsed JSON:');
        console.log(JSON.stringify(jsonData, null, 2));
      } catch (e) {
        // Not JSON, that's okay
      }
      console.log('─'.repeat(60) + '\n');

      if (onMessage) {
        onMessage(receivedTopic, message);
      }
    });

    // Handle errors
    this.client.on('error', (error) => {
      console.error('[MQTT] ❌ Connection error:', error);
      if (onError) {
        onError(error);
      }
    });

    // Handle disconnection
    this.client.on('close', () => {
      console.log('[MQTT] 🔌 Disconnected from broker');
    });

    // Handle reconnection
    this.client.on('reconnect', () => {
      console.log('[MQTT] 🔄 Attempting to reconnect...');
    });
  }

  disconnect() {
    if (this.client) {
      console.log('[MQTT] Disconnecting...');
      this.client.end();
      this.client = null;
    }
  }

  isConnected(): boolean {
    return this.client?.connected || false;
  }
}

export default MqttListener;
