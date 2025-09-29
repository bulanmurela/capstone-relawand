import { Request, Response } from 'express';
import { Device, SensorData, AlertLog } from '../models';
import { RealtimeService } from '../services/realtimeService';

let realtimeService: RealtimeService;

export const setRealtimeService = (service: RealtimeService) => {
  realtimeService = service;
};

export const registerDevice = async (req: Request, res: Response) => {
  try {
    const { deviceId, deviceName, firmwareVersion, userId } = req.body;

    let device = await Device.findOne({ deviceId });

    if (device) {
      device.statusDevice = 'online';
      device.lastHeartbeat = new Date();
      device.firmwareVersion = firmwareVersion || device.firmwareVersion;
      await device.save();

      res.json({
        success: true,
        message: 'Device reconnected successfully',
        data: device
      });
    } else {
      device = await Device.create({
        deviceId,
        deviceName: deviceName || `Device ${deviceId}`,
        deviceType: 'STM32',
        statusDevice: 'online',
        lastHeartbeat: new Date(),
        firmwareVersion,
        userId: userId || '507f1f77bcf86cd799439011',
        isActive: true
      });

      res.status(201).json({
        success: true,
        message: 'Device registered successfully',
        data: device
      });
    }
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: 'Error registering device',
      error: error.message
    });
  }
};

export const sendHeartbeat = async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.params;
    const { batteryLevel, signalStrength, firmwareVersion } = req.body;

    const device = await Device.findOneAndUpdate(
      { deviceId },
      {
        statusDevice: 'online',
        lastHeartbeat: new Date(),
        ...(batteryLevel !== undefined && { batteryLevel }),
        ...(signalStrength !== undefined && { signalStrength }),
        ...(firmwareVersion && { firmwareVersion })
      },
      { new: true }
    );

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found. Please register the device first.'
      });
    }

    // Emit device status update
    if (realtimeService) {
      realtimeService.emitDeviceStatus(deviceId, 'online', new Date());
    }

    res.json({
      success: true,
      message: 'Heartbeat received',
      data: {
        deviceId: device.deviceId,
        status: device.statusDevice,
        lastHeartbeat: device.lastHeartbeat
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error processing heartbeat',
      error: error.message
    });
  }
};

export const sendSensorData = async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.params;
    const sensorData = req.body;

    const device = await Device.findOne({ deviceId });
    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found. Please register the device first.'
      });
    }

    device.statusDevice = 'online';
    device.lastHeartbeat = new Date();
    if (sensorData.batteryLevel !== undefined) {
      device.batteryLevel = sensorData.batteryLevel;
    }
    if (sensorData.signalStrength !== undefined) {
      device.signalStrength = sensorData.signalStrength;
    }
    await device.save();

    const newSensorData = await SensorData.create({
      deviceId,
      ...sensorData,
      userId: device.userId,
      timestamp: new Date()
    });

    // Emit real-time sensor data
    if (realtimeService) {
      realtimeService.emitSensorData(deviceId, newSensorData);
    }

    await checkAlertThresholds(deviceId, sensorData, device.userId);

    res.status(201).json({
      success: true,
      message: 'Sensor data received and stored',
      data: newSensorData
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: 'Error storing sensor data',
      error: error.message
    });
  }
};

export const reportDeviceError = async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.params;
    const { errorCode, errorMessage, severity } = req.body;

    const device = await Device.findOneAndUpdate(
      { deviceId },
      {
        statusDevice: 'error',
        lastHeartbeat: new Date()
      },
      { new: true }
    );

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    await AlertLog.create({
      deviceId,
      alertType: 'Device Error',
      status: severity >= 8 ? 'DARURAT' : 'SIAGA',
      message: `Device error: ${errorMessage || 'Unknown error'}`,
      sensorData: { errorCode, errorMessage },
      alertTime: new Date(),
      severity: severity || 7,
      userId: device.userId
    });

    res.json({
      success: true,
      message: 'Device error reported',
      data: {
        deviceId: device.deviceId,
        status: device.statusDevice,
        errorReported: true
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error reporting device error',
      error: error.message
    });
  }
};

export const getDeviceConfig = async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.params;

    const device = await Device.findOne({ deviceId });
    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    const config = {
      deviceId: device.deviceId,
      deviceName: device.deviceName,
      reportingInterval: 60000,
      heartbeatInterval: 30000,
      thresholds: {
        temperature: {
          warning: 35.0,
          critical: 40.0
        },
        humidity: {
          warning: 35.0,
          critical: 25.0
        },
        mq: {
          warning: 250,
          critical: 300
        }
      },
      serverEndpoints: {
        heartbeat: `/api/hardware/heartbeat/${deviceId}`,
        sensorData: `/api/hardware/sensor-data/${deviceId}`,
        reportError: `/api/hardware/error/${deviceId}`,
        getConfig: `/api/hardware/config/${deviceId}`
      }
    };

    res.json({
      success: true,
      data: config
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching device config',
      error: error.message
    });
  }
};

const checkAlertThresholds = async (deviceId: string, sensorData: any, userId: any) => {
  try {
    const alerts = [];

    if (sensorData.temperature !== undefined) {
      if (sensorData.temperature >= 40.0) {
        alerts.push({
          type: 'Critical Temperature',
          status: 'DARURAT',
          message: `Critical temperature detected: ${sensorData.temperature}°C`,
          severity: 9
        });
      } else if (sensorData.temperature >= 35.0) {
        alerts.push({
          type: 'Temperature Warning',
          status: 'SIAGA',
          message: `High temperature detected: ${sensorData.temperature}°C`,
          severity: 6
        });
      }
    }

    if (sensorData.humidity !== undefined) {
      if (sensorData.humidity <= 25.0) {
        alerts.push({
          type: 'Critical Low Humidity',
          status: 'DARURAT',
          message: `Critical low humidity detected: ${sensorData.humidity}%`,
          severity: 8
        });
      } else if (sensorData.humidity <= 35.0) {
        alerts.push({
          type: 'Low Humidity Warning',
          status: 'SIAGA',
          message: `Low humidity detected: ${sensorData.humidity}%`,
          severity: 5
        });
      }
    }

    if (sensorData.mq && sensorData.mq.gasLevel !== undefined) {
      if (sensorData.mq.gasLevel >= 300) {
        alerts.push({
          type: 'Fire Risk',
          status: 'DARURAT',
          message: `Critical gas level detected: ${sensorData.mq.gasLevel}ppm`,
          severity: 10
        });
      } else if (sensorData.mq.gasLevel >= 250) {
        alerts.push({
          type: 'Gas Detection Warning',
          status: 'SIAGA',
          message: `Elevated gas level detected: ${sensorData.mq.gasLevel}ppm`,
          severity: 7
        });
      }
    }

    for (const alert of alerts) {
      const newAlert = await AlertLog.create({
        deviceId,
        alertType: alert.type,
        status: alert.status,
        message: alert.message,
        sensorData,
        thresholdValues: {
          temperatureThreshold: 35.0,
          humidityThreshold: 35.0,
          mqThreshold: 250
        },
        alertTime: new Date(),
        severity: alert.severity,
        userId
      });

      // Emit real-time alert
      if (realtimeService) {
        realtimeService.emitAlert(deviceId, newAlert);
      }
    }
  } catch (error) {
    console.error('Error checking alert thresholds:', error);
  }
};