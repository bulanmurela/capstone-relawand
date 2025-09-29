import { Request, Response } from 'express';
import { RealtimeService } from '../services/realtimeService';
import SensorData from '../models/Sensor';

let realtimeService: RealtimeService;

export const setRealtimeService = (service: RealtimeService) => {
  realtimeService = service;
};

export const getRealtimeStats = async (req: Request, res: Response) => {
  try {
    if (!realtimeService) {
      return res.status(503).json({
        success: false,
        message: 'Realtime service not initialized'
      });
    }

    const stats = {
      connectedClients: realtimeService.getConnectedClientsCount(),
      activeRooms: realtimeService.getRoomInfo(),
      timestamp: new Date()
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error getting realtime stats',
      error: error.message
    });
  }
};

export const startSimulatedStream = async (req: Request, res: Response) => {
  try {
    const { deviceId, interval = 5000 } = req.body;

    if (!deviceId) {
      return res.status(400).json({
        success: false,
        message: 'Device ID is required'
      });
    }

    if (!realtimeService) {
      return res.status(503).json({
        success: false,
        message: 'Realtime service not initialized'
      });
    }

    realtimeService.startSimulatedStream(deviceId, interval);

    res.json({
      success: true,
      message: `Started simulated stream for device ${deviceId}`,
      deviceId,
      interval
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error starting simulated stream',
      error: error.message
    });
  }
};

export const stopSimulatedStream = async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.params;

    if (!realtimeService) {
      return res.status(503).json({
        success: false,
        message: 'Realtime service not initialized'
      });
    }

    realtimeService.stopSimulatedStream(deviceId);

    res.json({
      success: true,
      message: `Stopped simulated stream for device ${deviceId}`,
      deviceId
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error stopping simulated stream',
      error: error.message
    });
  }
};

export const getGraphData = async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.params;
    const { timeRange = '1h', dataType = 'all', limit = 100 } = req.query;

    const now = new Date();
    let startTime: Date;

    // Determine time range
    switch (timeRange) {
      case '15m':
        startTime = new Date(now.getTime() - 15 * 60 * 1000);
        break;
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
      case '30d':
        startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startTime = new Date(now.getTime() - 60 * 60 * 1000);
    }

    const query: any = {
      deviceId,
      timestamp: { $gte: startTime, $lte: now }
    };

    // Select fields based on data type
    let selectFields = 'timestamp temperature humidity pressure voltage current';
    if (dataType === 'temperature') {
      selectFields = 'timestamp temperature';
    } else if (dataType === 'humidity') {
      selectFields = 'timestamp humidity';
    } else if (dataType === 'gas') {
      selectFields = 'timestamp dht mq';
    } else if (dataType === 'electrical') {
      selectFields = 'timestamp voltage current power';
    }

    const data = await SensorData
      .find(query)
      .select(selectFields)
      .sort({ timestamp: 1 })
      .limit(Number(limit));

    // Format data for charts
    const formattedData = data.map(item => {
      const point: any = {
        timestamp: item.timestamp,
        x: item.timestamp.getTime() // For chart libraries that need numeric x-axis
      };

      if (dataType === 'all' || dataType === 'temperature') {
        point.temperature = item.temperature;
      }
      if (dataType === 'all' || dataType === 'humidity') {
        point.humidity = item.humidity;
      }
      if (dataType === 'all' || dataType === 'gas') {
        point.gasLevel = item.dht?.gasLevel || item.mq?.gasLevel || 0;
        point.gasPpm = item.mq?.ppm || 0;
      }
      if (dataType === 'all' || dataType === 'electrical') {
        point.voltage = item.voltage;
        point.current = item.current;
        point.power = item.power;
      }
      if (dataType === 'all') {
        point.pressure = item.pressure;
      }

      return point;
    });

    res.json({
      success: true,
      data: {
        deviceId,
        timeRange,
        dataType,
        dataPoints: formattedData,
        count: formattedData.length,
        startTime,
        endTime: now
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error getting graph data',
      error: error.message
    });
  }
};

export const getMultiDeviceGraphData = async (req: Request, res: Response) => {
  try {
    const { deviceIds } = req.body;
    const { timeRange = '1h', dataType = 'temperature', limit = 100 } = req.query;

    if (!Array.isArray(deviceIds) || deviceIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Device IDs array is required'
      });
    }

    const now = new Date();
    let startTime: Date;

    switch (timeRange) {
      case '15m':
        startTime = new Date(now.getTime() - 15 * 60 * 1000);
        break;
      case '1h':
        startTime = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '6h':
        startTime = new Date(now.getTime() - 6 * 60 * 60 * 1000);
        break;
      case '24h':
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      default:
        startTime = new Date(now.getTime() - 60 * 60 * 1000);
    }

    const results: any = {};

    // Get data for each device
    for (const deviceId of deviceIds) {
      const query = {
        deviceId,
        timestamp: { $gte: startTime, $lte: now }
      };

      let selectFields = 'timestamp';
      if (dataType === 'temperature') {
        selectFields += ' temperature';
      } else if (dataType === 'humidity') {
        selectFields += ' humidity';
      } else if (dataType === 'gas') {
        selectFields += ' dht mq';
      }

      const data = await SensorData
        .find(query)
        .select(selectFields)
        .sort({ timestamp: 1 })
        .limit(Number(limit));

      results[deviceId] = data.map(item => {
        const point: any = {
          timestamp: item.timestamp,
          x: item.timestamp.getTime()
        };

        if (dataType === 'temperature') {
          point.y = item.temperature;
        } else if (dataType === 'humidity') {
          point.y = item.humidity;
        } else if (dataType === 'gas') {
          point.y = item.dht?.gasLevel || item.mq?.gasLevel || 0;
        }

        return point;
      });
    }

    res.json({
      success: true,
      data: {
        devices: results,
        timeRange,
        dataType,
        startTime,
        endTime: now
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error getting multi-device graph data',
      error: error.message
    });
  }
};

export const getRealtimeSnapshot = async (req: Request, res: Response) => {
  try {
    const { deviceIds } = req.query;

    let deviceIdArray: string[] = [];
    if (deviceIds) {
      if (typeof deviceIds === 'string') {
        deviceIdArray = deviceIds.split(',');
      } else if (Array.isArray(deviceIds)) {
        deviceIdArray = deviceIds as string[];
      }
    }

    // Get latest sensor data for each device
    const pipeline = [
      ...(deviceIdArray.length > 0 ? [{ $match: { deviceId: { $in: deviceIdArray } } }] : []),
      { $sort: { timestamp: 1 as 1 | -1 } },
      {
        $group: {
          _id: '$deviceId',
          latestData: { $first: '$$ROOT' }
        }
      }
    ];

    const latestData = await SensorData.aggregate(pipeline);

    const snapshot = latestData.map(item => ({
      deviceId: item._id,
      timestamp: item.latestData.timestamp,
      temperature: item.latestData.temperature,
      humidity: item.latestData.humidity,
      pressure: item.latestData.pressure,
      gasLevel: item.latestData.dht?.gasLevel || item.latestData.mq?.gasLevel || 0,
      voltage: item.latestData.voltage,
      current: item.latestData.current,
      power: item.latestData.power
    }));

    res.json({
      success: true,
      data: {
        snapshot,
        timestamp: new Date(),
        count: snapshot.length
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error getting realtime snapshot',
      error: error.message
    });
  }
};