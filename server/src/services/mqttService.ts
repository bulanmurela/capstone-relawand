import mqtt from 'mqtt';
import SensorData from '../models/SensorData';
import Device from '../models/Device';
import Alert from '../models/Alert';
import MqttLog from '../models/MqttLog';
import { RealtimeService } from './realtimeService';

interface MqttSensorData {
  temperature: number | null;
  humidity: number | null;
  gas_adc: number;
  gas_ppm: number;
  voltage: number;
  alarm: boolean;
  device_id?: string;
}

interface MqttServiceOptions {
  broker: string;
  topic: string;
  port?: number;
  defaultDeviceId?: string;
  realtimeService?: RealtimeService;
}

class MqttService {
  private client: mqtt.MqttClient | null = null;
  private options: MqttServiceOptions;
  private isProduction: boolean;
  private realtimeService?: RealtimeService;

  constructor(options: MqttServiceOptions) {
    this.options = {
      port: 1883,
      defaultDeviceId: 'STM32-001',
      ...options
    };
    this.isProduction = process.env.NODE_ENV === 'production';
    this.realtimeService = options.realtimeService;
  }

  setRealtimeService(realtimeService: RealtimeService) {
    this.realtimeService = realtimeService;
  }

  async connect() {
    const { broker, port, topic } = this.options;

    console.log(`[MQTT] Connecting to broker: ${broker}:${port}`);
    console.log(`[MQTT] Topic: ${topic}`);

    this.client = mqtt.connect(`mqtt://${broker}:${port}`, {
      clientId: `relawand_${Math.random().toString(16).substring(2, 8)}`,
      clean: true,
      connectTimeout: 4000,
      reconnectPeriod: 1000
    });

    this.client.on('connect', () => {
      console.log('[MQTT] ✅ Connected to broker');

      if (this.client) {
        this.client.subscribe(topic, (err) => {
          if (err) {
            console.error('[MQTT] ❌ Subscription error:', err);
          } else {
            console.log(`[MQTT] ✅ Subscribed to topic: ${topic}`);
            console.log('[MQTT] 👂 Listening for sensor data...\n');
          }
        });
      }
    });

    this.client.on('message', async (receivedTopic, payload) => {
      await this.handleMessage(receivedTopic, payload.toString());
    });

    this.client.on('error', (error) => {
      console.error('[MQTT] ❌ Connection error:', error);
    });

    this.client.on('close', () => {
      console.log('[MQTT] 🔌 Disconnected from broker');
    });

    this.client.on('reconnect', () => {
      console.log('[MQTT] 🔄 Attempting to reconnect...');
    });
  }

  private async handleMessage(topic: string, message: string) {
    let deviceId = this.options.defaultDeviceId!;
    let deviceName = 'Unknown Device';
    let status: 'success' | 'error' = 'success';
    let errorMessage: string | undefined;

    try {
      const data: MqttSensorData = JSON.parse(message);

      if (!this.isProduction) {
        console.log(`[MQTT] 📩 Received: ${message.substring(0, 100)}`);
      }

      // Extract device ID from message or use default
      deviceId = data.device_id || this.options.defaultDeviceId!;

      // Update device heartbeat and status
      await this.updateDeviceStatus(deviceId);

      // Get device name for logging
      const device = await Device.findOne({ deviceId });
      deviceName = device?.deviceName || deviceId;

      // Save all sensor data (temperature and humidity can be null)
      await this.saveSensorData(deviceId, data);

      // Handle alarm if present
      if (data.alarm) {
        await this.handleAlarm(deviceId, data);
      }

    } catch (error) {
      console.error('[MQTT] ❌ Error processing message:', error);
      status = 'error';
      errorMessage = error instanceof Error ? error.message : 'Unknown error';
    }

    // Log the MQTT message to database
    try {
      await MqttLog.create({
        deviceId,
        deviceName,
        type: 'RECEIVED',
        topic,
        payload: message,
        status,
        errorMessage,
        timestamp: new Date()
      });
    } catch (logError) {
      console.error('[MQTT] ❌ Error logging message:', logError);
    }
  }

