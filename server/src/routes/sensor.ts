import express from 'express';
import {
  createSensorData,
  getSensorData,
  getLatestSensorData,
  getDevices
} from '../controllers/sensorController';

const router = express.Router();

// POST /api/sensors - Create new sensor data entry
router.post('/', createSensorData);

// GET /api/sensors - Get sensor data with optional filtering
router.get('/', getSensorData);

// GET /api/sensors/devices - Get list of all devices
router.get('/devices', getDevices);

// GET /api/sensors/latest/:deviceId - Get latest data for a specific device
router.get('/latest/:deviceId', getLatestSensorData);

export default router;