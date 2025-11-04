import { Request, Response } from 'express';
import SensorData, { ISensorData } from '../models/SensorData';

export const createSensorData = async (req: Request, res: Response) => {
  try {
    const sensorData: ISensorData = new SensorData(req.body);
    const savedData = await sensorData.save();
    
    res.status(201).json({
      success: true,
      data: savedData,
      message: 'Sensor data saved successfully'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: 'Error saving sensor data',
      error: error.message
    });
  }
};

export const getSensorData = async (req: Request, res: Response) => {
  try {
    const { deviceId, startDate, endDate, limit = 100, page = 1 } = req.query;
    
    const query: any = {};
    
    if (deviceId) {
      query.deviceId = deviceId;
    }
    
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate as string);
      if (endDate) query.timestamp.$lte = new Date(endDate as string);
    }
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const data = await SensorData
      .find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(Number(limit));
    
    const total = await SensorData.countDocuments(query);
    
    res.json({
      success: true,
      data,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching sensor data',
      error: error.message
    });
  }
};

export const getLatestSensorData = async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.params;
    
    const latestData = await SensorData
      .findOne({ deviceId })
      .sort({ timestamp: -1 });
    
    if (!latestData) {
      return res.status(404).json({
        success: false,
        message: 'No data found for this device'
      });
    }
    
    res.json({
      success: true,
      data: latestData
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching latest sensor data',
      error: error.message
    });
  }
};

export const getDevices = async (req: Request, res: Response) => {
  try {
    const devices = await SensorData.distinct('deviceId');
    
    res.json({
      success: true,
      data: devices,
      count: devices.length
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching devices',
      error: error.message
    });
  }
};