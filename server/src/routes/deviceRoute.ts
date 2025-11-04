import express from 'express';
import {
  createDevice,
  getDevices,
  getDeviceById,
  getDeviceByDeviceId,
  updateDevice,
  updateDeviceStatus,
  deleteDevice,
  getDeviceStatusSummary
} from '../controllers/deviceController';
import { transformDevice, transformDevices } from '../utils/transformers';

const router = express.Router();

// Middleware to transform response for frontend compatibility
const transformDeviceResponse = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const originalJson = res.json.bind(res);
  
  res.json = function(data: any) {
    // If response has 'success' and 'data' properties, transform it
    if (data && data.success && data.data) {
      // For array of devices, return array directly
      if (Array.isArray(data.data)) {
        const transformed = transformDevices(data.data);
        return originalJson(transformed);
      }

      const transformed = transformDevice(data.data);
      return originalJson(transformed)
    }
    
    // Return as-is if not device data
    return originalJson(data);
  };
  
  next();
};

// Apply transform middleware to GET routes only
router.get('/', transformDeviceResponse, getDevices);
router.get('/summary', getDeviceStatusSummary);
router.get('/:id', transformDeviceResponse, getDeviceById);
router.get('/device/:deviceId', transformDeviceResponse, getDeviceByDeviceId);

// POST - Create device with frontend format
router.post('/', async (req, res, next) => {
  try {
    const { name, latitude, longitude, status } = req.body;
    
    // Generate deviceId
    const Device = require('../models/Device').default;
    const deviceCount = await Device.countDocuments();
    const deviceId = `TONGKAT-${String(deviceCount + 1).padStart(3, '0')}`;
    
    // Transform to backend format
    req.body = {
      deviceId,
      deviceName: name,
      deviceType: 'STM32',
      location: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude)
      },
      statusDevice: status || 'offline',
      isActive: true
    };
    
    // Call controller
    await createDevice(req, res);
    
    // Transform response
    const originalJson = res.json.bind(res);
    res.json = function(data: any) {
      if (data && data.success && data.data) {
        const device = data.data;
        const transformed = {
          _id: device._id.toString(),
          name: device.deviceName,
          latitude: device.location?.latitude || 0,
          longitude: device.location?.longitude || 0,
          status: device.statusDevice,
          deviceId: device.deviceId
        };
        return originalJson(transformed);
      }
      return originalJson(data);
    };
    
  } catch (error) {
    next(error);
  }
});

// PUT - Update device
router.put('/:id', async (req, res, next) => {
  try {
    const { name, latitude, longitude, status } = req.body;
    
    // Transform to backend format
    req.body = {
      deviceName: name,
      location: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude)
      },
      statusDevice: status
    };
    
    await updateDevice(req, res);
  } catch (error) {
    next(error);
  }
});

// PATCH - Update device status (for hardware)
router.patch('/status/:deviceId', updateDeviceStatus);

// DELETE - Soft delete device
router.delete('/:id', deleteDevice);

export default router;