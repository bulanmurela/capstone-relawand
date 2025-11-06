import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import SensorData from '../models/SensorData';

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

export class RealtimeService {
  private io: SocketIOServer;

  constructor(httpServer: HttpServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        credentials: true,
        methods: ['GET', 'POST']
      }
    });

    this.setupConnectionHandlers();
    console.log('[Socket.IO] ✅ Real-time service initialized');
  }

  private setupConnectionHandlers() {
    this.io.on('connection', (socket: Socket) => {
      console.log(`[Socket.IO] 🔌 Client connected: ${socket.id}`);

      // Handle device-specific subscriptions
      socket.on('subscribe-device', (deviceId: string) => {
        socket.join(`device:${deviceId}`);
        console.log(`[Socket.IO] 📡 Client ${socket.id} subscribed to device: ${deviceId}`);
      });

      socket.on('unsubscribe-device', (deviceId: string) => {
        socket.leave(`device:${deviceId}`);
        console.log(`[Socket.IO] 📴 Client ${socket.id} unsubscribed from device: ${deviceId}`);
      });

      socket.on('disconnect', () => {
        console.log(`[Socket.IO] 🔌 Client disconnected: ${socket.id}`);
      });
    });
  }

  /**
   * Broadcast sensor data update to all clients subscribed to this device
   */
  broadcastSensorData(deviceId: string, data: SensorDataUpdate) {
    this.io.to(`device:${deviceId}`).emit('sensor-data', data);

    // Also broadcast to all connected clients (for dashboard overview)
    this.io.emit('sensor-data-all', data);

    console.log(`[Socket.IO] 📤 Broadcasted sensor data for device: ${deviceId}`);
  }

  /**
   * Broadcast alert to all clients
   */
  broadcastAlert(alert: any) {
    this.io.emit('alert', alert);
    console.log(`[Socket.IO] 🚨 Broadcasted alert: ${alert.level}`);
  }

  /**
   * Get connection status
   */
  getConnectedClients(): number {
    return this.io.engine.clientsCount;
  }
}