  private async updateDeviceStatus(deviceId: string) {
    try {
      const device = await Device.findOne({ deviceId });

      if (device) {
        device.statusDevice = 'online';
        device.lastHeartbeat = new Date();
        await device.save();
      } else {
        // Auto-create device if it doesn't exist
        await Device.create({
          deviceId,
          deviceName: `Device ${deviceId}`,
          deviceType: 'STM32',
          statusDevice: 'online',
          lastHeartbeat: new Date(),
          isActive: true
        });
        console.log(`[MQTT] 🆕 Auto-created device: ${deviceId}`);
      }
    } catch (error) {
      console.error('[MQTT] ❌ Error updating device status:', error);
    }
  }

  private async saveSensorData(deviceId: string, data: MqttSensorData) {
    try {
      const sensorData = await SensorData.create({
        deviceId,
        timestamp: new Date(),
        temperature: data.temperature,
        humidity: data.humidity,
        gas_adc: data.gas_adc,
        gas_ppm: data.gas_ppm,
        voltage: data.voltage,
        alarm: data.alarm
      });

      if (!this.isProduction) {
        console.log(`[MQTT] 💾 Saved sensor data for ${deviceId}`);
      }

      // Broadcast to connected WebSocket clients in real-time
      if (this.realtimeService) {
        this.realtimeService.broadcastSensorData(deviceId, {
          deviceId,
          timestamp: sensorData.timestamp,
          temperature: data.temperature,
          humidity: data.humidity,
          gas_adc: data.gas_adc,
          gas_ppm: data.gas_ppm,
          voltage: data.voltage,
          alarm: data.alarm
        });
      }
    } catch (error) {
      console.error('[MQTT] ❌ Error saving sensor data:', error);
    }
  }

  private async handleAlarm(deviceId: string, data: MqttSensorData) {
    try {
      const device = await Device.findOne({ deviceId });
      const deviceName = device?.deviceName || deviceId;

      // Determine alert level based on gas concentration
      // SIAGA: 1000-1500 ppm
      // DARURAT: > 1500 ppm
      let level: 'NORMAL' | 'SIAGA' | 'DARURAT' = 'NORMAL';

      if (data.gas_ppm > 1500) {
        level = 'DARURAT';
      } else if (data.gas_ppm >= 1000) {
        level = 'SIAGA';
      }

      // Only create alert if level is not NORMAL
      if (level !== 'NORMAL') {
        await Alert.create({
          deviceId: device?._id || deviceId,
          deviceName,
          level,
          temperature: data.temperature || 0,
          humidity: data.humidity || 0,
          gasConcentration: data.gas_ppm,
          timestamp: new Date()
        });

        console.log(`[MQTT] 🚨 ALARM: ${level} - Device: ${deviceName}, Gas: ${data.gas_ppm} ppm`);
      }
    } catch (error) {
      console.error('[MQTT] ❌ Error handling alarm:', error);
    }
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

  // Publish method for testing or sending commands back to devices
  async publish(topic: string, message: string, deviceId?: string): Promise<void> {
    const status: 'success' | 'error' = this.client?.connected ? 'success' : 'error';
    const targetDeviceId = deviceId || this.options.defaultDeviceId!;

    if (this.client?.connected) {
      this.client.publish(topic, message);
      console.log(`[MQTT] 📤 Published to ${topic}: ${message}`);
    } else {
      console.error('[MQTT] ❌ Cannot publish - not connected');
    }

    // Log the sent message to database
    try {
      const device = await Device.findOne({ deviceId: targetDeviceId });
      const deviceName = device?.deviceName || targetDeviceId;

      await MqttLog.create({
        deviceId: targetDeviceId,
        deviceName,
        type: 'SENT',
        topic,
        payload: message,
        status,
        errorMessage: status === 'error' ? 'Not connected to broker' : undefined,
        timestamp: new Date()
      });
    } catch (logError) {
      console.error('[MQTT] ❌ Error logging sent message:', logError);
    }
  }
}

export default MqttService;
