import { Server as SocketIOServer } from 'socket.io';
import { Server } from 'http';
import SensorData, { ISensorData } from '../models/Sensor';
import { Device } from '../models';

export class RealtimeService {
  private io: SocketIOServer;
  private deviceStreams: Map<string, NodeJS.Timeout> = new Map();

  constructor(httpServer: Server) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.CLIENT_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
      }
    });

    this.setupSocketHandlers();
  }

  private setupSocketHandlers(): void {
    this.io.on('connection', (socket) => {
      console.log(`📡 Client connected: ${socket.id}`);

      // Handle device data subscription
      socket.on('subscribe:device', (deviceId: string) => {
        socket.join(`device:${deviceId}`);
        console.log(`📡 Client ${socket.id} subscribed to device ${deviceId}`);

        // Send initial data
        this.sendInitialDeviceData(socket, deviceId);
      });

      // Handle multiple devices subscription
      socket.on('subscribe:devices', (deviceIds: string[]) => {
        deviceIds.forEach(deviceId => {
          socket.join(`device:${deviceId}`);
        });
        console.log(`📡 Client ${socket.id} subscribed to devices: ${deviceIds.join(', ')}`);

        // Send initial data for all devices
        this.sendInitialMultiDeviceData(socket, deviceIds);
      });

      // Handle all devices subscription
      socket.on('subscribe:all-devices', () => {
        socket.join('all-devices');
        console.log(`📡 Client ${socket.id} subscribed to all devices`);

        // Send initial data for all devices
        this.sendInitialAllDevicesData(socket);
      });

      // Handle device unsubscription
      socket.on('unsubscribe:device', (deviceId: string) => {
        socket.leave(`device:${deviceId}`);
        console.log(`📡 Client ${socket.id} unsubscribed from device ${deviceId}`);
      });

      // Handle graph data request
      socket.on('request:graph-data', async (data: { deviceId: string, timeRange: string, dataType: string }) => {
        const graphData = await this.getGraphData(data.deviceId, data.timeRange, data.dataType);
        socket.emit('graph-data', { deviceId: data.deviceId, data: graphData });
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        console.log(`📡 Client disconnected: ${socket.id}`);
      });
    });
  }

  // Emit new sensor data to subscribed clients
  public emitSensorData(deviceId: string, sensorData: ISensorData): void {
    const formattedData = {
      deviceId,
      timestamp: sensorData.timestamp,
      temperature: sensorData.temperature,
      humidity: sensorData.humidity,
      pressure: sensorData.pressure,
      dht: sensorData.dht,
      mq: sensorData.mq,
      voltage: sensorData.voltage,
      current: sensorData.current,
      location: sensorData.location,
      metadata: sensorData.metadata
    };

    // Emit to device-specific room
    this.io.to(`device:${deviceId}`).emit('sensor-data', formattedData);

    // Emit to all-devices room
    this.io.to('all-devices').emit('sensor-data', formattedData);

    // Emit graph-specific data
    this.emitGraphData(deviceId, sensorData);
  }

  // Emit device status updates
  public emitDeviceStatus(deviceId: string, status: 'online' | 'offline' | 'error', lastHeartbeat?: Date): void {
    const statusData = {
      deviceId,
      status,
      lastHeartbeat,
      timestamp: new Date()
    };

    this.io.to(`device:${deviceId}`).emit('device-status', statusData);
    this.io.to('all-devices').emit('device-status', statusData);
  }

  // Emit alerts
  public emitAlert(deviceId: string, alert: any): void {
    const alertData = {
      deviceId,
      alert,
      timestamp: new Date()
    };

    this.io.to(`device:${deviceId}`).emit('alert', alertData);
    this.io.to('all-devices').emit('alert', alertData);
  }

  // Emit weather updates
  public emitWeatherUpdate(deviceId: string, weatherData: any): void {
    const weather = {
      deviceId,
      weather: weatherData,
      timestamp: new Date()
    };

    this.io.to(`device:${deviceId}`).emit('weather-update', weather);
    this.io.to('all-devices').emit('weather-update', weather);
  }

  private emitGraphData(deviceId: string, sensorData: ISensorData): void {
    const graphPoint = {
      timestamp: sensorData.timestamp,
      temperature: sensorData.temperature,
      humidity: sensorData.humidity,
      gasLevel: sensorData.mq?.gasLevel || 0,
      pressure: sensorData.pressure,
      voltage: sensorData.voltage,
      current: sensorData.current
    };

    this.io.to(`device:${deviceId}`).emit('graph-point', {
      deviceId,
      data: graphPoint
    });

    this.io.to('all-devices').emit('graph-point', {
      deviceId,
      data: graphPoint
    });
  }

  private async sendInitialDeviceData(socket: any, deviceId: string): Promise<void> {
    try {
      // Get latest sensor data
      const latestData = await SensorData
        .findOne({ deviceId })
        .sort({ timestamp: -1 })
        .limit(1);

      // Get device info
      const device = await Device.findOne({ deviceId });

      if (latestData && device) {
        const initialData = {
          device: {
            deviceId: device.deviceId,
            deviceName: device.deviceName,
            status: device.statusDevice,
            location: device.location
          },
          latestSensorData: {
            timestamp: latestData.timestamp,
            temperature: latestData.temperature,
            humidity: latestData.humidity,
            pressure: latestData.pressure,
            dht: latestData.dht,
            mq: latestData.mq,
            voltage: latestData.voltage,
            current: latestData.current
          }
        };

        socket.emit('initial-data', initialData);
      }
    } catch (error) {
      console.error('Error sending initial device data:', error);
    }
  }

  private async sendInitialMultiDeviceData(socket: any, deviceIds: string[]): Promise<void> {
    try {
      const devices = await Device.find({ deviceId: { $in: deviceIds } });
      const initialData = [];

      for (const device of devices) {
        const latestData = await SensorData
          .findOne({ deviceId: device.deviceId })
          .sort({ timestamp: -1 })
          .limit(1);

        if (latestData) {
          initialData.push({
            device: {
              deviceId: device.deviceId,
              deviceName: device.deviceName,
              status: device.statusDevice,
              location: device.location
            },
            latestSensorData: {
              timestamp: latestData.timestamp,
              temperature: latestData.temperature,
              humidity: latestData.humidity,
              pressure: latestData.pressure,
              dht: latestData.dht,
              mq: latestData.mq,
              voltage: latestData.voltage,
              current: latestData.current
            }
          });
        }
      }

      socket.emit('initial-multi-data', initialData);
    } catch (error) {
      console.error('Error sending initial multi-device data:', error);
    }
  }

  private async sendInitialAllDevicesData(socket: any): Promise<void> {
    try {
      const devices = await Device.find({ isActive: true });
      const initialData = [];

      for (const device of devices) {
        const latestData = await SensorData
          .findOne({ deviceId: device.deviceId })
          .sort({ timestamp: -1 })
          .limit(1);

        if (latestData) {
          initialData.push({
            device: {
              deviceId: device.deviceId,
              deviceName: device.deviceName,
              status: device.statusDevice,
              location: device.location
            },
            latestSensorData: {
              timestamp: latestData.timestamp,
              temperature: latestData.temperature,
              humidity: latestData.humidity,
              pressure: latestData.pressure,
              dht: latestData.dht,
              mq: latestData.mq,
              voltage: latestData.voltage,
              current: latestData.current
            }
          });
        }
      }

      socket.emit('initial-all-data', initialData);
    } catch (error) {
      console.error('Error sending initial all devices data:', error);
    }
  }

  private async getGraphData(deviceId: string, timeRange: string, dataType: string): Promise<any[]> {
    try {
      const now = new Date();
      let startTime: Date;

      // Determine time range
      switch (timeRange) {
        case '1h':
          startTime = new Date(now.getTime() - 60 * 60 * 1000);
          break;
        case '6h':
          startTime = new Date(now.getTime() - 6 * 60 * 60 * 1000);
          break;
        case '24h':
          startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        default:
          startTime = new Date(now.getTime() - 60 * 60 * 1000); // Default 1 hour
      }

      // Build query
      const query: any = {
        deviceId,
        timestamp: { $gte: startTime, $lte: now }
      };

      // Get data based on type
      let data;
      if (dataType === 'all') {
        data = await SensorData
          .find(query)
          .select('timestamp temperature humidity pressure dht mq voltage current')
          .sort({ timestamp: 1 })
          .limit(500); // Limit for performance
      } else {
        const selectFields = `timestamp ${dataType}`;
        data = await SensorData
          .find(query)
          .select(selectFields)
          .sort({ timestamp: 1 })
          .limit(500);
      }

      // Format data for charts
      return data.map(item => ({
        timestamp: item.timestamp,
        temperature: item.temperature,
        humidity: item.humidity,
        pressure: item.pressure,
        gasLevel: item.dht?.gasLevel || item.mq?.gasLevel || 0,
        voltage: item.voltage,
        current: item.current
      }));

    } catch (error) {
      console.error('Error getting graph data:', error);
      return [];
    }
  }

  // Start simulated data stream for testing
  public startSimulatedStream(deviceId: string, interval: number = 5000): void {
    if (this.deviceStreams.has(deviceId)) {
      return; // Already streaming
    }

    const streamInterval = setInterval(async () => {
      try {
        // Generate realistic sensor data
        const simulatedData = {
          deviceId,
          timestamp: new Date(),
          temperature: 20 + Math.random() * 20, // 20-40°C
          humidity: 30 + Math.random() * 50,    // 30-80%
          pressure: 1000 + Math.random() * 50,  // 1000-1050 hPa
          dht: {
            temperature: 20 + Math.random() * 20,
            humidity: 30 + Math.random() * 50
          },
          mq: {
            gasLevel: 100 + Math.random() * 300, // 100-400 ppm
            ppm: (100 + Math.random() * 300) * 0.1
          },
          voltage: 3.0 + Math.random() * 0.5,   // 3.0-3.5V
          current: 0.1 + Math.random() * 0.1,  // 0.1-0.2A
          location: {
            latitude: -6.2088 + (Math.random() - 0.5) * 0.001,
            longitude: 106.8456 + (Math.random() - 0.5) * 0.001
          },
          metadata: {
            batteryLevel: 50 + Math.random() * 50,
            signalStrength: -80 + Math.random() * 30
          }
        } as any;

        // Emit the simulated data
        this.emitSensorData(deviceId, simulatedData);

      } catch (error) {
        console.error('Error in simulated stream:', error);
      }
    }, interval);

    this.deviceStreams.set(deviceId, streamInterval);
    console.log(`📡 Started simulated stream for device ${deviceId}`);
  }

  // Stop simulated data stream
  public stopSimulatedStream(deviceId: string): void {
    const stream = this.deviceStreams.get(deviceId);
    if (stream) {
      clearInterval(stream);
      this.deviceStreams.delete(deviceId);
      console.log(`📡 Stopped simulated stream for device ${deviceId}`);
    }
  }

  // Get connected clients count
  public getConnectedClientsCount(): number {
    return this.io.sockets.sockets.size;
  }

  // Get room information
  public getRoomInfo(): any {
    const rooms = this.io.sockets.adapter.rooms;
    const roomInfo: any = {};

    rooms.forEach((sockets, roomName) => {
      if (!sockets.has(roomName)) { // Exclude individual socket rooms
        roomInfo[roomName] = sockets.size;
      }
    });

    return roomInfo;
  }
}