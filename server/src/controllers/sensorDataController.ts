import { Request, Response } from 'express';
import SensorData from '../models/SensorData';

// Get sensor data for specific device (24 hours, 30-minute intervals)
export const getSensorData = async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.params;
    const { hours = 24 } = req.query;

    // Get data from last X hours
    const startTime = new Date();
    startTime.setHours(startTime.getHours() - Number(hours));

    const data = await SensorData.find({
      deviceId,
      timestamp: { $gte: startTime }
    })
    .sort({ timestamp: 1 }) // Oldest first
    .lean();

    // Aggregate to 30-minute intervals to reduce data points
    const aggregated = aggregateData(data, 30);

    res.json(aggregated);
  } catch (error) {
    console.error('Error fetching sensor data:', error);
    res.status(500).json({ message: 'Error fetching sensor data', error });
  }
};

// Get latest sensor reading
export const getLatestSensorData = async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.params;

    const latest = await SensorData.findOne({ deviceId })
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
    const { deviceId, temperature, humidity, co, co2, lpg } = req.body;

    const sensorData = new SensorData({
      deviceId,
      timestamp: new Date(),
      temperature,
      humidity,
      co,
      co2,
      lpg
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
    co: 0,
    co2: 0,
    lpg: 0
  };

  bucket.forEach(point => {
    avg.temperature += point.temperature;
    avg.humidity += point.humidity;
    avg.co += point.co;
    avg.co2 += point.co2;
    avg.lpg += point.lpg;
  });

  const count = bucket.length;
  avg.temperature = Math.round(avg.temperature / count * 10) / 10;
  avg.humidity = Math.round(avg.humidity / count * 10) / 10;
  avg.co = Math.round(avg.co / count);
  avg.co2 = Math.round(avg.co2 / count);
  avg.lpg = Math.round(avg.lpg / count);

  return avg;
}