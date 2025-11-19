import { Request, Response } from 'express';
import SensorData from '../models/SensorData';
import Device from '../models/Device';
import mongoose from 'mongoose';

// Get sensor data for specific device
export const getSensorData = async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.params;
    const { hours, limit, interval, isDemo } = req.query;

    // Determine if deviceId is MongoDB _id or deviceId string
    let actualDeviceId = deviceId;
    let deviceIsDemo = false;

    // If it looks like a MongoDB ObjectId, fetch the device to get its deviceId field
    if (mongoose.Types.ObjectId.isValid(deviceId) && deviceId.length === 24) {
      const device = await Device.findById(deviceId);
      if (device) {
        actualDeviceId = (device as any).deviceId;
        deviceIsDemo = (device as any).isDemo || false;
      }
    }

    // Build query
    const query: any = { deviceId: actualDeviceId };

    // Only filter by isDemo if explicitly requested OR if device is a demo device
    if (isDemo !== undefined) {
      query.isDemo = isDemo === 'true';
    } else if (deviceIsDemo === true) {
      // Only add isDemo filter if device is explicitly a demo device
      query.isDemo = true;
    }
    // If deviceIsDemo is false or undefined, don't add isDemo filter at all

    let data;

    if (limit) {
      // Return the last N records (most recent data points)
      const limitNum = Number(limit);
      data = await SensorData.find(query)
        .sort({ timestamp: -1 }) // Newest first
        .limit(limitNum)
        .lean();

      // Reverse to show oldest to newest for chart display
      data.reverse();
    } else {
      // Return data from last X hours (default 24)
      const hoursNum = hours ? Number(hours) : 24;
      const startTime = new Date();
      startTime.setHours(startTime.getHours() - hoursNum);

      data = await SensorData.find({
        ...query,
        timestamp: { $gte: startTime }
      })
      .sort({ timestamp: 1 }) // Oldest first
      .lean();

      // Apply aggregation if interval is specified
      if (interval) {
        data = aggregateData(data, Number(interval));
      }
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching sensor data:', error);
    res.status(500).json({ message: 'Error fetching sensor data', error });
  }
};

// Get latest sensor reading
export const getLatestSensorData = async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.params;
    const { isDemo } = req.query;

    // Determine if deviceId is MongoDB _id or deviceId string
    let actualDeviceId = deviceId;
    let deviceIsDemo = false;

    // If it looks like a MongoDB ObjectId, fetch the device to get its deviceId field
    if (mongoose.Types.ObjectId.isValid(deviceId) && deviceId.length === 24) {
      const device = await Device.findById(deviceId);
      if (device) {
        actualDeviceId = (device as any).deviceId;
        deviceIsDemo = (device as any).isDemo || false;
      }
    }

    // Build query
    const query: any = { deviceId: actualDeviceId };

    // Only filter by isDemo if explicitly requested OR if device is a demo device
    if (isDemo !== undefined) {
      query.isDemo = isDemo === 'true';
    } else if (deviceIsDemo === true) {
      // Only add isDemo filter if device is explicitly a demo device
      query.isDemo = true;
    }
    // If deviceIsDemo is false or undefined, don't add isDemo filter at all

    const latest = await SensorData.findOne(query)
      .sort({ timestamp: -1 })
      .lean();

    if (!latest) {
      return res.status(404).json({ message: 'No data found' });
    }

    res.json(latest);
  } catch (error) {
    console.error('Error fetching latest data:', error);
    res.status(500).json({ message: 'Error fetching latest data', error });
  }
};

// Create sensor data (dari hardware atau dummy generator)
export const createSensorData = async (req: Request, res: Response) => {
  try {
    const { deviceId, temperature, humidity, gas_adc, gas_ppm, voltage, alarm } = req.body;

    const sensorData = new SensorData({
      deviceId,
      timestamp: new Date(),
      temperature,
      humidity,
      gas_adc,
      gas_ppm,
      voltage,
      alarm: alarm || false
    });

    await sensorData.save();
    res.status(201).json(sensorData);
  } catch (error) {
    console.error('Error creating sensor data:', error);
    res.status(500).json({ message: 'Error creating sensor data', error });
  }
};

// Helper: Aggregate data to reduce points
function aggregateData(data: any[], intervalMinutes: number) {
  if (data.length === 0) return [];

  const aggregated: any[] = [];
  const intervalMs = intervalMinutes * 60 * 1000;

  let currentBucket: any[] = [];
  let bucketStartTime = new Date(data[0].timestamp).getTime();

  data.forEach(point => {
    const pointTime = new Date(point.timestamp).getTime();

    if (pointTime - bucketStartTime < intervalMs) {
      currentBucket.push(point);
    } else {
      // Average the bucket
      if (currentBucket.length > 0) {
        aggregated.push(averageBucket(currentBucket));
      }

      // Start new bucket
      currentBucket = [point];
      bucketStartTime = pointTime;
    }
  });

  // Don't forget last bucket
  if (currentBucket.length > 0) {
    aggregated.push(averageBucket(currentBucket));
  }

  return aggregated;
}

function averageBucket(bucket: any[]) {
  const avg = {
    timestamp: bucket[Math.floor(bucket.length / 2)].timestamp,
    temperature: 0,
    humidity: 0,
    gas_adc: 0,
    gas_ppm: 0,
    voltage: 0,
    alarm: false
  };

  let alarmCount = 0;
  bucket.forEach(point => {
    avg.temperature += point.temperature || 0;
    avg.humidity += point.humidity || 0;
    avg.gas_adc += point.gas_adc || 0;
    avg.gas_ppm += point.gas_ppm || 0;
    avg.voltage += point.voltage || 0;
    if (point.alarm) alarmCount++;
  });

  const count = bucket.length;
  avg.temperature = Math.round((avg.temperature / count) * 10) / 10;
  avg.humidity = Math.round((avg.humidity / count) * 10) / 10;
  avg.gas_adc = Math.round(avg.gas_adc / count);
  avg.gas_ppm = Math.round(avg.gas_ppm / count);
  avg.voltage = Math.round((avg.voltage / count) * 1000) / 1000;
  avg.alarm = alarmCount > count / 2; // Alarm if more than half of readings had alarm

  return avg;
}